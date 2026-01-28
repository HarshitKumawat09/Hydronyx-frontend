'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Simulator() {
  const [selectedPolicy, setSelectedPolicy] = useState<string>('rainfall');
  const [intervention, setIntervention] = useState<number>(20);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults({
        baselineImpact: 45.2,
        interventionImpact: 48.5,
        improvement: 3.3,
        policy: selectedPolicy,
        intensity: intervention,
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1428] via-[#0d1b3d] to-[#0a1428]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a1428]/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="text-white">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Policy Simulator</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Configure Policy</h2>

            <div className="space-y-6">
              {/* Policy Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Policy Type
                </label>
                <select
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="rainfall">Rainfall Enhancement</option>
                  <option value="irrigation">Irrigation Management</option>
                  <option value="recharge">Artificial Recharge</option>
                  <option value="extraction">Extraction Reduction</option>
                </select>
              </div>

              {/* Intensity Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Intervention Intensity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intervention}
                  onChange={(e) => setIntervention(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="text-cyan-400 text-sm mt-2">{intervention}%</p>
              </div>

              {/* Simulate Button */}
              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50"
              >
                {loading ? 'Running...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results ? (
              <div className="space-y-6">
                <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Counterfactual Analysis Results</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">Baseline Level</p>
                      <p className="text-2xl font-bold text-cyan-400">{results.baselineImpact.toFixed(2)} m</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">With Policy</p>
                      <p className="text-2xl font-bold text-green-400">{results.interventionImpact.toFixed(2)} m</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
                    <p className="text-green-400 font-semibold">
                      Improvement: +{results.improvement.toFixed(2)} m ({((results.improvement / results.baselineImpact) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Policy Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-cyan-400 font-semibold">Type:</span> {results.policy.charAt(0).toUpperCase() + results.policy.slice(1)}</p>
                    <p><span className="text-cyan-400 font-semibold">Intensity:</span> {results.intensity}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center min-h-80">
                <p className="text-gray-400">Configure a policy and run simulation to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
