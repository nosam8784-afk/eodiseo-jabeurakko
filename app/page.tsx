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

export default function Home() {
  const [selectedName, setSelectedName] = useState("부산");
  const [mode, setMode] = useState<"weather" | "ocean">("weather");
  const [seoulTime, setSeoulTime] = useState("");
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

      <footer>
        <p>데이터 출처 예정: 기상청 API허브 · 국립해양조사원 공공데이터</p>
        <p>현재 화면의 수치는 기능 확인을 위한 예시입니다.</p>
      </footer>
    </main>
  );
}
