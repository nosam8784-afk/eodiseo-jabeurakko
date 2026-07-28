"use client";

import { FormEvent, useEffect, useState } from "react";
import RecommendationMap from "./RecommendationMap";

type Recommendation = {
  name: string;
  lat: number;
  lon: number;
  distance: number;
  score: number;
  wave: number;
  windWave: number;
  waveDirection: number;
  wavePeriod: number;
  swellWave: number;
  currentVelocity: number;
  currentDirection: number;
  seaTemp: number;
  catchIndex: number;
  catchLevel: string;
  targetSpecies: string;
  maxWaveNext6: number;
  reason: string;
};

type Result = {
  address: string;
  lat: number;
  lon: number;
  calculatedAt: string;
  weather: {
    temperature: number;
    humidity: number;
    wind: number;
    rain: number;
  };
  safety: {
    status: "safe" | "caution" | "danger";
    label: string;
    horizon: string;
    maxWave: number;
    maxWind: number;
    warnings: Array<{
      severity: "safe" | "caution" | "danger";
      title: string;
      message: string;
      action: string;
    }>;
  };
  recommendations: Recommendation[];
  sources: string[];
};

const examples = ["부산 해운대구", "울산 동구 방어진", "포항시 북구", "여수시 돌산읍"];

function directionName(degree: number) {
  const names = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
  return names[Math.round((((degree % 360) + 360) % 360) / 45) % 8];
}

