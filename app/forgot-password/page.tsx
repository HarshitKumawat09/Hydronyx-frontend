'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Droplet, Mail, CheckCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api';

const RainEffect = () => {
  const [drops, setDrops] = useState<{ left: string; delay: string; duration: string }[]>([]);
  useEffect(() => {
    setDrops(Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.5}s`,
    })));
  }, []);
  return (
    <div className="rain-container absolute inset-0 pointer-events-none z-0">
      {drops.map((drop, i) => (
        <div key={i} className="rain-drop" style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration }} />
      ))}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/80 to-transparent z-10" />
    </div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b16] flex items-center justify-center px-4 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a1428] to-[#060b16] z-0" />
      <RainEffect />
      <div className="relative z-20 w-full max-w-md">
        <div className="bg-[#0a1428]/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Droplet className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
            <span className="text-2xl font-bold text-white tracking-wide">Hydronyx</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">Forgot Password</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Enter your email to receive a reset link</p>
          {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"><p className="text-red-400 text-sm">{error}</p></div>}
          {success ? (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">If an account exists, a reset link was sent to your email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400" disabled={loading} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-900 font-bold rounded-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 text-sm">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
