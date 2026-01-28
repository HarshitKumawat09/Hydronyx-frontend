'use client';

import Footer from "../components/Footer";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Map, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API when backend is ready
    setTimeout(() => {
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        level: 45 + Math.sin(i * 0.2) * 10 + Math.random() * 5,
        predicted: 45 + Math.sin(i * 0.2) * 10,
      }));
      setData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1428] via-[#0d1b3d] to-[#0a1428]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="text-white">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Level</p>
                <p className="text-3xl font-bold text-cyan-400">45.2 m</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Predicted (7d)</p>
                <p className="text-3xl font-bold text-green-400">+2.1%</p>
              </div>
              <Zap className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accuracy</p>
                <p className="text-3xl font-bold text-cyan-400">98.5%</p>
              </div>
              <Map className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sites Active</p>
                <p className="text-3xl font-bold text-purple-400">50+</p>
              </div>
              <Map className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <h2 className="text-xl font-bold text-white mb-6">Groundwater Level Forecast</h2>
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-400">Loading data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a1428',
                      border: '1px solid #00d4ff',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke="#00d4ff"
                    dot={false}
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#06b6d4"
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>

            <Link
              href="/simulator"
              className="block p-4 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400/60 transition"
            >
              <p className="text-cyan-400 font-semibold">Policy Simulator</p>
              <p className="text-gray-400 text-sm mt-2">Run counterfactual analysis</p>
            </Link>

            <Link
              href="/optimizer"
              className="block p-4 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400/60 transition"
            >
              <p className="text-cyan-400 font-semibold">Site Optimizer</p>
              <p className="text-gray-400 text-sm mt-2">Find optimal recharge sites</p>
            </Link>

            <Link
              href="/forecast"
              className="block p-4 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:border-cyan-400/60 transition"
            >
              <p className="text-cyan-400 font-semibold">Detailed Forecast</p>
              <p className="text-gray-400 text-sm mt-2">View detailed predictions</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
