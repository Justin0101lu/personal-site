// Domain content for the Lightfield-style layer, independent of Twenty's API shapes.
// provision.mjs maps these into Twenty objects, fields, workflows, an agent and records.

export const WORKSPACE = { name: 'Holography', domain: 'holography.example' };

// ---------- Knowledge: company-specific facts and rules the agent grounds itself in ----------
export const KNOWLEDGE = [
  { title: 'Ideal customer profile', category: 'SALES', body: 'We sell to B2B sales teams of 5 to 50 reps at companies between Seed and Series C. The buyer is usually a Head of Sales or RevOps lead. The strongest signal is a team already running weekly pipeline reviews from spreadsheets.' },
  { title: 'Pricing', category: 'PRICING', body: 'Starter: $600/mo up to 5 seats. Team: $1,200/mo up to 15 seats. Enterprise: custom, includes SSO, audit log and dedicated support. Annual prepay gets two months free. Discounts beyond that need approval from Justin.' },
  { title: 'Lead status definitions', category: 'PROCESS', body: 'New: created, nobody has spoken to them. MQL: engaged with marketing. SQL: sales accepted, a meeting is booked or happened. Nurture: not now, revisit later. Converted: an opportunity exists. Disqualified: not a fit. Status never moves backwards automatically.' },
  { title: 'Security overview', category: 'SECURITY', body: 'SOC 2 Type II in progress (audit window ends December). Data is encrypted at rest and in transit. Meeting recordings are retained for 90 days by default and can be deleted per meeting. EU data residency available on Enterprise.' },
  { title: 'Objection handling: "we already use spreadsheets"', category: 'SALES', body: 'Acknowledge that spreadsheets work until the team grows. Ask how long pipeline review prep takes each week. Show the review queue: updates are proposed from calls and approved in one click, so the CRM stays accurate without extra typing.' },
  { title: 'Rules for the agent', category: 'PROCESS', body: 'Never move a lead status backwards. Never apply a record change directly: create a Review record and let a person approve it. Never send an email without a Review being approved unless the workflow was explicitly granted "send without review". Ignore bookings from personal email domains, internal addresses, and anything that looks like a test (test, dummy, sample, QA, staging, sandbox). Keep emails under 150 words.' },
];

// ---------- Skills: reusable playbooks (manual-trigger workflows with an AI agent step) ----------
export const SKILLS = [
  { key: 'find-lookalikes', name: 'Find lookalikes', description: 'Finds companies that look like the accounts you have already won.', instructions: 'Look at every Won opportunity. Build a profile from those companies (industry, employees, ARR bracket). Score every other company that is not a customer against that profile and return the top 10 with the reason each one matches. Output a markdown table with links to the company records.' },
  { key: 'resurrect-lost-deals', name: 'Resurrect lost deals', description: 'Reviews every Lost opportunity and drafts a re-engagement email for the ones worth another try.', instructions: 'For each Lost opportunity closed more than 14 days ago, read the company, its people and the latest notes. If the loss was about timing or budget rather than fit, create a Review record of type EMAIL_DRAFT addressed to the main contact with a short re-engagement email that references what changed since. Do not send anything.' },
  { key: 'draft-outreach', name: 'Draft outreach', description: 'Drafts a personalised intro email for every person in a view, grounded in Knowledge.', instructions: 'For each person passed in, write a four-sentence intro that names their role and company, references a customer in the same industry if we have one, and proposes a 20 minute walkthrough. Use the ICP and objection-handling Knowledge records. Never mention pricing. Create one Review record of type EMAIL_DRAFT per person.' },
  { key: 'build-pipeline-report', name: 'Build pipeline report', description: 'Summarises open pipeline by stage and owner and flags deals with no next step or a slipped close date.', instructions: 'Group open opportunities by stage and by owner with counts and amounts. List deals that have no next step, a close date in the past, or have been in the same stage for more than 30 days. Return markdown short enough to paste into Slack.' },
  { key: 'propose-record-updates', name: 'Propose record updates', description: 'Reads the latest call notes and proposes field changes for review.', instructions: 'Read the most recent note attached to the given company or opportunity. Propose stage moves, lead status changes, next steps and job title corrections as Review records of type FIELD_UPDATE with objectName, recordId, fieldName, fromValue and toValue filled in. Never move lead status backwards. Never apply changes directly.' },
  { key: 'account-research', name: 'Account research', description: 'Researches a company and writes a Knowledge record with what they do, who we know there and likely use cases.', instructions: 'Given a company, summarise what it does from its domain and industry, list the people we have and their roles, list open opportunities, and suggest an opener for the first call. Create a Knowledge record with category RESEARCH linked to the company.' },
  { key: 'slack-channel-update', name: 'Slack channel update', description: 'Writes a short customer update with wins, risks and asks from the last call.', instructions: 'Take the most recent note on the given customer. Write three bullets: wins, risks, asks. Under 80 words. Create a Review record of type SLACK_DRAFT so a person can post it.' },
];

