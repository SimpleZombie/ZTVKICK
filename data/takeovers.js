/* ZTV takeovers: every so often a full-screen interruption covers everything (the show keeps
   running underneath, muted) and then hands the screen back.

   Press T on the page to preview one, or a mod types !takeover in chat (works on the 24/7 server too).

   ADD a line:  add it to LINES below. Short and strange works best.
     {time} becomes the current time, like 3:14 am. {show} and {channel} are what's on right now.
   PULL a style: remove it from styles. Available styles:
     brackets  deadpan type on black / grain / forest
     ident     analog station identification
     tunnel    wireframe passage and a geometric figure
     poster    oversized network poster and animated face
     moon      night sky and a watchful pixel moon
     service   restrained network operations notice
     notice    printed viewer bulletin
     offair    muted test bars and transmission notice
*/
var TAKEOVER_SETTINGS={
  enabled:true,
  minMins:15,       // shortest wait between takeovers
  maxMins:35,       // longest wait (it picks a random time in between)
  secs:9,           // how long each one stays up
  drone:true,       // low hum underneath (follows the ZTV volume)
  styles:["brackets","ident","tunnel","poster","moon","service","notice","offair","explainer","missing","friend","explainer","friend"]   // listed twice = comes up more often
};

var LINES=[
  "the moon is looking at you",
  "zombies are coming. finish your snack",
  "nobody is coming to change the channel",
  "you have been watching for a while now",
  "it's {time}. the zombies don't sleep either",
  "do not adjust your set. your set is adjusting you",
  "we interrupt nothing to bring you this",
  "the static remembers you",
  "the trees have been counting",
  "stay on the couch. the couch is safe",
  "turn around. no, the other way",
  "this is not a commercial",
  "somebody in chat knows",
  "brains: 0. you: 1. for now",
  "watching is easier than leaving",
  "the forest is open late tonight",
  "your snacks have been noticed",
  "it is warmer inside the tv",
  "if you can hear the hum, it can hear you",
  "{show} will continue. so will you",
  "this channel has always been here",
  "blink twice if you're still awake",
  "the antenna picked up something",
  "you left the porch light on. they saw",
  "nothing is wrong. keep watching",
  "the woods called. we said you were busy",
  "it's {time} and you're still here. good",
  "somewhere a vcr is still blinking 12:00",
  "do not open the door after the static",
  "the moon would like a word",
  "the network has reviewed your request. no changes have been made",
  "this is a routine interruption. please do not make it unusual",
  "the next program is already in progress somewhere",
  "engineering has confirmed that the picture is supposed to do that",
  "your local station appreciates your continued presence",
  "there is no need to contact the station about this message",
  "the program guide is an approximation of events",
  "please disregard the previous instruction to disregard this instruction",
  "we are experiencing a normal amount of television",
  "the broadcast will continue until it becomes inconvenient",
  "you are receiving this message at the correct time"
];

/* the "ident" style picks one of each of these */
var IDENT_HEADS=["ZTV-DT · CHANNEL 00","ZTV · COMMUNITY TELEVISION","ZTV · FIRST TELEVISION IN THE WOODS","ZTV · WE'VE ALWAYS BEEN HERE"];
var IDENT_FOOTS=["SERVING THE FOREST · THE OLD MALL · AND THE GREATER COUCH AREA",
  "HOLLOW CREEK · PINE HOLLOW · ROUTE 9 · AND EVERYONE STILL AWAKE",
  "PLEASE STAND BY · REGULAR PROGRAMMING WILL RESUME",
  "STAY TUNED · STAY INSIDE"];

/* Late night lines (midnight to 5 AM Central, see lateNight in data/extras.js). Mixed in with LINES and picked more often. */
var LATE_LINES=[
  "you're up late",
  "everyone else is asleep. it's just us now.",
  "it's {time}. the trees are listening.",
  "the good shows come on after midnight",
  "we're still here. are you?",
  "turn the volume down. someone might hear.",
  "this part of the night doesn't have a name",
  "the channel gets thinner after midnight",
  "{show} looks different at {time}"
];

/* ---- ZTV EXPLAINS: a deadpan explainer that draws a little diagram one step at a time.
   steps: [icon, label under it, what the card says]. Icons: tower cloud house person tv box bigbox clock moon bubble wave */
