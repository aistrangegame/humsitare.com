# Five Lamps — design package for the Diwali wall

Sitaron Ki Mehfil · Saturday 21 November 2026 · Bensalem PA · prepared 4 November 2026

## What this is
A 15 ft × 5 ft printed fabric panel for the entry wall of the hall. One night turns to morning from left to right. A golden thread of clay lamps runs along the top; its lamps stay dark until the end of the first story, then each catches from the last, and the last is pure light. Five Diwali stories sit inside the one night, each in its own folk-art language:

| # | Story | Art language | Ground |
|---|---|---|---|
| 1 | Narakasura · The Son Who Forgot | Sanjhi cut-paper silhouettes | near-black, ember glow from below |
| 2 | Lakshmi · What the Ocean Was Keeping | rangoli / kolam (white dot-and-loop lines) | deep ocean blue |
| 3 | Mahavira · The Light That Was Already Inside | Kalpa Sutra manuscript folios | vermilion, lapis, gold on maroon |
| 4 | Bandi Chhor · Fifty-Two Threads | one burnished gold line, like zari embroidery | saffron-amber |
| 5 | Rama · Coming Home | Indian shadow puppets (translucent, perforated) | backlit dawn cream |

## The route
1. **Ashrey** paints each story section in Gemini from the reference images and prompts below.
2. **Yarrington (designer)** composites the Gemini paintings under the vector master, blends the seams, upscales, and proofs.
3. **Yarrington (printer)** runs a test strip, then the full panel.

## Part 1 · Gemini prompts (for Ashrey)
For each story: open Gemini's image model, attach the matching file from `gemini-references/`, choose a **4:5 portrait** aspect ratio and the highest resolution offered, and paste the shared style block followed by that story's block. Generate 3–4 options per story; keep the one whose composition matches the reference most closely. Save each at full resolution as `story-N-gemini.png`.

**Shared style block (paste first, every time)**
> Repaint the attached reference image as a rich, finished illustration for one section of a 15-foot printed fabric wall panel celebrating Diwali. Keep the composition exactly: every element stays where it is in the reference, at the same size and proportion. Make it lush and textured, as if hand-made in the art tradition named below, with warm candlelit depth. Rules: no faces or facial features on any figure (silhouettes and profiles only); no text, letters or numbers anywhere; no QR codes. Paint the top 30% of the image as open sky only, with no lamps or thread in it (the lamp row is added separately later). Keep the left and right edges as plain sky in the edge colours given, so this section can blend into its neighbours. Counted details (crowns, tassels, small lamps) may be simplified; they are added precisely later.

**Story 1 · Narakasura** (`1-narakasura.png`)
> Art tradition: Sanjhi, the cut-paper stencil art of Braj. Intricate black cut-paper silhouettes with filigree cut-outs (vines, leaves, arches), layered with slight depth, backlit by a deep ember-red glow rising from below; the darkest section of the wall. Left: a great mound of earth (the Earth as mother) cradling a small seated child, a thin ring of light above the child. Centre: a domed palace with only dark windows and a barred gate, a figure on the rampart holding up a pair of earrings. Right: a chariot with a spoked wheel carrying two figures, one drawing a bow; at the bottom right a fallen figure at rest beside one small lit clay lamp, the only warm flame. Edge colours: left #050409, right #0a0a1c.

**Story 2 · Lakshmi** (`2-lakshmi.png`)
> Art tradition: South Indian kolam and rangoli, white rice-flour dot grids and continuous looping lines, with sparing coloured powder accents (marigold, turquoise, magenta) on a deep ocean-blue night. Waves drawn as kolam loops. Left: a lotus sinking down through a column of dotted circles. Centre: a tall dark mountain wrapped by a pale serpent used as a rope, a pair of figures pulling at each end; above the peak a dark violet plume of poison rising toward a trident and a small blue circle (Shiva holding the poison, shown only by these symbols). Right: a crescent moon and a small wish-tree rising, then a great rangoli lotus mandala in white and gold with a luminous seated figure on it and gold rays around her. Edge colours: left #0a0a1c, right #3a1a30.

**Story 3 · Mahavira** (`3-mahavira.png`)
> Art tradition: Western Indian Jain manuscript painting of the Kalpa Sutra: three vertical folios with vermilion grounds, lapis-blue and burnished-gold borders, dotted floral margins, flat gold figures, between them a deep maroon night warming toward dawn. Folio 1: a seated figure in meditation in gold with a soft halo, small listeners below. Folio 2: an empty seat, above it a gold crescent with a dot (the siddhashila), and below two rows of small crowns, each with a lit lamp. Folio 3: a seated figure in dark maroon with one lamp glowing at the heart, a dotted arc of light above. Edge colours: left #3a1a30, right #8a3418.

**Story 4 · Bandi Chhor** (`4-bandi-chhor.png`)
> Art tradition: zari embroidery, a single continuous burnished-gold metallic thread on saffron-amber silk, drawing every shape in line. Left: a fortress in gold outline, rows of small crowns inside its walls. Centre: an empty, flowing cloak with no person inside it, long gold tassels streaming from its hem, one tassel noticeably longer than the rest. Right: small crowns walking out each holding a thread from the cloak, and a golden temple on water outlined in tiny lamps, its reflection below. Do not depict any person wearing the cloak. Edge colours: left #9a4018, right #e7b060.

