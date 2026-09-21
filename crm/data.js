// Seed data for the CRM. Everything is relative to "now" so the workspace
// always looks fresh the first time it is opened. Persisted state lives in
// localStorage afterwards (see app.js).
(function () {
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  window.LF_SEED = function seed(now) {
    const ago = (ms) => now - ms;
    const ahead = (ms) => now + ms;
    // Meetings land on the hour or half hour so the calendar reads naturally.
    const snap = (ts) => Math.round(ts / (30 * MIN)) * (30 * MIN);

    const users = [
      { id: 'u_me', name: 'Justin Lu', initials: 'JL', email: 'justin0101lu@gmail.com', role: 'Admin' },
      { id: 'u_2', name: 'Maya Chen', initials: 'MC', email: 'maya@holography.example', role: 'AE' },
      { id: 'u_3', name: 'Devin Park', initials: 'DP', email: 'devin@holography.example', role: 'SDR' },
      { id: 'u_4', name: 'Priya Natarajan', initials: 'PN', email: 'priya@holography.example', role: 'CS' },
    ];

    const companies = [
      { id: 'co_1', name: 'Northwind Robotics', domain: 'northwindrobotics.com', industry: 'Robotics', size: '51-200', segment: 'Mid-market', owner: 'u_me', arr: 48000, funding: 'Series A', source: 'Cal.com demo', createdAt: ago(38 * DAY) },
      { id: 'co_2', name: 'Bluefin Analytics', domain: 'bluefin.io', industry: 'Data & Analytics', size: '11-50', segment: 'SMB', owner: 'u_2', arr: 12000, funding: 'Seed', source: 'LinkedIn form', createdAt: ago(34 * DAY) },
      { id: 'co_3', name: 'Cascade Health', domain: 'cascadehealth.org', industry: 'Healthcare', size: '201-500', segment: 'Enterprise', owner: 'u_me', arr: 0, funding: 'Series C', source: 'Outbound', createdAt: ago(29 * DAY) },
      { id: 'co_4', name: 'Orbital Freight', domain: 'orbitalfreight.com', industry: 'Logistics', size: '51-200', segment: 'Mid-market', owner: 'u_2', arr: 30000, funding: 'Series B', source: 'Referral', createdAt: ago(25 * DAY) },
      { id: 'co_5', name: 'Pixelfold', domain: 'pixelfold.app', industry: 'Design tools', size: '1-10', segment: 'SMB', owner: 'u_3', arr: 0, funding: 'Pre-seed', source: 'YC S26 Demo Day', createdAt: ago(21 * DAY) },
      { id: 'co_6', name: 'Meridian Capital', domain: 'meridiancap.com', industry: 'Financial services', size: '501-1000', segment: 'Enterprise', owner: 'u_me', arr: 120000, funding: 'Public', source: 'Inbound', createdAt: ago(19 * DAY) },
      { id: 'co_7', name: 'Sprout Learning', domain: 'sproutlearning.co', industry: 'EdTech', size: '11-50', segment: 'SMB', owner: 'u_3', arr: 6000, funding: 'Seed', source: 'Cal.com demo', createdAt: ago(16 * DAY) },
      { id: 'co_8', name: 'Tidewater Energy', domain: 'tidewater-energy.com', industry: 'Energy', size: '1001+', segment: 'Enterprise', owner: 'u_2', arr: 0, funding: 'Public', source: 'Outbound', createdAt: ago(13 * DAY) },
      { id: 'co_9', name: 'Lumen Labs', domain: 'lumenlabs.ai', industry: 'AI infrastructure', size: '11-50', segment: 'SMB', owner: 'u_me', arr: 18000, funding: 'Series A', source: 'YC S26 Demo Day', createdAt: ago(10 * DAY) },
      { id: 'co_10', name: 'Harbor & Vine', domain: 'harborandvine.com', industry: 'Hospitality', size: '51-200', segment: 'Mid-market', owner: 'u_4', arr: 9000, funding: 'Bootstrapped', source: 'Referral', createdAt: ago(8 * DAY) },
      { id: 'co_11', name: 'Quill Legal', domain: 'quilllegal.com', industry: 'Legal', size: '11-50', segment: 'SMB', owner: 'u_3', arr: 0, funding: 'Seed', source: 'LinkedIn form', createdAt: ago(4 * DAY) },
      { id: 'co_12', name: 'Atlas Field Services', domain: 'atlasfield.co', industry: 'Field services', size: '201-500', segment: 'Mid-market', owner: 'u_me', arr: 0, funding: 'Series B', source: 'Cal.com demo', createdAt: ago(2 * DAY) },
    ];

    const contacts = [
      { id: 'ct_1', name: 'Elena Marsh', email: 'elena@northwindrobotics.com', title: 'VP Operations', companyId: 'co_1', leadStatus: 'Converted', owner: 'u_me', source: 'Cal.com demo', phone: '+1 415 555 0142', createdAt: ago(38 * DAY) },
      { id: 'ct_2', name: 'Tomás Rivera', email: 'tomas@northwindrobotics.com', title: 'Head of Sales', companyId: 'co_1', leadStatus: 'Converted', owner: 'u_me', source: 'Referral', phone: '', createdAt: ago(30 * DAY) },
      { id: 'ct_3', name: 'Grace Okafor', email: 'grace@bluefin.io', title: 'CEO', companyId: 'co_2', leadStatus: 'SQL', owner: 'u_2', source: 'LinkedIn form', phone: '', createdAt: ago(34 * DAY) },
      { id: 'ct_4', name: 'Hiro Tanaka', email: 'hiro@cascadehealth.org', title: 'Director of RevOps', companyId: 'co_3', leadStatus: 'MQL', owner: 'u_me', source: 'Outbound', phone: '', createdAt: ago(29 * DAY) },
      { id: 'ct_5', name: 'Sam Whitfield', email: 'sam@orbitalfreight.com', title: 'COO', companyId: 'co_4', leadStatus: 'SQL', owner: 'u_2', source: 'Referral', phone: '', createdAt: ago(25 * DAY) },
      { id: 'ct_6', name: 'Ava Lindqvist', email: 'ava@pixelfold.app', title: 'Co-founder', companyId: 'co_5', leadStatus: 'Nurture', owner: 'u_3', source: 'YC S26 Demo Day', phone: '', createdAt: ago(21 * DAY) },
      { id: 'ct_7', name: 'Marcus Bell', email: 'marcus@meridiancap.com', title: 'Managing Director', companyId: 'co_6', leadStatus: 'Converted', owner: 'u_me', source: 'Inbound', phone: '', createdAt: ago(19 * DAY) },
      { id: 'ct_8', name: 'Nadia Haddad', email: 'nadia@meridiancap.com', title: 'Head of Platform', companyId: 'co_6', leadStatus: 'SQL', owner: 'u_me', source: 'Inbound', phone: '', createdAt: ago(12 * DAY) },
      { id: 'ct_9', name: 'Owen Fitzgerald', email: 'owen@sproutlearning.co', title: 'Founder', companyId: 'co_7', leadStatus: 'SQL', owner: 'u_3', source: 'Cal.com demo', phone: '', createdAt: ago(16 * DAY) },
      { id: 'ct_10', name: 'Lucía Fernández', email: 'lucia@tidewater-energy.com', title: 'VP Commercial', companyId: 'co_8', leadStatus: 'New', owner: 'u_2', source: 'Outbound', phone: '', createdAt: ago(13 * DAY) },
      { id: 'ct_11', name: 'Ben Adeyemi', email: 'ben@lumenlabs.ai', title: 'CTO', companyId: 'co_9', leadStatus: 'SQL', owner: 'u_me', source: 'YC S26 Demo Day', phone: '', createdAt: ago(10 * DAY) },
      { id: 'ct_12', name: 'Chloe Dubois', email: 'chloe@lumenlabs.ai', title: 'Head of Growth', companyId: 'co_9', leadStatus: 'MQL', owner: 'u_me', source: 'YC S26 Demo Day', phone: '', createdAt: ago(9 * DAY) },
      { id: 'ct_13', name: 'Rafael Costa', email: 'rafael@harborandvine.com', title: 'GM', companyId: 'co_10', leadStatus: 'Converted', owner: 'u_4', source: 'Referral', phone: '', createdAt: ago(8 * DAY) },
      { id: 'ct_14', name: 'Ingrid Solberg', email: 'ingrid@quilllegal.com', title: 'Partner', companyId: 'co_11', leadStatus: 'MQL', owner: 'u_3', source: 'LinkedIn form', phone: '', createdAt: ago(4 * DAY) },
      { id: 'ct_15', name: 'Kwame Mensah', email: 'kwame@atlasfield.co', title: 'VP Sales', companyId: 'co_12', leadStatus: 'SQL', owner: 'u_me', source: 'Cal.com demo', phone: '', createdAt: ago(2 * DAY) },
      { id: 'ct_16', name: 'Yuki Sato', email: 'yuki@atlasfield.co', title: 'Sales Ops Lead', companyId: 'co_12', leadStatus: 'New', owner: 'u_me', source: 'Cal.com demo', phone: '', createdAt: ago(1 * DAY) },
      { id: 'ct_17', name: 'Daniel Brooks', email: 'daniel@cascadehealth.org', title: 'CFO', companyId: 'co_3', leadStatus: 'New', owner: 'u_me', source: 'Outbound', phone: '', createdAt: ago(20 * HOUR) },
      { id: 'ct_18', name: 'Sofia Rossi', email: 'sofia@bluefin.io', title: 'Head of Marketing', companyId: 'co_2', leadStatus: 'Nurture', owner: 'u_2', source: 'LinkedIn form', phone: '', createdAt: ago(6 * HOUR) },
      { id: 'ct_19', name: 'Leo Hartmann', email: 'leo@orbitalfreight.com', title: 'Director of Ops', companyId: 'co_4', leadStatus: 'Disqualified', owner: 'u_2', source: 'Referral', phone: '', createdAt: ago(5 * DAY) },
      { id: 'ct_20', name: 'Amara Singh', email: 'amara@tidewater-energy.com', title: 'Procurement Manager', companyId: 'co_8', leadStatus: 'New', owner: 'u_2', source: 'Outbound', phone: '', createdAt: ago(3 * HOUR) },
    ];

    const opportunities = [
      { id: 'op_1', name: 'Northwind Robotics — Expansion', companyId: 'co_1', stage: 'Negotiation', amount: 36000, owner: 'u_me', closeDate: ahead(12 * DAY), qualifiedAt: ago(20 * DAY), createdAt: ago(30 * DAY), nextStep: 'Send redlined MSA' },
      { id: 'op_2', name: 'Bluefin Analytics — Team plan', companyId: 'co_2', stage: 'Proposal', amount: 14400, owner: 'u_2', closeDate: ahead(20 * DAY), qualifiedAt: ago(15 * DAY), createdAt: ago(26 * DAY), nextStep: 'Pricing review with Grace' },
      { id: 'op_3', name: 'Cascade Health — Pilot', companyId: 'co_3', stage: 'Discovery', amount: 60000, owner: 'u_me', closeDate: ahead(45 * DAY), qualifiedAt: null, createdAt: ago(18 * DAY), nextStep: 'Security questionnaire' },
      { id: 'op_4', name: 'Orbital Freight — Ops rollout', companyId: 'co_4', stage: 'Qualified', amount: 42000, owner: 'u_2', closeDate: ahead(30 * DAY), qualifiedAt: ago(6 * DAY), createdAt: ago(14 * DAY), nextStep: 'Technical deep dive' },
      { id: 'op_5', name: 'Meridian Capital — Platform', companyId: 'co_6', stage: 'Won', amount: 120000, owner: 'u_me', closeDate: ago(3 * DAY), qualifiedAt: ago(14 * DAY), createdAt: ago(19 * DAY), nextStep: 'Kickoff scheduled' },
      { id: 'op_6', name: 'Sprout Learning — Starter', companyId: 'co_7', stage: 'Proposal', amount: 7200, owner: 'u_3', closeDate: ahead(9 * DAY), qualifiedAt: ago(8 * DAY), createdAt: ago(12 * DAY), nextStep: 'Follow up on proposal' },
      { id: 'op_7', name: 'Lumen Labs — Growth', companyId: 'co_9', stage: 'Qualified', amount: 24000, owner: 'u_me', closeDate: ahead(25 * DAY), qualifiedAt: ago(3 * DAY), createdAt: ago(9 * DAY), nextStep: 'Demo for eng team' },
      { id: 'op_8', name: 'Harbor & Vine — Renewal', companyId: 'co_10', stage: 'Won', amount: 9000, owner: 'u_4', closeDate: ago(7 * DAY), qualifiedAt: ago(20 * DAY), createdAt: ago(30 * DAY), nextStep: '' },
      { id: 'op_9', name: 'Tidewater Energy — Enterprise', companyId: 'co_8', stage: 'Discovery', amount: 180000, owner: 'u_2', closeDate: ahead(90 * DAY), qualifiedAt: null, createdAt: ago(10 * DAY), nextStep: 'Intro to VP Commercial' },
      { id: 'op_10', name: 'Pixelfold — Starter', companyId: 'co_5', stage: 'Lost', amount: 3600, owner: 'u_3', closeDate: ago(2 * DAY), qualifiedAt: ago(15 * DAY), createdAt: ago(20 * DAY), nextStep: '' },
      { id: 'op_11', name: 'Atlas Field Services — Sales team', companyId: 'co_12', stage: 'Qualified', amount: 30000, owner: 'u_me', closeDate: ahead(35 * DAY), qualifiedAt: ago(1 * DAY), createdAt: ago(2 * DAY), nextStep: 'Send recap + pricing' },
    ];

    const meetings = [
      { id: 'mt_1', title: 'Atlas Field Services — Demo', startsAt: snap(ago(2 * DAY + 3 * HOUR)), durationMin: 45, attendeeIds: ['ct_15', 'ct_16'], internalIds: ['u_me'], external: true, recorded: true, status: 'processed', companyId: 'co_12',
        summary: 'Kwame and Yuki walked through their current outbound process, which lives across three spreadsheets and a shared inbox. Main pain: reps forget follow-ups after calls and pipeline reviews take two hours every Monday. They liked automatic recap emails and the review queue. Budget exists for this quarter; Kwame owns the decision with Yuki as champion.',
        followups: ['Send recap email with pricing tiers', 'Share security overview doc', 'Book technical deep dive with sales ops'], transcriptLines: 412 },
      { id: 'mt_2', title: 'Lumen Labs — Growth kickoff', startsAt: snap(ago(3 * DAY + 5 * HOUR)), durationMin: 30, attendeeIds: ['ct_11', 'ct_12'], internalIds: ['u_me', 'u_2'], external: true, recorded: true, status: 'processed', companyId: 'co_9',
        summary: 'Ben wants the eng team to see the automation builder before committing. Chloe is focused on lead routing from their LinkedIn campaigns. Agreed on a 2-week evaluation with a success metric of cutting response time on inbound leads under 10 minutes.',
        followups: ['Schedule demo for eng team', 'Set up LinkedIn form automation in their workspace'], transcriptLines: 288 },
      { id: 'mt_3', title: 'Weekly pipeline review', startsAt: snap(ago(1 * DAY + 2 * HOUR)), durationMin: 30, attendeeIds: [], internalIds: ['u_me', 'u_2', 'u_3', 'u_4'], external: false, recorded: false, status: 'not_recorded', companyId: null, summary: '', followups: [], transcriptLines: 0 },
      { id: 'mt_4', title: 'Cascade Health — Security review', startsAt: snap(ahead(2 * HOUR)), durationMin: 60, attendeeIds: ['ct_4', 'ct_17'], internalIds: ['u_me'], external: true, recorded: false, status: 'upcoming', companyId: 'co_3', summary: '', followups: [], transcriptLines: 0 },
      { id: 'mt_5', title: 'Bluefin Analytics — Pricing review', startsAt: snap(ahead(1 * DAY + 4 * HOUR)), durationMin: 30, attendeeIds: ['ct_3'], internalIds: ['u_2'], external: true, recorded: false, status: 'upcoming', companyId: 'co_2', summary: '', followups: [], transcriptLines: 0 },
      { id: 'mt_6', title: 'Northwind Robotics — Contract call', startsAt: snap(ahead(2 * DAY + 1 * HOUR)), durationMin: 30, attendeeIds: ['ct_1', 'ct_2'], internalIds: ['u_me'], external: true, recorded: false, status: 'upcoming', companyId: 'co_1', summary: '', followups: [], transcriptLines: 0 },
      { id: 'mt_7', title: 'Orbital Freight — Technical deep dive', startsAt: snap(ago(6 * DAY)), durationMin: 60, attendeeIds: ['ct_5', 'ct_19'], internalIds: ['u_2', 'u_me'], external: true, recorded: true, status: 'processed', companyId: 'co_4',
        summary: 'Sam is bought in on the ops rollout. Leo raised concerns about data residency and is not the decision maker; Sam confirmed he owns the budget. Next step is a technical deep dive with their IT lead.',
        followups: ['Send data residency FAQ', 'Loop in IT lead for deep dive'], transcriptLines: 520 },
      { id: 'mt_8', title: '1:1 Justin / Maya', startsAt: snap(ahead(3 * DAY)), durationMin: 30, attendeeIds: [], internalIds: ['u_me', 'u_2'], external: false, recorded: false, status: 'upcoming', companyId: null, summary: '', followups: [], transcriptLines: 0 },
      { id: 'mt_9', title: 'Sprout Learning — Proposal walkthrough', startsAt: snap(ago(4 * DAY + 2 * HOUR)), durationMin: 30, attendeeIds: ['ct_9'], internalIds: ['u_3'], external: true, recorded: true, status: 'recorded', companyId: 'co_7', summary: '', followups: [], transcriptLines: 240 },
    ];

    const mkRuns = (count, lastRunAgoMs, failIdx) => {
      const runs = [];
      for (let i = 0; i < count; i++) {
        const ts = ago(lastRunAgoMs + i * (37 * MIN + (i % 5) * 9 * MIN));
        runs.push({ id: 'run_' + Math.random().toString(36).slice(2, 8), ts, status: i === failIdx ? 'failed' : 'success', durationMs: 1200 + (i * 731) % 6400, credits: +(0.1 + ((i * 7) % 5) * 0.05).toFixed(2) });
      }
      return runs;
    };

    const automations = [
      { id: 'au_1', name: 'Sync opportunity stage to support desk', status: 'Active', trigger: 'Webhook received', extraTriggers: 0, cadence: 'Event', createdBy: 'u_2', runProtection: true, credits: 0.1, runs: 214, lastRunAgo: 3 * MIN, lastFailed: null, description: 'When the support desk reports a new ticket for an account with an open opportunity, mirror the current opportunity stage into the ticket so support can prioritise deals in negotiation.', steps: ['Parse webhook payload', 'Find account by domain', 'Look up open opportunity', 'Update ticket custom field'] },
      { id: 'au_2', name: '[COST-TESTING] Post-meeting follow-up', status: 'Active', trigger: 'Meeting updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_me', runProtection: true, credits: 0.4, runs: 96, lastRunAgo: 3 * MIN, lastFailed: 2 * DAY, description: 'After an external meeting is processed, draft a follow-up email covering the agreed next steps and put it in the review queue for the meeting owner.', steps: ['Wait for transcript', 'Extract action items', 'Draft follow-up email', 'Add to review queue'] },
      { id: 'au_3', name: '[COST-TESTING] Deduplicate new contacts', status: 'Active', trigger: 'Contact created', extraTriggers: 0, cadence: 'Event', createdBy: 'u_me', runProtection: true, credits: 0.05, runs: 388, lastRunAgo: 5 * MIN, lastFailed: null, description: 'Whenever a contact is created, look for an existing contact with the same email or a close name match at the same company and merge the two, keeping the older record as the primary.', steps: ['Normalise email', 'Search existing contacts', 'Score name similarity', 'Merge duplicates'] },
      { id: 'au_4', name: 'Sync plan status to support desk on new issue', status: 'Active', trigger: 'Webhook received', extraTriggers: 0, cadence: 'Event', createdBy: 'u_2', runProtection: true, credits: 0.1, runs: 141, lastRunAgo: 3 * MIN, lastFailed: null, description: 'Tag new support issues with the account\'s plan tier so enterprise customers get routed to the priority queue.', steps: ['Parse webhook payload', 'Find account', 'Read plan tier', 'Update issue labels'] },
      { id: 'au_5', name: 'First-call recap emails', status: 'Active', trigger: 'Meeting updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_3', runProtection: true, credits: 0.35, runs: 52, lastRunAgo: 3 * MIN, lastFailed: null, description: 'For the first recorded call with a new account, draft a recap email that restates their pain points in their own words and proposes a concrete next step.', steps: ['Check this is first call with account', 'Summarise pain points', 'Draft recap', 'Add to review queue'] },
      { id: 'au_6', name: 'Backfill HDYHAU from meeting transcripts', status: 'Active', trigger: 'Meeting updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_me', runProtection: false, credits: 0.2, runs: 77, lastRunAgo: 3 * MIN, lastFailed: 9 * DAY, description: 'If a company has no "how did you hear about us" value, scan the transcript for a mention of the referral source and propose a value for review.', steps: ['Check HDYHAU is empty', 'Scan transcript', 'Propose value', 'Add to review queue'] },
      { id: 'au_7', name: 'Customer call Slack follow-up drafter', status: 'Active', trigger: 'Meeting updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_4', runProtection: true, credits: 0.3, runs: 63, lastRunAgo: 3 * MIN, lastFailed: null, description: 'After a call with an existing customer, draft a short Slack update for the shared customer channel with risks, asks, and wins.', steps: ['Check account is customer', 'Summarise call', 'Draft Slack message', 'Post to channel'] },
      { id: 'au_8', name: 'Follow-up call recap emails', status: 'Active', trigger: 'Meeting updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_3', runProtection: true, credits: 0.35, runs: 41, lastRunAgo: 3 * MIN, lastFailed: null, description: 'For second and later calls, draft a recap that references what changed since the previous conversation.', steps: ['Load previous meeting summaries', 'Diff decisions', 'Draft recap', 'Add to review queue'] },
      { id: 'au_9', name: 'Account Segment v2 (Agentic)', status: 'Active', trigger: 'Opportunity created', extraTriggers: 2, cadence: 'Event', createdBy: 'u_me', runProtection: true, credits: 0.6, runs: 118, lastRunAgo: 5 * MIN, lastFailed: null, description: 'Classify the account into SMB, Mid-market or Enterprise using headcount, funding and the opportunity amount, then set the segment field.', steps: ['Gather firmographics', 'Classify segment', 'Set segment field', 'Notify owner if changed'] },
      { id: 'au_10', name: 'Cal.com demo booked', status: 'Active', trigger: 'Webhook received', extraTriggers: 1, cadence: 'Event', createdBy: 'u_2', runProtection: true, credits: 0.2, runs: 670, lastRunAgo: 6 * MIN, lastFailed: null, description: 'Runs whenever Cal.com reports a new booking. For demo bookings made with a work email, it records a Demo with the attendee, timing, and their booking-form answers (how they heard about us, current CRM, funding, expected users), and links it to the attendee\'s company — creating that company if it is not already in the CRM. The first time a company ever books a demo, it is also added to the "Cal.com Demo Booked" campaign; repeat bookings record the demo only. It then puts the attendee on the Lead status pipeline at Sales qualified (SQL) and sets their AE — the account\'s owner where there is one, the Cal.com organizer otherwise — creating the contact when the booker is new to the CRM. Lead status never moves backwards, and a lead already marked Converted, Nurture or Disqualified is left alone. Bookings are ignored when they come from a personal email, an internal address, the partner domain, a non-demo event, or when the booking looks like an internal test (words like test, test run, dummy, sample, ignore, QA, staging, or sandbox in the event title, attendee name, email, or notes). A repeated delivery of the same booking never creates a duplicate.', steps: ['Validate booking payload', 'Reject personal / internal / test bookings', 'Find or create company', 'Record demo', 'Find or create contact', 'Set lead status to SQL', 'Assign AE'] },
      { id: 'au_11', name: 'Leads | LinkedIn Form', status: 'Active', trigger: 'Webhook received', extraTriggers: 0, cadence: 'Event', createdBy: 'u_3', runProtection: true, credits: 0.15, runs: 231, lastRunAgo: 3 * HOUR, lastFailed: null, description: 'Create or update a contact and company from LinkedIn lead-gen form submissions and mark them MQL.', steps: ['Parse form fields', 'Find or create company', 'Find or create contact', 'Set lead status to MQL'] },
      { id: 'au_12', name: '[COST-TESTING] Account research', status: 'Active', trigger: 'Account created', extraTriggers: 0, cadence: 'Event', createdBy: 'u_me', runProtection: true, credits: 0.8, runs: 58, lastRunAgo: 5 * MIN, lastFailed: 1 * DAY, description: 'Research a newly created account: what they do, recent news, and likely use cases. Save the result as a knowledge note attached to the account.', steps: ['Fetch company website', 'Summarise offering', 'Find recent news', 'Write knowledge note'] },
      { id: 'au_13', name: 'Enrich new accounts from data provider', status: 'Active', trigger: 'Account created', extraTriggers: 1, cadence: 'Event', createdBy: 'u_2', runProtection: true, credits: 0.25, runs: 130, lastRunAgo: 5 * MIN, lastFailed: null, description: 'Fill industry, headcount and funding stage from the enrichment provider when an account is created without them.', steps: ['Check missing fields', 'Call enrichment API', 'Write fields'] },
      { id: 'au_14', name: '[Product] Paywall dropoff', status: 'Active', trigger: 'Webhook received', extraTriggers: 0, cadence: 'Event', createdBy: 'u_4', runProtection: true, credits: 0.1, runs: 402, lastRunAgo: 1 * MIN, lastFailed: null, description: 'When a product user hits the paywall and abandons, create a Nurture contact and notify the owner if the account has an open opportunity.', steps: ['Parse product event', 'Find or create contact', 'Set lead status to Nurture', 'Notify owner'] },
      { id: 'au_15', name: 'Billing subscription created', status: 'Active', trigger: 'Webhook received', extraTriggers: 0, cadence: 'Event', createdBy: 'u_2', runProtection: true, credits: 0.1, runs: 89, lastRunAgo: 21 * MIN, lastFailed: null, description: 'Mark the opportunity Won and set ARR on the account when billing reports a new subscription.', steps: ['Parse subscription', 'Find account', 'Set ARR', 'Mark opportunity Won'] },
      { id: 'au_16', name: 'Billing customer created', status: 'Active', trigger: 'Webhook received', extraTriggers: 0, cadence: 'Event', createdBy: 'u_2', runProtection: true, credits: 0.05, runs: 91, lastRunAgo: 21 * MIN, lastFailed: null, description: 'Link a new billing customer to its CRM account by domain.', steps: ['Parse customer', 'Match account by domain', 'Store billing id'] },
      { id: 'au_17', name: '[COST-TESTING] Slack notification on won', status: 'Active', trigger: 'Opportunity updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_me', runProtection: true, credits: 0.05, runs: 12, lastRunAgo: 24 * HOUR, lastFailed: null, description: 'Post a celebratory message to #wins when an opportunity moves to Won.', steps: ['Check stage changed to Won', 'Compose message', 'Post to Slack'] },
      { id: 'au_18', name: 'Set qualified opportunity date when entering Qualified', status: 'Active', trigger: 'Opportunity updated', extraTriggers: 0, cadence: 'Event', createdBy: 'u_me', runProtection: true, credits: 0.02, runs: 44, lastRunAgo: 24 * HOUR, lastFailed: null, description: 'Stamp the qualified date the first time an opportunity enters the Qualified stage.', steps: ['Check stage is Qualified', 'Check date empty', 'Set qualified date'] },
      { id: 'au_19', name: 'Weekly pipeline digest', status: 'Paused', trigger: 'Schedule', extraTriggers: 0, cadence: 'Weekly, Monday 8:00', createdBy: 'u_me', runProtection: false, credits: 0.5, runs: 9, lastRunAgo: 8 * DAY, lastFailed: null, description: 'Every Monday, summarise stage changes, new opportunities and slipped close dates from the previous week and email the digest to the sales team.', steps: ['Query last 7 days of changes', 'Summarise', 'Send email'] },
      { id: 'au_20', name: 'Stale opportunity nudge', status: 'Active', trigger: 'Schedule', extraTriggers: 0, cadence: 'Daily, 9:00', createdBy: 'u_3', runProtection: true, credits: 0.1, runs: 33, lastRunAgo: 13 * HOUR, lastFailed: null, description: 'Nudge the owner of any open opportunity with no activity in 14 days and suggest a next step based on the last meeting.', steps: ['Find stale opportunities', 'Draft nudge', 'Notify owner'] },
    ].map((a) => ({
      ...a,
      lastRun: ago(a.lastRunAgo),
      lastFailed: a.lastFailed ? ago(a.lastFailed) : null,
      runLog: mkRuns(8, a.lastRunAgo, a.lastFailed ? 3 : -1),
      createdAt: ago(60 * DAY - (parseInt(a.id.split('_')[1], 10) * DAY)),
    }));

    const reviews = [
      { id: 'rv_1', type: 'field_update', title: 'Move Atlas Field Services opportunity to Proposal', objectType: 'opportunity', objectId: 'op_11', field: 'stage', from: 'Qualified', to: 'Proposal', reason: 'Kwame asked for pricing tiers and confirmed budget for this quarter.', sourceMeetingId: 'mt_1', status: 'pending', createdAt: ago(2 * DAY) },
      { id: 'rv_2', type: 'email_draft', title: 'Recap email to Kwame Mensah', objectType: 'contact', objectId: 'ct_15', draft: 'Hi Kwame,\n\nThanks for walking us through how Atlas runs outbound today. To recap what we heard: follow-ups slip after calls, and Monday pipeline reviews take about two hours across three spreadsheets.\n\nHere is what we discussed as next steps:\n1. Pricing tiers (attached)\n2. Security overview\n3. A technical deep dive with Yuki and sales ops\n\nDoes Thursday or Friday work for the deep dive?\n\nBest,\nJustin', reason: 'Generated by "First-call recap emails".', sourceMeetingId: 'mt_1', status: 'pending', createdAt: ago(2 * DAY) },
      { id: 'rv_3', type: 'field_update', title: 'Update Yuki Sato title', objectType: 'contact', objectId: 'ct_16', field: 'title', from: 'Sales Ops Lead', to: 'Head of Sales Operations', reason: 'Yuki introduced herself as Head of Sales Operations on the call.', sourceMeetingId: 'mt_1', status: 'pending', createdAt: ago(2 * DAY) },
      { id: 'rv_4', type: 'field_update', title: 'Set Lumen Labs close date', objectType: 'opportunity', objectId: 'op_7', field: 'closeDate', from: null, to: ahead(16 * DAY), reason: 'Ben agreed to a 2-week evaluation, so the decision lands around then.', sourceMeetingId: 'mt_2', status: 'pending', createdAt: ago(3 * DAY) },
      { id: 'rv_5', type: 'field_update', title: 'Move Chloe Dubois to SQL', objectType: 'contact', objectId: 'ct_12', field: 'leadStatus', from: 'MQL', to: 'SQL', reason: 'Chloe is actively evaluating lead routing and joined the kickoff.', sourceMeetingId: 'mt_2', status: 'pending', createdAt: ago(3 * DAY) },
      { id: 'rv_6', type: 'email_draft', title: 'Recap email to Ben Adeyemi', objectType: 'contact', objectId: 'ct_11', draft: 'Hi Ben,\n\nGreat to kick things off today. We agreed on a two-week evaluation with one goal: inbound leads answered in under 10 minutes.\n\nNext steps on our side:\n- Demo of the automation builder for your eng team\n- LinkedIn form routing set up in your workspace\n\nI will send a couple of slots for the eng demo shortly.\n\nJustin', reason: 'Generated by "First-call recap emails".', sourceMeetingId: 'mt_2', status: 'pending', createdAt: ago(3 * DAY) },
      { id: 'rv_7', type: 'field_update', title: 'Set Orbital Freight next step', objectType: 'opportunity', objectId: 'op_4', field: 'nextStep', from: 'Technical deep dive', to: 'Technical deep dive with IT lead (data residency)', reason: 'Leo raised data residency; Sam wants IT present.', sourceMeetingId: 'mt_7', status: 'pending', createdAt: ago(6 * DAY) },
      { id: 'rv_8', type: 'field_update', title: 'Disqualify Leo Hartmann as decision maker', objectType: 'contact', objectId: 'ct_19', field: 'leadStatus', from: 'Disqualified', to: 'Nurture', reason: 'Leo is an influencer, not a blocker. Keep in nurture rather than disqualified.', sourceMeetingId: 'mt_7', status: 'pending', createdAt: ago(6 * DAY) },
      { id: 'rv_9', type: 'field_update', title: 'Set Northwind Robotics source', objectType: 'company', objectId: 'co_1', field: 'source', from: 'Cal.com demo', to: 'Referral from Meridian Capital', reason: 'Elena mentioned Marcus at Meridian recommended us. Found by "Backfill HDYHAU".', sourceMeetingId: null, status: 'pending', createdAt: ago(5 * DAY) },
      { id: 'rv_10', type: 'new_contact', title: 'Add new contact: Priyanka Rao at Cascade Health', objectType: 'contact', objectId: null, payload: { name: 'Priyanka Rao', email: 'priyanka@cascadehealth.org', title: 'Security Lead', companyId: 'co_3', leadStatus: 'New', owner: 'u_me', source: 'Meeting invite' }, reason: 'Added to the upcoming security review invite but not in the CRM.', sourceMeetingId: 'mt_4', status: 'pending', createdAt: ago(20 * HOUR) },
      { id: 'rv_11', type: 'field_update', title: 'Set Quill Legal industry', objectType: 'company', objectId: 'co_11', field: 'industry', from: 'Legal', to: 'Legal services', reason: 'Normalised by "Enrich new accounts".', sourceMeetingId: null, status: 'pending', createdAt: ago(4 * DAY) },
      { id: 'rv_12', type: 'field_update', title: 'Move Sprout Learning to Negotiation', objectType: 'opportunity', objectId: 'op_6', field: 'stage', from: 'Proposal', to: 'Negotiation', reason: 'Owen replied asking for annual pricing.', sourceMeetingId: 'mt_9', status: 'pending', createdAt: ago(4 * DAY) },
      { id: 'rv_13', type: 'email_draft', title: 'Follow-up to Owen Fitzgerald', objectType: 'contact', objectId: 'ct_9', draft: 'Hi Owen,\n\nFollowing up on the proposal walkthrough. Attached is the annual pricing you asked about, which includes two months free.\n\nHappy to jump on a quick call this week if it helps.\n\nDevin', reason: 'Generated by "Follow-up call recap emails".', sourceMeetingId: 'mt_9', status: 'pending', createdAt: ago(4 * DAY) },
    ];

    const tasks = [
      { id: 'tk_1', title: 'Send recap email with pricing tiers to Kwame', due: ahead(3 * HOUR), done: false, objectType: 'company', objectId: 'co_12', meetingId: 'mt_1' },
      { id: 'tk_2', title: 'Share security overview doc with Atlas', due: ahead(1 * DAY), done: false, objectType: 'company', objectId: 'co_12', meetingId: 'mt_1' },
      { id: 'tk_3', title: 'Schedule demo for Lumen Labs eng team', due: ahead(1 * DAY + 6 * HOUR), done: false, objectType: 'company', objectId: 'co_9', meetingId: 'mt_2' },
      { id: 'tk_4', title: 'Send redlined MSA to Northwind Robotics', due: ago(4 * HOUR), done: false, objectType: 'opportunity', objectId: 'op_1', meetingId: null },
      { id: 'tk_5', title: 'Prep security questionnaire answers for Cascade', due: ahead(1 * HOUR), done: false, objectType: 'company', objectId: 'co_3', meetingId: 'mt_4' },
      { id: 'tk_6', title: 'Send data residency FAQ to Orbital Freight', due: ago(2 * DAY), done: true, objectType: 'company', objectId: 'co_4', meetingId: 'mt_7' },
      { id: 'tk_7', title: 'Kickoff plan for Meridian Capital', due: ahead(4 * DAY), done: false, objectType: 'company', objectId: 'co_6', meetingId: null },
    ];

    const chats = [
      { id: 'ch_1', title: 'Create a dashboard using pipeline data', createdAt: ago(2 * HOUR), messages: [
        { role: 'user', text: 'Create a dashboard using my pipeline data', ts: ago(2 * HOUR) },
        { role: 'assistant', text: 'Here is a snapshot of your open pipeline.\n\n| Stage | Deals | Amount |\n|---|---|---|\n| Discovery | 2 | $240,000 |\n| Qualified | 3 | $96,000 |\n| Proposal | 2 | $21,600 |\n| Negotiation | 1 | $36,000 |\n\nOpen pipeline totals $393,600 across 8 deals. Your largest risk is Tidewater Energy, which has no qualified date and a close date 90 days out.', ts: ago(2 * HOUR) + 5000 },
      ] },
      { id: 'ch_2', title: 'draft me a recap email with Atlas', createdAt: ago(1 * DAY), messages: [
        { role: 'user', text: 'draft me a recap email with Atlas Field Services', ts: ago(1 * DAY) },
        { role: 'assistant', text: 'Drafted a recap for Kwame based on the demo on ' + new Date(ago(2 * DAY + 3 * HOUR)).toLocaleDateString() + '. It is waiting in For review so you can edit before sending.', ts: ago(1 * DAY) + 4000 },
      ] },
      { id: 'ch_3', title: 'Can you draft me an intro to Tidewater', createdAt: ago(3 * DAY), messages: [
        { role: 'user', text: 'Can you draft me an intro to Tidewater Energy', ts: ago(3 * DAY) },
        { role: 'assistant', text: 'Here is a short intro to Lucía Fernández (VP Commercial):\n\nHi Lucía,\n\nWe help commercial teams at energy companies keep their CRM accurate without reps typing after every call. Teams like Meridian Capital use us to cut pipeline review prep from hours to minutes.\n\nWould a 20 minute walkthrough next week be useful?\n\nJustin', ts: ago(3 * DAY) + 4000 },
      ] },
      { id: 'ch_4', title: 'give me all the information on Northwind', createdAt: ago(5 * DAY), messages: [
        { role: 'user', text: 'give me all the information on Northwind Robotics', ts: ago(5 * DAY) },
        { role: 'assistant', text: 'Northwind Robotics is a Mid-market robotics company (51-200 people, Series A) owned by Justin Lu. Contacts: Elena Marsh (VP Operations), Tomás Rivera (Head of Sales). One open opportunity: Northwind Robotics — Expansion at $36,000 in Negotiation. ARR: $48,000.', ts: ago(5 * DAY) + 4000 },
      ] },
    ];

    const lists = [
      { id: 'ls_1', name: 'Series A launch targets', objectType: 'company', section: 'favorites', filter: { funding: 'Series A' }, createdAt: ago(20 * DAY) },
      { id: 'ls_2', name: 'Mktg Leads: Paid Ads Leads', objectType: 'contact', section: 'favorites', filter: { source: 'LinkedIn form' }, createdAt: ago(18 * DAY) },
      { id: 'ls_3', name: 'Enterprise upsell', objectType: 'company', section: 'favorites', filter: { segment: 'Enterprise' }, createdAt: ago(15 * DAY) },
      { id: 'ls_4', name: 'YC S26 Demo Day — B2B ICP', objectType: 'company', section: 'demand', filter: { source: 'YC S26 Demo Day' }, createdAt: ago(12 * DAY) },
      { id: 'ls_5', name: 'Austin September 2026', objectType: 'contact', section: 'demand', filter: { leadStatus: 'New' }, createdAt: ago(10 * DAY) },
      { id: 'ls_6', name: 'Series A launch target contacts', objectType: 'contact', section: 'demand', filter: { companyFunding: 'Series A' }, createdAt: ago(9 * DAY) },
      { id: 'ls_7', name: "GC's prospect list", objectType: 'contact', section: 'demand', filter: { source: 'Outbound' }, createdAt: ago(7 * DAY) },
      { id: 'ls_8', name: 'COLD: B2B startups seed', objectType: 'company', section: 'demand', filter: { funding: 'Seed' }, createdAt: ago(6 * DAY) },
      { id: 'ls_9', name: 'Referral prospecting list', objectType: 'contact', section: 'demand', filter: { source: 'Referral' }, createdAt: ago(5 * DAY) },
    ];

    const knowledge = [
      { id: 'kn_1', title: 'Ideal customer profile', body: 'We sell to B2B sales teams of 5 to 50 reps at companies between Seed and Series C. The buyer is usually a Head of Sales or RevOps lead. The strongest signal is a team already running weekly pipeline reviews from spreadsheets.', updatedAt: ago(6 * DAY), tags: ['sales'] },
      { id: 'kn_2', title: 'Pricing', body: 'Starter: $600/mo up to 5 seats. Team: $1,200/mo up to 15 seats. Enterprise: custom, includes SSO, audit log and dedicated support. Annual prepay gets two months free. Discounts beyond that need approval from Justin.', updatedAt: ago(9 * DAY), tags: ['sales', 'pricing'] },
      { id: 'kn_3', title: 'Lead status definitions', body: 'New: created, nobody has spoken to them. MQL: engaged with marketing. SQL: sales accepted, a meeting is booked or happened. Nurture: not now, revisit later. Converted: an opportunity exists. Disqualified: not a fit. Status never moves backwards automatically.', updatedAt: ago(14 * DAY), tags: ['process'] },
      { id: 'kn_4', title: 'Security overview', body: 'SOC 2 Type II in progress (audit window ends December). Data is encrypted at rest and in transit. Meeting recordings are retained for 90 days by default and can be deleted per meeting. EU data residency available on Enterprise.', updatedAt: ago(3 * DAY), tags: ['security'] },
      { id: 'kn_5', title: 'Objection handling: "we already use spreadsheets"', body: 'Acknowledge that spreadsheets work until the team grows. Ask how long pipeline review prep takes each week. Show the review queue: updates are proposed from calls and approved in one click, so the CRM stays accurate without extra typing.', updatedAt: ago(11 * DAY), tags: ['sales'] },
    ];

    const skills = [
      { id: 'sk_1', name: 'Draft recap email', description: 'Writes a recap email from a processed meeting, restating pain points in the customer\'s words and listing agreed next steps.', enabled: true, uses: 84 },
      { id: 'sk_2', name: 'Propose record updates', description: 'Reads a transcript and proposes changes to contact, company and opportunity fields for review.', enabled: true, uses: 212 },
      { id: 'sk_3', name: 'Account research', description: 'Researches a company from its website and recent news and writes a knowledge note.', enabled: true, uses: 58 },
      { id: 'sk_4', name: 'Pipeline dashboard', description: 'Summarises open pipeline by stage and owner, and flags deals with no next step or a slipped close date.', enabled: true, uses: 31 },
      { id: 'sk_5', name: 'Intro email', description: 'Drafts a cold intro to a contact using their title, company and any shared references in the CRM.', enabled: true, uses: 19 },
      { id: 'sk_6', name: 'Slack channel update', description: 'Writes a short customer update for a shared Slack channel with wins, risks and asks.', enabled: false, uses: 12 },
    ];

    const notes = [
      { id: 'nt_1', objectType: 'company', objectId: 'co_1', text: 'Elena wants the expansion signed before their board meeting on the 5th.', authorId: 'u_me', createdAt: ago(5 * DAY) },
      { id: 'nt_2', objectType: 'company', objectId: 'co_6', text: 'Kickoff with Marcus and Nadia. They want SSO live in week one.', authorId: 'u_me', createdAt: ago(2 * DAY) },
      { id: 'nt_3', objectType: 'opportunity', objectId: 'op_9', text: 'Long procurement cycle. Amara is the procurement contact, Lucía is the sponsor.', authorId: 'u_2', createdAt: ago(1 * DAY) },
    ];

    return {
      version: 1,
      settings: {
        onboarded: false,
        theme: 'dark',
        recording: 'external',
        workspace: 'Holography',
        userId: 'u_me',
        oppView: 'table',
      },
      users, companies, contacts, opportunities, meetings, automations, reviews, tasks, chats, lists, knowledge, skills, notes,
      activity: [],
    };
  };
})();
