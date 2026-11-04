"""Layers that exist only in the print master: real QR codes and the words, as SVG text.
Units: inches (panel viewBox 0 0 180 60)."""
import segno

BASE = "https://humsitare.com/diwali/qrcode-"
MAIN = ["1", "2", "3", "4", "5"]
HIDDEN_PATHS = ["6", "7", "8", "9", "10"]  # Satyabhama · Shiva · Gautama · the 53rd tassel · a lamp-lighter
CREAM, INK = "#f4e9d4", "#2b1a0e"

TITLES = ["Narakasura · The Son Who Forgot", "Lakshmi · What the Ocean Was Keeping",
          "Mahavira · The Light That Was Already Inside", "Bandi Chhor · Fifty-Two Threads", "Rama · Coming Home"]
CAPTIONS = [
    ["Born of the Earth, only his mother could end him.", "He forgot whose son he was, and took until his city went dark.", "His mother came for him. He asked to be remembered with lamps."],
    ["A blessing, lost, sank into the ocean of milk.", "They churned beside the ones they feared. Poison rose first.", "They kept going. What was lost rose on a lotus."],
    ["He taught a way of seeing with nothing in the way.", "When his light left the world, eighteen kings lit lamps.", "His student let go, and found the light was his own."],
    ["Fifty-two kings in a fort, long past hoping.", "The Guru would not leave alone. His cloak grew threads.", "They walked out together. Amritsar lit every lamp."],
    ["Fourteen years in the forest, a prince without a palace.", "“Tell me who I am.” Even he had forgotten.", "On the darkest night, his people lit the way home."],
]
OPENING = "We come into this life with a forgetting. Diwali is the night we help each other remember."
CLOSING = "Every lamp in this room was lit from another. Thank you for bringing yours."


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def wrap(text, width_in, size_in, em=0.5):
    per = max(8, int(width_in / (size_in * em)))
    lines, cur = [], ""
    for w in text.split():
        if len(cur) + len(w) + (1 if cur else 0) > per:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return lines


def text_block(x, y, text, size, width, color, family, italic=False, weight=400, anchor="start", lh=1.3, em=0.5):
    lines = wrap(text, width, size, em)
    style = f'font-family:{family};font-size:{size}px;font-weight:{weight};{"font-style:italic;" if italic else ""}'
    out = [f'<text x="{x}" y="{y}" fill="{color}" text-anchor="{anchor}" style="{style}">']
    for i, ln in enumerate(lines):
        out.append(f'<tspan x="{x}" dy="{0 if i == 0 else round(size*lh, 3)}">{esc(ln)}</tspan>')
    out.append("</text>")
    return "".join(out)


def qr(x, y, size, url, dark=INK, light="#fbf7ee", tile_pad=0.12, rx=0.12):
    q = segno.make(url, error="m", boost_error=False)
    m = q.matrix
    n = len(m)
    quiet = 2  # modules of quiet zone inside the tile
    mod = (size - 2 * tile_pad) / (n + 2 * quiet)
    ox = x + tile_pad + quiet * mod
    oy = y + tile_pad + quiet * mod
    d = []
    for r, row in enumerate(m):
        for c, v in enumerate(row):
            if v:
                d.append(f"M{ox + c*mod:.4f},{oy + r*mod:.4f}h{mod:.4f}v{mod:.4f}h-{mod:.4f}z")
    return (f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{rx}" fill="{light}"/>'
            f'<path d="{"".join(d)}" fill="{dark}"/>')


def layers(hidden_positions):
    g = ['<g id="09-codes-main">']
    for i, sx in enumerate([0, 36, 72, 108, 144]):
        g.append(qr(sx + 31.6, 46.9, 3.6, BASE + MAIN[i]))
    g.append('</g><g id="10-codes-hidden">')
    for (x, y), path in zip(hidden_positions, HIDDEN_PATHS):
        s = 1.25
        g.append(qr(x - 0.12, y - 0.12, s, BASE + path, light="#f6ead0", tile_pad=0.08, rx=0.18))
    g.append('</g><g id="11-words">')
    g.append(text_block(1.5, 16.4, OPENING, 1.05, 19, CREAM, "'Cormorant Garamond',serif", italic=True, weight=500, em=0.44))
    g.append(text_block(178.5, 16.4, CLOSING, 1.05, 21, INK, "'Cormorant Garamond',serif", italic=True, weight=500, anchor="end", em=0.44))
    for i, sx in enumerate([0, 36, 72, 108, 144]):
        col = CREAM if i < 3 else INK
        g.append(text_block(sx + 1.5, 48.2, TITLES[i], 1.2, 29, col, "'Cormorant Garamond',serif", weight=600, em=0.46))
        for b in range(3):
            width = 8.5 if (i == 2 and b == 2) else 10.5
            g.append(text_block(sx + 1.0 + b * 12, 52.0, CAPTIONS[i][b], 0.85, width, col, "'Mukta',sans-serif", lh=1.25))
    g.append('</g>')
    return "".join(g)
