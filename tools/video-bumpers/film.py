"""ZTV pre-roll bumpers: the bits that run before the feature at a repertory theater, done for a TV channel.
Drawn with PIL in ZTV's phosphor green, then run through a film pass (green-cast print, grain, gate weave, flicker, dust, one scratch, a cue mark).
Usage: python3 film.py <out_dir> [name ...]     Fonts: TTFs in ./fonts (or $ZTV_FONTS): Jost800, Jost500, Shrikhand, Oswald700.
All copy is ZTV's own. No theater chain's marks, music or PSAs are used."""
import sys, os, math, subprocess, wave, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, SR = 1280, 720, 30, 48000
FD = os.environ.get("ZTV_FONTS", os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts"))  # OFL fonts: Jost, Shrikhand, Oswald
from functools import lru_cache
@lru_cache(None)
def F(name, size): return ImageFont.truetype(os.path.join(FD, name + ".ttf"), size)
# ZTV phosphor green, same family as the guide
CREAM, BROWN, DARK, MUSTARD, ORANGE, RED = (222, 244, 226), (14, 44, 28), (8, 18, 12), (104, 226, 146), (34, 118, 70), (28, 104, 60)

# ---------- drawing helpers ----------
def ctext(d, y, s, font, fill, shadow=None, tracking=0, x=None):
    """centered text with optional stacked shadow list [(dx,dy,color),...] and letter tracking"""
    widths = [d.textlength(ch, font=font) for ch in s]
    tw = sum(widths) + tracking * (len(s) - 1)
    x0 = (W - tw) / 2 if x is None else x
    for layer in (shadow or []) + [(0, 0, fill)]:
        cx = x0 + layer[0]
        for ch, w in zip(s, widths):
            d.text((cx, y + layer[1]), ch, font=font, fill=layer[2]); cx += w + tracking
    return tw

def leader_frame(img, n, frac):
    d = ImageDraw.Draw(img); cx, cy = W // 2, H // 2
    d.rectangle([0, 0, W, H], fill=(128, 150, 134))
    # sweep wedge: the clock hand of the countdown
    a = -90 + 360 * frac
    d.pieslice([cx - 520, cy - 520, cx + 520, cy + 520], -90, a, fill=(96, 118, 102))
    for r, w in ((300, 10), (250, 6)): d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(20, 18, 16), width=w)
    d.line([0, cy, W, cy], fill=(20, 18, 16), width=5); d.line([cx, 0, cx, H], fill=(20, 18, 16), width=5)
    f = F("Oswald700", 400); s = str(n); tw = d.textlength(s, font=f)
    d.text((cx - tw / 2, cy - 290), s, font=f, fill=(16, 14, 12))

def rays(img, t, c1, c2, n=18, spin=6):
    d = ImageDraw.Draw(img); cx, cy = W // 2, int(H * .56); R = 1600
    d.rectangle([0, 0, W, H], fill=c1)
    for k in range(n):
        a0 = math.radians(k * 360 / n + t * spin); a1 = a0 + math.radians(360 / n / 2)
        d.polygon([(cx, cy), (cx + R * math.cos(a0), cy + R * math.sin(a0)), (cx + R * math.cos(a1), cy + R * math.sin(a1))], fill=c2)

def bucket(d, x, y, s):
    """a striped popcorn bucket, drawn slightly off-square so it reads as painted, not plotted"""
    top, bot, h = 150 * s, 104 * s, 190 * s
    pts = [(x - top / 2, y), (x + top / 2, y + 3 * s), (x + bot / 2, y + h), (x - bot / 2, y + h - 2 * s)]
    d.polygon(pts, fill=CREAM)
    for k in range(5):  # red stripes
        u0, u1 = (k * 2 + .5) / 10, (k * 2 + 1.5) / 10
        def at(u, v): return (pts[0][0] + (pts[1][0] - pts[0][0]) * u + ((pts[3][0] + (pts[2][0] - pts[3][0]) * u) - (pts[0][0] + (pts[1][0] - pts[0][0]) * u)) * v, y + h * v)
        d.polygon([at(u0, 0), at(u1, 0), at(u1, 1), at(u0, 1)], fill=RED)
    rng = np.random.default_rng(5)
    for k in range(26):  # popcorn heap
        px = x + rng.uniform(-.48, .48) * top; py = y - rng.uniform(0, 46) * s + abs(px - x) * .25; r = rng.uniform(14, 22) * s
        d.ellipse([px - r, py - r, px + r, py + r], fill=(236, 248, 230), outline=(120, 190, 140), width=max(1, int(2 * s)))

