import { NextRequest, NextResponse } from "next/server";

type MarinePoint = {
  latitude: number;
  longitude: number;
  distance: number;
  direction: string;
};

const directions = [
  ["동쪽", 90], ["남동쪽", 135], ["남쪽", 180], ["남서쪽", 225],
  ["서쪽", 270], ["북서쪽", 315], ["북쪽", 0], ["북동쪽", 45],
] as const;

function destination(lat: number, lon: number, distance: number, bearing: number): MarinePoint {
  const radius = 6371;
  const d = distance / radius;
  const b = bearing * Math.PI / 180;
  const p1 = lat * Math.PI / 180;
  const l1 = lon * Math.PI / 180;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return { latitude: p2 * 180 / Math.PI, longitude: l2 * 180 / Math.PI, distance, direction: "" };
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
  const candidateDistances = [6, 12, 22, 38];
  const candidates: MarinePoint[] = [];
  for (const distance of candidateDistances) {
    for (const [direction, bearing] of directions) {
      const point = destination(lat, lon, distance, bearing);
      point.direction = direction;
      candidates.push(point);
    }
  }

  const marineResults = await Promise.all(candidates.map(async (point) => {
    const url = new URL("https://marine-api.open-meteo.com/v1/marine");
    url.searchParams.set("latitude", point.latitude.toFixed(5));
    url.searchParams.set("longitude", point.longitude.toFixed(5));
    url.searchParams.set("current", "wave_height,wind_wave_height,sea_surface_temperature");
    url.searchParams.set("timezone", "Asia/Seoul");
    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) return null;
    const body = await response.json() as { current?: Record<string, unknown> };
    const current = body.current;
    if (!current || current.wave_height == null || current.sea_surface_temperature == null) return null;
    const wave = safeNumber(current.wave_height, 9);
    const windWave = safeNumber(current.wind_wave_height, wave);
    const seaTemp = safeNumber(current.sea_surface_temperature, 15);
    const safety = Math.max(0, 100 - wave * 30 - windWave * 12);
    const travel = Math.max(0, 100 - point.distance * 1.6);
    const temp = Math.max(0, 100 - Math.abs(seaTemp - 20) * 5);
    const score = Math.round(Math.max(1, Math.min(99, safety * 0.65 + travel * 0.25 + temp * 0.1)));
    return { ...point, wave, windWave, seaTemp, score };
  }));

  const valid = marineResults.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const unique = valid
    .sort((a, b) => b.score - a.score || a.distance - b.distance)
    .filter((item, index, all) => all.findIndex((other) => Math.abs(other.latitude - item.latitude) < 0.02 && Math.abs(other.longitude - item.longitude) < 0.02) === index)
    .slice(0, 3);

  if (!unique.length) return NextResponse.json({ error: "입력한 위치 주변에서 해양 관측값을 찾지 못했습니다. 해안과 가까운 주소를 입력해 주세요." }, { status: 422 });

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", String(lat));
  weatherUrl.searchParams.set("longitude", String(lon));
  weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation");
  weatherUrl.searchParams.set("wind_speed_unit", "ms");
  weatherUrl.searchParams.set("timezone", "Asia/Seoul");
  const weatherResponse = await fetch(weatherUrl, { next: { revalidate: 600 } });
  const weatherBody = await weatherResponse.json() as { current?: Record<string, unknown> };
  const weather = weatherBody.current || {};

  const placeBase = geo[0].display_name.split(",").slice(0, 2).join(" ");
  const recommendations = unique.map((item, index) => ({
    name: `${placeBase} ${item.direction} 해역 ${index + 1}`,
    lat: item.latitude,
    lon: item.longitude,
    distance: item.distance,
    score: item.score,
    wave: item.wave,
    windWave: item.windWave,
    seaTemp: item.seaTemp,
    reason: item.wave < 1 ? "낮은 파고와 이동 효율이 좋습니다" : item.wave < 1.8 ? "이동거리와 해상 상태가 균형적입니다" : "주의가 필요한 파고입니다",
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
    sources: ["기상청 API허브 인증 연동 준비", "Open-Meteo 실시간 기상·해양", "OpenStreetMap 주소·지도"],
  });
}
