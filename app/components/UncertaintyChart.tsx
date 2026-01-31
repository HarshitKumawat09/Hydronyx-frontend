"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { fetchWithAuth } from "@/lib/api";

interface Point {
  date: string;
  mean: number;
  lower: number;
  upper: number;
}

export default function UncertaintyChart({ state, horizon }: { state: string; horizon: number }) {
  const [data, setData] = useState<Point[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state) return;
    const fetchUnc = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ state, horizon: String(horizon) });
        const res = await fetchWithAuth(`/api/validation/uncertainty?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch uncertainty data");
        const j = await res.json();
        setData(j.predictions || []);
        setSource(j.source || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchUnc();
  }, [state, horizon]);

  return (
    <div className="mt-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-500/20 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3">Uncertainty Projection ({state})</h4>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!loading && !error && (
        <div style={{ width: "100%", height: 220 }}>
          {source && <p className="text-xs text-gray-400 mb-1">Source: {source}</p>}
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b3446" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#0a1428', border: '1px solid #00d4ff' }} />
              <Legend />
              <Line type="monotone" dataKey="mean" stroke="#00d4ff" dot={false} name="Mean" />
              <Line type="monotone" dataKey="lower" stroke="#60a5fa" strokeDasharray="3 3" dot={false} name="Lower 95%" />
              <Line type="monotone" dataKey="upper" stroke="#60a5fa" strokeDasharray="3 3" dot={false} name="Upper 95%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
