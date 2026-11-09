/* ZTV overlays: channel banner, station-break bumpers and small on-screen messages. */
var bump={on:false,t:0,done:null,last:-1,count:0},bnT=0,msgT=0;

function showBanner(c,it,by,ms){
  var b=$("banner");if(!b||!c||!it)return;
  $("bimg").src=logoFor(c);$("bnum").textContent="CH "+pad(c.num);$("bname").textContent=c.name;
  $("bshow").textContent=it.t;$("bby").textContent=by||"";
  b.classList.add("show");clearTimeout(bnT);bnT=setTimeout(function(){b.classList.remove("show")},ms||5000)}
function hideBanner(){var b=$("banner");if(b)b.classList.remove("show")}
function osdMsg(t,ms){var m=$("msg");if(!m)return;m.textContent=t;m.classList.add("show");clearTimeout(msgT);msgT=setTimeout(function(){m.classList.remove("show")},ms||1600)}

function bumpList(){return(typeof BUMPERS!=="undefined"?BUMPERS:[]).filter(function(b){return b&&b.on!==false})}
function pickBumper(){
  var S=typeof BUMPER_SETTINGS!=="undefined"?BUMPER_SETTINGS:{enabled:false};if(!S.enabled)return null;
  bump.count++;if(bump.count%(S.every||1))return null;
  var late=typeof nightLate==="function"&&nightLate(),L=bumpList().filter(function(b){return !b.late||late});if(!L.length)return null;
  bump.recent=bump.recent||[];var keep=Math.min(5,L.length-1),pool=L.filter(function(b){return bump.recent.indexOf(b)<0});if(!pool.length)pool=L;
  var tot=pool.reduce(function(a,b){return a+(b.weight||1)},0),r=Math.random()*tot,pick=pool[0];
  for(var i=0;i<pool.length;i++){r-=pool[i].weight||1;if(r<=0){pick=pool[i];break}}
  bump.recent.push(pick);if(bump.recent.length>keep)bump.recent.shift();return pick}
function bumpFill(t,x){return String(t||"").replace(/\{show\}/g,x.show).replace(/\{channel\}/g,x.channel).replace(/\{num\}/g,x.num)}
function bumpCtx(){return cur?{show:cur.it.t,channel:cur.c.name,num:pad(cur.c.num)}:{show:"",channel:"",num:""}}
function playBump(b,x,done){
  var S=typeof BUMPER_SETTINGS!=="undefined"?BUMPER_SETTINGS:{},secs=(b.secs||S.secs||6)*1000;
  endBump(true);bump.on=true;bump.done=done;
  var el=$("bump"),bc=$("bumpc"),bv=$("bumpv"),bi=$("bumpi");
  el.hidden=false;bc.hidden=true;bv.hidden=true;bi.hidden=true;
  var mark=document.querySelector(".mark");if(mark&&$("bumpl"))$("bumpl").innerHTML=mark.outerHTML;
  ["network","bulletin","local","afterhours","technical"].forEach(function(k){el.classList.remove("skin-"+k)});
  var skin=["network","bulletin","local","afterhours","technical"].indexOf(b.skin)>=0?b.skin:"network";
  el.classList.add("skin-"+skin);
  if(b.type==="video"&&b.src){
    bv.hidden=false;bv.volume=AUD.vol;bv.muted=AUD.muted;bv.onended=bv.onerror=function(){endBump()};bv.src=b.src;
    var pr=bv.play();if(pr&&pr.catch)pr.catch(function(){bv.muted=true;bv.play().catch(function(){endBump()})});
    bump.t=setTimeout(endBump,120000)}
  else if(b.type==="image"&&b.src){bi.hidden=false;bi.onerror=function(){endBump()};bi.src=b.src;bump.t=setTimeout(endBump,secs)}
  else{$("bumph").textContent=bumpFill(b.head,x);$("bumpb").textContent=bumpFill(b.big,x);$("bumpf").textContent=bumpFill(b.foot,x);bc.hidden=false;bump.t=setTimeout(endBump,secs)}}
function endBump(quiet){
  if(!bump.on&&!quiet)return;
  var d=bump.done,was=bump.on;bump.on=false;bump.done=null;clearTimeout(bump.t);
  var el=$("bump"),bv=$("bumpv");bv.onended=bv.onerror=null;try{bv.pause();bv.removeAttribute("src");bv.load()}catch(e){}
  el.hidden=true;["network","bulletin","local","afterhours","technical"].forEach(function(k){el.classList.remove("skin-"+k)});if(d&&was&&!quiet)d()}
function bumpTest(){var L=bumpList();if(!L.length){osdMsg("NO BUMPERS");return}playBump(L[Math.random()*L.length|0],bumpCtx(),function(){})}

