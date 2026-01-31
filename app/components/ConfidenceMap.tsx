"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { fetchWithAuth } from "@/lib/api";

const MapViewer = dynamic(() => import("./ConfidenceMapMap"), { ssr: false });

interface Entry {
  state: string;
  confidence: number;
  samples: number;
}

export default function ConfidenceMap() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [districtEntries, setDistrictEntries] = useState<any[] | null>(null);
  const [geojson, setGeojson] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMap = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchWithAuth("/api/validation/confidence-map");
        if (!res.ok) throw new Error("Failed to fetch confidence map");
        const data = await res.json();
        setEntries(data.entries || []);

        const gjRes = await fetchWithAuth("/api/validation/regions");
        if (gjRes.ok) {
          const gj = await gjRes.json();
          // attach confidence to features by state name lowercased
          const mapByState: Record<string, Entry> = {};
          (data.entries || []).forEach((e: Entry) => (mapByState[e.state.toLowerCase()] = e));
          gj.features = gj.features.map((f: any) => {
            const name = (f.properties.state_name || f.properties.state || "").toLowerCase();
            const match = mapByState[name];
            f.properties._confidence = match ? Math.round((match.confidence || 0) * 100) : 0;
            return f;
          });
          setGeojson(gj);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, []);

  const fetchDistricts = async (stateName: string) => {
    setDistrictEntries(null);
    try {
      const q = encodeURIComponent(stateName);
      const res = await fetchWithAuth(`/api/validation/confidence-map/districts?state=${q}`);
      if (!res.ok) throw new Error('Failed to fetch district confidence');
      const data = await res.json();
      setDistrictEntries(data.entries || []);
    } catch (e) {
      setDistrictEntries([]);
    }
  };

  const getColor = (v: number) => {
    if (v > 75) return '#00441b';
    if (v > 50) return '#1b7837';
    if (v > 25) return '#7fbf7b';
    if (v > 0) return '#c7e9c0';
    return '#f0f0f0';
  };

  const styleFeature = (feature: any) => ({
    fillColor: getColor(feature.properties._confidence || 0),
    weight: 1,
    opacity: 1,
    color: '#0b2740',
    fillOpacity: 0.8,
  });

  const containerIdRef = useRef(`leaflet-${Math.random().toString(36).slice(2,9)}`);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // when geojson becomes available, toggle a short delay before mounting the map
    if (geojson) {
      // regenerate container id to force a fresh MapContainer
      containerIdRef.current = `leaflet-${Date.now().toString(36)}`;
      // if a previous DOM node exists for the new id (HMR/fast refresh), replace it
      try {
        const existing = document.getElementById(containerIdRef.current);
        if (existing && existing.parentElement) {
          const parent = existing.parentElement;
          const fresh = document.createElement('div');
          fresh.id = containerIdRef.current;
          fresh.style.width = '100%';
          fresh.style.height = '100%';
          parent.replaceChild(fresh, existing);
        }
      } catch (e) {
        // ignore DOM errors
      }
      setShowMap(false);
      const t = setTimeout(() => setShowMap(true), 80);
      return () => clearTimeout(t);
    } else {
      setShowMap(false);
    }
  }, [geojson]);

  return (
    <div className="mt-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-500/20 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3">Confidence Choropleth (proxy)</h4>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!loading && !error && geojson && showMap && (
        <div style={{ height: 260 }}>
          {/* MapViewer is client-only to avoid SSR importing Leaflet */}
          <MapViewer geojson={geojson} styleFeature={styleFeature} containerId={containerIdRef.current} onFeatureClick={fetchDistricts} />
        </div>
      )}
      {!loading && !error && !geojson && (
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead>
              <tr>
                <th className="py-1">State</th>
                <th className="py-1">Confidence</th>
                <th className="py-1">Samples</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.state} className="border-t border-cyan-500/10 hover:bg-slate-800/40 cursor-pointer" onClick={() => fetchDistricts(e.state)}>
                  <td className="py-1">{e.state}</td>
                  <td className="py-1">{(e.confidence * 100).toFixed(1)}%</td>
                  <td className="py-1">{e.samples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {districtEntries && (
        <div className="mt-3 bg-slate-800/50 rounded p-2 text-sm text-gray-200">
          <h5 className="font-medium text-white mb-2">District confidence</h5>
          {districtEntries.length === 0 && <p className="text-gray-400">No district data found.</p>}
          {districtEntries.length > 0 && (
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-200">
                <tbody>
                  {districtEntries.map((d: any) => (
                    <tr key={`${d.state}::${d.district}`} className="border-t border-cyan-500/10">
                      <td className="py-1">{d.district} <span className="text-xs text-gray-400">({d.state})</span></td>
                      <td className="py-1">{(d.confidence * 100).toFixed(1)}%</td>
                      <td className="py-1">{d.samples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
