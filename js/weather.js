/* Z Weather: a retro full-screen forecast break. Each time it picks random cities and rotates through them:
   Current Conditions, then the Extended Forecast, for each one. Smooth jazz underneath.
   Forecast from Open-Meteo (free, no key). Settings: EXTRAS.weather in data/extras.js */
var WX={t:0,on:false,music:null,timers:[],recent:[],news:[],newsAt:0};
function wxCfg(){return(typeof EXTRAS!=="undefined"&&EXTRAS.weather)||{on:false}}
var WX_PLACES=[
 ["Atlanta Metro",33.749,-84.388],["Boise",43.615,-116.202],["Chicago",41.878,-87.630],["Denver",39.739,-104.990],["Seattle",47.606,-122.332],
 ["Portland, OR",45.515,-122.679],["Miami",25.762,-80.192],["New Orleans",29.951,-90.072],["Phoenix",33.448,-112.074],["Las Vegas",36.170,-115.140],
 ["Salt Lake City",40.761,-111.891],["Minneapolis",44.978,-93.265],["Detroit",42.331,-83.046],["Cleveland",41.499,-81.694],["Pittsburgh",40.441,-79.996],
 ["Boston",42.360,-71.059],["New York City",40.713,-74.006],["Philadelphia",39.953,-75.165],["Washington, DC",38.907,-77.037],["Nashville",36.163,-86.781],
 ["Memphis",35.150,-90.049],["St. Louis",38.627,-90.199],["Kansas City",39.100,-94.579],["Omaha",41.257,-95.935],["Oklahoma City",35.468,-97.516],
 ["Dallas/Ft. Worth",32.777,-96.797],["Houston",29.760,-95.370],["San Antonio",29.424,-98.494],["Austin",30.267,-97.743],["El Paso",31.762,-106.485],
 ["Albuquerque",35.084,-106.650],["Tucson",32.222,-110.975],["San Diego",32.716,-117.161],["Los Angeles",34.052,-118.244],["San Francisco",37.775,-122.419],
 ["Sacramento",38.582,-121.494],["Anchorage",61.218,-149.900],["Honolulu",21.307,-157.858],["Fargo",46.877,-96.790],["Des Moines",41.587,-93.625],
 ["Milwaukee",43.039,-87.906],["Indianapolis",39.768,-86.158],["Louisville",38.253,-85.759],["Charlotte",35.227,-80.843],["Raleigh/Durham",35.780,-78.639],
 ["Buffalo",42.886,-78.878],["Burlington, VT",44.476,-73.212],["Portland, ME",43.659,-70.257],["Duluth",46.787,-92.100],["Spokane",47.659,-117.426],
 ["Billings",45.783,-108.501],["Cheyenne",41.140,-104.820],["Santa Fe",35.687,-105.938],["Amarillo",35.222,-101.831],
 ["Roswell, NM",33.394,-104.523],["Salem, MA",42.519,-70.897],["Point Pleasant, WV",38.845,-82.137],["Sleepy Hollow, NY",41.086,-73.858]];
var WX_WORLD=[
 ["Tokyo, Japan",35.676,139.650],["Osaka, Japan",34.694,135.502],["Kyoto, Japan",35.012,135.768],["Sapporo, Japan",43.062,141.354],
 ["Naha, Okinawa",26.212,127.681],["Hiroshima, Japan",34.385,132.455],["Seoul, Korea",37.567,126.978],["Hong Kong",22.320,114.169],
 ["Taipei, Taiwan",25.033,121.565],["Bangkok, Thailand",13.756,100.502],["Singapore",1.352,103.820],["Manila, Philippines",14.600,120.984],
 ["Sydney, Australia",-33.869,151.209],["Melbourne, Australia",-37.814,144.963],["Auckland, NZ",-36.849,174.763],
 ["London, UK",51.507,-0.128],["Paris, France",48.857,2.352],["Berlin, Germany",52.520,13.405],["Amsterdam",52.368,4.904],
 ["Rome, Italy",41.903,12.496],["Madrid, Spain",40.417,-3.704],["Dublin, Ireland",53.350,-6.260],["Reykjavik, Iceland",64.147,-21.942],
 ["Oslo, Norway",59.914,10.752],["Stockholm, Sweden",59.329,18.069],["Helsinki, Finland",60.170,24.938],["Prague, Czechia",50.076,14.438],
 ["Dubai, UAE",25.205,55.271],["Cairo, Egypt",30.044,31.236],["Cape Town, S. Africa",-33.925,18.424],["Nairobi, Kenya",-1.292,36.822],
 ["Mexico City",19.433,-99.133],["Toronto, Canada",43.651,-79.383],["Vancouver, Canada",49.283,-123.121],["Montreal, Canada",45.502,-73.567],
 ["Rio de Janeiro",-22.907,-43.173],["Buenos Aires",-34.604,-58.382],["Lima, Peru",-12.046,-77.043],
 ["Transylvania, Romania",45.643,25.589],["Loch Ness, Scotland",57.322,-4.424],["Whitby, England",54.486,-0.615],["McMurdo, Antarctica",-77.846,166.676]];
