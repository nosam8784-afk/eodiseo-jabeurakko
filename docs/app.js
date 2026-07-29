const grounds=[
['가덕도 남동 외해',34.94,128.96,['갈치','고등어'],[18,25]],['부산 다대포 외해',35.05,128.94,['전갱이','고등어'],[17,24]],['울산 방어진 외해',35.48,129.60,['고등어','전갱이'],[16,23]],['울산 정자 앞바다',35.63,129.58,['가자미','오징어'],[14,21]],['포항 구룡포 외해',35.98,129.67,['오징어','대구'],[13,20]],['포항 영일만 외해',36.12,129.62,['청어','오징어'],[12,20]],['울진 후포 외해',36.70,129.73,['대게','대구'],[7,16]],['강릉 주문진 앞바다',37.90,129.20,['오징어','대구'],[10,19]],['거제 지심도 동쪽',34.76,128.85,['참돔','부시리'],[17,24]],['거제 매물도 남쪽',34.58,128.58,['방어','참돔'],[16,23]],['통영 욕지도 남쪽',34.50,128.25,['갈치','참돔'],[18,25]],['여수 금오도 남쪽',34.43,127.77,['갈치','참돔'],[18,25]],['완도 청산도 남쪽',34.08,126.93,['전갱이','참돔'],[17,25]],['진도 조도 외해',33.97,126.20,['갈치','오징어'],[18,25]],['군산 어청도 남쪽',35.95,125.98,['우럭','광어'],[14,22]],['보령 원산도 외해',36.12,125.95,['우럭','광어'],[14,22]],['서산 격렬비열도',36.52,125.52,['우럭','오징어'],[15,23]],['제주 마라도 남쪽',32.93,126.23,['방어','황금바리'],[18,25]],['제주 성산 외해',33.43,127.18,['갈치','방어'],[18,25]]
];
let map, layers=[];
const $=id=>document.getElementById(id); const km=(a,b,c,d)=>{const r=x=>x*Math.PI/180, A=r(c-a),B=r(d-b),q=Math.sin(A/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(B/2)**2;return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))};
function num(v,f=0){v=Number(v);return Number.isFinite(v)?v:f}function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function clock(){ $('clock').textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'medium',hour12:false}).format(new Date()) }clock();setInterval(clock,1000);
async function getJson(url){const r=await fetch(url);if(!r.ok)throw new Error('공개 데이터 제공처가 잠시 응답하지 않습니다.');return r.json()}
async function loadFishPrices(){try{return await getJson(`./fish-prices.json?v=${new Date().toISOString().slice(0,10)}`)}catch{return {source:'인어교주해적단',items:{}}}}
async function calculate(e){e.preventDefault();const address=$('address').value.trim();if(!address)return;$('submit').disabled=true;$('submit').textContent='바다 보는 중…';$('message').textContent='주소와 가까운 바다의 기상·파도 정보를 계산하고 있습니다.';try{
 const geo=await getJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=kr&accept-language=ko&q=${encodeURIComponent(address+', 대한민국')}`);if(!geo[0])throw new Error('주소를 찾지 못했습니다. 시·군·구 또는 도로명까지 입력해 보이소.');const lat=num(geo[0].lat),lon=num(geo[0].lon);
 const candidates=grounds.map(g=>({g,d:km(lat,lon,g[1],g[2])})).sort((a,b)=>a.d-b.d).slice(0,6);
 const entries=(await Promise.all(candidates.map(async({g,d})=>{const u=`https://marine-api.open-meteo.com/v1/marine?latitude=${g[1]}&longitude=${g[2]}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&hourly=wave_height&forecast_hours=6&timezone=Asia%2FSeoul&cell_selection=sea`;const m=await getJson(u),c=m.current||{},waves=(m.hourly?.wave_height||[]).map(num);const wave=num(c.wave_height,9),windWave=num(c.wind_wave_height,wave),temp=num(c.sea_surface_temperature,15),maxWave=Math.max(wave,...waves);const center=(g[4][0]+g[4][1])/2,tempScore=Math.max(0,100-Math.abs(temp-center)*9),safe=Math.max(0,100-wave*30-windWave*12),travel=Math.max(0,100-d*1.2),score=Math.round(Math.max(1,Math.min(99,tempScore*.5+safe*.25+travel*.25)));return {name:g[0],lat:g[1],lon:g[2],species:g[3],d,wave,windWave,temp,maxWave,period:num(c.wave_period),dir:num(c.wave_direction),current:num(c.ocean_current_velocity),score}}))).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,3);if(!entries.length)throw new Error('주변 해역 자료를 찾지 못했습니다. 다시 시도해 보이소.');
 const w=await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&hourly=wind_speed_10m,precipitation&forecast_hours=6&wind_speed_unit=ms&timezone=Asia%2FSeoul`),cur=w.current||{},maxWind=Math.max(num(cur.wind_speed_10m),...(w.hourly?.wind_speed_10m||[]).map(num)),maxRain=Math.max(num(cur.precipitation),...(w.hourly?.precipitation||[]).map(num)),maxWave=Math.max(...entries.map(x=>x.maxWave)),prices=await loadFishPrices();render({lat,lon,name:geo[0].display_name,entries,weather:{temp:num(cur.temperature_2m),hum:num(cur.relative_humidity_2m),wind:num(cur.wind_speed_10m),rain:num(cur.precipitation)},maxWave,maxWind,maxRain,prices});
 }catch(err){$('message').textContent=err.message||'계산에 실패했습니다. 잠시 후 다시 시도해 보이소.';$('result').hidden=true}finally{$('submit').disabled=false;$('submit').textContent='어디가 좋노?'}}
function render(x){$('message').textContent='계산 완료! 지도에서 추천 해역을 눌러 자세한 정보를 확인하이소.';$('result').hidden=false;$('place').textContent=x.name;$('coords').textContent=`위도 ${x.lat.toFixed(4)} · 경도 ${x.lon.toFixed(4)}`;$('weather').innerHTML=[['기온',x.weather.temp+'°C'],['습도',x.weather.hum+'%'],['풍속',x.weather.wind.toFixed(1)+' m/s'],['강수',x.weather.rain.toFixed(1)+' mm']].map(a=>`<article><small>${a[0]}</small><strong>${a[1]}</strong></article>`).join('');let status=x.maxWave>=2.5||x.maxWind>=14||x.maxRain>=10?'danger':x.maxWave>=1.5||x.maxWind>=9||x.maxRain>=3?'caution':'safe';let title=status==='danger'?'출항 위험':status==='caution'?'주의 필요':'현재 안전';let detail=`향후 6시간 최대 파고 ${x.maxWave.toFixed(1)}m · 최대 풍속 ${x.maxWind.toFixed(1)}m/s`;$('safety').className='safety '+status;$('safety').innerHTML=`<p class="eyebrow">조업 안전 알림 · 앞으로 6시간</p><h2>${title}</h2><p>${detail}. 실제 출항 전 해상특보를 꼭 확인하이소.</p>`;$('cards').innerHTML=x.entries.map((z,i)=>`<article class="rec"><span class="rank">${i+1}위 추천</span><h3>${esc(z.name)}</h3><div class="score">${z.score}<small> / 100</small></div><p>예상 어종: ${z.species.join(' · ')}<br>거리 ${z.d.toFixed(1)}km · 파고 ${z.wave.toFixed(1)}m<br>수온 ${z.temp.toFixed(1)}°C · 파주기 ${z.period.toFixed(1)}초</p></article>`).join('');drawMap(x)}
function drawMap(x){if(map){map.remove()}map=L.map('map',{scrollWheelZoom:false});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);const pts=[[x.lat,x.lon]];L.marker([x.lat,x.lon]).addTo(map).bindPopup('<b>출발지</b><br>'+esc(x.name));x.entries.forEach((z,i)=>{const color=i===0?'#dff36d':i===1?'#39c8d0':'#fff';L.polyline([[x.lat,x.lon],[z.lat,z.lon]],{color,weight:i===0?3:2,dashArray:i?'7 7':null}).addTo(map);L.circle([z.lat,z.lon],{radius:i?1600:2400,color,fillColor:color,fillOpacity:.18}).addTo(map);L.marker([z.lat,z.lon],{icon:L.divIcon({className:'',html:`<div class="marker">${i+1}</div>`,iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map).bindPopup(`<b>${esc(z.name)}</b><br>조업 기대도 ${z.score}/100<br>파고 ${z.wave.toFixed(1)}m`);pts.push([z.lat,z.lon])});map.fitBounds(pts,{padding:[45,45],maxZoom:10})}
$('search-form').addEventListener('submit',calculate);
const renderWithGoogleLinks=render;
render=function(x){
  renderWithGoogleLinks(x);
  persistSearch(x);
  const frame=$('google-map-frame');
  const tabs=$('google-map-tabs');
  const showGoogleSpot=(spot,index)=>{
    frame.src=`https://maps.google.com/maps?q=${spot.lat},${spot.lon}&z=11&output=embed`;
    [...tabs.children].forEach((button,i)=>button.classList.toggle('active',i===index));
  };
  tabs.replaceChildren(...x.entries.map((spot,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=`${index+1}위 ${spot.name}`;
    button.addEventListener('click',()=>showGoogleSpot(spot,index));
    return button;
  }));
  showGoogleSpot(x.entries[0],0);
  setTimeout(()=>map?.invalidateSize(),0);
  renderNationwideRecommendations();
};

