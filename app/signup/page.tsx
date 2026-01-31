'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Droplet, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api';

// Rain Effect Component (Client-side generation to prevent hydration mismatches)
const RainEffect = () => {
  const [drops, setDrops] = useState<{ left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const newDrops = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.5}s`,
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="rain-container absolute inset-0 pointer-events-none z-0">
      {drops.map((drop, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}
      {/* Water Surface Gradient Overlay */}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/80 to-transparent z-10" />
    </div>
  );
};

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password strength validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    matches: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Registration failed');
      }

      // Auto login after signup
      const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('refresh_token', loginData.refresh_token);
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Updated container background to match other pages
    <div className="min-h-screen bg-[#060b16] flex items-center justify-center px-4 py-8 relative overflow-hidden text-white selection:bg-cyan-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a1428] to-[#060b16] z-0" />
      <RainEffect />

      {/* Signup Card */}
      <div className="relative z-20 w-full max-w-md">
        {/* Added glass-panel styling */}
        <div className="bg-[#0a1428]/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          
          {/* Header */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Droplet className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
            <span className="text-2xl font-bold text-white tracking-wide">HydroAI</span>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2 text-shadow-glow">Create Account</h1>
          <p className="text-center text-cyan-100/60 text-sm mb-8 font-light">Join us to monitor groundwater</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
                disabled={loading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 space-y-2 backdrop-blur-sm">
                <p className="text-xs font-semibold text-gray-400 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  {[
                    { met: passwordRequirements.minLength, text: 'At least 8 characters' },
                    { met: passwordRequirements.hasUppercase, text: 'One uppercase letter' },
                    { met: passwordRequirements.hasLowercase, text: 'One lowercase letter' },
                    { met: passwordRequirements.hasNumber, text: 'One number' },
                    { met: passwordRequirements.matches, text: 'Passwords match' },
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      {req.met ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-600" />
                      )}
                      <span className={req.met ? 'text-green-400 text-xs' : 'text-gray-500 text-xs'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900/50 border border-cyan-500/30 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer mt-0.5 accent-cyan-500"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer leading-5 select-none">
                I agree to the{' '}
                <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 hover:underline decoration-cyan-400/50 underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 hover:underline decoration-cyan-400/50 underline-offset-2">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms || !isPasswordValid}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-slate-900 font-bold rounded-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition hover:underline decoration-cyan-400/50 underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-cyan-100/40 text-xs mt-8 font-light tracking-wider">
          Physics-Informed Groundwater Monitoring System
        </p>
      </div>
    </div>
  );
}