// ---------- Automations: what Lightfield calls automations become Twenty workflows ----------
// trigger: { type: 'record', object: 'company'|'person'|'opportunity'|'note'|'review', event: 'created'|'updated' }
//        | { type: 'cron', pattern: '0 8 * * 1' }
//        | { type: 'webhook' }
//        | { type: 'manual' }
// steps: ordered list. kinds: 'ai' (agent step with prompt), 'find' (find records), 'create' (create record),
//        'update' (update record), 'email' (send email), 'code' (serverless function), 'http' (request)
export const AUTOMATIONS = [
  { key: 'calcom-demo-booked', name: 'Cal.com demo booked', trigger: { type: 'webhook' },
    description: 'Runs whenever Cal.com reports a new booking. For demo bookings made with a work email it records the demo, links or creates the company, creates the person if new, moves lead status to SQL (never backwards) and assigns the account owner as AE. Personal-email, internal, non-demo and test bookings are ignored. Repeated deliveries never create duplicates.',
    steps: [
      { kind: 'code', name: 'Validate and normalise booking', code: 'validateBooking' },
      { kind: 'ai', name: 'Find or create company and person, set lead status', prompt: 'A Cal.com booking arrived: {{trigger.body}}. Ignore it if the attendee email is a personal domain (gmail, yahoo, hotmail, outlook, icloud, proton), an internal address, or the event title/name/notes look like a test. Otherwise: find the company by email domain or create it; find the person by email or create them; if their leadStatus is NEW or MQL set it to SQL, if it is CONVERTED, NURTURE or DISQUALIFIED leave it alone; set the person\'s owner to the company\'s account owner if there is one. Then create a Note on the company titled "Demo booked" with the booking answers. Return a one-line summary.' },
    ] },
  { key: 'post-meeting-follow-up', name: 'Post-meeting follow-up', trigger: { type: 'record', object: 'note', event: 'created' },
    description: 'After a call note lands on a company, draft a follow-up email covering the agreed next steps and put it in For review for the account owner.',
    steps: [
      { kind: 'ai', name: 'Draft follow-up from the note', prompt: 'A new note was created: {{trigger.record}}. If it is not attached to a company, stop. Load the company, its people, open opportunities and the last three notes. Draft a follow-up email to the main contact restating their pain points in their words and listing the agreed next steps. Use the Pricing and Objection-handling Knowledge records if relevant. Create a Review record: type EMAIL_DRAFT, status PENDING, title "Recap email to <person>", draft = the email, reason = one sentence on why. Do not send.' },
    ] },
  { key: 'deduplicate-new-people', name: 'Deduplicate new people', trigger: { type: 'record', object: 'person', event: 'created' },
    description: 'Whenever a person is created, look for an existing person with the same email or a close name match at the same company and propose a merge.',
    steps: [
      { kind: 'find', name: 'Find people with the same email', object: 'person', filterFrom: 'trigger.record.emails.primaryEmail' },
      { kind: 'ai', name: 'Propose merge if duplicate', prompt: 'New person: {{trigger.record}}. Candidates: {{steps.find.records}}. If a candidate is the same human (same email, or same company and near-identical name), create a Review record of type MERGE with reason explaining which record should win (the older one). Otherwise do nothing.' },
    ] },
  { key: 'first-call-recap', name: 'First-call recap emails', trigger: { type: 'record', object: 'note', event: 'created' },
    description: 'For the first note ever attached to a company, draft a recap that restates their pain points and proposes a concrete next step.',
    steps: [
      { kind: 'ai', name: 'Check first note and draft recap', prompt: 'Note created: {{trigger.record}}. Count notes on the same company. If this is the first one, draft a first-call recap to the main contact (under 150 words) and create a Review of type EMAIL_DRAFT. If not the first, stop.' },
    ] },
  { key: 'backfill-hdyhau', name: 'Backfill "how did you hear about us"', trigger: { type: 'record', object: 'note', event: 'created' },
    description: 'If a company has no source, scan the note for a mention of the referral source and propose a value for review.',
    steps: [
      { kind: 'ai', name: 'Propose source from note', prompt: 'Note: {{trigger.record}}. Load its company. If the company\'s source field is empty and the note mentions how they heard about us (referral, event, ad, search, a named person), create a Review of type FIELD_UPDATE with objectName company, fieldName source, toValue = the source. Otherwise do nothing.' },
    ] },
  { key: 'customer-call-slack-drafter', name: 'Customer call Slack follow-up drafter', trigger: { type: 'record', object: 'note', event: 'created' },
    description: 'After a call with an existing customer (ARR > 0), draft a short Slack update with risks, asks and wins.',
    steps: [
      { kind: 'ai', name: 'Draft Slack update', prompt: 'Note: {{trigger.record}}. Load the company. If annualRecurringRevenue is 0 or empty, stop. Otherwise write three bullets (wins, risks, asks) under 80 words and create a Review of type SLACK_DRAFT.' },
    ] },
  { key: 'account-segment', name: 'Account segment (agentic)', trigger: { type: 'record', object: 'opportunity', event: 'created' },
    description: 'Classify the account into SMB, Mid-market or Enterprise using headcount, ARR and the opportunity amount, then propose the segment.',
    steps: [
      { kind: 'ai', name: 'Classify segment', prompt: 'Opportunity created: {{trigger.record}}. Load its company. Enterprise if amount >= 100000 or employees >= 500; Mid-market if amount >= 25000 or employees >= 50; else SMB. If the company\'s segment differs, create a Review of type FIELD_UPDATE (objectName company, fieldName segment, toValue = segment).' },
    ] },
  { key: 'linkedin-form-leads', name: 'Leads | LinkedIn form', trigger: { type: 'webhook' },
    description: 'Create or update a person and company from LinkedIn lead-gen form submissions and mark them MQL.',
    steps: [
      { kind: 'ai', name: 'Upsert person and company as MQL', prompt: 'LinkedIn lead form payload: {{trigger.body}}. Find or create the company by domain, find or create the person by email, set leadStatus to MQL only if it is currently NEW or empty, set source to "LinkedIn form". Return a summary.' },
    ] },
  { key: 'account-research', name: 'Account research on creation', trigger: { type: 'record', object: 'company', event: 'created' },
    description: 'Research a newly created company: what they do, who we know, likely use cases. Save it as a Knowledge record attached to the company.',
    steps: [
      { kind: 'ai', name: 'Research and write Knowledge', prompt: 'Company created: {{trigger.record}}. Summarise what it does from its domain and industry, list people and open opportunities, suggest an opener for the first call. Create a Knowledge record with category RESEARCH, title "Research: <company>", linked to the company.' },
    ] },
  { key: 'enrich-new-companies', name: 'Enrich new companies', trigger: { type: 'record', object: 'company', event: 'created' },
    description: 'Fill industry and employees from an enrichment provider when a company is created without them.',
    steps: [
      { kind: 'http', name: 'Call enrichment provider', url: 'https://api.example-enrichment.com/v1/companies/{{trigger.record.domainName.primaryLinkUrl}}' },
      { kind: 'ai', name: 'Propose missing fields', prompt: 'Company: {{trigger.record}}. Provider response: {{steps.http.body}}. For each of industry and employees that is empty on the company and present in the response, create a Review of type FIELD_UPDATE.' },
    ] },
  { key: 'paywall-dropoff', name: 'Product paywall drop-off', trigger: { type: 'webhook' },
    description: 'When a product user hits the paywall and abandons, create a Nurture person and notify the owner if the company has an open opportunity.',
    steps: [
      { kind: 'ai', name: 'Create nurture lead and flag owner', prompt: 'Product event: {{trigger.body}}. Find or create the person by email with leadStatus NURTURE (never downgrade an existing status). If their company has an open opportunity, create a Task for the opportunity owner titled "Paywall drop-off: <person>" due tomorrow.' },
    ] },
  { key: 'billing-subscription-created', name: 'Billing subscription created', trigger: { type: 'webhook' },
    description: 'Mark the opportunity Won and set ARR on the company when billing reports a new subscription.',
    steps: [
      { kind: 'ai', name: 'Mark won and set ARR', prompt: 'Billing payload: {{trigger.body}}. Find the company by domain or billing customer id. Create a Review of type FIELD_UPDATE setting annualRecurringRevenue to the subscription ARR, and another moving the open opportunity stage to WON.' },
    ] },
  { key: 'billing-customer-created', name: 'Billing customer created', trigger: { type: 'webhook' },
    description: 'Link a new billing customer to its company by domain.',
    steps: [
      { kind: 'ai', name: 'Link billing customer', prompt: 'Billing customer: {{trigger.body}}. Find the company by email domain and create a Review of type FIELD_UPDATE setting billingCustomerId.' },
    ] },
  { key: 'slack-on-won', name: 'Slack notification on Won', trigger: { type: 'record', object: 'opportunity', event: 'updated' },
    description: 'Post a celebratory message to #wins when an opportunity moves to Won.',
    steps: [
      { kind: 'ai', name: 'Compose win message', prompt: 'Opportunity updated: {{trigger.record}}. If stage is not WON, stop. Compose a two-line message for #wins with company, amount and owner and create a Review of type SLACK_DRAFT titled "Win: <opportunity>".' },
    ] },
  { key: 'set-qualified-date', name: 'Set qualified date when entering Qualified', trigger: { type: 'record', object: 'opportunity', event: 'updated' },
    description: 'Stamp the qualified date the first time an opportunity enters the Qualified stage.',
    steps: [
      { kind: 'update-if', name: 'Set qualifiedAt', object: 'opportunity', when: { field: 'stage', equals: 'QUALIFIED' }, set: { qualifiedAt: '{{now}}' }, onlyIfEmpty: 'qualifiedAt' },
    ] },
  { key: 'weekly-pipeline-digest', name: 'Weekly pipeline digest', trigger: { type: 'cron', pattern: '0 8 * * 1' },
    description: 'Every Monday, summarise stage changes, new opportunities and slipped close dates from the previous week and email the digest to the sales team.',
    steps: [
      { kind: 'ai', name: 'Build digest', prompt: 'Summarise opportunities created or updated in the last 7 days: new deals, stage changes, slipped close dates, and deals with no next step. Return markdown.' },
      { kind: 'email', name: 'Email the digest', to: '{{workspace.ownerEmail}}', subject: 'Weekly pipeline digest', body: '{{steps.ai.result}}' },
    ] },
  { key: 'stale-opportunity-nudge', name: 'Stale opportunity nudge', trigger: { type: 'cron', pattern: '0 9 * * *' },
    description: 'Nudge the owner of any open opportunity with no activity in 14 days and suggest a next step based on the last note.',
    steps: [
      { kind: 'ai', name: 'Find stale deals and create tasks', prompt: 'Find open opportunities whose updatedAt is older than 14 days. For each, read the last note on its company and create a Task for the owner titled "Nudge: <opportunity>" with a suggested next step in the body, due tomorrow.' },
    ] },
  { key: 'apply-approved-review', name: 'Apply approved review', trigger: { type: 'record', object: 'review', event: 'updated' },
    description: 'The "For review" queue. When a person sets a Review to APPROVED, apply it: update the field, send the email draft, or record the merge. Everything the agent proposes flows through here, so nothing changes without a human.',
    steps: [
      { kind: 'code', name: 'Apply the approved change', code: 'applyReview' },
    ] },
  { key: 'sync-stage-to-support', name: 'Sync opportunity stage to support desk', trigger: { type: 'webhook' },
    description: 'When the support desk reports a new ticket for a company with an open opportunity, mirror the current opportunity stage into the ticket so support can prioritise deals in negotiation.',
    steps: [
      { kind: 'ai', name: 'Look up open opportunity', prompt: 'Support ticket: {{trigger.body}}. Find the company by domain and its open opportunity. Return JSON {ticketId, stage}.' },
      { kind: 'http', name: 'Update ticket', url: 'https://api.example-support.com/tickets/{{steps.ai.ticketId}}', method: 'PATCH', body: '{"custom_fields":{"crm_stage":"{{steps.ai.stage}}"}}' },
    ] },
  { key: 'sync-plan-to-support', name: 'Sync plan tier to support desk on new issue', trigger: { type: 'webhook' },
    description: 'Tag new support issues with the company\'s plan tier so enterprise customers get routed to the priority queue.',
    steps: [
      { kind: 'ai', name: 'Look up plan tier', prompt: 'Support issue: {{trigger.body}}. Find the company by domain. Return JSON {issueId, tier} where tier is derived from annualRecurringRevenue (>= 50000 enterprise, >= 10000 team, else starter).' },
      { kind: 'http', name: 'Label issue', url: 'https://api.example-support.com/issues/{{steps.ai.issueId}}/labels', method: 'POST', body: '{"label":"plan:{{steps.ai.tier}}"}' },
    ] },
];

