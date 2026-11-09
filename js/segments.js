/* ZTV segments: full-screen pieces that cover the picture for a bit (the show keeps running underneath, muted).
   Chat text bumps, the 3 AM dead air, fake ads, the ZOMBIE ALERT, the sign-off / sign-on, the recap card,
   raid splashes and the late night look. Settings: data/extras.js. Ads: data/ads.js. */
var SEG={on:false,q:[],t:0,adT:0,alT:0,idT:0,ahT:0,late:false,done:{}};
function xcfg(k){return(typeof EXTRAS!=="undefined"&&EXTRAS[k])||{}}
/* Central time no matter what time zone the server is set to */
function ctNow(t){var s=new Date(t||Date.now()).toLocaleString("en-US",{timeZone:"America/Chicago",hour12:false,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}),
  m=s.match(/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/);if(!m)return{h:0,m:0,s:0,date:""};return{h:+m[4]%24,m:+m[5],s:+m[6],date:m[3]+"-"+m[1]+"-"+m[2]}}
function segBusy(){return TK.on||bump.on||(typeof VOTE!=="undefined"&&VOTE.on)||(typeof WX!=="undefined"&&WX.on)}

/* ---- the runner: a list of scenes, each {html, ms, fx}. Waits its turn if something else is on screen. ---- */
function segRun(o){
  if(segBusy()){if(o.first)SEG.q.unshift(o);else if(SEG.q.length<12)SEG.q.push(o);segWait();return}
  var el=$("tko"),bv=$("bumpv"),stop=null;TK.on=SEG.on=true;TK.saved={v:v.muted};v.muted=true;if(bv)bv.muted=true;hideBanner();
  el.innerHTML="";el.hidden=false;
  var scenes=typeof o.scenes==="function"?o.scenes():o.scenes,total=scenes.reduce(function(a,s){return a+s.ms},0);
  function start(){
    if(o.sound&&!AUD.muted){try{stop=o.sound(total/1000)}catch(e){}}
    var t=0;scenes.forEach(function(s){setTimeout(function(){el.innerHTML=s.html;if(s.fx)s.fx(el)},t);t+=s.ms});
    setTimeout(finish,t)}
  function finish(){
    if(stop)try{stop()}catch(e){}
    var end=function(){el.hidden=true;el.innerHTML="";TK.on=SEG.on=false;v.muted=(AUD.muted||muteHint);if(bv)bv.muted=AUD.muted;
      if(typeof followNext==="function"&&FOL.q.length&&!FOL.busy)followNext();if(o.done)o.done();segWait()};
    if(o.cutOut)end();else tkStatic(el,300,end)}
  if(o.cutIn)start();else tkStatic(el,350,start)}
function segWait(){clearTimeout(SEG.t);if(!SEG.q.length)return;SEG.t=setTimeout(function(){if(segBusy()){segWait();return}var o=SEG.q.shift();if(o)segRun(o)},2500)}

/* ---- sound ---- */
function segAC(){AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();return AC}
function segOut(g){var ac=segAC(),o=ac.createGain();o.gain.value=g*Math.min(1,AUD.vol/.8);o.connect(ac.destination);return o}
function segTone(f,secs,g,type){var ac=segAC(),o=segOut(g||.05),x=ac.createOscillator();x.type=type||"sine";x.frequency.value=f;x.connect(o);x.start();x.stop(ac.currentTime+secs);
  return function(){try{o.gain.setValueAtTime(0,ac.currentTime);x.stop()}catch(e){}}}
/* notes: [[midi or 0 for rest, beats], ...]. loops until stopped */
function segTune(notes,bpm,type,g,bass){
  var ac=segAC(),out=segOut(g||.05),beat=60/bpm,len=notes.reduce(function(a,n){return a+n[1]},0)*beat,next=ac.currentTime+.05,iv;
  function hz(m){return 440*Math.pow(2,(m-69)/12)}
  function note(m,t,d,ty,gg){if(!m)return;var o=ac.createOscillator(),e=ac.createGain();o.type=ty;o.frequency.value=hz(m);o.connect(e);e.connect(out);
    e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(gg,t+.02);e.gain.setValueAtTime(gg,t+d*.7);e.gain.linearRampToValueAtTime(0,t+d*.95);o.start(t);o.stop(t+d)}
  function sched(){while(next<ac.currentTime+1){var t=next;notes.forEach(function(n){note(n[0],t,n[1]*beat,type||"square",.5);if(bass&&n[0])note(n[0]-24,t,n[1]*beat,"triangle",.6);t+=n[1]*beat});next+=len}}
  sched();iv=setInterval(sched,250);
  return function(){clearInterval(iv);try{out.gain.setValueAtTime(out.gain.value,ac.currentTime);out.gain.linearRampToValueAtTime(0,ac.currentTime+.4)}catch(e){}}}