# ---------- scenes: each returns a PIL image for time t ----------
def house_rules(t):
    img = Image.new("RGB", (W, H), DARK); d = ImageDraw.Draw(img)
    cards = [(0, 2.2), (2.2, 4.8), (4.8, 7.0), (7.0, 9.6)]
    k = max(i for i, (a, b) in enumerate(cards) if t >= a)
    a, b = cards[k]
    if t - a < 2 / FPS or b - t < 2 / FPS: return img  # slide change: a couple of black frames
    d.rectangle([140, 150, W - 140, 154], fill=MUSTARD); d.rectangle([140, H - 154, W - 140, H - 150], fill=MUSTARD)
    if k == 0:
        ctext(d, 250, "A MESSAGE FROM", F("Jost500", 46), CREAM, tracking=14)
        ctext(d, 330, "THE MANAGEMENT", F("Jost800", 96), CREAM, tracking=6)
    elif k == 1:
        ctext(d, 230, "PLEASE DO NOT TALK", F("Jost800", 92), CREAM, tracking=3)
        ctext(d, 350, "DURING THE PROGRAM.", F("Jost800", 92), CREAM, tracking=3)
    elif k == 2:
        ctext(d, 230, "TALK IN CHAT.", F("Jost800", 92), MUSTARD, tracking=3)
        ctext(d, 350, "CHAT IS ENCOURAGED.", F("Jost800", 92), MUSTARD, tracking=3)
    else:
        ctext(d, 215, "TYPE !ch AND A NUMBER", F("Jost800", 84), CREAM, tracking=2)
        ctext(d, 335, "TO CHANGE THE CHANNEL", F("Jost500", 52), CREAM, tracking=10)
        ctext(d, 405, "FOR EVERYONE WATCHING.", F("Jost500", 52), CREAM, tracking=10)
    return img
DUR_house_rules = 9.6

def snack_bar(t):
    img = Image.new("RGB", (W, H)); rays(img, t, ORANGE, (46, 140, 86), n=16, spin=4); d = ImageDraw.Draw(img)
    bob = math.sin(t * 2 * math.pi * 1.0) * 10
    bucket(d, 300, 300 + bob, 1.35)
    sh = [(9, 9, BROWN), (5, 5, (20, 84, 50))]
    lines = [("The snack bar", "is now open."), ("It's in", "your kitchen."), ("We'll hold", "your seat.")]
    k = 0 if t < 2.8 else 1 if t < 5.4 else 2
    size = 104
    while max(d.textlength(s, font=F("Shrikhand", size)) for s in lines[k]) > W - 560 - 70: size -= 4   # fit the frame
    for j, s in enumerate(lines[k]):
        ctext(d, 200 + j * int(size * 1.4), s, F("Shrikhand", size), CREAM, shadow=sh, x=560)
    return img
DUR_snack_bar = 8.0

def leader(t):
    img = Image.new("RGB", (W, H))
    nums = [8, 7, 6, 5, 4, 3]; step = .62
    if t < len(nums) * step:
        i = int(t // step); leader_frame(img, nums[i], (t % step) / step); return img
    t2 = t - len(nums) * step
    if t2 < 1 / FPS * 1.5:  # the 2-pop: a single frame of "2"
        leader_frame(img, 2, 0); return img
    d = ImageDraw.Draw(img); d.rectangle([0, 0, W, H], fill=(4, 10, 6))
    if t2 > .6:
        ctext(d, 250, "ZTV", F("Jost800", 150), CREAM, tracking=30)
        ctext(d, 440, "PRESENTS", F("Jost500", 50), MUSTARD, tracking=24)
    return img
DUR_leader = len([8, 7, 6, 5, 4, 3]) * .62 + 2.6

def back_to_program(t):
    img = Image.new("RGB", (W, H)); rays(img, t, (10, 30, 20), (18, 46, 30), n=22, spin=8); d = ImageDraw.Draw(img)
    cx, cy = W // 2, int(H * .56); r = 230 + 6 * math.sin(t * 3)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(30, 116, 70))
    if t > .4: ctext(d, 130, "AND NOW", F("Jost800", 58), CREAM, tracking=22)
    if t > 1.0:
        sh = [(10, 10, (4, 16, 10)), (6, 6, MUSTARD), (3, 3, ORANGE)]
        ctext(d, 250, "Back to our", F("Shrikhand", 120), CREAM, shadow=sh)
        ctext(d, 390, "program", F("Shrikhand", 150), CREAM, shadow=sh)
    if t > 2.0: ctext(d, H - 96, "ON ZTV", F("Jost800", 34), CREAM, tracking=18)
    return img
DUR_back_to_program = 7.0

SCENES = {"house-rules": (house_rules, DUR_house_rules), "snack-bar": (snack_bar, DUR_snack_bar),
          "leader": (leader, DUR_leader), "back-to-program": (back_to_program, DUR_back_to_program)}

# ---------- the film pass ----------
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - .38 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) ** 1.4
gate = np.ones((H, W), np.float32); rad = 60; m = 18
for cxx, cyy in ((m + rad, m + rad), (W - m - rad, m + rad), (m + rad, H - m - rad), (W - m - rad, H - m - rad)):
    sel = ((xx < m + rad) if cxx < W / 2 else (xx > W - m - rad)) & ((yy < m + rad) if cyy < H / 2 else (yy > H - m - rad))
    gate[sel & (((xx - cxx) ** 2 + (yy - cyy) ** 2) > rad ** 2)] = 0
