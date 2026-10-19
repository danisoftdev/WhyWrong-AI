import React from 'react';
import type { EvidenceStrength } from '../../types';

interface ProgressBarProps {
  value?: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  label,
  showPercent = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {label && <span>{label}</span>}
          {showPercent && <span>{percentage}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#734DFD] to-[#22D3EE] transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface StrengthMeterProps {
  strength: EvidenceStrength;
  className?: string;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ strength, className = '' }) => {
  const config = {
    low: {
      color: 'bg-[#F48B2C]',
      text: 'text-[#F48B2C]',
      width: 'w-1/3',
      label: 'Tentative Evidence (1 attempt)',
    },
    moderate: {
      color: 'bg-[#734DFD]',
      text: 'text-[#734DFD]',
      width: 'w-2/3',
      label: 'Moderate Evidence (Pattern suspected)',
    },
    strong: {
      color: 'bg-[#0BAA7B]',
      text: 'text-[#0BAA7B]',
      width: 'w-full',
      label: 'Strong Evidence (Probe confirmed)',
    },
  }[strength];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">Evidence Strength:</span>
        <span className={`font-bold capitalize ${config.text}`}>
          {strength} — {config.label}
        </span>
      </div>
      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${config.color} ${config.width} transition-all duration-500 rounded-full`} />
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
        *WhyWrong never claims calibrated certainty from AI. Evidence is verified through discriminating probes.
      </p>
    </div>
  );
};
