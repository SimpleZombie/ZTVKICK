#!/usr/bin/env python3
"""ZTV catalog filler. Finds archive.org videos for channels that have no shows yet, checks
each one has a playable .mp4 and how long it is, and saves them to data/catalog-extra.js.

catalog-extra.js lives only on the server and update zips never include it, so installing an
update can't wipe what this script found. The page merges it with data/catalog.js.

Run it on the server (it needs to reach archive.org):
    python3 ztv-kick/server/fill-catalog.py            # fill every empty channel listed below
    python3 ztv-kick/server/fill-catalog.py deep-blue  # just one channel
    python3 ztv-kick/server/fill-catalog.py --all      # also top up channels that already have shows
    python3 ztv-kick/server/fill-catalog.py --redo tech-support   # throw out what it found for a channel and search again

Edit SEARCHES to change what it looks for, SKIP_TITLES to keep things out.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CAT = os.path.join(HERE, "..", "data", "catalog.js")
EXTRA = os.path.join(HERE, "..", "data", "catalog-extra.js")
PER_CHANNEL = 40          # shows to collect for an empty channel
TOPUP = 25                # naming a channel that already has shows adds up to this many more
MIN_MIN, MAX_MIN = 4, 150 # skip anything shorter / longer than this many minutes

# channel id -> archive.org searches (most useful first). "P:" means search the Prelinger industrial-film collection.
SEARCHES = {
  "the-other-line": ['"psychic friends"', 'psychic hotline', 'psychic infomercial', '"900 number"', 'tarot commercial',
                     '"call-in" show', 'phone-in show', 'telethon 198', 'telethon 199', '"dionne warwick"'],
  "community-board": ['"community bulletin board"', '"public access" announcements', '"bulletin board" cable access',
                      '"community calendar" cable', '"local access" channel 199', 'cable "character generator"', '"public access television"'],
  "deep-blue": ['underwater documentary', 'ocean documentary', '"marine life" film', 'scuba diving film',
                'coral reef documentary', 'aquarium film', 'deep sea expedition', 'P:underwater', 'P:ocean'],
  "final-offer": ['"home shopping network"', 'QVC 199', '"shop at home" television', '"home shopping club"',
                  '"as seen on tv" 198', 'shopping channel vhs', '"value vision"'],
  "cheat-code": ['walkthrough vhs', '"tips and tricks" video game vhs', '"nintendo power" video', 'strategy guide vhs game',
                 '"game counselor"', 'video game promotional vhs', 'sega video game demo tape'],
  "factory-floor": ['P:"assembly line"', 'P:automobile', 'P:plant', 'P:factory', 'P:manufacturing', 'P:assembly line', 'P:industry', 'P:steel', 'P:production',
                    'factory tour film', 'industrial film manufacturing'],
  "laboratory-b": ['P:"bell telephone"', 'P:electricity', 'P:physics', 'P:science', 'P:laboratory', 'P:experiment', 'P:chemistry', 'P:atomic', 'P:research',
                   'educational science film 195', 'science demonstration film'],
  # TechTV / ZDTV era: every search has to tie back to the network or its hosts (Q: = exact archive.org query)
  "tech-support": ['Q:title:("screen savers") AND (techtv OR zdtv OR laporte OR "patrick norton" OR "kevin rose" OR "martin sargent")',
                   'Q:title:("call for help") AND (techtv OR zdtv OR laporte OR "chris pirillo" OR "becky worley" OR "andy walker")',
                   'Q:subject:(techtv) OR subject:(zdtv) OR subject:("tech tv")',
                   'Q:(techtv OR zdtv) AND (episode OR show OR broadcast OR aired)',
                   'Q:"leo laporte" AND (techtv OR zdtv OR "screen savers" OR "call for help")',
                   'Q:title:("silicon spin") AND (zdtv OR techtv OR dvorak)',
                   'Q:title:("big thinkers") AND (zdtv OR techtv)',
                   'Q:title:("fresh gear") AND (zdtv OR techtv)',
                   'Q:title:("internet tonight") AND (zdtv OR techtv)',
                   'Q:title:("cnet central") OR (title:("the new edge") AND cnet)',
                   'Q:title:("the site") AND (msnbc OR "soledad o\'brien")',
                   'Q:title:("computer connection") AND cnn',
                   'Q:title:("bits and bytes") AND (tvo OR computer OR "luba goy")'],
  "warp-zone": ['"electric playground"', '"bad influence"', 'gamesmaster', '"gamepro tv"', '"nick arcade"', 'video game show 199'],
  "world-of-tomorrow": ['"beyond 2000"', '"the next step" discovery', '"tomorrow\'s world"', 'P:future', 'P:"world of tomorrow"', 'P:"kitchen of tomorrow"', 'futurism documentary', '"popular science" television'],
  "seasoned-viewers": ['"justin wilson"', '"french chef"', '"great chefs"', '"jacques pepin"', '"galloping gourmet"', '"graham kerr"', '"two fat ladies"', '"yan can cook"', '"frugal gourmet"', 'cooking show 198', 'cooking show 199'],
  "tv-dinner": ['P:food', 'P:kitchen', 'P:cooking', 'P:supermarket', 'P:"home economics"', 'P:nutrition', 'home economics film', 'cooking show 195', 'vintage cooking film'],
  "waiting-room": ['P:health', 'P:hospital', 'P:nurse', 'P:hygiene', 'P:doctor', 'P:dentist', 'P:medicine', 'health education film', 'nursing training film', '"medical film"'],
  "denpa": ['japanese television', 'japan tv 198', 'japan tv 199', 'japanese commercials', 'japanese local news',
            'japanese educational film', 'japan documentary', 'japanese public access', 'video art japan', 'japanese experimental video',
            'NHK', 'テレビ', '番組', 'ローカル', 'ビデオ 198', 'CM 199', '教育', 'ドキュメンタリー'],
  "departure-gate": ['P:airline', 'P:aviation', 'P:airport', 'P:travel', '"pan am" film', 'TWA promotional film',
                     'airline promotional film', 'vintage airport film', 'travelogue 196'],
}

# skip modern web-video reuploads and comedy clips that keyword searches drag in
SKIP_IDS = re.compile(r"^(youtube-|roosterteeth-|funny_or_die|endurance-run|g4tv|interspeciesio-)", re.I)
# per-channel titles to leave out (each channel has its own; anime has its own channels already)
SKIP_TITLES = {
  # health films stay off anything graphic: no surgery, autopsies, births or disease close-ups on stream
  "waiting-room": re.compile(r"surg|operation|autops|dissect|childbirth|birth of|abortion|venereal|syphilis|gonorrh|wound|amputat|cadaver|leprosy|burns", re.I),
  "tech-support": re.compile(r"new screen savers|twit\b|this week in tech|attack of the show|x-?play|g4\b|tekzilla|revision3|podcast|"
                            r"church|sermon|prayer|pray\b|jesus|christ|\bgod\b|bible|gospel|ministr|worship|faith|pastor|revival|prophec|scripture|testimony|salvation", re.I),
  "denpa": re.compile(r"anime|\bova\b|episode \d|gundam|dragon ?ball|sailor moon|pokemon|amv|fandub|dub\b", re.I),
}
UA = {"User-Agent": "ZTV-catalog-filler/1.0"}
def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:
            if i == tries - 1: print("   ! ", e); return None
            time.sleep(2 + i * 3)

def search(q, rows=60):
    if q.startswith("Q:"):
        query = "mediatype:movies AND (%s)" % q[2:]
    elif q.startswith("P:"):
        query = "collection:prelinger AND mediatype:movies AND (%s)" % q[2:]
    else:
        query = "mediatype:movies AND title:(%s)" % q
    url = "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(
        [("q", query), ("fl[]", "identifier"), ("fl[]", "title"), ("rows", rows), ("sort[]", "downloads desc"), ("output", "json")])
    j = get(url) or {}
    return [(d["identifier"], d.get("title") or d["identifier"]) for d in j.get("response", {}).get("docs", [])]

def secs(v):
    if v is None: return 0
    v = str(v).strip()
    if re.match(r"^\d+(\.\d+)?$", v): return float(v)
    m = re.match(r"^(\d+):(\d+):(\d+(?:\.\d+)?)$", v)
    if m: return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
    m = re.match(r"^(\d+):(\d+(?:\.\d+)?)$", v)
    if m: return int(m[1]) * 60 + float(m[2])
    m = re.search(r"(\d+)\s*min", v)
    if m: return int(m[1]) * 60
    return 0

def check(ident):
    """returns length in seconds if there's a playable mp4, else 0"""
    m = get("https://archive.org/metadata/" + urllib.parse.quote(ident))
    if not m or m.get("is_dark"): return 0
    files = m.get("files", [])
    mp4 = [f for f in files if f.get("format") in ("h.264 IA", "h.264", "512Kb MPEG4", "MPEG4") or str(f.get("name", "")).lower().endswith(".mp4")]
    if not mp4: return 0
    if len(mp4) > 6: return 0      # big multi-file collections don't play as one show
    L = max([secs(f.get("length")) for f in mp4] + [0])
    if not L: L = secs((m.get("metadata") or {}).get("runtime"))
    return int(L)

