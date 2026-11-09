/* ZTV Picture This: photo takeovers (words and searches in data/photos.js).
   Finds public domain photos on Wikimedia Commons, preloads one, then plays it with captions through the segment runner.
   If Commons can't be reached it quietly plays a different takeover instead. */
var PH={cache:{},recentTopic:[],recentImg:[]};
function phOK(ii){
  var m=(ii&&ii.extmetadata)||{},lic=String((m.LicenseShortName||{}).value||""),mime=String(ii.mime||"");
  return /^image\/(jpeg|png)$/.test(mime)&&/public domain|^pd\b|^pd-|cc0/i.test(lic)&&(ii.width||0)>=800&&(ii.width||0)>=(ii.height||0)*.9}
function phList(q){
  var c=PH.cache[q];if(c&&Date.now()-c.t<6*3600000)return Promise.resolve(c.list);
  var u="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=50"+
    "&gsrsearch="+encodeURIComponent(q+" filetype:bitmap")+"&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=1280"+
    "&iiextmetadatafilter=LicenseShortName|Artist";
  return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
    var pages=(j.query&&j.query.pages)||{},list=[];
    Object.keys(pages).forEach(function(k){var p=pages[k],ii=p.imageinfo&&p.imageinfo[0];if(!ii||!phOK(ii))return;
      if(/logo|map|diagram|chart|plan|scheme|icon|coat of arms|flag/i.test(p.title))return;
      list.push({url:ii.thumburl||ii.url,title:String(p.title).replace(/^File:/,"").replace(/\.\w+$/,"")})});
    PH.cache[q]={t:Date.now(),list:list};return list})}
function tkPhoto(done){
  if(typeof PHOTO_BUMPS==="undefined"||!PHOTO_BUMPS.length){if(done)done();return}
  var pool=PHOTO_BUMPS.filter(function(b){return PH.recentTopic.indexOf(b.search)<0});if(!pool.length)pool=PHOTO_BUMPS;
  var B=pool[Math.random()*pool.length|0];PH.recentTopic.push(B.search);PH.recentTopic=PH.recentTopic.slice(-Math.min(6,PHOTO_BUMPS.length-1));
  var fallback=function(){if(typeof tkFriend==="function")tkFriend(done);else if(done)done()};
  phList(B.search).then(function(list){
    var fresh=list.filter(function(x){return PH.recentImg.indexOf(x.url)<0});if(!fresh.length)fresh=list;
    if(!fresh.length)throw 0;
    var P=fresh[Math.random()*Math.min(fresh.length,20)|0];PH.recentImg.push(P.url);PH.recentImg=PH.recentImg.slice(-40);
    return new Promise(function(ok,no){var im=new Image();im.onload=function(){ok(P)};im.onerror=no;im.src=P.url;setTimeout(no,15000)})
  }).then(function(P){
    var lines=B.sets[Math.random()*B.sets.length|0],bg='<div class="ph-img" style="background-image:url(\''+String(P.url).replace(/'/g,"%27")+'\')"></div>',
        credit='<div class="ph-credit">public domain photo &middot; wikimedia commons</div>';
    var scenes=lines.map(function(t,k){return{ms:Math.min(5600,2600+t.length*55),
      html:'<div class="sg sg-ph">'+bg+'<div class="ph-band"><div class="ph-kick">'+esc(B.kicker)+'</div><div class="ph-cap">'+esc(t)+'</div></div>'+credit+'</div>'}});
    scenes.push({ms:1800,html:'<div class="sg sg-ph">'+bg+'<div class="ph-band"><div class="ph-cap mk">[ztv]</div></div>'+credit+'</div>'});
    segRun({cutIn:true,sound:function(){return AUD.muted?null:segPad(.02)},scenes:scenes,done:done});
  }).catch(fallback)}
if(typeof TK_SEQ!=="undefined")TK_SEQ.photo=tkPhoto;