/* slow organ chords for the sign-off (an original tune, nothing borrowed) */
function segOrgan(){
  var ac=segAC(),out=segOut(.05),ch=[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59],[48,55,60,64],[41,48,57,60],[43,50,55,62],[48,52,55,60]],i=0,live=true,osc=[];
  function play(){if(!live)return;var t=ac.currentTime,c=ch[i++%ch.length];
    c.forEach(function(m){[1,2].forEach(function(mul,k){var o=ac.createOscillator(),e=ac.createGain();o.type=k?"sine":"triangle";o.frequency.value=440*Math.pow(2,(m-69)/12)*mul;
      o.connect(e);e.connect(out);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(k?.08:.22,t+.5);e.gain.setValueAtTime(k?.08:.22,t+2.3);e.gain.linearRampToValueAtTime(0,t+2.9);o.start(t);o.stop(t+3);osc.push(o)})});
    setTimeout(play,2800)}
  play();return function(){live=false;try{out.gain.linearRampToValueAtTime(0,ac.currentTime+.8)}catch(e){}}}

/* ---- pieces used by several segments ---- */
function segBars(label){
  var top=["#c0c0c0","#c0c000","#00c0c0","#00c000","#c000c0","#c00000","#0000c0"],mid=["#0000c0","#131313","#c000c0","#131313","#00c0c0","#131313","#c0c0c0"];
  return'<div class="sg sg-bars"><div class="sgb-top">'+top.map(function(c){return'<i style="background:'+c+'"></i>'}).join("")+'</div>'+
    '<div class="sgb-mid">'+mid.map(function(c){return'<i style="background:'+c+'"></i>'}).join("")+'</div>'+
    '<div class="sgb-bot"><i style="background:#00214c"></i><i style="background:#fff"></i><i style="background:#32006a"></i><i style="background:#131313;flex:3"></i><i style="background:#090909"></i><i style="background:#1d1d1d"></i><i style="background:#131313"></i></div>'+
    (label?'<div class="sgb-id">'+label+'</div>':'')+'</div>'}
function segMark(){return document.querySelector(".mark").outerHTML}
function segTimeCT(){var c=ctNow(),h=c.h%12||12;return h+":"+String(c.m).padStart(2,"0")+(c.h<12?" AM":" PM")}

/* ---- 1. chat text bumps: white words on black, like the old late night bumps ---- */
function textBump(b){
  var words=String(b.text),ms=Math.min(9000,3200+words.length*45);
  segRun({cutIn:true,sound:function(s){tkDrone(s);return null},
    scenes:[{html:'<div class="sg sg-tb"><p>'+esc(words)+'</p></div>',ms:ms},
            {html:'<div class="sg sg-tb"><p class="by">[sent in by '+esc(b.user)+']</p></div>',ms:2600},
            {html:'<div class="sg sg-tb"><p class="mk">[ztv]</p></div>',ms:1600}],
    done:function(){dayAdd("bumps")}})}

/* ---- 2. late night: darker look and stranger takeovers between the hours in lateNight ---- */
function nightLate(){var L=xcfg("lateNight");if(L.on===false)return false;var h=ctNow().h,a=L.from||0,b=L.to==null?5:L.to;return a<=b?h>=a&&h<b:h>=a||h<b}
function lateApply(){var on=nightLate();if(on===SEG.late)return;SEG.late=on;document.body.classList.toggle("late",on);
  var tb=document.querySelector(".tag b");if(tb)tb.textContent=on?"Late Night on Kick":"24/7 on Kick";
  if(on&&typeof cur!=="undefined"&&cur)osdMsg("LATE NIGHT ON ZTV",3500)}

