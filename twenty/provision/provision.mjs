#!/usr/bin/env node
// Provisions the Lightfield-style layer onto a running Twenty workspace, idempotently.
//
//   TWENTY_URL=http://localhost:3000 TWENTY_EMAIL=you@x.com TWENTY_PASSWORD=... node provision.mjs
//   TWENTY_URL=... TWENTY_API_KEY=... node provision.mjs           # works too; see README for the one limitation
//
// Flags: --only=objects,fields,role,agent,skills,workflows,records,views   --force-workflows   --grant-writes
//        --dry-run   --verbose
import { randomUUID } from 'node:crypto';
import { TwentyClient, env, log } from './twenty-client.mjs';
import { WORKSPACE, KNOWLEDGE, SKILLS, AUTOMATIONS, COMPANIES, PEOPLE, OPPORTUNITIES, NOTES, REVIEWS } from './definitions/content.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const ONLY = args.only ? String(args.only).split(',') : null;
const want = (step) => !ONLY || ONLY.includes(step);
const DRY = !!args['dry-run'];

import login from './login.mjs';

const URL = env('TWENTY_URL', 'http://localhost:3000').replace(/\/$/, '');
let token = process.env.TWENTY_API_KEY;
if (!token) {
  if (!process.env.TWENTY_EMAIL || !process.env.TWENTY_PASSWORD) { console.error('Set TWENTY_API_KEY, or TWENTY_EMAIL and TWENTY_PASSWORD.'); process.exit(1); }
  token = await login(URL, process.env.TWENTY_EMAIL, process.env.TWENTY_PASSWORD);
  log('info', `Signed in as ${process.env.TWENTY_EMAIL}`);
}
const api = new TwentyClient({ url: URL, apiKey: token, verbose: !!args.verbose });
const summary = { created: 0, updated: 0, skipped: 0, warnings: [] };
const created = (what) => { summary.created++; log('create', what); };
const skipped = (what) => { summary.skipped++; log('skip', what); };
const warn = (what) => { summary.warnings.push(what); log('warn', what); };

// ---------- metadata helpers ----------
const unwrap = (json, key) => (json && json.data && json.data[key] !== undefined ? json.data[key] : json);
async function loadObjects() {
  const json = await api.request('/rest/metadata/objects?limit=1000');
  const list = unwrap(json, 'objects');
  const objects = Array.isArray(list) ? list : [];
  const byName = {};
  objects.forEach((o) => { byName[o.nameSingular] = o; });
  return byName;
}
let OBJ = await loadObjects();
const fieldOf = (objectName, fieldName) => (OBJ[objectName]?.fields || []).find((f) => f.name === fieldName);