def clean(t):
    t = re.sub(r"\s+", " ", str(t)).strip()
    return t[:90]

def parse(path, name):
    if not os.path.exists(path): return {}
    t = open(path, encoding="utf-8").read()
    return json.loads(t[t.index("{"):t.rindex("}") + 1]) if "{" in t else {}

def load():
    return parse(CAT, "CATALOG"), parse(EXTRA, "CATALOG_EXTRA")

def save(extra):
    lines = [json.dumps(k) + ":[" + ",\n".join(json.dumps(r, ensure_ascii=False) for r in v) + "]" for k, v in extra.items() if v]
    head = "/* Shows found on this server by server/fill-catalog.py. Kept out of update zips, merged with data/catalog.js by the page. */\nvar CATALOG_EXTRA="
    tmp = EXTRA + ".tmp"
    open(tmp, "w", encoding="utf-8").write(head + "{\n" + ",\n".join(lines) + "\n};\n")
    os.replace(tmp, EXTRA)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    top_up = "--all" in sys.argv
    cat, extra = load()
    if "--redo" in sys.argv:          # start the named channels over: forget what this script found for them before
        for ch in args:
            if extra.pop(ch, None) is not None: print("Cleared earlier finds for", ch)
        save(extra)
    used = {r[0] for v in list(cat.values()) + list(extra.values()) for r in v}
    used |= set(parse(os.path.join(HERE, "..", "data", "catalog-skip.js"), "CATALOG_SKIP"))   # taken out by check-videos.py
    have_n = lambda k: len(cat.get(k) or []) + len(extra.get(k) or [])
    todo = args or [k for k in SEARCHES if top_up or not have_n(k)]
    if not todo: print("Nothing to fill. Every channel in SEARCHES already has shows (name a channel or use --all to top them up)."); return
    for ch in todo:
        if ch not in SEARCHES: print("No searches set for", ch, "- add it to SEARCHES"); continue
        have = extra.get(ch) or []; start = have_n(ch)
        goal = PER_CHANNEL if start < PER_CHANNEL and not (args and start) else start + TOPUP
        if args and start: goal = start + TOPUP
        print("\n== %s (has %d, looking for up to %d more)" % (ch, start, goal - start))
        n0 = len(have)
        for q in SEARCHES[ch]:
            if start + len(have) - n0 >= goal: break
            print("  searching:", q)
            for ident, title in search(q):
                if start + len(have) - n0 >= goal: break
                if ident in used or SKIP_IDS.search(ident): continue
                if ch in SKIP_TITLES and SKIP_TITLES[ch].search(title or ""): continue
                used.add(ident)
                L = check(ident); time.sleep(.3)
                if not (MIN_MIN * 60 <= L <= MAX_MIN * 60): continue
                have.append([ident, clean(title), L]); print("   + %-60s %3d min" % (clean(title)[:60], L // 60))
        extra[ch] = have; save(extra)
        print("  -> %d new shows this run (%d found here in total, %.1f hours)" % (len(have) - n0, len(have), sum(r[2] for r in have) / 3600))
    print("\nSaved to data/catalog-extra.js. Run setup to put it live:  bash ztv-kick/server/setup.sh")

if __name__ == "__main__":
    main()
