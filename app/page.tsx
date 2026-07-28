"use client";

import { useEffect, useMemo, useState } from "react";

type Place = {
  name: string;
  region: string;
  icon: string;
  temperature: number;
  feels: number;
  humidity: number;
  wind: number;
  rain: number;
  seaTemp: number;
  wave: number;
  tide: string;
  summary: string;
};

type FishingZone = {
  name: string;
  region: string;
  lat: number;
  lon: number;
  wave: number;
  wind: number;
  waterTemp: number;
  target: string;
};

const places: Place[] = [
  {
    name: "부산",
    region: "남해동부",
    icon: "☀",
    temperature: 28,
    feels: 30,
    humidity: 68,
    wind: 3.2,
    rain: 0,
    seaTemp: 24.8,
    wave: 0.7,
    tide: "밀물",
    summary: "대체로 맑고 바다는 잔잔해요",
  },
  {
    name: "인천",
    region: "서해중부",
    icon: "☁",
    temperature: 26,
    feels: 28,
    humidity: 74,
    wind: 4.1,
    rain: 20,
    seaTemp: 23.1,
    wave: 1.1,
    tide: "썰물",
    summary: "구름이 많고 바람이 조금 불어요",
  },
  {
    name: "강릉",
    region: "동해중부",
    icon: "☀",
    temperature: 27,
    feels: 29,
    humidity: 64,
    wind: 2.8,
    rain: 10,
    seaTemp: 22.6,
    wave: 0.9,
    tide: "정조",
    summary: "햇볕이 강하지만 파도는 낮아요",
  },
  {
    name: "제주",
    region: "제주도앞바다",
    icon: "⛅",
    temperature: 29,
    feels: 32,
    humidity: 76,
    wind: 5.4,
    rain: 30,
    seaTemp: 26.2,
    wave: 1.5,
    tide: "밀물",
    summary: "바람과 너울에 주의하세요",
  },
];

const forecast = [
  { time: "지금", icon: "☀", temp: 28, wave: 0.7 },
  { time: "15시", icon: "☀", temp: 29, wave: 0.8 },
  { time: "16시", icon: "⛅", temp: 29, wave: 0.8 },
  { time: "17시", icon: "⛅", temp: 28, wave: 0.9 },
  { time: "18시", icon: "☁", temp: 27, wave: 1.0 },
  { time: "19시", icon: "☁", temp: 26, wave: 0.9 },
];