function wxList(){var S=wxCfg();if(S.places&&S.places.length)return S.places;
  var r=S.regions||["us","world"];return(r.indexOf("us")>=0?WX_PLACES:[]).concat(r.indexOf("world")>=0?WX_WORLD:[])}
function wxSchedule(){
  var S=wxCfg();clearTimeout(WX.t);if(!S.on)return;
  var a=(S.minMins||40)*60000,b=Math.max(a,(S.maxMins||70)*60000);
  WX.t=setTimeout(function go(){if(TK.on||bump.on||(typeof VOTE!=="undefined"&&VOTE.on)){WX.t=setTimeout(go,20000);return}weatherBreak()},a+Math.random()*(b-a))}
function wxPickPlaces(n){
  var list=wxList().slice(),out=[];if(!list.length)list=WX_PLACES.slice();
  var fresh=list.filter(function(p){return WX.recent.indexOf(p[0])<0});if(fresh.length>=n)list=fresh;
  while(out.length<Math.min(n,list.length))out.push(list.splice(Math.random()*list.length|0,1)[0]);
  out.forEach(function(p){WX.recent.push(p[0])});WX.recent=WX.recent.slice(-12);return out}
function wxFetch(places){
  var u="https://api.open-meteo.com/v1/forecast?latitude="+places.map(function(p){return p[1]}).join(",")+"&longitude="+places.map(function(p){return p[2]}).join(",")+
    "&current=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,pressure_msl,is_day"+
    "&hourly=pressure_msl&past_hours=3&forecast_hours=1"+
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset"+
    "&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=6";
  return fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
    var arr=Array.isArray(j)?j:[j];if(!arr.length||!arr[0].current||!arr[0].daily)throw 0;return arr})}
