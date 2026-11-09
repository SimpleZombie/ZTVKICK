/* ZTV takeovers: random full-screen interruptions. Settings and lines live in data/takeovers.js. */
var TK={t:0,on:false,lastStyle:"",recent:[],drone:null,saved:null,raf:0};
function tkCfg(){return typeof TAKEOVER_SETTINGS!=="undefined"?TAKEOVER_SETTINGS:{enabled:false}}
function tkSchedule(){
  var S=tkCfg();clearTimeout(TK.t);if(!S.enabled)return;
  var a=(S.minMins||15)*60000,b=Math.max(a,(S.maxMins||35)*60000),late=typeof nightLate==="function"&&nightLate();if(late){a*=.6;b*=.6}   /* more often late at night */
  TK.t=setTimeout(function go(){if(bump.on||TK.on||(typeof VOTE!=="undefined"&&VOTE.on)){TK.t=setTimeout(go,5000);return}takeover()},a+Math.random()*(b-a))}
function tkPick(list,avoid){var c=list.filter(function(x){return avoid.indexOf(x)<0});if(!c.length)c=list;return c[Math.random()*c.length|0]}
function tkFill(s){var now=new Date(),h=now.getHours()%12||12,m=String(now.getMinutes()).padStart(2,"0");
  return String(s).replace(/\{time\}/g,h+":"+m+(now.getHours()<12?" am":" pm"))
    .replace(/\{show\}/g,cur?cur.it.t.toLowerCase():"the show").replace(/\{channel\}/g,cur?cur.c.name.toLowerCase():"this channel")}
function tkTime(){var d=new Date(),h=d.getHours()%12||12;return h+":"+String(d.getMinutes()).padStart(2,"0")+(d.getHours()<12?" am":" pm")}

/* ---- weekly leaderboard: who changed the channel the most from chat. Resets Monday 12 AM Central. ---- */
function lbCfg(){return(typeof EXTRAS!=="undefined"&&EXTRAS.leaderboard)||{on:false}}
function lbWeek(){var p=new Date().toLocaleDateString("en-CA",{timeZone:"America/Chicago"}).split("-").map(Number),d=new Date(Date.UTC(p[0],p[1]-1,p[2]));
  d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)}
