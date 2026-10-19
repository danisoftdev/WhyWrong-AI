import React from 'react';

export type MasteryLevel = 'Strong' | 'Okay' | 'Weak';

interface HeatmapCellProps {
  level: MasteryLevel;
  strongCount?: number;
  okayCount?: number;
  weakCount?: number;
  onClick?: () => void;
  className?: string;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = ({
  level,
  strongCount,
  okayCount,
  weakCount,
  onClick,
  className = '',
}) => {
  const styles = {
    Strong: 'bg-[#0BAA7B]/20 text-[#0BAA7B] border-[#0BAA7B]/40 hover:bg-[#0BAA7B]/30',
    Okay:   'bg-[#F48B2C]/20 text-[#F48B2C] border-[#F48B2C]/40 hover:bg-[#F48B2C]/30',
    Weak:   'bg-[#E5484D]/20 text-[#E5484D] border-[#E5484D]/40 hover:bg-[#E5484D]/30',
  }[level];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${styles} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <span>{level}</span>
      {(strongCount !== undefined || weakCount !== undefined) && (
        <span className="text-[10px] opacity-80 font-mono">
          ({strongCount}S/{okayCount}O/{weakCount}W)
        </span>
      )}
    </div>
  );
};