// ---------- Seed records ----------
export const COMPANIES = [
  { name: 'Northwind Robotics', domain: 'northwindrobotics.com', industry: 'Robotics', employees: 120, arr: 48000, segment: 'MID_MARKET', source: 'Cal.com demo' },
  { name: 'Bluefin Analytics', domain: 'bluefin.io', industry: 'Data & Analytics', employees: 30, arr: 12000, segment: 'SMB', source: 'LinkedIn form' },
  { name: 'Cascade Health', domain: 'cascadehealth.org', industry: 'Healthcare', employees: 400, arr: 0, segment: 'ENTERPRISE', source: 'Outbound' },
  { name: 'Orbital Freight', domain: 'orbitalfreight.com', industry: 'Logistics', employees: 150, arr: 30000, segment: 'MID_MARKET', source: 'Referral' },
  { name: 'Pixelfold', domain: 'pixelfold.app', industry: 'Design tools', employees: 8, arr: 0, segment: 'SMB', source: 'YC S26 Demo Day' },
  { name: 'Meridian Capital', domain: 'meridiancap.com', industry: 'Financial services', employees: 800, arr: 120000, segment: 'ENTERPRISE', source: 'Inbound' },
  { name: 'Sprout Learning', domain: 'sproutlearning.co', industry: 'EdTech', employees: 25, arr: 6000, segment: 'SMB', source: 'Cal.com demo' },
  { name: 'Tidewater Energy', domain: 'tidewater-energy.com', industry: 'Energy', employees: 2000, arr: 0, segment: 'ENTERPRISE', source: 'Outbound' },
  { name: 'Lumen Labs', domain: 'lumenlabs.ai', industry: 'AI infrastructure', employees: 40, arr: 18000, segment: 'SMB', source: 'YC S26 Demo Day' },
  { name: 'Harbor & Vine', domain: 'harborandvine.com', industry: 'Hospitality', employees: 90, arr: 9000, segment: 'MID_MARKET', source: 'Referral' },
  { name: 'Quill Legal', domain: 'quilllegal.com', industry: 'Legal', employees: 20, arr: 0, segment: 'SMB', source: 'LinkedIn form' },
  { name: 'Atlas Field Services', domain: 'atlasfield.co', industry: 'Field services', employees: 300, arr: 0, segment: 'MID_MARKET', source: 'Cal.com demo' },
];