function lbLoad(){var w=lbWeek(),o;try{o=JSON.parse(localStorage.getItem("ztv.lb")||"{}")}catch(e){o={}}if(o.week!==w)o={week:w,n:{}};return o}
function lbCount(user){
  if(!lbCfg().on||!user||/VIEWER'S CHOICE/.test(user))return;var o=lbLoad(),k=String(user);o.n[k]=(o.n[k]||0)+1;
  try{localStorage.setItem("ztv.lb",JSON.stringify(o))}catch(e){}}
function lbTop(){var o=lbLoad();return Object.keys(o.n).map(function(k){return[k,o.n[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,lbCfg().top||5)}

/* ---- the looks ---- */
var TK_STYLES={
  brackets:function(line){
    var bg=["#000","forest","grain"][Math.random()*3|0];
    return'<div class="tk tk-br tk-bg-'+(bg==="#000"?"black":bg)+'"><div class="tk-brt">['+esc(line)+']<sup>['+tkTime()+']</sup></div><div class="tk-mark">[ztv]</div></div>'},
  ident:function(line){
    return'<div class="tk tk-id"><canvas class="tk-noise"></canvas><div class="tk-track"></div><div class="tk-idc">'+
      '<div class="tk-idlogo">'+document.querySelector(".mark").outerHTML+'</div>'+
      '<div class="tk-idh">'+esc(tkPick(IDENT_HEADS,[]))+'</div>'+
      '<div class="tk-idm">'+esc(line.toUpperCase())+'</div>'+
      '<div class="tk-idf">'+esc(tkPick(IDENT_FOOTS,[]))+'</div></div></div>'},
  tunnel:function(line){
    var g="",i,k;
    for(i=1;i<=7;i++){k=Math.pow(i/7,1.7);var w=1600*k,h=900*k;g+='<rect x="'+(800-w/2)+'" y="'+(450-h/2)+'" width="'+w+'" height="'+h+'"/>'}
    for(i=0;i<=16;i++){g+='<line x1="800" y1="450" x2="'+(i*100)+'" y2="0"/><line x1="800" y1="450" x2="'+(i*100)+'" y2="900"/>'}
    for(i=0;i<=9;i++){g+='<line x1="800" y1="450" x2="0" y2="'+(i*100)+'"/><line x1="800" y1="450" x2="1600" y2="'+(i*100)+'"/>'}
    return'<div class="tk tk-tn"><svg class="tk-tnl" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#0f8f5a" stroke-width="5">'+g+'</g></svg>'+
      '<svg class="tk-tnf" viewBox="0 0 100 100"><g fill="none" stroke="#062b14" stroke-width="1.6" stroke-linejoin="round">'+
      '<path d="M50 8 L78 30 L74 70 L50 92 L26 70 L22 30 Z"/><path d="M22 30 L50 44 L78 30 M50 44 L50 92 M26 70 L50 58 L74 70 M36 37 L50 58 L64 37"/>'+
      '<circle cx="38" cy="34" r="7"/><circle cx="62" cy="34" r="7"/></g><circle cx="38" cy="34" r="3" fill="#062b14"/><circle cx="62" cy="34" r="3" fill="#062b14"/></svg>'+
      '<div class="tk-tnc">'+esc(line.toUpperCase())+'</div></div>'},
  poster:function(line){
    return'<div class="tk tk-po"><div class="tk-poh">'+esc(line.toUpperCase())+'</div>'+
      '<svg class="tk-pof" viewBox="0 0 200 200"><path d="M40 70 Q40 14 100 14 Q160 14 160 70 L160 150 Q160 178 132 178 L68 178 Q40 178 40 150 Z" fill="#53fc18"/><path d="M58 178 L58 192 M84 178 L84 188 M116 178 L116 194 M142 178 L142 186" stroke="#53fc18" stroke-width="9" stroke-linecap="round"/><circle cx="100" cy="78" r="30" fill="#111"/><circle class="tk-pupil" cx="100" cy="78" r="11" fill="#53fc18"/><path d="M62 140 Q100 158 138 140" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/><path d="M74 136 L70 152 M90 142 L88 158 M110 142 L112 158 M126 136 L130 152" stroke="#111" stroke-width="5" stroke-linecap="round"/></svg>'+
      '<div class="tk-pob"><b>ZTV<i>4</i>ZOMBIES</b><span>'+esc(tkFill("it's {time}. we're still on."))+'</span></div></div>'},
  leaderboard:function(){
    var top=lbTop(),wk=new Date(lbWeek()+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}).toUpperCase(),
        place=["1ST","2ND","3RD","4TH","5TH","6TH","7TH","8TH","9TH","10TH"];
    return'<div class="tk tk-lb"><div class="tk-lbh">TOP CHANNEL SURFERS</div><div class="tk-lbw">THIS WEEK \u00b7 SINCE MON '+wk+'</div><ol>'+
      top.map(function(r,i){return'<li'+(i===0?' class="first"':'')+'><span>'+place[i]+'</span><b>'+esc(r[0].toUpperCase())+'</b><i></i><em>'+r[1]+(r[1]===1?' FLIP':' FLIPS')+'</em></li>'}).join("")+
      '</ol><div class="tk-lbf">CHANGE THE CHANNEL WITH !ch \u00b7 RESETS EVERY MONDAY<span class="tk-cur">_</span></div><div class="tk-mark">[ztv]</div></div>'},
  moon:function(line){
    var st="",i;for(i=0;i<90;i++)st+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*70).toFixed(1)+'%;animation-delay:'+(Math.random()*3).toFixed(1)+'s"></i>';
    return'<div class="tk tk-mo"><div class="tk-stars">'+st+'</div>'+
      '<svg class="tk-moon" viewBox="0 0 32 32" shape-rendering="crispEdges"><circle cx="16" cy="16" r="15" fill="#d9ffc4"/>'+
      '<circle cx="9" cy="22" r="3" fill="#b6e8a0"/><circle cx="23" cy="9" r="2" fill="#b6e8a0"/><circle cx="21" cy="24" r="2" fill="#b6e8a0"/>'+
      '<g class="tk-eyes"><rect x="9" y="12" width="4" height="4" fill="#0b2a10"/><rect x="19" y="12" width="4" height="4" fill="#0b2a10"/></g>'+
      '<g class="tk-lids"><rect x="9" y="12" width="4" height="4" fill="#d9ffc4"/><rect x="19" y="12" width="4" height="4" fill="#d9ffc4"/></g></svg>'+
      '<div class="tk-mot">'+esc(line)+'</div><div class="tk-mark">ZTV · 00</div></div>'},
  service:function(line){
    return'<div class="tk tk-service"><div class="tks-top"><span>ZTV NETWORK OPERATIONS</span><b>NOTICE 00-'+String(Math.random()*90+10|0)+'</b></div>'+ 
      '<div class="tks-center"><div class="tks-kicker">AUTOMATED SERVICE MESSAGE</div><div class="tks-title">PLEASE REMAIN<br>ON THIS CHANNEL</div><div class="tks-copy">'+esc(line.toUpperCase())+'</div></div>'+ 
      '<div class="tks-bottom"><span>NO ACTION IS REQUIRED</span><span>'+tkTime()+' · ZTV-DT</span></div><div class="tks-cursor">_</div></div>'},
  notice:function(line){
    return'<div class="tk tk-notice"><div class="tkn-paper"><div class="tkn-head"><span>THE ZTV VIEWER</span><b>INFORMATION BULLETIN</b></div><div class="tkn-rule"></div><div class="tkn-stamp">PLEASE<br>NOTE</div><div class="tkn-label">A MESSAGE FROM THE NETWORK</div><div class="tkn-line">'+esc(line.toUpperCase())+'</div><div class="tkn-foot">PLEASE KEEP THIS NOTICE FOR YOUR RECORDS <span>FORM 00-B</span></div></div></div>'},
  offair:function(line){
    return'<div class="tk tk-offair"><div class="tko-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="tko-panel"><small>ZTV-DT · CHANNEL 00</small><b>TRANSMISSION<br>INTERRUPTED</b><span>'+esc(line.toUpperCase())+'</span><em>THE STATION WILL RETURN SHORTLY</em></div><div class="tko-code">SIGNAL STATUS: NOMINAL</div></div>'}
};

/* ---- sound: a low hum that fades in and out ---- */
function tkDrone(secs){
  var S=tkCfg();if(S.drone===false||AUD.muted)return;
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();
    var t=AC.currentTime,g=AC.createGain(),lp=AC.createBiquadFilter(),base=[41.2,49,55,61.7][Math.random()*4|0],osc=[];
    lp.type="lowpass";lp.frequency.value=420;g.connect(AC.destination);lp.connect(g);
    [1,1.007,2.003,3].forEach(function(m,i){var o=AC.createOscillator(),og=AC.createGain();o.type=i===3?"triangle":"sine";o.frequency.value=base*m;
      og.gain.value=[.5,.45,.18,.06][i];o.connect(og);og.connect(lp);o.start(t);o.stop(t+secs+1);osc.push(o)});
    var peak=.16*Math.min(1,AUD.vol/.8);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+1.5);
    g.gain.setValueAtTime(peak,t+secs-1.2);g.gain.linearRampToValueAtTime(0,t+secs)}catch(e){}}

