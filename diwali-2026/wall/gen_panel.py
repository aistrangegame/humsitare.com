"""Five Lamps wall — panel art generator.
Units: inches. viewBox 0 0 180 60 (15 ft x 5 ft). Panel top = 9 ft from floor, bottom = 4 ft.
Bands: lamps/thread y 0-14 · scenes y 14-46 · ground line y 46 · words band y 46-60.
"""
import math, random, sys
MASTER = len(sys.argv) > 1 and sys.argv[1] == "master"
HIDDEN = []

random.seed(53)
W, H = 180, 60
out = []
def a(s): out.append(s)

def f(v): return f"{v:.2f}".rstrip("0").rstrip(".")

# ---------- shapes ----------
def diya(x, y, s, lit, clay="#3a2418", rim="#6b4a2e", flame_scale=1.0, glow=True, clayless=False):
    g = []
    if lit and glow:
        g.append(f'<circle cx="{f(x)}" cy="{f(y-0.9*s)}" r="{f(2.6*s*flame_scale)}" fill="url(#glow)"/>')
    if not clayless:
        g.append(f'<path d="M{f(x-1.15*s)},{f(y-0.15*s)} Q{f(x)},{f(y+1.0*s)} {f(x+1.15*s)},{f(y-0.15*s)} Q{f(x+0.55*s)},{f(y+0.05*s)} {f(x+0.35*s)},{f(y-0.35*s)} L{f(x-0.35*s)},{f(y-0.35*s)} Q{f(x-0.55*s)},{f(y+0.05*s)} {f(x-1.15*s)},{f(y-0.15*s)} Z" fill="{clay}" stroke="{rim}" stroke-width="{f(0.06*s)}"/>')
    if lit:
        k = s * flame_scale
        g.append(f'<path d="M{f(x)},{f(y-1.75*k-0.3*s)} C{f(x+0.5*k)},{f(y-0.95*k-0.3*s)} {f(x+0.34*k)},{f(y-0.3*s)} {f(x)},{f(y-0.3*s)} C{f(x-0.34*k)},{f(y-0.3*s)} {f(x-0.5*k)},{f(y-0.95*k-0.3*s)} {f(x)},{f(y-1.75*k-0.3*s)} Z" fill="url(#flame)"/>')
        g.append(f'<ellipse cx="{f(x)}" cy="{f(y-0.62*k-0.3*s)}" rx="{f(0.14*k)}" ry="{f(0.3*k)}" fill="#fff6d8"/>')
    return "".join(g)

def figure(x, y, h, fill, stroke="none", sw=0, stance="stand", arm=None, extra=""):
    """A faceless standing silhouette, feet at (x, y), height h."""
    r = h * 0.085
    hy = y - h + r
    body = (f'M{f(x-0.11*h)},{f(y)} L{f(x-0.05*h)},{f(y-0.42*h)} L{f(x-0.13*h)},{f(y-0.45*h)} '
            f'L{f(x-0.1*h)},{f(y-0.78*h)} Q{f(x)},{f(y-0.84*h)} {f(x+0.1*h)},{f(y-0.78*h)} '
            f'L{f(x+0.13*h)},{f(y-0.45*h)} L{f(x+0.05*h)},{f(y-0.42*h)} L{f(x+0.11*h)},{f(y)} '
            f'L{f(x+0.03*h)},{f(y)} L{f(x)},{f(y-0.36*h)} L{f(x-0.03*h)},{f(y)} Z')
    s = f'stroke="{stroke}" stroke-width="{f(sw)}"' if stroke != "none" else ""
    g = f'<path d="{body}" fill="{fill}" {s}/><circle cx="{f(x)}" cy="{f(hy)}" r="{f(r)}" fill="{fill}" {s}/>'
    if arm == "up":
        g += f'<path d="M{f(x+0.08*h)},{f(y-0.74*h)} L{f(x+0.24*h)},{f(y-0.98*h)}" stroke="{fill}" stroke-width="{f(0.045*h)}" stroke-linecap="round"/>'
    if arm == "bow":
        g += (f'<path d="M{f(x+0.08*h)},{f(y-0.7*h)} L{f(x+0.3*h)},{f(y-0.72*h)}" stroke="{fill}" stroke-width="{f(0.04*h)}" stroke-linecap="round"/>'
              f'<path d="M{f(x+0.3*h)},{f(y-1.0*h)} Q{f(x+0.48*h)},{f(y-0.72*h)} {f(x+0.3*h)},{f(y-0.42*h)}" fill="none" stroke="{fill}" stroke-width="{f(0.03*h)}"/>'
              f'<path d="M{f(x+0.3*h)},{f(y-1.0*h)} L{f(x+0.3*h)},{f(y-0.42*h)}" stroke="{fill}" stroke-width="{f(0.008*h)}"/>')
    return g + extra

