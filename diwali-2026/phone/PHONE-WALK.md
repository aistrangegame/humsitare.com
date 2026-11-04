# WALK — Five Lamps, the phone experience

**House:** humsitare.com (Sitare) · Diwali 2026. Look inherits the Five Lamps wall set (the phone is the wall come alive); the live invitation page stays untouched.
**Length and mode:** full · Generate.

## Rulings, 4 Nov 2026 (11:37)
- Stories are read on the phone for now. Hearing them (Arch or Ashrey's voice) waits for a recording session later.
- After answering, the guest chooses whether to share with the room. Sharing is a choice, made after the answer.
- A guest who shares picks anonymous or named. Anonymous sharers see every answer as anonymous; named sharers see names (reading taken: only the names of people who chose to be named; an anonymous answer never shows a name to anyone).
- Room answers are words alone.

## Parked thread (returns at the close)
- An interactive installation: press something at the wall and a speaker plays that story in the room. Joins the recording session.

## The map
| Stage | Dates (target) | Done when |
|---|---|---|
| 0–1 House, guest, facts, data shape | 4–5 Nov | facts table marked; Airtable shape for the code register and answers agreed |
| 2–3 Options, then one score; five hidden-view stories | 5–6 Nov | score buildable by someone else; hidden stories fact-checked |
| Build one story end to end | 6–8 Nov | live behind its qrcode address; Ashrey walks it in the hall |
| Build the rest | 9–13 Nov | all ten addresses resolve |
| Prove | 14–17 Nov | devices, weak signal, privacy, Arch's read |
| On site | 20 Nov | all ten codes scanned on the printed wall |

## 0 · House
humsitare.com, Sitare house. The page inherits the **Five Lamps wall set** (the night-to-dawn palette per story, Cormorant Garamond + Mukta, the gold thread and lamps): stated departure from the invitation page's own look, because the phone is the wall come alive. The invitation's lamp-lit → night → dawn ground and its lighting ritual are corpus (reference). Same origin as the invitation, so it can read what the invitation already keeps on the phone.

## 1 · Inhabit
**Mechanism line:** the wall carried into the hand — a story you watch come alive, a question you answer alone, and only then, if you choose, the room's answers, each one a lamp lit from another, kept against your number so next Diwali begins with your own words.
**Nearest thing it is not:** a survey or feedback form (or a museum audio-guide page). "Answer alone, then choose", "lit from another" and "next Diwali begins with your own words" keep it from that: nothing is asked for the host's benefit, the room is a gift you unlock, and it remembers you, not your score.

**Readers:** a guest standing at the wall after scanning, often in a group, signal unknown; an elder who needs larger type and no rush; a child hunting hidden codes; a family sharing one phone; the hosts watching the room on the night; the same guest next Diwali.

| fact (with condition) | kind | weight |
|---|---|---|
| Ten printed addresses humsitare.com/diwali/qrcode-1…10 (1–5 stories, 6–10 hidden views), permanent; each redirected | observed (ruled) | binding |
| humsitare.com = Worker + static assets; static assets can carry a `_redirects` file | observed (memory) / inferred | binding |
| Repo aistrangegame/humsitare.com: last commit 7 Oct (index.html, dashboard.html, images, sound); no worker.js or wrangler config in the repo; the live site was corrected after that (15 Oct) | observed | binding: the live files, not the repo, are the base |
| The forms Worker `sitaron-forms.ashreys.workers.dev` handles every write; its source is not in the repo | observed | unknown — need worker.js to add routes |
| Delivery: Ashrey deploys; hand over individual index.html / worker.js, never a zip | observed (preference) | binding |
| The invitation keeps on the phone `rk:sitarey-guest:v7` (the guest's name) and `rk:sitarey-reply:v6` (name, family, coming, count) — not the phone number | observed (index.html 4611–4807) | binding: the phone page can greet a guest by name without asking |
| People table keys a human by Phone (People.Phone fldr7Ig03k6OqnWut); Events row "Diwali 2026" exists | observed | binding |
| Answers saved against phone number, separate from Replies | observed (ruled) | binding |
| Private first; share is a choice after answering; anonymous or named; anonymous sharers see all anonymous, named sharers see names; an anonymous answer never shows a name to anyone | observed (ruled) | binding |
| Room answers are words alone | observed (ruled) | binding |
| Stories read, not heard, for now | observed (ruled) | binding |
| Next year opens with the guest's own words from this year | observed (ruled) | binding |
| Reading back private words by phone number alone would let anyone who knows a number read them | inferred | binding (privacy floor) — needs a second key |
| Hall signal / guest Wi-Fi | unknown | binding once known |
| Five story texts (Five Lamps draft 2) and their questions (drafts) | observed | binding words; questions to settle in stage 2 |
| Five hidden-view stories | unknown (to write) | binding once checked |
| Host view: hide any shared answer with one tap | proposed | to rule |

## Data shape (proposed, base appxxy5cyH5pf9OoS)
**QR Codes** — one row per printed address, for every event, forever.
Code (primary, e.g. `diwali/qrcode-1`) · Event → Events · Printed address (URL) · Leads to (path or URL) · Kind (Story · Hidden view · Other) · Where it is printed (text) · Status (Planned · Printed · Live · Retired) · Notes. The site's `_redirects` file is written from this table.

**Lamps** — one row per answer.
Lamp (autonumber, primary) · Event → Events · Code → QR Codes (which story) · Question (the words asked, kept as asked) · Words · Phone · Person → People (when the phone matches) · Shared (Not shared · Anonymous · Named) · Name shown (only when Named) · Hidden by host (checkbox) · Answered at · Client id (so a resend never doubles).
Guarded in the Worker: the room view returns words (and a name only when Named and the viewer is named); never a phone, never a Person.

## Rulings, 4 Nov 2026 (11:51)
- Hall has guest Wi-Fi; the router is beside the wall.
- Next year's read-back is not built now: answers are captured, to resurface later "as a form of remembering". Phone + birth year when a birth year is on file; phone alone otherwise.
- Progressive identity: if the phone is missing, ask at the first code; at any later code ask for what is still missing (phone, then birthday and email), once each. People.Email added (fldKzEqTEKynmWSAr).
- worker.js: live copy = ~/Hum Sitare/sitaron-worker/worker.js (identical sha256 to the file Ashrey sent); saved to Project docs claude/sitaron-worker/worker.js and to memory.

## Stage 1 · built (4 Nov 2026)
- QR Codes tblzpsLxvWRT2oAGG: Code fld6VFzRsUAhU8xi9 · Event fldDz0pylOKgC2nSX · Printed address fldy2f0LHwFj5pkS6 · Leads to fldLISydZL7Hx63s8 · Kind fld8S27i07RmzzkFf · Where it is printed fldVwVBGGOjWkHwqu · Status fld8ol3zCyc8jnu2c · Notes fldOwUzhIU4KuAZwf. Ten rows (qrcode-1 … 10), Status Planned, linked to Diwali 2026 recBHjkli3cY4QH7e; destinations /diwali/lamps/<slug>.
- Lamps tbllEOcVpMVRu5RsQ: Lamp fldnfHJVHd0WERIoS · Event fldOEYznlupO1Z5pK · Code fldLTsUy9uP3wExhx · Question fldJFl8cwkVQ7PsrL · Words fldjD59pLVcgqGDQc · Phone fldTkMaEcjODlt5FA · Person fldn8cGOJWNq1luGj · Shared fldzNbUFWMDtKK70g · Name shown fldmef4qpjIxT1Q8P · Hidden by host fldiFUOoW6tcIcY13 · Answered at fld1YgMDhQVmyenni · Client id fldtkk5VcLrwnlomc.
- Note for the Worker: it writes by field name; the token is scoped to this base, so the two new tables are reachable without a new token.

## 2 · Blink (shelves opened: forms, motion, seam, gates, device, ground, play, voice)
**Ashrey — what is it, as one body?** (a) a Rite: arrival → reading → gathering → recognition → sealing (shelf-forms) · (b) a storybook walked one screen at a time · (c) a lamp you carry from the wall into your hand and back. → meets Gaia.
**Gaia — who arrives, what first?** (a) the wall's own section, exactly as printed, so the scan feels continuous · (b) greeted by name when the invitation already knows them · (c) one unlit lamp and nothing else.
**Neev — what does it stand on?** (a) the story's own colour from the wall's night-to-dawn ramp · (b) Wi-Fi beside the wall: load the whole story at once, then nothing waits · (c) an answer is kept on the phone first, sent second (shelf-device queue, client id).
**Shweta — the medium?** (a) a phone held in a warm, noisy hall, often by two people · (b) large type, one idea per screen, nothing small to tap · (c) read, not heard (ruled), so the words carry the pace.
**Sid — what must never fail?** (a) privacy: no phone or person ever returned; anonymous never shows a name (shelf-gates) · (b) the answer is never lost (queue + client id + match-before-create) · (c) a printed code always lands (302 redirects from the QR Codes table, so phones never cache a wrong destination).
**Arch — how does it speak?** (a) story in the Five Lamps register, three beats then the full text · (b) the receipt sentence: "Kept. Only you can see this." (shelf-voice) · (c) one plain line for each share choice, saying exactly what others will see.
**Bindu — what moves?** (a) the wall's art itself, a camera gliding across the 36-inch section beat by beat (shelf-motion persistent-canvas story: viewBox fixed, camera is a transform) · (b) the flame catching when you tap the lamp (the invitation's strike, reused) · (c) the room's answers arriving as lamps lighting one by one.
**Sakshi — what is revealed by travelling?** (a) the room only after your own answer (share to see) · (b) the hidden lamps: found only at the wall · (c) next year: your own words return first.
**Karishma — works before anyone looks?** (a) every story readable with no network after the first load · (b) the finished state (all text visible) under reduced motion · (c) honest empty room: "Yours is the first lamp here."
**Lalita — the one unexplained thing?** (a) the 53rd thread's page ends "Go on. Hold on." and nothing else · (b) a small count of hidden lamps found, kept only on the phone · (c) the last screen's lamp is the same one you lit at the start.

### Meetings
1. **The lamp you carry** (Ashrey × Bindu × Lalita): you light it to begin, it brightens as the story walks, it becomes your answer, and if you share it, it takes its place on the room's thread.
2. **The wall moves** (Gaia × Bindu): the phone opens on the printed section and the camera travels its three beats, so the scan is the wall coming alive.
3. **Share to see, without exposure** (Sakshi × Sid): your words first, then the choice, then the room — names only between people who chose names.

## 3 · Converge — the score (one story: Narakasura, qrcode-1)
Shape: Rite (shelf-forms). Body: a corridor, one screen per step, scroll-snapped, progress drives the camera.
1. **Arrival** · the printed section, dark; one unlit lamp; "Welcome, <name>" when the phone knows it. Tap the lamp → the flame catches (≈1 s).
2–4. **Three beats** · camera glides to each beat (≈1.4 s ease, reduced motion: cut); the wall caption in large type, the full paragraph beneath.
5. **The turn** · the story's closing line alone; the lamp brightens.
6. **The question** · "Just for you." Text box. "Keep it" (deliberate hold, ≈1.25 s). If the phone has no number on file, ask once here: "So your words can find you next Diwali." Receipt: "Kept. Only you can see this."
7. **The choice** · Keep it mine · Light it for the room without my name · Light it for the room with my name. One line under each says what others see.
8. **The room** · this story's lamps on a small thread; tap one to read. Named sharers see names of those who chose names; everyone else sees words only. Refreshes every 20 s. Empty: "Yours is the first lamp here."
9. **Onward** · the five stories as five lamps (lit = visited on this phone); "Some lamps are hidden in the art."
Later codes: each asks once for the next missing detail (birthday, then email).
**Hidden views (qrcode-6…10)** · arrival on the figure → the told voice in three screens → "You found a hidden lamp" (count kept on the phone). No question (reading taken).
**Worker routes (sitaron-forms):** POST /lamp (create/update by client id; match Person by phone) · POST /room (code + viewer's share mode → words, names only when both named; never phone/person; hides host-hidden) · POST /dash-lamps (token → list, hide/unhide).
**Site files:** `_redirects` (302) written from QR Codes; `/diwali/lamps/<slug>/index.html` one per code from one template + data.
**Pieces:** reuse lamp strike (humsitare index.html) · reuse queue + client id (shelf-gates/device) · vary persistent-canvas story (shelf-motion) for the wall camera · reuse receipt sentence (shelf-voice) · new: the room thread of lamps.
- Hidden views draft 2: second reader's five fixes applied (Krishna had fallen; Parvati's hands; 'not for fixing'; lamp-lighter 'nobody could be sure'; Kalpa Sutra + later tradition; 'invented for this wall' shown beside pieces 9 and 10).

## Stage 2, redone (4 Nov 2026 12:15)
Failure named: the first storyboard cropped the wall mockup (a guide for the designer) into phone frames, so words and pictures did not match. Inhabit was skipped: the phone is its own piece, composed upright, each scene written with its words.
Ruled by Claude (Ashrey asked Claude to lead): the phone tells each story in motion, built in code, in that story's art language; one scene per paragraph of the story (not the wall's three captions); painted layers optional later.
Built: story 1 Narakasura as a walkable prototype (artifact "The Son Who Forgot"): arrival with a lamp to light → five scenes (born of the Earth, the city of taking, the chariot, he knew her, kept with lamps) → the turn → private question with hold-to-keep and receipt → share choice → the room → onward. Local only: nothing is sent yet (stage 3 wires the Worker and Lamps).
Pieces: corridor (shelf-forms, nearest-centre timestamp-throttled) · persistent picture with layers that rise (shelf-motion) · hold to keep (shelf-gesture) · receipt sentence (shelf-voice) · reduced motion = finished state.