/* ---- 3. dead air: color bars, a test tone, a strange slide, then it cuts right back ---- */
var DEADAIR_LINES=[
  ["THE BROADCAST DAY HAS NOT ENDED","it only feels that way"],
  ["DO NOT ADJUST YOUR SET","we are adjusting it for you"],
  ["PLEASE REMAIN SEATED","the program will resume when you are ready"],
  ["THIS CHANNEL IS STILL ON","so are you"],
  ["WE HAVE LOST CONTACT WITH THE STUDIO","the studio is fine. we checked."],
  ["IT IS {time}","you should be asleep. we won't tell."],
  ["THANK YOU FOR YOUR PATIENCE","we have been very patient too"]];
function deadAir(){
  var L=DEADAIR_LINES[Math.random()*DEADAIR_LINES.length|0],h=L[0].replace("{time}",segTimeCT());
  var stop=[];
  segRun({cutIn:true,cutOut:true,sound:function(){return function(){stop.forEach(function(f){try{f()}catch(e){}})}},
    scenes:[{html:segBars("ZTV &middot; CH 00 &middot; "+segTimeCT()),ms:9000,fx:function(){if(!AUD.muted)stop.push(segTone(1000,9,.04))}},
            {html:'<div class="sg sg-da"><div class="sgd-h">'+esc(h)+'</div><div class="sgd-s">'+esc(L[1])+'</div><div class="sgd-c">ZTV ENGINEERING</div></div>',ms:7500,fx:function(){if(!AUD.muted)stop.push(segTone(55,7.5,.05,"triangle"))}},
            {html:segBars(""),ms:700,fx:function(){if(!AUD.muted)stop.push(segTone(1000,.7,.04))}}]})}

/* Original ZTV station mascots: Midge the moth and Channel Zero, the overworked CRT. */
function segMascot(which){
  if(which===1)return '<div class="sg-mascot crt-mascot"><svg viewBox="0 0 120 120"><rect x="18" y="20" width="84" height="72" rx="12" fill="#b7e36a" stroke="#171719" stroke-width="6"/><rect x="27" y="29" width="66" height="52" rx="6" fill="#151719"/><path d="M43 54Q49 43 56 54T69 54T82 54" fill="none" stroke="#b7e36a" stroke-width="5"/><path d="M60 92V104M44 105H76" stroke="#b7e36a" stroke-width="6" stroke-linecap="round"/><circle cx="38" cy="17" r="5" fill="#b7e36a"/><circle cx="82" cy="17" r="5" fill="#b7e36a"/></svg><small>CHANNEL ZERO</small></div>';
  return '<div class="sg-mascot moth-mascot"><svg viewBox="0 0 120 120"><path d="M48 52Q5 6 13 48Q20 75 51 68M72 52Q115 6 107 48Q100 75 69 68" fill="#b7e36a" stroke="#151719" stroke-width="5"/><path d="M60 40Q37 48 42 82Q60 110 78 82Q83 48 60 40Z" fill="#d6d2c2" stroke="#151719" stroke-width="5"/><circle cx="52" cy="66" r="5" fill="#151719"/><circle cx="68" cy="66" r="5" fill="#151719"/><path d="M54 82Q60 87 66 82" fill="none" stroke="#151719" stroke-width="3"/><path d="M55 41L48 25M65 41L72 25" stroke="#b7e36a" stroke-width="4" stroke-linecap="round"/></svg><small>MIDGE / NIGHT SHIFT</small></div>';
}

