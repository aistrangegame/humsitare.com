/* ============================================================
   Sitaron Ki Mehfil — form receiver
   A Cloudflare Worker. Holds the Airtable token so the page never does.
   Routes:  POST /rsvp      POST /sponsor      POST /lookup      GET /health
            GET /carriers  GET /carry-photo/:id   (the public wall of confirmed co-sponsors)
            POST /dash-sponsor (token → change a co-sponsor's status)
            POST /dash (passcode → everything, for the hosts)    GET /dash-photo/:id?t=…
   ============================================================ */

// the same five tables the page has always written to
const TABLES = { people:'People', families:'Families', events:'Events', replies:'Replies', sponsors:'Sponsors' };
const ALLOWED = ['https://humsitare.com','https://www.humsitare.com','http://localhost:8788','http://127.0.0.1:5500'];

export default {
  async fetch(request, env, ctx) {
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

    // ---- the public wall of co-sponsors, and a photo only for a confirmed, named gift ----
    if (url.pathname === '/carriers' && request.method === 'GET') {
      try { return json(await handleCarriers(env, url.searchParams.get('event')), 200, { ...cors, 'Cache-Control': 'public, max-age=60' }); }
      catch (err) { console.error(err); return json({ carriers: [] }, 200, cors); }
    }
    if (url.pathname.startsWith('/carry-photo/') && request.method === 'GET') {
      const id = url.pathname.slice('/carry-photo/'.length);
      if (!/^rec[A-Za-z0-9]{14}$/.test(id)) return new Response('Not found', { status: 404, headers: cors });
      try {
        const rec = await at(env, TABLES.sponsors, 'GET', '/' + id);
        const f = rec.fields || {};
        if (f.Status !== 'Confirmed' || (f.Recognition || '').trim().toLowerCase() === 'anonymous')
          return new Response('Not found', { status: 404, headers: cors });
        const att = f.Photo || [];
        const src = att[0] && (att[0].thumbnails?.large?.url || att[0].url);
        if (!src) return new Response('No photo', { status: 404, headers: cors });
        const up = await fetch(src); if (!up.ok) return new Response('No photo', { status: 404, headers: cors });
        return new Response(up.body, { status: 200, headers: { ...cors,
          'Content-Type': up.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=3600' } });
      } catch (err) { console.error(err); return new Response('No photo', { status: 404, headers: cors }); }
    }

    // ---- the hosts' dashboard: a portrait, only with a valid session token ----
    if (url.pathname.startsWith('/dash-photo/') && request.method === 'GET') {
      const id = url.pathname.slice('/dash-photo/'.length);
      if (!/^rec[A-Za-z0-9]{14}$/.test(id)) return new Response('Not found', { status: 404, headers: cors });
      if (!(await tokenOk(env, url.searchParams.get('t')))) return new Response('Sign in again', { status: 401, headers: cors });
      try {
        const table = url.searchParams.get('k') === 's' ? TABLES.sponsors : TABLES.people;
        const cache = caches.default, key = new Request(`${url.origin}/dash-photo/${id}?k=${table === TABLES.sponsors ? 's' : 'p'}`);
        const hit = await cache.match(key); if (hit) return hit;
        const rec = await at(env, table, 'GET', '/' + id);
        const att = (rec.fields && rec.fields['Photo']) || [];
        const src = att[0] && (att[0].thumbnails?.large?.url || att[0].url);
        if (!src) return new Response('No photo', { status: 404, headers: cors });
        const up = await fetch(src); if (!up.ok) return new Response('No photo', { status: 404, headers: cors });
        const out = new Response(up.body, { status: 200, headers: { ...cors,
          'Content-Type': up.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'private, max-age=86400' } });
        if (ctx && ctx.waitUntil) ctx.waitUntil(cache.put(key, out.clone()));
        return out;
      } catch (err) { console.error(err); return new Response('No photo', { status: 404, headers: cors }); }
    }

    if (request.method !== 'POST') return json({ error: 'POST only' }, 405, cors);

    if (url.pathname === '/dash-sponsor') {
      let q; try { q = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400, cors); }
      if (!(await tokenOk(env, q.token))) return json({ error: 'Sign in again.' }, 401, cors);
      try { return json(await setSponsorStatus(env, q), 200, { ...cors, 'Cache-Control': 'no-store' }); }
      catch (err) { console.error(err); return json({ error: String(err.message || 'Could not save that.') }, 400, cors); }
    }
    if (url.pathname === '/dash') {
      const ip = request.headers.get('CF-Connecting-IP') || 'anon';
      if (!env.DASHBOARD_PASSCODE) return json({ error: 'The dashboard passcode has not been set yet.' }, 503, cors);
      let q; try { q = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400, cors); }
      let ok = false;
      if (q.token) ok = await tokenOk(env, q.token);
      else if (q.passcode) {
        if (lockedOut(ip)) return json({ error: 'Too many tries. Wait a minute, then try again.' }, 429, cors);
        ok = await sameSecret(String(q.passcode).trim(), String(env.DASHBOARD_PASSCODE).trim());
        if (!ok) { failed(ip); return json({ error: 'That is not the passcode.' }, 401, cors); }
      }
      if (!ok) return json({ error: 'Sign in again.' }, 401, cors);
      try {
        const data = await handleDash(env, q.event);
        data.token = q.token && ok ? q.token : await makeToken(env);
        return json(data, 200, { ...cors, 'Cache-Control': 'no-store' });
      } catch (err) { console.error(err); return json({ error: 'Could not read the base. Try again.' }, 500, cors); }
    }
    if (url.pathname === '/lookup') {
      let q; try { q = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400, cors); }
      const ip = request.headers.get('CF-Connecting-IP') || 'anon';
      if (throttled(ip)) return json({ error: 'Too many looks. Try again in a minute.' }, 429, cors);
      try { return json(await handleLookup(q, env, ip), 200, cors); }
      catch (err) { console.error(err); return json({ error: 'Could not look that up.' }, 500, cors); }
    }

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
      const msg = String(err && err.message || '');
      if (msg.includes('phone missing')) return json({ error: url.pathname === '/sponsor' ? 'A phone number, so we can reach you.' : 'A phone number, so you can change this later.' }, 400, cors);
      if (msg.includes('email missing')) return json({ error: 'An email address, for your acknowledgment letter.' }, 400, cors);
      if (msg.includes('amount missing')) return json({ error: 'The amount you would like to give.' }, 400, cors);
      if (msg.includes('name missing'))  return json({ error: 'Your name, first.' }, 400, cors);
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

/* A photo arrives already shrunk on the guest's phone (location data stripped there too),
   as base64. Airtable takes it straight into the attachment cell — up to 5 MB, ours are
   far smaller. `replace` empties the cell first so a new photo replaces the old.        */
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
function photoOk(ph) {
  if (!ph || typeof ph !== 'object') return null;
  const type = String(ph.type || '').toLowerCase(), data = String(ph.data || '');
  if (!PHOTO_TYPES.includes(type) || !/^[A-Za-z0-9+/=]+$/.test(data)) return null;
  if (data.length > 2_800_000) return null;                 // about 2 MB once decoded
  return { type, data };
}
async function putPhoto(env, table, recordId, field, ph, replace = true) {
  const p = photoOk(ph); if (!p) return false;
  if (replace) await at(env, table, 'PATCH', '/' + recordId, { fields: { [field]: [] } });
  const ext = p.type === 'image/png' ? 'png' : p.type === 'image/webp' ? 'webp' : 'jpg';
  const res = await fetch(`https://content.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${recordId}/${encodeURIComponent(field)}/uploadAttachment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType: p.type, file: p.data, filename: `${recordId}.${ext}` })
  });
  if (!res.ok) { console.error('photo upload', res.status, await res.text()); return false; }
  return true;
}

// Airtable keeps a phone exactly as it was typed: "(848) 459-8432", "848-459-8432",
// "+1 848 459 8432" are all the same number. Strip the punctuation inside the formula
// and compare the last ten digits, so old rows and new ones both match.
function phoneWhere(digitsValue) {
  const strip = f => `SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(${f},' ',''),'(',''),')',''),'-',''),'+',''),'.',''),'\u00a0','')`;
  const tail = digitsValue.slice(-10);
  return `RIGHT(${strip('{Phone}&""')},10)='${esc(tail)}'`;
}

async function findByPhone(env, digitsValue) {
  if (!digitsValue || digitsValue.length < 7) return null;
  const q = `?maxRecords=1&filterByFormula=${encodeURIComponent(phoneWhere(digitsValue))}`;
  const r = await at(env, TABLES.people, 'GET', q);
  return (r.records && r.records[0]) || null;
}

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
// the same number typed five different ways is still the same number
const digits = v => String(v || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const date = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '').trim()) ? String(v).trim() : null;
const num  = (v, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };

/* ---------- RSVP ---------- */
async function handleRsvp(b, env) {
  const submitter = str(b.name, 120);
  if (!submitter) throw new Error('name missing');
  const coming = b.attending === 'yes' ? 'Yes' : 'No';

  // the submitter's phone is the key: it is what lets them change their reply later,
  // from any device, and what stops one family overwriting another's
  const people = Array.isArray(b.people) ? b.people.slice(0, 20) : [];
  const withPhone = people.find(p => digits(p.phone).length >= 7);
  const keyPhone = digits(b.phone) || (withPhone ? digits(withPhone.phone) : '');
  if (!keyPhone || keyPhone.length < 7) throw new Error('phone missing');
  // the person who owns that number is the one a future change is matched against

  const event = await findOrCreate(env, TABLES.events, 'Event name', str(b.event, 120) || 'Diwali 2026');

  // find this person by their number first — their family follows from them
  const byPhone = await findByPhone(env, keyPhone);
  const familyName = str(b.family, 120) || submitter;
  let family;
  if (byPhone && (byPhone.fields.Family || []).length) {
    family = await at(env, TABLES.families, 'GET', '/' + byPhone.fields.Family[0]);
    if (str(b.family, 120) && family.fields['Family name'] !== familyName)
      await at(env, TABLES.families, 'PATCH', '', { records: [{ id: family.id, fields: { 'Family name': familyName } }] });
  } else {
    family = await createOne(env, TABLES.families, { 'Family name': familyName });
  }

  const peopleIds = [];
  const photos = [];
  for (const p of people) {
    const full = str(p.name, 120);
    if (!full) continue;
    const ph = digits(p.phone);
    const fields = { 'Full name': full, 'Family': [family.id] };
    if (ph) fields['Phone'] = ph;
    const dob = date(p.dob); if (dob) fields['Date of birth'] = dob;

    // matched by number where there is one; otherwise by name inside their own family,
    // so a child without a phone can still be updated and can never collide with a stranger
    let existing = ph ? await findByPhone(env, ph) : null;
    if (!existing) {
      const byName = await findOne(env, TABLES.people, 'Full name', full);
      if (byName && (byName.fields.Family || []).includes(family.id)) existing = byName;
    }
    let pid;
    if (existing) {
      await at(env, TABLES.people, 'PATCH', '', { records: [{ id: existing.id, fields }], typecast: true });
      pid = existing.id;
    } else {
      pid = (await createOne(env, TABLES.people, fields)).id;
    }
    peopleIds.push(pid);
    // a new photo replaces the old one; no photo sent leaves the old one where it is
    if (p.photo) photos.push(putPhoto(env, TABLES.people, pid, 'Photo', p.photo, true).catch(() => false));
  }
  await Promise.all(photos);

  const reply = {
    'Reply': `${familyName} — ${event.fields['Event name']}`,
    'Event': [event.id],
    'Family': [family.id],
    'Coming': coming,
    'Submitted': new Date().toISOString()
  };
  if (peopleIds.length) reply['People'] = peopleIds;
  if (coming === 'Yes') {
    const hc = num(b.count, 1, 20);           if (hc) reply['Headcount'] = hc;
    const song = str(b.song, 200);            if (song) reply['Entry song'] = song;
    const perf = str(b.performance, 2000);    if (perf) reply['Other performance'] = perf;
    const mark = str(b.mark, 20);             if (mark) reply['Mark'] = mark;
  }

  // one reply per phone per event. The person is found by their number, and their own
  // Replies link gives the row by record id — so nobody can reach anybody else's.
  let existing = null;
  const owner = byPhone || await findByPhone(env, keyPhone);
  for (const rid of (owner && owner.fields.Replies) || []) {
    const r = await at(env, TABLES.replies, 'GET', '/' + rid);
    if ((r.fields.Event || []).includes(event.id)) { existing = r; break; }
  }
  if (existing) {
    if (coming === 'No') ['Headcount','Entry song','Other performance'].forEach(k => reply[k] = null);
    await at(env, TABLES.replies, 'PATCH', '', { records: [{ id: existing.id, fields: reply }], typecast: true });
    return { ok: true, id: existing.id, coming, updated: true };
  }
  const saved = await createOne(env, TABLES.replies, reply);
  return { ok: true, id: saved.id, coming, updated: false };
}

/* ---------- Looking up a reply, so nobody changes what they have not seen ----------
   Returns only what they themselves sent: never a date of birth, never another
   person's number. Throttled so the endpoint cannot be walked number by number. */
const seen = new Map();
function throttled(ip) {
  const now = Date.now(), win = 60000, cap = 12;
  const hits = (seen.get(ip) || []).filter(t => now - t < win);
  hits.push(now); seen.set(ip, hits);
  if (seen.size > 600) for (const [k, v] of seen) if (!v.some(t => now - t < win)) seen.delete(k);
  return hits.length > cap;
}

async function handleLookup(b, env, ip) {
  const phone = digits(b.phone);
  if (!phone || phone.length < 7) return { found: false, reason: 'short' };
  const person = await findByPhone(env, phone);
  if (!person) return { found: false };
  const eventName = str(b.event, 120) || 'Diwali 2026';
  const event = await findOne(env, TABLES.events, 'Event name', eventName);
  if (!event) return { found: false };

  let reply = null;
  for (const rid of person.fields.Replies || []) {
    const r = await at(env, TABLES.replies, 'GET', '/' + rid);
    if ((r.fields.Event || []).includes(event.id)) { reply = r; break; }
  }
  if (!reply) return { found: false };

  let familyName = '';
  if ((reply.fields.Family || []).length) {
    const fam = await at(env, TABLES.families, 'GET', '/' + reply.fields.Family[0]);
    familyName = fam.fields['Family name'] || '';
  }
  const people = [];
  for (const pid of reply.fields.People || []) {
    const pr = await at(env, TABLES.people, 'GET', '/' + pid);
    // anyone who knows this number can look it up, so a birthday and a phone come back
    // only for the person it belongs to — never the rest of the family, never the children.
    // (A blank birthday sent back on a change leaves the saved one exactly as it was.)
    const mine = pr.id === person.id;
    people.push({ name: pr.fields['Full name'] || '', dob: mine ? (pr.fields['Date of birth'] || '') : '',
                  phone: mine ? phone : '' });
  }
  return {
    found: true,
    name: person.fields['Full name'] || '',
    family: familyName,
    coming: reply.fields['Coming'] === 'Yes' ? 'yes' : 'no',
    count: reply.fields['Headcount'] || people.length || 1,
    song: reply.fields['Entry song'] || '',
    performance: reply.fields['Other performance'] || '',
    submitted: reply.fields['Submitted'] || '',
    people
  };
}

/* ---------- Carrying the light: the public wall ----------
   Only gifts the hosts have marked Confirmed. Shown: how they asked to be recognised
   and a photo if they gave one. Never an amount. Never a phone, an email or a real name
   behind an anonymous gift.                                                          */
async function handleCarriers(env, eventName) {
  const all = await listAll(env, TABLES.sponsors);
  const events = await listAll(env, TABLES.events);
  const ev = events.find(e => (e.fields['Event name'] || '') === (eventName || 'Diwali 2026'));
  const mine = all.filter(r => r.fields.Status === 'Confirmed' && (!ev || (r.fields.Event || []).includes(ev.id)));
  const out = mine.map(r => {
    const f = r.fields, anon = (f.Recognition || '').trim().toLowerCase() === 'anonymous';
    // a name and a portrait — never an amount
    return { id: anon ? '' : r.id, as: anon ? 'Anonymous' : (f.Recognition || f['Family or business'] || f.Name || ''),
             photo: !anon && !!(f.Photo && f.Photo.length),
             since: f['Recognition Date'] || (f.Submitted || '').slice(0, 10) };
  }).sort((a, b) => String(a.since).localeCompare(String(b.since)));
  return { carriers: out };
}

/* ---------- The hosts' dashboard ----------
   One passcode, kept as a Worker secret (DASHBOARD_PASSCODE). A correct passcode
   earns a token good for twelve hours, so a phone does not ask again all evening.
   The token is an HMAC of its own expiry: nothing is stored, and changing the
   passcode signs everyone out at once.                                            */
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function hmac(env, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('sitare:' + env.DASHBOARD_PASSCODE),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg)));
}
async function makeToken(env) {
  const exp = Date.now() + 12 * 3600 * 1000;
  return `${exp}.${await hmac(env, 'dash:' + exp)}`;
}
async function tokenOk(env, t) {
  if (!t || !env.DASHBOARD_PASSCODE) return false;
  const [exp, sig] = String(t).split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  return sameSecret(sig, await hmac(env, 'dash:' + exp));
}
async function sameSecret(a, b) {
  // compare in constant time, so the answer's speed gives nothing away
  const [x, y] = await Promise.all([a, b].map(v => crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))));
  const p = new Uint8Array(x), q = new Uint8Array(y); let d = 0;
  for (let i = 0; i < p.length; i++) d |= p[i] ^ q[i];
  return d === 0;
}
const misses = new Map();
function lockedOut(ip) { const r = (misses.get(ip) || []).filter(t => Date.now() - t < 60000); misses.set(ip, r); return r.length >= 6; }
function failed(ip) { const r = misses.get(ip) || []; r.push(Date.now()); misses.set(ip, r); }

async function listAll(env, table) {
  // every record, a hundred at a time, following Airtable's offset until there are no more
  const out = []; let offset = '';
  for (let page = 0; page < 40; page++) {
    const q = new URLSearchParams({ pageSize: '100' }); if (offset) q.set('offset', offset);
    const r = await at(env, table, 'GET', '?' + q.toString());
    out.push(...(r.records || []));
    if (!r.offset) break;
    offset = r.offset;
  }
  return out;
}

async function handleDash(env, eventIn) {
  const eventName = str(eventIn, 120) || 'Diwali 2026';
  const events = await listAll(env, TABLES.events);
  const event = events.find(e => (e.fields['Event name'] || '') === eventName) || null;
  const [replies, people, families, sponsors] = await Promise.all([
    listAll(env, TABLES.replies), listAll(env, TABLES.people), listAll(env, TABLES.families), listAll(env, TABLES.sponsors)
  ]);
  const P = new Map(people.map(p => [p.id, p])), F = new Map(families.map(f => [f.id, f]));
  const mine = replies.filter(r => event && (r.fields.Event || []).includes(event.id));
  const shape = r => {
    const f = r.fields, fam = (f.Family || []).map(id => F.get(id)).find(Boolean);
    return {
      id: r.id,
      family: (fam && fam.fields['Family name']) || '',
      coming: f.Coming === 'Yes' ? 'yes' : f.Coming === 'No' ? 'no' : '',
      headcount: f.Headcount || 0,
      song: f['Entry song'] || '',
      performance: f['Other performance'] || '',
      mark: f.Mark || '',
      notes: f.Notes || '',
      submitted: f.Submitted || r.createdTime || '',
      people: (f.People || []).map(id => P.get(id)).filter(Boolean).map(p => ({
        id: p.id, name: p.fields['Full name'] || '', phone: p.fields.Phone || '',
        dob: p.fields['Date of birth'] || '', photo: !!(p.fields.Photo && p.fields.Photo.length)
      }))
    };
  };
  return {
    event: event ? { name: event.fields['Event name'] || eventName, date: event.fields.Date || '',
                     start: event.fields['Start time'] || '', place: event.fields.Place || '',
                     host: event.fields.Host || '', status: event.fields.Status || '' }
                 : { name: eventName },
    replies: mine.map(shape).sort((a, b) => String(b.submitted).localeCompare(String(a.submitted))),
    sponsors: sponsors.filter(s => !event || !(s.fields.Event || []).length || (s.fields.Event || []).includes(event.id)).map(s => ({
      id: s.id, name: s.fields.Name || '', org: s.fields['Family or business'] || '', contact: s.fields.Contact || '',
      phone: s.fields.Phone || '', email: s.fields.Email || '', amount: s.fields['Donation Amount'] || 0,
      method: s.fields['Payment Method'] || '', recognition: s.fields.Recognition || '',
      recognitionDate: s.fields['Recognition Date'] || '', photo: !!(s.fields.Photo && s.fields.Photo.length),
      idea: s.fields['What they have in mind'] || '', status: s.fields.Status || 'New', submitted: s.fields.Submitted || s.createdTime || ''
    })),
    generated: new Date().toISOString()
  };
}

/* the hosts move a co-sponsor along: New, Contacted, Confirmed, Declined.
   Confirming dates the recognition, which is also the date on their letter. */
async function setSponsorStatus(env, q) {
  const id = String(q.id || '');
  if (!/^rec[A-Za-z0-9]{14}$/.test(id)) throw new Error('No such co-sponsor.');
  const status = ['New', 'Contacted', 'Confirmed', 'Declined'].includes(q.status) ? q.status : null;
  if (!status) throw new Error('Not a status.');
  const cur = await at(env, TABLES.sponsors, 'GET', '/' + id);
  const fields = { Status: status };
  if (status === 'Confirmed' && !cur.fields['Recognition Date']) {
    fields['Recognition Date'] = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  }
  const r = await at(env, TABLES.sponsors, 'PATCH', '/' + id, { fields });
  return { ok: true, id, status: r.fields.Status, recognitionDate: r.fields['Recognition Date'] || '' };
}

/* ---------- Co-sponsor ---------- */
async function handleSponsor(b, env) {
  const name = str(b.name, 120);
  if (!name) throw new Error('name missing');
  const email = str(b.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('email missing');
  const phone = digits(b.phone);
  if (phone.length < 7) throw new Error('phone missing');
  const amount = Math.round((parseFloat(String(b.amount || '').replace(/[^0-9.]/g, '')) || 0) * 100) / 100;
  if (!(amount >= 1 && amount <= 1000000)) throw new Error('amount missing');
  const method = ['Check', 'Zelle'].includes(b.method) ? b.method : 'Check';
  const anonymous = !!b.anonymous;
  const recognition = anonymous ? 'Anonymous' : (str(b.recognition, 200) || str(b.from, 160) || name);
  const event = await findOrCreate(env, TABLES.events, 'Event name', str(b.event, 120) || 'Diwali 2026');
  const fields = {
    'Name': name,
    'Family or business': str(b.from, 160),
    'Phone': phone,
    'Email': email,
    'Contact': email,
    'Donation Amount': amount,
    'Payment Method': method,
    'Recognition': recognition,
    'What they have in mind': str(b.note, 2000),
    'Event': [event.id],
    'Status': 'New',
    'Submitted': new Date().toISOString()
  };
  Object.keys(fields).forEach(k => fields[k] === '' && delete fields[k]);
  const saved = await createOne(env, TABLES.sponsors, fields);
  // a photo is only kept if they chose to be recognised by name
  const photo = !anonymous && b.photo ? await putPhoto(env, TABLES.sponsors, saved.id, 'Photo', b.photo, false) : false;
  return { ok: true, id: saved.id, photo };
}