## Ruling, 4 Nov 2026 12:20
- A guest may skip the question. Skipping still opens the room, showing only what others shared without names (supersedes "share to see" for those who skip).
- Fixed: the keep hold no longer cancels when the keyboard closes (pointer capture; textarea blurs on hold); the label resets as they type. Version 2 published.
- Ashrey: picture and words still don't match; the drawing could use an upgrade.

## Full shelf read (4 Nov 2026, 12:30) — all 15 shelves, every file, by three readers + the core read directly
What applies, by role:
- Story engine: shelf-motion "persistent-canvas story" — the-dome/site/play/story-drawn.html + site/assets/js/timeline-art/kit.js: SD.chapter({n, cam, bg, k, bed, tone, light, words, build, play, settle}); ctx draw(path,secs), glide, cascade, wait, tween, fade, sparks, ripple, show; all chapters built up front; camera = transform, viewBox fixed; settle finishes if pushed early. The shelves point to it; the code itself must be read (not yet opened).
- Pacing: shelf-time hard-lock pager (one gesture = one moment; PACE .52 ≈ 10 s a moment; leaving mid-draw finishes it; RM = end states). Lines at 700 + i·1900, fade 1,600; one pivot line slower (zorb hold-ring narrative). One numbers file for every duration.
- Drawing: few marks per figure; distinctness test (greyscale contact sheet at p 0/.32/.6/.85/1) so each figure is nameable from silhouette; the figure's words() = the caption's noun. Ink once and never move again for the ending lamp.
- Acts: humsitare hold-to-strike 700 ms (Enter/Space twin, 18 ms vibrate), light before the bell; keep = 1,250 ms hold, early release drains and loses nothing; tap/key always a way through; 44 px.
- Sound: the bell only, because the guest struck the lamp; tone peak derived from the motion fraction.
- Ground: humsitare's own 12-stop scroll ground (lamp-lit → night → dawn → cream) is the evening's sky; contrast measured as rendered.
- Page form: Rite (arrival → reading → gathering → recognition → sealing) on the corridor engine (nearest-centre, 80 ms, never IntersectionObserver).
- Words: receipt sentence names where it was kept and that nothing else was sent; "Imagined" on scenes not from the evening; lines that worked ("Kept." "Nothing here is waiting on you.").
- Care/privacy: MIN_COUNT 3 before the room shows; nothing owed; no verdict.
- Write path: cwid queue, 2xx/409 done, 422 parks; match by Client id; link by record id, no typecast; Origin check, 64 KB cap, honeypot; mock store says stored: local.
- Redirects: shelves only know 301 static _redirects; reading taken: 302 (codes re-pointable from the QR Codes table), one hop to a page that answers 200.
- Host view: passcode door (≥6 digits, counted before check), HMAC token, private no-store; hide by hold; never delete.
- Proving: reader first, journeys incl. offline → refused → recovered, stranger fetch for any phone/person, walkcheck 390/844/1440, RM, hold census.
Not on any shelf: figurative illustration. The answer is the five-mark / few-cut figure language proven by the distinctness test, not my freehand blobs.