/* ---- 3b. station ident: short, dry network messages between programs ---- */
var STATION_IDS=[
  ["YOU ARE WATCHING ZTV","INDEPENDENT TELEVISION FOR INDEPENDENT VIEWERS","PLEASE CONTINUE AS NORMAL"],
  ["ZTV BROADCAST SERVICES","YOUR TELEVISION IS WORKING WITHIN SPECIFICATION","THANK YOU FOR YOUR COOPERATION"],
  ["THIS IS ZTV","WE HAVE BEEN HERE THE WHOLE TIME","CHANNEL 00 · ALL SYSTEMS NOMINAL"],
  ["A MESSAGE FROM MANAGEMENT","THE NETWORK IS NOT RESPONSIBLE FOR WHAT YOU FIND","PLEASE ENJOY THE REMAINDER OF YOUR EVENING"],
  ["ZOMBIE TELEVISION","PROGRAMMING MAY VARY FROM THE SCHEDULE","THE SCHEDULE MAY VARY FROM REALITY"],
  ["YOU HAVE REACHED THE ZTV NETWORK","NO FURTHER ACTION IS REQUIRED","THANK YOU FOR WATCHING"]
];
function stationId(){
  var a=STATION_IDS[Math.random()*STATION_IDS.length|0],c=typeof cur!="undefined"&&cur?cur.c:null;
  var n=c?"CH "+pad(c.num)+" · "+c.name:"ZTV NETWORK · CHANNEL 00",mascot=segMascot(Math.random()<.5?0:1);
  segRun({scenes:[{ms:4500,html:'<div class="sg sg-idcard ident-short"><div class="sid-over">ZTV / NETWORK IDENTIFICATION</div><div class="sid-brand">'+segMark()+'</div><div class="sid-main">'+esc(a[0])+'</div><div class="sid-rule"></div><div class="sid-sub">'+esc(a[1])+'</div>'+mascot+'<div class="sid-foot">'+esc(n)+'</div><div class="sid-stamp">ZTV</div></div>'}],done:function(){dayAdd("idents")}})
}
function stationIdSchedule(){
  var A=xcfg("stationIds");clearTimeout(SEG.idT);if(A.on===false)return;
  var a=(A.minMins||24)*60000,b=Math.max(a,(A.maxMins||42)*60000);
  SEG.idT=setTimeout(function(){stationId();stationIdSchedule()},a+Math.random()*(b-a));
}

/* ---- 3c. 12-second after-hours bump sequence: three short, original station fragments. ---- */
var AFTERHOURS_BUMPS=[
  ["THE NIGHT SHIFT IS AWARE OF YOU","NO FURTHER INFORMATION IS AVAILABLE","PLEASE REMAIN COMFORTABLE"],
  ["THIS IS A TEST OF THE TELEVISION","THE TELEVISION HAS PASSED","YOU MAY NOW RETURN TO WATCHING"],
  ["ZTV WOULD LIKE TO THANK","THE CONCEPT OF TIME","FOR ITS CONTINUED COOPERATION"],
  ["LOCAL PROGRAMMING WILL RESUME","AFTER THIS MOMENT OF REFLECTION","THANK YOU FOR WAITING"]
];
function afterHoursBump(){
  var a=AFTERHOURS_BUMPS[Math.random()*AFTERHOURS_BUMPS.length|0],m=segMascot(Math.random()<.5?0:1);
  segRun({scenes:[
    {ms:4200,html:'<div class="sg sg-ahb ahb-one"><small>ZTV AFTER HOURS / 00</small><b>'+esc(a[0])+'</b>'+m+'<i>INDEPENDENT TELEVISION</i></div>'},
    {ms:4100,html:'<div class="sg sg-ahb ahb-two"><div class="ahb-grid"></div><small>ENGINEERING NOTICE</small><b>'+esc(a[1])+'</b><span>PLEASE STAND BY</span></div>'},
    {ms:3900,html:'<div class="sg sg-ahb ahb-three"><small>YOU ARE WATCHING</small><b>ZTV</b><span>'+esc(a[2])+'</span><i>CHANNEL 00 · ALL NIGHT</i></div>'}
  ],done:function(){dayAdd("afterhours")}})
}
function afterHoursSchedule(){var A=xcfg("afterHours");clearTimeout(SEG.ahT);if(A.on===false)return;var lo=(A.minMins||68)*60000,hi=Math.max(lo,(A.maxMins||105)*60000);SEG.ahT=setTimeout(function(){afterHoursBump();afterHoursSchedule()},lo+Math.random()*(hi-lo))}