async function ensureObject(def) {
  if (OBJ[def.nameSingular]) { skipped(`object ${def.nameSingular}`); return OBJ[def.nameSingular]; }
  if (DRY) { created(`object ${def.nameSingular} (dry run)`); return { id: 'dry', nameSingular: def.nameSingular, fields: [] }; }
  const json = await api.request('/rest/metadata/objects', { method: 'POST', body: def });
  const obj = unwrap(json, 'createOneObject');
  created(`object ${def.nameSingular}`);
  OBJ = await loadObjects();
  return OBJ[def.nameSingular] || obj;
}
async function ensureField(objectName, def) {
  const obj = OBJ[objectName];
  if (!obj) throw new Error(`object ${objectName} not found`);
  const existing = fieldOf(objectName, def.name);
  if (existing) { skipped(`field ${objectName}.${def.name}`); return existing; }
  if (DRY) { created(`field ${objectName}.${def.name} (dry run)`); return { id: 'dry', name: def.name }; }
  const body = { objectMetadataId: obj.id, ...def };
  if (def.relationCreationPayload) body.relationCreationPayload = { ...def.relationCreationPayload, targetObjectMetadataId: OBJ[def.relationCreationPayload.targetObject].id };
  delete body.relationCreationPayload?.targetObject;
  const json = await api.request('/rest/metadata/fields', { method: 'POST', body });
  created(`field ${objectName}.${def.name}`);
  OBJ = await loadObjects();
  return unwrap(json, 'createOneField');
}
async function ensureSelectOptions(objectName, fieldName, options) {
  const f = fieldOf(objectName, fieldName);
  if (!f) { warn(`field ${objectName}.${fieldName} missing, cannot extend options`); return; }
  const have = new Set((f.options || []).map((o) => o.value));
  const missing = options.filter((o) => !have.has(o.value));
  if (!missing.length) { skipped(`options on ${objectName}.${fieldName}`); return; }
  if (DRY) { created(`options ${missing.map((o) => o.value).join(',')} on ${objectName}.${fieldName} (dry run)`); return; }
  const merged = (f.options || []).concat(missing.map((o, i) => ({ ...o, position: (f.options || []).length + i })));
  await api.request(`/rest/metadata/fields/${f.id}`, { method: 'PATCH', body: { options: merged } });
  created(`options ${missing.map((o) => o.value).join(', ')} on ${objectName}.${fieldName}`);
  OBJ = await loadObjects();
}
const sel = (name, label, values, icon) => ({ name, label, type: 'SELECT', icon, options: values.map(([value, lbl, color], i) => ({ value, label: lbl, color, position: i })) });
const txt = (name, label, icon, extra) => ({ name, label, type: 'TEXT', icon: icon || 'IconAbc', ...(extra || {}) });

// ---------- 1. objects ----------
if (want('objects')) {
  log('info', '— Objects');
  await ensureObject({ nameSingular: 'knowledge', namePlural: 'knowledges', labelSingular: 'Knowledge', labelPlural: 'Knowledge', icon: 'IconBook', description: 'Company facts and rules the agent grounds itself in before drafting or proposing changes.' });
  await ensureObject({ nameSingular: 'skill', namePlural: 'skills', labelSingular: 'Skill', labelPlural: 'Skills', icon: 'IconCube', description: 'Reusable playbooks. Each one is backed by a manual-trigger workflow with an AI step.' });
  await ensureObject({ nameSingular: 'review', namePlural: 'reviews', labelSingular: 'Review', labelPlural: 'For review', icon: 'IconChecklist', description: 'Changes and messages proposed by automations. Set status to APPROVED to apply, DISMISSED to drop.' });
}