var EXPLAINERS=[
  {title:"how ztv gets to your screen",steps:[
    ["tower","the tower","first, the show leaves the tower."],
    ["cloud","the air","it goes up into the air. nobody checks on it."],
    ["house","your house","it comes down near your house. usually."],
    ["person","you","and then there's you. the most important part. don't tell the tower."]],end:"that's how it works. more or less."},
  {title:"where reruns come from",steps:[
    ["tv","the show","a show airs one time."],
    ["box","a box","then it goes in a box."],
    ["bigbox","a bigger box","the box goes in a bigger box. for years."],
    ["person","us","then someone opens the box. that's us. hello."]]},
  {title:"how the schedule works",steps:[
    ["clock","a time","a show starts at a certain time."],
    ["tv","the show","it plays whether you're here or not."],
    ["moon","3 am","even at 3 am. especially at 3 am."],
    ["clock","the next time","then the next one starts. it has been like this for a while."]]},
  {title:"what happens when you change the channel",steps:[
    ["bubble","chat","you type a command in chat."],
    ["wave","static","a little static happens. that's normal."],
    ["tv","a new show","a different show is waiting for you."],
    ["tv","the old show","the old show keeps going without you. it's fine. it's used to it."]]},
  {title:"how to watch ztv",steps:[
    ["person","you","sit down somewhere comfortable."],
    ["tv","ztv","look at ztv."],
    ["clock","time","let some time pass."],
    ["moon","later","that's it. you did it. you're watching ztv."]],end:"we're proud of you."}
];

/* ---- ZTV LOST & FOUND: a "have you seen this" bulletin. Nothing in it is real or urgent.
   icon: one of the explainer icons, or leave it out for "no photo available" */
var LOST_FOUND=[
  {what:"THE REMOTE",icon:"remote",seen:"between the couch cushions, around 9:40 pm",desc:"black. 41 buttons. most of them have never been pressed.",answers:"nothing. it never has.",found:"do not approach. change the channel."},
  {what:"CHANNEL 1",seen:"never",desc:"should be somewhere between channel 0 and channel 2.",answers:"no one knows.",found:"please let us know. we have questions."},
  {what:"THE LAST 4 MINUTES OF A MOVIE",icon:"moon",seen:"right before the twist. you were asleep.",desc:"probably important.",found:"please don't tell us how it ends."},
  {what:"ONE (1) SOCK",seen:"the dryer, last sunday",desc:"the left one. or the right one.",answers:"its partner, who misses it very much.",found:"return it to the dryer. it will know what to do."},
  {what:"THE 2 AM SNACK",icon:"clock",seen:"the kitchen, 2:04 am",desc:"it was right there a minute ago.",answers:"crunching sounds.",found:"you have already eaten it."},
  {what:"THE TV GUIDE",icon:"tv",seen:"on top of the tv, 1987",desc:"thin. smells a little like a waiting room.",found:"keep it. you'll need it more than we do."},
  {what:"OUR WEATHER MAN'S UMBRELLA",icon:"cloud",seen:"the ztv parking lot, during the forecast",desc:"black. sort of. it's hard to tell in the rain.",found:"he says he doesn't need it. he does."}
];

/* ---- ZTV IS YOUR FRIEND: plain words on a flat color. One card per line.
   anyone:  for everybody. chatter: {name} is someone from today's chat. flips: {name} changed the channel the most this week, {n} times. */
var FRIEND_NOTES={
  anyone:[
    ["hi.","it's {time}.","you could be doing anything right now.","you're doing this.","we think that's okay."],
    ["if you're watching with someone,","tell them something nice.","if you're watching alone,","we've got you."],
    ["this is a reminder","that the tv can't see you.","probably."],
    ["drink some water.","stretch a little.","we'll wait.","...","okay. welcome back."],
    ["sometimes we wonder","who's out there watching.","then we remember.","it's you. hi."]],
  chatter:[
    ["hey {name}.","we saw you in chat earlier.","you seemed nice.","that's all. we just wanted to say it."],
    ["{name}, if you're still here,","thanks for hanging out.","the channel is better with you on it."],
    ["this one goes out to {name}.","we don't have a song.","just this."]],
  flips:[
    ["thank you, {name}.","you changed the channel {n} times this week.","most people don't commit like that.","we noticed."],
    ["{name} has changed the channel {n} times this week.","we're not saying it's too many.","we're just saying it's a lot."]]
};
