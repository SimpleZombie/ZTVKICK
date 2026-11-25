/* ZTV: schedule, guide, player and keys. Data lives in data/, icons in js/icons.js. */
var EPOCH=Date.UTC(2026,0,1),KEY="ztv.orig.v1",WIN=7200000;
var DEF="https://archive.org/details/chuck-e-cheeses-university-training-1991-full-training | Chuck E. Cheese\u2019s University Training (1991) | 104\nhttps://archive.org/details/lily-cat-1987-orion-streamline-vhs | Lily C.A.T. (1987) | 74\nhttps://archive.org/details/CC709_buyers_guide | Holiday Buyers Guide (1989) | 28";
var CHS=[],curCh=0,curId="",cur=null,curKey="",rc={},lastR=0,raf=0,stT=0,AC=null,muteHint=false,buf="",bufT=0,mainReady=null,tunedBy="";
var v=document.getElementById("tv");
function $(i){return document.getElementById(i)}
function pad(n){return String(n).padStart(2,"0")}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
/* schedule times are always Central, wherever the page runs */
var CT_FMT=new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",hour:"numeric",minute:"2-digit"});
function fmtT(ms){return CT_FMT.format(new Date(ms)).replace(/\u202f|\u00a0/g," ")}
function hms(ms){var t=Math.max(0,Math.floor(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return(h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0")}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry(a){return function(){a=a+1831565813|0;var t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296}}
function getOrig(){try{var r=localStorage.getItem(KEY);if(r!==null)return r}catch(e){}return DEF}
function parseOrig(txt){return txt.split("\n").map(function(l){var p=l.split("|"),m=(p[0]||"").match(/archive\.org\/(?:details|embed|download)\/([^\/?#\s]+)/);if(!m)return null;return{a:m[1],t:(p[1]||"").trim()||m[1],d:Math.max(1,parseInt(p[2],10)||30)*60}}).filter(Boolean)}
/* shows for a channel: data/catalog.js plus anything server/fill-catalog.py found (data/catalog-extra.js, kept on the server) */
function catFor(id){var a=(CATALOG[id]||[]).slice(),X=typeof CATALOG_EXTRA!=="undefined"?CATALOG_EXTRA[id]||[]:[],seen={},
  K=typeof CATALOG_SKIP!=="undefined"?CATALOG_SKIP:{};   /* shows server/check-videos.py found gone or broken */
  a.forEach(function(r){seen[r[0]]=1});X.forEach(function(r){if(!seen[r[0]]){seen[r[0]]=1;a.push(r)}});
  return a.filter(function(r){return !K[r[0]]})}
function build(){
  var L=CHANNELS.map(function(c){return{id:c.id,name:c.name,num:c.num,color:c.color,desc:c.desc,items:c.id==="ztv"?parseOrig(getOrig()):catFor(c.id).map(function(r){return{a:r[0],t:r[1],d:r[2]}})}}).filter(function(c){return c.items.length});
  L.sort(function(a,b){return a.num-b.num});
  L.forEach(function(c){var a=c.items.slice();
    if(c.id!=="ztv"){var rnd=mulberry(hash(c.id));for(var i=a.length-1;i>0;i--){var j=rnd()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t}}
    c.ord=a;c.st=[];var s=0;a.forEach(function(x){c.st.push(s);s+=x.d});c.total=s});
  CHS=L}
function pos(c,t){var off=(((t-EPOCH)/1000)%c.total+c.total)%c.total,lo=0,hi=c.st.length-1;while(lo<hi){var m=(lo+hi+1)>>1;if(c.st[m]<=off)lo=m;else hi=m-1}return{i:lo,start:t-(off-c.st[lo])*1000}}
function progs(c,ws,we){var p=pos(c,ws),i=p.i,s=p.start,out=[],n=c.ord.length;while(s<we&&out.length<14){var it=c.ord[i%n];out.push({it:it,s:s,e:s+it.d*1000});s+=it.d*1000;i++}return out}
/* the channel blurb on screen is just its first sentence; the full text stays in the data and !guide */
function firstLine(t){var m=String(t).match(/^.*?[.!?](\s|$)/);return (m?m[0]:t).trim()}
function renderGuide(){
  var now=Date.now(),ws=Math.floor(now/1800000)*1800000,we=ws+WIN,h="",pin="";lastR=now;
  for(var i=0;i<4;i++)$("t"+i).textContent=fmtT(ws+i*1800000);
  CHS.forEach(function(c,k){var cells="";
    progs(c,ws,we).forEach(function(p){var l=Math.max(p.s,ws),r=Math.min(p.e,we),w=(r-l)/WIN*100;if(w<1.5)return;
      cells+='<div class="pc'+(p.s<=now&&now<p.e?' now':'')+'" style="left:'+((l-ws)/WIN*100)+'%;width:'+w+'%">'+esc(p.it.t)+'</div>'});
    var row='<div class="row pr'+(k===curCh?' tuned':'')+'" onclick="tune('+k+')"><div class="c chan"><i>'+pad(c.num)+'</i><img class="lg ztv-channel-icon" alt="" loading="lazy" decoding="async" src="'+logoFor(c)+'"><span class="cn">'+esc(c.name)+'</span></div><div class="progs">'+cells+'</div></div>';
    if(k===curCh)pin=row;else h+=row});   /* the tuned channel stays pinned above the scrolling rows */
  var pe=$("pin");if(pe)pe.innerHTML=pin;
  var sc=$("rows");sc.className="scroll anim";sc.style.animationDuration=Math.max(60,CHS.length*3)+"s";sc.innerHTML=h+h}
function hiss(ms){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();
  var n=AC.sampleRate*ms/1000|0,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*.25;
  var s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;g.gain.value=AUD.muted?0:.12*Math.min(1,AUD.vol/.8);s.connect(g);g.connect(AC.destination);s.start()}catch(e){}}
function staticOn(ms,label){
  var c=$("static"),x=c.getContext("2d"),w=c.width=192,h=c.height=108,img=x.createImageData(w,h),o=$("osd");
  c.style.display="block";o.textContent=label||"";o.style.display=label?"block":"none";cancelAnimationFrame(raf);
  (function f(){var d=img.data;for(var i=0;i<d.length;i+=4){var q=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=q;d[i+3]=255}x.putImageData(img,0,0);raf=requestAnimationFrame(f)})();
  hiss(ms);clearTimeout(stT);stT=setTimeout(function(){cancelAnimationFrame(raf);c.style.display="none";o.style.display="none"},ms)}
function channelZap(label){
  var o=$("osd");v.classList.remove("channel-zap");void v.offsetWidth;v.classList.add("channel-zap");
  staticOn(820,label);setTimeout(function(){v.classList.remove("channel-zap")},850);
}
function resolve(id,dur){if(rc[id])return rc[id];
  var P=(typeof EXTRAS!=="undefined"&&EXTRAS.playback)||{},light=dur&&dur>=(P.lightOverMins||60)*60;
  return rc[id]=fetch("https://archive.org/metadata/"+encodeURIComponent(id)).then(function(r){return r.json()}).then(function(m){
    var f=m.files||[],pref=light?["512Kb MPEG4","h.264 IA","h.264","MPEG4"]:["h.264 IA","h.264","512Kb MPEG4","MPEG4"],x=null;   /* long shows: lighter copy first, buffers less */
    for(var i=0;i<pref.length&&!x;i++)x=f.filter(function(y){return y.format===pref[i]})[0];
    if(!x)x=f.filter(function(y){return /\.mp4$/i.test(y.name)})[0];
    if(!x)throw new Error("no file");
    return"https://archive.org/download/"+id+"/"+encodeURIComponent(x.name)}).catch(function(e){delete rc[id];throw e})}
function fail(key){if(key!==curKey)return;var c=CHS[curCh];staticOn(3500,"NO SIGNAL \u00b7 CH "+pad(c.num));setTimeout(function(){if(key===curKey)spelunk()},3600)}
function playMain(){var pr=v.play();if(pr&&pr.catch)pr.catch(function(e){
  if(!e||e.name!=="NotAllowedError")return;   /* interrupted by a channel change etc: not a sound problem, never mute for it */
  v.muted=true;muteHint=true;v.play().catch(function(){});
  if(/[?&]bc=1/.test(location.search))setTimeout(sndOn,1500);   /* the server can't click: try sound again by itself */
  else osdMsg("CLICK OR PRESS ANY KEY FOR SOUND",6000)})}
function startMain(k){
  resolve(cur.it.a,cur.it.d).then(function(url){if(k!==curKey)return;var p=cur.p;
    v.onloadedmetadata=function(){if(k!==curKey)return;
      if(bump.on){v.currentTime=0;v.pause();mainReady=playMain}   /* a bumper is on: the show starts from the top when it ends */
      else{var o=(Date.now()-p.start)/1000;v.currentTime=Math.max(0,Math.min(o,(v.duration||o+1)-1));playMain()}};
    try{v.pause();v.removeAttribute("src");v.load()}catch(e){}   /* let go of the old video before loading the next */
    v.src=url}).catch(function(){fail(k)})}
function wire(){v.onerror=function(){if(v.getAttribute("src"))fail(curKey)}}
function load(){
  var c=CHS[curCh];if(!c)return;var now=Date.now(),R=typeof reqNow==="function"?reqNow(now):null,p,it,key;
  if(R){var n=c.ord.length;p={i:(pos(c,R.end).i-1+n)%n,start:R.start};it=R.it;key="req:"+R.id}   /* a viewer request is playing */
  else{p=pos(c,now);it=c.ord[p.i];key=c.id+":"+p.i+":"+p.start}
  if(key===curKey)return;
  var natural=curKey!=="";curKey=key;cur={c:c,p:p,it:it,req:R};var k=key;mainReady=null;endBump(true);hideBanner();
  panels();
  if(typeof tickerSet==="function")tickerSet();
  var b=natural?pickBumper():null,by=R?"REQUESTED BY "+String(R.by).toUpperCase():tunedBy?"TUNED BY "+tunedBy.toUpperCase():"";tunedBy="";
  if(b){v.pause();playBump(b,bumpCtx(),function(){if(k!==curKey)return;if(mainReady){var f=mainReady;mainReady=null;f()}showBanner(c,cur.it,by)})}
  else{channelZap("CH "+pad(c.num)+" / "+c.name);setTimeout(function(){if(k===curKey)showBanner(c,cur.it,by)},800)}
  startMain(k)}
function sndOn(){if(muteHint){muteHint=false;v.muted=AUD.muted;if(!AUD.muted)osdMsg("SOUND ON",1200)}}
["click","pointerdown","keydown","touchstart"].forEach(function(e){document.addEventListener(e,sndOn,true)});
function prog(){if(!cur)return;var now=Date.now(),tot=cur.it.d*1000,el=Math.max(0,Math.min(tot,now-cur.p.start));
  $("el").textContent=hms(el);$("fill").style.width=(el/tot*100)+"%";$("ncount").textContent=hms(tot-el)}
function panels(){if(!cur)return;var c=cur.c,n=c.ord.length,i=cur.p.i,end=cur.p.start+cur.it.d*1000,a=c.ord[(i+1)%n],b=c.ord[(i+2)%n];
  $("ichan").textContent=c.name;$("inum").textContent="CH "+pad(c.num);$("chn").textContent="CH "+pad(c.num);
  $("ides").textContent=c.desc?firstLine(c.desc):(Math.round(c.total/3600)+" hours of programming");$("ilogo").src=logoFor(c);
  $("ntitle").textContent=cur.it.t;$("ndesc").textContent=Math.round(cur.it.d/60)+" min";
  $("u1t").textContent=fmtT(end);$("u1").textContent=a.t;$("u2t").textContent=fmtT(end+a.d*1000);$("u2").textContent=b.t;prog()}
function tune(k){if(k<0||k>=CHS.length)return;curCh=k;curId=CHS[k].id;curKey="";renderGuide();load()}
function step(d){tune((curCh+d+CHS.length)%CHS.length)}
function spelunk(){var k=0;do{k=Math.random()*CHS.length|0}while(k===curCh&&CHS.length>1);tune(k)}
/* top-right clock: cycles through these time zones like a news channel. Edit the list or set CLOCK_SECS. */
var CLOCK_ZONES=["America/Chicago","America/New_York","America/Denver","America/Los_Angeles"],CLOCK_SECS=10;
function clockZone(d){var z=CLOCK_ZONES[Math.floor(d/1000/CLOCK_SECS)%CLOCK_ZONES.length];
  try{var t=d.toLocaleTimeString("en-US",{timeZone:z,hour:"numeric",minute:"2-digit"}),
    ab=(d.toLocaleTimeString("en-US",{timeZone:z,timeZoneName:"short"}).split(" ").pop()),
    dt=d.toLocaleDateString("en-US",{timeZone:z,weekday:"short",month:"short",day:"numeric"}).toUpperCase();
    return{t:t,ab:ab,dt:dt}}catch(e){return{t:fmtT(d),ab:"",dt:""}}}
function tick(){var d=new Date(),c=clockZone(d);
  var tz=$("tz");if(tz.textContent!==c.ab){tz.textContent=c.ab;var ck=tz.parentNode.parentNode;ck.classList.remove("flip");void ck.offsetWidth;ck.classList.add("flip")}
  $("time").textContent=c.t;$("date").textContent=c.dt;
  if(cur)prog();
  load();if(typeof tickerSet==="function")tickerSet();if(Date.now()-lastR>30000)renderGuide()}
function toggleEd(){var e=$("ed");e.hidden=!e.hidden;if(!e.hidden)$("orig").value=getOrig()}
function rebuild(){build();var k=CHS.findIndex(function(c){return c.id===curId});if(k<0)k=0;curCh=k;renderGuide();if(CHS[k].id!==curId){curId=CHS[k].id;curKey="";load()}}
function saveOrig(){try{localStorage.setItem(KEY,$("orig").value)}catch(e){}rebuild()}
function resetOrig(){try{localStorage.removeItem(KEY)}catch(e){}$("orig").value=DEF;rebuild()}
document.addEventListener("keydown",function(e){var t=e.target.tagName;if(t==="INPUT"||t==="TEXTAREA"||e.ctrlKey||e.metaKey||e.altKey)return;var k=e.key.toLowerCase();if(k==="b"){bumpTest();return}if(k==="a"){adBreak();return}if(k==="d"){deadAir();return}if(k==="o"){signOff();return}if(k==="i"){signOn();return}if(k==="k"){recapShow();return}if(k==="j"){raidAlert("NIGHTSHAMBLER",42);return}if(k==="z"){zombieAlert();return}if(k==="y"){textBump({user:"braineater99",text:"i left the tv on for you"});return}if(k==="c"){chatPeek();return}if(k==="t"){takeoverTest();return}if(k==="x"){toggleView();return}if(k==="u"){subAlert(["BRAINEATER99","VHS_GHOUL"][Math.random()*2|0],Math.random()<.5?1:6);return}if(k==="g"){giftAlert("NIGHTSHAMBLER",Math.random()<.5?2:20);return}if(k==="v"){voteStart();return}if(k==="l"){weatherTest();return}if(k==="f"){followAlert(["BRAINEATER99","VHS_GHOUL","NIGHTSHAMBLER"][Math.random()*3|0]);return}if(k.length===1&&"+=-_m".indexOf(k)>=0){audKey(k);return}
  if(k==="e")toggleEd();else if(k==="escape")$("ed").hidden=true;
  else if(k==="arrowup"||k==="w"||k==="n"){e.preventDefault();step(1)}
  else if(k==="arrowdown"||k==="s"||k==="p"){e.preventDefault();step(-1)}
  else if(k==="r")spelunk();
  else if(/^[0-9]$/.test(k)){buf=(buf+k).slice(-3);var o=$("osd");o.textContent="CH "+buf;o.style.display="block";clearTimeout(bufT);
    bufT=setTimeout(function(){var n=parseInt(buf,10),j=CHS.findIndex(function(c){return c.num===n});buf="";o.style.display="none";if(j>=0)tune(j);else staticOn(1500,"NO SIGNAL")},1200)}});
build();wire();bufInit();viewInit();audApply();$("bumpl").innerHTML=document.querySelector(".mark").outerHTML;curCh=Math.random()*CHS.length|0;curId=CHS[curCh].id;tick();setInterval(tick,1000);tune(curCh);chatStart();tkSchedule();voteSchedule();wxSchedule();segInit();
/* on the 24/7 server (?bc=1): tell the server every 10s that the page is alive. If these stop, the server reopens Chrome. */
if(/[?&]bc=1/.test(location.search))setInterval(function(){try{fetch("/hb?"+Date.now(),{cache:"no-store"}).catch(function(){})}catch(e){}},10000);

/* Weather desk queue: wait for an idle break in regular programming. */
setInterval(function(){if(typeof wxRequestNext==="function")wxRequestNext()},5000);
