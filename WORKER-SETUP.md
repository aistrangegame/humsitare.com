# Put the form receiver online

About ten minutes. The point of it: the page can then save a reply without ever holding an Airtable key, so nobody can read the base by viewing source.

## 1 — An Airtable token
airtable.com/create/tokens → **Create token**.

- Name: `sitaron-forms`
- Scopes: `data.records:read`, `data.records:write` — **nothing else**
- Access: the **Sitaron Ki Mehfil** base only

Copy it. Airtable shows it once.

## 2 — Deploy
From this folder:

```bash
npx wrangler login
npx wrangler secret put AIRTABLE_TOKEN      # paste the token
npx wrangler secret put AIRTABLE_BASE_ID    # appxxy5cyH5pf9OoS
npx wrangler deploy
```

It prints an address like `https://sitaron-forms.<your-subdomain>.workers.dev`.

## 3 — Check it is alive
```bash
curl https://sitaron-forms.<you>.workers.dev/health      # {"ok":true}
```

## 4 — Tell the page where to send
In `index.html`, near the top of the script:

```js
const EVENT={
  endpoint:"https://sitaron-forms.<you>.workers.dev",
  eventName:"Diwali 2026",
```

Until that is filled in, both forms validate normally and then say the form is not live yet. Nothing is lost and nobody sees an error.

## 5 — Once humsitare.com is live
In `worker.js`, `ALLOWED` lists the sites permitted to post. It already has `humsitare.com` and `www.humsitare.com`. Add any other address the page will sit on, then `npx wrangler deploy` again. A request from anywhere else is refused by the browser.

## What it does per reply
Finds or creates the Event · finds or creates the Family · creates or updates each person, linked to that family · writes one Replies row joining them, with coming/not, headcount, song, performance, the mark, and a timestamp.

## What is already guarded
- The token lives in Cloudflare, never in the page.
- A hidden field no human can see; anything that fills it is dropped silently.
- Every value is trimmed and length-capped; dates must be `YYYY-MM-DD`; headcount is clamped to 1–20.
- A person already in that family is updated rather than duplicated.
- Scoped to one base, read and write only, so a leaked token could not touch anything else.

## If a reply does not appear
`npx wrangler tail` streams live logs. The usual cause is a field name in Airtable that does not match this spec exactly.
