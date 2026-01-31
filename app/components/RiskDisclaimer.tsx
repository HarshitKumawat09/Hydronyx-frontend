'use client';

import { AlertTriangle } from 'lucide-react';

interface RiskDisclaimerProps {
  variant?: 'forecast' | 'policy' | 'optimizer' | 'general';
  className?: string;
}

const DISCLAIMERS: Record<string, string> = {
  forecast: 'Forecasts are model-based estimates with inherent uncertainty. Do not use as sole basis for water allocation or infrastructure decisions. Verify with local hydrological data.',
  policy: 'Policy simulations are counterfactual projections. Actual outcomes depend on implementation, enforcement, and external factors not modeled here.',
  optimizer: 'Site rankings are optimization outputs. Field verification, land ownership, and regulatory approvals are required before implementation.',
  general: 'This platform provides decision support, not definitive predictions. Consult domain experts for critical decisions.',
};

export default function RiskDisclaimer({ variant = 'general', className = '' }: RiskDisclaimerProps) {
  const text = DISCLAIMERS[variant] || DISCLAIMERS.general;
  return (
    <div className={`flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg ${className}`}>
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-200/90">{text}</p>
    </div>
  );
}
