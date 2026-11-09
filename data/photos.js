/* ZTV PICTURE THIS: photo takeovers. A real public domain photo fills the screen while deadpan captions talk about it.
   Photos come live from Wikimedia Commons (the free media library behind Wikipedia). Only public domain / CC0 photos are used,
   so they're fine to show on stream, and every one is credited on screen.

   ADD one: copy a block. search = what to look for on Commons. lines = one caption card per line (lowercase reads best).
   Several caption sets per topic is fine: one is picked each time. */
var PHOTO_BUMPS=[
  {kicker:"ZTV ENERGY MINUTE",search:"nuclear power plant cooling towers",sets:[
    ["this is a nuclear power plant.","it makes electricity for thousands of homes.","and for this channel.","mostly for this channel."],
    ["ztv is powered by the sun, the wind, and this.","we don't fully understand this one.","but it has been very nice to us."]]},
  {kicker:"ZTV ENERGY MINUTE",search:"electrical transmission towers power lines",sets:[
    ["these are power lines.","they bring you electricity.","and that faint humming sound.","the humming is free."]]},
  {kicker:"ZTV ENERGY MINUTE",search:"wind turbines field",sets:[
    ["these are wind turbines.","they turn wind into electricity.","nobody asked the wind."]]},
  {kicker:"ZTV GETTING AROUND",search:"airship blimp flight",sets:[
    ["this is a blimp.","it is the slowest way to get anywhere.","we respect that.","take your time today."],
    ["blimps are filled with helium.","which is lighter than air.","and lighter than most of our programming."]]},
  {kicker:"ZTV GETTING AROUND",search:"great horned owl",sets:[
    ["this is an owl.","owls do not need transportation.","they have wings.","we just wanted to show you an owl."],
    ["owls stay up all night.","like you.","the owl has a reason."]]},
  {kicker:"ZTV GETTING AROUND",search:"steam locomotive train",sets:[
    ["this is a train.","it goes where the tracks go.","it has never once been surprised."]]},
  {kicker:"ZTV NATURE NOTE",search:"opossum",sets:[
    ["this is an opossum.","it is awake right now, too.","you have that in common."]]},
  {kicker:"ZTV NATURE NOTE",search:"lightning storm night",sets:[
    ["this is lightning.","it is several times hotter than the surface of the sun.","please stay inside and watch tv."]]},
  {kicker:"ZTV HISTORY",search:"ENIAC computer",sets:[
    ["this is a computer.","it filled a whole room.","it could not stream ztv.","we're not mad. it was the forties."]]},
  {kicker:"ZTV HISTORY",search:"Apollo astronaut moon surface",sets:[
    ["this is the moon.","people went there.","then they came home and watched tv.","like you're doing now."]]},
  {kicker:"ZTV LATE NIGHT FEATURE",search:"Night of the Living Dead 1968",sets:[
    ["this is from 1968.","nobody in this picture had a good night.","it's black and white.","it's still a little scary."],
    ["zombies have been on tv since before tv was in color.","we're carrying on a tradition.","respectfully."]]},
  {kicker:"ZTV LATE NIGHT FEATURE",search:"White Zombie 1932 film",sets:[
    ["this is from 1932.","zombies were a lot more formal back then.","they dressed for it."]]}
];
