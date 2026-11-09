/* ZTV community: chat bumps (with mod approval), !request, Z Bucks, !surf, raid alerts, the daily stats
   for the recap card, and the bottom ticker. Settings: data/extras.js. Everything is saved in the browser. */
var COM={pend:[],ready:[],nextId:1,lastBump:0,req:[],reqNow:null,reqUser:{},surfing:false};
function jget(k,d){try{var x=JSON.parse(localStorage.getItem(k)||"null");return x==null?d:x}catch(e){return d}}
function jset(k,x){try{localStorage.setItem(k,JSON.stringify(x))}catch(e){}}

/* ---- daily stats. The broadcast day runs 4 AM to 4 AM Central. ---- */
var DAY=null;
function dayKey(){return ctNow(Date.now()-4*3600000).date}
function dayLoad(){var k=dayKey();if(!DAY||DAY.day!==k){DAY=jget("ztv.day",null);if(!DAY||DAY.day!==k)DAY={day:k,ch:{},chat:{},flips:0,reqs:0,bumps:0,follows:0}}return DAY}
function daySave(){if(DAY)jset("ztv.day",DAY)}
function dayAdd(k,n){var d=dayLoad();d[k]=(d[k]||0)+(n||1);daySave()}
setInterval(function(){if(typeof cur==="undefined"||!cur||TK.on)return;var d=dayLoad(),n=cur.c.name;d.ch[n]=(d.ch[n]||0)+5},5000);
setInterval(daySave,60000);

/* ---- Z Bucks. Kick doesn't say who's watching, so you earn them by being in chat (once a minute). ---- */
function zbCfg(){return xcfg("zbucks")}
function zbName(){return zbCfg().name||"Z BUCKS"}
function zbLoad(){return jget("ztv.zb",{})}
function zbGet(u){var o=zbLoad()[String(u).toLowerCase()];return o?o[1]:0}
function zbAdd(u,n){if(zbCfg().on===false||!u||!n)return 0;var o=zbLoad(),k=String(u).toLowerCase(),r=o[k]||[u,0,0];r[0]=u;r[1]=Math.max(0,r[1]+n);o[k]=r;jset("ztv.zb",o);return r[1]}
function zbSpend(u,n){if(zbCfg().on===false||!n)return true;if(zbGet(u)<n){osdMsg(String(u).toUpperCase()+": NEED "+n+" "+zbName()+" (YOU HAVE "+zbGet(u)+")",3500);return false}zbAdd(u,-n);return true}
function zbTop(n){var o=zbLoad();return Object.keys(o).map(function(k){return[o[k][0],o[k][1]]}).filter(function(r){return r[1]>0}).sort(function(a,b){return b[1]-a[1]}).slice(0,n||5)}
function zbEarn(u){var Z=zbCfg();if(Z.on===false)return;var o=zbLoad(),k=String(u).toLowerCase(),r=o[k]||[u,0,0],now=Date.now();
  if(now-(r[2]||0)<60000)return;r[0]=u;r[1]+=Z.perMinute||5;r[2]=now;o[k]=r;jset("ztv.zb",o)}

/* every chat message comes through here first */
function comMsg(user,text,mod){if(!user)return;var d=dayLoad();d.chat[user]=(d.chat[user]||0)+1;zbEarn(user)}
/* follows, subs, gifts: bonus Z Bucks + stats */
function comFollow(u){dayAdd("follows");if(u)zbAdd(u,zbCfg().follow||0)}
function comSub(u){if(u)zbAdd(u,zbCfg().sub||0)}
function comGift(u,n){if(u)zbAdd(u,(zbCfg().gift||0)*(n||1))}

/* ---- chat bumps ---- */
function bumpClean(t){return String(t||"").replace(/https?:\/\/\S+|www\.\S+|\S+\.(com|net|org|gg|tv|io|ly)\b\S*/gi,"").replace(/\s+/g," ").trim()}
function bumpSubmit(user,text,mod){
  var B=xcfg("bumps");if(B.on===false)return;text=bumpClean(text).slice(0,B.maxLen||120);
  if(text.length<3){osdMsg("BUMP: TYPE !bump AND YOUR MESSAGE",3000);return}
  if(COM.pend.filter(function(b){return b.user===user}).length>=2){osdMsg(user.toUpperCase()+": YOU HAVE BUMPS WAITING",3000);return}
  var cost=mod?0:(B.cost||0);if(!zbSpend(user,cost))return;
  var b={id:COM.nextId++,user:user,text:text,paid:cost};
  if(mod){COM.ready.push(b);osdMsg("BUMP #"+b.id+" APPROVED",3000);return}
  COM.pend.push(b);if(COM.pend.length>20){var x=COM.pend.shift();zbAdd(x.user,x.paid)}
  osdMsg("BUMP #"+b.id+" FROM "+user.toUpperCase()+" WAITING ... MODS: !ok "+b.id+" OR !no "+b.id,6000)}
