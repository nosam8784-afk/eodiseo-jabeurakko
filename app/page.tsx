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
  seaTemp: number;
  catchIndex: number;
  catchLevel: string;
  targetSpecies: string;
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
  recommendations: Recommendation[];
  sources: string[];
};

const examples = ["부산 해운대구", "울산 동구 방어진", "포항시 북구", "여수시 돌산읍"];

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
