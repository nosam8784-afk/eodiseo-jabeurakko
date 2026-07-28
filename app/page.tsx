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
          <span>어디서 잡으라꼬<small>실시간 조업 의사결정 도우미</small></span>
        </a>
        <div className="clock"><span>서울 현재 시각</span><strong>{seoulTime || "불러오는 중"}</strong></div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">LIVE WEATHER × MARINE</p>
          <h1>주소 하나로,<br />오늘 갈 바다를 찾습니다.</h1>
          <p className="hero-copy">입력한 위치를 좌표로 바꾸고 주변 바다의 파고·바람·수온과 이동거리를 새로 계산합니다.</p>
        </div>
        <form className="search-card" onSubmit={calculate}>
          <label htmlFor="address">출발지 한글 주소</label>
          <div className="search-control">
            <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="예: 울산 동구 방어진" />
            <button disabled={loading}>{loading ? "계산 중…" : "최적 조업지 찾기"}</button>
          </div>
          <div className="examples">
            {examples.map((item) => <button type="button" key={item} onClick={() => setAddress(item)}>{item}</button>)}
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      {!result ? (
        <section className="empty-state">
          <span>01</span><h2>주소를 입력해 주세요</h2>
          <p>부산뿐 아니라 울산·포항·여수 등 전국 주소를 각각 다른 좌표로 계산합니다.</p>
        </section>
      ) : (
        <>
          <section className="summary">
            <div><p className="overline">계산 기준 위치</p><h2>{result.address}</h2><small>위도 {result.lat.toFixed(4)} · 경도 {result.lon.toFixed(4)}</small></div>
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
              <div className="map-label"><span>지도에 표시된 1순위</span><strong>{best?.name}</strong><small>밝은 연두색 원을 눌러 상세정보 확인</small></div>
            </article>
            <div className="ranking">
              <div className="section-title"><div><p className="overline">실시간 재계산 결과</p><h2>추천 조업지</h2></div><span>{result.calculatedAt} 기준</span></div>
              {result.recommendations.map((zone, index) => (
                <article className={index === 0 ? "best" : ""} key={`${zone.lat}-${zone.lon}`}>
                  <div className="rank">{String(index + 1).padStart(2, "0")}</div>
                  <div className="zone-name"><strong>{zone.name}</strong><small>{zone.reason}</small></div>
                  <dl>
                    <div><dt>거리</dt><dd>{zone.distance.toFixed(1)} km</dd></div>
                    <div><dt>파고</dt><dd>{zone.wave.toFixed(1)} m</dd></div>
                    <div><dt>수온</dt><dd>{zone.seaTemp.toFixed(1)}°</dd></div>
                  </dl>
                  <div className="score"><strong>{zone.score}</strong><span>/ 100</span></div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="method">
        <p className="overline">HOW IT WORKS</p>
        <h2>같은 답을 반복하지 않습니다.</h2>
        <div>
          <article><b>1</b><strong>주소 좌표 변환</strong><p>입력한 구·동·읍 단위 주소를 실제 위경도로 변환합니다.</p></article>
          <article><b>2</b><strong>주변 해역 탐색</strong><p>좌표 주변 여러 방향과 거리의 바다 후보지를 실시간으로 확인합니다.</p></article>
          <article><b>3</b><strong>안전·효율 점수</strong><p>이동거리 25%, 파고 45%, 바람 20%, 수온 10%로 비교합니다.</p></article>
        </div>
      </section>

      <footer><p>데이터 출처: {result?.sources.join(" · ") || "기상청 API허브 · Open-Meteo · OpenStreetMap"}</p><p>실제 출항 전 기상특보와 해상 안전정보를 반드시 확인하세요.</p></footer>
    </main>
  );
}