gate[:m, :] = 0; gate[-m:, :] = 0; gate[:, :m] = 0; gate[:, -m:] = 0
gate = np.array(Image.fromarray((gate * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255

class Film:
    def __init__(self, seed, n):
        self.r = np.random.default_rng(seed); r = self.r
        self.wx = np.cumsum(r.normal(0, .5, n)); self.wx -= np.convolve(self.wx, np.ones(15) / 15, "same")
        self.wy = np.cumsum(r.normal(0, .7, n)); self.wy -= np.convolve(self.wy, np.ones(15) / 15, "same")
        self.scr = (int(r.integers(n // 4, n // 2)), int(r.integers(20, 45)), float(r.uniform(.2, .8)))  # one scratch: start, length, x
        self.n = n
    def __call__(self, img, i):
        r = self.r; a = np.asarray(img, np.float32)
        a = np.roll(a, (int(round(self.wy[i])), int(round(self.wx[i]))), (0, 1))
        a = a * np.array([.9, 1.0, .92]) * .9 + np.array([10, 20, 14])          # green-cast print, lifted blacks
        a *= 1 + r.normal(0, .025)                                                  # flicker
        g = r.normal(0, 7, (H // 2, W // 2)).astype(np.float32)                    # grain at half res, like a print
        g = np.kron(g, np.ones((2, 2), np.float32)); a += g[..., None] * .9
        for _ in range(r.poisson(1.4)):                                             # dust
            x, y, s = r.integers(0, W), r.integers(0, H), r.uniform(1.5, 5)
            m_ = (xx - x) ** 2 + ((yy - y) * r.uniform(.4, 1.6)) ** 2 < s * s
            a[m_] = a[m_] * .25 if r.random() < .8 else np.minimum(255, a[m_] + 120)
        st, ln, sx = self.scr
        if st <= i < st + ln:                                                       # a scratch running down the print
            x = int((sx + .01 * math.sin(i * .3)) * W); a[:, x:x + 2] = np.minimum(255, a[:, x:x + 2] + 70)
        if self.n - 18 <= i < self.n - 14:                                          # cue mark, top right, like a reel change
            m_ = (xx - (W - 150)) ** 2 + (yy - 110) ** 2 < 30 ** 2; a[m_] = np.array([14, 28, 18])
        a *= vig[..., None]; a *= gate[..., None]
        return np.clip(a, 0, 255).astype(np.uint8)

# ---------- sound ----------
rng = np.random.default_rng(3)
def tone(f, d, amp=1., kind="sine", ph=0):
    t = np.arange(int(d * SR)) / SR
    if kind == "saw": return (2 * ((t * f + ph) % 1) - 1) * amp
    if kind == "tri": return (2 * np.abs(2 * ((t * f + ph) % 1) - 1) - 1) * amp
    return np.sin(2 * np.pi * f * t + ph) * amp
def env(x, a=.01, r=.1):
    n = len(x); e = np.ones(n); ai = min(n, int(a * SR)); ri = min(n, int(r * SR))
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] = np.minimum(e[-ri:], np.linspace(1, 0, ri))
    return x * e
def place(b, x, at):
    i = int(at * SR); j = min(len(b), i + len(x))
    if i < len(b): b[i:j] += x[:j - i]
def lp(x, k=.08):
    y = np.empty_like(x); acc = 0.
    for i in range(len(x)): acc += k * (x[i] - acc); y[i] = acc
    return y
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def organ(notes, d, amp=.05):
    o = np.zeros(int(d * SR))
    for n_ in notes:
        f = mtof(n_); o += tone(f, d, amp) + tone(f * 2, d, amp * .5) + tone(f * 3, d, amp * .2)
    lfo = 1 + .06 * np.sin(2 * np.pi * 5.5 * np.arange(len(o)) / SR)              # leslie-ish wobble
    return env(o * lfo, .03, .25)
def projector(D):
    n = int(D * SR); t = np.arange(n) / SR
    hum = np.sin(2 * np.pi * 60 * t) * .006 + np.sin(2 * np.pi * 120 * t) * .003
    click = np.zeros(n); per = SR // 24
    for i in range(0, n, per): click[i:i + 90] += rng.uniform(-1, 1, min(90, n - i)) * .035
    hiss = lp(rng.uniform(-1, 1, n), .25) * .03
    crackle = np.zeros(n)
    for i in rng.integers(0, n, int(D * 9)): crackle[i:i + 40] += rng.uniform(-1, 1, min(40, n - i)) * .12
    return hum + click + hiss + crackle

def snd_house_rules(D):
    b = projector(D)
    for at, ch in ((0, [53, 57, 60]), (2.2, [55, 58, 62]), (4.8, [57, 60, 64]), (7.0, [53, 57, 60, 65])):
        place(b, organ(ch, 2.5 if at < 7 else 2.6), at)
    return b
def snd_snack_bar(D):
    b = projector(D); beat = .25  # 120 bpm, swung eighths
    bass = [41, 45, 48, 45, 43, 46, 50, 46]; prog = [[53, 57, 60], [55, 58, 62]]
    k = 0; t = 0.
    while t < D - .4:
        n_ = bass[k % len(bass)]; place(b, env(tone(mtof(n_ - 12), .22, .16, "tri"), .005, .08), t)
        if k % 2 == 1: place(b, env(organ(prog[(k // 4) % 2], .16, .045), .005, .05), t)
        t += beat * (1.15 if k % 2 == 0 else .85); k += 1
    for at in np.arange(.3, D - .5, .7): place(b, env(lp(rng.uniform(-1, 1, int(.05 * SR)), .5) * .3, .001, .04), at + rng.uniform(0, .2))  # pops
    return b
def snd_leader(D):
    b = projector(D); step = .62
    for k in range(6): place(b, env(lp(rng.uniform(-1, 1, int(.03 * SR)), .4) * .2, .001, .02), k * step)  # splice ticks
    place(b, env(tone(1000, 1 / 24, .3), .001, .003), 6 * step)                                             # the 2-pop
    place(b, organ([48, 55, 60, 64, 67], 1.9, .045), 6 * step + .6)
    return b
def snd_back_to_program(D):
    b = projector(D)
    sw = env(lp(rng.uniform(-1, 1, int(1.0 * SR)), .6) * np.linspace(0, .25, int(1.0 * SR)), .9, .05); place(b, sw, 0)  # cymbal swell
    for at, ch in ((1.0, [48, 52, 55, 60]), (1.5, [50, 53, 57, 62]), (2.0, [52, 55, 59, 64, 67])):
        st = np.zeros(int(1.6 * SR))
        for n_ in ch: st += lp(tone(mtof(n_), 1.6, .05, "saw"), .12)
        place(b, env(st, .008, 1.2 if at == 2.0 else .35), at)
    return b
SND = {"house-rules": snd_house_rules, "snack-bar": snd_snack_bar, "leader": snd_leader, "back-to-program": snd_back_to_program}

def norm(x, rms_db=-24, peak=.7):
    r_ = np.sqrt(np.mean(x ** 2)) + 1e-9; x = x * (10 ** (rms_db / 20) / r_); p = np.max(np.abs(x))
    return x * (peak / p) if p > peak else x

if __name__ == "__main__":
    OUT = sys.argv[1]; names = sys.argv[2:] or list(SCENES)
    for name in names:
        fn, D = SCENES[name]; n = int(round(D * FPS)); film = Film(sum(map(ord, name)), n)
        tv, ta, to = f"/tmp/fb-{name}-v.mp4", f"/tmp/fb-{name}.wav", f"{OUT}/.{name}.tmp.mp4"
        p = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", tv], stdin=subprocess.PIPE)
        for i in range(n): p.stdin.write(film(fn(i / FPS), i).tobytes())
        p.stdin.close(); assert p.wait() == 0, name
        a = np.clip(norm(SND[name](D)), -1, 1)
        with wave.open(ta, "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); s = (a * 32767).astype(np.int16); w.writeframes(np.column_stack([s, s]).tobytes())
        r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tv, "-i", ta, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", to])
        assert r.returncode == 0, name
        os.replace(to, f"{OUT}/{name}.mp4"); print("rendered", name, f"{D:.1f}s", os.path.getsize(f"{OUT}/{name}.mp4") // 1024, "KB", flush=True)
