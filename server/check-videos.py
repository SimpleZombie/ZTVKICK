#!/usr/bin/env python3
"""ZTV dead video checker. Asks archive.org about every show in the catalog and takes out the ones that
were removed, made private, or no longer have a video the player can use, so viewers stop landing on NO SIGNAL.

Runs by itself every Sunday at 5 AM Central (set up by server/setup.sh). To run it now:
    python3 ztv-kick/server/check-videos.py

How it decides:
  * a show has to fail two checks in a row (a week apart) before it's taken out, because archive.org has the odd bad day
  * if a removed show comes back, it's put back on the next check
  * a show that just times out is never counted as dead

Removed shows are listed in data/catalog-skip.js, which lives only on the server (update zips never include it).
The page leaves them out of the schedule, and server/fill-catalog.py won't add them back.
History of every check: data/catalog-check.json. A short report is printed and kept in /var/log/ztv-check-videos.log.
"""
import json, os, sys, time, datetime, shutil, threading, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
CAT, EXTRA = os.path.join(DATA, "catalog.js"), os.path.join(DATA, "catalog-extra.js")
SKIP, STATE = os.path.join(DATA, "catalog-skip.js"), os.path.join(DATA, "catalog-check.json")
LIVE = "/var/www/ztv/data"            # where the running stream reads from
LOG = "/var/log/ztv-check-videos.log"
STRIKES = 2                            # failed checks in a row before a show is taken out
WORKERS = 4                            # gentle on archive.org
PLAYABLE = ("h.264 IA", "h.264", "512Kb MPEG4", "MPEG4")
UA = {"User-Agent": "ZTV-video-checker/1.0"}

def parse(path):
    if not os.path.exists(path): return {}
    t = open(path, encoding="utf-8").read()
    return json.loads(t[t.index("{"):t.rindex("}") + 1]) if "{" in t else {}

def check(ident):
    """'ok', 'dead:<reason>', or 'unknown' (couldn't reach archive.org: never counted against a show)"""
    url = "https://archive.org/metadata/" + urllib.parse.quote(ident)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                m = json.loads(r.read().decode("utf-8", "replace"))
            break
        except Exception:
            if attempt == 2: return "unknown"
            time.sleep(3 + attempt * 5)
    if not m: return "dead:item is gone"
    if m.get("is_dark"): return "dead:item was taken down"
    md = m.get("metadata") or {}
    if str(md.get("access-restricted-item", "")).lower() == "true": return "dead:item is restricted"
    files = [f for f in (m.get("files") or []) if str(f.get("private", "")).lower() != "true"]
    if not any(f.get("format") in PLAYABLE or str(f.get("name", "")).lower().endswith(".mp4") for f in files):
        return "dead:no playable video"
    return "ok"

def main():
    cat, extra = parse(CAT), parse(EXTRA)
    shows = {}
    for src in (cat, extra):
        for ch, rows in src.items():
            for r in rows: shows.setdefault(r[0], (ch, r[1]))
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    today = datetime.date.today().isoformat()
    print("Checking %d shows on archive.org (this takes a while)..." % len(shows), flush=True)
    results, lock, done = {}, threading.Lock(), [0]
    def work(ident):
        res = check(ident); time.sleep(.25)
        with lock:
            results[ident] = res; done[0] += 1
            if done[0] % 250 == 0: print("  %d / %d" % (done[0], len(shows)), flush=True)
    with ThreadPoolExecutor(WORKERS) as ex: list(ex.map(work, shows))

    newly_out, back, still_out, warned, unknown = [], [], [], [], 0
    for ident, res in results.items():
        s = state.get(ident, {"strikes": 0})
        if res == "unknown": unknown += 1; continue
        if res == "ok":
            if s.get("out"): back.append(ident)
            state.pop(ident, None); continue
        s["strikes"] = s.get("strikes", 0) + 1; s["why"] = res[5:]; s["last"] = today
        if s["strikes"] >= STRIKES:
            if not s.get("out"): s["out"] = today; newly_out.append(ident)
            else: still_out.append(ident)
        else: warned.append(ident)
        state[ident] = s
    for ident in list(state):                     # shows no longer in any catalog: forget them
        if ident not in shows: state.pop(ident)
    json.dump(state, open(STATE, "w"), indent=1)

    skip = {i: {"why": s["why"], "since": s["out"]} for i, s in state.items() if s.get("out")}
    head = "/* Shows taken out by server/check-videos.py (gone or broken on archive.org). Server only, never in update zips. */\nvar CATALOG_SKIP="
    tmp = SKIP + ".tmp"; open(tmp, "w", encoding="utf-8").write(head + json.dumps(skip, indent=0) + ";\n"); os.replace(tmp, SKIP)
    if os.path.isdir(LIVE):
        shutil.copy(SKIP, os.path.join(LIVE, "catalog-skip.js"))
        try: shutil.chown(os.path.join(LIVE, "catalog-skip.js"), "www-data", "www-data")
        except Exception: pass

    name = lambda i: "%s  (%s: %s)" % (shows[i][1], shows[i][0], state.get(i, {}).get("why", ""))
    lines = ["ZTV video check %s: %d shows checked" % (today, len(shows)),
             "  taken out now: %d" % len(newly_out)] + ["    - " + name(i) for i in newly_out] + \
            ["  failed once (out next week if still broken): %d" % len(warned)] + ["    - " + name(i) for i in warned[:40]] + \
            ["  back again: %d" % len(back)] + ["    + %s" % shows[i][1] for i in back] + \
            ["  already out: %d   couldn't reach archive.org for: %d" % (len(still_out), unknown),
             "  total out of the schedule: %d" % len(skip),
             "  The stream picks this up at its next restart (4 AM, noon or 8 PM)."]
    report = "\n".join(lines); print("\n" + report)
    try: open(LOG, "a").write(report + "\n\n")
    except Exception: pass

if __name__ == "__main__":
    main()
