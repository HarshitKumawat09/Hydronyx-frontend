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
  AlertCircle,
  AlertTriangle,
  Info,
  MapPin,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface AlertItem {
  state: string;
  district?: string;
  severity: string;
  message: string;
  gw_level: number;
  trend: string;
  threshold_exceeded: boolean;
}

export default function Alerts() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  );
}

function AlertsContent() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filter) params.set('severity', filter);
      const res = await fetchWithAuth(`/api/alerts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getSeverityColor = (s: string) => {
    if (s === 'critical') return 'border-red-500/50 bg-red-500/10 text-red-400';
    if (s === 'high') return 'border-amber-500/50 bg-amber-500/10 text-amber-400';
    return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
  };

  const getSeverityIcon = (s: string) => {
    if (s === 'critical') return <AlertCircle className="w-5 h-5" />;
    if (s === 'high') return <AlertTriangle className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

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
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50"
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Forecast</span>}
          </Link>
          <Link
            href="/policy"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50"
          >
            <Settings2 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Policy</span>}
          </Link>
          <Link
            href="/optimizer"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50"
          >
            <TrendingUp size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Optimizer</span>}
          </Link>
          <Link
            href="/validation"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50"
          >
            <CheckCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Validation</span>}
          </Link>
          <Link
            href="/location-gw"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50"
          >
            <MapPin size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Location Insight</span>}
          </Link>
          <Link
            href="/alerts"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
          >
            <AlertCircle size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Alerts</span>}
          </Link>
          <Link
            href="/drivers"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition cursor-pointer text-gray-400 hover:bg-slate-800/50"
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Drivers</span>}
          </Link>
        </nav>
      </div>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Groundwater Stress Alerts</h1>
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

        <div className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg ${
                !filter ? 'bg-cyan-500/30 text-cyan-400' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'critical' ? 'bg-red-500/30 text-red-400' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'high' ? 'bg-amber-500/30 text-amber-400' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              High
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 bg-slate-800/50 rounded-xl border border-cyan-500/20 text-center text-gray-400">
              No alerts found
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-4 rounded-xl border ${getSeverityColor(a.severity)} flex items-center gap-4`}>
                  {getSeverityIcon(a.severity)}
                  <div className="flex-1">
                    <p className="font-semibold">{a.state}{a.district ? ` - ${a.district}` : ''}</p>
                    <p className="text-sm opacity-90">{a.message}</p>
                    <p className="text-xs opacity-70 mt-1">Trend: {a.trend} - GW: {a.gw_level}m bgl</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