/* follow alerts in the top bar: one at a time, extra follows wait their turn */
var FOL={q:[],busy:false,count:null,t:0};
function followCount(n){
  FOL.count=n;var K=typeof KICK!=="undefined"?KICK:{},el=$("fcount");if(!el)return;
  if(K.followCount===false){el.hidden=true;return}
  el.innerHTML="<b>"+Number(n).toLocaleString()+"</b> FOLLOWERS";el.hidden=false}
var ICONS={heart:'<svg viewBox="0 0 16 16"><path d="M8 14 2 8a3.4 3.4 0 0 1 6-4 3.4 3.4 0 0 1 6 4z" fill="currentColor"/></svg>',
  star:'<svg viewBox="0 0 16 16"><path d="m8 1 2.1 4.6 5 .5-3.8 3.4 1.1 4.9L8 11.9 3.6 14.4l1.1-4.9L.9 6.1l5-.5z" fill="currentColor"/></svg>',
  gift:'<svg viewBox="0 0 16 16"><path d="M1 5h14v3H1zM2 8h12v7H2z" fill="currentColor"/><path d="M7 5h2v10H7z" fill="#000"/><path d="M8 5C6 1 3 2 4.5 4M8 5c2-4 5-3 3.5-1" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>'};
function followAlert(name){
  var K=typeof KICK!=="undefined"?KICK:{};if(K.follows===false)return;
  alertPush({label:"NEW SIGNAL DETECTED",name:name,icon:"heart",secs:K.followSecs||7})}
function subCfg(){return(typeof EXTRAS!=="undefined"&&EXTRAS.subs)||{on:true}}
function subAlert(name,months){
  var S=subCfg();if(S.on===false)return;months=+months||1;
  alertPush({label:months>1?"SIGNAL RENEWED · "+months+" MONTHS":"NEW TRANSMISSION SUPPORTER",name:name,icon:"star",secs:S.secs||8,kind:"sub"})}
function giftAlert(gifter,count){
  var S=subCfg();if(S.on===false)return;count=Math.max(1,+count||1);
  if(count>=(S.bombAt||5))alertPush({big:true,name:gifter,count:count,secs:S.bombSecs||10});
  else alertPush({label:"TRANSMITTED "+count+(count>1?" GIFT SUBS":" GIFT SUB"),name:gifter||"ANONYMOUS",icon:"gift",secs:S.secs||8,kind:"sub"})}
function alertPush(a){a.name=String(a.name||"").replace(/^@/,"").slice(0,24);if(FOL.q.length<30)FOL.q.push(a);if(!FOL.busy)followNext()}
function followNext(){
  if(typeof TK!=="undefined"&&TK.on){FOL.busy=false;return}   /* hold alerts until a takeover or weather break ends */
  var a=FOL.q.shift();if(a===undefined){FOL.busy=false;return}
  FOL.busy=true;var secs=(a.secs||7)*1000;
  if(a.big){bombShow(a,secs);return}
  var f=$("fol");$("fname").textContent=a.name?a.name.toUpperCase():"THANK YOU!";$("flabel").textContent=a.label;$("ficon").innerHTML=ICONS[a.icon]||ICONS.heart;
  f.classList.toggle("sub",a.kind==="sub");
  f.classList.remove("show");void f.offsetWidth;f.classList.add("show");
  clearTimeout(FOL.t);FOL.t=setTimeout(function(){f.classList.remove("show");setTimeout(followNext,700)},secs)}
/* gift bomb: big center-screen alert with falling pixel confetti */
function bombShow(a,secs){
  var el=$("gbomb");el.innerHTML='<canvas id="gconf"></canvas><div class="gbc"><div class="gbi">'+ICONS.gift+'</div><small>SIGNAL SURGE</small><b>'+esc((a.name||"ANONYMOUS").toUpperCase())+'</b>'+
    '<span>JUST GIFTED <em>'+a.count+'</em> SUBS</span><i>THE DEAD APPRECIATE YOUR SUPPORT</i></div>';
  el.hidden=false;el.classList.remove("show");void el.offsetWidth;el.classList.add("show");
  var c=$("gconf"),x=c.getContext("2d"),W=c.width=320,H=c.height=180,P=[],end=Date.now()+secs-600,cols=["#84996b","#aeb99a","#dedfce","#566e51","#c0b898"];
  for(var i=0;i<140;i++)P.push({x:Math.random()*W,y:-Math.random()*H,v:.4+Math.random()*1.2,s:1+(Math.random()*2|0),c:cols[i%cols.length],w:Math.random()*6});
  (function f(){x.clearRect(0,0,W,H);P.forEach(function(p){p.y+=p.v;p.w+=.05;if(p.y>H)p.y=-4;x.fillStyle=p.c;x.fillRect(Math.round(p.x+Math.sin(p.w)*3),Math.round(p.y),p.s,p.s)});
    if(Date.now()<end)requestAnimationFrame(f)})();
  clearTimeout(FOL.t);FOL.t=setTimeout(function(){el.classList.remove("show");setTimeout(function(){el.hidden=true;el.innerHTML="";followNext()},600)},secs)}
