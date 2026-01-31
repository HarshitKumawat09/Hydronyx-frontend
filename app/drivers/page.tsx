'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import Footer from '@/app/components/Footer';
import { BarChart3 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DriverContribution {
  factor: string;
  contribution_pct: number;
  contribution_abs: number;
  description: string;
}

export default function Drivers() {
  return (
    <ProtectedRoute>
      <DriversContent />
    </ProtectedRoute>
  );
}

function DriversContent() {
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [contributions, setContributions] = useState<DriverContribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState<string[]>(['Maharashtra', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Gujarat']);

  const loadDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ state });
      if (district) params.set('district', district);
      const res = await fetchWithAuth(`/api/drivers/attribution?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load attribution');
      const data = await res.json();
      setContributions(data.contributions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [state, district]);

  const chartData = contributions.map((c) => ({ name: c.factor, value: c.contribution_pct, abs: c.contribution_abs }));
  const COLORS = ['#06b6d4', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-[#060b16] flex">
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4">
          <h1 className="text-3xl font-bold text-white">Drivers of Change</h1>
          <p className="text-gray-400 text-sm mt-1">Attribution of groundwater change to rainfall, pumping, recharge</p>
        </div>
        <div className="p-8 flex-1">
          {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="mb-6 flex gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="px-4 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded-lg">
                {states.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">District (optional)</label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Pune" className="px-4 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded-lg" />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" /></div>
          ) : contributions.length > 0 ? (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Factor Contribution Chart</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#0a1428', border: '1px solid #00d4ff' }} />
                    <Bar dataKey="value" name="Contribution %">
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {contributions.map((c, i) => (
                  <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white capitalize">{c.factor}</span>
                      <span className="text-cyan-400">{c.contribution_pct}%</span>
                    </div>
                    <p className="text-sm text-gray-400">{c.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Absolute: {c.contribution_abs >= 0 ? '+' : ''}{c.contribution_abs}m</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-800/50 rounded-xl border border-cyan-500/20 text-center text-gray-400">No attribution data available</div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
