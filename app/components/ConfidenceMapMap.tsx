"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ConfidenceMapMap({ geojson, styleFeature, containerId, onFeatureClick }: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // If a previous map exists on this ref, remove it first
    try {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // also attempt to clear any Leaflet instance attached to DOM node
      const el = containerRef.current;
      if ((el as any)._leaflet_id) {
        // nothing to do extra; map.remove() handles cleanup
      }
    } catch (e) {
      // ignore
    }

    // create fresh map
    const map = L.map(containerRef.current as HTMLElement, { center: [22.0, 78.0], zoom: 5, scrollWheelZoom: false });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let layer: any = null;
    try {
      layer = L.geoJSON(geojson, {
        style: styleFeature,
        onEachFeature: function (feature: any, layerEl: any) {
          layerEl.getElement && (layerEl.getElement().style.cursor = 'pointer');
          layerEl.on && layerEl.on('click', function () {
            try {
              const name = (feature && feature.properties && (feature.properties.state_name || feature.properties.state || ''));
              if (onFeatureClick && name) onFeatureClick(name);
            } catch (e) {
              // ignore
            }
          });
        }
      }).addTo(map);
      const bounds = layer.getBounds();
      if (bounds && bounds.isValid && bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 8, padding: [20, 20] });
      }
    } catch (e) {
      // ignore
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, [geojson, styleFeature, containerId]);

  return <div id={containerId} ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