// ---------- 2. fields ----------
if (want('fields')) {
  log('info', '— Fields');
  // Knowledge
  await ensureField('knowledge', sel('category', 'Category', [['SALES', 'Sales', 'blue'], ['PRICING', 'Pricing', 'green'], ['PROCESS', 'Process', 'purple'], ['SECURITY', 'Security', 'red'], ['RESEARCH', 'Research', 'orange'], ['OTHER', 'Other', 'gray']], 'IconTag'));
  await ensureField('knowledge', txt('body', 'Body', 'IconFileText', { settings: { displayedMaxRows: 10 } }));
  await ensureField('knowledge', { name: 'company', label: 'Company', type: 'RELATION', icon: 'IconBuildingSkyscraper', relationCreationPayload: { type: 'MANY_TO_ONE', targetObject: 'company', targetFieldLabel: 'Knowledge', targetFieldIcon: 'IconBook' } });
  // Skill
  await ensureField('skill', txt('key', 'Key', 'IconKey'));
  await ensureField('skill', txt('description', 'Description', 'IconFileText'));
  await ensureField('skill', txt('instructions', 'Instructions', 'IconListDetails', { settings: { displayedMaxRows: 12 } }));
  await ensureField('skill', { name: 'enabled', label: 'Enabled', type: 'BOOLEAN', icon: 'IconToggleRight', defaultValue: true });
  await ensureField('skill', txt('workflowId', 'Workflow id', 'IconSettingsAutomation'));
  await ensureField('skill', { name: 'runs', label: 'Runs', type: 'NUMBER', icon: 'IconPlayerPlay', defaultValue: 0 });
  // Review
  await ensureField('review', sel('reviewType', 'Type', [['FIELD_UPDATE', 'Field update', 'orange'], ['EMAIL_DRAFT', 'Email draft', 'purple'], ['SLACK_DRAFT', 'Slack draft', 'sky'], ['MERGE', 'Merge', 'yellow'], ['NEW_RECORD', 'New record', 'blue']], 'IconCategory'));
  await ensureField('review', sel('status', 'Status', [['PENDING', 'Pending', 'yellow'], ['APPROVED', 'Approved', 'green'], ['DISMISSED', 'Dismissed', 'gray'], ['APPLIED', 'Applied', 'turquoise'], ['FAILED', 'Failed', 'red']], 'IconProgressCheck'));
  await ensureField('review', txt('objectName', 'Object', 'IconCube'));
  await ensureField('review', txt('recordId', 'Record id', 'IconId'));
  await ensureField('review', txt('fieldName', 'Field', 'IconTag'));
  await ensureField('review', txt('fromValue', 'From', 'IconArrowLeft'));
  await ensureField('review', txt('toValue', 'To', 'IconArrowRight'));
  await ensureField('review', txt('draft', 'Draft', 'IconMail', { settings: { displayedMaxRows: 12 } }));
  await ensureField('review', txt('reason', 'Reason', 'IconInfoCircle'));
  await ensureField('review', txt('source', 'Source', 'IconLink'));
  await ensureField('review', txt('result', 'Result', 'IconCheck'));
  await ensureField('review', { name: 'company', label: 'Company', type: 'RELATION', icon: 'IconBuildingSkyscraper', relationCreationPayload: { type: 'MANY_TO_ONE', targetObject: 'company', targetFieldLabel: 'Reviews', targetFieldIcon: 'IconChecklist' } });
  await ensureField('review', { name: 'person', label: 'Person', type: 'RELATION', icon: 'IconUser', relationCreationPayload: { type: 'MANY_TO_ONE', targetObject: 'person', targetFieldLabel: 'Reviews', targetFieldIcon: 'IconChecklist' } });
  await ensureField('review', { name: 'opportunity', label: 'Opportunity', type: 'RELATION', icon: 'IconTargetArrow', relationCreationPayload: { type: 'MANY_TO_ONE', targetObject: 'opportunity', targetFieldLabel: 'Reviews', targetFieldIcon: 'IconChecklist' } });
  // Standard objects
  await ensureField('company', sel('segment', 'Segment', [['SMB', 'SMB', 'gray'], ['MID_MARKET', 'Mid-market', 'blue'], ['ENTERPRISE', 'Enterprise', 'purple']], 'IconChartPie'));
  await ensureField('company', txt('source', 'Source', 'IconWorld'));
  await ensureField('company', txt('billingCustomerId', 'Billing customer id', 'IconReceipt'));
  await ensureField('person', sel('leadStatus', 'Lead status', [['NEW', 'New', 'gray'], ['MQL', 'MQL', 'blue'], ['SQL', 'SQL', 'purple'], ['NURTURE', 'Nurture', 'yellow'], ['CONVERTED', 'Converted', 'green'], ['DISQUALIFIED', 'Disqualified', 'red']], 'IconProgress'));
  await ensureField('person', txt('source', 'Source', 'IconWorld'));
  await ensureField('opportunity', txt('nextStep', 'Next step', 'IconArrowRight'));
  await ensureField('opportunity', { name: 'qualifiedAt', label: 'Qualified at', type: 'DATE_TIME', icon: 'IconCalendarCheck' });
  await ensureSelectOptions('opportunity', 'stage', [
    { value: 'DISCOVERY', label: 'Discovery', color: 'gray' }, { value: 'QUALIFIED', label: 'Qualified', color: 'blue' }, { value: 'NEGOTIATION', label: 'Negotiation', color: 'orange' },
    { value: 'WON', label: 'Won', color: 'green' }, { value: 'LOST', label: 'Lost', color: 'red' },
  ]);
}

