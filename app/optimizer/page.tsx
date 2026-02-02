'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import Footer from '@/app/components/Footer'; // Import Footer
import dynamic from 'next/dynamic';
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
  MapPin,
  Search,
  ChevronRight,
} from 'lucide-react';
import RiskDisclaimer from '@/app/components/RiskDisclaimer';
import { fetchWithAuth } from '@/lib/api';

interface SiteData {
  id: string | number;
  explanation: string;
  impact_score: number;
  estimated_cost: number;
  latitude: number;
  longitude: number;
  state?: string;
  total_score?: number;
}

interface OptimizationResult {
  selected_sites: SiteData[];
  average_cost: number;
  total_impact: number;
  map_center: { latitude: number; longitude: number };
  search_area_bounds: { north: number; south: number; east: number; west: number };
  metadata: {
    n_candidates_evaluated: number;
    n_sites_selected?: number;
  };
}

const MapComponent = dynamic(() => import('./OptimizerMap'), {
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900 text-gray-400">Loading map...</div>,
  ssr: false,
});

export default function Optimizer() {
  return (
    <ProtectedRoute>
      <OptimizerContent />
    </ProtectedRoute>
  );
}

function OptimizerContent() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [nlQuery, setNlQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [nSites, setNSites] = useState(10);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(['impact', 'cost']);
  
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState<string[]>([
    'Maharashtra',
    'Haryana',
    'Punjab',
    'Uttar Pradesh',
    'Rajasthan',
    'Gujarat',
  ]);
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const response = await fetchWithAuth('/api/optimizer/states');
      if (response.ok) {
        const data = await response.json();
        setStates(data.states || []);
      }
    } catch (error) {
      console.error('Failed to load states:', error);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setOptimizing(false);
        return;
      }

      const response = await fetchWithAuth('/api/optimizer/optimize', {
        method: 'POST',
        body: JSON.stringify({
          state: selectedState,
          objectives: selectedObjectives,
          max_budget: maxBudget ?? undefined,
          nl_query: nlQuery || undefined,
          n_sites: nSites,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to run optimization');
      }

      const data: OptimizationResult = await response.json();
      setResult(data);
      setSelectedSite(null);
    } catch (error) {
      console.error('Optimization error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to run optimization'}`);
    } finally {
      setOptimizing(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleObjective = (obj: string) => {
    setSelectedObjectives(prev =>
      prev.includes(obj)
        ? prev.filter(o => o !== obj)
        : [...prev, obj]
    );
  };

  const objectives = [
    { id: 'impact', label: 'Impact', color: 'bg-cyan-500' },
    { id: 'cost', label: 'Cost', color: 'bg-green-500' },
    { id: 'accessibility', label: 'Accessibility', color: 'bg-purple-500' },
    { id: 'equity', label: 'Equity', color: 'bg-blue-500' },
  ];

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
          <Link href="/policy" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <Settings2 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Policy</span>}
          </Link>
          <Link href="/optimizer" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer bg-cyan-500/20 text-cyan-400 border border-cyan-500/50`}>
            <TrendingUp size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Optimizer</span>}
          </Link>
          <Link href="/validation" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <CheckCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Validation</span>}
          </Link>
          <Link href="/location-gw" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <MapPin size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Location Insight</span>}
          </Link>
          <Link href="/alerts" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <AlertCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Alerts</span>}
          </Link>
          <Link href="/drivers" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50`}>
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Drivers</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content Wrapper - Added min-h-screen and flex-col */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 flex flex-col min-h-screen`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Recharge Site Optimizer</h1>
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

        {/* Content Area - flex-1 ensures it fills space between header and footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-8 mt-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mx-8 mt-4">
            <RiskDisclaimer variant="optimizer" />
          </div>

          {/* This inner container holds the dashboard panels */}
          <div className="flex-1 flex gap-6 p-8 overflow-hidden">
            {/* Left Panel - Controls */}
            <div className="w-80 flex flex-col space-y-6 overflow-y-auto">
              {/* Status Cards */}
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">API Status</p>
                      <p className="text-lg font-bold text-green-400">Online</p>
                    </div>
                    <Signal className="w-6 h-6 text-green-400 opacity-50" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Sites Found</p>
                      <p className="text-lg font-bold text-purple-400">{result?.selected_sites.length || 0}</p>
                    </div>
                    <MapPin className="w-6 h-6 text-purple-400 opacity-50" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Avg Impact</p>
                      <p className="text-lg font-bold text-cyan-400">{result?.total_impact.toFixed(2) || '0.00'}</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-cyan-400 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Find 10 high-impact sites..."
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded-lg focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>

              {/* Configuration */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Optimization Config</h3>

                {/* State */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {states.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Objectives</label>
                  <div className="space-y-2">
                    {objectives.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => toggleObjective(obj.id)}
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition flex items-center justify-between ${
                          selectedObjectives.includes(obj.id)
                            ? `${obj.color} text-white`
                            : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
                        }`}
                      >
                        <span>{obj.label}</span>
                        <span>{selectedObjectives.includes(obj.id) ? '✓' : ''}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Sites */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Number of Sites: <span className="text-cyan-400">{nSites}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={nSites}
                    onChange={(e) => setNSites(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2"
                  />
                </div>

                {/* Max Budget */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Max Budget (₹ Lakhs): <span className="text-cyan-400">{maxBudget || 'No limit'}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Leave empty for no limit"
                    value={maxBudget || ''}
                    onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-slate-800 border border-cyan-500/30 text-white rounded text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Optimize Button */}
                <button
                  onClick={handleOptimize}
                  disabled={optimizing}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-bold rounded hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Zap size={18} />
                  {optimizing ? 'Optimizing...' : 'Run Optimization'}
                </button>
              </div>

              {/* Statistics */}
              {result && (
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white">Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Average Cost</span>
                      <span className="text-purple-400 font-bold">₹{result.average_cost.toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Total Impact</span>
                      <span className="text-cyan-400 font-bold">{result.total_impact.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Candidates Evaluated</span>
                      <span className="text-green-400 font-bold">{result.metadata.n_candidates_evaluated}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Map and Sites Table */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {/* Map */}
              <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-lg overflow-hidden relative">
                {result && (
                  <MapComponent
                    sites={result.selected_sites}
                    mapCenter={result.map_center}
                    bounds={result.search_area_bounds as { north: number; south: number; east: number; west: number }}
                    onSiteSelect={(site: SiteData) => setSelectedSite(site)}
                    selectedSite={selectedSite}
                  />
                )}
                {!result && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Run optimization to see recommended sites on map</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sites Table */}
              {result && result.selected_sites.length > 0 && (
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 h-64 overflow-y-auto">
                  <h3 className="text-sm font-bold text-white mb-3">Recommended Sites Table</h3>
                  <div className="space-y-2">
                    {result.selected_sites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => setSelectedSite(site)}
                        className={`p-3 rounded cursor-pointer transition border ${
                          selectedSite?.id === site.id
                            ? 'bg-cyan-500/30 border-cyan-400 ring-1 ring-cyan-400'
                            : 'bg-slate-800/50 border-cyan-500/20 hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">Site {site.id}</p>
                            <p className="text-xs text-gray-400 truncate">{site.explanation}</p>
                            <div className="flex gap-2 mt-1 text-xs">
                              <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Impact: {site.impact_score.toFixed(2)}</span>
                              <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded">₹{site.estimated_cost.toFixed(1)}L</span>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-500 flex-shrink-0" size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Added Here - will stay at bottom */}
        <Footer />
      </div>
    </div>
  );
}