export default function Home() {
  const [seoulTime, setSeoulTime] = useState("");
  const [address, setAddress] = useState("부산 해운대구");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

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
    const tick = () => setSeoulTime(formatter.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function calculate(event?: FormEvent) {
    event?.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/recommend?address=${encodeURIComponent(address.trim())}`);
      const body = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(body.error || "계산하지 못했습니다.");
      setResult(body);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const best = result?.recommendations[0];
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">물</span>
          <span>어디서 잡으라꼬<small>부산 바다 조업 길잡이</small></span>
        </a>
        <div className="clock"><span>서울 현재 시각</span><strong>{seoulTime || "불러오는 중"}</strong></div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">LIVE WEATHER × MARINE</p>
          <h1>오늘은 어데로<br />잡으러 갈까예?</h1>
          <p className="hero-copy">출발할 주소만 찍어보이소. 파고·바람·수온 싹 훑어보고, 고기 만날 만한 바다 세 군데를 골라드립니더.</p>
        </div>
        <form className="search-card" onSubmit={calculate}>
          <label htmlFor="address">출발할 주소 찍어보이소</label>
          <div className="search-control">
            <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="예: 울산 동구 방어진" />
            <button disabled={loading}>{loading ? "바다 보는 중…" : "어데가 좋노?"}</button>
          </div>
          <div className="examples">
            {examples.map((item) => <button type="button" key={item} onClick={() => setAddress(item)}>{item}</button>)}
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      {!result ? (
        <section className="empty-state">
          <span>01</span><h2>주소부터 함 넣어보이소</h2>
          <p>부산은 물론이고 울산·포항·여수도 그 동네 바다로 따로 계산합니더.</p>
        </section>
      ) : (
        <>
          <section className="summary">
            <div><p className="overline">여서 출발하는 거 맞지예?</p><h2>{result.address}</h2><small>위도 {result.lat.toFixed(4)} · 경도 {result.lon.toFixed(4)}</small></div>
            <div className="weather-strip">
              <article><span>기온</span><strong>{result.weather.temperature.toFixed(1)}°</strong></article>
              <article><span>습도</span><strong>{result.weather.humidity}%</strong></article>
              <article><span>풍속</span><strong>{result.weather.wind.toFixed(1)} <small>m/s</small></strong></article>
              <article><span>강수</span><strong>{result.weather.rain.toFixed(1)} <small>mm</small></strong></article>
            </div>
          </section>

          {best && (
            <section className="ocean-panel">
              <div className="ocean-title">
                <div><p className="overline">1순위 해역 · 실시간 바다</p><h2>{best.name} 해양 정보</h2></div>
                <span>파도는 오는 방향 기준입니더</span>
              </div>
              <div className="ocean-metrics">
                <article className="ocean-main"><span>현재 파고</span><strong>{best.wave.toFixed(1)}m</strong><small>6시간 최고 {best.maxWaveNext6.toFixed(1)}m</small></article>
                <article><span>파주기</span><strong>{best.wavePeriod.toFixed(1)}초</strong><small>{best.wavePeriod >= 8 ? "긴 너울 주의" : "짧은 파도"}</small></article>
                <article><span>파향</span><strong>{directionName(best.waveDirection)}</strong><small>{Math.round(best.waveDirection)}°에서 옴</small></article>
                <article><span>풍랑</span><strong>{best.windWave.toFixed(1)}m</strong><small>너울 {best.swellWave.toFixed(1)}m</small></article>
                <article><span>표층 수온</span><strong>{best.seaTemp.toFixed(1)}°</strong><small>예상 어종 {best.targetSpecies}</small></article>
                <article><span>해류</span><strong>{best.currentVelocity.toFixed(1)}km/h</strong><small>{directionName(best.currentDirection)}쪽으로 흐름</small></article>
              </div>
              <p className="ocean-caution">※ 해류와 연안 파도는 약 8km 격자 예측값이라 항해용 해도나 조석표를 대신할 수 없습니더.</p>
            </section>
          )}

          <section className={`safety-center ${result.safety.status}`} aria-live="polite">
            <div className="safety-head">
              <div className="safety-signal"><i /><i /><i /></div>
              <div>
                <p className="overline">조업 안전 알림 · {result.safety.horizon}</p>
                <h2>{result.safety.label}</h2>
              </div>
              <div className="safety-peaks">
                <span>예상 최고 파고 <strong>{result.safety.maxWave.toFixed(1)}m</strong></span>
                <span>예상 최고 풍속 <strong>{result.safety.maxWind.toFixed(1)}m/s</strong></span>
              </div>
            </div>
            <div className="warning-list">
              {result.safety.warnings.map((warning) => (
                <article className={warning.severity} key={warning.title}>
                  <div className="warning-icon">{warning.severity === "danger" ? "!" : warning.severity === "caution" ? "△" : "✓"}</div>
                  <div><strong>{warning.title}</strong><p>{warning.message}</p><small>{warning.action}</small></div>
                </article>
              ))}
            </div>
          </section>

          <section className="result-grid">
            <article className="map-card">
              <RecommendationMap
                departure={{ lat: result.lat, lon: result.lon, label: result.address }}
                zones={result.recommendations}
              />
              <div className="map-label"><span>여가 1등입니더</span><strong>{best?.name}</strong><small>연두색 원을 누르면 자세히 나옵니더</small></div>
            </article>
            <div className="ranking">
              <div className="section-title"><div><p className="overline">실시간 어획 기대도</p><h2>여 세 군데 가보입시더</h2></div><span>{result.calculatedAt} 기준</span></div>
              {result.recommendations.map((zone, index) => (
                <article className={index === 0 ? "best" : ""} key={`${zone.lat}-${zone.lon}`}>
                  <div className="rank">{String(index + 1).padStart(2, "0")}</div>
                  <div className="zone-name"><strong>{zone.name}</strong><small>예상 어종 {zone.targetSpecies}</small><small>{zone.reason}</small></div>
                  <dl>
                    <div><dt>거리</dt><dd>{zone.distance.toFixed(1)} km</dd></div>
                    <div><dt>파고</dt><dd>{zone.wave.toFixed(1)} m</dd></div>
                    <div><dt>수온</dt><dd>{zone.seaTemp.toFixed(1)}°</dd></div>
                  </dl>
                  <div className="score"><small>예상 {zone.catchLevel}</small><strong>{zone.catchIndex}</strong><span>/ 100</span></div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="method">
        <p className="overline">HOW IT WORKS</p>
        <h2>아무 데나 찍는 거 아입니더.</h2>
        <div>
          <article><b>1</b><strong>주소를 딱 잡고</strong><p>입력한 구·동·읍 주소를 실제 위경도로 정확하게 바꿉니더.</p></article>
          <article><b>2</b><strong>육지는 싹 빼고</strong><p>전국 연안·외해의 실제 해상 좌표만 골라서 비교합니더.</p></article>
          <article><b>3</b><strong>고기 날 만한 데만</strong><p>적정 수온 50%, 파고·바람 25%, 이동거리 25%로 따져봅니더.</p></article>
        </div>
      </section>

      <footer><p>데이터 출처: {result?.sources.join(" · ") || "기상청 API허브 · Open-Meteo · OpenStreetMap"}</p><p>어획 기대도는 수온·기상 기반 추정치이며 어획량을 보장하지 않습니다. 출항 전 기상특보를 확인하세요.</p></footer>
    </main>
  );
}
