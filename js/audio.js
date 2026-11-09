/* ZTV volume. + and - change it, M mutes. The setting is remembered in the browser. */
var AUD={vol:.8,muted:false};
try{var sv=parseFloat(localStorage.getItem("ztv.vol"));if(sv>=0&&sv<=1)AUD.vol=sv}catch(e){}
function audSave(){try{localStorage.setItem("ztv.vol",AUD.vol)}catch(e){}}
function audApply(){v.volume=AUD.vol;v.muted=AUD.muted}
if(/[?&]bc=1/.test(location.search))setInterval(function(){
  if(TK.on||bump.on||AUD.muted)return;if(muteHint)sndOn();if(v.muted)v.muted=false;if(v.volume<AUD.vol-.01)v.volume=AUD.vol},20000);
function audKey(k){
  if(k==="+"||k==="="){AUD.vol=Math.min(1,AUD.vol+.05);audSave();audApply();osdMsg("VOL "+Math.round(AUD.vol*100)+"%")}
  else if(k==="-"||k==="_"){AUD.vol=Math.max(0,AUD.vol-.05);audSave();audApply();osdMsg("VOL "+Math.round(AUD.vol*100)+"%")}
  else if(k==="m"){AUD.muted=!AUD.muted;audApply();osdMsg(AUD.muted?"MUTED":"VOL "+Math.round(AUD.vol*100)+"%")}}
