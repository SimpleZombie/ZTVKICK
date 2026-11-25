/* ZTV station breaks: short pieces between shows. Picked at random, never the same one twice in a row or in the last few.
   Types: card (built-in graphic), video (local clip), image (still/GIF).
   Skins: network, bulletin, local, afterhours, technical. */
var BUMPER_SETTINGS={enabled:true,every:1,secs:6};
var BUMPERS=[
  /* video bumpers: pixel-art pieces in bumpers/ (weight = how often it comes up compared to a card) */
  {on:true,type:"video",src:"bumpers/night-drive.mp4",weight:1.5},
  {on:true,type:"video",src:"bumpers/signal.mp4",weight:1.5},
  {on:true,type:"video",src:"bumpers/right-back.mp4",weight:1.5},
  {on:true,type:"video",src:"bumpers/late-room.mp4",weight:1.5,late:true},   /* late:true = only between midnight and 5 AM */
  {on:true,type:"video",src:"bumpers/surf.mp4",weight:1.5},
  /* pre-roll set: film-print pieces, like what runs before the feature at a repertory theater */
  {on:true,type:"video",src:"bumpers/house-rules.mp4",weight:1.2},
  {on:true,type:"video",src:"bumpers/snack-bar.mp4",weight:1.2},
  {on:true,type:"video",src:"bumpers/leader.mp4",weight:1.2},
  {on:true,type:"video",src:"bumpers/back-to-program.mp4",weight:1.2},
  {on:true,type:"card",skin:"preroll",head:"COMING ATTRACTIONS",big:"{show}",foot:"NEXT ON CH {num} · {channel}"},
  /* cards */
  {on:true,type:"card",skin:"network",head:"ZTV NETWORK IDENTIFICATION",big:"YOU ARE WATCHING ZTV",foot:"INDEPENDENT TELEVISION · ALL NIGHT"},
  {on:true,type:"card",skin:"network",head:"ZTV",big:"NOW IN COLOR",foot:"MOST OF THE TIME"},
  {on:true,type:"card",skin:"afterhours",head:"UP NEXT",big:"{show}",foot:"IF EVERYTHING GOES ACCORDING TO PLAN"},
  {on:true,type:"card",skin:"local",head:"A MESSAGE FROM YOUR LOCAL STATION",big:"PLEASE ENJOY THE REMAINDER OF YOUR EVENING",foot:"ZTV · SERVING THE GREATER COUCH AREA"},
  {on:true,type:"card",skin:"local",head:"PAID FOR BY THE ZTV VIEWER SERVICES DEPARTMENT",big:"THANK YOU FOR REMAINING INDOORS",foot:"PLEASE KEEP YOUR RECEIPT"},
  {on:true,type:"card",skin:"local",head:"COMMUNITY REMINDER",big:"IT IS OKAY TO GO TO BED",foot:"WE WILL STILL BE HERE"},
  {on:true,type:"card",skin:"technical",head:"ZTV ENGINEERING",big:"SIGNAL WITHIN ACCEPTABLE PARAMETERS",foot:"NO ACTION IS REQUIRED"},
  {on:true,type:"card",skin:"technical",head:"ZTV ENGINEERING",big:"THE PICTURE IS SUPPOSED TO LOOK LIKE THAT",foot:"PLEASE DO NOT ADJUST YOUR SET"},
  {on:true,type:"card",skin:"bulletin",head:"VIEWER ADVISORY",big:"THE FOLLOWING PROGRAM IS A RERUN",foot:"SO WAS THE LAST ONE"},
  {on:true,type:"card",skin:"bulletin",head:"VIEWER INFORMATION",big:"THE SCHEDULE IS A GUIDELINE",foot:"ACTUAL PROGRAMMING MAY VARY"},
  {on:true,type:"card",skin:"afterhours",head:"LATE NIGHT PROGRAMMING",big:"YOU DID NOT MISS THE BEGINNING",foot:"YOU MAY HAVE MISSED SOMETHING ELSE",late:true}
  // Add your own: {on:true,type:"video",src:"bumpers/your-clip.mp4"}  or  {on:true,type:"image",skin:"afterhours",src:"bumpers/promo.png",secs:8}
];