let nationwidePromise;
const nationwideFallback=[
  {name:'여수 금오도 남쪽',species:['갈치','참돔'],wave:.4,temp:24.4,score:77},
  {name:'가덕도 남동 외해',species:['갈치','고등어'],wave:.4,temp:25.4,score:72},
  {name:'통영 욕지도 남쪽',species:['갈치','참돔'],wave:.6,temp:26.1,score:65},
  {name:'부산 다대포 외해',species:['전갱이','고등어'],wave:.3,temp:26.2,score:62}
];

async function getNationwideTop(){
  if(nationwidePromise) return nationwidePromise;
  nationwidePromise=Promise.all(grounds.map(async g=>{
    try{
      const url=`https://marine-api.open-meteo.com/v1/marine?latitude=${g[1]}&longitude=${g[2]}&current=wave_height,wave_period,wind_wave_height,sea_surface_temperature&timezone=Asia%2FSeoul&cell_selection=sea`;
      const marine=await getJson(url);
      const current=marine.current||{};
      const wave=num(current.wave_height,9);
      const windWave=num(current.wind_wave_height,wave);
      const temp=num(current.sea_surface_temperature,15);
      const center=(g[4][0]+g[4][1])/2;
      const tempScore=Math.max(0,100-Math.abs(temp-center)*9);
      const safeScore=Math.max(0,100-wave*30-windWave*12);
      const score=Math.round(Math.max(1,Math.min(99,tempScore*.65+safeScore*.35)));
      return {
        name:g[0],
        species:g[3],
        wave,
        temp,
        period:num(current.wave_period),
        score
      };
    }catch{
      return null;
    }
  })).then(rows=>rows.filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,4));
  return nationwidePromise;
}