def seated(x, y, h, fill, stroke="none", sw=0):
    """Faceless seated (lotus posture) silhouette, base at y."""
    r = h * 0.14
    s = f'stroke="{stroke}" stroke-width="{f(sw)}"' if stroke != "none" else ""
    return (f'<path d="M{f(x-0.62*h)},{f(y)} Q{f(x-0.6*h)},{f(y-0.3*h)} {f(x-0.22*h)},{f(y-0.32*h)} '
            f'L{f(x-0.24*h)},{f(y-0.72*h)} Q{f(x)},{f(y-0.8*h)} {f(x+0.24*h)},{f(y-0.72*h)} L{f(x+0.22*h)},{f(y-0.32*h)} '
            f'Q{f(x+0.6*h)},{f(y-0.3*h)} {f(x+0.62*h)},{f(y)} Z" fill="{fill}" {s}/>'
            f'<circle cx="{f(x)}" cy="{f(y-0.72*h-r*0.9)}" r="{f(r)}" fill="{fill}" {s}/>')

def crown(x, y, s, fill, stroke=None, sw=0.05):
    st = f'stroke="{stroke}" stroke-width="{f(sw)}"' if stroke else ""
    return (f'<path d="M{f(x-s)},{f(y)} L{f(x-s)},{f(y-0.7*s)} L{f(x-0.5*s)},{f(y-0.35*s)} L{f(x)},{f(y-1.0*s)} '
            f'L{f(x+0.5*s)},{f(y-0.35*s)} L{f(x+s)},{f(y-0.7*s)} L{f(x+s)},{f(y)} Z" fill="{fill}" {st}/>')

def qr_placeholder(x, y, s, label):
    g = [f'<rect x="{f(x)}" y="{f(y)}" width="{f(s)}" height="{f(s)}" rx="0.15" fill="#fbf7ee" stroke="#2b1a0e" stroke-width="0.05"/>']
    m = s * 0.08
    for (cx, cy) in [(x+m, y+m), (x+s-m-s*0.26, y+m), (x+m, y+s-m-s*0.26)]:
        g.append(f'<rect x="{f(cx)}" y="{f(cy)}" width="{f(s*0.26)}" height="{f(s*0.26)}" fill="none" stroke="#2b1a0e" stroke-width="{f(s*0.05)}"/>')
        g.append(f'<rect x="{f(cx+s*0.08)}" y="{f(cy+s*0.08)}" width="{f(s*0.1)}" height="{f(s*0.1)}" fill="#2b1a0e"/>')
    rnd = random.Random(label)
    n = 9
    cell = (s - 2*m) / n
    for i in range(n):
        for j in range(n):
            if (i < 4 and j < 4) or (i > 4 and j < 4) or (i < 4 and j > 4):
                continue
            if rnd.random() < 0.45:
                g.append(f'<rect x="{f(x+m+i*cell)}" y="{f(y+m+j*cell)}" width="{f(cell*0.9)}" height="{f(cell*0.9)}" fill="#2b1a0e"/>')
    return "".join(g)

def hidden_mark(x, y, s=1.0):
    """Hidden mini code. Mockup: a dashed gold square. Master: recorded, drawn as a real code in its own layer."""
    HIDDEN.append((x, y))
    if MASTER:
        return ""
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(s)}" height="{f(s)}" fill="none" stroke="#f2c45a" stroke-width="0.06" stroke-dasharray="0.18 0.12" opacity="0.9"/>'

