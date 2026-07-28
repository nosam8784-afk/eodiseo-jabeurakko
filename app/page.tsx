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

type AddressPoint = {
  label: string;
  keywords: string[];
  lat: number;
  lon: number;
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

const addressPoints: AddressPoint[] = [
  { label: "부산 중구", keywords: ["부산광역시 중구", "부산 중구"], lat: 35.106, lon: 129.032 },
  { label: "부산 서구", keywords: ["부산광역시 서구", "부산 서구"], lat: 35.097, lon: 129.024 },
  { label: "부산 동구", keywords: ["부산광역시 동구", "부산 동구"], lat: 35.129, lon: 129.045 },
  { label: "부산 영도구", keywords: ["영도구", "부산 영도"], lat: 35.091, lon: 129.068 },
  { label: "부산 부산진구", keywords: ["부산진구", "부산진"], lat: 35.163, lon: 129.053 },
  { label: "부산 동래구", keywords: ["동래구", "부산 동래"], lat: 35.205, lon: 129.083 },
  { label: "부산 남구", keywords: ["부산광역시 남구", "부산 남구"], lat: 35.136, lon: 129.084 },
  { label: "부산 북구", keywords: ["부산광역시 북구", "부산 북구"], lat: 35.197, lon: 128.99 },
  { label: "부산 해운대구", keywords: ["해운대구", "해운대"], lat: 35.163, lon: 129.163 },
  { label: "부산 사하구", keywords: ["사하구", "다대포"], lat: 35.104, lon: 128.974 },
  { label: "부산 금정구", keywords: ["금정구"], lat: 35.243, lon: 129.092 },
  { label: "부산 강서구", keywords: ["부산광역시 강서구", "부산 강서구", "가덕도"], lat: 35.116, lon: 128.88 },
  { label: "부산 연제구", keywords: ["연제구"], lat: 35.177, lon: 129.079 },
  { label: "부산 수영구", keywords: ["수영구", "광안리"], lat: 35.145, lon: 129.113 },
  { label: "부산 사상구", keywords: ["사상구"], lat: 35.152, lon: 128.991 },
  { label: "부산 기장군", keywords: ["기장군", "부산 기장"], lat: 35.244, lon: 129.222 },
  { label: "부산광역시", keywords: ["부산광역시", "부산"], lat: 35.1796, lon: 129.0756 },
  { label: "거제시", keywords: ["거제시", "거제"], lat: 34.88, lon: 128.621 },
  { label: "통영시", keywords: ["통영시", "통영"], lat: 34.854, lon: 128.433 },
  { label: "여수시", keywords: ["여수시", "여수"], lat: 34.76, lon: 127.662 },
  { label: "남해군", keywords: ["남해군", "경남 남해"], lat: 34.837, lon: 127.892 },
  { label: "고흥군", keywords: ["고흥군", "고흥"], lat: 34.612, lon: 127.285 },
  { label: "완도군", keywords: ["완도군", "완도"], lat: 34.311, lon: 126.755 },
  { label: "목포시", keywords: ["목포시", "목포"], lat: 34.811, lon: 126.392 },
  { label: "군산시", keywords: ["군산시", "군산"], lat: 35.968, lon: 126.737 },
  { label: "보령시", keywords: ["보령시", "보령"], lat: 36.333, lon: 126.613 },
  { label: "서산시", keywords: ["서산시", "서산"], lat: 36.785, lon: 126.45 },
  { label: "인천광역시", keywords: ["인천광역시", "인천"], lat: 37.456, lon: 126.705 },
  { label: "강릉시", keywords: ["강릉시", "강릉"], lat: 37.752, lon: 128.876 },
  { label: "속초시", keywords: ["속초시", "속초"], lat: 38.207, lon: 128.592 },
  { label: "동해시", keywords: ["동해시", "강원 동해"], lat: 37.524, lon: 129.114 },
  { label: "삼척시", keywords: ["삼척시", "삼척"], lat: 37.45, lon: 129.165 },
  { label: "울진군", keywords: ["울진군", "울진"], lat: 36.993, lon: 129.4 },
  { label: "영덕군", keywords: ["영덕군", "영덕"], lat: 36.415, lon: 129.366 },
  { label: "포항시", keywords: ["포항시", "포항"], lat: 36.019, lon: 129.343 },
  { label: "울산광역시", keywords: ["울산광역시", "울산"], lat: 35.539, lon: 129.311 },
  { label: "창원시", keywords: ["창원시", "창원", "진해구"], lat: 35.159, lon: 128.66 },
  { label: "태안군", keywords: ["태안군", "태안"], lat: 36.745, lon: 126.298 },
  { label: "제주시", keywords: ["제주시", "제주"], lat: 33.5, lon: 126.531 },
  { label: "서울특별시", keywords: ["서울특별시", "서울"], lat: 37.5665, lon: 126.978 },
  { label: "대전광역시", keywords: ["대전광역시", "대전"], lat: 36.35, lon: 127.385 },
  { label: "대구광역시", keywords: ["대구광역시", "대구"], lat: 35.872, lon: 128.602 },
  { label: "광주광역시", keywords: ["광주광역시", "광주"], lat: 35.16, lon: 126.852 },
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
  const [address, setAddress] = useState("");
  const [matchedAddress, setMatchedAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [calculationTime, setCalculationTime] = useState("");
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
        const travelScore = Math.max(0, 100 - distance * 0.45);
        const safetyScore = Math.max(
          0,
          100 - zone.wave * 28 - zone.wind * 4,
        );
        const waterScore = Math.max(
          0,
          100 - Math.abs(zone.waterTemp - 24) * 12,
        );
        const efficiency = Math.max(
          1,
          Math.min(
            99,
            Math.round(
              travelScore * 0.4 + safetyScore * 0.4 + waterScore * 0.2,
            ),
          ),
        );
        return {
          ...zone,
          distance,
          efficiency,
          travelScore: Math.round(travelScore),
          safetyScore: Math.round(safetyScore),
          waterScore: Math.round(waterScore),
        };
      })
      .sort(
        (a, b) => b.efficiency - a.efficiency || a.distance - b.distance,
      )
      .slice(0, 3);
  }, [coordinates]);

  const findFishingZones = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = address.trim().replace(/\s+/g, " ");
    if (!query) {
      setAddressError("출발할 주소를 한글로 입력해 주세요.");
      return;
    }
    const match = addressPoints.find((point) =>
      point.keywords.some((keyword) => query.includes(keyword)),
    );
    if (!match) {
      setCoordinates(null);
      setMatchedAddress("");
      setAddressError(
        "주소에서 지역을 찾지 못했습니다. ‘부산광역시 해운대구’처럼 시·군·구를 포함해 주세요.",
      );
      return;
    }
    setCoordinates({ lat: match.lat, lon: match.lon });
    setMatchedAddress(match.label);
    setCalculationTime(
      new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date()),
    );
    setAddressError("");
  };

  const mapZone = recommendations[0] ?? fishingZones[0];

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
            입력한 주소의 위치를 기준으로 후보지별 이동거리와 파고·풍속·수온을
            새로 계산해 종합 추천 순위를 보여드립니다.
          </p>
          <form className="address-form" onSubmit={findFishingZones}>
            <label htmlFor="departure-address">출발 주소</label>
            <div className="address-control">
              <input
                id="departure-address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="예: 부산광역시 해운대구 우동"
                autoComplete="street-address"
              />
              <button type="submit">추천 계산</button>
            </div>
          </form>
          <p className="address-example">
            입력 예시 · 부산광역시 사하구 / 서울특별시 강남구 / 제주시
          </p>
          {coordinates && (
            <p className="coordinate-readout">
              {matchedAddress} 기준 · {coordinates.lat.toFixed(4)},{" "}
              {coordinates.lon.toFixed(4)} · {calculationTime} 재계산
            </p>
          )}
          {addressError && <p className="location-error">{addressError}</p>}
        </div>

        <div className="fishing-results">
          <div className="google-map-card">
            <iframe
              title={`구글 지도에서 보는 ${mapZone.name} 추천 조업 후보지`}
              src={`https://www.google.com/maps?q=${mapZone.lat},${mapZone.lon}&z=11&output=embed`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="map-focus-label">
              <span className="map-pulse" aria-hidden="true" />
              <div>
                <small>주소 기준 추천 1순위</small>
                <strong>{mapZone.name}</strong>
                <p>
                  {mapZone.lat.toFixed(4)}° N · {mapZone.lon.toFixed(4)}° E
                </p>
              </div>
            </div>
            <a
              className="open-google-map"
              href={`https://www.google.com/maps?q=${mapZone.lat},${mapZone.lon}`}
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
                    <span>/ 100 종합 추천 점수</span>
                  </div>
                  <div className="score-breakdown">
                    <span>이동 {recommendations[0].travelScore}</span>
                    <span>해상안전 {recommendations[0].safetyScore}</span>
                    <span>수온적합 {recommendations[0].waterScore}</span>
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
                        {zone.target} · 출발지에서 약 {Math.round(zone.distance)}
                        km
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
                <span className="gps-mini-icon">가</span>
              </div>
              <div>
                <h3>주소를 입력하면 출발지 기준 순위가 나타납니다</h3>
                <p>입력한 주소는 계산에만 사용되며 저장하지 않습니다.</p>
              </div>
            </div>
          )}
        </div>
        <p className="safety-note">
          ※ 이동거리 40%, 파고·풍속 안전성 40%, 수온 적합도 20%를 주소 입력
          때마다 새로 계산합니다. 현재는 예시 관측값을 사용하므로 출항 전
          기상특보와 현지 해상 상태를 반드시 직접 확인하세요.
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
