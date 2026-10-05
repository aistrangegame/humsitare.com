/* ============================================================
   Sitaron Ki Mehfil — form receiver
   A Cloudflare Worker. Holds the Airtable token so the page never does.
   Routes:  POST /rsvp      POST /sponsor      GET /health
   ============================================================ */

const TABLES = { people:'People', families:'Families', events:'Events', replies:'Replies', sponsors:'Sponsors' };
const ALLOWED = ['https://humsitare.com','https://www.humsitare.com','http://localhost:8788','http://127.0.0.1:5500'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true }, 200, cors);
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Bad JSON' }, 400, cors); }

    // a field no human sees; only a bot fills it
    if (body.website) return json({ ok: true }, 200, cors);

    try {
      if (url.pathname === '/rsvp')    return json(await handleRsvp(body, env), 200, cors);
      if (url.pathname === '/sponsor') return json(await handleSponsor(body, env), 200, cors);
      return json({ error: 'Not found' }, 404, cors);
    } catch (err) {
      console.error(err && err.stack || err);
      return json({ error: 'Could not save. Please try again, or message us.' }, 500, cors);
    }
  }
};

const json = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type':'application/json', ...h } });

/* ---------- Airtable ---------- */
async function at(env, table, method, path = '', payload) {
  const base = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}${path}`;
  const res = await fetch(base, {
    method,
    headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${table} ${method} ${res.status}: ${JSON.stringify(data)}`);
  return data;
}
const esc = v => String(v).replace(/'/g, "\\'");

async function findOne(env, table, field, value) {
  if (!value) return null;
  const q = `?maxRecords=1&filterByFormula=${encodeURIComponent(`LOWER({${field}})=LOWER('${esc(value)}')`)}`;
  const r = await at(env, table, 'GET', q);
  return r.records && r.records[0] ? r.records[0] : null;
}
async function createOne(env, table, fields) {
  const r = await at(env, table, 'POST', '', { records: [{ fields }], typecast: true });
  return r.records[0];
}
async function findOrCreate(env, table, field, value, extra = {}) {
  const found = await findOne(env, table, field, value);
  return found || createOne(env, table, { [field]: value, ...extra });
}

/* ---------- clean the input ---------- */
const str  = (v, n = 300) => typeof v === 'string' ? v.trim().slice(0, n) : '';
const date = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '').trim()) ? String(v).trim() : null;
const num  = (v, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };

/* ---------- RSVP ---------- */
async function handleRsvp(b, env) {
  const submitter = str(b.name, 120);
  if (!submitter) throw new Error('name missing');
  const coming = b.attending === 'yes' ? 'Yes' : 'No';

  const event = await findOrCreate(env, TABLES.events, 'Event name', str(b.event, 120) || 'Diwali 2026');

  // one person coming alone still gets a family row — it is the unit a reply belongs to
  const familyName = str(b.family, 120) || submitter;
  const family = await findOrCreate(env, TABLES.families, 'Family name', familyName);

  const peopleIds = [];
  if (coming === 'Yes' && Array.isArray(b.people)) {
    for (const p of b.people.slice(0, 20)) {
      const full = str(p.name, 120);
      if (!full) continue;
      const fields = {
        'Full name': full,
        'Phone': str(p.phone, 40),
        'Date of birth': date(p.dob),
        'Family': [family.id]
      };
      Object.keys(fields).forEach(k => (fields[k] === '' || fields[k] === null) && delete fields[k]);
      // same name already in this family → update rather than duplicate
      const existing = await findOne(env, TABLES.people, 'Full name', full);
      if (existing && (existing.fields.Family || []).includes(family.id)) {
        await at(env, TABLES.people, 'PATCH', '', { records: [{ id: existing.id, fields }], typecast: true });
        peopleIds.push(existing.id);
      } else {
        peopleIds.push((await createOne(env, TABLES.people, fields)).id);
      }
    }
  }

  const reply = {
    'Reply': `${familyName} — ${event.fields['Event name']}`,
    'Event': [event.id],
    'Family': [family.id],
    'Coming': coming,
    'Submitted': new Date().toISOString()
  };
  if (peopleIds.length)    reply['People'] = peopleIds;
  if (coming === 'Yes') {
    const hc = num(b.count, 1, 20);           if (hc) reply['Headcount'] = hc;
    const song = str(b.song, 200);            if (song) reply['Entry song'] = song;
    const perf = str(b.performance, 2000);    if (perf) reply['Other performance'] = perf;
    const wa   = str(b.whatsapp, 40);         if (wa) reply['WhatsApp'] = wa;
    const more = str(b.others, 2000);         if (more) reply['Others for the group'] = more;
    const mark = str(b.mark, 20);             if (mark) reply['Mark'] = mark;
  }
  const saved = await createOne(env, TABLES.replies, reply);
  return { ok: true, id: saved.id, coming };
}

/* ---------- Co-sponsor ---------- */
async function handleSponsor(b, env) {
  const name = str(b.name, 120);
  if (!name) throw new Error('name missing');
  const event = await findOrCreate(env, TABLES.events, 'Event name', str(b.event, 120) || 'Diwali 2026');
  const fields = {
    'Name': name,
    'Family or business': str(b.from, 160),
    'Contact': str(b.contact, 160),
    'What they have in mind': str(b.note, 2000),
    'Event': [event.id],
    'Status': 'New',
    'Submitted': new Date().toISOString()
  };
  Object.keys(fields).forEach(k => fields[k] === '' && delete fields[k]);
  const saved = await createOne(env, TABLES.sponsors, fields);
  return { ok: true, id: saved.id };
}