/* Viewer Weather Desk. Resolve on demand, then queue without interrupting programming. */
var WX_REQUEST={queue:[],users:{},global:0,resolving:0,max:4};
function wxResolve(query){
  query=String(query||"").trim().replace(/\s+/g," ");
  if(!query||query.length>90)return Promise.reject(Error("Invalid location"));
  var zip=query.match(/^(?:US[ -]?)?(\d{5})(?:-\d{4})?$/i);
  if(zip){return fetch("https://api.zippopotam.us/us/"+zip[1]).then(function(r){if(!r.ok)throw Error("ZIP not found");return r.json()}).then(function(j){
    var a=j.places&&j.places[0];if(!a)throw Error("ZIP not found");return [a["place name"]+", "+a["state abbreviation"],+a.latitude,+a.longitude]})}
  var city=query,region="";
  if(query.indexOf(",")>=0){var parts=query.split(",");city=parts.shift().trim();region=parts.join(",").trim()}
  return fetch("https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(city)+"&count=10&language=en&format=json").then(function(r){if(!r.ok)throw Error("Geocoding failed");return r.json()}).then(function(j){
    var a=j.results||[];if(!a.length)throw Error("City not found");
    if(region){var x=region.toLowerCase();a.sort(function(l,r){function score(v){return [v.admin1,v.admin1_id,v.country,v.country_code].some(function(t){return String(t||"").toLowerCase()===x})?0:1}return score(l)-score(r)})}
    var v=a[0];return [v.name+(v.admin1?", "+v.admin1:"")+(v.country_code?" / "+v.country_code:""),v.latitude,v.longitude]})
}
function wxRequest(user,query,mod){
  var cfg=wxCfg().requests||{},now=Date.now(),key=String(user||"viewer").toLowerCase();
  if(cfg.on===false)return;
  if(!query){osdMsg("USE !weather 78701 OR !weather Austin, TX",5000);return}
  if(WX_REQUEST.queue.length+WX_REQUEST.resolving>=(cfg.maxQueue||4)){osdMsg("WEATHER REQUEST LINE FULL",4000);return}
  if(!mod&&now-(WX_REQUEST.users[key]||0)<(cfg.perUserMins||10)*60000){osdMsg("WEATHER: PLEASE WAIT BEFORE REQUESTING AGAIN",4000);return}
  if(!mod&&now-WX_REQUEST.global<(cfg.globalSecs||30)*1000){osdMsg("WEATHER DESK: PLEASE WAIT",3500);return}
  WX_REQUEST.users[key]=now;WX_REQUEST.global=now;WX_REQUEST.resolving++;
  wxResolve(query).then(function(place){
    WX_REQUEST.queue.push({place:place,user:String(user||"VIEWER").slice(0,28)});
    osdMsg("ZTV WEATHER DESK: "+place[0].toUpperCase()+" QUEUED",5000);
    wxRequestNext();
  }).catch(function(){delete WX_REQUEST.users[key];osdMsg("WEATHER LOCATION NOT FOUND: TRY CITY, STATE",5000)})
  .then(function(){WX_REQUEST.resolving--})
}
function wxRequestNext(){
  if(!WX_REQUEST.queue.length||WX.on||TK.on||typeof bump!=="undefined"&&bump.on||typeof VOTE!=="undefined"&&VOTE.on)return;
  var r=WX_REQUEST.queue.shift();weatherBreak([r.place],r.user);
}
function wxRequestTest(location){wxRequest("LOCAL TEST",location||"78701",true)}
function wxWord(c,day){
  if(c===0)return day===0?"Clear":"Sunny";if(c===1)return day===0?"Mostly Clear":"Mostly Sunny";if(c===2)return"Partly Cloudy";if(c===3)return"Cloudy";
  if(c===45||c===48)return"Fog";if(c===56||c===57)return"Frz Drizzle";if(c>=51&&c<=55)return"Drizzle";if(c===66||c===67)return"Frz Rain";if(c===65)return"Heavy Rain";
  if(c>=61&&c<=63)return"Rain";if(c===82)return"Heavy Showers";if(c>=80&&c<=81)return"Showers";if(c===77)return"Flurries";if(c===85||c===86)return"Snow Showers";
  if(c>=71&&c<=75)return"Snow";if(c===95)return"T'Storms";if(c>=96)return"Severe T'Storms";return"Fair"}
