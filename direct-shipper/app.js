/* ---------- state ----------
   Fixtures live in data.js. This file is behavior only. */
var S = {plan:'free', tokens:20, packs:0, crm:null, cap:25,
         log:[], unlocked:{}, prospectRun:false, draftCh:'email'};

/* ---------- nav ---------- */
function go(v){
  document.querySelectorAll('.view').forEach(function(e){e.classList.remove('on')});
  document.getElementById('v-'+v).classList.add('on');
  window.scrollTo(0,0);
}
function doSignup(){
  var co=document.getElementById('su-co').value.trim();
  var em=document.getElementById('su-em').value.trim();
  var err=document.getElementById('su-err');
  if(!co||!em){err.classList.add('on');return}
  err.classList.remove('on');
  go('onboard');
}
['su-co','su-em'].forEach(function(id){
  document.getElementById(id).addEventListener('input',function(){
    document.getElementById('su-err').classList.remove('on');
  });
});
function finishOnboard(kind){
  if(kind==='gmail'||kind==='outlook'){
    enterApp('loads');
    flashMsg('Connected. Deep scan running — 6 loads ready, and 9 dormant brokers found in older mail.');
  } else if(kind==='upload'){
    enterApp('loads');
    flashMsg('6 rate cons parsed.');
  } else {
    enterApp('loads');
    flashMsg('Forwarding is live. Rate cons sent to your address will appear here within a minute.');
  }
}
function enterApp(p){go('app');renderAll();tab(p)}
function tab(p){
  document.querySelectorAll('.pane').forEach(function(e){e.classList.remove('on')});
  document.getElementById('p-'+p).classList.add('on');
  document.querySelectorAll('.tab').forEach(function(t){
    t.classList.toggle('on', t.dataset.p===p || (p==='detail'&&t.dataset.p==='facilities'));
  });
  window.scrollTo(0,0);
}
function copyAddr(){
  if(navigator.clipboard) navigator.clipboard.writeText('loads-8f2a41@directshipper.co');
  var h=document.getElementById('fwd-hint');
  if(h) h.textContent='Copied. Now add the Gmail or Outlook filter and you are done.';
}
var flashTimer;
function flashMsg(m){
  var f=document.getElementById('flash');
  f.textContent=m; f.classList.add('on');
  clearTimeout(flashTimer);
  flashTimer=setTimeout(function(){f.classList.remove('on')},5000);
}
function connectMail(){
  flashMsg('Connected. Deep scan started — found 214 loads and 9 dormant brokers so far.');
  tab('loads');
}
function simulate(){
  flashMsg('New rate con from Coast Range Freight parsed. Facility resolved to Del Rio Produce DC.');
  tab('loads');
}

