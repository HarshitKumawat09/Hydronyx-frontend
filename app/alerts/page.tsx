'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import Footer from '@/app/components/Footer';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-[#060b16] flex">
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4">
          <h1 className="text-3xl font-bold text-white">Groundwater Stress Alerts</h1>
          <p className="text-gray-400 text-sm mt-1">Regions with critical or high groundwater stress</p>
        </div>
        <div className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="mb-6 flex gap-2">
            <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-lg ${!filter ? 'bg-cyan-500/30 text-cyan-400' : 'bg-slate-800 text-gray-400'}`}>All</button>
            <button onClick={() => setFilter('critical')} className={`px-4 py-2 rounded-lg ${filter === 'critical' ? 'bg-red-500/30 text-red-400' : 'bg-slate-800 text-gray-400'}`}>Critical</button>
            <button onClick={() => setFilter('high')} className={`px-4 py-2 rounded-lg ${filter === 'high' ? 'bg-amber-500/30 text-amber-400' : 'bg-slate-800 text-gray-400'}`}>High</button>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" /></div>
          ) : alerts.length === 0 ? (
            <div className="p-8 bg-slate-800/50 rounded-xl border border-cyan-500/20 text-center text-gray-400">No alerts found</div>
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