/* ---- static burst used on the way in and out ---- */
function tkStatic(el,ms,done){
  var c=document.createElement("canvas");c.className="tk-static";c.width=160;c.height=90;el.appendChild(c);
  var x=c.getContext("2d"),img=x.createImageData(160,90),end=Date.now()+ms;
  (function f(){var d=img.data;for(var i=0;i<d.length;i+=4){var q=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=q;d[i+3]=255}x.putImageData(img,0,0);
    if(Date.now()<end)TK.raf=requestAnimationFrame(f);else{c.remove();if(done)done()}})();
  hiss(ms)}
function tkNoise(el){ /* rolling tape grain for the ident look */
  var c=el.querySelector(".tk-noise");if(!c)return;c.width=240;c.height=135;var x=c.getContext("2d"),img=x.createImageData(240,135);
  (function f(){if(!TK.on)return;var d=img.data;for(var i=0;i<d.length;i+=4){var q=Math.random()*90|0;d[i]=q*.5;d[i+1]=q*.6;d[i+2]=q;d[i+3]=255}x.putImageData(img,0,0);
    setTimeout(function(){requestAnimationFrame(f)},66)})()}

/* ---- run one ---- */
function takeover(style){
  var S=tkCfg(),el=$("tko");if(!el||TK.on)return;
  var styles=(S.styles&&S.styles.length?S.styles:Object.keys(TK_STYLES)).filter(function(s){return TK_STYLES[s]||(typeof TK_SEQ!=="undefined"&&TK_SEQ[s])});
  if(lbCfg().on&&lbTop().length&&styles.indexOf("leaderboard")<0)styles.push("leaderboard");
  if(style==="leaderboard"&&!lbTop().length)style="";
  var isSeq=function(s){return typeof TK_SEQ!=="undefined"&&TK_SEQ[s]};
  if(!style||!(TK_STYLES[style]||isSeq(style)))style=tkPick(styles,[TK.lastStyle]);
  /* the text sequences (explainer, missing, friend) run as segments and reschedule when they finish */
  if(isSeq(style)){TK.lastStyle=style;TK_SEQ[style](function(){tkSchedule()});return}
  var pool=(typeof nightLate==="function"&&nightLate()&&typeof LATE_LINES!=="undefined")?LINES.concat(LATE_LINES,LATE_LINES):LINES,line=tkPick(pool,TK.recent);TK.recent.push(line);if(TK.recent.length>Math.min(8,LINES.length-1))TK.recent.shift();
  TK.lastStyle=style;TK.on=true;var secs=S.secs||9,bv=$("bumpv");
  TK.saved={v:v.muted,b:bv?bv.muted:false};v.muted=true;if(bv)bv.muted=true;hideBanner();
  el.innerHTML="";el.hidden=false;
  tkStatic(el,350,function(){
    el.insertAdjacentHTML("afterbegin",TK_STYLES[style](tkFill(line)));tkNoise(el);tkDrone(secs);
    setTimeout(function(){tkStatic(el,300,function(){
      el.hidden=true;el.innerHTML="";TK.on=false;v.muted=(AUD.muted||muteHint);if(bv)bv.muted=AUD.muted;
      if(typeof followNext==="function"&&FOL.q.length&&!FOL.busy)followNext();
      tkSchedule()})},secs*1000)})}