// ---------- 3. role ----------
const ROLE_LABEL = 'Lightfield Agent';
let role = null;
async function findRole() { const d = await api.metadata('{ getRoles { id label canBeAssignedToAgents } }'); return d.getRoles.find((r) => r.label === ROLE_LABEL) || null; }
if (want('role')) {
  log('info', '— Role');
  role = await findRole();
  if (role) skipped(`role "${ROLE_LABEL}"`);
  else if (DRY) created(`role "${ROLE_LABEL}" (dry run)`);
  else {
    const d = await api.metadata(`mutation($input: CreateRoleInput!) { createOneRole(createRoleInput: $input) { id label } }`, { input: {
      label: ROLE_LABEL, icon: 'IconRobot', description: 'What the Lightfield assistant and its automations may touch. Reads everything; writes only reviews, knowledge, notes and tasks unless widened.',
      canUpdateAllSettings: false, canAccessAllTools: false, canReadAllObjectRecords: true, canUpdateAllObjectRecords: false, canSoftDeleteAllObjectRecords: false, canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: false, canBeAssignedToAgents: true, canBeAssignedToApiKeys: true,
    } });
    role = d.createOneRole; created(`role "${ROLE_LABEL}"`);
  }
  if (role && !DRY) {
    const writable = ['review', 'knowledge', 'note', 'noteTarget', 'task', 'taskTarget', 'skill'].concat(args['grant-writes'] ? ['person', 'company', 'opportunity'] : []);
    const objectPermissions = writable.filter((n) => OBJ[n] && !OBJ[n].isSystem).map((n) => ({ objectMetadataId: OBJ[n].id, canReadObjectRecords: true, canUpdateObjectRecords: true, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false }));
    await api.metadata(`mutation($input: UpsertObjectPermissionsInput!) { upsertObjectPermissions(upsertObjectPermissionsInput: $input) { objectMetadataId canUpdateObjectRecords } }`, { input: { roleId: role.id, objectPermissions } });
    const flags = ['AI', 'HTTP_REQUEST_TOOL'].concat(args['grant-email'] ? ['SEND_EMAIL_TOOL'] : []);
    await api.metadata(`mutation($input: UpsertPermissionFlagsInput!) { upsertPermissionFlags(upsertPermissionFlagsInput: $input) { flag } }`, { input: { roleId: role.id, permissionFlagKeys: flags } });
    log('update', `role permissions: write ${writable.join(', ')}; flags ${flags.join(', ')}${args['grant-writes'] ? '' : ' (add --grant-writes to let automations write people, companies and opportunities directly)'}`);
  }
}