/* ---- 4. fake ads ---- */
/* ad break. Default is ZTV Classifieds (quiet). ads.style:"commercials" brings back the fake commercials, "mix" alternates. */
function adBreak(){var A=xcfg("ads"),st=A.style||"classifieds";if(st==="commercials"||(st==="mix"&&Math.random()<.4))fakeAd();else classifieds()}
/* soft, slow chords: elevator music for the classifieds, a gentle bed for the text takeovers */
function segPad(gain){
  var ac=segAC(),out=segOut(gain||.02),ch=[[60,64,67,71],[57,60,64,67],[62,65,69,72],[55,59,62,65]],i=0,live=true;
  function play(){if(!live)return;var t=ac.currentTime,c=ch[i++%ch.length];
    c.forEach(function(m,k){var o=ac.createOscillator(),e=ac.createGain();o.type=k?"sine":"triangle";o.frequency.value=440*Math.pow(2,(m-69)/12);
      o.connect(e);e.connect(out);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.18,t+1.2);e.gain.setValueAtTime(.18,t+3);e.gain.linearRampToValueAtTime(0,t+4.2);o.start(t);o.stop(t+4.3)});
    setTimeout(play,3600)}
  play();return function(){live=false;try{out.gain.setValueAtTime(out.gain.value,ac.currentTime);out.gain.linearRampToValueAtTime(0,ac.currentTime+1)}catch(e){}}}
function classifieds(){
  if(typeof CLASSIFIEDS==="undefined"||!CLASSIFIEDS.length)return;
  var A=xcfg("ads"),pool=CLASSIFIEDS.slice(),picks=[];SEG.clRecent=SEG.clRecent||[];
  var fresh=pool.filter(function(c){return SEG.clRecent.indexOf(c[0])<0});if(fresh.length>=3)pool=fresh;
  while(picks.length<3&&pool.length)picks.push(pool.splice(Math.random()*pool.length|0,1)[0]);
  picks.forEach(function(p){SEG.clRecent.push(p[0])});SEG.clRecent=SEG.clRecent.slice(-9);
  var scene=function(p,k){return{ms:7000,html:'<div class="sg sg-cl"><div class="sgc-top"><b>ZTV CLASSIFIEDS</b><span>LISTING '+(k+1)+' OF '+picks.length+'</span></div>'+
    '<div class="sgc-h">'+esc(p[0])+'</div><div class="sgc-b">'+esc(p[1])+'</div><div class="sgc-ph">CALL '+esc(p[2])+'</div>'+
    '<div class="sgc-bot">TO PLACE A LISTING, CALL 555-0100 &middot; LISTINGS ARE MADE UP</div></div>'}};
  segRun({sound:function(){return A.music==="off"?null:segPad(.016)},scenes:picks.map(scene)})}
function fakeAd(i){
  if(typeof ADS==="undefined"||!ADS.length)return;var a=ADS[i!=null?i%ADS.length:Math.random()*ADS.length|0],per=4600;
  var scene=function(s,k){return{ms:per,html:'<div class="sg sg-ad" style="--a:'+a.colors[0]+';--b:'+a.colors[1]+'"><div class="sga-lines"></div>'+
      '<div class="sga-name">'+esc(a.name)+'</div><div class="sga-big">'+esc(s[0])+'</div><div class="sga-small">'+esc(s[1])+'</div>'+(k===0?segMascot(Math.random()<.5?0:1):'')+
      (k>=a.slides.length-2?'<div class="sga-star"><b>'+esc(a.price)+'</b><small>'+esc(a.tag||"")+'</small></div>':'')+
      '<div class="sga-bar"><span>CALL NOW</span><b>'+esc(a.phone)+'</b><span class="blink">OPERATORS ARE STANDING BY</span></div><div class="sga-fine">THIS IS A FAKE COMMERCIAL. PLEASE DO NOT CALL.</div></div>'}};
  var jingles=[[[72,.5],[76,.5],[79,.5],[84,1],[79,.5],[81,.5],[79,1],[76,.5],[72,.5],[74,1],[0,1]],[[67,.5],[72,.5],[74,.5],[76,1],[74,.5],[72,.5],[69,1],[67,1],[72,1.5],[0,.5]]];
  segRun({sound:function(){return xcfg("ads").music==="off"?null:segTune(jingles[Math.random()*2|0],112,"triangle",.016,false)},scenes:a.slides.map(scene)})}
function adSchedule(){var A=xcfg("ads");clearTimeout(SEG.adT);if(A.on===false)return;var a=(A.minMins||35)*60000,b=Math.max(a,(A.maxMins||60)*60000);
  SEG.adT=setTimeout(function(){adBreak();adSchedule()},a+Math.random()*(b-a))}

