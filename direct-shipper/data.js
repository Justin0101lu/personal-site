/* ---------- fixtures ----------
   All prototype content lives here. app.js renders it and never
   hardcodes a row, a step or a channel. */

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

/* ---------- outreach ----------
   Three tables drive the whole Outreach screen.

   CHANNELS  where a touch can go out
   SEQUENCE  the ordered touches, each pointing at a channel by id
   OUTREACH  the queue

   Adding a channel is one CHANNELS entry plus a SEQUENCE step that
   references its id. No markup changes, no render changes. */

var CHANNELS = [
  {id:'email', label:'Email', connected:true,
   from:'dispatch@ruiztrucking.com',
   note:'Goes out from your own domain. Replies land in your inbox and the sequence stops.',
   subject:true, limit:null},
  {id:'linkedin', label:'LinkedIn', connected:false,
   from:'Justin Lu · Ruiz Trucking LLC',
   note:'Sent from your profile — a connection note first, InMail once they accept.',
   subject:false, limit:300}
];

var SEQUENCE = [
  {day:0,  ch:'email',    name:'Opener',
   why:'Lead with the deliveries you already make, not with a pitch.'},
  {day:2,  ch:'linkedin', name:'Connection request',
   why:'Puts a face against the name while the first email is still near the top.'},
  {day:4,  ch:'email',    name:'First follow-up',
   why:'One paragraph. Nothing new, just the top of the thread again.'},
  {day:7,  ch:'linkedin', name:'InMail',
   why:'Only if they accepted. A different channel, not a fourth email.'},
  {day:11, ch:'email',    name:'Last follow-up',
   why:'Says it is the last one, and is the last one.'}
];

var DRAFTS = {
  email:{
    subject:'Your Ontario outbound — we’re at your dock Thursdays',
    body:'Dana,\n\nWe run about 64 loads a year into your Phoenix DC, so our drivers are on your dock most Thursdays.\n\nI noticed you also ship outbound toward Ontario. That’s our home lane and we’re usually running back empty, which means we can price it better than someone repositioning to get there.\n\nWorth a short call? I can send our insurance and authority ahead of time.\n\n— Justin'
  },
  linkedin:{
    subject:null,
    body:'Dana — our trucks are on your Phoenix dock most Thursdays, about 64 loads a year. I saw you ship outbound toward Ontario, which is our home lane and usually our empty return. Worth a short call? Happy to send authority and insurance first.\n\n— Justin, Ruiz Trucking'
  }
};

var OUTREACH = [
  {n:'SW Distribution Center', who:'Dana Whitfield',
   why:'64 deliveries · ships 31/mo toward Ontario', ch:'email', step:'Opener', st:'ready'},
  {n:'Cactus Cold Storage', who:'Luis Ferrara',
   why:'22 deliveries · ships 47/mo toward LA', ch:'email', step:'Opener', st:'ready'},
  {n:'Lone Star Grocery DC', who:'Marcus Bell',
   why:'18 deliveries · fills your 48% Dallas deadhead', ch:'linkedin', step:'Connection request', st:'blocked'},
  {n:'Desert Valley Foods DC', who:'Priya Anand',
   why:'18 deliveries · outbound mirrors your best lane', ch:'email', step:'First follow-up', st:'sent'},
  {n:'Harbor Point shippers', who:'3 contacts',
   why:'Dormant broker · term elapsed Jun 2025', ch:'email', step:'Opener', st:'nocontact'}
];
