/* ZTV Kick chat control (anonymous, read-only). Settings live in data/kick.js.
   Kick chat is delivered over a Pusher websocket: subscribe to chatrooms.<id>.v2 and listen for ChatMessageEvent. */
var CHAT={ws:null,tries:0,gl:0,t:0,on:false,lt:0,ping:0,room:0,chan:0,key:null};
function kickCfg(){return typeof KICK!=="undefined"?KICK:null}
/* the strip next to the channel buttons shows only while chat is connected */
function chatStatus(s){
  CHAT.on=(s==="CHAT ON");var b=$("chatbar");if(!b)return;
  if(CHAT.on){b.title="Kick chat control on: kick.com/"+KICK.channel+"  (!ch 13, !ch name, !next, !prev, !random, !whatson)";b.hidden=false}
  else{b.hidden=true;$("clast").textContent=""}}
function chatPeek(){
  var K=kickCfg();
  osdMsg(!K||!K.enabled?"CHAT DISABLED":!CHAT.room?"KICK CHAT: NO CHATROOM ID":(CHAT.on?"KICK CHAT ON · "+String(K.channel).toUpperCase():"KICK CHAT OFF · RETRYING"),2600)}
/* ids: ?room= / ?chan= in the address, then data/kick.js, then a saved lookup, then try asking Kick.
   room = chatroom (chat), chan = channel (follow events). */
function kickIds(){
  var K=KICK,qs=location.search,r=qs.match(/[?&]room=(\d+)/),c=qs.match(/[?&]chan=(\d+)/),
      ids={room:r?+r[1]:+K.chatroomId||0,chan:c?+c[1]:+K.channelId||0};
  try{var sv=JSON.parse(localStorage.getItem("ztv.kickids."+K.channel)||"{}");ids.room=ids.room||+sv.room||0;ids.chan=ids.chan||+sv.chan||0}catch(e){}
  if(ids.room&&ids.chan)return Promise.resolve(ids);
  return fetch("https://kick.com/api/v2/channels/"+encodeURIComponent(K.channel)).then(function(x){return x.json()}).then(function(j){
    ids.room=ids.room||+(j&&j.chatroom&&j.chatroom.id)||0;ids.chan=ids.chan||+(j&&j.id)||0;
    if(j&&j.followers_count!=null)followCount(+j.followers_count);
    try{localStorage.setItem("ztv.kickids."+K.channel,JSON.stringify(ids))}catch(e){}return ids}).catch(function(){return ids})}
function chatStart(){
  var K=kickCfg();if(!K||!K.enabled||!K.channel){chatStatus("");return}
  kickIds().then(function(ids){CHAT.room=ids.room;CHAT.chan=ids.chan;
    if(!ids.room&&!ids.chan){chatStatus("");osdMsg("KICK CHAT: SET chatroomId",8000);return}chatConnect()})}
/* Kick hands out its current chat key the same way kick.com does. If the browser blocks the ask, use data/kick.js. */
function pusherCreds(){
  var K=KICK;if(CHAT.key)return Promise.resolve(CHAT.key);
  var fb={key:K.pusherKey,cluster:K.pusherCluster||"us2"};
  return fetch("https://web.kick.com/api/v1/realtime/connection",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({accepted_providers:["pusher"]})}).then(function(r){return r.json()}).then(function(j){
      var c=((j&&j.data&&j.data.connections)||[]).map(function(x){return x&&x.credentials}).filter(function(x){return x&&x.app_key})[0];
      if(!c||!/^[a-z0-9]+$/i.test(c.app_key)||!/^[a-z0-9-]+$/i.test(c.cluster||"us2"))return fb;
      return{key:c.app_key,cluster:c.cluster||"us2"}}).catch(function(){return fb}).then(function(c){CHAT.key=c;return c})}
function chatConnect(){
  chatStatus("CHAT ...");pusherCreds().then(chatOpen)}
function chatOpen(P){
  var ws;
  try{ws=new WebSocket("wss://ws-"+P.cluster+".pusher.com/app/"+P.key+"?protocol=7&client=js&version=8.4.0&flash=false")}catch(e){chatRetry();return}
  CHAT.ws=ws;
  ws.onmessage=function(e){var m;try{m=JSON.parse(e.data)}catch(x){return}chatEvent(ws,m)};
  ws.onclose=ws.onerror=function(){if(CHAT.ws!==ws)return;CHAT.ws=null;clearInterval(CHAT.ping);chatStatus("CHAT OFF");chatRetry()}}