/* ---- 5. ZOMBIE ALERT parody. Its own made-up beeps, not the real alert tones, and it says it's a parody. ---- */
var ALERT_TEXT=[
  "THE NATIONAL UNDEAD SERVICE HAS ISSUED A SHAMBLE WARNING FOR THE FOLLOWING AREAS: CHAT. RESIDENTS ARE ADVISED TO STAY HYDRATED, STRETCH, AND KEEP AT LEAST ONE SNACK WITHIN ARM'S REACH.",
  "A MOAN ADVISORY IS IN EFFECT UNTIL FURTHER NOTICE. IF YOU HEAR GROANING, IT IS PROBABLY JUST SOMEONE IN CHAT. NO ACTION IS REQUIRED.",
  "ZTV METEOROLOGISTS ARE TRACKING A SLOW-MOVING HORDE. TOP SPEED: ABOUT TWO MILES PER HOUR. YOU HAVE TIME TO FINISH THIS SHOW.",
  "A BRAIN FREEZE WATCH HAS BEEN ISSUED FOR ANYONE DRINKING A SLUSHIE TOO FAST. SIP RESPONSIBLY.",
  "OFFICIALS REPORT THAT THE CHANNEL HAS BEEN CHANGED SEVERAL TIMES IN THE LAST HOUR. THIS IS NORMAL. PLEASE CONTINUE TO SURF.",
  "THE ZTV ZOMBIE ALERT SYSTEM REMINDS YOU THAT IT HAS BEEN A WHILE SINCE YOU LOOKED AWAY FROM THE SCREEN. BLINK TWICE. GOOD."];
function zombieAlert(){
  var t=ALERT_TEXT[Math.random()*ALERT_TEXT.length|0],stop=[];
  segRun({sound:function(){return function(){stop.forEach(function(f){try{f()}catch(e){}})}},
    scenes:[{ms:4500,html:'<div class="sg sg-al"><div class="sgl-top">ZTV ZOMBIE ALERT SYSTEM</div><div class="sgl-mid"><b>THIS IS A TEST</b><span>OF THE ZTV ZOMBIE ALERT SYSTEM</span></div><div class="sgl-par">PARODY &middot; NOT A REAL ALERT</div></div>',
      fx:function(){if(AUD.muted)return;[0,.45,.9].forEach(function(d){setTimeout(function(){stop.push(segTone(620,.3,.05,"square"))},d*1000)})}},
     {ms:Math.max(14000,t.length*95),html:'<div class="sg sg-al"><div class="sgl-top">ZTV ZOMBIE ALERT SYSTEM</div><div class="sgl-mid"><b>SHAMBLE ADVISORY</b><span>ISSUED '+segTimeCT()+' CENTRAL</span></div>'+
      '<div class="sgl-crawl"><span style="animation-duration:'+Math.max(14,t.length*.095)+'s">'+esc(t)+' ... THIS HAS BEEN A TEST. IF THIS HAD BEEN AN ACTUAL ZOMBIE EMERGENCY, YOU WOULD HAVE HEARD MORE GROANING.</span></div><div class="sgl-par">PARODY &middot; NOT A REAL ALERT</div></div>'}]})}
function alertSchedule(){var A=xcfg("alert");clearTimeout(SEG.alT);if(A.on===false)return;var a=(A.minHours||4)*3600000,b=Math.max(a,(A.maxHours||8)*3600000);
  SEG.alT=setTimeout(function(){zombieAlert();alertSchedule()},a+Math.random()*(b-a))}

/* ---- 6. recap card ---- */
function recapHtml(){var d=dayLoad(),ch=Object.keys(d.ch).sort(function(a,b){return d.ch[b]-d.ch[a]})[0],
    who=Object.keys(d.chat).sort(function(a,b){return d.chat[b]-d.chat[a]})[0],rich=typeof zbTop==="function"?zbTop(1)[0]:null,
    hrs=function(s){var m=Math.round(s/60);return m<60?m+" MIN":(m/60).toFixed(1)+" HRS"},
    row=function(k,v){return'<li><span>'+k+'</span><i></i><b>'+v+'</b></li>'};
  return'<div class="sg sg-rc"><div class="sgr-h">TODAY ON ZTV</div><div class="sgr-d">BROADCAST DAY '+esc(d.day)+'</div><ol>'+
    row("MOST WATCHED",ch?esc(ch.toUpperCase())+" &middot; "+hrs(d.ch[ch]):"STILL WARMING UP")+
    row("TOP CHATTER",who?esc(who.toUpperCase())+" &middot; "+d.chat[who]+" MSGS":"NOBODY YET")+
    row("CHANNEL FLIPS FROM CHAT",d.flips||0)+row("REQUESTS PLAYED",d.reqs||0)+row("CHAT BUMPS AIRED",d.bumps||0)+row("NEW FOLLOWERS",d.follows||0)+
    (rich?row("RICHEST ZOMBIE",esc(rich[0].toUpperCase())+" &middot; "+rich[1]+" "+zbName()):"")+
    '</ol><div class="tk-mark">[ztv]</div></div>'}