# ---------- defs ----------
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W*40}" height="{H*40}">')
a('''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0" stop-color="#050409"/><stop offset="0.15" stop-color="#0a0a1c"/>
 <stop offset="0.22" stop-color="#0c1736"/><stop offset="0.36" stop-color="#103058"/>
 <stop offset="0.43" stop-color="#2a1b3e"/><stop offset="0.5" stop-color="#561a1c"/>
 <stop offset="0.58" stop-color="#7c2614"/><stop offset="0.65" stop-color="#a5461a"/>
 <stop offset="0.74" stop-color="#d88a3a"/><stop offset="0.82" stop-color="#eec27a"/>
 <stop offset="0.9" stop-color="#f6e2b8"/><stop offset="1" stop-color="#fbf5e8"/>
</linearGradient>
<linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0" stop-color="#050409"/><stop offset="0.4" stop-color="#0d1226"/>
 <stop offset="0.56" stop-color="#2a0f0c"/><stop offset="0.59" stop-color="#4a2614"/>
 <stop offset="0.603" stop-color="#ead5a8"/><stop offset="1" stop-color="#faf3e4"/>
</linearGradient>
<linearGradient id="threadg" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0" stop-color="#7a5a22"/><stop offset="0.2" stop-color="#b98a35"/>
 <stop offset="0.6" stop-color="#f5c451"/><stop offset="1" stop-color="#ffd978"/>
</linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.85"/><stop offset="0.45" stop-color="#ff9a3a" stop-opacity="0.28"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="ember" cx="0.5" cy="0.9" r="0.7"><stop offset="0" stop-color="#b8431a" stop-opacity="0.75"/><stop offset="0.5" stop-color="#6a1f10" stop-opacity="0.35"/><stop offset="1" stop-color="#2a0a06" stop-opacity="0"/></radialGradient>
<radialGradient id="dawn" cx="0.5" cy="0.7" r="0.6"><stop offset="0" stop-color="#fff8e2" stop-opacity="1"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient>
<linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a1a"/><stop offset="0.5" stop-color="#ffb63a"/><stop offset="1" stop-color="#ffe9a6"/></linearGradient>
<radialGradient id="halo"><stop offset="0" stop-color="#ffe7a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
</defs>''')

