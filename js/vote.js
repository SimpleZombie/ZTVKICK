/* Viewer's Choice: about once an hour, chat votes between 3 channels with !vote 1/2/3 and the winner plays next.
   Settings: EXTRAS.vote in data/extras.js */
var VOTE={on:false,t:0,opts:[],votes:{},end:0,iv:0};
function voteCfg(){return(typeof EXTRAS!=="undefined"&&EXTRAS.vote)||{on:false}}
function voteSchedule(){
  var S=voteCfg();clearTimeout(VOTE.t);if(!S.on)return;
  var a=(S.minMins||50)*60000,b=Math.max(a,(S.maxMins||70)*60000);
  VOTE.t=setTimeout(function go(){if(VOTE.on||bump.on||(typeof TK!=="undefined"&&TK.on)){VOTE.t=setTimeout(go,20000);return}voteStart()},a+Math.random()*(b-a))}
function voteStart(){
  if(VOTE.on||CHS.length<2)return;
  var pool=CHS.map(function(c,i){return i}).filter(function(i){return i!==curCh}),opts=[];
  while(opts.length<Math.min(3,pool.length)){var j=pool.splice(Math.random()*pool.length|0,1)[0];opts.push(j)}
  VOTE.opts=opts.map(function(k){var c=CHS[k],p=pos(c,Date.now());return{k:k,c:c,t:c.ord[p.i].t}});
  if(typeof WV!=="undefined"&&WV.on)setView("guide");   /* votes sit over the guide */
  VOTE.votes={};VOTE.on=true;VOTE.end=Date.now()+(voteCfg().secs||90)*1000;
  var el=$("vote"),g=document.querySelector(".guide").getBoundingClientRect();
  el.style.left=g.left+"px";el.style.top=g.top+"px";el.style.width=g.width+"px";el.style.height=g.height+"px";
  el.innerHTML='<div class="vh"><b>★ VIEWER\'S CHOICE ★</b><span>TYPE <i>!vote 1</i>, <i>2</i> OR <i>3</i> IN CHAT</span><em id="vtime"></em></div>'+
    '<div class="vopts">'+VOTE.opts.map(function(o,i){return'<div class="vo" id="vo'+i+'"><div class="vn">'+(i+1)+'</div><div class="vt">'+
      '<div class="vc">CH '+o.c.num+' · '+esc(o.c.name)+'</div><div class="vs">'+esc(o.t)+'</div>'+
      '<div class="vbar"><i id="vb'+i+'"></i></div><div class="vcount" id="vk'+i+'">0 VOTES</div></div></div>'}).join("")+'</div>';
  el.hidden=false;el.classList.remove("done");voteDraw();clearInterval(VOTE.iv);VOTE.iv=setInterval(voteTick,250)}
function voteTally(){var n=[0,0,0];for(var u in VOTE.votes)n[VOTE.votes[u]]++;return n}
function voteDraw(){
  var n=voteTally(),tot=n[0]+n[1]+n[2],max=Math.max.apply(null,n);
  VOTE.opts.forEach(function(o,i){var b=$("vb"+i),k=$("vk"+i),box=$("vo"+i);if(!b)return;
    b.style.width=(tot?n[i]/tot*100:0)+"%";k.textContent=n[i]+(n[i]===1?" VOTE":" VOTES")+(tot?" · "+Math.round(n[i]/tot*100)+"%":"");
    box.classList.toggle("lead",tot>0&&n[i]===max)})}
function voteTick(){var s=Math.max(0,Math.ceil((VOTE.end-Date.now())/1000)),t=$("vtime");if(t)t.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");if(s<=0)voteEnd()}
function voteCast(user,n){
  if(!VOTE.on||!(n>=1&&n<=VOTE.opts.length))return;
  VOTE.votes[String(user).toLowerCase()]=n-1;voteDraw()}
function voteEnd(){
  if(!VOTE.on)return;clearInterval(VOTE.iv);
  var n=voteTally(),tot=n[0]+n[1]+n[2],el=$("vote"),h=el.querySelector(".vh");
  if(!tot){h.innerHTML='<b>★ VIEWER\'S CHOICE ★</b><span>NO VOTES... STAYING PUT</span>';el.classList.add("done");
    setTimeout(function(){el.hidden=true;VOTE.on=false;voteSchedule()},4000);return}
  var max=Math.max.apply(null,n),win=[0,1,2].filter(function(i){return i<VOTE.opts.length&&n[i]===max}),w=win[Math.random()*win.length|0],o=VOTE.opts[w];
  h.innerHTML='<b>★ VIEWER\'S CHOICE ★</b><span>WINNER: CH '+o.c.num+' · '+esc(o.c.name)+' WITH '+n[w]+(n[w]===1?' VOTE':' VOTES')+'</span>';
  el.classList.add("done");VOTE.opts.forEach(function(x,i){var b=$("vo"+i);if(b)b.classList.toggle("win",i===w)});
  setTimeout(function(){el.hidden=true;VOTE.on=false;tunedBy="VIEWER'S CHOICE";setTimeout(function(){if(tunedBy==="VIEWER'S CHOICE")tunedBy=""},4000);tune(o.k);voteSchedule()},4500)}
