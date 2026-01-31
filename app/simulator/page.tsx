'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import Footer from '@/app/components/Footer';
import { fetchWithAuth } from '@/lib/api';

interface TrajectoryPoint {
  month: number;
  groundwater: number;
  rainfall?: number;
}

interface SimulationResult {
  baseline_trajectory: TrajectoryPoint[];
  counterfactual_trajectory: TrajectoryPoint[];
  mean_effect: number;
  final_effect: number;
  cumulative_effect: number;
  uncertainty_margin: number;
}

function SimulatorContent() {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [pumpingChange, setPumpingChange] = useState(20);
  const [rechargeStructures, setRechargeStructures] = useState(10);
  const [cropIntensityChange, setCropIntensityChange] = useState(0);
  const [monthsAhead, setMonthsAhead] = useState(12);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const res = await fetchWithAuth('/api/policy/states');
      if (res.ok) {
        const data = await res.json();
        const list = data.states || [];
        setStates(list);
        if (list.length && !selectedState) setSelectedState(list[0]);
      }
    } catch {
      setStates([]);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setError('Please sign in to run simulations');
        setLoading(false);
        return;
      }

      const res = await fetchWithAuth('/api/policy/simulate', {
        method: 'POST',
        body: JSON.stringify({
          state: selectedState,
          pumping_change: pumpingChange,
          recharge_structures: rechargeStructures,
          crop_intensity_change: cropIntensityChange,
          months_ahead: monthsAhead,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Simulation failed');
      }

      const data: SimulationResult = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const chartData = results
    ? results.baseline_trajectory.map((b, i) => ({
        month: b.month,
        baseline: b.groundwater,
        intervention: results.counterfactual_trajectory[i]?.groundwater ?? 0,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1428] via-[#0d1b3d] to-[#0a1428]">
      <header className="sticky top-0 z-40 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="text-white">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Policy Simulator (SCM)</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Configure policy (real SCM)</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400"
                >
                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Pumping change (%)</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={pumpingChange}
                  onChange={(e) => setPumpingChange(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="text-cyan-400 text-sm mt-2">{pumpingChange}%</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Recharge structures</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={rechargeStructures}
                  onChange={(e) => setRechargeStructures(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="text-cyan-400 text-sm mt-2">{rechargeStructures}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Crop intensity change (%)</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={cropIntensityChange}
                  onChange={(e) => setCropIntensityChange(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="text-cyan-400 text-sm mt-2">{cropIntensityChange}%</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Months ahead</label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={monthsAhead}
                  onChange={(e) => setMonthsAhead(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="text-cyan-400 text-sm mt-2">{monthsAhead}</p>
              </div>

              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50"
              >
                {loading ? 'Running...' : 'Run simulation'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {results ? (
              <div className="space-y-6">
                <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Counterfactual analysis (SCM)</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">Baseline (final month)</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {results.baseline_trajectory[results.baseline_trajectory.length - 1]?.groundwater.toFixed(2)} m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">With policy</p>
                      <p className="text-2xl font-bold text-green-400">
                        {results.counterfactual_trajectory[results.counterfactual_trajectory.length - 1]?.groundwater.toFixed(2)} m
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
                    <p className="text-green-400 font-semibold">
                      Mean effect: {results.mean_effect >= 0 ? '+' : ''}{results.mean_effect.toFixed(3)} m
                      {' · '}
                      Final effect: {results.final_effect >= 0 ? '+' : ''}{results.final_effect.toFixed(3)} m
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Trajectories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0a1428', border: '1px solid #00d4ff', borderRadius: '8px' }}
                        formatter={(value: number) => [value?.toFixed(2) ?? value, '']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="baseline"
                        stroke="#888"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Baseline"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="intervention"
                        stroke="#00d4ff"
                        strokeWidth={3}
                        name="With policy"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center min-h-80">
                <p className="text-gray-400">Configure policy and run simulation to see SCM results</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Simulator() {
  return (
    <ProtectedRoute>
      <SimulatorContent />
    </ProtectedRoute>
  );
}
