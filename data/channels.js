/* Channel lineup: dial number, name, color and description. */
var CHANNELS=[
  {
    "id": "saturday-morning",
    "num": 2,
    "name": "SATURDAY MORNING",
    "color": "#FF6F00",
    "desc": "Wake up, pour the cereal, watch cartoons. Actual Saturday morning broadcast recordings, commercials and all."
  },
  {
    "id": "ztv",
    "num": 3,
    "name": "ZTV",
    "color": "#53fc18",
    "desc": "ZTV's own shelf. Training tapes, VHS oddities and tech-show rarities, picked by hand and looping all day."
  },
  {
    "id": "primetime",
    "num": 8,
    "name": "PRIMETIME",
    "color": "#C62828",
    "desc": "Primetime exactly as it aired — sitcoms, dramas, and variety blocks taped straight off the network feed. Laugh tracks, station IDs, and 8pm commercials intact. The couch, the cathode glow, the show everybody watched."
  },
  {
    "id": "syndicate",
    "num": 9,
    "name": "SYNDICATE",
    "color": "#455A64",
    "desc": "The truth is out there, and it's on cable at 1 a.m. with the commercials still in. Off-air tapes of the shows that ran forever in syndication — Mulder and Scully, Quantum Leap, Stargate, everyone lost in space. Trust no one; tape everything."
  },
  {
    "id": "late-nite-local",
    "num": 11,
    "name": "LATE NITE LOCAL",
    "color": "#B388FF",
    "desc": "It's 2 AM on public access. Someone is doing... something. You can't look away."
  },
  {
    "id": "happy-trees",
    "num": 12,
    "name": "HAPPY TREES",
    "color": "#035e12",
    "desc": "Every episode of The Joy of Painting with Bob Ross — 31 seasons of happy little trees, almighty mountains, and quiet streams. The most soothing 26 minutes on television, now running 24/7."
  },
  {
    "id": "computer-chronicles",
    "num": 13,
    "name": "COMPUTER CHRONICLES",
    "color": "#00C853",
    "desc": "Every episode of the PBS show that documented personal computing from 1983–2002. From the Apple II to the dot-com bust."
  },
  {
    "id": "open-mic",
    "num": 14,
    "name": "OPEN MIC",
    "color": "#E040FB",
    "desc": "ZTV's community access channel. Local bands. Talent shows. The best show you'll never see twice."
  },
  {
    "id": "library-card",
    "num": 15,
    "name": "STORY HOUR",
    "color": "#64B5F6",
    "desc": "The shows that sent you to the library: Reading Rainbow, Mister Rogers, Arthur, Wishbone and the Magic School Bus, all day."
  },
  {
    "id": "the-other-line",
    "num": 16,
    "name": "THE OTHER LINE",
    "color": "#88758d",
    "desc": "Your call is very important to someone. Psychic hotlines, call-in advice, late-night telephone shows and interactive broadcasts."
  },
  {
    "id": "community-board",
    "num": 17,
    "name": "COMMUNITY BOARD",
    "color": "#819477",
    "desc": "The bake sale was last Thursday. Community announcements, local notices, school bulletins and cable information screens."
  },
  {
    "id": "nature-preserve",
    "num": 25,
    "name": "NATURE PRESERVE",
    "color": "#004D40",
    "desc": "Longform nature documentaries from the golden age. Jungles, oceans, tundras, savannahs. Patient cameras and calm voices explaining a planet that was doing just fine before we got involved."
  },
  {
    "id": "deep-blue",
    "num": 26,
    "name": "DEEP BLUE",
    "color": "#648b9a",
    "desc": "The ocean is mostly unexplored. So is this tape collection. Underwater expeditions, marine documentaries, aquariums and diving films."
  },
  {
    "id": "unpaid-programming",
    "num": 28,
    "name": "UNPAID PROGRAMMING",
    "color": "#00E5FF",
    "desc": "Infomercials, all night: the knives, the abs, the get-rich tapes, and a man who is very excited about a mop."
  },
  {
    "id": "final-offer",
    "num": 29,
    "name": "FINAL OFFER",
    "color": "#b89b70",
    "desc": "The sale ends in seven minutes. It has been ending for thirty years. Vintage shopping broadcasts, odd inventions and endless demonstrations."
  },
  {
    "id": "radio-active-tv",
    "num": 30,
    "name": "MIXTAPE TV",
    "color": "#76FF03",
    "desc": "Music videos, VJ countdowns, and Headbangers Ball — someone taped over their sister's copy of Titanic with 6 hours of MTV."
  },
  {
    "id": "latchkey-tv",
    "num": 35,
    "name": "AFTER THE BELL",
    "color": "#00BFA5",
    "desc": "You let yourself in with the key around your neck and watched cable cartoons until your parents got home. VHS recordings of after-school cable tv toons, commercials and all."
  },
  {
    "id": "kersplat",
    "num": 36,
    "name": "GOO GAUNTLET",
    "color": "#7FD100",
    "desc": "Kids' game shows, back to back: obstacle courses, temple runs, the Aggro Crag, and a bucket of something green at the end."
  },
  {
    "id": "final-frontier",
    "num": 50,
    "name": "FINAL FRONTIER",
    "color": "#0277BD",
    "desc": "Space: the final frontier, on basic cable at 2 a.m. Every flavor of Star Trek beamed straight off the antenna — five-year missions, the next generation, the far side of the wormhole. Set phasers to rerun."
  },
  {
    "id": "rocket-punch",
    "num": 51,
    "name": "STEEL GIANTS",
    "color": "#9EACBD",
    "desc": "Mecha anime from the seventies to the nineties: the super robots, the real robots, and the kids who got stuck piloting them."
  },
  {
    "id": "ovatv",
    "num": 52,
    "name": "OVATV",
    "color": "#F73BD0",
    "desc": "Anime from the back of the rental store: OVAs and films two at a time, long runs of one series, and Saturday Anime taped off the air."
  },
  {
    "id": "toonertia",
    "num": 53,
    "name": "POWER LEVEL",
    "color": "#ff0000",
    "desc": "Action anime on an unstoppable loop. Toonami recordings straight off the VHS, commercials and all."
  },
  {
    "id": "late-nite-swimclub",
    "num": 54,
    "name": "THE DEEP END",
    "color": "#1A237E",
    "desc": "It's past midnight. The cartoons got weird. You should be asleep but you can't stop watching."
  },
  {
    "id": "warp-zone",
    "num": 55,
    "name": "WARP ZONE",
    "color": "#5AF6BD",
    "desc": "Video game TV from the arcade craze to the 2000s: the game shows, the magazine shows, and the promo and strategy tapes."
  },
  {
    "id": "frame-buffer",
    "num": 56,
    "name": "FRAME BUFFER",
    "color": "#FFB000",
    "desc": "Dedicated to the silicon that drew the pixels: 3dfx TV spots, Matrox tech demos, GTC keynotes, Carmack counting polygons, and years of AMD's channel on loop. From the days when a 3D accelerator meant a new expansion card, a new power supply, and a good excuse to miss dinner. 16-bit color, bilinear filtering on."
  },
  {
    "id": "and-now-a-word",
    "num": 57,
    "name": "AND NOW A WORD",
    "color": "#FFD54F",
    "desc": "And now a word from our sponsor. Forever. Vintage TV commercials in marathon reels — jingles, toys, cereal, cigarettes from before they knew better, and a man who is very excited about denture cream. The commercial break is the show."
  },
  {
    "id": "cheat-code",
    "num": 58,
    "name": "CHEAT CODE",
    "color": "#a98e8a",
    "desc": "For more tips, send a self-addressed stamped envelope. Game walkthrough tapes, strategy videos and promotional demo reels."
  },
  {
    "id": "be-kind-rewind",
    "num": 59,
    "name": "BE KIND REWIND",
    "color": "#FF7043",
    "desc": "Be kind, rewind. Every rental tape started with nine minutes of previews and an FBI warning you can now recite from memory. Video store culture, 1984–1997, tracked straight off VHS."
  },
  {
    "id": "20-minute-workout",
    "num": 60,
    "name": "20 MINUTE WORKOUT",
    "color": "#FF2D95",
    "desc": "Feel the burn, leotard-style. The aerobics VHS shelf: the 1983 classic, Denise Austin at 6 a.m., Gilad on a Waikiki beach, MTV's The Grind. Leg warmers are load-bearing. Your doctor will hear about this."
  },
  {
    "id": "tech-support",
    "num": 61,
    "name": "TECH SUPPORT",
    "color": "#7e6bc4",
    "desc": "Have you tried turning it off and on again? Live calls, Windows tweaks and gadget demos from the golden age of tech TV, when the internet came on a CD and a hard drive cost more than your car."
  },
  {
    "id": "mission-control",
    "num": 62,
    "name": "MISSION CONTROL",
    "color": "#B3E5FC",
    "desc": "The real space program, as broadcast. 16mm onboard film from Apollo, moon landing coverage, Skylab and Ranger. No aliens, no warp drive — just thrust, telemetry and crew cuts."
  },
  {
    "id": "secret-life",
    "num": 63,
    "name": "SECRET LIFE",
    "color": "#26A69A",
    "desc": "Machines confess under mild interrogation. The Secret Life of Machines takes apart the fridge, James Burke connects everything to everything else, and Mr. Wizard blows something up in the garage. Bring a screwdriver."
  },
  {
    "id": "net-cafe",
    "num": 64,
    "name": "NET CAFE",
    "color": "#B2FF59",
    "desc": "It's 1997 and the internet is a place you visit. PBS's Net Cafe tours web startups, chat rooms and personal homepages, all served at 56k. Mind the modem — someone's about to use the phone."
  },
  {
    "id": "please-stand-by",
    "num": 65,
    "name": "PLEASE STAND BY",
    "color": "#80DEEA",
    "desc": "The station has signed off. Color bars, test patterns, the anthem, then static until dawn. Programming for people who fell asleep with the TV on — we kept the transmitter warm."
  },
  {
    "id": "iron-horse",
    "num": 66,
    "name": "IRON HORSE",
    "color": "#A0522D",
    "desc": "This is my railroad. Classic rail films on 16mm: mainline steam, troop trains, commuter cars and the men who shunted them. The pavement ends where the rails begin. All aboard, endlessly."
  },
  {
    "id": "rerun-valley",
    "num": 67,
    "name": "RERUN VALLEY",
    "color": "#F0E68C",
    "desc": "Here's Lucy. The public-domain sitcom shelf, seasons deep: Jack Benny's checking account, George Burns, John Wayne stopping by, and Viv pulling a shower into the yard. Laugh track is standard equipment."
  },
  {
    "id": "soul-train",
    "num": 68,
    "name": "SOUL LANE",
    "color": "#AA00FF",
    "desc": "The hippest trip in America. American Bandstand and the soul line — Ray Parker Jr., Rakim, Deniece Williams, the Captain & Tennille — rate-a-record and somebody always dances in the aisle."
  },
  {
    "id": "seasoned-viewers",
    "num": 69,
    "name": "SEASONED VIEWERS",
    "color": "#BF360C",
    "desc": "Cooking TV before it had its own cable network: Two Fat Ladies on a Triumph motorcycle, Yan Can Cook's wok, the Frugal Gourmet's sermon on the mount of flour. The sauce has been reducing since 1985."
  },
  {
    "id": "this-old-dial",
    "num": 70,
    "name": "HOUSEWORKS",
    "color": "#AED581",
    "desc": "Two coats of primer, wait for the re-run. This Old House, Ask This Old House and the New Yankee Workshop: Bob Vila, Norm Abram, and a house that always needs one more thing. Norm's going to build a jig for that."
  },
  {
    "id": "yule-log",
    "num": 71,
    "name": "YULE LOG",
    "color": "#FF5252",
    "desc": "That's the whole show: a log, burning. Plus the occasional TV station that put its own fireplace on the air, and a TARDIS idling in the hearth. Happy holidays, or whenever."
  },
  {
    "id": "factory-floor",
    "num": 72,
    "name": "FACTORY FLOOR",
    "color": "#8b927b",
    "desc": "Everything you own was made somewhere. Factory tours, industrial films, assembly lines and manufacturing demonstrations."
  },
  {
    "id": "laboratory-b",
    "num": 73,
    "name": "LABORATORY B",
    "color": "#8e9e87",
    "desc": "The experiment was successful. The building was not. Science demonstrations, technical training and laboratory films."
  },
  {
    "id": "world-of-tomorrow",
    "num": 74,
    "name": "WORLD OF TOMORROW",
    "color": "#4fa3a5",
    "desc": "In the future, everyone has a flying car and a robot that does the dishes. Futurist TV and science magazine shows predicting a tomorrow that mostly never showed up."
  },
  {
    "id": "tv-dinner",
    "num": 75,
    "name": "TV DINNER",
    "color": "#c8873a",
    "desc": "Heat for 25 minutes and peel back the foil. Vintage cooking films, home economics class, supermarket tours and the kitchen of tomorrow, served on a tray."
  },
  {
    "id": "denpa",
    "num": 76,
    "name": "DENPA",
    "color": "#75918c",
    "desc": "Japanese local television, educational films, regional documentaries, experimental video, and forgotten broadcasts from the analog era."
  },
  {
    "id": "waiting-room",
    "num": 77,
    "name": "WAITING ROOM",
    "color": "#6fa38f",
    "desc": "The doctor will see you shortly. Vintage health films, hospital training reels and hygiene lessons, from back when every film ended with a man in a lab coat nodding."
  },
  {
    "id": "homeroom",
    "num": 95,
    "name": "STUDY HALL",
    "color": "#5B7C4F",
    "desc": "The guidance films they showed you on the classroom projector in 1955. How to be popular. How to go on a date. How to be a good citizen."
  },
  {
    "id": "mandatory-viewing",
    "num": 96,
    "name": "MANDATORY VIEWING",
    "color": "#78909C",
    "desc": "This video is required for all new associates. There will be a quiz."
  },
  {
    "id": "fallout-shelter",
    "num": 97,
    "name": "FALLOUT SHELTER",
    "color": "#FFD600",
    "desc": "The government's cheerful instructions for surviving the apocalypse, 24/7, 365 (or until the inevitable global thermo-nuclear war that destroys us all)."
  },
  {
    "id": "dusty-trails",
    "num": 100,
    "name": "DUSTY TRAILS",
    "color": "#542d2c",
    "desc": "This is where the pavement ends and the real work begins. We don't trade in noise or neon. Just dust, distance, and the kind of quiet that makes a man think twice about what he's saying."
  },
  {
    "id": "gumshoe",
    "num": 101,
    "name": "FEDORA NOIR",
    "color": "#E8DFC8",
    "desc": "Rain on the window, a client with a problem, and a detective who should have said no. Crime pictures, all night."
  },
  {
    "id": "it-came-from",
    "num": 200,
    "name": "IT CAME FROM",
    "color": "#7B2D8E",
    "desc": "It came from the drive-in. It came from the bottom of the lake. It came from a budget of $400. Horror flicks of a wide variety of quality levels. Scary."
  },
  {
    "id": "daily-dread",
    "num": 201,
    "name": "DAILY DREAD",
    "color": "#8B0000",
    "desc": "Pure horror. No sci-fi, no monsters from space — just the films that kept you up at night. Every night."
  },
  {
    "id": "graveyard-shift",
    "num": 202,
    "name": "GRAVEYARD SHIFT",
    "color": "#B6D52A",
    "desc": "A horror movie is better when someone in a wig is making fun of it. The late-night hosts, movie and wisecracks intact."
  },
  {
    "id": "ray-gun",
    "num": 203,
    "name": "JETPACK MATINEE",
    "color": "#E64A19",
    "desc": "Ray guns, rocket sparks, and a cliffhanger every reel. The black-and-white serials that swore we'd have jetpacks by now — Flash Gordon, Buck Rogers, and every square-jawed spaceman who saved the Earth by Chapter 12. To be continued... forever."
  },
  {
    "id": "signpost",
    "num": 204,
    "name": "SIGNPOST",
    "color": "#4527A0",
    "desc": "There's a signpost up ahead. Twenty-six minutes of the uncanny, a narrator who already knows how it ends, and a twist you'll spot a half-second too late. Twilight Zone, Outer Limits, One Step Beyond — the anthology hour where the dial goes strange and stays that way."
  },
  {
    "id": "waku-waku",
    "num": 300,
    "name": "GAMBARE TV",
    "color": "#C51162",
    "desc": "Japanese game shows: the obstacle courses, the quiz specials and the variety hours, in English or with our own subtitles."
  },
  {
    "id": "rubber-hose",
    "num": 400,
    "name": "RUBBER HOSE",
    "color": "#FF5FA2",
    "desc": "Noodle arms, pie-cut eyes and a piano that plays itself. Cartoons from before anyone told them about bones, seven minutes at a time."
  },
  {
    "id": "meddling-kids",
    "num": 401,
    "name": "UNMASKED",
    "color": "#A65EBF",
    "desc": "A talking dog, four teens and a man in a rubber mask who would've gotten away with it. The whole Hanna-Barbera shelf, all day and all night."
  },
  {
    "id": "suplex",
    "num": 500,
    "name": "SUPLEX",
    "color": "#7A5C00",
    "desc": "Wrestling the way it aired: whole shows, local promos, ads for hotlines and CDs, and a folding chair for every occasion."
  },
  {
    "id": "vacation-slides",
    "num": 600,
    "name": "VACATION SLIDES",
    "color": "#833f67",
    "desc": "Strangers' family vacation footage from the 1930s–70s. Silent 8mm film of places you've never been with people you'll never meet, set to period-accurate tunes. Vibe on, time traveler."
  },
  {
    "id": "window-seat",
    "num": 601,
    "name": "WINDOW SEAT",
    "color": "#4aa3ff",
    "desc": "Forehead on the glass, nowhere to be. Views from train windows, airplane seats and long drives, scenic travelogues and slow footage of places going by. The quiet, ambient companion to DEPARTURE GATE."
  },
  {
    "id": "departure-gate",
    "num": 602,
    "name": "DEPARTURE GATE",
    "color": "#8b91a9",
    "desc": "Now boarding a flight that departed in 1986. Vintage airline commercials, airport films, travel promotions, tourism documentaries and transportation films. A more commercial, broadcast-oriented companion to WINDOW SEAT."
  }
];