function chatEvent(ws,m){
  var ev=m.event||"";
  if(ev==="pusher:connection_established"){
    if(CHAT.room)ws.send(JSON.stringify({event:"pusher:subscribe",data:{auth:"",channel:"chatrooms."+CHAT.room+".v2"}}));
    if(CHAT.chan)ws.send(JSON.stringify({event:"pusher:subscribe",data:{auth:"",channel:"channel."+CHAT.chan}}));
    clearInterval(CHAT.ping);CHAT.ping=setInterval(function(){if(ws.readyState===1)ws.send(JSON.stringify({event:"pusher:ping",data:{}}))},60000);return}
  if(ev==="pusher:ping"){ws.send(JSON.stringify({event:"pusher:pong",data:{}}));return}
  if(ev==="pusher_internal:subscription_succeeded"){CHAT.tries=0;chatStatus("CHAT ON");return}
  if(ev==="pusher:error"){var dd=m.data;try{dd=typeof dd==="string"?JSON.parse(dd):dd}catch(e){}
    if(dd&&+dd.code===4001)CHAT.key=null;   /* key refused: ask Kick again on the retry */
    try{ws.close()}catch(e){}return}
  var d;try{d=typeof m.data==="string"?JSON.parse(m.data):m.data}catch(e){return}
  if(/FollowersUpdated$/.test(ev)){followEvent(d||{});return}
  if(/(^|\\)SubscriptionEvent$/.test(ev)&&!/Gift/i.test(ev)){subEvent(d||{});return}
  if(/GiftedSubscriptionsEvent$|LuckyUsersWhoGotGiftSubscriptionsEvent$/.test(ev)){giftEvent(d||{});return}
  if(/StreamHostEvent$|ChannelHostedEvent$|RaidEvent$/i.test(ev)){raidEvent(d||{});return}
  if(!/ChatMessageEvent$/.test(ev))return;
  if(!d||!d.sender)return;
  var badges=((d.sender.identity||{}).badges||[]).map(function(b){return b.type});
  var who=d.sender.username||d.sender.slug||"viewer",txt=String(d.content||"").trim(),isMod=badges.indexOf("moderator")>=0||badges.indexOf("broadcaster")>=0;
  if(typeof comMsg==="function")comMsg(who,txt,isMod);
  chatCmd(who,txt,{mod:isMod})}
/* raids (Kick calls them hosts). The name of the event has changed over time, so a few are accepted. */
function raidEvent(d){
  var n=d.host_username||(d.hoster&&(d.hoster.username||d.hoster.slug))||(d.channel&&(d.channel.username||d.channel.slug))||d.username||"",
      c=+d.number_viewers||+d.viewers_count||+d.viewers||0;
  if(seen("r:"+n))return;if(typeof raidAlert==="function")raidAlert(n,c)}
/* subs and gifts. Kick can send the same gift twice under two event names, so repeats within 15s are dropped. */
var SEEN={};
function seen(key){var now=Date.now();for(var k in SEEN)if(now-SEEN[k]>15000)delete SEEN[k];if(SEEN[key])return true;SEEN[key]=now;return false}
function subEvent(d){var u=d.username||(d.user&&d.user.username)||"";if(seen("s:"+u))return;subAlert(u,d.months);if(typeof comSub==="function")comSub(u)}
function giftEvent(d){
  var names=d.gifted_usernames||d.usernames||[],n=names.length||+d.gifted_count||+d.quantity||1,g=d.gifter_username||(d.gifter&&d.gifter.username)||"";
  if(seen("g:"+g+":"+n))return;giftAlert(g,n);if(typeof comGift==="function")comGift(g,n)}
/* Kick sends FollowersUpdated on the channel feed: a new total, usually with the follower's name.
   An unfollow also sends one (followed:false, lower total), so only a real new follow pops an alert. */
function followEvent(d){
  var n=d.followersCount!=null?+d.followersCount:d.followers_count!=null?+d.followers_count:null,
      name=d.username||(d.user&&(d.user.username||d.user.slug))||(d.follower&&d.follower.username)||"",
      up=d.followed===true||(d.followed==null&&n!=null&&FOL.count!=null&&n>FOL.count);
  if(n!=null)followCount(n);
  if(up&&d.followed!==false){followAlert(name);if(typeof comFollow==="function")comFollow(name)}}
/* channel changes from chat: at most one every TUNE_GAP ms. A burst of commands collapses into the
   latest one, so chat spam can't make the player load a pile of videos at once. */