// ---------- 4. agent ----------
const AGENT_NAME = 'lightfieldAssistant';
const AGENT_PROMPT = `You are the ${WORKSPACE.name} sales assistant inside Twenty CRM, built to behave like Lightfield.

Ground rules
- Before drafting or proposing anything, read the Knowledge records (object "knowledge"): they hold the ideal customer profile, pricing, lead status definitions, security facts, objection handling and the rules you must follow.
- Always load the full customer context, not just the record that triggered you: the company, its people, open opportunities, the last notes and tasks.
- You never change customer records directly and never send messages yourself. You create a Review record (object "review") with status PENDING and reviewType one of FIELD_UPDATE (objectName, recordId, fieldName, fromValue, toValue), EMAIL_DRAFT (draft, person), SLACK_DRAFT (draft), MERGE or NEW_RECORD. A person approves it, and the "Apply approved review" workflow applies it.
- Lead status never moves backwards. Ignore bookings and leads from personal email domains, internal addresses, and anything that looks like a test.
- Keep emails under 150 words, plain and specific. Restate the customer's pain in their own words and end with one concrete next step.

Building automations with people
When someone asks you to create an automation, run the playbook: ask (1) what should happen, the outcome; (2) when it should run, a record change, a schedule, an inbound webhook or on demand; (3) what it can touch, which records to read and which it may write. Map the answers to a workflow trigger and steps, describe the permissions the steps need, and only then create it as a draft for them to test and activate.

Skills
Skill records (object "skill") hold reusable playbooks. When asked to run one, follow its instructions field exactly.`;
let agent = null;
async function findAgent() { const d = await api.metadata('{ findManyAgents { id name label modelId roleId } }'); return d.findManyAgents.find((a) => a.name === AGENT_NAME) || null; }
if (want('agent')) {
  log('info', '— Agent');
  agent = await findAgent();
  role = role || (await findRole());
  if (agent) {
    if (!DRY) await api.metadata(`mutation($input: UpdateAgentInput!) { updateOneAgent(input: $input) { id } }`, { input: { id: agent.id, prompt: AGENT_PROMPT, roleId: role ? role.id : undefined } });
    log('update', `agent "${AGENT_NAME}" prompt refreshed`);
  } else if (DRY) created(`agent "${AGENT_NAME}" (dry run)`);
  else {
    try {
      const d = await api.metadata(`mutation($input: CreateAgentInput!) { createOneAgent(input: $input) { id name } }`, { input: { name: AGENT_NAME, label: 'Lightfield assistant', icon: 'IconSparkles', description: 'Drafts, proposes record updates for review, runs skills and builds automations with you.', prompt: AGENT_PROMPT, modelId: process.env.TWENTY_MODEL_ID || 'default-smart-model', roleId: role ? role.id : undefined, responseFormat: { type: 'text' }, evaluationInputs: [] } });
      agent = d.createOneAgent; created(`agent "${AGENT_NAME}"`);
    } catch (e) { warn(`could not create agent (${e.message.split('\n')[0]}). Set an AI provider key on the server, or TWENTY_MODEL_ID, and re-run --only=agent.`); }
  }
}
agent = agent || (await findAgent());

