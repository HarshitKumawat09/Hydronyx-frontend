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

interface ForecastData {
  params: {
    state: string;
    district: string;
    forecast_horizon: number;
    rainfall: number;
    lagging_gw: number;
  };
  result: {
    predicted_level: number;
    confidence: number;
    uncertainty: number;
    physics_compliance: number;
  };
  timestamp: string;
}

export default function Forecast() {
  return (
    <ProtectedRoute>
      <ForecastContent />
    </ProtectedRoute>
  );
}

function ForecastContent() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [forecastHorizon, setForecastHorizon] = useState(6);
  const [rainfall, setRainfall] = useState(100);
  const [laggingGW, setLaggingGW] = useState(45.0);
  
  const [history, setHistory] = useState<ForecastData[]>([]);
  const [currentForecast, setCurrentForecast] = useState<ForecastData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  // State to district mapping
  const stateDistrictMap: { [key: string]: string[] } = {
    Maharashtra: ['Pune', 'Mumbai', 'Nagpur', 'Aurangabad', 'Nashik'],
    Haryana: ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat'],
    Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Chandigarh', 'Bathinda'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'],
  };

  const getDistricts = () => {
    return stateDistrictMap[selectedState] || [];
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const districts = stateDistrictMap[newState] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    }
  };

  const generateChartData = () => {
    const data = [];
    const baseLevel = currentForecast?.result.predicted_level || 45;
    for (let i = 0; i <= forecastHorizon; i++) {
      data.push({
        month: i,
        actual: i === 0 ? baseLevel : baseLevel + Math.sin(i) * 2 + (Math.random() - 0.5) * 1,
        predicted: baseLevel + (i * 0.15) + Math.sin(i * 0.5) * 1.5,
      });
    }
    return data;
  };

  const chartData = generateChartData();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setDataLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setDataLoading(false);
        return;
      }

      const historyResponse = await fetch(
        'http://localhost:8000/api/forecast/history?limit=10',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.data || []);
        if (historyData.data && historyData.data.length > 0) {
          setCurrentForecast(historyData.data[0]);
        }
      }

      setDataLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDataLoading(false);
    }
  };

  const handleGenerateForecast = async () => {
    setGenerating(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setGenerating(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/forecast/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          forecast_horizon: forecastHorizon,
          rainfall_value: rainfall,
          lag_gw: laggingGW,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate forecast');
      }

      const data = await response.json();
      const newForecast: ForecastData = {
        params: data.params,
        result: data.result,
        timestamp: data.timestamp,
      };

      setCurrentForecast(newForecast);
      setHistory([newForecast, ...history]);
    } catch (error) {
      console.error('Forecast generation error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to generate forecast'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

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
          <Link href="/forecast" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer bg-cyan-500/20 text-cyan-400 border border-cyan-500/50`}>
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Forecast</span>}
          </Link>
          <Link href="/policy" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
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

      {/* Main Content Wrapper - Added flex flex-col */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Physics-Informed Forecast</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition border border-red-500/50">
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

          {dataLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading forecast data...</p>
              </div>
            </div>
          )}

          {!dataLoading && (
            <>
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
                      <p className="text-sm text-gray-400 mb-2">GNN Model</p>
                      <p className="text-2xl font-bold text-purple-400">Active</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Physics Compliance</p>
                      <p className="text-2xl font-bold text-cyan-400">{currentForecast?.result.physics_compliance || 90}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-cyan-400 opacity-50" />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Uncertainty</p>
                      <p className="text-2xl font-bold text-blue-400">{currentForecast?.result.uncertainty || 0.5}m</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-3 gap-8">
                {/* Chart */}
                <div className="col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Groundwater Forecast - {selectedState}</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" stroke="#888" label={{ value: 'Months Ahead', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis stroke="#888" label={{ value: 'Level (m)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a1428', border: '1px solid #00d4ff' }} />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2} name="95% Confidence" dot={false} />
                      <Line type="monotone" dataKey="predicted" stroke="#00d4ff" strokeWidth={2} strokeDasharray="5 5" name="Predicted GW Level" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Configuration */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select State</label>
                        <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded-lg focus:outline-none focus:border-cyan-400">
                          <option>Maharashtra</option>
                          <option>Haryana</option>
                          <option>Punjab</option>
                          <option>Uttar Pradesh</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">District</label>
                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded-lg focus:outline-none focus:border-cyan-400">
                          {getDistricts().map((district) => (
                            <option key={district}>{district}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Forecast Horizon: <span className="text-cyan-400">{forecastHorizon} months</span></label>
                        <input type="range" min="1" max="12" value={forecastHorizon} onChange={(e) => setForecastHorizon(Number(e.target.value))} className="w-full accent-cyan-400" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Expected Rainfall: <span className="text-cyan-400">{rainfall} mm</span></label>
                        <input type="range" min="0" max="500" step="10" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))} className="w-full accent-cyan-400" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current GW Level: <span className="text-cyan-400">{laggingGW.toFixed(2)} m</span></label>
                        <input type="range" min="0" max="100" step="0.5" value={laggingGW} onChange={(e) => setLaggingGW(Number(e.target.value))} className="w-full accent-cyan-400" />
                      </div>
                    </div>
                  </div>

                  <button onClick={handleGenerateForecast} disabled={generating} className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Zap size={20} />
                    {generating ? 'Generating...' : 'Generate Forecast'}
                  </button>
                </div>
              </div>

              {/* Results */}
              {currentForecast && (
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                    <p className="text-sm text-gray-400 mb-2">Current Level</p>
                    <p className="text-4xl font-bold text-cyan-400">{laggingGW.toFixed(2)} m</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
                    <p className="text-sm text-gray-400 mb-2">Level in {forecastHorizon} months</p>
                    <p className="text-4xl font-bold text-purple-400">{currentForecast.result.predicted_level.toFixed(2)} m</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                    <p className="text-sm text-gray-400 mb-2">Confidence</p>
                    <p className="text-4xl font-bold text-green-400">{currentForecast.result.confidence.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="mt-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Recent Forecasts</h2>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {history.slice(0, 5).map((forecast, idx) => (
                      <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{forecast.params.state} - {forecast.params.district}</p>
                            <p className="text-xs text-gray-400">{forecast.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-cyan-400">{forecast.result.predicted_level.toFixed(2)} m</p>
                            <p className="text-xs text-gray-400">{forecast.result.confidence.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Added Here */}
        <Footer />
      </div>
    </div>
  );
}