async function renderNationwideRecommendations(){
  const cards=$('nationwide-cards');
  const updated=$('nationwide-updated');
  if(!cards||!updated) return;
  const cardHtml=spots=>spots.map((spot,index)=>`
    <article class="nationwide-card">
      <span class="nationwide-rank">전국 ${index+1}위</span>
      <h3>${esc(spot.name)}</h3>
      <div class="nationwide-score">${spot.score}<small> / 100</small></div>
      <p>예상 어종 ${spot.species.map(esc).join(' · ')}<br>파고 ${spot.wave.toFixed(1)}m · 수온 ${spot.temp.toFixed(1)}°C</p>
    </article>
  `).join('');
  cards.innerHTML=cardHtml(nationwideFallback);
  updated.textContent='최근 계산값 · 실시간 자료 갱신 중';
  try{
    const spots=await getNationwideTop();
    if(!spots.length) throw new Error('no nationwide data');
    cards.innerHTML=cardHtml(spots);
    updated.textContent='실시간 해양자료 기준 · 출발 거리 제외';
  }catch{
    updated.textContent='최근 계산값 · 실시간 갱신 대기';
  }
}

renderNationwideRecommendations();

const fishEmoji=name=>{
  if(/문어/.test(name)) return '🐙';
  if(/오징어|한치/.test(name)) return '🦑';
  if(/새우/.test(name)) return '🦐';
  if(/게/.test(name)) return '🦀';
  if(/복어/.test(name)) return '🐡';
  if(/참돔|돌돔|감성돔/.test(name)) return '🐠';
  return '🐟';
};

