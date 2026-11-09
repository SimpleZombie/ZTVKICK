/* ZTV fake commercials. Every so often one of these plays like a real ad break (the show keeps
   running underneath, muted). A mod can type !ad in chat to play one now.

   ADD an ad: copy one of the blocks below and change the words.
     name    the product
     slides  3 or 4 pages, each with a big line and a small line
     price   shows in the starburst
     phone   shows on the bottom bar (use 555-01xx numbers, they're made up on purpose)
     colors  two background colors for the cheap gradient
*/
var ADS=[
  {name:"SHAMBLE PRO 3000",colors:["#ff2fd6","#3a00ff"],
   slides:[["TIRED OF DRAGGING YOUR FEET?","so are we"],["INTRODUCING THE SHAMBLE PRO 3000","walking shoes for the recently deceased"],["NOW WITH EXTRA ANKLE","because you lost the first one"],["COMFORT FOR THE LONG WALK","forever"]],
   price:"$19.95",phone:"1-800-555-0134",tag:"plus shipping and handling"},
  {name:"GRAVE EXPECTATIONS REALTY",colors:["#00b3ff","#00ff9d"],
   slides:[["LOOKING FOR A PLACE TO SETTLE DOWN?","for good?"],["COZY 6 x 3 STARTER HOMES","quiet neighbors... very quiet"],["NO HOA. NO NOISE. NO LEAVING.","ask about our lifetime lease"],["MOVE IN TODAY","stay forever"]],
   price:"$0 DOWN",phone:"1-800-555-0177",tag:"ask for Mort"},
  {name:"DR. ROTSWORTH'S MIRACLE GLUE",colors:["#ffcc00","#ff3d00"],
   slides:[["ARM FELL OFF AGAIN?","it happens to the best of us"],["DR. ROTSWORTH'S MIRACLE GLUE","holds arms, ears and most fingers"],["SO STRONG IT'S PROBABLY ILLEGAL","do not use on face"],["STICK WITH IT","and it sticks with you"]],
   price:"$9.99",phone:"1-800-555-0112",tag:"not available in stores"},
  {name:"MOAN-TONE",colors:["#8a2be2","#00e1ff"],
   slides:[["IS YOUR GROAN JUST... OKAY?","you deserve better"],["MOAN-TONE VOCAL TRAINING ON VHS","groan like a pro in 30 days"],["4 TAPES + BONUS SHRIEK GUIDE","rewind before returning"],["BE THE LOUDEST IN THE HORDE","your neighbors will thank you"]],
   price:"$29.95",phone:"1-800-555-0166",tag:"3 easy payments"},
  {name:"NIGHT OWL MATTRESS",colors:["#1b1464","#00a86b"],
   slides:[["STILL AWAKE?","we noticed"],["THE NIGHT OWL MATTRESS","for people watching this at 3 AM"],["MEMORY FOAM THAT FORGETS","everything you said tonight"],["SLEEP IS FOR THE LIVING","but you should try it"]],
   price:"$0 TODAY",phone:"1-800-555-0199",tag:"operators are standing by"},
  {name:"BRAIN FLAKES",colors:["#ff6f00","#ffe600"],
   slides:[["PART OF THIS COMPLETE BREAKFAST","mostly"],["NEW BRAIN FLAKES CEREAL","now with 20% more brains"],["CRUNCHY ON THE OUTSIDE","we don't talk about the inside"],["THE CEREAL THAT STARES BACK","collect all 6 eyeballs"]],
   price:"NEW!",phone:"1-800-555-0101",tag:"at a graveyard near you"}
  ,{name:"BUD'S NIGHT WINDOW REPAIR",colors:["#b7e36a","#18231b"],
   slides:[["WINDOWS KEEPING YOU UP?","we can make them opaque"],["BUD'S NIGHT WINDOW REPAIR","open while you are asleep"],["WE FIX THE GLASS. YOU KEEP THE VIEW.","unless the view is the problem"],["CALL BUD. HE IS AWAKE.","he says he can hear the house breathing"]],
   price:"$39.00",phone:"1-800-555-0148",tag:"cash, check, or exact change"},
  {name:"LAST STOP VIDEO & BAIT",colors:["#8d79aa","#16131d"],
   slides:[["NEED A MOVIE AT 2:13 AM?","we have one copy"],["LAST STOP VIDEO & BAIT","rent a tape. buy a worm."],["OPEN 25 HOURS A DAY","closed when the sign says open"],["ASK FOR THE BACK SHELF","do not ask what is on it"]],
   price:"2 FOR $5",phone:"1-800-555-0182",tag:"late fees are negotiable"}
];

/* ZTV CLASSIFIEDS: the default ad break. Three listings on an old cable-access classifieds screen.
   ADD one: [heading, the details, phone]. Use 555-01xx numbers (made up on purpose). */
var CLASSIFIEDS=[
  ["FOR SALE: SHAMBLE PRO 3000 WALKING SHOES","Size 11. Walked in once. Very slowly. $15 or best offer.","555-0134"],
  ["WANTED: SOMEONE TO HOLD THE ANTENNA","Must have steady arms and nowhere to be. Pays in snacks.","555-0188"],
  ["LOST: VHS TAPE LABELED 'DO NOT TAPE OVER'","It has been taped over. Reward offered anyway.","555-0142"],
  ["FREE: ONE BOX OF CABLES","Nobody knows what they go to. Please take the whole box.","555-0171"],
  ["GRAVE EXPECTATIONS REALTY","Cozy 6 x 3 starter homes. Quiet neighbors. Ask for Mort.","555-0177"],
  ["BUD'S NIGHT WINDOW REPAIR","Open late. We don't ask how it happened.","555-0119"],
  ["LAST STOP VIDEO & BAIT","New releases Tuesday. Night crawlers every day. Please do not mix up the fridges.","555-0123"],
  ["FOR SALE: RECLINER","Shaped exactly like the last owner. Very comfortable if you are him.","555-0150"],
  ["BAND SEEKS DRUMMER","Must own drums, or at least a bucket. No questions about the band name.","555-0163"],
  ["GARAGE SALE SATURDAY","Lamps, a bread maker, 40 old TV guides. Early birds welcome. Very early birds, go home.","555-0108"],
  ["DR. ROTSWORTH'S MIRACLE GLUE","Holds arms, ears and most fingers. Not for use on the face.","555-0112"],
  ["TUTORING AVAILABLE","Learn to set the clock on your VCR. Three lessons. Results not guaranteed.","555-0157"],
  ["NIGHT OWL MATTRESS","For people still awake at 3 AM watching this. Nothing down today.","555-0199"],
  ["ROOM FOR RENT","Basement. Has a TV. The TV only gets this channel. Utilities included.","555-0191"],
  ["FOUND: DOG","Very good boy. Answers to everything. Please come get him before we keep him.","555-0130"],
  ["MOAN-TONE VOCAL LESSONS","Groan like a pro in 30 days. Group rates for hordes.","555-0166"],
  ["WANTED: QUIET NEIGHBOR","For the apartment above us. Current one tap dances. At night.","555-0145"],
  ["FOR SALE: ROWING MACHINE","Used twice. Mostly as a coat rack. Coats not included.","555-0127"]
];
