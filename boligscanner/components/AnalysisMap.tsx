'use client';

import { useEffect, useRef } from 'react';
import type L from 'leaflet';

interface AnalysisMapProps {
  lat: number;
  lng: number;
  activeLayers: string[];
}

const LAYER_CONFIG: Record<string, { color: string; radius: number }> = {
  family:       { color: '#5C8A6A', radius: 1000 },
  risk:         { color: '#C4594A', radius: 500 },
  building:     { color: '#B8944F', radius: 200 },
  neighborhood: { color: '#1B2A4A', radius: 1500 },
  climate:      { color: '#D4915C', radius: 2000 },
  trends:       { color: '#2A3D66', radius: 3000 },
};

function AnalysisMapInner({ lat, lng, activeLayers }: AnalysisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circlesRef = useRef<Record<string, L.Circle>>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const leaflet = require('leaflet') as typeof L;
    require('leaflet/dist/leaflet.css');

    const defaultIcon = leaflet.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const map = leaflet.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
    });

    leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    leaflet.marker([lat, lng], { icon: defaultIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      circlesRef.current = {};
    };
  }, [lat, lng]);

  // Sync overlay circles with activeLayers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const leaflet = require('leaflet') as typeof L;

    for (const key of Object.keys(circlesRef.current)) {
      if (!activeLayers.includes(key)) {
        circlesRef.current[key].removeFrom(map);
        delete circlesRef.current[key];
      }
    }

    for (const layer of activeLayers) {
      const config = LAYER_CONFIG[layer];
      if (!config || circlesRef.current[layer]) continue;

      const circle = leaflet.circle([lat, lng], {
        radius: config.radius,
        color: config.color,
        fillColor: config.color,
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);

      circlesRef.current[layer] = circle;
    }
  }, [activeLayers, lat, lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '500px' }}
      className="rounded-[4px]"
    />
  );
}

// Export with dynamic import to prevent SSR
import dynamic from 'next/dynamic';

const AnalysisMap = dynamic(() => Promise.resolve(AnalysisMapInner), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '500px' }} className="bg-warm-gray-100 rounded-[4px] animate-pulse" />
  ),
});

export default AnalysisMap;
