/* ---------- state ---------- */
var S = {balance:0, crm:null, reload:false, tier:1, log:[], unlocked:{}, prospectRun:false};
var TIERS = [{amt:100,bonus:0},{amt:500,bonus:.10},{amt:2000,bonus:.20}];

var LOADS = [
  {id:'4471882',broker:'Midland Logistics LLC',mc:'884213',fac:'Lineage Ontario 4',addr:'4200 E Airport Dr, Ontario CA',shipper:'Sunrise Frozen Foods',lane:'Ontario CA → Phoenix AZ',eq:'Reefer',rate:'$2,850',status:'ok',f:0},
  {id:'4471903',broker:'Coast Range Freight',mc:'712880',fac:'Americold Ontario',addr:'1801 S Milliken Ave, Ontario CA',shipper:'Unresolved',lane:'Ontario CA → Las Vegas NV',eq:'Reefer',rate:'$1,420',status:'unres',f:1},
  {id:'4472011',broker:'Midland Logistics LLC',mc:'884213',fac:'Lineage Ontario 4',addr:'4200 E Airport Dr, Ontario CA',shipper:'Sunrise Frozen Foods',lane:'Ontario CA → Phoenix AZ',eq:'Reefer',rate:'$2,790',status:'ok',f:0},
  {id:'4472044',broker:'Vantage Transport Svcs',mc:'1099421',fac:'Del Rio Produce DC',addr:'900 W Rincon St, Corona CA',shipper:'Del Rio Produce Co',lane:'Corona CA → Dallas TX',eq:'Reefer',rate:'$3,610',status:'ok',f:2},
  {id:'4472090',broker:'Apex Freight Group',mc:'1288740',fac:'Lineage Ontario 4',addr:'4200 E Airport Dr, Ontario CA',shipper:'Sunrise Frozen Foods',lane:'Ontario CA → Denver CO',eq:'Reefer',rate:'$1,980',status:'flag',f:0},
  {id:'4472117',broker:'Coast Range Freight',mc:'712880',fac:'Del Rio Produce DC',addr:'900 W Rincon St, Corona CA',shipper:'Del Rio Produce Co',lane:'Corona CA → Phoenix AZ',eq:'Reefer',rate:'$1,240',status:'ok',f:2}
];

var FACS = [
  {name:'Lineage Ontario 4', addr:'4200 E Airport Dr, Ontario CA 91761', type:'3PL cold storage', shipper:'Sunrise Frozen Foods', mine:3, net:611, conf:96,
   lanes:[['Phoenix AZ',21,'VERIFIED',117],['Las Vegas NV',14,'VERIFIED',81],['Dallas TX',11,'OBSERVED',52],['Denver CO',8,'INFERRED',19]],
   vol:'41 loads/mo, flat', season:'Peak Aug–Nov', eq:'Reefer 91% · Dry 9%', comm:'Frozen food',
   contact:'Javier Ruiz — Transportation Manager · j.ruiz@sunrisefrozen.com · (909) 555-0142',
   paid:'$3,240 average, Ontario → Phoenix, last 90 days (n=64)'},
  {name:'Del Rio Produce DC', addr:'900 W Rincon St, Corona CA 92880', type:'Shipper-owned DC', shipper:'Del Rio Produce Co', mine:2, net:188, conf:88,
   lanes:[['Phoenix AZ',26,'VERIFIED',49],['Dallas TX',18,'OBSERVED',34],['Salt Lake City UT',9,'INFERRED',11]],
   vol:'16 loads/mo, rising', season:'Peak May–Sep', eq:'Reefer 100%', comm:'Fresh produce',
   contact:'Marisol Vega — Logistics Director · m.vega@delrioproduce.com · (951) 555-0188',
   paid:'$1,610 average, Corona → Phoenix, last 90 days (n=27)'},
  {name:'Americold Ontario', addr:'1801 S Milliken Ave, Ontario CA 91761', type:'3PL cold storage', shipper:'Unresolved — 14 shippers seen', mine:1, net:97, conf:41,
   lanes:[['Las Vegas NV',19,'OBSERVED',22],['Phoenix AZ',12,'INFERRED',9]],
   vol:'Not enough independent observations', season:'Unknown', eq:'Reefer 88% · Dry 12%', comm:'Mixed frozen',
   contact:null, paid:null}
];