function recapShow(){segRun({sound:function(s){tkDrone(s);return null},scenes:function(){return[{html:recapHtml(),ms:12000}]}})}

/* ---- 7. sign-off at 3:58 AM and sign-on after the 4 AM restart ---- */
function signOffHtml(){
  var tr="",i;for(i=0;i<34;i++){var x=i*3.1,h=8+Math.random()*16;tr+='<path d="M'+x+' 60 L'+(x+1.6)+' '+(60-h)+' L'+(x+3.2)+' 60Z"/>'}
  return'<div class="sg sg-so"><svg class="sgs-sky" viewBox="0 0 100 60" preserveAspectRatio="xMidYMax slice"><circle cx="78" cy="14" r="6" fill="#d9ffc4"/><g fill="#020604">'+tr+'</g></svg>'+
    '<div class="sgs-flag">'+segMark()+'</div><div class="sgs-t">THANK YOU FOR WATCHING<small>ZTV RETURNS AT 4:00 AM CENTRAL</small></div></div>'}
function signOff(){
  var stop=[],toHour=3600000-(Date.now()%3600000)+15000;
  segRun({first:true,sound:function(){return function(){stop.forEach(function(f){try{f()}catch(e){}})}},
    scenes:[{ms:8000,html:'<div class="sg sg-id"><div class="sgi-logo">'+segMark()+'</div><div class="sgi-h">ZOMBIE TELEVISION</div><div class="sgi-s">THIS CONCLUDES OUR BROADCAST DAY</div></div>'},
      {ms:18000,html:signOffHtml(),fx:function(){if(!AUD.muted)stop.push(segOrgan())}},
      {ms:12000,html:recapHtml(),fx:function(){}},
      {ms:9000,html:'<div class="sg sg-id"><div class="sgi-s" style="font-size:3.4vh;line-height:1.5">ZTV BROADCASTS 24 HOURS A DAY ON KICK.COM/SIMPLEZOMBIE<br>PROGRAMMING COURTESY OF THE INTERNET ARCHIVE<br>TRANSMITTER: ONE VERY TIRED COMPUTER IN THE MIDDLE OF THE COUNTRY<br><br>GOODNIGHT.</div></div>'},
      {ms:Math.max(12000,Math.min(150000,toHour-47000)),html:segBars("ZTV &middot; OFF THE AIR"),fx:function(){if(!AUD.muted)stop.push(segTone(1000,150,.035))}}]})}
function signOn(greet){
  var stop=[];greet=greet||"GOOD MORNING";
  segRun({first:true,cutIn:true,sound:function(){return function(){stop.forEach(function(f){try{f()}catch(e){}})}},
    scenes:[{ms:4500,html:segBars("ZTV &middot; SIGN ON"),fx:function(){if(!AUD.muted)stop.push(segTone(1000,4.5,.035))}},
      {ms:7000,html:'<div class="sg sg-id"><div class="sgi-logo">'+segMark()+'</div><div class="sgi-h">'+greet+'</div><div class="sgi-s">ZTV IS NOW ON THE AIR</div></div>',fx:function(){if(!AUD.muted)stop.push(segOrgan())}},
      {ms:3000,html:'<div class="sg sg-tb"><p>[programming begins now]</p></div>'}]})}

/* restarts (data/extras.js restarts.times, Central). 4 AM has the full sign-off; the others get a short stand-by card
   right before, and a quick "we're back" after. The server's restart timer uses the same times (server/setup.sh). */
