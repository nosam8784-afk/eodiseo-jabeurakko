"use client";

import { useEffect, useRef, useState } from "react";

type Zone = {
  name: string;
  lat: number;
  lon: number;
  distance: number;
  score: number;
  wave: number;
  seaTemp: number;
  catchIndex: number;
  catchLevel: string;
  targetSpecies: string;
};

type Props = {
  departure: { lat: number; lon: number; label: string };
  zones: Zone[];
};

declare global {
  interface Window {
    L?: {
      map: (element: HTMLElement, options: object) => LeafletMap;
      tileLayer: (url: string, options: object) => { addTo: (map: LeafletMap) => void };
      marker: (point: [number, number], options?: object) => LeafletLayer;
      divIcon: (options: object) => object;
      polyline: (points: [number, number][], options: object) => LeafletLayer;
      circle: (point: [number, number], options: object) => LeafletLayer;
      latLngBounds: (points: [number, number][]) => object;
    };
  }
}

type LeafletLayer = {
  addTo: (map: LeafletMap) => LeafletLayer;
  bindPopup: (html: string, options?: object) => LeafletLayer;
  openPopup?: () => void;
};

type LeafletMap = {
  fitBounds: (bounds: object, options?: object) => void;
  remove: () => void;
};

let leafletLoader: Promise<void> | null = null;

function loadLeaflet() {
  if (typeof window === "undefined" || window.L) return Promise.resolve();
  if (leafletLoader) return leafletLoader;
  leafletLoader = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet="true"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      stylesheet.dataset.leaflet = "true";
      document.head.appendChild(stylesheet);
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-leaflet="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("지도 모듈을 불러오지 못했습니다.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.dataset.leaflet = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("지도 모듈을 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
  return leafletLoader;
}

export default function RecommendationMap({ departure, zones }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let map: LeafletMap | null = null;
    let active = true;

    loadLeaflet()
      .then(() => {
        if (!active || !elementRef.current || !window.L) return;
        const L = window.L;
        map = L.map(elementRef.current, { zoomControl: true, scrollWheelZoom: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "© OpenStreetMap",
        }).addTo(map);

        const departureIcon = L.divIcon({
          className: "departure-marker",
          html: '<span class="departure-dot"></span><b>출발</b>',
          iconSize: [58, 30],
          iconAnchor: [14, 15],
        });
        L.marker([departure.lat, departure.lon], { icon: departureIcon })
          .addTo(map)
          .bindPopup(`<strong>출발지</strong><br>${departure.label}`);

        zones.forEach((zone, index) => {
          const color = index === 0 ? "#dff36d" : index === 1 ? "#44c4c9" : "#ffffff";
          L.polyline(
            [[departure.lat, departure.lon], [zone.lat, zone.lon]],
            { color, weight: index === 0 ? 3 : 2, opacity: 0.75, dashArray: index === 0 ? undefined : "7 7" },
          ).addTo(map);
          L.circle([zone.lat, zone.lon], {
            radius: index === 0 ? 2500 : 1700,
            color,
            weight: 2,
            fillColor: color,
            fillOpacity: index === 0 ? 0.2 : 0.1,
          }).addTo(map);
          const icon = L.divIcon({
            className: `zone-marker zone-marker-${index + 1}`,
            html: `<span>${index + 1}</span><b>${zone.score}점</b>`,
            iconSize: index === 0 ? [64, 64] : [52, 52],
            iconAnchor: index === 0 ? [32, 32] : [26, 26],
          });
          const marker = L.marker([zone.lat, zone.lon], { icon })
            .addTo(map)
            .bindPopup(
              `<div class="map-popup"><em>${index + 1}순위 · 어획 기대 ${zone.catchLevel}</em><strong>${zone.name}</strong><span>예상 어종 ${zone.targetSpecies}</span><span>파고 ${zone.wave.toFixed(1)}m · 수온 ${zone.seaTemp.toFixed(1)}°C</span><span>이동거리 ${zone.distance.toFixed(1)}km · 기대도 ${zone.catchIndex}점</span></div>`,
              { offset: [0, -18] },
            );
          if (index === 0) marker.openPopup?.();
        });

        const points: [number, number][] = [
          [departure.lat, departure.lon],
          ...zones.map((zone) => [zone.lat, zone.lon] as [number, number]),
        ];
        map.fitBounds(L.latLngBounds(points), { padding: [55, 55], maxZoom: 11 });
      })
      .catch(() => active && setMapError("지도를 불러오지 못했습니다. 잠시 후 새로고침해 주세요."));

    return () => {
      active = false;
      map?.remove();
    };
  }, [departure.lat, departure.lon, departure.label, zones]);

  return (
    <div className="interactive-map-wrap">
      <div className="map-legend">
        <span><i className="legend-departure" />출발지</span>
        <span><i className="legend-best" />1순위</span>
        <span><i className="legend-other" />2·3순위</span>
      </div>
      <div className="interactive-map" ref={elementRef} aria-label="출발지와 추천 해역 지도" />
      {mapError && <p className="map-error">지도가 잠깐 삐끗했네예. 새로고침 한 번 해보이소.</p>}
    </div>
  );
}