function takeoverTest(){if(!TK.on)takeover()}

/* ---- text takeovers: short sequences of cards (ZTV Explains, Lost & Found, ZTV Is Your Friend).
   They run through the segment runner, so they wait their turn like everything else. Words live in data/takeovers.js. ---- */
var TK_ICONS={
  tower:'<path d="M30 8L18 56h4l8-30 8 30h4z M24 36h12 M22 46h16"/><path d="M20 10q-5 6 0 12M40 10q5 6 0 12"/>',
  cloud:'<path d="M14 42h32a9 9 0 0 0 0-18 13 13 0 0 0-25-2 10 10 0 0 0-7 20z"/>',
  house:'<path d="M10 30L30 12l20 18 M15 26v26h30V26 M26 52V38h8v14"/>',
  person:'<circle cx="30" cy="18" r="8"/><path d="M14 54c0-10 7-17 16-17s16 7 16 17"/>',
  tv:'<rect x="8" y="16" width="44" height="32" rx="4"/><rect x="13" y="21" width="28" height="22" rx="2"/><path d="M22 16l-6-8M38 16l6-8M47 26v2M47 33v2"/>',
  box:'<path d="M14 24h32v26H14z M14 24l6-8h20l6 8 M26 32h8"/>',
  bigbox:'<path d="M6 20h48v34H6z M6 20l8-10h32l8 10 M24 30h12"/><path d="M18 34h24v16H18z"/>',
  clock:'<circle cx="30" cy="32" r="20"/><path d="M30 18v14l10 6"/>',
  moon:'<path d="M38 10a22 22 0 1 0 14 34A18 18 0 0 1 38 10z"/>',
  bubble:'<path d="M10 14h40v24H26l-10 8v-8h-6z"/><path d="M18 26h4M28 26h4M38 26h4"/>',
  remote:'<rect x="21" y="6" width="18" height="48" rx="5"/><circle cx="30" cy="15" r="3"/><path d="M26 24h2M32 24h2M26 30h2M32 30h2M26 36h2M32 36h2M26 42h8"/>',
  wave:'<path d="M6 32q6-10 12 0t12 0 12 0 12 0"/><path d="M6 44q6-10 12 0t12 0 12 0 12 0"/>'
};
function tkEsc(s){return esc(String(s==null?"":s))}
function tkFillName(s,v){return String(s).replace(/\{time\}/g,tkTime()).replace(/\{name\}/g,v.name||"you").replace(/\{n\}/g,v.n==null?"":v.n)}
/* 1. ZTV Explains: a deadpan explainer that draws a little diagram one step at a time */
function tkExplainer(done){
  if(typeof EXPLAINERS==="undefined"||!EXPLAINERS.length){if(done)done();return}
  var X=EXPLAINERS[Math.random()*EXPLAINERS.length|0],steps=X.steps,n=steps.length;
  var draw=function(k){var w=Math.min(900,n*190),x0=(1000-w)/2,g="";
    for(var i=0;i<n&&i<=k;i++){var cx=x0+i*(w/(n-1||1)),on=i===k;
      g+='<g transform="translate('+(cx-45)+' 40) scale(1.5)" class="tke-ic'+(on?' on':'')+'">'+(TK_ICONS[steps[i][0]]||TK_ICONS.box)+'</g>'+
         '<text x="'+cx+'" y="175" text-anchor="middle" class="tke-lb'+(on?' on':'')+'">'+tkEsc(steps[i][1])+'</text>';
      if(i<k)g+='<path class="tke-ar" d="M'+(cx+60)+' 88H'+(cx+w/(n-1||1)-60)+' m-10 -8 l10 8 -10 8"/>'}
    return'<svg class="tke-svg" viewBox="0 0 1000 200">'+g+'</svg>'};
  var scenes=[{ms:3200,html:'<div class="sg sg-tke"><div class="tke-kick">ZTV EXPLAINS</div><div class="tke-t">'+tkEsc(X.title)+'</div></div>'}];
  steps.forEach(function(s,k){scenes.push({ms:Math.min(6500,2800+s[2].length*45),html:'<div class="sg sg-tke">'+draw(k)+'<div class="tke-say">'+tkEsc(s[2])+'</div><div class="tk-mark">[ztv]</div></div>'})});
  if(X.end)scenes.push({ms:3200,html:'<div class="sg sg-tke"><div class="tke-say big">'+tkEsc(X.end)+'</div><div class="tk-mark">[ztv]</div></div>'});
  segRun({cutIn:true,sound:function(){return AUD.muted?null:segPad(.02)},scenes:scenes,done:done})}