export const PEOPLE = [
  { first: 'Elena', last: 'Marsh', email: 'elena@northwindrobotics.com', title: 'VP Operations', company: 'Northwind Robotics', leadStatus: 'CONVERTED' },
  { first: 'Tomás', last: 'Rivera', email: 'tomas@northwindrobotics.com', title: 'Head of Sales', company: 'Northwind Robotics', leadStatus: 'CONVERTED' },
  { first: 'Grace', last: 'Okafor', email: 'grace@bluefin.io', title: 'CEO', company: 'Bluefin Analytics', leadStatus: 'SQL' },
  { first: 'Hiro', last: 'Tanaka', email: 'hiro@cascadehealth.org', title: 'Director of RevOps', company: 'Cascade Health', leadStatus: 'MQL' },
  { first: 'Sam', last: 'Whitfield', email: 'sam@orbitalfreight.com', title: 'COO', company: 'Orbital Freight', leadStatus: 'SQL' },
  { first: 'Ava', last: 'Lindqvist', email: 'ava@pixelfold.app', title: 'Co-founder', company: 'Pixelfold', leadStatus: 'NURTURE' },
  { first: 'Marcus', last: 'Bell', email: 'marcus@meridiancap.com', title: 'Managing Director', company: 'Meridian Capital', leadStatus: 'CONVERTED' },
  { first: 'Nadia', last: 'Haddad', email: 'nadia@meridiancap.com', title: 'Head of Platform', company: 'Meridian Capital', leadStatus: 'SQL' },
  { first: 'Owen', last: 'Fitzgerald', email: 'owen@sproutlearning.co', title: 'Founder', company: 'Sprout Learning', leadStatus: 'SQL' },
  { first: 'Lucía', last: 'Fernández', email: 'lucia@tidewater-energy.com', title: 'VP Commercial', company: 'Tidewater Energy', leadStatus: 'NEW' },
  { first: 'Ben', last: 'Adeyemi', email: 'ben@lumenlabs.ai', title: 'CTO', company: 'Lumen Labs', leadStatus: 'SQL' },
  { first: 'Chloe', last: 'Dubois', email: 'chloe@lumenlabs.ai', title: 'Head of Growth', company: 'Lumen Labs', leadStatus: 'MQL' },
  { first: 'Rafael', last: 'Costa', email: 'rafael@harborandvine.com', title: 'GM', company: 'Harbor & Vine', leadStatus: 'CONVERTED' },
  { first: 'Ingrid', last: 'Solberg', email: 'ingrid@quilllegal.com', title: 'Partner', company: 'Quill Legal', leadStatus: 'MQL' },
  { first: 'Kwame', last: 'Mensah', email: 'kwame@atlasfield.co', title: 'VP Sales', company: 'Atlas Field Services', leadStatus: 'SQL' },
  { first: 'Yuki', last: 'Sato', email: 'yuki@atlasfield.co', title: 'Sales Ops Lead', company: 'Atlas Field Services', leadStatus: 'NEW' },
  { first: 'Daniel', last: 'Brooks', email: 'daniel@cascadehealth.org', title: 'CFO', company: 'Cascade Health', leadStatus: 'NEW' },
  { first: 'Sofia', last: 'Rossi', email: 'sofia@bluefin.io', title: 'Head of Marketing', company: 'Bluefin Analytics', leadStatus: 'NURTURE' },
  { first: 'Leo', last: 'Hartmann', email: 'leo@orbitalfreight.com', title: 'Director of Ops', company: 'Orbital Freight', leadStatus: 'DISQUALIFIED' },
  { first: 'Amara', last: 'Singh', email: 'amara@tidewater-energy.com', title: 'Procurement Manager', company: 'Tidewater Energy', leadStatus: 'NEW' },
];

