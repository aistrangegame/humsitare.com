// The door, proved against a made-up base (no network, no real names).  node sitaron-worker/test/door.mjs
import worker from '../worker.js';
const T = { Events: [{ id: 'evt1', fields: { 'Event name': 'Diwali 2026', Status: 'Guest list only' } }],
  People: [{ id: 'p1', fields: { 'Full name': 'Asha Testguest', Phone: '(215) 555-0101' } },
           { id: 'p2', fields: { 'Full name': 'Ravi Testguest', Phone: '' } }],
  Replies: [{ id: 'r1', fields: { Coming: 'Yes', Event: ['evt1'], People: ['p1', 'p2'], Headcount: 2 } }],
  Blocked: [{ id: 'b1', fields: { Name: 'Zoltan Testclosed', Active: true } }], 'Gate log': [] };
let n = 0;
globalThis.fetch = async (u, o = {}) => {
  const t = decodeURIComponent(new URL(u).pathname.split('/')[3]);
  if (o.method === 'POST') { const f = JSON.parse(o.body).records[0].fields, r = { id: 'new' + (++n), fields: f }; T[t].push(r); return new Response(JSON.stringify({ records: [r] })); }
  return new Response(JSON.stringify({ records: T[t] || [] }));
};
const env = { AIRTABLE_BASE_ID: 'appTEST', AIRTABLE_TOKEN: 'x' };
const call = async (path, body, ip) => (await worker.fetch(new Request('https://x.test' + path, { method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'https://humsitare.com', 'CF-Connecting-IP': ip }, body: JSON.stringify(body) }), env, {})).json();
let bad = 0; const is = (what, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) bad++; console.log(ok ? 'ok  ' : 'FAIL', what, ok ? '' : JSON.stringify(got)); };
const HALL = '203.0.113.7', ev = 'Diwali 2026';
is('a Yes guest enters from the hall', (await call('/gate', { name: 'Asha', phone: '2155550101', event: ev }, HALL)).ok, true);
is('a blocked name is closed', (await call('/gate', { name: 'Zoltan', phone: '2155550199', event: ev }, HALL)).closed, true);
is('  and the hall address is now on the Blocked list', T.Blocked.some(r => r.fields.IP === HALL), true);
is('the Yes guest still enters from the hall', (await call('/gate', { name: 'Asha', phone: '2155550101', event: ev }, HALL)).ok, true);
is('her household member enters on her phone', (await call('/gate', { name: 'Ravi', phone: '2155550101', event: ev }, HALL)).ok, true);
is('she can still find her reply', (await call('/lookup', { phone: '2155550101', event: ev }, HALL)).closed, undefined);
is('a stranger at the hall stays closed', (await call('/gate', { name: 'Someone Else', phone: '2155550155', event: ev }, HALL)).closed, true);
is('the blocked name stays closed from the hall', (await call('/gate', { name: 'Zoltan Testclosed', phone: '2155550199', event: ev }, HALL)).closed, true);
is('the blocked name stays closed even on a Yes phone', (await call('/gate', { name: 'Zoltan', phone: '2155550101', event: ev }, '198.51.100.9')).closed, true);
console.log(bad ? `\n${bad} failed` : '\nall passed'); process.exit(bad ? 1 : 0);