drawMap=function(x){
  if(map) map.remove();
  map=L.map('map',{scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);
  const pts=[[x.lat,x.lon]];
  L.marker([x.lat,x.lon]).addTo(map).bindPopup('<b>출발지</b><br>'+esc(x.name));
  x.entries.forEach((z,i)=>{
    const color=i===0?'#00a9c0':i===1?'#ff8a34':'#2251a3';
    const fish=z.species.map(name=>{
      const price=x.prices?.items?.[name];
      const priceText=price?.display||'시세 미등록';
      return `<span class="fish-chip"><span class="fish-picture">${fishEmoji(name)}</span><span><b>${esc(name)}</b><em>${esc(priceText)}</em></span></span>`;
    }).join('');
    const priceDate=Object.values(x.prices?.items||{}).find(Boolean)?.priceDate;
    const sourceText=priceDate?`인어교주해적단 ${esc(priceDate)} 소매시세 기준`:'인어교주해적단 공개 시세 기준';
    const popup=`<div class="fish-popup"><strong>${i+1}위 ${esc(z.name)}</strong><small>예상 어종 · 예상 소매가격</small><div class="fish-list">${fish}</div><small class="fish-source">${sourceText}</small><p>조업 기대도 ${z.score}/100 · 파고 ${z.wave.toFixed(1)}m</p></div>`;
    L.polyline([[x.lat,x.lon],[z.lat,z.lon]],{
      color,
      weight:i===0?3:2,
      dashArray:i?'7 7':null
    }).addTo(map);
    L.circle([z.lat,z.lon],{
      radius:i?2100:2900,
      color,
      fillColor:color,
      fillOpacity:.28,
      weight:4
    }).addTo(map);
    const markerLabel=`${i+1}위 ${z.name} 예상 어종 보기`;
    L.marker([z.lat,z.lon],{
      title:markerLabel,
      alt:markerLabel,
      icon:L.divIcon({
        className:'',
        html:`<span class="marker marker-${i+1}" aria-hidden="true">${i+1}</span>`,
        iconSize:[48,48],
        iconAnchor:[24,24]
      })
    }).addTo(map).bindPopup(popup,{maxWidth:260});
    pts.push([z.lat,z.lon]);
  });
  map.fitBounds(pts,{padding:[45,45],maxZoom:10});
};

const HISTORY_API='https://script.google.com/macros/s/AKfycbyBR2GhL2uuWqrEtpGaVi25KIggWFw5heICxi4OwqktqlN8Sl77M4VQqNC5tHUcEEJdIQ/exec';
const CLIENT_ID_KEY='eodiseo-client-id';
const LOCAL_HISTORY_KEY='eodiseo-local-history';

function historyClientId(){
  let id=localStorage.getItem(CLIENT_ID_KEY);
  if(!id){
    id=crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY,id);
  }
  return id;
}

function localHistory(){
  try{return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY)||'[]')}catch{return []}
}

function renderLocalHistory(){
  const container=$('my-history');
  if(!container)return;
  const rows=localHistory();
  container.innerHTML=rows.length?rows.map(row=>`
    <div class="history-item">
      <span>${esc(row.address)}<br><small>${esc(row.topSpot)}</small></span>
      <strong>${Number(row.score)||0}점</strong>
    </div>`).join(''):'<p class="history-empty">아직 저장된 검색이 없어요.</p>';
}

function renderPopularRegions(rows){
  const container=$('popular-regions');
  if(!container)return;
  container.innerHTML=rows.length?rows.map(row=>`
    <div class="history-item">
      <span>${esc(row.region)}</span>
      <strong>${Number(row.searches)||0}회 · 평균 ${Number(row.averageScore)||0}점</strong>
    </div>`).join(''):'<p class="history-empty">아직 모인 익명 통계가 없어요.</p>';
}

async function loadSharedHistory(){
  renderLocalHistory();
  try{
    const response=await fetch(`${HISTORY_API}?clientId=${encodeURIComponent(historyClientId())}`,{cache:'no-store'});
    if(!response.ok)throw new Error('history unavailable');
    const data=await response.json();
    renderPopularRegions(Array.isArray(data.popular)?data.popular:[]);
  }catch{
    const container=$('popular-regions');
    if(container)container.innerHTML='<p class="history-empty">공용 통계를 잠시 불러오지 못했어요.</p>';
  }
}

async function persistSearch(result){
  const exactAddress=$('address')?.value.trim()||result.name;
  const top=result.entries?.[0];
  if(!top)return;
  const rows=localHistory();
  rows.unshift({address:exactAddress,topSpot:top.name,score:top.score,searchedAt:Date.now()});
  localStorage.setItem(LOCAL_HISTORY_KEY,JSON.stringify(rows.slice(0,8)));
  renderLocalHistory();
  try{
    await fetch(HISTORY_API,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        clientId:historyClientId(),
        resolvedAddress:result.name,
        latitude:result.lat,
        longitude:result.lon,
        topSpot:top.name,
        score:top.score
      })
    });
    await loadSharedHistory();
  }catch{
    // Exact history still remains on this device if the shared service is temporarily unavailable.
  }
}

$('clear-history')?.addEventListener('click',async()=>{
  localStorage.removeItem(LOCAL_HISTORY_KEY);
  renderLocalHistory();
  try{
    await fetch(HISTORY_API,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({clientId:historyClientId(),action:'delete'})
    });
    await loadSharedHistory();
  }catch{
    // Local deletion is immediate; server deletion can be retried on the next visit.
  }
});

loadSharedHistory();