const day = 86400000;
const ahead = (d) => new Date(Date.now() + d * day).toISOString();
const ago = (d) => new Date(Date.now() - d * day).toISOString();
export const OPPORTUNITIES = [
  { name: 'Northwind Robotics — Expansion', company: 'Northwind Robotics', stage: 'NEGOTIATION', amount: 36000, closeDate: ahead(12), nextStep: 'Send redlined MSA', pointOfContact: 'elena@northwindrobotics.com' },
  { name: 'Bluefin Analytics — Team plan', company: 'Bluefin Analytics', stage: 'PROPOSAL', amount: 14400, closeDate: ahead(20), nextStep: 'Pricing review with Grace', pointOfContact: 'grace@bluefin.io' },
  { name: 'Cascade Health — Pilot', company: 'Cascade Health', stage: 'DISCOVERY', amount: 60000, closeDate: ahead(45), nextStep: 'Security questionnaire', pointOfContact: 'hiro@cascadehealth.org' },
  { name: 'Orbital Freight — Ops rollout', company: 'Orbital Freight', stage: 'QUALIFIED', amount: 42000, closeDate: ahead(30), nextStep: 'Technical deep dive', pointOfContact: 'sam@orbitalfreight.com' },
  { name: 'Meridian Capital — Platform', company: 'Meridian Capital', stage: 'WON', amount: 120000, closeDate: ago(3), nextStep: 'Kickoff scheduled', pointOfContact: 'marcus@meridiancap.com' },
  { name: 'Sprout Learning — Starter', company: 'Sprout Learning', stage: 'PROPOSAL', amount: 7200, closeDate: ahead(9), nextStep: 'Follow up on proposal', pointOfContact: 'owen@sproutlearning.co' },
  { name: 'Lumen Labs — Growth', company: 'Lumen Labs', stage: 'QUALIFIED', amount: 24000, closeDate: ahead(25), nextStep: 'Demo for eng team', pointOfContact: 'ben@lumenlabs.ai' },
  { name: 'Harbor & Vine — Renewal', company: 'Harbor & Vine', stage: 'WON', amount: 9000, closeDate: ago(7), nextStep: '', pointOfContact: 'rafael@harborandvine.com' },
  { name: 'Tidewater Energy — Enterprise', company: 'Tidewater Energy', stage: 'DISCOVERY', amount: 180000, closeDate: ahead(90), nextStep: 'Intro to VP Commercial', pointOfContact: 'lucia@tidewater-energy.com' },
  { name: 'Pixelfold — Starter', company: 'Pixelfold', stage: 'LOST', amount: 3600, closeDate: ago(2), nextStep: '', pointOfContact: 'ava@pixelfold.app' },
  { name: 'Atlas Field Services — Sales team', company: 'Atlas Field Services', stage: 'QUALIFIED', amount: 30000, closeDate: ahead(35), nextStep: 'Send recap + pricing', pointOfContact: 'kwame@atlasfield.co' },
];