/* ---------- render ---------- */
function planOf(){
  for(var i=0;i<PLANS.length;i++) if(PLANS[i].id===S.plan) return PLANS[i];
  return PLANS[0];
}
function tok(n){ return n+(n===1?' token':' tokens'); }
function total(){ return S.tokens + S.packs; }
/* Spend tokens. Monthly tokens go first, packs only after they run out. */
function spend(n, what){
  if(total() < n){
    flashMsg('That costs '+tok(n)+' and you have '+tok(total())+'. Nothing was charged.');
    tab('billing');
    return false;
  }
  var fromMonthly = Math.min(S.tokens, n);
  S.tokens -= fromMonthly;
  S.packs  -= (n - fromMonthly);
  addLog(what, n);
  return true;
}
function showRes(){
  var r=document.getElementById('res');
  if(!r) return;
  r.classList.add('on');
  setTimeout(function(){r.scrollIntoView({block:'center',behavior:'smooth'})},60);
}
function startPlan(id){
  S.plan=id;
  var pl=planOf();
  S.tokens=pl.start;
  go('signup');
}
function tagFor(s){
  if(s==='ok') return '<span class="tag t-ver">RESOLVED</span>';
  if(s==='flag') return '<span class="tag t-flag">RATE LOW</span>';
  return '<span class="tag t-inf">UNRESOLVED</span>';
}
function renderLoads(){
  document.getElementById('loads-body').innerHTML = LOADS.map(function(l){
    return '<tr onclick="openFac('+l.f+')">'+
      '<td class="lead">'+l.fac+'<div class="cell-sub">'+l.addr+'</div></td>'+
      '<td data-label="Shipper">'+(l.shipper==='Unresolved'?'<span style="color:var(--faint)">Unresolved</span>':l.shipper)+'</td>'+
      '<td data-label="Broker">'+l.broker+'<div class="cell-sub">MC '+l.mc+'</div></td>'+
      '<td data-label="Lane">'+l.lane+'</td>'+
      '<td data-label="Equipment">'+l.eq+'</td>'+
      '<td data-label="Rate" class="num">'+l.rate+'</td>'+
      '<td data-label="Load" class="num">'+l.id+'</td>'+
      '<td data-label="">'+tagFor(l.status)+'</td></tr>';
  }).join('');
}
function renderFacs(){
  document.getElementById('fac-body').innerHTML = FACS.map(function(f,i){
    return '<tr onclick="openFac('+i+')">'+
      '<td class="lead">'+f.name+'<div class="cell-sub">'+f.addr+'</div></td>'+
      '<td data-label="Type">'+f.type+'</td>'+
      '<td data-label="Shipper">'+(f.shipper.indexOf('Unresolved')===0?'<span style="color:var(--faint)">'+f.shipper+'</span>':f.shipper)+'</td>'+
      '<td data-label="Your loads" class="num">'+f.mine+'</td>'+
      '<td data-label="Network loads" class="num">'+f.net+'</td>'+
      '<td data-label="Confidence" class="num">'+f.conf+'%</td></tr>';
  }).join('');
}
function lockBlock(key,idx,title,desc,cost){
  return '<div class="locked"><h4>'+title+'</h4><p>'+desc+'</p>'+
    '<button class="btn" onclick="unlock(\''+key+'\','+idx+','+cost+')">Reveal for '+tok(cost)+'</button>'+
    '<p class="cost" style="margin-top:10px;color:var(--faint);font-size:12px">'+
    tok(total())+' left \u00b7 nothing charged if we come back empty</p></div>';
}
function openFac(i){
  var f=FACS[i], u=S.unlocked[i]||{};
  var h='<div class="pane-h"><div><h2>'+f.name+'</h2><p>'+f.addr+'</p></div>'+
    '<span class="tag '+(f.conf>80?'t-ver':'t-inf')+'">'+f.conf+'% CONFIDENCE</span></div>';

  h+='<div class="panel"><h3>Your own freight, free <span class="tag t-free" style="margin-left:6px">NO TOKENS</span></h3><dl>'+
    '<div class="row"><dt>Facility type</dt><dd>'+f.type+'</dd></div>'+
    '<div class="row"><dt>Shipper</dt><dd>'+f.shipper+'</dd></div>'+
    '<div class="row"><dt>Your loads through here</dt><dd>'+f.mine+'</dd></div>'+
    '<div class="row"><dt>Network observations</dt><dd>'+f.net+'</dd></div>'+
    '<div class="row"><dt>Equipment mix</dt><dd>'+f.eq+'</dd></div>'+
    '<div class="row"><dt>Commodity</dt><dd>'+f.comm+'</dd></div></dl></div>';

  h+='<div class="grid2"><div class="panel"><h3>Observed lanes '+
     '<span class="tag t-free" style="margin-left:6px">FREE</span></h3>';
  if(f.conf<50){
    h+='<p class="ph" style="margin:0">Not enough unrelated carriers have moved freight through this dock to publish lanes. You see nothing rather than a guess.</p>';
  } else {
    h+='<div class="bars">'+f.lanes.map(function(l){
      var cls=l[2]==='VERIFIED'?'t-ver':(l[2]==='OBSERVED'?'t-obs':'t-inf');
      return '<div class="bar"><span class="lbl">'+l[0]+'</span>'+
        '<span class="track"><span class="fill" style="width:'+(l[1]*3.4)+'%"></span></span>'+
        '<span class="v">'+l[1]+'%</span>'+
        '<span class="tag '+cls+'" style="margin-left:8px">'+l[2]+' n='+l[3]+'</span></div>';
    }).join('')+'</div>';
  }
  h+='</div><div class="panel"><h3>Volume '+
     '<span class="tag t-free" style="margin-left:6px">FREE</span></h3>';
  if(f.conf<50){
    h+='<p class="ph" style="margin:0">'+f.vol+'</p>';
  } else {
    h+='<dl><div class="row"><dt>Loads per month</dt><dd>'+f.vol+'</dd></div>'+
      '<div class="row"><dt>Seasonality</dt><dd>'+f.season+'</dd></div></dl>';
  }
  h+='</div></div>';

  h+='<div class="panel" style="margin-top:20px"><h3>Who to call</h3>';
  if(!f.contact){
    h+='<p class="ph" style="margin:0">The shipper behind this dock is not resolved, so there is no contact to look up. Nothing to charge for.</p>';
  } else {
    h+='<p class="ph">One token per field. We stop at the first verified result and charge nothing for a miss.</p><dl>'+
      CONTACT_FIELDS.map(function(cf){
        var got=u[cf.k];
        var val= got
          ? f.contact[cf.k]
          : '<button class="btn-ghost" style="padding:4px 10px;font-size:13px" '+
            'onclick="unlock(\''+cf.k+'\','+i+',1)">Reveal \u00b7 1 token</button>';
        return '<div class="row"><dt>'+cf.label+'</dt><dd>'+val+'</dd></div>';
      }).join('')+'</dl>'+
      '<p class="hint">All four is 4 tokens. '+tok(total())+' left.</p>';
  }
  h+='</div>';

  document.getElementById('detail-body').innerHTML=h;
  window.curFac=i;
  tab('detail');
}
function unlock(key,i,cost){
  var labels={};
  CONTACT_FIELDS.forEach(function(cf){labels[cf.k]=cf.label});
  if(!spend(cost, (labels[key]||key)+' \u2014 '+FACS[i].name)) return;
  if(!S.unlocked[i]) S.unlocked[i]={};
  S.unlocked[i][key]=true;
  renderAll();
  openFac(i);
}
function addLog(what,cost){
  S.log.unshift({t:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
                 w:what, c:cost, b:total()});
}
function renderLog(){
  var b=document.getElementById('log-body');
  if(!b) return;
  if(!S.log.length){
    b.innerHTML='<tr style="cursor:default"><td colspan="4" style="color:var(--faint)">No tokens spent yet.</td></tr>';
    return;
  }
  b.innerHTML=S.log.map(function(e){
    return '<tr style="cursor:default"><td class="log" data-label="When">'+e.t+'</td>'+
      '<td data-label="What">'+e.w+'</td>'+
      '<td style="text-align:right" class="num" data-label="Cost">'+(e.c===0?'\u2014':'\u2212'+e.c)+'</td>'+
      '<td style="text-align:right" class="num" data-label="Left">'+e.b+'</td></tr>';
  }).join('');
}
function renderBilling(){
  var pl=planOf();
  var st=document.getElementById('tok-status');
  if(st){
    st.innerHTML='<h3>'+tok(total())+' available</h3>'+
      '<p class="ph">On '+pl.name+(pl.price?' \u00b7 $'+pl.price+' a month':' \u00b7 free forever')+'</p><dl>'+
      '<div class="row"><dt>Monthly tokens left</dt><dd>'+S.tokens+'</dd></div>'+
      '<div class="row"><dt>Extra tokens (never expire)</dt><dd>'+S.packs+'</dd></div>'+
      '<div class="row"><dt>Renews with</dt><dd>'+pl.monthly+' a month</dd></div>'+
      '<div class="row"><dt>Rollover</dt><dd>Monthly tokens roll over 12 months</dd></div></dl>';
  }
  var pc=document.getElementById('plan-list');
  if(pc){
    pc.innerHTML=PLANS.map(function(x){
      var cur=x.id===S.plan;
      var perks=x.perks.map(function(t){return '<li>'+t+'</li>'}).join('')+
                x.off.map(function(t){return '<li class="off">'+t+'</li>'}).join('');
      var btn=cur
        ? '<button class="btn-ghost" disabled style="opacity:.6">Current plan</button>'
        : '<button class="btn'+(x.rec?'':'-ghost')+'" onclick="switchPlan(\''+x.id+'\')">'+
          (x.price>(planOf().price)?'Upgrade':'Switch')+'</button>';
      return '<div class="plan'+(cur?' rec':'')+'">'+
        (cur?'<div class="rectag">CURRENT</div>':'')+
        '<div class="nm">'+x.name+'</div>'+
        '<div class="pr">$'+x.price+(x.price?'<i>/mo</i>':'')+'</div>'+
        '<div class="who">'+x.who+'</div>'+
        '<div class="cta">'+btn+'</div>'+
        '<ul><li><b>'+x.monthly+' tokens</b> a month</li>'+perks+
        (x.extra?'<li>Extra tokens <b>'+Math.round(x.extra*100)+'\u00a2</b> each</li>':'')+
        '</ul></div>';
    }).join('');
  }
  var pk=document.getElementById('pack-box');
  if(pk){
    if(!pl.extra){
      pk.innerHTML='<p class="ph" style="margin:0">The Free plan does not sell extra tokens. '+
        'Everything free stays free when you run out \u2014 your profile, receivers, dormant brokers '+
        'and outreach keep working. Move to Carrier to buy more.</p>';
    } else {
      pk.innerHTML='<p class="ph">'+Math.round(pl.extra*100)+'\u00a2 a token on '+pl.name+
        '. They never expire and are only used after your monthly tokens run out.</p>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
        [25,50,100].map(function(n){
          return '<button class="btn-ghost" onclick="buyPack('+n+')">'+n+' for $'+
            (n*pl.extra).toFixed(2)+'</button>';
        }).join('')+'</div>'+
        '<p class="hint" id="pack-note">Every search shows its cost before it runs.</p>';
    }
  }
  var rl=document.getElementById('rate-list');
  if(rl) rl.innerHTML=TOKEN_ITEMS.map(function(t){
    return '<tr><td>'+t.what+'</td><td><b>'+(t.cost?tok(t.cost):'0 tokens')+'</b></td></tr>';
  }).join('');
  var fl=document.getElementById('free-list');
  if(fl) fl.innerHTML=FREE_ITEMS.map(function(t){
    return '<tr><td>'+t+'</td><td><span class="pill">FREE</span></td></tr>';
  }).join('');
}
function switchPlan(id){
  var was=planOf(), now=null;
  for(var i=0;i<PLANS.length;i++) if(PLANS[i].id===id) now=PLANS[i];
  S.plan=id;
  if(now.monthly>was.monthly) S.tokens += (now.monthly-was.monthly);
  renderAll();
  flashMsg('Now on '+now.name+(now.price?' \u2014 $'+now.price+' a month, '+now.monthly+' tokens.':' \u2014 '+now.monthly+' tokens a month.'));
}
function buyPack(n){
  var pl=planOf();
  if(!pl.extra){ flashMsg('Move to Carrier or Fleet to buy extra tokens.'); return; }
  S.packs += n;
  addLog('Bought '+n+' extra tokens \u2014 $'+(n*pl.extra).toFixed(2), 0);
  S.log[0].b=total();
  renderAll();
  var note=document.getElementById('pack-note');
  var spentPerMonth=n*pl.extra;
  var next=null;
  for(var i=0;i<PLANS.length;i++) if(PLANS[i].price>pl.price && (!next||PLANS[i].price<next.price)) next=PLANS[i];
  var nudge = (next && pl.price+spentPerMonth > next.price)
    ? ' At this rate '+next.name+' at $'+next.price+' would cost you less than topping up.'
    : '';
  if(note) note.textContent='Added '+n+' tokens. Charged $'+(n*pl.extra).toFixed(2)+'.'+nudge;
}
function setCap(v){
  var n=parseInt(String(v).replace(/[^0-9]/g,''),10);
  S.cap = isNaN(n)?0:n;
  var h=document.getElementById('cap-note');
  if(h) h.textContent = S.cap
    ? 'Direct Shipper stops spending after '+tok(S.cap)+' in a day and tells you.'
    : 'No cap set. Every search still shows its cost before it runs.';
}
function estimate(){
  document.getElementById('pr-est').textContent=
    PROSPECTS.length+' lookalikes match your profile. One token each = '+tok(PROSPECTS.length)+
    '. Nothing charged yet.';
  document.getElementById('pr-err').classList.remove('on');
}
function runSearch(){
  var cost=PROSPECTS.length;
  if(total()<cost){
    document.getElementById('pr-err').textContent=
      'That is '+tok(cost)+' and you have '+tok(total())+'. Nothing was charged.';
    document.getElementById('pr-err').classList.add('on');
    return;
  }
  document.getElementById('pr-err').classList.remove('on');
  if(!spend(cost, PROSPECTS.length+' lookalike shippers \u2014 Ontario reefer to Phoenix')) return;
  document.getElementById('pr-results').innerHTML=
    '<div class="pane-h" style="margin-top:24px"><div><h2 style="font-size:18px">'+PROSPECTS.length+' lookalikes</h2>'+
    '<p>'+tok(cost)+' spent, one per shipper. 4 excluded as existing broker relationships. Confidence label on every row.</p></div>'+
    '<div><button class="btn-ghost" onclick="pushCrm('+PROSPECTS.length+',\'lookalikes\')">Push to CRM</button></div></div>'+
    '<table><thead><tr><th>Shipper</th><th>Facility city</th><th>Observed loads</th><th>Match</th><th></th></tr></thead><tbody>'+
    PROSPECTS.map(function(p){
      var cls=p[3]==='VERIFIED'?'t-ver':(p[3]==='OBSERVED'?'t-obs':'t-inf');
      return '<tr style="cursor:default"><td class="lead">'+p[0]+'<div class="cell-sub">'+p[1]+'</div></td>'+
        '<td data-label="Facility city" class="hide-sm">'+p[1]+'</td>'+
        '<td data-label="Observed loads" class="num">'+p[2]+'</td>'+
        '<td data-label="Match"><span class="tag '+cls+'">'+p[3]+'</span></td>'+
        '<td data-label="" style="text-align:right"><button class="btn-ghost" style="padding:5px 10px;font-size:13px" '+
        'onclick="buyContact(\''+p[0].replace(/'/g,"")+'\')">Get contact \u00b7 4 tokens</button></td></tr>';
    }).join('')+'</tbody></table>';
  renderAll();
}
function buyContact(who){
  if(!spend(4, 'Contact \u2014 '+who)) return;
  renderAll();
  flashMsg('Name, LinkedIn, email and phone found for '+who+'. 4 tokens spent.');
}
function stTag(st){
  if(st==='clear') return '<span class="tag t-ver">TERM ELAPSED</span>';
  if(st==='running') return '<span class="tag t-obs">CLOCK RUNNING</span>';
  if(st==='hold') return '<span class="tag t-flag">CURRENT BROKER</span>';
  return '<span class="tag t-inf">TERM UNKNOWN</span>';
}
function renderReact(){
  var b=document.getElementById('react-body');
  if(!b) return;
  b.innerHTML = DORMANT.map(function(d,i){
    var act = d.st==='clear'
      ? '<button class="btn-ghost" style="padding:5px 10px;font-size:13px" onclick="showShippers('+i+')">See '+d.ship+' shippers \u00b7 '+tok(d.ship)+'</button>'
      : '<span class="hint" style="margin:0">&mdash;</span>';
    return '<tr style="cursor:default">'+
      '<td class="lead">'+d.b+'<div class="cell-sub">'+d.note+'</div></td>'+
      '<td data-label="Last load" class="num">'+d.last+'</td>'+
      '<td data-label="Authority">'+d.auth+'</td>'+
      '<td data-label="Your term">'+d.term+'</td>'+
      '<td data-label="Shippers" class="num">'+d.ship+'</td>'+
      '<td data-label="Status">'+stTag(d.st)+'</td>'+
      '<td data-label="" style="text-align:right">'+act+'</td></tr>';
  }).join('');
}
function showShippers(i){
  var d=DORMANT[i];
  if(!spend(d.ship, d.ship+' shippers behind '+d.b)) return;
  renderAll();
  flashMsg(d.ship+' shippers from '+d.b+' revealed for '+tok(d.ship)+'. Read the clause on file before you reach out.');
}

function recvTag(st){
  if(st==='clear') return '<span class="tag t-ver">NO BROKER HOLD</span>';
  if(st==='thin') return '<span class="tag t-obs">THIN VOLUME</span>';
  return '<span class="tag t-inf">INBOUND ONLY</span>';
}
function renderRecv(){
  var b=document.getElementById('recv-body');
  if(!b) return;
  b.innerHTML = RECEIVERS.map(function(r,i){
    var act = r.contact
      ? '<button class="btn-ghost" style="padding:5px 10px;font-size:13px" onclick="getRecv('+i+')">Get contact \u00b7 4 tokens</button>'
      : '<span class="hint" style="margin:0">&mdash;</span>';
    return '<tr style="cursor:default">'+
      '<td class="lead">'+r.n+'<div class="cell-sub">'+r.c+' &middot; '+r.note+'</div></td>'+
      '<td data-label="Your deliveries" class="num">'+r.mine+'</td>'+
      '<td data-label="Ships outbound">'+r.out+'</td>'+
      '<td data-label="Their lanes">'+r.lanes+'</td>'+
      '<td data-label="Equip">'+r.eq+'</td>'+
      '<td data-label="Standing">'+recvTag(r.st)+'</td>'+
      '<td data-label="" style="text-align:right">'+act+'</td></tr>';
  }).join('');
}
function getRecv(i){
  var r=RECEIVERS[i];
  if(!r.contact){ flashMsg('No contact on file for this dock, so there is nothing to charge for.'); return; }
  if(!spend(4, 'Contact \u2014 '+r.n)) return;
  renderAll();
  flashMsg(r.contact.name+' \u00b7 '+r.contact.email+' \u00b7 '+r.contact.phone+
           ' \u2014 4 tokens. You deliver here '+r.mine+' times already.');
}

function crmConnect(which){
  S.crm = which;
  var m=document.getElementById('crm-map');
  if(m) m.style.display='block';
  flashMsg(which+' connected. 14 receivers and 9 dormant shippers queued to sync.');
}
function pushCrm(n,what){
  if(!S.crm){
    flashMsg('Connect HubSpot or Salesforce first.');
    tab('sources'); return;
  }
  flashMsg(n+' '+what+' pushed to '+S.crm+' with their freight profiles attached.');
}

/* ---------- outreach ----------
   Everything below reads CHANNELS / SEQUENCE / DRAFTS / OUTREACH.
   Nothing here names a channel. */
function chan(id){
  for(var i=0;i<CHANNELS.length;i++) if(CHANNELS[i].id===id) return CHANNELS[i];
  return null;
}
function esc(t){
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function connectChan(id){
  var c=chan(id);
  if(!c) return;
  c.connected=true;
  renderOutreach();
  flashMsg(c.label+' connected. Touches on that channel go out as '+c.from+'.');
}
function renderChans(){
  var b=document.getElementById('chan-list');
  if(!b) return;
  b.innerHTML = CHANNELS.map(function(c){
    var act = c.connected
      ? '<span class="tag t-ver">CONNECTED</span>'
      : '<button class="btn-ghost" style="padding:5px 10px;font-size:13px" onclick="connectChan(\''+c.id+'\')">Connect</button>';
    var lim = c.limit ? '<div class="cell-sub">'+c.limit+' character limit</div>' : '';
    return '<div class="chan">'+
      '<div class="chan-h"><b>'+c.label+'</b>'+act+'</div>'+
      '<div class="chan-from">'+c.from+'</div>'+
      '<p class="ph" style="margin:8px 0 0">'+c.note+'</p>'+lim+'</div>';
  }).join('');
}
function renderSeq(){
  var b=document.getElementById('seq-list');
  if(!b) return;
  b.innerHTML = SEQUENCE.map(function(s){
    var c=chan(s.ch);
    var when = s.day===0 ? 'Day 0' : 'Day '+s.day;
    var warn = c.connected ? '' :
      ' <span class="tag t-flag">'+c.label.toUpperCase()+' NOT CONNECTED</span>';
    return '<li class="seq-step">'+
      '<div class="seq-when">'+when+'</div>'+
      '<div class="seq-body"><b>'+s.name+'</b> <span class="seq-ch">'+c.label+'</span>'+warn+
      '<p class="ph" style="margin:4px 0 0">'+s.why+'</p></div></li>';
  }).join('');
}
function setDraftCh(id){ S.draftCh=id; renderDraft(); }
function renderDraft(){
  var tabs=document.getElementById('draft-tabs');
  var box=document.getElementById('draft-box');
  var hint=document.getElementById('draft-hint');
  if(!tabs||!box) return;
  var used={};
  SEQUENCE.forEach(function(s){used[s.ch]=true});
  var ids=CHANNELS.filter(function(c){return used[c.id]}).map(function(c){return c.id});
  if(ids.indexOf(S.draftCh)<0) S.draftCh=ids[0];

  tabs.innerHTML = ids.map(function(id){
    var c=chan(id);
    return '<button class="chan-tab'+(id===S.draftCh?' on':'')+'" onclick="setDraftCh(\''+id+'\')">'+
      c.label+'</button>';
  }).join('');

  var c=chan(S.draftCh), d=DRAFTS[S.draftCh];
  if(!d){ box.innerHTML='<p class="hint">No draft written for '+c.label+' yet.</p>'; return; }
  var head = c.subject && d.subject
    ? '<div class="draft-sub">Subject: '+esc(d.subject)+'</div>'
    : '<div class="draft-sub">'+esc(c.from)+' — '+c.label+'</div>';
  box.innerHTML = '<div class="draft">'+head+esc(d.body).replace(/\n/g,'<br>')+'</div>';

  if(hint){
    var over = c.limit && d.body.length > c.limit;
    var count = c.limit ? d.body.length+' of '+c.limit+' characters. ' : '';
    hint.innerHTML = (over?'<span style="color:var(--red)">'+count+'Too long — trim before sending.</span> ':count)+
      'Every later touch stops the moment they reply.';
  }
}
function qTag(st){
  if(st==='ready')     return '<span class="tag t-ver">DRAFT READY</span>';
  if(st==='sent')      return '<span class="tag t-obs">SENT · 3d ago</span>';
  if(st==='blocked')   return '<span class="tag t-flag">CHANNEL NOT CONNECTED</span>';
  return '<span class="tag t-inf">NEEDS CONTACT</span>';
}
function renderQueue(){
  var b=document.getElementById('queue-body');
  if(!b) return;
  b.innerHTML = OUTREACH.map(function(o){
    var c=chan(o.ch);
    var st = (o.st==='ready' && !c.connected) ? 'blocked' : o.st;
    return '<tr style="cursor:default">'+
      '<td class="lead">'+o.n+'<div class="cell-sub">'+o.who+'</div></td>'+
      '<td data-label="Why">'+o.why+'</td>'+
      '<td data-label="Next touch">'+o.step+'<div class="cell-sub">'+c.label+'</div></td>'+
      '<td data-label="Status">'+qTag(st)+'</td></tr>';
  }).join('');
}
function renderOutreach(){
  var pl=planOf();
  var g=document.getElementById('outreach-gate');
  if(g) g.innerHTML = pl.outreach ? '' :
    '<div class="cbox warn" style="margin-bottom:18px"><h4>Sending needs Carrier or Fleet</h4>'+
    '<p style="margin:0">Drafting and reading are free \u2014 look at everything below. Sends are '+
    'unlimited on both paid plans, with no per-seat and no per-mailbox fee.</p></div>';
  var sub=document.getElementById('seq-sub');
  if(sub){
    var n=SEQUENCE.length, days=SEQUENCE[n-1].day;
    var chs={}; SEQUENCE.forEach(function(x){chs[x.ch]=1});
    var names=Object.keys(chs).map(function(id){return chan(id).label});
    sub.textContent=n+' touches over '+days+' days across '+names.join(', ')+
      '. Sends never cost a token, and everything stops the moment they reply.';
  }
  renderChans(); renderSeq(); renderDraft(); renderQueue();
}
function approveSend(){
  if(!planOf().outreach){
    flashMsg('Sending is on Carrier and Fleet. Drafting stays free.');
    tab('billing'); return;
  }
  flashMsg('Approved and sent. The other '+(SEQUENCE.length-1)+' touches are scheduled through day '+
           SEQUENCE[SEQUENCE.length-1].day+'. No tokens charged \u2014 sends are free.');
}
function renderSources(){
  var g=document.getElementById('src-grid');
  if(g) g.innerHTML=SOURCES.map(function(x){
    return '<div class="src"><div class="big">'+x.big+'</div><h4>'+x.h+'</h4><p>'+x.p+'</p></div>';
  }).join('');
  var w=document.getElementById('waterfalls');
  if(w) w.innerHTML=WATERFALLS.map(function(x){
    return '<div class="fallcard"><h4>'+x.h+' <span>'+x.sub+'</span></h4><ol>'+
      x.list.map(function(n){return '<li>'+n+'</li>'}).join('')+
      '</ol><p class="fallnote">'+x.note+'</p></div>';
  }).join('');
}

function renderAll(){
  var b=document.getElementById('bal');
  if(b) b.textContent=total();
  var pn=document.getElementById('plan-name');
  if(pn) pn.textContent=planOf().name;
  renderLoads(); renderFacs(); renderBilling(); renderLog();
  renderReact(); renderRecv(); renderOutreach(); renderSources();
}