# ---------- ground ----------
a('<g id="01-sky-and-unlit-lamps">')
a(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
# faint field of unlit lamps in the dark end ("the dark is made of unlit lamps")
for i in range(260):
    x = random.uniform(1, 46); y = random.uniform(12, 44)
    if 2 < x < 22 and 15 < y < 22:
        continue
    s = random.uniform(0.18, 0.32)
    op = max(0.0, 0.5 - x/100)
    a(f'<g opacity="{f(op)}">' + diya(x, y, s, False, clay="#1a1220", rim="#3a2a3a") + '</g>')

a('</g><g id="02-story1-narakasura-sanjhi">')
# ---------- 1 · NARAKASURA · Sanjhi paper-cut (x 0-36) ----------
a('<rect x="0" y="14" width="38" height="32" fill="url(#ember)"/>')
INK = "#020103"
EMB = "#c24a1c"
# scalloped Sanjhi frame at top of section
for i in range(0, 36):
    a(f'<path d="M{i},14.6 Q{i+0.5},13.6 {i+1},14.6" fill="none" stroke="{EMB}" stroke-width="0.07" opacity="0.55"/>')
    a(f'<circle cx="{i+0.5}" cy="14.25" r="0.09" fill="{EMB}" opacity="0.6"/>')
# beat 1 — the Earth cradling her child
a(f'<path d="M1,46 C2,36 6,30 12,31 C15,31.5 13,38 12,46 Z" fill="{INK}"/>')
for (cx, cy, r) in [(4.2, 40, .55), (6.2, 37.2, .45), (8.4, 35.3, .4), (5.4, 43.4, .5), (8.6, 40.6, .5), (10.4, 37.6, .35)]:
    a(f'<path d="M{cx-r},{cy} Q{cx},{cy-1.6*r} {cx+r},{cy} Q{cx},{cy+1.6*r} {cx-r},{cy} Z" fill="{EMB}" opacity="0.85"/>')
a(seated(9.5, 33.2, 2.6, INK))  # the child held at the crest of the earth
a(f'<circle cx="9.5" cy="29" r="1.35" fill="none" stroke="{EMB}" stroke-width="0.12" opacity="0.9"/>')  # the one gift
# beat 2 — the city of taking
a(f'<path d="M13,46 L13,30 L15,30 L15,27 Q16.5,22.5 18,27 L18,30 L20,30 L20,25 Q22,19 24,25 L24,30 L26,30 L26,27 Q27.5,23 29,27 L29,46 Z" fill="{INK}"/>')
for wx in [14, 16.6, 19, 21.4, 25.2, 27.4]:
    for wy in [32, 36, 40]:
        a(f'<path d="M{wx},{wy+1.6} L{wx},{wy+0.5} Q{wx+0.45},{wy-0.2} {wx+0.9},{wy+0.5} L{wx+0.9},{wy+1.6} Z" fill="#160a08"/>')  # dark windows: no light
a(f'<path d="M20.4,46 L20.4,42 Q22,40 23.6,42 L23.6,46 Z" fill="#1a0c08" stroke="{EMB}" stroke-width="0.08"/>')
for k in range(4):
    a(f'<line x1="{20.8+k*0.8}" y1="42.3" x2="{20.8+k*0.8}" y2="46" stroke="{EMB}" stroke-width="0.07"/>')  # bars
a(figure(22, 24.6, 4.2, INK, arm="up"))
a(f'<circle cx="23.1" cy="20.3" r="0.32" fill="none" stroke="{EMB}" stroke-width="0.09"/><circle cx="23.7" cy="20.7" r="0.32" fill="none" stroke="{EMB}" stroke-width="0.09"/>')  # the taken earrings
# beat 3 — the chariot, the mother come again, the first lamp asked for
a(f'<path d="M25,38.5 L31,38.5 L32,36 L25.5,36 Z" fill="{INK}"/>')
a(f'<circle cx="27" cy="40.2" r="2.1" fill="none" stroke="{INK}" stroke-width="0.35"/>')
for k in range(8):
    ang = k*math.pi/4
    a(f'<line x1="27" y1="40.2" x2="{27+2*math.cos(ang):.2f}" y2="{40.2+2*math.sin(ang):.2f}" stroke="{INK}" stroke-width="0.12"/>')
a(figure(27, 36, 5.2, INK))
a(figure(30, 36, 5.0, INK, arm="bow"))  # Satyabhama, bow drawn
a(hidden_mark(31.7, 31.6))  # hidden: Satyabhama's view
a(f'<path d="M30.5,45.6 Q33,43.4 35.6,44.6 L35.8,45.8 Z" fill="{INK}"/>')  # the fallen one, at rest
a(diya(34.4, 44.0, 0.42, True, clay="#3a2418", rim="#8a5a30"))  # his wish: the first lamp

a('</g><g id="03-story2-lakshmi-rangoli">')
# ---------- 2 · LAKSHMI · rangoli / kolam (x 36-72) ----------
CH = "#f3ead8"
# kolam dots begin in the dark (the bleed from story 1)
for gx in range(36, 72):
    for gy in range(16, 45, 2):
        if random.random() < (0.12 if gx < 40 else 0.35):
            a(f'<circle cx="{gx+0.5}" cy="{gy}" r="0.07" fill="{CH}" opacity="0.55"/>')
# ocean waves as kolam loops
for row, yy in enumerate([38, 40.5, 43]):
    d = f"M36,{yy}"
    for k in range(36):
        x0 = 36 + k
        d += f" Q{x0+0.25},{yy-0.9+row*0.1} {x0+0.5},{yy} T{x0+1},{yy}"
    a(f'<path d="{d}" fill="none" stroke="{CH}" stroke-width="0.09" opacity="{0.7-row*0.15}"/>')
def lotus(cx, cy, r, stroke=CH, sw=0.1, fill="none", petals=8):
    g = []
    for k in range(petals):
        ang = -math.pi/2 + (k - (petals-1)/2) * (math.pi/ (petals+1))
        tx, ty = cx + r*math.cos(ang), cy + r*math.sin(ang)
        lx, ly = cx + 0.4*r*math.cos(ang-0.35), cy + 0.4*r*math.sin(ang-0.35)
        rx, ry = cx + 0.4*r*math.cos(ang+0.35), cy + 0.4*r*math.sin(ang+0.35)
        g.append(f'<path d="M{cx:.2f},{cy:.2f} Q{lx:.2f},{ly:.2f} {tx:.2f},{ty:.2f} Q{rx:.2f},{ry:.2f} {cx:.2f},{cy:.2f} Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
    return "".join(g)
# beat 1 — the blessing sinks
for k in range(7):
    r = 3.2 - k*0.4
    a(f'<circle cx="{42}" cy="{22+k*2.4}" r="{r:.2f}" fill="none" stroke="{CH}" stroke-width="0.07" stroke-dasharray="0.15 0.25" opacity="{0.25+k*0.08:.2f}"/>')
a(lotus(42, 37.4, 1.6, sw=0.09))
a(f'<circle cx="42" cy="36.2" r="0.35" fill="#f5c451"/>')
# beat 2 — the churning: mountain, serpent rope, two ends, poison rising
a(f'<path d="M50.8,44 Q52,30 54,20.4 Q56,30 57.2,44 Z" fill="#0b2242" stroke="{CH}" stroke-width="0.12"/>')
for k in range(1, 12):
    y = 20 + k*2.1
    hw = 2.5 + (y-20)*0.0
    a(f'<path d="M{54-(y-20)*0.104-2.5+0.2},{y} L{54+(y-20)*0.104+2.5-0.2},{y}" stroke="{CH}" stroke-width="0.04" opacity="0.5"/>')
d = "M47,31"
for k in range(8):
    d += f" Q{51 if k%2==0 else 57},{31.6 + k*0.9 - (0.9 if k%2 else 0)} {54 + (3 if k%2==0 else -3)},{32+k*0.9}"
a(f'<path d="M47,31.5 C50,30 52,33.5 54,32 S58,30 61,31.5" fill="none" stroke="#9ad0c2" stroke-width="0.32" stroke-linecap="round"/>')
a(f'<path d="M47,31.5 C50,30 52,33.5 54,32 S58,30 61,31.5" fill="none" stroke="{CH}" stroke-width="0.07" stroke-dasharray="0.12 0.2"/>')
for i, xx in enumerate([46.2, 47.6]):
    a(figure(xx, 36.5, 4.6, "none", stroke=CH, sw=0.08))
for i, xx in enumerate([60.4, 61.8]):
    a(figure(xx, 36.5, 4.6, "none", stroke="#c9a6e6", sw=0.08))
a(f'<path d="M54,20 C51.6,18 56.4,16.6 53.6,14.6 C52.2,13.6 54.6,12.4 53.4,11.6" fill="none" stroke="#1c0a2c" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/>')
a(f'<path d="M54,20 C51.6,18 56.4,16.6 53.6,14.6" fill="none" stroke="#5a2a8a" stroke-width="0.25" stroke-linecap="round"/>')  # poison rising
a(f'<path d="M58.5,15.4 L58.5,22.6 M57.1,16.2 L57.1,17.8 Q58.5,19.2 59.9,17.8 L59.9,16.2" fill="none" stroke="#7fc6ff" stroke-width="0.18"/>')  # trident: the one who held it
a(f'<circle cx="58.5" cy="20.4" r="0.75" fill="#2f7fd0" stroke="#9ad6ff" stroke-width="0.08"/>')  # the blue throat
a(hidden_mark(59.6, 19.6))  # hidden: Shiva's view
# beat 3 — Lakshmi rises: treasures, then the lotus
a(f'<path d="M62.6,25.5 A1.1,1.1 0 1 0 63.6,27.2 A0.85,0.85 0 1 1 62.6,25.5 Z" fill="{CH}"/>')  # the moon
a(f'<path d="M64.6,28.8 L64.6,27 M64.6,27.4 Q63.6,26 64.6,25.1 Q65.6,26 64.6,27.4" fill="none" stroke="{CH}" stroke-width="0.08"/>')  # wish-tree
a(f'<circle cx="68" cy="32" r="5.2" fill="url(#halo)" opacity="0.5"/>')
a(lotus(68, 38.6, 4.2, sw=0.12, petals=9))
a(lotus(68, 38.6, 2.6, stroke="#f5c451", sw=0.1, petals=7))
a(seated(68, 37.6, 4.0, "#f5e6c4"))
for k in range(12):
    ang = -math.pi + k*math.pi/11
    a(f'<line x1="{68+3.4*math.cos(ang):.2f}" y1="{31.4+3.4*math.sin(ang):.2f}" x2="{68+4.3*math.cos(ang):.2f}" y2="{31.4+4.3*math.sin(ang):.2f}" stroke="#f5c451" stroke-width="0.08"/>')

a('</g><g id="04-story3-mahavira-kalpasutra">')
# ---------- 3 · MAHAVIRA · Kalpa Sutra folio (x 72-108) ----------
GOLD = "#e8b54a"; BLUE = "#23458f"; VERM = "#a8261a"
for i, fx in enumerate([73.2, 85.2, 97.2]):
    a(f'<rect x="{fx}" y="16.5" width="9.6" height="27.5" rx="0.3" fill="{VERM}" stroke="{GOLD}" stroke-width="0.22"/>')
    a(f'<rect x="{fx+0.5}" y="17" width="8.6" height="26.5" fill="none" stroke="{BLUE}" stroke-width="0.12"/>')
    for k in range(9):  # border dots (the rangoli dots, now a manuscript margin)
        a(f'<circle cx="{fx+0.9+k*1.0:.2f}" cy="17.6" r="0.1" fill="{GOLD}"/><circle cx="{fx+0.9+k*1.0:.2f}" cy="42.9" r="0.1" fill="{GOLD}"/>')
# beat 1 — seeing with nothing in the way
a(f'<circle cx="78" cy="27" r="3.2" fill="url(#halo)" opacity="0.6"/>')
a(seated(78, 35, 6.4, GOLD))
a(f'<rect x="74" y="35" width="8" height="0.9" fill="{BLUE}"/>')
for k, xx in enumerate([74.6, 76.1, 79.9, 81.4]):
    a(seated(xx, 41.6, 1.6, "#f2d48a"))  # listeners
# beat 2 — the empty seat, the liberation crescent, eighteen kings, eighteen lamps
a(f'<path d="M87.6,25.4 A2.4,2.4 0 0 0 92.4,25.4 A2.4,1.4 0 0 1 87.6,25.4 Z" fill="{GOLD}"/>')  # siddhashila crescent
a(f'<circle cx="90" cy="23.4" r="0.4" fill="{GOLD}"/>')
a(f'<rect x="87" y="30.6" width="6" height="0.8" fill="{BLUE}"/><path d="M87.4,30.6 Q90,28 92.6,30.6" fill="none" stroke="{GOLD}" stroke-width="0.12"/>')  # the seat, empty
for k in range(18):
    row, col = divmod(k, 9)
    cx = 86.2 + col*0.95; cy = 35.6 + row*3.4
    a(crown(cx, cy, 0.32, GOLD))
    a(diya(cx, cy+1.6, 0.3, True, clay="#5a1a10", rim=GOLD, flame_scale=0.9))
# beat 3 — the student lets go; the light is inside
a(seated(102, 39, 6.4, "#3a0e0a", stroke=GOLD, sw=0.12))
a(diya(102, 33.8, 0.55, True, clay="#3a0e0a", rim=GOLD))
a(hidden_mark(103.1, 34.2))  # hidden: Gautama's view
a(f'<path d="M98.2,22 Q102,19.2 105.8,22" fill="none" stroke="{GOLD}" stroke-width="0.1" stroke-dasharray="0.2 0.2"/>')  # the teacher gone ahead

a('</g><g id="05-story4-bandichhor-goldline">')
# ---------- 4 · BANDI CHHOR · gold line from the thread (x 108-144) ----------
def gold(d, w=0.14):
    w = w*1.6
    return (f'<path d="{d}" fill="none" stroke="#3a1a02" stroke-width="{w*2.0:.2f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>'
            f'<path d="{d}" fill="none" stroke="#b47a14" stroke-width="{w:.2f}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="#ffe39a" stroke-width="{w*0.35:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
# the thread descends from the lamp row to draw the fort (the manuscript gold becomes the thread)
a(gold("M108.5,9.2 C109.5,14 108.6,18 110,21"))
a(gold("M110,46 L110,24 L111.2,24 L111.2,22.6 L112.4,22.6 L112.4,24 L114,24 L114,22.6 L115.2,22.6 L115.2,24 L117,24 L117,22.6 L118.2,22.6 L118.2,24 L119.6,24 L119.6,46", 0.16))
a(gold("M110,21 L110,24"))
for k in range(52):  # fifty-two kings, long past hoping
    row, col = divmod(k, 13)
    a(crown(110.7 + col*0.68, 28.6 + row*2.6, 0.24, "none", stroke="#7a4a0a", sw=0.09))
a(gold("M113.4,46 L113.4,43 Q114.8,41.2 116.2,43 L116.2,46"))
# beat 2 — the cloak, fifty-three tassels (one longer, for whoever is looking)
a(gold("M124,22 Q126,20.4 128,20.6 Q130,20.4 132,22 L133.6,33 L122.4,33 Z", 0.16))
a(gold("M126.4,21 Q128,23 129.6,21"))
for k in range(53):
    x0 = 122.6 + k*(10.8/52)
    ln = 4.2 + 0.6*math.sin(k*0.9)
    if k == 52:
        ln = 8.6
    a(gold(f"M{x0:.2f},33 Q{x0+0.4:.2f},{33+ln*0.5:.2f} {x0+0.9:.2f},{33+ln:.2f}", 0.05 if k != 52 else 0.07))
a(hidden_mark(133.3, 41.5))  # hidden at the 53rd tassel's tip
# beat 3 — walking out together, each holding a thread; Amritsar lit
for k in range(7):
    a(crown(136 + k*0.95, 36.6 + (k%2)*0.7, 0.28, "none", stroke="#7a4a0a", sw=0.09))
    a(gold(f"M{132.4:.2f},33.6 Q{134.6:.2f},{35.8:.2f} {136+k*0.95:.2f},{36.4+(k%2)*0.7:.2f}", 0.04))
a(gold("M137,31 L137,27 L139,27 Q140.4,23.4 141.8,27 L143.8,27 L143.8,31 Z", 0.14))
a(gold("M136,31.6 L144.6,31.6"))
a(gold("M137,32.6 L137,33.8 L139,33.8 Q140.4,36.4 141.8,33.8 L143.8,33.8 L143.8,32.6", 0.06))  # reflection in the water
for k in range(9):
    a(diya(137.1 + k*0.84, 26.7 if 2 < k < 6 else 26.9, 0.2, True, clay="#6b3a10", rim="#ffd56a", flame_scale=0.9))

a('</g><g id="06-story5-rama-shadowpuppet">')
# ---------- 5 · RAMA · shadow puppets (x 144-180) ----------
a('<rect x="140" y="14" width="40" height="32" fill="url(#dawn)" opacity="0.7"/>')
OUT = "#2a1608"
def puppet(x, y, h, col, arm=None):
    g = figure(x, y, h, col, stroke=OUT, sw=0.08, arm=arm)
    rnd = random.Random(int(x*10))
    for _ in range(14):  # perforations: the light shows through
        px = x + rnd.uniform(-0.09, 0.09)*h; py = y - rnd.uniform(0.45, 0.76)*h
        g += f'<circle cx="{px:.2f}" cy="{py:.2f}" r="{0.012*h:.2f}" fill="#fff4d6"/>'
    return f'<g opacity="0.92">{g}</g>'
def ptree(x, y, h, col):
    g = f'<path d="M{x},{y} L{x},{y-h*0.45}" stroke="{OUT}" stroke-width="{0.05*h:.2f}"/>'
    for k in range(3):
        yy = y - h*0.4 - k*h*0.2; ww = h*(0.36 - k*0.09)
        g += f'<path d="M{x-ww:.2f},{yy:.2f} Q{x},{yy-h*0.28:.2f} {x+ww:.2f},{yy:.2f} Z" fill="{col}" stroke="{OUT}" stroke-width="0.08" opacity="0.88"/>'
    return g
# the gold line becomes a puppet outline at the seam
a(gold("M144.6,31.6 Q146,30.8 146.8,32", 0.08))
# beat 1 — fourteen years in the forest
for (tx, th, tc) in [(146, 12, "#2e7d5b"), (149.4, 9, "#3f8f4e"), (153.6, 13, "#2e7d5b"), (155.8, 8, "#4c9a62")]:
    a(ptree(tx, 46, th, tc))
a(puppet(150.6, 45.6, 7.6, "#b8322a", arm="bow"))
a(puppet(152.6, 45.6, 7.0, "#e08a1e"))
# beat 2 — "tell me who I am": the chakra and conch behind him
cx, cy = 162, 26
a(f'<circle cx="{cx}" cy="{cy}" r="5.4" fill="none" stroke="#c99a2e" stroke-width="0.16" opacity="0.65"/>')
for k in range(16):
    ang = k*math.pi/8
    a(f'<line x1="{cx+1.4*math.cos(ang):.2f}" y1="{cy+1.4*math.sin(ang):.2f}" x2="{cx+5.2*math.cos(ang):.2f}" y2="{cy+5.2*math.sin(ang):.2f}" stroke="#c99a2e" stroke-width="0.06" opacity="0.55"/>')
a(f'<circle cx="{cx}" cy="{cy}" r="1.4" fill="none" stroke="#c99a2e" stroke-width="0.12" opacity="0.7"/>')
a(puppet(162, 45.6, 8.4, "#3b3f8c"))
# beat 3 — Ayodhya: the city of lamps, the road home
a(f'<path d="M168,46 L168,33 L170,33 Q171.5,29.5 173,33 L175,33 L175,30.5 Q176.5,26.6 178,30.5 L179.6,30.5 L179.6,46 Z" fill="#e7b25a" stroke="{OUT}" stroke-width="0.1" opacity="0.92"/>')
a(f'<path d="M171,46 L171,41 Q172.6,38.8 174.2,41 L174.2,46 Z" fill="#fff3d2" stroke="{OUT}" stroke-width="0.08"/>')
for (rx, ry, n, sp) in [(168.4, 32.8, 3, 0.75), (175.3, 30.3, 5, 0.85), (169.0, 37.4, 3, 0.9), (175.6, 36.2, 4, 0.9)]:
    for k in range(n):
        a(diya(rx + k*sp, ry, 0.22, True, clay="#8a4a1a", rim=OUT, flame_scale=1.0))
a(hidden_mark(176.6, 38.4))  # hidden: a lamp-lighter on the roof
a(puppet(165.2, 45.6, 6.8, "#b8322a"))
a(puppet(166.6, 45.6, 6.4, "#c7408a"))
for k in range(8):  # the road lined with lamps
    a(diya(157.4 + k*1.4, 45.7, 0.2 + k*0.02, True, clay="#8a4a1a", rim=OUT))

a('</g><g id="07-thread-and-lamps">')
# ---------- the lamp thread (top band) ----------
def ty(x): return 9.0 + math.sin(x*0.013*10)*0.35 + math.sin(x*0.047*10 + 1)*0.18
d = "M2," + f(ty(2))
for xi in range(3, 179):
    d += f" L{xi},{f(ty(xi))}"
a(f'<path d="{d}" fill="none" stroke="#2a1806" stroke-width="0.34" opacity="0.6"/>')
a(f'<path d="{d}" fill="none" stroke="url(#threadg)" stroke-width="0.17"/>')
lamps = [6 + i*4.5 for i in range(38)]
FIRST_LIT = 33.0  # Narakasura's wish lights the first flame
for x in lamps:
    y = ty(x)
    lit = x >= FIRST_LIT
    t = max(0.0, (x - FIRST_LIT) / (180 - FIRST_LIT))
    s = 0.62 + 0.18*t
    clay = "#2a1a14" if x < 40 else ("#5a2a14" if x < 110 else "#8a4a1a")
    rim = "#4a3420" if x < 40 else "#c08a3a"
    a(diya(x, y + 0.2, s, lit, clay=clay, rim=rim, flame_scale=0.55 + 0.75*t))
# the last lamp: no clay, only light
a(diya(177.4, ty(177.4) + 0.2, 0.9, True, clayless=True, flame_scale=1.4))

a('</g><g id="08-words-band">')
# ---------- ground line and words band ----------
a('<rect x="0" y="46" width="180" height="14" fill="url(#band)"/>')
a(f'<path d="M0,46 L180,46" stroke="url(#threadg)" stroke-width="0.12"/>')
if not MASTER:
    for i, sx in enumerate([0, 36, 72, 108, 144]):
        a(qr_placeholder(sx + 31.6, 46.9, 3.6, f"story{i+1}"))
a('</g>')
if MASTER:
    import master_layers
    a(master_layers.layers(HIDDEN))
a('</svg>')

sys.stdout.write("\n".join(out))