function bumpJudge(arg,ok){
  var id=parseInt(arg,10),i=id?COM.pend.findIndex(function(b){return b.id===id}):0;if(i<0||!COM.pend.length){osdMsg("NO BUMP "+(id||"WAITING"),2500);return}
  var b=COM.pend.splice(i,1)[0];
  if(ok){COM.ready.push(b);osdMsg("BUMP #"+b.id+" APPROVED ... IT PLAYS SOON",3000)}else{zbAdd(b.user,b.paid);osdMsg("BUMP #"+b.id+" SKIPPED",2500)}}
setInterval(function(){var B=xcfg("bumps");if(B.on===false||!COM.ready.length||segBusy())return;
  if(Date.now()-COM.lastBump<(B.everyMins||12)*60000)return;COM.lastBump=Date.now();textBump(COM.ready.shift())},20000);

/* ---- requests ---- */
function reqFind(q){
  var w=String(q||"").toLowerCase().replace(/[^a-z0-9' ]/g," ").split(/\s+/).filter(Boolean);if(!w.length)return null;
  var best=null,score=0,R=xcfg("request");
  CHS.forEach(function(c){c.ord.forEach(function(it){var t=it.t.toLowerCase(),s=0;
    if(it.d>(R.maxShowMins||120)*60)return;
    for(var i=0;i<w.length;i++){if(t.indexOf(w[i])<0)return;s+=w[i].length}
    if(t.indexOf(w.join(" "))>=0)s+=50;s-=t.length/100;if(s>score){score=s;best={it:it,c:c}}})});
  return best}
function reqAdd(user,q,mod){
  var R=xcfg("request");if(R.on===false)return;
  if(!q){osdMsg("TYPE !request AND PART OF A SHOW TITLE",3000);return}
  var last=COM.reqUser[user.toLowerCase()]||0;
  if(!mod&&Date.now()-last<(R.perUserMins||60)*60000){osdMsg(user.toUpperCase()+": ONE REQUEST EVERY "+(R.perUserMins||60)+" MIN",3000);return}
  if(COM.req.length>=(R.maxQueue||5)){osdMsg("REQUEST LINE IS FULL ... TRY AGAIN LATER",3000);return}
  var f=reqFind(q);if(!f){osdMsg("NO SHOW MATCHING \""+String(q).toUpperCase().slice(0,30)+"\"",3500);return}
  if(COM.req.some(function(r){return r.it===f.it})||(COM.reqNow&&COM.reqNow.it===f.it)){osdMsg("ALREADY IN THE REQUEST LINE",3000);return}
  COM.reqUser[user.toLowerCase()]=Date.now();
  COM.req.push({it:f.it,c:f.c,by:user,at:Date.now(),id:hash(f.it.a+Date.now())});
  osdMsg("REQUEST #"+COM.req.length+": "+f.it.t.toUpperCase()+" ... BY "+user.toUpperCase(),5000)}
/* app.js asks this every second: is a request playing (or ready to start)? */
function reqNow(now){
  var R=COM.reqNow;if(R&&now<R.end)return R;
  if(R){COM.reqNow=null;R=null;dayAdd("reqs")}
  var h=COM.req[0];if(!h||!CHS[curCh])return null;
  var c=CHS[curCh],p=pos(c,now),W=(xcfg("request").waitMins||10)*60000;
  if(p.start>h.at||now-h.at>=W){COM.req.shift();h.start=now;h.end=now+h.it.d*1000;COM.reqNow=h;return h}
  return null}
function reqSkip(){if(COM.reqNow){COM.reqNow.end=0;osdMsg("REQUEST SKIPPED",2500)}else if(COM.req.length){COM.req.shift();osdMsg("NEXT REQUEST REMOVED",2500)}}
function reqList(){if(!COM.req.length&&!COM.reqNow){osdMsg("REQUEST LINE IS EMPTY ... !request A TITLE",3500);return}
  osdMsg((COM.reqNow?"NOW: "+COM.reqNow.it.t.toUpperCase()+" ... ":"")+COM.req.slice(0,3).map(function(r,i){return(i+1)+". "+r.it.t.toUpperCase()}).join(" ... "),6000)}

/* ---- !surf: flips through a few channels with static, then lands on a random one ---- */
function surf(user){
  if(COM.surfing||!CHS.length)return;COM.surfing=true;var n=(xcfg("surf").flips||5),i=0;
  (function flip(){
    if(i++>=n){COM.surfing=false;chatTune(user,spelunk);return}
    var k=Math.random()*CHS.length|0,c=CHS[k];staticOn(520,"CH "+pad(c.num)+" "+c.name);setTimeout(flip,560)})()}

/* ---- the ticker at the bottom ---- */
function tickerSet(){
  var el=$("tick");if(!el)return;var T=xcfg("ticker"),m=(T.messages||[]).slice();
  var txt=(cur?"NOW PLAYING ON CH "+pad(cur.c.num)+": "+cur.it.t.toUpperCase()+" ... ":"")+m.join(" ... ")+" ...";
  if(el.textContent===txt)return;el.textContent=txt;el.style.animationDuration=Math.max(30,txt.length*(T.secsPerChar||.16))+"s"}

/* ---- the new chat commands. Returns true when it handled the message. ---- */
var TUNE_CMDS=/^(ch|channel|next|up|prev|previous|down|random|spelunk|surf)$/;
function comCmd(user,cmd,q,mod){
  var Z=zbCfg(),P=Z.prices||{};
  if(cmd==="bump"){bumpSubmit(user,q,mod);return true}
  if(cmd==="ok"||cmd==="approve"){if(mod)bumpJudge(q,true);return true}
  if(cmd==="no"||cmd==="deny"){if(mod)bumpJudge(q,false);return true}
  if(cmd==="request"||cmd==="req"||cmd==="sr"){reqAdd(user,q,mod);return true}
  if(cmd==="queue"||cmd==="requests"){reqList();return true}
  if(cmd==="skip"){if(mod)reqSkip();return true}
  if(cmd==="zb"||cmd==="zbucks"||cmd==="bucks"){osdMsg(user.toUpperCase()+": "+zbGet(user)+" "+zbName(),3500);return true}
  if(cmd==="zbtop"){var t=zbTop(3);osdMsg(t.length?"RICHEST ZOMBIES: "+t.map(function(r,i){return(i+1)+". "+r[0].toUpperCase()+" "+r[1]}).join(" ... "):"NO "+zbName()+" YET",6000);return true}
  if(cmd==="givezb"){if(mod){var g=q.split(/\s+/),amt=parseInt(g[1],10)||0;if(g[0]&&amt){zbAdd(g[0].replace(/^@/,""),amt);osdMsg("+"+amt+" "+zbName()+" TO "+g[0].replace(/^@/,"").toUpperCase(),3000)}}return true}
  if(cmd==="buy"){
    var w=q.split(/\s+/),what=(w[0]||"").toLowerCase(),rest=w.slice(1).join(" ");
    if(what==="ch"||what==="channel"){
      if(COM.reqNow&&!mod){osdMsg("REQUEST PLAYING ... ENDS "+fmtT(COM.reqNow.end),3000);return true}
      var j=chanFind(rest);if(j<0){osdMsg("NO CHANNEL "+rest.toUpperCase(),2500);return true}
      if(zbSpend(user,P.ch||100))chatTune(user,function(){tune(j)});return true}
    if(what==="weather"){if(segBusy()){osdMsg("TRY AGAIN IN A MOMENT",2500);return true}if(zbSpend(user,P.weather||300)){osdMsg("WEATHER BREAK BOUGHT BY "+user.toUpperCase(),3000);setTimeout(weatherTest,1500)}return true}
    if(what==="takeover"){if(segBusy()){osdMsg("TRY AGAIN IN A MOMENT",2500);return true}if(zbSpend(user,P.takeover||200))setTimeout(takeoverTest,800);return true}
    osdMsg("!buy ch 12 ("+(P.ch||100)+") ... !buy weather ("+(P.weather||300)+") ... !buy takeover ("+(P.takeover||200)+")",5000);return true}
  /* sound, for mods: !unmute  !mute  !vol 80 */
  if(cmd==="unmute"){if(mod){AUD.muted=false;muteHint=false;if(!AUD.vol)AUD.vol=.8;audSave();audApply();osdMsg("SOUND ON · VOL "+Math.round(AUD.vol*100)+"%",2500)}return true}
  if(cmd==="mute"){if(mod){AUD.muted=true;audApply();osdMsg("MUTED",2500)}return true}
  if(cmd==="vol"||cmd==="volume"){if(mod){var nv=parseInt(q,10);if(nv>=0&&nv<=100){AUD.vol=nv/100;AUD.muted=false;muteHint=false;audSave();audApply()}osdMsg("VOL "+Math.round(AUD.vol*100)+"%",2500)}return true}
  /* mod test commands */
  if(cmd==="deadair"){if(mod)deadAir();return true}
  if(cmd==="signoff"){if(mod)signOff();return true}
  if(cmd==="signon"){if(mod)signOn();return true}
  if(cmd==="ad"){if(mod)adBreak();return true}
  if(cmd==="alert"){if(mod)zombieAlert();return true}
  if(cmd==="recap"){if(mod)recapShow();return true}
  if(cmd==="testraid"){if(mod){var r=q.split(/\s+/),rn=parseInt(r[r.length-1],10);raidAlert((isNaN(rn)?r:r.slice(0,-1)).join(" ")||user,isNaN(rn)?25:rn)}return true}
  if(cmd==="latenight"){if(mod){SEG.late=!SEG.late;document.body.classList.toggle("late",SEG.late);var tb=document.querySelector(".tag b");if(tb)tb.textContent=SEG.late?"Late Night on Kick":"24/7 on Kick"}return true}
  /* while a request plays, regular viewers can't change the channel */
  if(TUNE_CMDS.test(cmd)&&COM.reqNow&&!mod){osdMsg("REQUESTED BY "+String(COM.reqNow.by).toUpperCase()+" ... CHANNELS BACK AT "+fmtT(COM.reqNow.end),3500);return true}
  return false}