function wxIcon(c,day,windy){
  var w=wxWord(c,day),sun='<circle cx="32" cy="28" r="12" fill="#ffce45"/><g stroke="#ffce45" stroke-width="3" stroke-linecap="round"><path d="M32 6v6M32 44v6M10 28h6M48 28h6M16 12l4 4M44 40l4 4M16 44l4-4M44 16l4-4"/></g>',
  moon='<path d="M42 10a21 21 0 1 0 12 34A20 20 0 0 1 42 10z" fill="#f3f6ff"/>',
  cloud='<path d="M14 44h36a11 11 0 0 0 0-22 17 17 0 0 0-32-2 12 12 0 0 0-4 24z" fill="#f5f8fc" stroke="#b8c8d8" stroke-width="2"/>',
  rain='<g stroke="#4bb4e8" stroke-width="3.5" stroke-linecap="round"><path d="M23 48l-4 8M35 48l-4 8M47 48l-4 8"/></g>',
  snow='<g stroke="#d9f2ff" stroke-width="2.5" stroke-linecap="round"><path d="M20 49v10m-4-7 8 4m0-4-8 4M39 49v10m-4-7 8 4m0-4-8 4"/></g>',
  thunder='<path d="M35 38 24 53h9l-4 11 15-18h-9l6-8z" fill="#ffce45" stroke="#d59a20" stroke-width="1"/>',
  fog='<g stroke="#e7f0f7" stroke-width="3.5" stroke-linecap="round"><path d="M9 47h46M14 55h36M19 61h27"/></g>',art;
  if(windy)art='<path d="M9 25h34q9 0 9-7t-8-7q-6 0-7 5M9 38h42q7 0 7 7t-8 7q-5 0-6-4" fill="none" stroke="#eaf4fb" stroke-width="4" stroke-linecap="round"/>';
  else if(w==="Sunny"||w==="Clear")art=day===0?moon:sun;
  else if(w.indexOf("Mostly")===0||w==="Partly Cloudy")art=(day===0?moon:sun)+cloud;
  else if(w==="Cloudy")art=cloud;
  else if(w==="Fog")art=cloud+fog;
  else if(/Snow|Flurries/.test(w))art=cloud+snow;
  else if(/Storm/.test(w))art=cloud+thunder+rain;
  else art=cloud+rain;
  return '<svg viewBox="0 0 64 68" class="wxi" role="img" aria-label="'+esc(w)+'">'+art+'</svg>';
}
function wxDir(d){return["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(((d%360)+360)%360/22.5)%16]}
/* Exact weather identity from the previously approved generated artwork. */
function zwxLogo(compact){
  return '<img class="zwx zwx-boxed" src="assets/ztv-weather-boxed.svg" alt="ZTV" decoding="async">';
}


/* ZTV 2.0 weather desk accents. Radar is an atmospheric station graphic, not live precipitation data. */
function wxRadar(){return '<div class="wx-radar" aria-label="Decorative radar sweep"><div class="wx-radar-grid"></div><i class="wx-radar-sweep"></i><b>WX / 02</b><small>RADAR TEST DISPLAY</small></div>'}

/* Weather bulletin: live NWS alerts when available; optional independent RSS news proxy. */
function wxBulletins(place){
  var cfg=wxCfg(),news=[],jobs=[];
  if(cfg.news!==false&&cfg.newsEndpoint){
    jobs.push(fetch(cfg.newsEndpoint,{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
      var a=Array.isArray(j)?j:(j.headlines||j.items||[]);
      a.slice(0,8).forEach(function(x){var t=typeof x==="string"?x:x.title;if(t)news.push("NEWS  /  "+String(t).replace(/<[^>]*>/g,"").slice(0,160))})
    }).catch(function(){}));
  }
  if(place&&place[1]>=24&&place[1]<=50&&place[2]>=-125&&place[2]<=-66){
    jobs.push(fetch("https://api.weather.gov/alerts/active?point="+place[1]+","+place[2],{headers:{Accept:"application/geo+json"}})
    .then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
      (j.features||[]).slice(0,3).forEach(function(a){var q=a.properties||{};if(q.headline)news.unshift("WEATHER ALERT  /  "+q.headline.slice(0,165))})
    }).catch(function(){}));
  }
  return Promise.all(jobs).then(function(){return news.slice(0,10)})
}
function wxTickerStart(el,headlines){
  var items=headlines.length?headlines:["NO ACTIVE WEATHER BULLETINS RETRIEVED  /  ZTV WEATHER DESK","FORECAST DATA PROVIDED BY OPEN-METEO  /  CONDITIONS UPDATED FOR EACH BROADCAST","VIEWER FORECAST  /  TYPE !weather FOLLOWED BY A ZIP CODE OR CITY"];
  var slot=el.querySelector("#wxnews-text"),idx=0;
  if(!slot)return function(){};
  function set(){slot.textContent=items[idx++%items.length]}
  set();var timer=setInterval(set,6800);return function(){clearInterval(timer)};
}
function wxPages(place,j){
  var c=j.current,d=j.daily,R=Math.round,name=place[0],day=c.is_day;
  var dn=function(x){return new Date(x+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"}).toUpperCase()};
  var vis=c.visibility==null?"--":Math.min(10,c.visibility/1609.344).toFixed(0)+" mi";
  var inHg=c.pressure_msl==null?"--":(c.pressure_msl*.02953).toFixed(2)+" in";
  var days=[1,2,3,4,5].filter(function(i){return d.time[i]!=null});
  var stats=[
    ["Humidity",R(c.relative_humidity_2m)+"%"],
    ["Dewpoint",R(c.dew_point_2m)+"°"],
    ["Wind",R(c.wind_speed_10m)<1?"Calm":wxDir(c.wind_direction_10m)+" "+R(c.wind_speed_10m)+" mph"],
    ["Pressure",inHg],["Visibility",vis],
    ["Feels Like",R(c.apparent_temperature)+"°"]
  ];
  var precip=function(i){var v=d.precipitation_probability_max&&d.precipitation_probability_max[i];return v==null?"--":R(v)+"%"};
  var clock=function(v){if(!v)return null;var date=new Date(v);return isNaN(date.getTime())?null:date.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})};
  var rise=clock(d.sunrise&&d.sunrise[0]),set=clock(d.sunset&&d.sunset[0]);
  var astronomy=(rise&&set)?'<div class="wx90-sun"><span>SUNRISE <b>'+esc(rise)+'</b></span><span>SUNSET <b>'+esc(set)+'</b></span></div>':'';
  var forecast=days.map(function(i){return '<div class="wx90-day"><b>'+dn(d.time[i])+'</b>'+wxIcon(d.weather_code[i],1)+
      '<div class="wx90-daytemps"><strong>'+R(d.temperature_2m_max[i])+'°</strong><small>'+R(d.temperature_2m_min[i])+'°</small></div><div class="wx90-rain">RAIN '+precip(i)+'</div></div>'}).join('');
  var combined='<div class="wxp wx90-board"><div class="wx90-current"><div class="wx90-city" title="'+esc(name)+'">'+esc(name)+'</div>'+ 
    '<div class="wx90-main"><div class="wx90-temp">'+R(c.temperature_2m)+'°</div>'+wxIcon(c.weather_code,day)+'</div>'+ 
    '<div class="wx90-condition">'+wxWord(c.weather_code,day)+'</div>'+astronomy+'</div>'+ 
    '<div class="wx90-stats"><div class="wx90-stats-head">RIGHT NOW</div>'+stats.map(function(x){return '<div class="wx90-stat"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>'}).join('')+'</div>'+ 
    '<div class="wx90-five"><div class="wx90-fivehead"><span class="wx90-mini">ZTV</span> 5 Day Forecast</div><div class="wx90-days">'+forecast+'</div></div></div>';
  var periods=[
    ["TODAY",d.weather_code[0],1,"HIGH "+R(d.temperature_2m_max[0])+"°","PRECIP "+precip(0)],
    ["TONIGHT",d.weather_code[0],0,"LOW "+R(d.temperature_2m_min[0])+"°","WIND "+wxDir(c.wind_direction_10m)+" "+R(c.wind_speed_10m)+" MPH"],
    ["TOMORROW",d.weather_code[1],1,"HIGH "+R(d.temperature_2m_max[1])+"° / LOW "+R(d.temperature_2m_min[1])+"°","PRECIP "+precip(1)]
  ];
  var narrative='<div class="wxp wx90-textboard"><div class="wx90-textcity">'+esc(name)+'</div><div class="wx90-periods">'+
    periods.map(function(p){return '<section class="wx90-period"><div class="wx90-period-title">'+p[0]+'</div><div class="wx90-period-icon">'+wxIcon(p[1],p[2])+'</div><div class="wx90-period-condition">'+wxWord(p[1],p[2]).toUpperCase()+'</div><div class="wx90-period-data"><b>'+p[3]+'</b><span>'+p[4]+'</span></div></section>'}).join('')+
    '</div><div class="wx90-source">LOCAL FORECAST  /  DATA: OPEN-METEO</div></div>';
  return [
    {title:["Current","Conditions"],foot:"FORECAST DATA: OPEN-METEO",html:combined},
    {title:["Local","Forecast"],foot:"ZTV WEATHER DESK  /  LOCAL FORECAST",html:narrative}
  ];
}


