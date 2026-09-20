/* ---------- state ----------
   Fixtures live in data.js. This file is behavior only. */
var S = {balance:0, crm:null, reload:false, tier:1, log:[], unlocked:{}, prospectRun:false, draftCh:'email'};

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
function money(n){return '$'+n.toFixed(2)}
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
    '<button class="btn" onclick="unlock(\''+key+'\','+idx+','+cost+')">Unlock for '+money(cost)+'</button>'+
    '<p class="cost" style="margin-top:10px;color:var(--faint);font-size:12px">Balance '+money(S.balance)+'</p></div>';
}
function openFac(i){
  var f=FACS[i], u=S.unlocked[i]||{};
  var h='<div class="pane-h"><div><h2>'+f.name+'</h2><p>'+f.addr+'</p></div>'+
    '<span class="tag '+(f.conf>80?'t-ver':'t-inf')+'">'+f.conf+'% CONFIDENCE</span></div>';

  h+='<div class="panel"><h3>What Direct Shipper knows for free</h3><dl>'+
    '<div class="row"><dt>Facility type</dt><dd>'+f.type+'</dd></div>'+
    '<div class="row"><dt>Shipper</dt><dd>'+f.shipper+'</dd></div>'+
    '<div class="row"><dt>Your loads through here</dt><dd>'+f.mine+'</dd></div>'+
    '<div class="row"><dt>Network observations</dt><dd>'+f.net+'</dd></div>'+
    '<div class="row"><dt>Equipment mix</dt><dd>'+f.eq+'</dd></div>'+
    '<div class="row"><dt>Commodity</dt><dd>'+f.comm+'</dd></div></dl></div>';

  h+='<div class="grid2"><div class="panel"><h3>Observed lanes</h3>';
  if(f.conf<50){
    h+='<p class="ph" style="margin:0">Not enough independent carriers have moved freight through this dock to publish lanes. Direct Shipper will not guess.</p>';
  } else if(u.lanes){
    h+='<div class="bars">'+f.lanes.map(function(l){
      var cls=l[2]==='VERIFIED'?'t-ver':(l[2]==='OBSERVED'?'t-obs':'t-inf');
      return '<div class="bar"><span class="lbl">'+l[0]+'</span>'+
        '<span class="track"><span class="fill" style="width:'+(l[1]*3.4)+'%"></span></span>'+
        '<span class="v">'+l[1]+'%</span>'+
        '<span class="tag '+cls+'" style="margin-left:8px">'+l[2]+' n='+l[3]+'</span></div>';
    }).join('')+'</div>';
  } else {
    h+=lockBlock('lanes',i,'Observed lanes','Where freight from this dock actually goes, with how many loads each figure rests on.',1.50);
  }
  h+='</div><div class="panel"><h3>Volume</h3>';
  if(f.conf<50){
    h+='<p class="ph" style="margin:0">'+f.vol+'</p>';
  } else if(u.vol){
    h+='<dl><div class="row"><dt>Loads per month</dt><dd>'+f.vol+'</dd></div>'+
      '<div class="row"><dt>Seasonality</dt><dd>'+f.season+'</dd></div></dl>';
  } else {
    h+=lockBlock('vol',i,'Monthly volume','How much moves through here each month and when it peaks.',1.00);
  }
  h+='</div></div>';

  h+='<div class="grid2" style="margin-top:20px"><div class="panel"><h3>Who to call</h3>';
  if(!f.contact){
    h+='<p class="ph" style="margin:0">No contact available — the shipper behind this dock is not resolved.</p>';
  } else if(u.contact){
    h+='<p style="font-size:14.5px">'+f.contact+'</p><p class="hint">Verified via Findymail 4 days ago \u00b7 charged at provider cost, $0.00 if it bounces.</p>';
  } else {
    h+=lockBlock('contact',i,'Verified contact','The person who runs transportation. Run through 5 email and 9 phone providers, charged at cost, free if none of them has it.',2.50);
  }
  h+='</div><div class="panel"><h3>What the shipper paid</h3>';
  if(!f.paid){
    h+='<p class="ph" style="margin:0">No records yet for this facility.</p>';
  } else if(u.paid){
    h+='<p style="font-size:14.5px">'+f.paid+'</p><p class="hint">From broker transaction records carriers requested under 49 CFR 371.3, aggregated. No individual record shown.</p>';
  } else {
    h+=lockBlock('paid',i,'What the shipper paid','The shipper side of the rate, not just what carriers got, aggregated across the network.',2.00);
  }
  h+='</div></div>';

  document.getElementById('detail-body').innerHTML=h;
  window.curFac=i;
  tab('detail');
}
function unlock(key,i,cost){
  if(S.balance < cost){
    flashMsg('Not enough balance — add funds to unlock this.');
    tab('billing'); return;
  }
  S.balance -= cost;
  if(!S.unlocked[i]) S.unlocked[i]={};
  S.unlocked[i][key]=true;
  var names={lanes:'Observed lanes',vol:'Monthly volume',contact:'Verified contact',paid:'Shipper-paid rate'};
  addLog(names[key]+' — '+FACS[i].name, cost);
  renderAll();
  openFac(i);
}
function addLog(what,cost){
  S.log.unshift({t:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), w:what, c:cost, b:S.balance});
}
function renderLog(){
  var b=document.getElementById('log-body');
  if(!S.log.length){b.innerHTML='<tr style="cursor:default"><td colspan="4" style="color:var(--faint)">Nothing charged yet.</td></tr>';return}
  b.innerHTML=S.log.map(function(e){
    return '<tr style="cursor:default"><td class="log" data-label="When">'+e.t+'</td>'+
      '<td data-label="What">'+e.w+'</td>'+
      '<td style="text-align:right" class="num" data-label="Charge">'+(e.c===0?'$0.00':'−'+money(e.c))+'</td>'+
      '<td style="text-align:right" class="num" data-label="Balance after">'+money(e.b)+'</td></tr>';
  }).join('');
}
function renderTiers(){
  document.getElementById('tiers').innerHTML=TIERS.map(function(t,i){
    var credit=t.amt*(1+t.bonus);
    return '<button class="tier'+(S.tier===i?' sel':'')+'" onclick="S.tier='+i+';renderTiers()">'+
      '<div class="amt">$'+t.amt.toLocaleString()+'</div>'+
      (t.bonus? '<div class="bonus">+'+(t.bonus*100)+'% — $'+credit.toLocaleString()+' credit</div>':'<div class="bonus" style="color:var(--faint)">$'+credit.toLocaleString()+' credit</div>')+
      '<div class="desc">'+Math.floor(credit/1.5)+' lane records, or '+Math.floor(credit/5)+' full facility records</div></button>';
  }).join('');
}
function deposit(){
  var t=TIERS[S.tier];
  var credit=t.amt*(1+t.bonus);
  S.balance += credit;
  addLog('Deposit $'+t.amt.toLocaleString()+(t.bonus?' (+'+(t.bonus*100)+'% bonus)':''),0);
  S.log[0].b=S.balance;
  document.getElementById('dep-note').textContent='Added '+money(credit)+'. Charged $'+t.amt.toLocaleString()+' to your card.';
  renderAll();
}
function toggleReload(){
  S.reload=!S.reload;
  document.getElementById('sw-reload').classList.toggle('on',S.reload);
}
function estimate(){
  document.getElementById('pr-est').textContent='8 lookalikes match your profile. $0.50 each = $4.00. Nothing charged yet.';
  document.getElementById('pr-err').classList.remove('on');
}
function runSearch(){
  var cost=PROSPECTS.length*0.5;
  if(S.balance<cost){
    document.getElementById('pr-err').classList.add('on');
    return;
  }
  document.getElementById('pr-err').classList.remove('on');
  S.balance-=cost;
  addLog(PROSPECTS.length+' prospecting results — Ontario reefer to Phoenix', cost);
  document.getElementById('pr-results').innerHTML=
    '<div class="pane-h" style="margin-top:24px"><div><h2 style="font-size:18px">'+PROSPECTS.length+' lookalikes</h2>'+
    '<p>Charged '+money(cost)+'. 4 excluded as existing broker relationships. Confidence label on every row.</p></div>'+
    '<div><button class="btn-ghost" onclick="pushCrm('+PROSPECTS.length+',\'lookalikes\')">Push to CRM</button></div></div>'+
    '<table><thead><tr><th>Shipper</th><th>Facility city</th><th>Observed loads</th><th>Match</th><th></th></tr></thead><tbody>'+
    PROSPECTS.map(function(p){
      var cls=p[3]==='VERIFIED'?'t-ver':(p[3]==='OBSERVED'?'t-obs':'t-inf');
      return '<tr style="cursor:default"><td class="lead">'+p[0]+'<div class="cell-sub">'+p[1]+'</div></td>'+
        '<td data-label="Facility city" class="hide-sm">'+p[1]+'</td>'+
        '<td data-label="Observed loads" class="num">'+p[2]+'</td>'+
        '<td data-label="Match"><span class="tag '+cls+'">'+p[3]+'</span></td>'+
        '<td data-label="" style="text-align:right"><button class="btn-ghost" style="padding:5px 10px;font-size:13px" onclick="flashMsg(\'Contact unlocked for $2.50.\')">Get contact</button></td></tr>';
    }).join('')+'</tbody></table>';
  renderAll();
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
      ? '<button class="btn-ghost" style="padding:5px 10px;font-size:13px" onclick="showShippers('+i+')">See '+d.ship+' shippers</button>'
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
  if(S.balance < 2.50){
    flashMsg('Contacts for these shippers cost $2.50 each. Add funds to unlock.');
    tab('billing'); return;
  }
  flashMsg(d.ship+' shippers from '+d.b+' shown. Read the clause on file before you reach out.');
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
      ? '<button class="btn-ghost" style="padding:5px 10px;font-size:13px" onclick="getRecv('+i+')">Get contact</button>'
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
  if(S.balance < 2.50){
    flashMsg('Verified contacts are $2.50 each. Add funds to unlock.');
    tab('billing'); return;
  }
  S.balance -= 2.50;
  addLog('Verified contact \u2014 '+r.n, 2.50);
  renderAll();
  flashMsg(r.contact+' \u2014 contact unlocked. You deliver here '+r.mine+' times already.');
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
function renderOutreach(){ renderChans(); renderSeq(); renderDraft(); renderQueue(); }

function renderAll(){
  document.getElementById('bal').textContent=money(S.balance);
  renderLoads(); renderFacs(); renderTiers(); renderLog(); renderReact(); renderRecv(); renderOutreach();
}
renderTiers();