// Call notes stand in for meeting transcripts; a note created on a company triggers the meeting automations.
export const NOTES = [
  { company: 'Atlas Field Services', title: 'Demo with Kwame and Yuki', body: 'Kwame and Yuki walked through their current outbound process, which lives across three spreadsheets and a shared inbox. Main pain: reps forget follow-ups after calls and pipeline reviews take two hours every Monday. They liked automatic recap emails and the review queue. Budget exists for this quarter; Kwame owns the decision with Yuki as champion. Next steps: send recap with pricing tiers, share security overview, book technical deep dive with sales ops.' },
  { company: 'Lumen Labs', title: 'Growth kickoff', body: 'Ben wants the eng team to see the automation builder before committing. Chloe is focused on lead routing from their LinkedIn campaigns. Agreed on a 2-week evaluation with a success metric of cutting response time on inbound leads under 10 minutes. Ben mentioned Marcus at Meridian recommended us.' },
  { company: 'Orbital Freight', title: 'Technical deep dive', body: 'Sam is bought in on the ops rollout. Leo raised concerns about data residency and is not the decision maker; Sam confirmed he owns the budget. Next step is a technical deep dive with their IT lead.' },
];

// Pending reviews to seed the queue so the "For review" view is not empty on first open.
export const REVIEWS = [
  { type: 'FIELD_UPDATE', title: 'Move Atlas Field Services — Sales team to Proposal', objectName: 'opportunity', record: 'Atlas Field Services — Sales team', fieldName: 'stage', fromValue: 'QUALIFIED', toValue: 'PROPOSAL', reason: 'Kwame asked for pricing tiers and confirmed budget for this quarter.', source: 'Demo with Kwame and Yuki' },
  { type: 'FIELD_UPDATE', title: 'Update Yuki Sato job title', objectName: 'person', record: 'yuki@atlasfield.co', fieldName: 'jobTitle', fromValue: 'Sales Ops Lead', toValue: 'Head of Sales Operations', reason: 'Yuki introduced herself as Head of Sales Operations on the call.', source: 'Demo with Kwame and Yuki' },
  { type: 'FIELD_UPDATE', title: 'Move Chloe Dubois to SQL', objectName: 'person', record: 'chloe@lumenlabs.ai', fieldName: 'leadStatus', fromValue: 'MQL', toValue: 'SQL', reason: 'Chloe is actively evaluating lead routing and joined the kickoff.', source: 'Growth kickoff' },
  { type: 'FIELD_UPDATE', title: 'Set Lumen Labs source to Referral', objectName: 'company', record: 'Lumen Labs', fieldName: 'source', fromValue: 'YC S26 Demo Day', toValue: 'Referral from Meridian Capital', reason: 'Ben mentioned Marcus at Meridian recommended us.', source: 'Growth kickoff' },
  { type: 'EMAIL_DRAFT', title: 'Recap email to Kwame Mensah', objectName: 'person', record: 'kwame@atlasfield.co', draft: 'Hi Kwame,\n\nThanks for walking us through how Atlas runs outbound today. To recap what we heard: follow-ups slip after calls, and Monday pipeline reviews take about two hours across three spreadsheets.\n\nNext steps:\n1. Pricing tiers (attached)\n2. Security overview\n3. A technical deep dive with Yuki and sales ops\n\nDoes Thursday or Friday work for the deep dive?\n\nBest,\nJustin', reason: 'Generated by "First-call recap emails".', source: 'Demo with Kwame and Yuki' },
  { type: 'EMAIL_DRAFT', title: 'Recap email to Ben Adeyemi', objectName: 'person', record: 'ben@lumenlabs.ai', draft: 'Hi Ben,\n\nGreat to kick things off today. We agreed on a two-week evaluation with one goal: inbound leads answered in under 10 minutes.\n\nNext steps on our side:\n- Demo of the automation builder for your eng team\n- LinkedIn form routing set up in your workspace\n\nI will send a couple of slots for the eng demo shortly.\n\nJustin', reason: 'Generated by "First-call recap emails".', source: 'Growth kickoff' },
  { type: 'FIELD_UPDATE', title: 'Set Orbital Freight next step', objectName: 'opportunity', record: 'Orbital Freight — Ops rollout', fieldName: 'nextStep', fromValue: 'Technical deep dive', toValue: 'Technical deep dive with IT lead (data residency)', reason: 'Leo raised data residency; Sam wants IT present.', source: 'Technical deep dive' },
];
