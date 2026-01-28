'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SiteData {
  id: string;
  latitude: number;
  longitude: number;
  state: string;
  impact_score: number;
  total_score: number;
  estimated_cost: number;
  explanation: string;
}

interface MapComponentProps {
  sites: SiteData[];
  mapCenter: { latitude: number; longitude: number };
  bounds: { north: number; south: number; east: number; west: number };
  onSiteSelect: (site: SiteData) => void;
  selectedSite: SiteData | null;
}

export default function OptimizerMap({
  sites,
  mapCenter,
  bounds,
  onSiteSelect,
  selectedSite,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [mapCenter.latitude, mapCenter.longitude],
        8
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    // Clear existing markers
    Object.values(markerRef.current).forEach((marker) => {
      mapInstance.current?.removeLayer(marker);
    });
    markerRef.current = {};

    // Add site markers
    sites.forEach((site) => {
      const isSelected = selectedSite?.id === site.id;
      const iconColor = isSelected ? '#00d4ff' : '#00ff00';
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background-color: ${iconColor};
            border: 3px solid ${isSelected ? '#00a8cc' : '#00cc00'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isSelected ? '15px' : '8px'} ${iconColor}80;
          ">
            <span style="color: #000; font-weight: bold; font-size: 12px;">
              ${(sites.indexOf(site) + 1).toString()}
            </span>
          </div>
        `,
        iconSize: [30, 30],
        className: '',
      });

      const marker = L.marker([site.latitude, site.longitude], {
        icon: customIcon,
      }).addTo(mapInstance.current!);

      marker.on('click', () => onSiteSelect(site));

      marker.bindPopup(`
        <div style="font-family: Arial, sans-serif; color: #fff;">
          <h4 style="color: #00d4ff; margin: 0 0 8px 0;">${site.id}</h4>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Impact:</strong> ${site.impact_score.toFixed(3)}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Score:</strong> ${site.total_score.toFixed(3)}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Cost:</strong> ₹${site.estimated_cost.toFixed(1)}L
          </p>
        </div>
      `);

      markerRef.current[site.id] = marker;
    });

    // Fit bounds if there are sites
    if (sites.length > 0) {
      const siteBounds = L.latLngBounds(
        sites.map((site) => [site.latitude, site.longitude] as [number, number])
      );
      mapInstance.current?.fitBounds(siteBounds, { padding: [50, 50] });
    }

    // Add boundary rectangle
    const boundaryBox = L.rectangle(
      [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ],
      {
        color: '#00d4ff',
        weight: 2,
        opacity: 0.5,
        fill: false,
        dashArray: '5, 5',
      }
    ).addTo(mapInstance.current!);

    return () => {
      boundaryBox.remove();
    };
  }, [sites, selectedSite, mapCenter, bounds]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
