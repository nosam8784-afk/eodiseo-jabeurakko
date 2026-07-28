import { NextRequest, NextResponse } from "next/server";

type FishingGround = {
  name: string;
  latitude: number;
  longitude: number;
  species: string[];
  idealTemp: [number, number];
};

// 육지 후보가 섞이지 않도록 연안에서 충분히 떨어진 실제 해상 좌표만 사용합니다.
const fishingGrounds: FishingGround[] = [
  { name: "가덕도 남방 해역", latitude: 34.94, longitude: 128.96, species: ["갈치", "고등어"], idealTemp: [18, 25] },
  { name: "오륙도 동방 해역", latitude: 35.08, longitude: 129.23, species: ["고등어", "전갱이"], idealTemp: [17, 24] },
  { name: "기장 대변항 동방 해역", latitude: 35.22, longitude: 129.38, species: ["참돔", "전갱이"], idealTemp: [16, 23] },
  { name: "울산 간절곶 동방 해역", latitude: 35.35, longitude: 129.52, species: ["참돔", "부시리"], idealTemp: [17, 24] },
  { name: "울산 방어진 동방 해역", latitude: 35.48, longitude: 129.60, species: ["고등어", "오징어"], idealTemp: [16, 23] },
  { name: "울산 정자 외해", latitude: 35.63, longitude: 129.58, species: ["가자미", "오징어"], idealTemp: [14, 21] },
  { name: "포항 구룡포 동방 해역", latitude: 35.98, longitude: 129.67, species: ["오징어", "대구"], idealTemp: [13, 20] },
  { name: "포항 영일만 외해", latitude: 36.12, longitude: 129.62, species: ["청어", "오징어"], idealTemp: [12, 20] },
  { name: "영덕 축산항 동방 해역", latitude: 36.50, longitude: 129.62, species: ["대게", "가자미"], idealTemp: [8, 17] },
  { name: "울진 후포 동방 해역", latitude: 36.70, longitude: 129.73, species: ["대게", "대구"], idealTemp: [7, 16] },
  { name: "삼척 임원 동방 해역", latitude: 37.23, longitude: 129.48, species: ["가자미", "대구"], idealTemp: [8, 17] },
  { name: "강릉 주문진 외해", latitude: 37.90, longitude: 129.20, species: ["오징어", "대구"], idealTemp: [10, 19] },
  { name: "속초 대포항 동방 해역", latitude: 38.17, longitude: 129.20, species: ["오징어", "가자미"], idealTemp: [10, 19] },
  { name: "거제 지심도 남동 해역", latitude: 34.76, longitude: 128.85, species: ["참돔", "부시리"], idealTemp: [17, 24] },
  { name: "거제 매물도 남방 해역", latitude: 34.58, longitude: 128.58, species: ["방어", "참돔"], idealTemp: [16, 23] },
  { name: "통영 욕지도 남방 해역", latitude: 34.50, longitude: 128.25, species: ["갈치", "참돔"], idealTemp: [18, 25] },
  { name: "남해 미조 남방 해역", latitude: 34.55, longitude: 128.05, species: ["갈치", "볼락"], idealTemp: [17, 24] },
  { name: "여수 금오도 남방 해역", latitude: 34.43, longitude: 127.77, species: ["갈치", "참돔"], idealTemp: [18, 25] },
  { name: "고흥 나로도 남동 해역", latitude: 34.38, longitude: 127.60, species: ["삼치", "참돔"], idealTemp: [18, 25] },
  { name: "완도 청산도 남방 해역", latitude: 34.08, longitude: 126.93, species: ["전갱이", "참돔"], idealTemp: [17, 24] },
  { name: "진도 조도 남방 해역", latitude: 33.97, longitude: 126.20, species: ["갈치", "농어"], idealTemp: [18, 25] },
  { name: "목포 외달도 서방 해역", latitude: 34.68, longitude: 126.16, species: ["민어", "농어"], idealTemp: [19, 26] },
  { name: "군산 어청도 남방 해역", latitude: 35.95, longitude: 125.98, species: ["우럭", "광어"], idealTemp: [14, 22] },
  { name: "보령 외연도 남방 해역", latitude: 36.12, longitude: 125.95, species: ["우럭", "광어"], idealTemp: [14, 22] },
  { name: "태안 격렬비열도 남방 해역", latitude: 36.52, longitude: 125.52, species: ["우럭", "농어"], idealTemp: [15, 23] },
  { name: "인천 덕적도 서방 해역", latitude: 37.20, longitude: 125.78, species: ["꽃게", "우럭"], idealTemp: [14, 23] },
  { name: "인천 연평도 남방 해역", latitude: 37.53, longitude: 125.70, species: ["꽃게", "조기"], idealTemp: [15, 24] },
  { name: "제주 차귀도 서방 해역", latitude: 33.30, longitude: 125.95, species: ["방어", "갈치"], idealTemp: [18, 25] },
  { name: "제주 마라도 남방 해역", latitude: 32.93, longitude: 126.23, species: ["방어", "다금바리"], idealTemp: [18, 25] },
  { name: "제주 서귀포 남방 해역", latitude: 33.12, longitude: 126.56, species: ["갈치", "참돔"], idealTemp: [19, 26] },
  { name: "제주 성산 동방 해역", latitude: 33.43, longitude: 127.18, species: ["갈치", "방어"], idealTemp: [18, 25] },
];

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address) return NextResponse.json({ error: "주소를 입력해 주세요." }, { status: 400 });

  const geoUrl = new URL("https://nominatim.openstreetmap.org/search");
  geoUrl.searchParams.set("q", `${address}, 대한민국`);
  geoUrl.searchParams.set("format", "jsonv2");
  geoUrl.searchParams.set("limit", "1");
  geoUrl.searchParams.set("countrycodes", "kr");
  geoUrl.searchParams.set("accept-language", "ko");

  const geoResponse = await fetch(geoUrl, {
    headers: { "User-Agent": "eodiseo-jabeurakko/1.0 (fishing weather service)" },
  });
  const geo = await geoResponse.json() as Array<{ lat: string; lon: string; display_name: string }>;
  if (!geo[0]) return NextResponse.json({ error: "주소를 찾지 못했습니다. 시·군·구와 동 이름을 함께 입력해 주세요." }, { status: 404 });

  const lat = Number(geo[0].lat);
  const lon = Number(geo[0].lon);
  const candidates = fishingGrounds
    .map((ground) => ({ ...ground, distance: distanceKm(lat, lon, ground.latitude, ground.longitude) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  const marineResults = await Promise.all(candidates.map(async (point) => {
    const url = new URL("https://marine-api.open-meteo.com/v1/marine");
    url.searchParams.set("latitude", point.latitude.toFixed(5));
    url.searchParams.set("longitude", point.longitude.toFixed(5));
    url.searchParams.set("current", "wave_height,wind_wave_height,sea_surface_temperature");
    url.searchParams.set("timezone", "Asia/Seoul");
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const body = await response.json() as { current?: Record<string, unknown> };
    const current = body.current;
    if (!current || current.wave_height == null || current.sea_surface_temperature == null) return null;
    const wave = safeNumber(current.wave_height, 9);
    const windWave = safeNumber(current.wind_wave_height, wave);
    const seaTemp = safeNumber(current.sea_surface_temperature, 15);
    const safety = Math.max(0, 100 - wave * 30 - windWave * 12);
    const travel = Math.max(0, 100 - point.distance * 1.2);
    const idealCenter = (point.idealTemp[0] + point.idealTemp[1]) / 2;
    const tempSuitability = Math.max(0, 100 - Math.abs(seaTemp - idealCenter) * 9);
    const catchIndex = Math.round(Math.max(1, Math.min(99, tempSuitability * 0.5 + safety * 0.25 + travel * 0.25)));
    return { ...point, wave, windWave, seaTemp, score: catchIndex, catchIndex };
  }));

  const valid = marineResults.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const unique = valid
    .sort((a, b) => b.score - a.score || a.distance - b.distance)
    .slice(0, 3);

  if (!unique.length) return NextResponse.json({ error: "입력한 위치 주변에서 해양 관측값을 찾지 못했습니다. 해안과 가까운 주소를 입력해 주세요." }, { status: 422 });

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", String(lat));
  weatherUrl.searchParams.set("longitude", String(lon));
  weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation");
  weatherUrl.searchParams.set("wind_speed_unit", "ms");
  weatherUrl.searchParams.set("timezone", "Asia/Seoul");
  weatherUrl.searchParams.set("forecast_days", "1");
  const weatherResponse = await fetch(weatherUrl, { cache: "no-store" });
  const weatherBody = weatherResponse.ok
    ? await weatherResponse.json() as { current?: Record<string, unknown> }
    : {};
  let weather = weatherBody.current;
  let weatherSource = "Open-Meteo 실시간 기상·해양";

  // 일부 배포 환경에서 Open-Meteo의 current 블록이 비어 오는 경우가 있어
  // 동일 좌표의 공공 기상 피드를 즉시 대체값으로 사용합니다.
  if (!weather || weather.temperature_2m == null || weather.wind_speed_10m == null) {
    const fallbackUrl = new URL("https://api.met.no/weatherapi/locationforecast/2.0/compact");
    fallbackUrl.searchParams.set("lat", lat.toFixed(4));
    fallbackUrl.searchParams.set("lon", lon.toFixed(4));
    const fallbackResponse = await fetch(fallbackUrl, {
      cache: "no-store",
      headers: { "User-Agent": "eodiseo-jabeurakko/1.0 fishing-weather-service" },
    });
    if (!fallbackResponse.ok) {
      return NextResponse.json({ error: "실시간 기상정보 제공처가 잠시 응답하지 않습니다. 잠시 후 다시 계산해 주세요." }, { status: 503 });
    }
    const fallback = await fallbackResponse.json() as {
      properties?: { timeseries?: Array<{
        data?: {
          instant?: { details?: Record<string, unknown> };
          next_1_hours?: { details?: Record<string, unknown> };
        };
      }> };
    };
    const first = fallback.properties?.timeseries?.[0]?.data;
    const details = first?.instant?.details || {};
    const nextHour = first?.next_1_hours?.details || {};
    weather = {
      temperature_2m: details.air_temperature,
      relative_humidity_2m: details.relative_humidity,
      wind_speed_10m: details.wind_speed,
      precipitation: nextHour.precipitation_amount,
    };
    weatherSource = "MET Norway 실시간 기상 · Open-Meteo 실시간 해양";
  }

  const recommendations = unique.map((item) => ({
    name: item.name,
    lat: item.latitude,
    lon: item.longitude,
    distance: item.distance,
    score: item.score,
    wave: item.wave,
    windWave: item.windWave,
    seaTemp: item.seaTemp,
    catchIndex: item.catchIndex,
    catchLevel: item.catchIndex >= 85 ? "매우 높음" : item.catchIndex >= 72 ? "높음" : "보통",
    targetSpecies: item.species.join(" · "),
    reason: `${item.species.join("·")} 수온 적합도와 현재 해상 상태를 반영했습니다`,
  }));

  return NextResponse.json({
    address: geo[0].display_name,
    lat,
    lon,
    calculatedAt: new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()),
    weather: {
      temperature: safeNumber(weather.temperature_2m),
      humidity: safeNumber(weather.relative_humidity_2m),
      wind: safeNumber(weather.wind_speed_10m),
      rain: safeNumber(weather.precipitation),
    },
    recommendations,
    sources: ["기상청 API허브 인증 연동 준비", weatherSource, "OpenStreetMap 주소·지도"],
  });
}
