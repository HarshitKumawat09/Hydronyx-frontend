'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import Footer from '@/app/components/Footer';
import {
  BarChart3,
  Settings2,
  TrendingUp,
  CheckCircle,
  LogOut,
  Menu,
  X,
  Zap,
  Signal,
  AlertCircle,
  TrendingDown,
  Droplet,
  FileDown,
  GitCompare,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import RiskDisclaimer from '@/app/components/RiskDisclaimer';
import UncertaintyWarning from '@/app/components/UncertaintyWarning';
import { fetchWithAuth, apiUrl } from '@/lib/api';

interface SimulationResult {
  baseline_trajectory: Array<{ month: number; groundwater: number; rainfall?: number }>;
  counterfactual_trajectory: Array<{ month: number; groundwater: number; rainfall?: number }>;
  mean_effect: number;
  final_effect: number;
  cumulative_effect: number;
  uncertainty_margin: number;
}

interface StoredIntervention {
  id: string;
  user_id: string;
  params: {
    state: string;
    pumping_change: number;
    recharge_structures: number;
    crop_intensity_change: number;
    months_ahead: number;
  };
  result: {
    mean_effect: number;
    final_effect: number;
    cumulative_effect: number;
    uncertainty_margin: number;
  };
  baseline_trajectory: Array<{ month: number; groundwater: number; rainfall?: number }>;
  counterfactual_trajectory: Array<{ month: number; groundwater: number; rainfall?: number }>;
  created_at: string;
}

export default function Policy() {
  return (
    <ProtectedRoute>
      <PolicyContent />
    </ProtectedRoute>
  );
}

function PolicyContent() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [pumpingChange, setPumpingChange] = useState(25);
  const [rechargeStructures, setRechargeStructures] = useState(10);
  const [cropIntensityChange, setCropIntensityChange] = useState(0);
  const [monthsAhead, setMonthsAhead] = useState(12);
  
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [interventionHistory, setInterventionHistory] = useState<StoredIntervention[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [states, setStates] = useState<string[]>([
    'Maharashtra',
    'Haryana',
    'Punjab',
    'Uttar Pradesh',
    'Rajasthan',
    'Gujarat',
    'Madhya Pradesh',
  ]);

  useEffect(() => {
    loadStates();
    loadInterventionHistory();
  }, []);

  const handleExportPdf = async (interventionId: string) => {
    try {
      const res = await fetchWithAuth(`/api/policy/export-pdf?intervention_id=${encodeURIComponent(interventionId)}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'policy_comparison.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const loadInterventionHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetchWithAuth('/api/policy/history?limit=10');
      if (res.ok) {
        const data = await res.json();
        setInterventionHistory(data.interventions || []);
      }
    } catch (e) {
      console.error('Failed to load intervention history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadStates = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetchWithAuth('/api/policy/states');
        if (response.ok) {
          const data = await response.json();
          setStates(data.states);
        }
      }
    } catch (error) {
      console.error('Failed to load states:', error);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setSimulating(false);
        return;
      }

      const response = await fetchWithAuth('/api/policy/simulate', {
        method: 'POST',
        body: JSON.stringify({
          state: selectedState,
          pumping_change: pumpingChange,
          recharge_structures: rechargeStructures,
          crop_intensity_change: cropIntensityChange,
          months_ahead: monthsAhead,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to run simulation');
      }

      const data: SimulationResult = await response.json();
      setSimulationResult(data);
      await loadInterventionHistory();
    } catch (error) {
      console.error('Simulation error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to run simulation'}`);
    } finally {
      setSimulating(false);
    }
  };

  const loadStoredIntervention = (item: StoredIntervention) => {
    setSimulationResult({
      baseline_trajectory: item.baseline_trajectory,
      counterfactual_trajectory: item.counterfactual_trajectory,
      mean_effect: item.result.mean_effect,
      final_effect: item.result.final_effect,
      cumulative_effect: item.result.cumulative_effect,
      uncertainty_margin: item.result.uncertainty_margin,
    });
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Prepare chart data
  const chartData = simulationResult
    ? simulationResult.baseline_trajectory.map((baseline, idx) => ({
        month: baseline.month,
        baseline: baseline.groundwater,
        intervention: simulationResult.counterfactual_trajectory[idx]?.groundwater || 0,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1428] via-[#0d1b3d] to-[#0a1428] flex">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-[#0f1b35]/95 backdrop-blur-md border-r border-cyan-500/20 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between h-20 px-4 border-b border-cyan-500/20">
          {sidebarOpen && <span className="text-xl font-bold text-cyan-400">HydroAI</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-cyan-400 hover:bg-cyan-500/20 p-2 rounded-lg transition">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          <Link href="/forecast" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Forecast</span>}
          </Link>
          <Link href="/policy" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer bg-cyan-500/20 text-cyan-400 border border-cyan-500/50`}>
            <Settings2 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Policy</span>}
          </Link>
          <Link href="/optimizer" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <TrendingUp size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Optimizer</span>}
          </Link>
          <Link href="/validation" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <CheckCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Validation</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content - Added flex flex-col and min-h-screen */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Counterfactual Policy Simulator</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition border border-red-500/50"
            >
              <LogOut size={18} />
              <span className="text-sm">Log Out</span>
            </button>
          </div>
        </div>

        {/* Content - Added flex-1 to push footer down */}
        <div className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <RiskDisclaimer variant="policy" className="mb-6" />
          {simulationResult && (
            <UncertaintyWarning
              uncertainty={simulationResult.uncertainty_margin}
              uncertaintyThreshold={0.15}
              className="mb-6"
            />
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">API Status</p>
                  <p className="text-2xl font-bold text-green-400">Online</p>
                </div>
                <Signal className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">SCM Model</p>
                  <p className="text-2xl font-bold text-purple-400">Active</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Mean Effect</p>
                  <p className="text-2xl font-bold text-cyan-400">{simulationResult?.mean_effect.toFixed(3) || '0'}m</p>
                </div>
                <Droplet className="w-8 h-8 text-cyan-400 opacity-50" />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Uncertainty</p>
                  <p className="text-2xl font-bold text-blue-400">±{(simulationResult?.uncertainty_margin.toFixed(3) || '0')}m</p>
                </div>
                <TrendingDown className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Intervention Design Panel */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 h-fit">
              <h2 className="text-xl font-bold text-white mb-6">Intervention Design</h2>
              <div className="space-y-6">
                {/* State Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded-lg focus:outline-none focus:border-cyan-400"
                  >
                    {states.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Pumping Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pumping Change (%)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={pumpingChange}
                    onChange={(e) => setPumpingChange(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>-50</span>
                    <span className="text-cyan-400 font-bold">{pumpingChange}</span>
                    <span>+50</span>
                  </div>
                </div>

                {/* Recharge Structures */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recharge Structures (Units)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={rechargeStructures}
                    onChange={(e) => setRechargeStructures(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0</span>
                    <span className="text-cyan-400 font-bold">{rechargeStructures}</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Crop Intensity Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Crop Intensity Change (%)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={cropIntensityChange}
                    onChange={(e) => setCropIntensityChange(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>-50</span>
                    <span className="text-cyan-400 font-bold">{cropIntensityChange}</span>
                    <span>+50</span>
                  </div>
                </div>

                {/* Time Horizon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Forecast Horizon: <span className="text-cyan-400">{monthsAhead} months</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={monthsAhead}
                    onChange={(e) => setMonthsAhead(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Simulate Button */}
                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  {simulating ? 'Running...' : 'Run Simulation'}
                </button>
              </div>
            </div>

            {/* Results Chart */}
            <div className="col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Simulation Results</h2>
              {simulationResult && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a1428',
                        border: '1px solid #00d4ff',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => value.toFixed(2)}
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
                      name="Intervention"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  <p>Run a simulation to see results</p>
                </div>
              )}
            </div>
          </div>

          {/* Impact Analysis */}
          {simulationResult && (
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-3">Mean Effect (avg over period)</p>
                <p className="text-4xl font-bold text-cyan-400">
                  {simulationResult.mean_effect > 0 ? '+' : ''}
                  {simulationResult.mean_effect.toFixed(3)}m
                </p>
                <p className="text-xs text-gray-500 mt-2">meters below ground level change</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-3">Final Effect (at end of period)</p>
                <p className="text-4xl font-bold text-purple-400">
                  {simulationResult.final_effect > 0 ? '+' : ''}
                  {simulationResult.final_effect.toFixed(3)}m
                </p>
                <p className="text-xs text-gray-500 mt-2">total change from baseline</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-3">Cumulative Effect</p>
                <p className="text-4xl font-bold text-green-400">
                  {simulationResult.cumulative_effect > 0 ? '+' : ''}
                  {simulationResult.cumulative_effect.toFixed(3)}m
                </p>
                <p className="text-xs text-gray-500 mt-2">sum of all monthly changes</p>
              </div>
            </div>
          )}

          {/* Intervention Summary */}
          {simulationResult && (
            <div className="mt-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Intervention Summary</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">State</p>
                  <p className="text-lg font-bold text-white">{selectedState}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Pumping Reduction</p>
                  <p className="text-lg font-bold text-cyan-400">{pumpingChange}%</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Recharge Units</p>
                  <p className="text-lg font-bold text-cyan-400">{rechargeStructures}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Time Horizon</p>
                  <p className="text-lg font-bold text-cyan-400">{monthsAhead} months</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Interventions (stored history) */}
          <div className="mt-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Interventions</h2>
            {historyLoading ? (
              <p className="text-gray-400 text-sm">Loading history…</p>
            ) : interventionHistory.length === 0 ? (
              <p className="text-gray-400 text-sm">Run a simulation to see stored interventions here.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {interventionHistory.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadStoredIntervention(item)}
                      className="flex-1 text-left p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item.params.state} · Pump {item.params.pumping_change}% · Recharge {item.params.recharge_structures}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.params.months_ahead} months · {typeof item.created_at === 'string' ? new Date(item.created_at).toLocaleString() : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-cyan-400">
                            {item.result.mean_effect >= 0 ? '+' : ''}{item.result.mean_effect.toFixed(3)} m
                          </p>
                          <p className="text-xs text-gray-400">mean effect</p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPdf(item.id)}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400"
                      title="Export PDF"
                    >
                      <FileDown size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Added Here */}
        <Footer />
      </div>
    </div>
  );
}