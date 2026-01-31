'use client';

import { AlertCircle } from 'lucide-react';

interface UncertaintyWarningProps {
  confidence?: number | null;
  uncertainty?: number | null;
  confidenceThreshold?: number;
  uncertaintyThreshold?: number;  // e.g. 0.3m for forecast, 0.15 for policy
  className?: string;
}

export default function UncertaintyWarning({
  confidence,
  uncertainty,
  confidenceThreshold = 0.7,
  uncertaintyThreshold = 0.3,
  className = '',
}: UncertaintyWarningProps) {
  const isLowConfidence = confidence != null && confidence < confidenceThreshold;
  const isHighUncertainty = uncertainty != null && uncertainty > uncertaintyThreshold;

  if (!isLowConfidence && !isHighUncertainty) return null;

  return (
    <div className={`flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg ${className}`}>
      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-amber-200/90">
        <p className="font-medium mb-1">High uncertainty in this forecast</p>
        <p>
          {isLowConfidence && confidence != null && (
            <>Model confidence is {(confidence * 100).toFixed(0)}% (below {confidenceThreshold * 100}% threshold).</>
          )}
          {isLowConfidence && isHighUncertainty && ' '}
          {isHighUncertainty && uncertainty != null && (
            <>Prediction interval is ±{uncertainty.toFixed(2)}m.</>
          )}
          {' '}Use with caution for critical decisions.
        </p>
      </div>
    </div>
  );
}