// ---------- workflow builders ----------
const step = (type, name, input, extra) => ({ id: randomUUID(), name, type, valid: true, settings: { input, outputSchema: {}, errorHandlingOptions: { retryOnFailure: { value: false }, continueOnFailure: { value: false } } }, nextStepIds: [], ...(extra || {}) });
function contextPrefix(def) {
  const t = def.trigger;
  if (t.type === 'record') return `Trigger: a ${t.object} record was ${t.event}. Its id is {{trigger.object.id}}${t.object !== 'review' ? ' (name: {{trigger.object.name}})' : ' (title: {{trigger.object.title}}, status: {{trigger.object.status}})'}. Load it and its related records with your tools before doing anything. `;
  if (t.type === 'webhook') return 'Trigger: an inbound webhook. The payload fields are available as trigger variables; the raw payload was: {{trigger}}. ';
  if (t.type === 'cron') return `Trigger: schedule (${t.pattern}). `;
  return 'Trigger: run manually. ';
}
function buildSteps(def) {
  const steps = [];
  const prev = () => steps[steps.length - 1];
  let aiIdx = 0, httpIdx = 0;
  const names = {};
  def.steps.forEach((s) => {
    let st;
    let prompt = (s.prompt || '').replace(/\{\{trigger\.record\}\}/g, 'the record with id {{trigger.object.id}}').replace(/\{\{trigger\.body\}\}/g, '{{trigger}}');
    if (s.kind === 'ai') {
      const preface = steps.length === 0 ? contextPrefix(def) : '';
      const direct = s.direct ? '' : ' Remember: propose changes as Review records instead of applying them.';
      st = step('AI_AGENT', s.name, { agentId: agent ? agent.id : undefined, prompt: preface + prompt + direct });
      names['ai' + (aiIdx || '')] = st.id; aiIdx++;
    } else if (s.kind === 'http') {
      st = step('HTTP_REQUEST', s.name, { url: s.url, method: s.method || 'GET', headers: { 'Content-Type': 'application/json' }, body: s.body });
      names['http' + (httpIdx || '')] = st.id; httpIdx++;
    } else if (s.kind === 'email') {
      if (process.env.TWENTY_CONNECTED_ACCOUNT_ID) st = step('SEND_EMAIL', s.name, { connectedAccountId: process.env.TWENTY_CONNECTED_ACCOUNT_ID, recipients: { to: process.env.TWENTY_DIGEST_TO || process.env.TWENTY_EMAIL || '', cc: '', bcc: '' }, subject: s.subject, body: s.body, files: [] });
      else st = step('AI_AGENT', s.name + ' (as review)', { agentId: agent ? agent.id : undefined, prompt: `Create a Review record of type EMAIL_DRAFT, status PENDING, title "${s.subject}", with draft = ${s.body}. No connected mailbox is configured, so it will be sent by a person.` });
    } else throw new Error(`unknown step kind ${s.kind}`);
    // replace {{steps.ai.result...}} / {{steps.http.result...}} references with real step ids
    const fix = (v) => typeof v === 'string' ? v.replace(/\{\{steps\.(ai|http)(\d*)\.result/g, (m, k, i) => `{{${names[k + i] || names[k]}.result`) : v;
    if (st.settings.input.prompt) st.settings.input.prompt = fix(st.settings.input.prompt);
    if (st.settings.input.url) st.settings.input.url = fix(st.settings.input.url);
    if (st.settings.input.body && typeof st.settings.input.body === 'object') st.settings.input.body = JSON.parse(fix(JSON.stringify(st.settings.input.body)));
    if (prev()) prev().nextStepIds = [st.id];
    steps.push(st);
  });
  return steps;
}
function buildTrigger(def, firstStepId) {
  const t = def.trigger;
  const base = { name: def.triggerName || 'Trigger', nextStepIds: [firstStepId], position: { x: 0, y: 0 } };
  if (t.type === 'record') return { ...base, type: 'DATABASE_EVENT', settings: { eventName: `${t.object}.${t.event}`, outputSchema: {}, objectType: t.object } };
  if (t.type === 'cron') return { ...base, type: 'CRON', settings: { type: 'CUSTOM', pattern: t.pattern, outputSchema: {} } };
  if (t.type === 'webhook') return { ...base, type: 'WEBHOOK', settings: { httpMethod: 'POST', authentication: null, expectedBody: {}, outputSchema: {} } };
  return { ...base, type: 'MANUAL', settings: { outputSchema: {}, icon: t.icon || 'IconSparkles', isPinned: true, availability: t.objectType ? { type: 'SINGLE_RECORD', objectNameSingular: t.objectType } : { type: 'GLOBAL' } } };
}
async function mcp(toolName, argsObj) {
  const json = await api.request('/mcp', { method: 'POST', body: { jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name: 'execute_tool', arguments: { toolName, arguments: argsObj } } } });
  if (json.error) throw new Error(`MCP ${toolName}: ${JSON.stringify(json.error)}`);
  const text = json.result?.content?.map((c) => c.text || '').join('') || '';
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  if (json.result?.isError || parsed?.success === false || parsed?.error) throw new Error(`MCP ${toolName}: ${text.slice(0, 500)}`);
  return parsed;
}
async function existingWorkflows() { return api.list('workflows', { limit: 200 }); }
async function ensureWorkflow(def, trigger, steps, existing) {
  const found = existing.find((w) => w.name === def.name);
  if (found && !args['force-workflows']) { skipped(`workflow "${def.name}"`); return found; }
  if (found) {
    try { await api.remove('workflows', found.id); log('update', `removed old workflow "${def.name}"`); } catch (e) { warn(`could not remove workflow "${def.name}": ${e.message.split('\n')[0]}`); }
  }
  if (DRY) { created(`workflow "${def.name}" (dry run)`); return { id: 'dry' }; }
  const stepPositions = [{ stepId: 'trigger', position: { x: 0, y: 0 } }].concat(steps.map((s, i) => ({ stepId: s.id, position: { x: 0, y: (i + 1) * 150 } })));
  const res = await mcp('create_complete_workflow', { name: def.name, description: def.description, trigger, steps, stepPositions, activate: def.activate !== false });
  created(`workflow "${def.name}" (${trigger.type}, ${steps.length} step${steps.length === 1 ? '' : 's'}${def.activate === false ? ', draft' : ', active'})`);
  const wf = (await api.list('workflows', { filter: `name[eq]:"${def.name.replace(/"/g, '\\"')}"`, limit: 1 }))[0];
  return { id: wf ? wf.id : (res.workflowId || res.workflow?.id || ''), raw: res };
}

// ---------- 5. skills (records + manual workflows) ----------
if (want('skills')) {
  log('info', '— Skills');
  const existing = await existingWorkflows();
  for (const sk of SKILLS) {
    const trigger = { type: 'manual', icon: 'IconCube', objectType: sk.key === 'account-research' ? 'company' : sk.key === 'draft-outreach' ? 'person' : sk.key === 'propose-record-updates' ? 'company' : undefined };
    const def = { name: `Skill: ${sk.name}`, description: sk.description, trigger, triggerName: 'Run skill', steps: [{ kind: 'ai', name: sk.name, prompt: `${trigger.objectType ? `Run this skill for the ${trigger.objectType} record with id {{trigger.record.id}}. ` : ''}Instructions: ${sk.instructions}` }] };
    const steps = buildSteps(def);
    const wf = await ensureWorkflow(def, buildTrigger(def, steps[0].id), steps, existing);
    const { record, created: isNew } = DRY ? { record: {}, created: true } : await api.upsert('skills', 'key', sk.key, { name: sk.name, key: sk.key, description: sk.description, instructions: sk.instructions, enabled: true, workflowId: wf.id || '' });
    (isNew ? created : skipped)(`skill record "${sk.name}"${isNew ? '' : ' (updated)'}`);
  }
}

// ---------- 6. automations ----------
if (want('workflows')) {
  log('info', '— Automations');
  const existing = await existingWorkflows();
  for (const def of AUTOMATIONS) {
    try {
      const steps = buildSteps(def);
      await ensureWorkflow(def, buildTrigger(def, steps[0].id), steps, existing);
    } catch (e) { warn(`workflow "${def.name}": ${e.message.split('\n')[0]}`); }
  }
}

// ---------- 7. records ----------
if (want('records')) {
  log('info', '— Records');
  const money = (n) => ({ amountMicros: Math.round(n * 1_000_000), currencyCode: 'USD' });
  const companyIds = {};
  for (const c of COMPANIES) {
    const data = { name: c.name, domainName: { primaryLinkUrl: 'https://' + c.domain, primaryLinkLabel: '' }, employees: c.employees, annualRecurringRevenue: money(c.arr), segment: c.segment, source: c.source };
    if (DRY) { created(`company ${c.name} (dry run)`); continue; }
    const { record, created: isNew } = await api.upsert('companies', 'name', c.name, data);
    companyIds[c.name] = record.id; (isNew ? created : skipped)(`company ${c.name}`);
  }
  const personIds = {};
  for (const p of PEOPLE) {
    const data = { name: { firstName: p.first, lastName: p.last }, emails: { primaryEmail: p.email, additionalEmails: [] }, jobTitle: p.title, companyId: companyIds[p.company], leadStatus: p.leadStatus, source: (COMPANIES.find((c) => c.name === p.company) || {}).source };
    if (DRY) { created(`person ${p.email} (dry run)`); continue; }
    const existing = (await api.list('people', { filter: `emails.primaryEmail[eq]:"${p.email}"`, limit: 1 }))[0];
    const record = existing ? await api.update('people', existing.id, data) : await api.create('people', data);
    personIds[p.email] = record.id; (existing ? skipped : created)(`person ${p.first} ${p.last}`);
  }
  const oppIds = {};
  for (const o of OPPORTUNITIES) {
    const data = { name: o.name, companyId: companyIds[o.company], pointOfContactId: personIds[o.pointOfContact], stage: o.stage, amount: money(o.amount), closeDate: o.closeDate, nextStep: o.nextStep };
    if (DRY) { created(`opportunity ${o.name} (dry run)`); continue; }
    try {
      const { record, created: isNew } = await api.upsert('opportunities', 'name', o.name, data);
      oppIds[o.name] = record.id; (isNew ? created : skipped)(`opportunity ${o.name}`);
    } catch (e) { warn(`opportunity ${o.name}: ${e.message.split('\n')[0]}`); }
  }
  for (const n of NOTES) {
    if (DRY) { created(`note ${n.title} (dry run)`); continue; }
    const existing = await api.findOne('notes', 'title', n.title);
    const note = existing || (await api.create('notes', { title: n.title, bodyV2: { markdown: n.body, blocknote: null } }));
    const targets = await api.list('noteTargets', { filter: `noteId[eq]:"${note.id}"`, limit: 1 });
    if (!targets.length) await api.create('noteTargets', { noteId: note.id, targetCompanyId: companyIds[n.company] });
    (existing && targets.length ? skipped : created)(`note ${n.title} on ${n.company}`);
  }
  for (const k of KNOWLEDGE) {
    if (DRY) { created(`knowledge ${k.title} (dry run)`); continue; }
    const { created: isNew } = await api.upsert('knowledges', 'name', k.title, { name: k.title, category: k.category, body: k.body });
    (isNew ? created : skipped)(`knowledge "${k.title}"`);
  }
  for (const r of REVIEWS) {
    if (DRY) { created(`review ${r.title} (dry run)`); continue; }
    const existing = await api.findOne('reviews', 'name', r.title);
    if (existing) { skipped(`review "${r.title}"`); continue; }
    const rel = {};
    if (r.objectName === 'company') { rel.companyId = companyIds[r.record]; rel.recordId = companyIds[r.record]; }
    if (r.objectName === 'person') { rel.personId = personIds[r.record]; rel.recordId = personIds[r.record]; }
    if (r.objectName === 'opportunity') { rel.opportunityId = oppIds[r.record]; rel.recordId = oppIds[r.record]; }
    await api.create('reviews', { name: r.title, reviewType: r.type, status: 'PENDING', objectName: r.objectName, fieldName: r.fieldName || '', fromValue: r.fromValue || '', toValue: r.toValue || '', draft: r.draft || '', reason: r.reason, source: r.source, ...rel });
    created(`review "${r.title}"`);
  }
}

// ---------- 8. views ----------
if (want('views')) {
  log('info', '— Views');
  OBJ = await loadObjects();
  const review = OBJ.review;
  const statusField = fieldOf('review', 'status');
  if (review && statusField && !DRY) {
    try {
      const views = await api.metadata(`query($id: String!) { getViews(objectMetadataId: $id) { id name type } }`, { id: review.id }).then((d) => d.getViews).catch(() => []);
      if (views.some((v) => v.name === 'Review board')) skipped('view "Review board"');
      else {
        const d = await api.metadata(`mutation($input: CreateViewInput!) { createView(input: $input) { id } }`, { input: { name: 'Review board', objectMetadataId: review.id, type: 'KANBAN', icon: 'IconLayoutKanban', mainGroupByFieldMetadataId: statusField.id, position: 1 } });
        const viewId = d.createView.id;
        const groups = (statusField.options || []).map((o, i) => ({ viewId, fieldValue: o.value, isVisible: true, position: i }));
        await api.metadata(`mutation($inputs: [CreateViewGroupInput!]!) { createManyViewGroups(inputs: $inputs) { id } }`, { inputs: groups });
        created('view "Review board" (kanban by status)');
      }
    } catch (e) { warn(`views: ${e.message.split('\n')[0]}`); }
  }
}

console.log(`\nDone: ${summary.created} created, ${summary.skipped} already there, ${summary.warnings.length} warning${summary.warnings.length === 1 ? '' : 's'}.`);
if (summary.warnings.length) summary.warnings.forEach((w) => console.log('  ! ' + w));