const fishingZones: FishingZone[] = [
  {
    name: "다대포 외해",
    region: "부산",
    lat: 35.02,
    lon: 128.94,
    wave: 0.7,
    wind: 3.2,
    waterTemp: 24.8,
    target: "갈치 · 고등어",
  },
  {
    name: "해금강 남동",
    region: "거제",
    lat: 34.72,
    lon: 128.69,
    wave: 0.9,
    wind: 3.8,
    waterTemp: 24.2,
    target: "볼락 · 참돔",
  },
  {
    name: "한산도 남측",
    region: "통영",
    lat: 34.75,
    lon: 128.51,
    wave: 0.6,
    wind: 2.9,
    waterTemp: 24.5,
    target: "감성돔 · 전갱이",
  },
  {
    name: "금오도 동측",
    region: "여수",
    lat: 34.47,
    lon: 127.79,
    wave: 1.0,
    wind: 4.5,
    waterTemp: 25.1,
    target: "문어 · 참돔",
  },
  {
    name: "우도 북동",
    region: "제주",
    lat: 33.53,
    lon: 127.0,
    wave: 1.4,
    wind: 5.1,
    waterTemp: 26.1,
    target: "방어 · 갈치",
  },
  {
    name: "신진도 서측",
    region: "태안",
    lat: 36.66,
    lon: 126.1,
    wave: 1.1,
    wind: 4.2,
    waterTemp: 22.9,
    target: "우럭 · 주꾸미",
  },
  {
    name: "주문진 동측",
    region: "강릉",
    lat: 37.91,
    lon: 128.86,
    wave: 0.9,
    wind: 3.5,
    waterTemp: 22.6,
    target: "대구 · 가자미",
  },
  {
    name: "자월도 남측",
    region: "인천",
    lat: 37.23,
    lon: 126.31,
    wave: 1.0,
    wind: 4.1,
    waterTemp: 23.1,
    target: "꽃게 · 우럭",
  },
];

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const radius = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [selectedName, setSelectedName] = useState("부산");
  const [mode, setMode] = useState<"weather" | "ocean">("weather");
  const [seoulTime, setSeoulTime] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const selected = useMemo(
    () => places.find((place) => place.name === selectedName) ?? places[0],
    [selectedName],
  );

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const updateClock = () => setSeoulTime(formatter.format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const recommendations = useMemo(() => {
    if (!coordinates) return [];
    return fishingZones
      .map((zone) => {
        const distance = distanceKm(
          coordinates.lat,
          coordinates.lon,
          zone.lat,
          zone.lon,
        );
        const conditionScore =
          100 -
          zone.wave * 12 -
          zone.wind * 2 -
          Math.abs(zone.waterTemp - 24) * 1.5;
        const efficiency = Math.max(
          1,
          Math.min(99, Math.round(conditionScore - Math.min(distance / 12, 30))),
        );
        return { ...zone, distance, efficiency };
      })
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);
  }, [coordinates]);

  const findFishingZones = () => {
    if (!navigator.geolocation) {
      setLocationError("이 기기에서는 GPS 위치 확인을 지원하지 않습니다.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError(
          "위치 확인이 허용되지 않았습니다. 브라우저에서 위치 권한을 허용해 주세요.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="어디서 잡으라꼬 홈">
          <span className="brand-mark">≈</span>
          <span>
            어디서 잡으라꼬
            <small>기상·해양 통합정보</small>
          </span>
        </a>
        <div className="status-line">
          <span className="sample-badge">샘플 미리보기</span>
          <span className="seoul-clock" aria-live="off">
            <small>서울 현재 시각</small>
            <strong>{seoulTime || "시간 확인 중…"}</strong>
          </span>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">WEATHER × OCEAN</p>
          <h1>
            오늘의 하늘과 바다를
            <br />
            한눈에 확인하세요.
          </h1>
          <p className="hero-copy">
            복잡하게 흩어진 기상과 해양 정보를 쉽고 빠르게 보여드립니다.
          </p>
        </div>
        <div className="hero-reading" aria-label={`${selected.name} 현재 기온`}>
          <span>{selected.name}</span>
          <strong>{selected.temperature}°</strong>
          <p>{selected.summary}</p>
        </div>
      </section>

      <section className="dashboard" aria-label="기상 해양 정보판">
        <aside className="place-panel">
          <div className="panel-heading">
            <div>
              <p className="overline">관심 지역</p>
              <h2>어디를 볼까요?</h2>
            </div>
            <span className="place-count">{places.length}</span>
          </div>
          <div className="place-list">
            {places.map((place) => (
              <button
                className={`place-button ${place.name === selectedName ? "active" : ""}`}
                key={place.name}
                onClick={() => setSelectedName(place.name)}
                type="button"
                aria-pressed={place.name === selectedName}
              >
                <span className="weather-icon">{place.icon}</span>
                <span className="place-label">
                  <strong>{place.name}</strong>
                  <small>{place.region}</small>
                </span>
                <span className="place-temp">{place.temperature}°</span>
              </button>
            ))}
          </div>
          <button className="add-place" type="button">
            <span>＋</span> 관심 지역 추가
          </button>
        </aside>

        <div className="main-panel">
          <div className="panel-top">
            <div>
              <p className="overline">{selected.region}</p>
              <h2>{selected.name} 관측 정보</h2>
              <p className="updated">예시값 · 실제 연결 후 자동 갱신</p>
            </div>
            <div className="segment" aria-label="정보 종류">
              <button
                className={mode === "weather" ? "active" : ""}
                onClick={() => setMode("weather")}
                type="button"
              >
                기상
              </button>
              <button
                className={mode === "ocean" ? "active" : ""}
                onClick={() => setMode("ocean")}
                type="button"
              >
                해양
              </button>
            </div>
          </div>

          {mode === "weather" ? (
            <div className="metric-grid">
              <article className="metric feature">
                <span className="metric-label">현재 기온</span>
                <strong>{selected.temperature}°</strong>
                <p>체감 {selected.feels}°</p>
              </article>
              <article className="metric">
                <span className="metric-symbol">◒</span>
                <span className="metric-label">습도</span>
                <strong>{selected.humidity}%</strong>
                <div className="meter">
                  <i style={{ width: `${selected.humidity}%` }} />
                </div>
              </article>
              <article className="metric">
                <span className="metric-symbol">→</span>
                <span className="metric-label">풍속</span>
                <strong>{selected.wind} m/s</strong>
                <p>남동풍</p>
              </article>
              <article className="metric">
                <span className="metric-symbol">●</span>
                <span className="metric-label">강수확률</span>
                <strong>{selected.rain}%</strong>
                <p>
                  {selected.rain > 20 ? "우산을 챙기세요" : "비 소식이 적어요"}
                </p>
              </article>
            </div>
          ) : (
            <div className="metric-grid">
              <article className="metric feature ocean-feature">
                <span className="metric-label">현재 수온</span>
                <strong>{selected.seaTemp}°</strong>
                <p>관측 부이 기준</p>
              </article>
              <article className="metric">
                <span className="metric-symbol">≈</span>
                <span className="metric-label">유의파고</span>
                <strong>{selected.wave} m</strong>
                <p>{selected.wave >= 1.5 ? "너울 주의" : "비교적 잔잔"}</p>
              </article>
              <article className="metric">
                <span className="metric-symbol">↗</span>
                <span className="metric-label">조류</span>
                <strong>{selected.tide}</strong>
                <p>다음 정조 18:42</p>
              </article>
              <article className="metric">
                <span className="metric-symbol">◇</span>
                <span className="metric-label">염분</span>
                <strong>32.4 psu</strong>
                <p>관측소 최근값</p>
              </article>
            </div>
          )}

          <section className="timeline">
            <div className="timeline-heading">
              <div>
                <p className="overline">시간별 전망</p>
                <h3>오늘 오후</h3>
              </div>
              <span>{mode === "weather" ? "기온" : "파고"} 기준</span>
            </div>
            <div className="forecast-row">
              {forecast.map((item, index) => (
                <article className={index === 0 ? "now" : ""} key={item.time}>
                  <span>{item.time}</span>
                  <b>{item.icon}</b>
                  <strong>
                    {mode === "weather" ? `${item.temp}°` : `${item.wave}m`}
                  </strong>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="notice-strip">
        <div className="notice-icon">!</div>
        <div>
          <p className="overline">기상특보</p>
          <strong>현재 선택 지역에 발표된 특보가 없습니다.</strong>
        </div>
        <span>안전한 하루 보내세요</span>
      </section>

      <section className="fishing-section" aria-labelledby="fishing-title">
        <div className="fishing-intro">
          <p className="eyebrow">SMART FISHING GUIDE</p>
          <h2 id="fishing-title">
            지금 위치에서
            <br />
            어디로 갈까?
          </h2>
          <p>
            GPS 위치와 파고·풍속·수온·이동거리를 함께 계산해 가까운 조업
            후보지를 순서대로 보여드립니다.
          </p>
          <button
            className="gps-button"
            type="button"
            onClick={findFishingZones}
            disabled={locating}
          >
            <span>⌖</span>
            {locating ? "현재 위치 확인 중…" : "내 GPS로 추천받기"}
          </button>
          {coordinates && (
            <p className="coordinate-readout">
              현재 위치 {coordinates.lat.toFixed(4)},{" "}
              {coordinates.lon.toFixed(4)}
            </p>
          )}
          {locationError && <p className="location-error">{locationError}</p>}
        </div>

        <div className="fishing-results">
          <div className="google-map-card">
            <iframe
              title="구글 지도에서 보는 부산 다대포 앞바다 추천 조업 후보지"
              src="https://www.google.com/maps?q=35.0200,128.9400&z=11&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="map-focus-label">
              <span className="map-pulse" aria-hidden="true" />
              <div>
                <small>부산 앞바다 집중 표시</small>
                <strong>다대포 외해</strong>
                <p>35.0200° N · 128.9400° E</p>
              </div>
            </div>
            <a
              className="open-google-map"
              href="https://www.google.com/maps?q=35.0200,128.9400"
              target="_blank"
              rel="noreferrer"
            >
              구글 지도에서 크게 보기 ↗
            </a>
          </div>
          {recommendations.length > 0 ? (
            <>
              <div className="best-zone">
                <div className="sonar" aria-hidden="true">
                  <i />
                  <span className="boat-dot">◆</span>
                  <span className="target-dot">●</span>
                </div>
                <div className="best-zone-copy">
                  <span className="rank-badge">추천 1순위</span>
                  <p>{recommendations[0].region}</p>
                  <h3>{recommendations[0].name}</h3>
                  <div className="score-row">
                    <strong>{recommendations[0].efficiency}</strong>
                    <span>/ 100 조업 효율 점수</span>
                  </div>
                  <p className="zone-coordinates">
                    GPS {recommendations[0].lat.toFixed(3)},{" "}
                    {recommendations[0].lon.toFixed(3)}
                  </p>
                </div>
              </div>
              <div className="zone-list">
                {recommendations.map((zone, index) => (
                  <article key={zone.name}>
                    <span className="zone-rank">0{index + 1}</span>
                    <div>
                      <strong>{zone.name}</strong>
                      <small>
                        {zone.target} · 약 {Math.round(zone.distance)}km
                      </small>
                    </div>
                    <dl>
                      <div>
                        <dt>파고</dt>
                        <dd>{zone.wave}m</dd>
                      </div>
                      <div>
                        <dt>풍속</dt>
                        <dd>{zone.wind}m/s</dd>
                      </div>
                      <div>
                        <dt>수온</dt>
                        <dd>{zone.waterTemp}°</dd>
                      </div>
                    </dl>
                    <span className="mini-score">{zone.efficiency}점</span>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="gps-placeholder">
              <div>
                <span className="gps-mini-icon">⌖</span>
              </div>
              <div>
                <h3>GPS를 켜면 현재 위치 기준 순위가 나타납니다</h3>
                <p>위치는 추천 계산에만 사용되며 저장하지 않습니다.</p>
              </div>
            </div>
          )}
        </div>
        <p className="safety-note">
          ※ 현재는 예시 관측값을 사용한 후보지 안내입니다. 출항 전 반드시
          기상특보, 항행경보, 현지 조업 규정과 선박 안전 상태를 직접 확인하세요.
        </p>
      </section>

      <footer>
        <p>
          데이터 출처 예정: 기상청 API허브 · 국립해양조사원 ·
          국립수산과학원
        </p>
        <p>현재 화면의 수치는 기능 확인을 위한 예시입니다.</p>
      </footer>
    </main>
  );
}
