'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Droplet, CheckCircle, XCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    fetch(`${apiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setStatus('success');
          setMessage('Email verified successfully. You can now sign in.');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification request failed');
      });
  }, [token]);

  return (
    <div className="relative z-20 w-full max-w-md">
      <div className="bg-[#0a1428]/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Droplet className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
          <span className="text-2xl font-bold text-white tracking-wide">Hydronyx</span>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-6">Email Verification</h1>
        {status === 'loading' && <p className="text-gray-400 text-center">Verifying your email...</p>}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-green-400" />
            <p className="text-green-400 text-center">{message}</p>
            <Link href="/login" className="w-full py-3 text-center bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-900 font-bold rounded-lg">Sign In</Link>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-400" />
            <p className="text-red-400 text-center">{message}</p>
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 text-sm">Try signing up again</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-[#060b16] flex items-center justify-center px-4 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a1428] to-[#060b16] z-0" />
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