/* ---- ZTV smooth jazz: soft electric piano, upright-ish bass, brushes, a little vibraphone ---- */
function wxJazz(secs){
  var S=wxCfg();if(AUD.muted)return null;
  if(S.music){try{var a=new Audio(S.music);a.volume=Math.min(1,AUD.vol);a.loop=true;a.play().catch(function(){});return{stop:function(){var v=a.volume,iv=setInterval(function(){v-=.08;if(v<=0){clearInterval(iv);a.pause()}else a.volume=v},80)}}}catch(e){}}
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume()}catch(e){return null}
  var ctx=AC,out=ctx.createGain(),comp=ctx.createDynamicsCompressor(),t0=ctx.currentTime+.1,vol=.5*Math.min(1,AUD.vol/.8);
  out.connect(comp);comp.connect(ctx.destination);out.gain.setValueAtTime(0,t0);out.gain.linearRampToValueAtTime(vol,t0+2);
  var bpm=[76,82,88][Math.random()*3|0],beat=60/bpm,sw=beat*.62,hz=function(m){return 440*Math.pow(2,(m-69)/12)};
  var keys=[[0,0],[2,0],[-2,0],[3,0],[5,0]][Math.random()*5|0][0];
  /* ii-V-I-vi in F, with color tones; [root, voicing] */
  var prog=[[50,[60,64,65,69]],[55,[59,62,65,70]],[53,[60,64,67,69]],[50,[57,60,64,67]],[46,[57,60,62,65]],[48,[58,62,64,67]],[53,[57,60,64,67]],[48,[58,62,64,69]]];
  var noise=ctx.createBuffer(1,ctx.sampleRate*.2,ctx.sampleRate),nd=noise.getChannelData(0);for(var i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  function ep(m,t,dur,g){[1,2.01].forEach(function(mul,k){var o=ctx.createOscillator(),e=ctx.createGain(),tr=ctx.createGain(),l=ctx.createOscillator();
    o.type="sine";o.frequency.value=hz(m+keys)*mul;l.frequency.value=4.6;tr.gain.value=.12;l.connect(tr);tr.connect(e.gain);
    var pk=g*(k?.18:1);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(pk,t+.012);e.gain.exponentialRampToValueAtTime(pk*.35,t+.5);e.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(e);e.connect(out);o.start(t);l.start(t);o.stop(t+dur+.05);l.stop(t+dur+.05)})}
  function bass(m,t,dur){var o=ctx.createOscillator(),e=ctx.createGain(),f=ctx.createBiquadFilter();o.type="triangle";o.frequency.value=hz(m+keys-12);
    f.type="lowpass";f.frequency.value=600;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.32,t+.02);e.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(f);f.connect(e);e.connect(out);o.start(t);o.stop(t+dur+.05)}
  function brush(t,g){var s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),e=ctx.createGain();s.buffer=noise;f.type="bandpass";f.frequency.value=6500;f.Q.value=.7;
    e.gain.setValueAtTime(g,t);e.gain.exponentialRampToValueAtTime(.0001,t+.12);s.connect(f);f.connect(e);e.connect(out);s.start(t);s.stop(t+.15)}
  function vibe(m,t){var o=ctx.createOscillator(),e=ctx.createGain();o.type="sine";o.frequency.value=hz(m+keys+12);
    e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.08,t+.005);e.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(e);e.connect(out);o.start(t);o.stop(t+1.7)}
  var bar=0,next=t0,stopAt=t0+secs,iv=setInterval(function(){
    while(next<ctx.currentTime+.4&&next<stopAt){
      var ch=prog[bar%prog.length],r=ch[0],v=ch[1],t=next;
      v.forEach(function(m){ep(m,t,beat*1.8,.07)});v.forEach(function(m){ep(m,t+beat+sw,beat*1.6,.05)});
      bass(r,t,beat*.9);bass(r+7,t+beat*2,beat*.9);bass(r+(Math.random()<.5?5:3),t+beat*3,beat*.5);bass(r+[-1,1,2][Math.random()*3|0],t+beat*3+sw,beat*.4);
      for(var b=0;b<4;b++){brush(t+b*beat,.05);brush(t+b*beat+sw,.03)}
      if(Math.random()<.7){var n=1+(Math.random()*3|0);for(var q=0;q<n;q++)vibe(v[Math.random()*v.length|0],t+(Math.random()*4|0)*beat+(Math.random()<.5?sw:0))}
      bar++;next+=beat*4}},100);
  return{stop:function(){clearInterval(iv);var t=ctx.currentTime;out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(out.gain.value,t);out.gain.linearRampToValueAtTime(0,t+1.2);setTimeout(function(){try{out.disconnect()}catch(e){}},1500)}}}