/* 2. Lost & Found: a "have you seen this" bulletin for something that was never coming back */
function tkMissing(done){
  if(typeof LOST_FOUND==="undefined"||!LOST_FOUND.length){if(done)done();return}
  var M=LOST_FOUND[Math.random()*LOST_FOUND.length|0],no=String(Math.random()*900+100|0);
  var html='<div class="sg sg-lf"><div class="lf-top"><b>ZTV LOST &amp; FOUND</b><span>BULLETIN NO. '+no+'</span></div>'+
    '<div class="lf-body"><div class="lf-pic">'+(TK_ICONS[M.icon]?'<svg viewBox="0 0 60 60">'+TK_ICONS[M.icon]+'</svg>':'<span>NO PHOTO<br>AVAILABLE</span>')+'</div>'+
    '<div class="lf-info"><div class="lf-h">HAVE YOU SEEN<br>'+tkEsc(M.what)+'?</div>'+
    [["LAST SEEN",M.seen],["DESCRIPTION",M.desc],["ANSWERS TO",M.answers],["IF FOUND",M.found]].filter(function(r){return r[1]}).map(function(r){return'<div class="lf-row"><small>'+r[0]+'</small><span>'+tkEsc(r[1])+'</span></div>'}).join("")+
    '</div></div><div class="lf-bot">THIS HAS BEEN A ZTV LOST &amp; FOUND BULLETIN &middot; NOTHING HERE IS URGENT</div></div>';
  segRun({sound:function(s){tkDrone(s);return null},scenes:[{ms:11000,html:html}],done:done})}
/* 3. ZTV Is Your Friend: white words on a flat color, talking to someone from today's chat */
function tkFriendPick(){
  var out=[],d=typeof dayLoad==="function"?dayLoad():null,lb=typeof lbTop==="function"?lbTop():[];
  if(lb.length&&lb[0][1]>=3)out.push({key:"flips",name:lb[0][0],n:lb[0][1]});
  if(d){var names=Object.keys(d.chat||{}).sort(function(a,b){return d.chat[b]-d.chat[a]}).slice(0,6);if(names.length)out.push({key:"chatter",name:names[Math.random()*names.length|0],n:d.chat[names[0]]})}
  return out}
function tkFriend(done){
  if(typeof FRIEND_NOTES==="undefined"){if(done)done();return}
  var who=tkFriendPick(),v={},pool=FRIEND_NOTES.anyone.slice();
  who.forEach(function(w){(FRIEND_NOTES[w.key]||[]).forEach(function(s){pool.push({lines:s,v:w});pool.push({lines:s,v:w})})});   /* real names come up more often */
  var pick=pool[Math.random()*pool.length|0];if(Array.isArray(pick)){pick={lines:pick,v:{}}}v=pick.v||{};
  var bg=["#1f3b2c","#2b2440","#3a2b1d","#1d2f3a","#3a1d2a","#26301a"][Math.random()*6|0];
  var scenes=pick.lines.map(function(t){t=tkFillName(t,v);return{ms:Math.min(5200,2200+t.length*55),html:'<div class="sg sg-fr" style="background:'+bg+'"><p>'+tkEsc(t)+'</p></div>'}});
  scenes.push({ms:1800,html:'<div class="sg sg-fr" style="background:'+bg+'"><p class="mk">[ztv]</p></div>'});
  segRun({cutIn:true,cutOut:true,sound:function(){return AUD.muted?null:segPad(.02)},scenes:scenes,done:done})}
var TK_SEQ={explainer:tkExplainer,missing:tkMissing,friend:tkFriend};
