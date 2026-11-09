"""Render each bumper to bumpers/<name>.mp4: pixel frames -> x264, synthesized sound -> AAC, joined without re-encoding video."""
import sys, os, subprocess, numpy as np, wave
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bumps import BUMPS
from px import crt
OUT = sys.argv[1]; names = sys.argv[2:] or list(BUMPS)
SR = 48000
rng = np.random.default_rng(11)

def tone(f, d, amp=1.0, kind="sine"):
    t = np.arange(int(d*SR))/SR
    if kind == "tri": w = 2*np.abs(2*((t*f) % 1)-1)-1
    elif kind == "saw": w = 2*((t*f) % 1)-1
    else: w = np.sin(2*np.pi*f*t)
    return w*amp
def env(x, a=.05, r=.2):
    n = len(x); e = np.ones(n); ai = int(a*SR); ri = int(r*SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] = np.minimum(e[-ri:], np.linspace(1, 0, ri))
    return x*e
def lowpass(x, k):  # simple one-pole smoothing
    y = np.empty_like(x); acc = 0.0; a = k
    for i in range(0, len(x), 1): acc += a*(x[i]-acc); y[i] = acc
    return y
def brown(d, amp):
    w = rng.standard_normal(int(d*SR)); b = np.cumsum(w); k = 4801
    c = np.cumsum(np.concatenate([[0], b])); ma = (c[k:]-c[:-k])/k; ma = np.concatenate([np.full(k//2, ma[0]), ma, np.full(len(b)-len(ma)-k//2, ma[-1])])
    b = b-ma; return b/np.max(np.abs(b)+1e-9)*amp
def white(d, amp): return rng.uniform(-1, 1, int(d*SR))*amp
def place(buf, x, at):
    i = int(at*SR); j = min(len(buf), i+len(x)); buf[i:j] += x[:j-i]
def chord(notes, d, amp=.08):
    out = np.zeros(int(d*SR))
    for m in notes:
        f = 440*2**((m-69)/12); out += tone(f, d, amp, "sine")+tone(f*2, d, amp*.25, "tri")
    return env(out, .8, 1.2)

def snd_night_drive(D):
    b = np.zeros(int(D*SR)); place(b, chord([48, 55, 59, 64], D/2+.6, .05), 0); place(b, chord([45, 52, 57, 60, 64], D/2, .05), D/2-.2)
    place(b, env(brown(D, .05), 1.0, 1.0), 0)
    return b
def snd_signal(D):
    b = np.zeros(int(D*SR)); st = white(D, .22); k = np.ones(len(st)); t = np.arange(len(st))/SR
    k = np.clip(1-(t-1.6)/1.6, 0, 1); b += st*k
    place(b, env(tone(1000, D-3.3, .09), .02, .4), 3.3)
    place(b, env(tone(1568, .35, .06), .005, .3), 3.4)
    return b
def snd_right_back(D):
    b = np.zeros(int(D*SR)); b += env(white(D, .03), .2, .6)
    t = np.arange(int(4.4*SR))/SR; f = 140+60*t/4.4
    whir = (np.sin(2*np.pi*np.cumsum(f)/SR)*.08+np.sign(np.sin(2*np.pi*np.cumsum(f*2)/SR))*.015)
    place(b, env(whir, .15, .3), 1.6)
    for at in (1.6, 6.0): place(b, env(white(.06, .25), .002, .05), at)
    return b
def snd_late_room(D):
    b = np.zeros(int(D*SR)); b += env(brown(D, .04), 1, 1); b += env(tone(60, D, .012)+tone(120, D, .006), 1, 1)
    place(b, chord([43, 50, 55, 58], D-1, .035), .5)
    return b
def snd_surf(D):
    b = np.zeros(int(D*SR))
    for i in range(10): at = i*.42; place(b, env(white(.012, .16), .001, .008), at); place(b, env(white(.1, .07), .002, .05), at)
    place(b, chord([48, 55, 60, 64, 67], D-9*.42, .05), 9*.42+.15)
    return b
SND = {"night-drive": snd_night_drive, "signal": snd_signal, "right-back": snd_right_back, "late-room": snd_late_room, "surf": snd_surf}

def norm(x, rms_db=-24, peak=.7):
    r = np.sqrt(np.mean(x**2))+1e-9; x = x*(10**(rms_db/20)/r); p = np.max(np.abs(x))
    return x*(peak/p) if p > peak else x

for name in names:
    fn, D = BUMPS[name]; n = int(round(D*30))
    tmpv = f"/tmp/vb-{name}-v.mp4"; tmpa = f"/tmp/vb-{name}.wav"; tmpo = f"{OUT}/.{name}.tmp.mp4"
    p = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1280x720", "-r", "30", "-i", "-",
                          "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", tmpv], stdin=subprocess.PIPE)
    for i in range(n): p.stdin.write(crt(fn(i/30)).tobytes())
    p.stdin.close(); assert p.wait() == 0, name
    a = norm(SND[name](D)); a = np.clip(a, -1, 1)
    with wave.open(tmpa, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        s = (a*32767).astype(np.int16); w.writeframes(np.column_stack([s, s]).tobytes())
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tmpv, "-i", tmpa, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                        "-shortest", "-movflags", "+faststart", tmpo])
    assert r.returncode == 0, name
    os.replace(tmpo, f"{OUT}/{name}.mp4"); print("rendered", name, f"{D:.1f}s", os.path.getsize(f"{OUT}/{name}.mp4")//1024, "KB", flush=True)