var TUNE_GAP=3000,TQ={last:0,fn:null,user:"",t:0};
function chatTune(user,fn){
  TQ.fn=fn;TQ.user=user;if(TQ.t)return;
  var wait=Math.max(0,TQ.last+TUNE_GAP-Date.now());
  TQ.t=setTimeout(function(){var f=TQ.fn,u=TQ.user;TQ.fn=null;TQ.t=0;TQ.last=Date.now();
    if(!f)return;tunedBy=u;lbCount(u);if(typeof dayAdd==="function")dayAdd("flips");setTimeout(function(){if(tunedBy===u)tunedBy=""},4000);f()},wait)}
function chatRetry(){CHAT.tries++;clearTimeout(CHAT.t);CHAT.t=setTimeout(chatConnect,Math.min(60000,2000*Math.pow(2,Math.min(CHAT.tries,5))))}
function chanFind(q){
  if(!q)return -1;var n=parseInt(q,10);
  if(String(n)===String(q).trim())return CHS.findIndex(function(c){return c.num===n});
  q=String(q).toLowerCase();return CHS.findIndex(function(c){return c.name.toLowerCase().indexOf(q)>=0})}
function chatCmd(user,text,tags){
  var K=KICK;if(text.charAt(0)!=="!")return;
  var parts=text.slice(1).split(/\s+/),cmd=parts[0].toLowerCase(),q=parts.slice(1).join(" ");
  var mod=!!tags.mod;
  if(cmd==="testfollow"){if(mod)followAlert(q||user);return}
  if(cmd==="takeover"){if(mod){if(q&&!TK.on)takeover(q.toLowerCase());else takeoverTest()}return}   /* !takeover explainer / missing / friend ... */
  if(cmd==="testsub"){if(mod)subAlert(q||user,1);return}
  if(cmd==="testgift"){if(mod){var gp=q.split(/\s+/),gn=parseInt(gp[0],10)||10;giftAlert(gp.slice(gn===parseInt(gp[0],10)?1:0).join(" ")||user,gn)}return}
  if(cmd==="startvote"){if(mod)voteStart();return}
  if(cmd==="weather"){if(q)wxRequest(user,q,mod);else if(mod)weatherTest();else osdMsg("USE !weather 78701 OR !weather Austin, TX",4500);return}
  if(cmd==="vote"||cmd==="v"){voteCast(user,parseInt(q,10));return}
  if(typeof comCmd==="function"&&comCmd(user,cmd,q,mod))return;   /* bumps, requests, Z Bucks, mod tests: js/community.js */
  if(!/^(ch|channel|next|up|prev|previous|down|random|spelunk|surf|whatson|fullscreen|fs|watch|guide)$/.test(cmd))return;
  if(K.who==="mods"&&!mod)return;
  var now=Date.now();if(!mod&&now-CHAT.gl<(K.cooldown||10)*1000)return;CHAT.gl=now;
  var cl=$("clast");if(cl){cl.textContent=user.toUpperCase()+": "+text.split(/\s+/).slice(0,2).join(" ");clearTimeout(CHAT.lt);CHAT.lt=setTimeout(function(){cl.textContent=""},8000)}
  if(cmd==="ch"||cmd==="channel"){var j=chanFind(q);if(j>=0)chatTune(user,function(){tune(j)});else osdMsg("NO CHANNEL "+q.toUpperCase())}
  else if(cmd==="next"||cmd==="up")chatTune(user,function(){step(1)});
  else if(cmd==="prev"||cmd==="previous"||cmd==="down")chatTune(user,function(){step(-1)});
  else if(cmd==="random"||cmd==="spelunk")chatTune(user,spelunk);
  else if(cmd==="surf")surf(user);
  else if(cmd==="fullscreen"||cmd==="fs"||cmd==="watch"||cmd==="guide"){
    /* switching the whole layout has its own, longer cooldown (mods skip it) */
    var vc=((typeof EXTRAS!=="undefined"&&EXTRAS.view&&EXTRAS.view.cooldown)||60)*1000;
    if(!mod&&now-(WV.lastSwitch||0)<vc)return;
    var want=cmd==="guide"?"guide":"watch";if(want===(WV.on?"watch":"guide"))return;
    WV.lastSwitch=now;setView(want,user)}
  else if(cmd==="whatson"){
    var k=q?chanFind(q):curCh;if(k<0){tunedBy="";osdMsg("NO CHANNEL "+q.toUpperCase());return}
    var c=CHS[k],p=pos(c,Date.now()),it=c.ord[p.i];tunedBy="";
    showBanner(c,it,"ASKED BY "+user.toUpperCase()+" · ENDS "+fmtT(p.start+it.d*1000),7000)}}
