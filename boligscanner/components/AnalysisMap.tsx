'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Leaflet + webpack
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

export default function AnalysisMap({ lat, lng, activeLayers }: AnalysisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circlesRef = useRef<Record<string, L.Circle>>({});
  const [mounted, setMounted] = useState(false);

  // Handle client-only rendering to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circlesRef.current = {};
    };
  }, [mounted, lat, lng]);

  // Sync overlay circles with activeLayers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove circles that are no longer active
    for (const key of Object.keys(circlesRef.current)) {
      if (!activeLayers.includes(key)) {
        circlesRef.current[key].removeFrom(map);
        delete circlesRef.current[key];
      }
    }

    // Add circles for newly active layers
    for (const layer of activeLayers) {
      const config = LAYER_CONFIG[layer];
      if (!config || circlesRef.current[layer]) continue;

      const circle = L.circle([lat, lng], {
        radius: config.radius,
        color: config.color,
        fillColor: config.color,
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);

      circlesRef.current[layer] = circle;
    }
  }, [activeLayers, lat, lng]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-warm-gray-100 rounded-[4px] animate-pulse" />
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full rounded-[4px]" />;
}
