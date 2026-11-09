/* Buffering stinger + stall recovery for the main video.
   When the show stops to buffer, a "recalibrating antenna" card covers the TV until it plays again.
   If a playing show freezes for 20s (or one that hasn't started yet takes over 45s), reconnect at the right spot. After 3 tries in a row, change the channel. */
var BUF={t:0,msg:0,stuck:0,tries:0,key:"",shown:false,last:0};
var BUF_LINES=["RECALIBRATING ANTENNA","ADJUSTING THE RABBIT EARS","REBUFFERING...","DIALING UP THE INTERNET ARCHIVE",
  "BLOWING ON THE CARTRIDGE","ADJUSTING TRACKING","WRAPPING ANTENNA IN TIN FOIL","WAITING FOR MOM TO GET OFF THE PHONE",
  "REWINDING... BE KIND","HANG ON, THE TAPE GOT CHEWED","SMACKING THE SIDE OF THE TV","PLEASE STAND BY"];
function bufBuild(){
  var el=document.createElement("div");el.id="buf";el.hidden=true;
  el.innerHTML='<svg class="bufant" viewBox="0 0 40 40" shape-rendering="crispEdges">'+
    '<g class="bufears"><rect class="earL" x="19" y="4" width="2" height="15" fill="#cfe6ca"/><rect class="earR" x="19" y="4" width="2" height="15" fill="#cfe6ca"/></g>'+
    '<rect x="17" y="18" width="6" height="3" fill="#cfe6ca"/>'+
    '<rect x="6" y="20" width="28" height="16" fill="#1b2a1d" stroke="#53fc18" stroke-width="1.5"/>'+
    '<rect x="9" y="23" width="18" height="10" fill="#000"/><rect class="bufsnow" x="9" y="23" width="18" height="10" fill="#53fc18" opacity=".25"/>'+
    '<rect x="29" y="24" width="3" height="2" fill="#53fc18"/><rect x="29" y="28" width="3" height="2" fill="#2b5a22"/></svg>'+
    '<div class="bufbars"><i></i><i></i><i></i><i></i><i></i></div>'+
    '<div class="bufmsg" id="bufmsg">'+BUF_LINES[0]+'</div><div class="bufdots">SIGNAL <span id="bufpct">0</span>%</div>';
  document.querySelector(".screen").appendChild(el)}
function bufShow(){
  if(BUF.shown||bump.on||!v.getAttribute("src"))return;BUF.shown=true;var el=$("buf");if(!el)return;
  BUF.msg=Math.random()*BUF_LINES.length|0;$("bufmsg").textContent=BUF_LINES[BUF.msg];el.hidden=false;
  clearInterval(BUF.iv);var n=0;BUF.iv=setInterval(function(){n++;
    if(n%5===0){BUF.msg=(BUF.msg+1)%BUF_LINES.length;$("bufmsg").textContent=BUF_LINES[BUF.msg]}
    var b=v.buffered,ahead=0;try{for(var i=0;i<b.length;i++)if(b.start(i)<=v.currentTime&&b.end(i)>=v.currentTime)ahead=b.end(i)-v.currentTime}catch(e){}
    $("bufpct").textContent=Math.min(99,Math.round(ahead/4*100))},450)}
function bufHide(){if(!BUF.shown)return;BUF.shown=false;clearInterval(BUF.iv);var el=$("buf");if(el)el.hidden=true}
/* every half second: is the picture actually moving? Chrome doesn't always announce a stall, so don't rely on it. */
function bufPoll(){
  var now=Date.now();
  if(BUF.key!==curKey){BUF.key=curKey;BUF.tries=0;BUF.since=now;BUF.last=-1;BUF.played=false}
  /* paused on purpose (e.g. waiting behind a bumper) is fine; paused because it hasn't loaded yet counts as loading */
  if(!v.getAttribute("src")||v.ended||bump.on||(v.paused&&v.readyState>=2)){BUF.since=now;BUF.last=v.currentTime;if(BUF.shown)bufHide();return}
  if(v.currentTime!==BUF.last){if(BUF.last>=0&&v.readyState>=2)BUF.played=true;BUF.last=v.currentTime;BUF.since=now;if(BUF.shown)bufHide();
    if(BUF.tries&&now-BUF.fixed>20000)BUF.tries=0;return}
  var stuck=now-BUF.since;
  if(stuck>1200&&!BUF.shown)bufShow();
  /* a show that hasn't started yet gets a long time to load (archive.org can be slow to start, especially
     from far away); a show that was playing and froze gets reconnected sooner */
  var limit=BUF.played?20000:45000;
  if(stuck>limit&&now-(BUF.fixed||0)>limit)bufRecover()}
function bufRecover(){
  var k=curKey,p=cur&&cur.p,url=v.currentSrc||v.src;if(!url||!p)return;
  BUF.tries++;BUF.fixed=Date.now();BUF.since=Date.now();
  if(BUF.tries>3){bufHide();BUF.tries=0;fail(k);return}
  /* reconnect: archive.org sometimes leaves a connection hanging. Reload the same file at the right spot. */
  v.onloadedmetadata=function(){if(k!==curKey)return;var o=(Date.now()-p.start)/1000;v.currentTime=Math.max(0,Math.min(o,(v.duration||o+1)-1));playMain()};
  try{v.pause();v.removeAttribute("src");v.load()}catch(e){}
  v.src=url;playMain()}
function bufInit(){
  bufBuild();BUF.since=Date.now();setInterval(bufPoll,500)}
