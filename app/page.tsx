'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Droplet, Menu, X, Zap, MapPin } from 'lucide-react';
import Footer from "./components/Footer";

const RainEffect = () => {
  // Generate random rain drops (client-side only to match hydration)
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
    <div className="rain-container">
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

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060b16] text-white selection:bg-cyan-500/30">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled ? 'bg-[#0a1428]/80 backdrop-blur-md border-cyan-500/10' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
            <span className="text-xl font-bold tracking-wide">HydroAI</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#models" className="hover:text-cyan-400 transition-colors">Models</a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
            <Link href="/login" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#0a1428] font-bold rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              Sign In
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-cyan-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a1428] border-b border-cyan-500/20 p-4 space-y-4">
            <a href="#features" className="block text-gray-300">Features</a>
            <a href="#models" className="block text-gray-300">Models</a>
            <a href="/login" className="block text-cyan-400 font-bold">Sign In</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a1428] to-[#060b16] z-0" />
        <RainEffect />

        <div className="relative z-10 container mx-auto px-4 text-center">
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="block text-glow text-white/90">Predicting Tomorrow's</span>
            <span className="bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-500 bg-clip-text text-transparent text-glow filter drop-shadow-lg">
              Water, Today
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto mb-10 font-light">
            Leveraging Physics-Informed AI for Sustainable Groundwater Management
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <Link href="/dashboard" className="glass-panel px-8 py-3 rounded-full text-cyan-50 font-semibold hover:bg-cyan-500/20 transition-all hover:scale-105 active:scale-95 group">
              Get Started
            </Link>
            <button className="glass-panel px-8 py-3 rounded-full text-cyan-50 font-semibold hover:bg-cyan-500/20 transition-all hover:scale-105 active:scale-95">
              Watch Demo
            </button>
          </div>

          {/* Circular Stats (Bubbles) */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-20">
            {[
              { val: "98%", label: "Accuracy" },
              { val: "50+", label: "Sites" },
              { val: "Real-time", label: "Monitoring" }
            ].map((stat, i) => (
              <div key={i} className="glass-bubble w-32 h-32 rounded-full flex flex-col items-center justify-center animate-float" style={{ animationDelay: `${i * 1}s` }}>
                <span className="text-2xl font-bold text-cyan-300 text-glow">{stat.val}</span>
                <span className="text-xs uppercase tracking-wider text-cyan-100/60 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Key Features Cards - Glass Look */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left relative z-20">
            <div className="glass-panel p-8 rounded-2xl hover:bg-cyan-900/20 transition-colors group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Droplet className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Spatiotemporal Forecasting</h3>
              <p className="text-sm text-cyan-100/60 leading-relaxed">
                Advanced GNN models predict groundwater levels with physics-informed constraints.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:bg-cyan-900/20 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Policy Simulation</h3>
              <p className="text-sm text-cyan-100/60 leading-relaxed">
                Counterfactual analysis using causal models to evaluate intervention strategies.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl hover:bg-cyan-900/20 transition-colors group">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Site Optimization</h3>
              <p className="text-sm text-cyan-100/60 leading-relaxed">
                Identify optimal groundwater recharge sites using multi-objective optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}