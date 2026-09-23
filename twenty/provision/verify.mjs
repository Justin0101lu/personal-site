#!/usr/bin/env node
// Checks a provisioned workspace and prints what Lightfield-style pieces are in place.
import { TwentyClient, env } from './twenty-client.mjs';
import { AUTOMATIONS, SKILLS } from './definitions/content.mjs';

const URL = env('TWENTY_URL', 'http://localhost:3000');
let token = process.env.TWENTY_API_KEY;
if (!token) {
  const { default: login } = await import('./login.mjs');
  token = await login(URL, env('TWENTY_EMAIL'), env('TWENTY_PASSWORD'));
}
const api = new TwentyClient({ url: URL, apiKey: token });
const ok = (b) => (b ? '✓' : '✗');
let failures = 0;
const check = (label, cond, detail) => { console.log(`${ok(cond)} ${label}${detail ? ' — ' + detail : ''}`); if (!cond) failures++; };

const objs = (await api.request('/rest/metadata/objects?limit=1000')).data?.objects || [];
const by = Object.fromEntries(objs.map((o) => [o.nameSingular, o]));
for (const n of ['knowledge', 'skill', 'review']) check(`object ${n}`, !!by[n], by[n] ? `${by[n].fields.length} fields` : 'missing');
check('person.leadStatus', !!by.person?.fields.find((f) => f.name === 'leadStatus'));
check('opportunity stage options', ['DISCOVERY', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'].every((v) => (by.opportunity?.fields.find((f) => f.name === 'stage')?.options || []).some((o) => o.value === v)));

const roles = (await api.metadata('{ getRoles { id label } }')).getRoles;
check('role "Lightfield Agent"', roles.some((r) => r.label === 'Lightfield Agent'));
const agents = (await api.metadata('{ findManyAgents { id name roleId } }')).findManyAgents;
const agent = agents.find((a) => a.name === 'lightfieldAssistant');
check('agent lightfieldAssistant', !!agent, agent ? (agent.roleId ? 'role assigned' : 'no role') : 'missing');

const nativeSkills = (await api.metadata('{ skills { id name isActive } }').catch(() => ({ skills: [] }))).skills;
check('native AI skills', SKILLS.every((k) => nativeSkills.some((x) => x.name === k.key.replace(/-([a-z])/g, (m, c) => c.toUpperCase()))), `${nativeSkills.filter((x) => x.isActive).length} active`);
const workflows = await api.list('workflows', { limit: 200 });
const versions = await api.list('workflowVersions', { limit: 500 });
const active = (name) => { const w = workflows.find((x) => x.name === name); return w && versions.some((v) => v.workflowId === w.id && v.status === 'ACTIVE'); };
let n = 0; AUTOMATIONS.forEach((a) => { if (active(a.name)) n++; });
check(`automations active`, n === AUTOMATIONS.length, `${n}/${AUTOMATIONS.length}`);
let s = 0; SKILLS.forEach((k) => { if (active(`Skill: ${k.name}`)) s++; });
check(`skill workflows active`, s === SKILLS.length, `${s}/${SKILLS.length}`);

for (const [plural, min] of [['companies', 12], ['people', 20], ['opportunities', 11], ['knowledges', 6], ['skills', 7], ['reviews', 7]]) {
  const rows = await api.list(plural, { limit: 60 }).catch(() => []);
  check(`${plural} records`, rows.length >= min, `${rows.length}`);
}
const pending = await api.list('reviews', { filter: 'status[eq]:"PENDING"', limit: 60 }).catch(() => []);
console.log(`\n${pending.length} reviews pending. ${failures ? failures + ' check(s) failed.' : 'All checks passed.'}`);
process.exit(failures ? 1 : 0);