function restartTimes(){var R=xcfg("restarts");return(R.times||["04:00","12:00","20:00"]).map(function(t){var p=String(t).split(":");return{h:+p[0]%24,m:+(p[1]||0)}})}
function standBy(){
  var stop=[],left=Math.max(20000,Math.min(120000,3600000-(Date.now()%3600000)+15000));
  segRun({first:true,sound:function(){return function(){stop.forEach(function(f){try{f()}catch(e){}})}},
    scenes:[{ms:6000,html:'<div class="sg sg-id"><div class="sgi-logo">'+segMark()+'</div><div class="sgi-h">PLEASE STAND BY</div><div class="sgi-s">ZTV WILL RETURN IN A MOMENT</div></div>'},
      {ms:left,html:segBars("ZTV &middot; STAND BY"),fx:function(){if(!AUD.muted)stop.push(segTone(1000,120,.03))}}]})}
function greeting(){var h=ctNow().h;return h<12?"GOOD MORNING":h<17?"GOOD AFTERNOON":"GOOD EVENING"}

/* ---- 8. raid splash ---- */
function raidAlert(name,n){
  name=String(name||"SOMEONE").replace(/^@/,"").slice(0,24);n=+n||0;
  segRun({first:true,sound:function(){var ac=segAC(),o=segOut(.06),x=ac.createOscillator();x.type="sawtooth";x.frequency.setValueAtTime(120,ac.currentTime);x.frequency.exponentialRampToValueAtTime(1400,ac.currentTime+1.6);
      x.connect(o);x.start();x.stop(ac.currentTime+1.7);tkDrone(8);return null},
    scenes:[{ms:8500,html:'<div class="sg sg-rd"><div class="sgx-sig"><i></i><i></i><i></i></div><div class="sgx-h">INCOMING BROADCAST</div><div class="sgx-n">'+esc(name.toUpperCase())+'</div>'+
      (n?'<div class="sgx-c">+ '+n+' VIEWER'+(n===1?'':'S')+'</div>':'')+'<div class="sgx-w">WELCOME TO ZTV &middot; TYPE !ch TO CHANGE THE CHANNEL</div></div>'}]})}

/* ---- the clock that runs the night: late look, dead air, sign-off, recap ---- */
function nightTick(){
  lateApply();var c=ctNow(),D=SEG.done,A=xcfg("deadAir"),S=xcfg("signOff"),R=xcfg("recap");
  if(A.on!==false&&c.h===3){var from=A.from==null?5:A.from,to=A.to==null?40:A.to,pick=from+hash(c.date)%Math.max(1,to-from);
    if(c.m>=pick&&c.m<to&&!D["da"+c.date]){D["da"+c.date]=1;deadAir()}}
  if(S.on!==false&&c.h===3&&c.m>=58&&!D["so"+c.date]){D["so"+c.date]=1;signOff()}
  if(xcfg("restarts").standBy!==false)restartTimes().forEach(function(t){if(t.h===4&&t.m===0)return;
    var at=(t.h*60+t.m-1+1440)%1440,now=c.h*60+c.m,k="sb"+c.date+t.h+":"+t.m;
    if(now===at&&c.s>=15&&!D[k]){D[k]=1;standBy()}});
  if(R.on!==false&&R.everyHours>0){var last=0;try{last=+localStorage.getItem("ztv.recap")||0}catch(e){}
    if(!last){try{localStorage.setItem("ztv.recap",Date.now())}catch(e){}}
    else if(Date.now()-last>R.everyHours*3600000&&!(c.h===3&&c.m>=50)){try{localStorage.setItem("ztv.recap",Date.now())}catch(e){}recapShow()}}}
function segInit(){
  lateApply();setInterval(nightTick,5000);adSchedule();alertSchedule();stationIdSchedule();afterHoursSchedule();
  var c=ctNow(),bc=/[?&]bc=1/.test(location.search),now=c.h*60+c.m;
  if(xcfg("signOff").on!==false&&bc&&c.h===4&&c.m<20){setTimeout(signOn,6000);return}
  /* back from a mid-day restart: a quick hello */
  if(bc&&restartTimes().some(function(t){var d=now-(t.h*60+t.m);return!(t.h===4&&t.m===0)&&d>=0&&d<10}))setTimeout(function(){signOn(greeting())},6000)}