## Narakasura, built on the Dome engine (4 Nov 2026, artifact version 3)

Built: arrival (hold 700 ms to light; light first, then bell; 18 ms vibrate) → five chapters drawn by the guest's flame on one canvas, never erased → the turn (flame returns to the guest's lamp) → private question (hold-to-keep 1,250 ms, receipt) → share choice → room (MIN_COUNT 3, labelled examples) → the other four lamps.
Carried from the Dome: makeCtx (draw, glide, cascade, sparks, ripple, phrases, settle-on-push), PACE 0.52, layers, line figures from HEAD + a few curves.
New pieces, made here:
- Flame as the point: the guest's struck lamp is converted to world coordinates and becomes the drawing light; it returns into the guest's lamp at the turn.
- Camera framed from the words: the ground (y = 0) sits just above where each page's words begin; scale is the smaller of width-fit and top-fit. Holds on 390×844, 360×640 and desktop without words covering the drawing.
- Line weight and flame size follow the camera (--sw, ptK) so wide shots stay readable.
- Forgetting and remembering as opacity across chapters: II dims the Earth-mother and ring; III relights the mother; V relights the child and ring.
Proved: full playthrough with no errors; at-rest captures at three sizes plus greyscale; journeys (named, anonymous, keep mine, skip, empty hold); reduced motion with keyboard only.
Reading taken (flag to Ashrey): "Keep it mine" still sees the room's words without names, the same as skipping, so answering privately never gives less than skipping.
Gaps seen:
- Wide shots (III, V) make the figures small on a phone; a close draw followed by a pull-back would read better.
- Sanjhi treatment is partial: the hill and city have cut-paper fills and perforations; no Sanjhi border yet.
- The horse is crude; animal figures need their own small vocabulary.
- Sound is the bell and chords only; no bed.
- The engine is inline in one page; it has to become one shared file before the other four stories.
- The room uses examples; real lamps need the Worker routes (POST /lamp, GET /room) and the Lamps table.
Opportunities seen:
- The wall's thread with five lamps is now in the drawing. Each story can light its own lamp on that same thread, and a returning phone can show the lamps it has already lit.
- Each hidden view can be one chapter on the same engine: one drawing, one voice.

