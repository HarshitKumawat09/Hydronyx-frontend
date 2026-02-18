'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import Footer from '@/app/components/Footer'; // Import Footer
import {
  BarChart3,
  Settings2,
  TrendingUp,
  CheckCircle,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Info,
  TrendingDown,
  Target,
  MapPin,
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
import { fetchWithAuth } from '@/lib/api';

interface ValidationMetrics {
  rmse: number;
  mae: number;
  r_squared: number;
  physics_compliance: number;
  mean_absolute_percentage_error: number;
}

interface ComparisonMetric {
  metric_name: string;
  baseline_value: number;
  gnn_model_value: number;
  improvement_percentage: number;
}

interface ModelInfo {
  name: string;
  version: string;
  type: string;
  [key: string]: any;
}

interface ValidationData {
  metrics: ValidationMetrics;
  comparison_table: ComparisonMetric[];
  timestamp: string;
  model_info: ModelInfo;
}

export default function Validation() {
  return (
    <ProtectedRoute>
      <ValidationContent />
    </ProtectedRoute>
  );
}

function ValidationContent() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const metricsResponse = await fetchWithAuth('/api/validation/metrics');
      if (!metricsResponse.ok) {
        throw new Error('Failed to load validation metrics');
      }
      const metrics: ValidationData = await metricsResponse.json();
      setValidationData(metrics);

      try {
        const historyResponse = await fetchWithAuth('/api/validation/metrics/history?limit=10');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setMetricsHistory(historyData.history || []);
        }
      } catch (e) {
        console.error('Failed to load metrics history:', e);
      }

      try {
        const infoResponse = await fetchWithAuth('/api/validation/model-info');
        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          setModelInfo(infoData.model_info);
        }
      } catch (e) {
        console.error('Failed to load model info:', e);
      }

      setLoading(false);
    } catch (error) {
      console.error('Validation data loading error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to load validation data'}`);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Prepare history chart data
  const historyChartData = metricsHistory
    .slice()
    .reverse()
    .map((item) => ({
      date: item.date,
      rmse: item.rmse,
      r_squared: item.r_squared * 100,
      physics_compliance: item.physics_compliance * 100,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1428] via-[#0d1b3d] to-[#0a1428] flex">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#0f1b35]/95 backdrop-blur-md border-r border-cyan-500/20 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-cyan-500/20">
          {sidebarOpen && <span className="text-xl font-bold text-cyan-400">HydroAI</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-cyan-400 hover:bg-cyan-500/20 p-2 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          <Link
            href="/forecast"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Forecast</span>}
          </Link>
          <Link
            href="/policy"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}
          >
            <Settings2 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Policy</span>}
          </Link>
          <Link
            href="/optimizer"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}
          >
            <TrendingUp size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Optimizer</span>}
          </Link>
          <Link
            href="/validation"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer bg-cyan-500/20 text-cyan-400 border border-cyan-500/50`}
          >
            <CheckCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Validation</span>}
          </Link>
          <Link
            href="/location-gw"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}
          >
            <MapPin size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Location Insight</span>}
          </Link>
          <Link
            href="/alerts"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}
          >
            <AlertCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Alerts</span>}
          </Link>
          <Link
            href="/drivers"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Drivers</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content Wrapper - Added min-h-screen, flex-col */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 flex flex-col min-h-screen`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Model Performance - Validation</h1>
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

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading validation metrics...</p>
              </div>
            </div>
          ) : validationData ? (
            <>
              {/* Tab Navigation */}
              <div className="flex gap-4 mb-8 border-b border-cyan-500/20">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-medium transition ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-cyan-400 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-6 py-3 font-medium transition ${
                    activeTab === 'results'
                      ? 'border-b-2 border-cyan-400 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Results
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-3 font-medium transition ${
                    activeTab === 'history'
                      ? 'border-b-2 border-cyan-400 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab('model-info')}
                  className={`px-6 py-3 font-medium transition ${
                    activeTab === 'model-info'
                      ? 'border-b-2 border-cyan-400 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Model Info
                </button>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* RMSE Card */}
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8">
                      <h3 className="text-lg font-semibold text-gray-300 mb-6">RMSE</h3>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-5xl font-bold text-cyan-400">{validationData.metrics.rmse.toFixed(3)}</p>
                          <p className="text-xs text-gray-500 mt-2">Root Mean Squared Error</p>
                          <p className="text-xs text-green-400 mt-4">↓ Lower is better</p>
                        </div>
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                          <polyline
                            points="10,80 20,60 30,70 40,40 50,50 60,30 70,45 80,20 90,35"
                            fill="none"
                            stroke="#00d4ff"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Physics Compliance Card */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8">
                      <h3 className="text-lg font-semibold text-gray-300 mb-6">Physics Compliance</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-5xl font-bold text-green-400">
                            {Math.round(validationData.metrics.physics_compliance * 100)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Water Balance Adherence</p>
                          <p className="text-xs text-green-400 mt-4">↑ Higher is better</p>
                        </div>
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#334455" strokeWidth="8" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#00d4ff"
                              strokeWidth="8"
                              strokeDasharray={`${(validationData.metrics.physics_compliance * 100 * 2.51)} 251`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {Math.round(validationData.metrics.physics_compliance * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics Cards */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">MAE</p>
                      <p className="text-3xl font-bold text-purple-400">{validationData.metrics.mae.toFixed(3)}</p>
                      <p className="text-xs text-gray-500 mt-2">Mean Absolute Error</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">R²</p>
                      <p className="text-3xl font-bold text-blue-400">{(validationData.metrics.r_squared * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-2">R-squared Score</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">MAPE</p>
                      <p className="text-3xl font-bold text-orange-400">
                        {(validationData.metrics.mean_absolute_percentage_error * 100).toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Mean Absolute % Error</p>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Comparison Table</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-cyan-500/20">
                            <th className="text-left px-4 py-3 text-gray-400 font-semibold">Metric</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Baseline</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-semibold">GNN Model</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Improvement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationData.comparison_table.map((row, idx) => (
                            <tr key={idx} className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition">
                              <td className="px-4 py-3 text-white">{row.metric_name}</td>
                              <td className="px-4 py-3 text-right text-gray-400">{row.baseline_value.toFixed(4)}</td>
                              <td className="px-4 py-3 text-right text-cyan-400">{row.gnn_model_value.toFixed(4)}</td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-green-400 font-semibold">
                                  +{row.improvement_percentage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Model Accuracy Results</h2>
                    <p className="text-gray-400">Comprehensive evaluation of baseline vs GNN model performance</p>
                  </div>

                  {/* Model Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Baseline Model */}
                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-8">
                      <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                        <TrendingDown size={24} />
                        Baseline Model (Linear Regression)
                      </h3>
                      <div className="space-y-4">
                        {validationData.comparison_table.map((row, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-red-500/20">
                            <span className="text-gray-300">{row.metric_name}</span>
                            <span className="text-red-400 font-semibold">{row.baseline_value.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 p-4 bg-red-500/20 rounded-lg">
                        <p className="text-sm text-red-300">
                          Traditional statistical approach using rainfall and lagged groundwater data
                        </p>
                      </div>
                    </div>

                    {/* GNN Model */}
                    <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-8">
                      <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
                        <TrendingUp size={24} />
                        GNN Model (Spatiotemporal)
                      </h3>
                      <div className="space-y-4">
                        {validationData.comparison_table.map((row, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-green-500/20">
                            <span className="text-gray-300">{row.metric_name}</span>
                            <span className="text-green-400 font-semibold">{row.gnn_model_value.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 p-4 bg-green-500/20 rounded-lg">
                        <p className="text-sm text-green-300">
                          Advanced physics-informed graph neural network with spatiotemporal features
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Improvements Summary */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Target size={24} />
                      Performance Improvements
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {validationData.comparison_table.map((row, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-3xl font-bold text-green-400 mb-2">
                            +{row.improvement_percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">{row.metric_name}</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min(row.improvement_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Achievement */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <CheckCircle size={24} />
                      Target Achievement
                    </h3>
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">
                          {(validationData.metrics.r_squared * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">Current R² Score</div>
                      </div>
                      <div className="text-2xl text-gray-500">vs</div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">88.0%</div>
                        <div className="text-sm text-gray-400">Target Score</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${validationData.metrics.r_squared >= 0.88 ? 'text-green-400' : 'text-red-400'}`}>
                          {validationData.metrics.r_squared >= 0.88 ? '✅ PASSED' : '❌ FAILED'}
                        </div>
                        <div className="text-sm text-gray-400">Status</div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Results Table */}
                  <div className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 border border-slate-500/30 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Detailed Results Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-500/20">
                            <th className="text-left px-4 py-3 text-gray-400 font-semibold">Metric</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Baseline</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-semibold">GNN</th>
                            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Improvement</th>
                            <th className="text-center px-4 py-3 text-gray-400 font-semibold">Direction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationData.comparison_table.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-500/10 hover:bg-slate-800/30 transition">
                              <td className="px-4 py-3 text-white font-medium">{row.metric_name}</td>
                              <td className="px-4 py-3 text-right text-red-400">{row.baseline_value.toFixed(4)}</td>
                              <td className="px-4 py-3 text-right text-green-400">{row.gnn_model_value.toFixed(4)}</td>
                              <td className="px-4 py-3 text-right text-cyan-400 font-semibold">
                                +{row.improvement_percentage.toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-center">
                                {row.metric_name.includes('R²') || row.metric_name.includes('Accuracy') ? (
                                  <span className="text-green-400">↑ Higher Better</span>
                                ) : (
                                  <span className="text-blue-400">↓ Lower Better</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 text-center text-gray-400 text-sm">
                      Last updated: {new Date(validationData.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Metrics History</h2>
                  {historyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={historyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a1428',
                            border: '1px solid #00d4ff',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rmse"
                          stroke="#00d4ff"
                          strokeWidth={2}
                          name="RMSE"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="r_squared"
                          stroke="#00ff88"
                          strokeWidth={2}
                          name="R² (%)"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="physics_compliance"
                          stroke="#ffaa00"
                          strokeWidth={2}
                          name="Physics Compliance (%)"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No history data available</p>
                  )}
                </div>
              )}

              {/* Model Info Tab */}
              {activeTab === 'model-info' && modelInfo && (
                <div className="space-y-6">
                  {/* Model Overview */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Info size={24} />
                      Model Overview
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Name</p>
                        <p className="text-lg font-semibold text-white">{modelInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Version</p>
                        <p className="text-lg font-semibold text-white">{modelInfo.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Type</p>
                        <p className="text-lg font-semibold text-white">{modelInfo.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Release Date</p>
                        <p className="text-lg font-semibold text-white">{modelInfo.release_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Architecture */}
                  {modelInfo.architecture && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-8">
                      <h3 className="text-lg font-bold text-white mb-4">Architecture</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(modelInfo.architecture).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-xs text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                            <p className="text-lg font-semibold text-white mt-1">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Training Details */}
                  {modelInfo.training && (
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8">
                      <h3 className="text-lg font-bold text-white mb-4">Training Details</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(modelInfo.training).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-xs text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                            <p className="text-lg font-semibold text-white mt-1">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physics Constraints */}
                  {modelInfo.physics_constraints && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-8">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Target size={20} />
                        Physics Constraints
                      </h3>
                      <ul className="grid grid-cols-2 gap-3">
                        {modelInfo.physics_constraints.map((constraint: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-300">
                            <span className="text-orange-400">✓</span>
                            {constraint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations */}
                  {modelInfo.limitations && (
                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-8">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Limitations
                      </h3>
                      <ul className="space-y-2">
                        {modelInfo.limitations.map((limitation: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-300">
                            <span className="text-red-400 mt-1">•</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Added Here */}
        <Footer />
      </div>
    </div>
  );
}