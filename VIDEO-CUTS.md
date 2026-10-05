# Cutting the videos — brief for Claude Code

Thirteen source videos, about 830MB. Eleven are `.MOV`, which Safari plays and Chrome and Firefox do not. Everything that lands on the page has to be `.mp4`, H.264 video, AAC audio.

The page wants short clips, not whole videos. Six to ten seconds each, 2–5MB. The full-length originals belong in the Google Photos album, which the page already links to.

---

## Step one — Ashrey fills this in

Scrub each video once and write down the moments worth keeping. One row per clip; one source can produce several.

| Source file | From | To | Becomes | Note |
|---|---|---|---|---|
| IMG_5804.MOV | 00:12 | 00:20 | story-dancing-1 | |
| IMG_5804.MOV | 01:34 | 01:42 | story-dancing-2 | |
| IMG_3184.MOV | 00:05 | 00:13 | story-fireworks-1 | |
| … | | | | |

**Slot names the page already expects:** `story-puja-1/2/3` · `story-stage-1/2/3` · `story-littleones-1/2/3` · `story-kitchen-1/2` · `story-dancing-1/2/3` · `story-fireworks-1/2` · `story-everyone-1/2/3`

A slot can be a photo or a video. Whatever you fill with video, note it — the page needs those keys listed in its `VIDEOS` array.

**Rules of thumb while scrubbing**
- Eight seconds is plenty. These sit inside a story that advances every five.
- Start on movement, not on the run-up to it.
- Vertical footage suits the full-screen story better than horizontal.
- Don't fill every slot with video. Two or three moving clips among nineteen stills is livelier than nineteen videos.

## Step two — Claude Code runs this

Per row in the table:

```bash
ffmpeg -ss 00:00:12 -to 00:00:20 -i "IMG_5804.MOV" \
  -vf "scale='min(1280,iw)':-2" \
  -c:v libx264 -preset slow -crf 26 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 96k \
  "images/story-dancing-1.mp4"
```

Why each part matters:
- `-ss` before `-i` seeks fast; `-to` is an absolute timestamp, not a duration.
- Re-encoding, not `-c copy` — a stream copy can only cut on keyframes and will miss the moment by up to a few seconds.
- `scale='min(1280,iw)'` caps the width without enlarging anything smaller. `-2` keeps the aspect ratio and an even height, which H.264 requires.
- `-crf 26` is the size dial. Lower is better and heavier; 23–28 is the useful range.
- `-pix_fmt yuv420p` — iPhone footage is often HEVC in a pixel format Chrome will not decode. This forces the compatible one.
- `+faststart` moves the index to the front of the file so playback begins before the download finishes. On a phone this is the difference between instant and broken.
- Keep the audio. The page plays muted, but it is there for anyone who taps.

**Check each one before moving on:**
```bash
ls -lh images/*.mp4                     # anything over 6MB, raise the crf and redo
ffprobe -v error -show_entries stream=codec_name,width,height,duration \
        -of default=noprint_wrappers=1 images/story-dancing-1.mp4
```
Expect `codec_name=h264`, a width at or under 1280, and a duration matching the row.

## Step three — tell the page

In `index.html`, list the slots that became video:

```js
const VIDEOS = ['dancing-1','dancing-2','fireworks-1'];
```

Nothing else changes. Anything not listed is still loaded as `.jpg`, and any file that is missing shows a quiet placeholder rather than breaking.

## The photographs, while you are in there

```bash
for f in *.jpg *.JPG *.jpeg; do
  ffmpeg -i "$f" -vf "scale='min(1600,iw)':-2" -q:v 4 "resized/$f"
done
```
1600px on the long edge, around 200–400KB. On a phone that is indistinguishable from the original and roughly ten times faster to arrive.

## Keep the originals
Convert into a new folder. Nothing in this brief should overwrite a source file.
