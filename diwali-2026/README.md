# Diwali 2026 · the Five Lamps wall and its phone stories

Working files for the storytelling wall at the Diwali evening (Saturday 21 November 2026, 5pm, 1370 Adams Road, Bensalem). **This folder is not part of the website**: it is listed in `.assetsignore`, so nothing here is served on humsitare.com. When the phone stories go live, they are published on purpose at `/diwali/lamps/<story>/`.

## What is here
- `stories/` — the five stories. `stories-draft-2.md` is the fact-checked text (the binding words; the live source is the Claude Doc linked inside). `stories-draft-1.md` is the first draft.
- `wall/` — the 15 × 5 ft fabric panel.
  - `WALK.md`: the design walk and its rulings.
  - `gen_panel.py` + `master_layers.py`: generate the panel SVG with real QR codes (`humsitare.com/diwali/qrcode-1` … `-10`).
  - `panel.svg`, `five-lamps-preview.jpg`.
  - `package/`: what went to Shubh and Yarrington (brief, master SVG, Gemini references).
  - `hidden-views.md`: the five hidden told voices (codes 6–10).
- `phone/` — what a guest sees after scanning a code.
  - `PHONE-WALK.md`: the phone walk, every ruling, the process review and what is still open.
  - `lamps/`: the shared engine (`engine.js`, `engine.css`) and one page per story (`narakasura`, `lakshmi`, `mahavira`, `bandi-chhor`, `rama`). Accepted by Ashrey on 4 Nov 2026.
  - `prototype/`: the earlier single-file Narakasura, kept for reference.

## Previews (claude.ai artifacts)
- Narakasura: https://claude.ai/artifact/6pG6hk62oRDEBFYAkjESBM
- Lakshmi: https://claude.ai/artifact/9r945BKP81x8FE5ZWpq7sm
- Mahavira: https://claude.ai/artifact/A8M7SdM2P9Hk7rRvbYoYzo
- Bandi Chhor: https://claude.ai/artifact/MzT6W1JQSwBRrToG91xUy9
- Rama: https://claude.ai/artifact/Nex3AbV1QtYe2MeKBHB8nP

## Data
Airtable base `appxxy5cyH5pf9OoS`: **QR Codes** (`tblzpsLxvWRT2oAGG`, qrcode-1 … 10, Status Planned) and **Lamps** (`tbllEOcVpMVRu5RsQ`, guests' answers; not yet written to).

## Still open
See the end of `phone/PHONE-WALK.md`. In short:
- **The wall:** Shubh's Gemini paintings, the Yarrington conversation, Arch reading the stories, a test print.
- **Before it ships:** a Sikh family member looks at the Bandi Chhor cloak, and the stories are tried on a real phone.
- **Phone, still to build:** the room's real answers (Worker routes and the Lamps table), the five hidden views, and the QR redirects with an on-site scan of every code.