**Story 5 · Rama** (`5-rama.png`)
> Art tradition: Indian leather shadow puppetry (Tholu Bommalata, Togalu Gombeyaata): translucent painted figures in crimson, saffron, emerald and indigo with decorative perforations that let light through, bold dark outlines, stylised trees, on a glowing dawn-cream screen lit from behind; the brightest section of the wall. Figures in profile without eyes or features. Left: a forest with two figures walking, one carrying a bow. Centre: a lone standing figure before a great faint golden wheel (Vishnu's chakra). Right: the gate and rooftops of Ayodhya lined with clay lamps, a road of lamps leading in, two figures arriving. Edge colours: left #e9b56a, right #fbf5e8.

## Part 2 · Designer brief (for Yarrington)

**Finished size:** 180 in × 60 in (15 ft × 5 ft), landscape, one continuous piece. Mounted with the bottom edge 48 in from the floor on an 18 ft wall.
**Fabric and frame:** printed on AKAS/Wazoodle fabric, framed and mounted. To confirm with Ashrey: which fabric; whether 15 ft can run seamless; frame type and how much bleed and wrap it needs (the art is 60 in tall, the full width of a 60 in roll, so bleed may need a wider roll or a slightly smaller live area).
**Resolution:** vector layers stay vector. Raster areas at 100–150 dpi at full size (about 18,000–27,000 px wide). Gemini output is about 2K; upscale with a faithful upscaler (Topaz Gigapixel or similar), not a detail-inventing one.
**Colour:** master is sRGB. Watch the dark left third: large near-black areas on fabric need a test (they can print muddy or uneven).

**The master file:** `five-lamps-master.svg`, drawn in inches (viewBox 0 0 180 60). Layers, bottom to top:

| Layer id | What it holds | What to do |
|---|---|---|
| 01-sky-and-unlit-lamps | the night-to-dawn sky ramp, faint unlit lamps in the dark end | replace with the Gemini skies, blended into one continuous ramp |
| 02 … 06 story layers | the five scenes, 36 in wide each (x 0, 36, 72, 108, 144), scene band y 14–46 | replace each with its Gemini painting, aligned to the same positions |
| 07-thread-and-lamps | the gold thread and its 38 lamps; first flame at x 33 in; last lamp is light only | keep on top, unchanged |
| 08-words-band | the ground line at y 46 and the words band below (dark under 1–3, cream under 4–5) | keep; may add texture |
| 09-codes-main | five main codes, 3.6 in, top right of each words band | keep exactly |
| 10-codes-hidden | five hidden codes, 1.25 in, inside the art | keep exactly; may be framed as small ornaments |
| 11-words | opening, closing, five titles, fifteen captions | keep; fonts below |

**Things that must stay exact (from the vector, not from Gemini):** 52 crowns in the fort and 53 tassels on the cloak, one longer (story 4); 18 crowns, each with a lamp (story 3); the lamp thread and its lighting order; every word; every code.
**Never:** a face or facial feature on any figure; the Sikh Guru shown in person (the cloak only); text added by the generator; a code resized, recoloured or crowded.
**Fonts (free, Google Fonts):** Cormorant Garamond 600 (titles), Cormorant Garamond 500 italic (opening and closing), Mukta 400 (captions). Captions 0.85 in, titles 1.2 in.
**Seams:** each story's edges are painted to agreed colours; blend neighbours with Generative Fill so the wall reads as one night.

**Codes (do not change):**

| Code | Size | Opens | Where |
|---|---|---|---|
| main 1–5 | 3.6 in | humsitare.com/diwali/qrcode-1 … qrcode-5 | words band, top right of each story |
| hidden 6 | 1.25 in | humsitare.com/diwali/qrcode-6 (Satyabhama's view) | by the archer on the chariot |
| hidden 7 | 1.25 in | humsitare.com/diwali/qrcode-7 (Shiva's view) | beside the blue circle under the trident |
| hidden 8 | 1.25 in | humsitare.com/diwali/qrcode-8 (Gautama's view) | at the lamp in the third folio |
| hidden 9 | 1.25 in | humsitare.com/diwali/qrcode-9 (the 53rd tassel) | at the tip of the longest tassel |
| hidden 10 | 1.25 in | humsitare.com/diwali/qrcode-10 (a lamp-lighter) | on Ayodhya's right-hand building |

Each address is a permanent printed address; the site redirects it to wherever that code should lead, so the destination can change without reprinting.

All ten were decoded from the master file before hand-off.

**Proof before the full run:** print one 36 in section, the darkest (story 1) with its main and hidden code. Check the dark detail, the gold, the caption size at 2–3 ft, and scan both codes with an iPhone and an Android phone from 1–2 ft.

## Files
- `five-lamps-master.svg` — the layered vector master
- `five-lamps-preview.png` — the whole panel at 40 px per inch
- `gemini-references/1-narakasura.png` … `5-rama.png` — the five reference images for Gemini
- `BRIEF.md` — this brief
