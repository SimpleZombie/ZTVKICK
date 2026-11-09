/* Watch view: a big picture with the channel's next 12 hours on the side and the show info underneath.
   Chat: !fullscreen (or !watch) switches to it, !guide switches back. Key X toggles it on your PC.
   Settings: EXTRAS.view in data/extras.js */
var WV={on:false,back:0,iv:0};
function viewCfg(){return(typeof EXTRAS!=="undefined"&&EXTRAS.view)||{}}
function hmsW(ms){var s=Math.max(0,Math.round(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+":"+String(m).padStart(2,"0"):m)+":"+String(x).padStart(2,"0")}
function setView(mode,by){
  var on=mode==="watch";if(on===WV.on)return;WV.on=on;document.body.classList.toggle("watch",on);
  clearTimeout(WV.back);clearInterval(WV.iv);
  if(on){wvRender();WV.iv=setInterval(wvTick,1000);
    var m=viewCfg().autoBackMins;if(m===undefined)m=15;if(m>0)WV.back=setTimeout(function(){setView("guide")},m*60000)}
  osdMsg((on?"WATCH VIEW":"GUIDE VIEW")+(by?" · "+String(by).toUpperCase():""),2500)}
function toggleView(by){setView(WV.on?"guide":"watch",by)}
function wvRender(){
  if(!WV.on||!cur)return;var c=cur.c,n=c.ord.length,now=Date.now();
  $("wlogo").src=logoFor(c);$("wname").textContent=c.name;$("wnum").textContent="CH "+pad(c.num);
  $("wdes").textContent=c.desc||"";
  $("wtitle").textContent=cur.it.t;
  $("wdesc").textContent=Math.round(cur.it.d/60)+" min · via archive.org/details/"+cur.it.a;
  /* next 12 hours */
  var i=cur.p.i,s=cur.p.start,end=now+12*3600000,h="",k=0;
  while(s<end&&k<40){var first=k===0,it=first?cur.it:c.ord[i%n];
    h+='<div class="ws'+(first?' now':'')+'"><b>'+(first?"ON NOW":fmtT(s))+'</b><div><span>'+esc(it.t)+'</span><i>'+hmsW(it.d*1000)+'</i>'+
      (first?'<div class="bar"><i id="wsfill"></i></div>':'')+'</div></div>';
    s+=it.d*1000;i++;k++}
  $("wsched").innerHTML=h;
  /* up next under the picture */
  var e=cur.p.start+cur.it.d*1000,a=c.ord[(cur.p.i+1)%n],b=c.ord[(cur.p.i+2)%n],d=c.ord[(cur.p.i+3)%n];
  $("wnext").innerHTML='<em>UP NEXT</em>'+[[e,a],[e+a.d*1000,b],[e+(a.d+b.d)*1000,d]].map(function(x){return'<span><b>'+fmtT(x[0])+'</b> '+esc(x[1].t)+'</span>'}).join("");
  wvTick()}
function wvTick(){
  if(!WV.on||!cur)return;var tot=cur.it.d*1000,el=Math.max(0,Math.min(tot,Date.now()-cur.p.start)),pct=el/tot*100+"%";
  $("wel").textContent=hmsW(el);$("wleft").textContent=hmsW(tot-el);$("wfill").style.width=pct;var f=$("wsfill");if(f)f.style.width=pct}
function viewInit(){
  var _p=panels;panels=function(){_p.apply(this,arguments);wvRender()};
  if(viewCfg().start==="watch")setView("watch")}