/* ---- run the break ---- */
function weatherBreak(requestPlaces,requestUser){
  if(TK.on||WX.on)return;var S=wxCfg(),el=$("wx"),places=requestPlaces||wxPickPlaces(Math.max(1,Math.min(5,S.cities||3)));WX.on=true;
  wxFetch(places).then(function(arr){
    if(TK.on){WX.on=false;return}
    var pages=[];arr.forEach(function(j,i){if(places[i])pages=pages.concat(wxPages(places[i],j))});
    if(requestUser&&pages.length){
      pages[0].title=["Viewer","Forecast"];
      pages[0].foot="ZTV WEATHER DESK  /  REQUESTED BY @"+requestUser.toUpperCase();
      pages[1].foot="REQUESTED BY @"+requestUser.toUpperCase()+"  /  FORECAST PROVIDED BY OPEN-METEO";
    }
    var per=(S.pageSecs||8)*1000,intro=3500,secs=(intro+per*pages.length)/1000,bv=$("bumpv");
    var newsStop=function(){}; wxBulletins(places[0]).then(function(items){WX.news=items; if(WX.on&&el.querySelector("#wxnews-text")){newsStop();newsStop=wxTickerStart(el,items)}});
    TK.on=true;TK.saved={v:v.muted};v.muted=true;if(bv)bv.muted=true;hideBanner();
    el.classList.remove("off");el.classList.toggle("k",(S.theme||"kick")!=="classic");
    el.innerHTML='<div class="crtfx"><div class="crtroll"></div></div>'+ 
      '<div class="wxintro" id="wxintro"><div class="wx-intro-stripe"></div><div class="wx-intro-brand">'+zwxLogo()+'<div class="wx90-intro-name">WEATHER DESK</div></div><div class="wx-intro-label">LOCAL FORECASTS <span>•</span> REGIONAL CONDITIONS <span>•</span> ON DEMAND</div></div>'+
      '<div class="wxtop">'+zwxLogo(true)+'<div class="wxttl"><span id="wxt1"></span><span id="wxt2"></span></div><div class="wxclk"><span id="wxclk"></span><span id="wxdate"></span></div></div>'+
      '<div class="wxbody" id="wxbody"></div><div class="wxfoot"><span class="wx-news-label">WEATHER BULLETIN</span><span class="wx-news-text" id="wxnews-text">LOCAL FORECASTS AND REGIONAL CONDITIONS</span></div>';
    el.hidden=false;WX.music=wxJazz(secs);
    var tick=function(){var n=new Date(),c=$("wxclk"),dd=$("wxdate");if(!c)return;
      c.textContent=n.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit"});
      dd.textContent=n.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()};tick();
    var clk=setInterval(tick,500);
    WX.timers.push(setTimeout(function(){var it=$("wxintro");if(it)it.classList.add("out")},intro-500));
    pages.forEach(function(p,i){WX.timers.push(setTimeout(function(){
      $("wxt1").textContent=p.title[0];$("wxt2").textContent=p.title[1];
      var b=$("wxbody");b.innerHTML=p.html;void b.offsetWidth;b.firstChild.classList.add("in");
      el.classList.remove("glitch");void el.offsetWidth;el.classList.add("glitch")},intro+i*per))});
    WX.timers.push(setTimeout(function(){
      clearInterval(clk);newsStop();if(WX.music)WX.music.stop();WX.music=null;
      el.classList.add("off");hiss(300);setTimeout(function(){el.hidden=true;el.innerHTML="";el.classList.remove("off","glitch");WX.on=TK.on=false;WX.timers=[];v.muted=(muteHint||AUD.muted);if(bv)bv.muted=AUD.muted;
        if(FOL.q.length&&!FOL.busy)followNext();wxSchedule();setTimeout(wxRequestNext,1200)},520)},secs*1000))
  }).catch(function(){WX.on=false;osdMsg("WEATHER UNAVAILABLE",3000);wxSchedule();setTimeout(wxRequestNext,1500)})}
function weatherTest(){if(!TK.on&&!WX.on)weatherBreak()}