var RECEIVERS = [
  {n:'SW Distribution Center', c:'Phoenix AZ', mine:64, out:'Yes — 31/mo observed',
   lanes:'Phoenix → Ontario CA 34% · Tucson AZ 19%', eq:'Reefer 88%', st:'clear',
   note:'You deliver here weekly. Ships reefer back toward your home base.',
   contact:'Dana Whitfield — Inbound & Outbound Manager'},
  {n:'Cactus Cold Storage', c:'Tolleson AZ', mine:22, out:'Yes — 47/mo observed',
   lanes:'Tolleson → Los Angeles 28% · Denver CO 14%', eq:'Reefer 96%', st:'clear',
   note:'3PL serving 12 shippers. Outbound is awarded at the facility, not by a broker.',
   contact:'Luis Ferrara — Transportation Coordinator'},
  {n:'Desert Valley Foods DC', c:'Glendale AZ', mine:18, out:'Yes — 19/mo observed',
   lanes:'Glendale → Corona CA 41%', eq:'Reefer 100%', st:'clear',
   note:'Their outbound mirrors your best paying lane in reverse.',
   contact:'Priya Anand — Logistics Manager'},
  {n:'Lone Star Grocery DC', c:'Dallas TX', mine:18, out:'Yes — 26/mo observed',
   lanes:'Dallas → Corona CA 22% · Houston TX 17%', eq:'Reefer 79% · Dry 21%', st:'clear',
   note:'You deadhead out of Dallas 48% of the time. They ship toward Corona.',
   contact:'Marcus Bell — Director of Transportation'},
  {n:'Summit Beverage Whse', c:'Denver CO', mine:12, out:'Limited — 6/mo observed',
   lanes:'Denver → Salt Lake City UT 38%', eq:'Dry 71%', st:'thin',
   note:'Small outbound volume and mostly dry van. Worth a call, not a plan.',
   contact:null},
  {n:'Valley Retail RDC', c:'Las Vegas NV', mine:41, out:'No outbound observed',
   lanes:'—', eq:'—', st:'none',
   note:'Pure receiving location. Inbound only in everything we have seen.',
   contact:null}
];

var DORMANT = [
  {b:'Coast Range Freight', last:'Feb 2024', auth:'Revoked Aug 2024', term:'18 mo, survives termination',
   ship:3, st:'clear', note:'Entity dissolved with CA SOS. Term elapsed Aug 2025.'},
  {b:'Trident Transport Mgmt', last:'Nov 2023', auth:'Inactive', term:'Not on file',
   ship:2, st:'unknown', note:'No signed agreement found. Upload it to date the clock.'},
  {b:'Harbor Point Logistics', last:'Jun 2024', auth:'Revoked Jan 2025', term:'12 mo from last shipment',
   ship:4, st:'clear', note:'Term elapsed Jun 2025.'},
  {b:'Apex Freight Group', last:'Mar 2025', auth:'Active', term:'24 mo from last shipment',
   ship:1, st:'running', note:'Runs to Mar 2027. Broker still operating.'},
  {b:'Sierra Lane Brokerage', last:'Aug 2025', auth:'Active', term:'24 mo from last shipment',
   ship:2, st:'running', note:'Runs to Aug 2027.'},
  {b:'Midland Logistics LLC', last:'This month', auth:'Active', term:'24 mo from last shipment',
   ship:1, st:'hold', note:'Current relationship. Excluded from lookalikes.'}
];

var PROSPECTS = [
  ['Sunrise Frozen Foods','Ontario CA','41/mo','VERIFIED'],
  ['Del Rio Produce Co','Corona CA','16/mo','VERIFIED'],
  ['Valley Cold Pack','Fontana CA','28/mo','VERIFIED'],
  ['Harborline Foods','Vernon CA','22/mo','OBSERVED'],
  ['Sierra Dairy Group','Chino CA','19/mo','OBSERVED'],
  ['Pacific Meat Co','Vernon CA','14/mo','OBSERVED'],
  ['Inland Beverage','Riverside CA','12/mo','OBSERVED'],
  ['Redlands Citrus Co','Redlands CA','11/mo','INFERRED']
];

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
  if(navigator.clipboard) navigator.clipboard.writeText('loads-8f2a41@waybill.co');
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

  h+='<div class="panel"><h3>What Waybill knows for free</h3><dl>'+
    '<div class="row"><dt>Facility type</dt><dd>'+f.type+'</dd></div>'+
    '<div class="row"><dt>Shipper</dt><dd>'+f.shipper+'</dd></div>'+
    '<div class="row"><dt>Your loads through here</dt><dd>'+f.mine+'</dd></div>'+
    '<div class="row"><dt>Network observations</dt><dd>'+f.net+'</dd></div>'+
    '<div class="row"><dt>Equipment mix</dt><dd>'+f.eq+'</dd></div>'+
    '<div class="row"><dt>Commodity</dt><dd>'+f.comm+'</dd></div></dl></div>';

  h+='<div class="grid2"><div class="panel"><h3>Observed lanes</h3>';
  if(f.conf<50){
    h+='<p class="ph" style="margin:0">Not enough independent carriers have moved freight through this dock to publish lanes. Waybill will not guess.</p>';
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
    return '<tr style="cursor:default"><td class="log">'+e.t+'</td><td>'+e.w+'</td>'+
      '<td style="text-align:right" class="num">'+(e.c===0?'$0.00':'−'+money(e.c))+'</td>'+
      '<td style="text-align:right" class="num">'+money(e.b)+'</td></tr>';
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

function renderAll(){
  document.getElementById('bal').textContent=money(S.balance);
  renderLoads(); renderFacs(); renderTiers(); renderLog(); renderReact(); renderRecv();
}
renderTiers();