### Ruling (Ashrey, 4 Nov): going back must make sense (artifact version 4)
- Stays one drawing; a revisited scene replays: the canvas rewinds to how it stood when that scene began (earlier scenes settled, later ones cleared), then the scene plays again. Going forward after that replays each scene in turn.
- Navigation: Back and Next buttons at the bottom with "II of V" between them. There is no Back on scene I. Swipes still work but need a deliberate push (120 px, or 70 px fast), so a stray touch does nothing.
- Proved: back mid-scene replays the scene before it from its start; going back again replays II from its start; a 60 px swipe does nothing; no errors.

## All five on one engine (4 Nov 2026)
Files: phone/lamps/engine.js + engine.css (shared) and one page per story: narakasura, lakshmi, mahavira, bandi-chhor, rama. Published as five artifacts that load the same engine files.
Asked by Ashrey and built: a closing sound for every scene (a chord in the scene's mood, unless the scene just sounded one); pictures on the three share choices; on the last page the five lamps of the wall (the ones this phone has lit glow), plus Bindu: after 3 s on the page the Bindu dot arrives and dances, using the Bindu Dances grammar without a song. A breath drives it; it blooms through trail, rings, rays and a crown; it traces infinity, a heart and a flower, spirals home to a dot, rests and begins again. It holds a wake lock while dancing.
Engine additions: scenes can move the camera inside themselves (start close, pull back to the wall); every story's last scene draws the wall's thread and lights its own lamp (1 to 5); the turn page brings the flame from that lamp into the guest's lamp; when a scene ends, any words still to come appear with it.
Treatments: Lakshmi in kolam (dot grid, looped wave, single-line rosette, pink powder at the lotus); Mahavira as a Kalpa Sutra folio (gold border, vermilion ground, two compartments); Bandi Chhor in zari (gold with a stitched shadow; the Guru only as a cloak hanging from a peg); Rama as shadow puppets (pierced coloured leather, a screen that warms each scene).
Process, per story: binding text (stories doc draft 2), a shot list at the top of the page, then build, a full playthrough with no errors, a capture of every scene start and end, fixes, a small-phone check in colour and greyscale, and a second reader who had not seen the build.
Second reader found, and fixed: Lakshmi's cow, tree and moon rose but were never drawn; the cloak with the flame resting at head height could read as the Guru (now a garment on a peg, flame to the side); the kings walked out over the emperor (he now fades); words finished after the picture; Rama's asking hand read as a wave; Rama and Sita blended into the city wall; Vasuki read as a rope; ghost figures in Lakshmi II and Narakasura IV; the wide final scenes of Lakshmi and Rama were too small (now they start close and the wall sits lower).
Still open:
- A Sikh family member should look at the cloak in Bandi Chhor before it ships.
- Mahavira IV: a seated, haloed Gautama could read as the Buddha to some relatives.
- Wide shots stay small on a phone (Narakasura III and V, Mahavira IV's end, Rama V).
- Narakasura II: the sixteen thousand women are only lights behind bars.
- Rama's turn text sits over the drawing; a soft shadow carries it.
- No one has heard the sound yet, and nothing has been tested on a real phone.
- The room shows examples; the Worker routes and Lamps table are next.
- The five lamps on the last page only remember lamps lit on the same site; as five separate previews each one sees only its own.

### Correction (Ashrey, 4 Nov): the set must move from dark to light
Miss: each story had been given its own dark ground, so the wall's arc (Narakasura darkest, Rama brightest) was lost on the phone. Rama ended dark.
Fix, a ladder of grounds: Narakasura near-black #060408 → Lakshmi night sea #08101F lightening to #1E2A4C → Mahavira warm umber #2A120C to #3A1C10 → Bandi Chhor rose before dawn #2E1222 to #5A3448 at Amritsar → Rama a light, lamp-lit screen #E9D2A6 with dark ink, which dims at the new moon (#6E5034) and floods at Ayodhya (#FFF2D8).
Engine: every surface colour is now a token (--note, --field, --surface, --kept, --tdoff, --chosen, --holdbg, --onGold) so a story can be light; Bindu draws deeper on a light page (S.light).
Lesson for the shelf: a set has its own arc above each piece's palette. Before choosing any one story's ground, place it on the set's ladder.

### Ruling (Ashrey, 4 Nov, 14:05): this round is accepted as it stands.
Forward edge: next session starts with the Worker routes for the room (POST /lamp, room read, Lamps table), then the five hidden views on the same engine, then a family member's look at the Bandi Chhor cloak and a real-phone test. The phone files are not yet in GitHub (phone/lamps/ in this workspace only).

## The close (4 Nov 2026, 14:25)
- Kept: the working files in GitHub (humsitare.com `diwali-2026/`, commit 5ecfc85, listed in .assetsignore, so not served).
- Kept: 14 ASG To-Dos under Goal recwDovAMRgAQNsDf, one marked Completed (recgLx5LGUWYy9Jx2).
- Kept: the library inbox `asg-library/inbox/2026-11-04-five-lamps/` (NEW-PIECES, LEARNED, BENDS; commit f863720).
- Kept: the hum-sitare skill card, shown to Ashrey to save.
- Skipped, with reasons:
  - No front-end changes on aistrangegame.com or humsitare.com: the stories are not live yet, and the Works pages update after the evening.
  - No atlas row: the close was kept proportionate at Ashrey's request to wrap up.
