/* ZTV extras: alerts, leaderboard, votes, weather, chat bumps, late night, ads, requests, Z Bucks and more.
   Set on:false to turn any of them off. Preview keys on your PC: U sub, G gift bomb, V vote, L weather.
   Mod chat commands (work on the 24/7 server): !testsub  !testgift 10  !startvote  !weather */
var EXTRAS={
  subs:{
    on:true,
    secs:8,           // how long a sub / small gift alert stays in the top bar
    bombAt:5,         // this many gifted subs at once gets the big center-screen alert
    bombSecs:10
  },
  leaderboard:{
    on:true,          // "Top channel surfers this week" joins the takeover rotation
    top:5             // resets every Monday at midnight Central
  },
  vote:{
    on:true,
    minMins:50,       // a Viewer's Choice vote pops up somewhere between these two
    maxMins:70,
    secs:90           // how long chat gets to vote with !vote 1, 2 or 3
  },
  view:{
    start:"guide",     // what shows when ZTV starts: "guide" or "watch" (the big-picture view)
    autoBackMins:15,   // after !fullscreen, go back to the guide after this many minutes (0 = stay until !guide)
    cooldown:60        // seconds between !fullscreen / !guide switches from regular viewers (mods skip it)
  },
  bumps:{
    on:true,          // viewers send !bump your message, a mod approves it with !ok (or !no), and it plays between shows
    everyMins:12,     // at most one chat bump every this many minutes
    maxLen:120,       // longest message allowed
    cost:50           // Z Bucks it costs to send one (given back if a mod says no). 0 = free
  },
  lateNight:{
    on:true,          // darker look, odder takeovers, and they come more often
    from:0, to:5      // hours, Central time (0 = midnight, 5 = 5 AM)
  },
  deadAir:{
    on:true,          // once a night, somewhere between 3:05 and 3:40 AM Central, the stream "goes off the air"
    from:5, to:40     // minutes after 3 AM
  },
  restarts:{
    // the server restarts Chrome at these times (Central) to keep things fresh. Keep these the same as RESTART_TIMES in server/setup.sh.
    times:["04:00","12:00","20:00"],
    standBy:true      // "Please stand by" card a minute before the noon and 8 PM restarts, and a hello after
  },
  signOff:{
    on:true           // 3:58 AM Central: sign-off before the 4 AM restart, and a sign-on when it comes back
  },
  afterHours:{on:true,minMins:68,maxMins:105},
  stationIds:{
    on:true,          // short, deadpan network ident cards between regular programming
    minMins:24, maxMins:42
  },
  ads:{
    on:true,          // ad breaks. Listings and commercials live in data/ads.js
    style:"classifieds", // "classifieds" (quiet cable-access listings), "commercials" (the fake commercials) or "mix"
    music:"soft",     // "soft" (quiet elevator music) or "off"
    minMins:45, maxMins:75
  },
  alert:{
    on:true,          // the rare ZOMBIE ALERT crawl (clearly marked as a parody)
    minHours:4, maxHours:8
  },
  request:{
    on:true,          // !request words from a title: plays it next in a "Requested by" slot
    perUserMins:60,   // one request per viewer this often (mods skip it)
    maxQueue:5,
    maxShowMins:120,  // shows longer than this can't be requested
    waitMins:10       // a request starts when the current show ends, or after this many minutes, whichever is first
  },
  zbucks:{
    on:true,
    name:"Z BUCKS",
    perMinute:5,      // earned for chatting, at most once a minute per viewer
    follow:50, sub:500, gift:100,   // bonuses (gift is per sub gifted)
    prices:{ch:100, weather:300, takeover:200}   // !buy ch 12, !buy weather, !buy takeover
  },
  recap:{
    on:true,          // "Today on ZTV" card. Always plays during the sign-off; also this often:
    everyHours:6
  },
  surf:{
    flips:5           // !surf flips through this many channels, then lands on a random one
  },
  ticker:{
    // the scrolling crawl at the bottom. "Now playing" is added in front automatically.
    messages:[
      "FOLLOW ON KICK.COM/SIMPLEZOMBIE",
      "NO BRAINS WERE HARMED IN THE MAKING OF THIS BROADCAST"
    ],
    secsPerChar:.16   // scroll speed (lower = faster)
  },
  playback:{
    lightOverMins:60  // shows this long or longer use archive.org's lighter copy when there is one (buffers much less)
  },
  weather:{
    on:true,
    minMins:40,       // a Z Weather break plays somewhere between these two
    maxMins:70,
    cities:3,         // random cities per break (1 to 5). Each gets Current Conditions + Extended Forecast
    pageSecs:8,       // seconds per page, so 3 cities is about 50 seconds
    regions:["us","world"],  // which built-in lists to pick from: "us" (~58 US cities) and/or "world" (Japan, Europe, etc.)
    places:[],        // leave empty for the built-in list of ~60 cities, or list your own like:
                      // [["Austin",30.267,-97.743],["Roswell, NM",33.394,-104.523]]  (name, latitude, longitude)
    theme:"broadcast", // original blue-and-white ZTV cable weather presentation
    logo:"network",   // ZTV Weather Network original logo
    music:"audio/ztv-weather-track-01.ogg", // original ZTV Weather Desk theme
    requests:{on:true,perUserMins:10,globalSecs:30,maxQueue:4} // !weather ZIP or city, state
  }
};
