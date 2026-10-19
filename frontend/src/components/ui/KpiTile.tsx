import React from 'react';

interface KpiTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  variant?: 'teacher' | 'student';
  className?: string;
}

export const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  subtext,
  icon,
  badge,
  variant = 'teacher',
  className = '',
}) => {
  const isTeacher = variant === 'teacher';

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        isTeacher
          ? 'bg-[#111E38] border-[#1E2D4A] text-white shadow-md'
          : 'bg-white border-slate-100 text-slate-800 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium uppercase tracking-wider ${isTeacher ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        {icon && (
          <div className={`p-2 rounded-xl ${isTeacher ? 'bg-[#1E2D4A] text-[#22D3EE]' : 'bg-[#F3F5FD] text-[#734DFD]'}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-3xl font-extrabold font-display tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0BAA7B]/15 text-[#0BAA7B]">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className={`text-xs mt-2 ${isTeacher ? 'text-slate-400' : 'text-slate-500'}`}>
          {subtext}
        </p>
      )}
    </div>
  );
};
