import React from 'react';

interface ChipProps {
  icon?: React.ReactNode;
  label: string;
  variant?: 'purple' | 'cyan' | 'dark' | 'success' | 'outline';
  className?: string;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  icon,
  label,
  variant = 'purple',
  className = '',
  onClick,
}) => {
  const variantStyles = {
    purple: 'bg-[#734DFD]/10 text-[#734DFD] border border-[#734DFD]/20',
    cyan: 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30',
    dark: 'bg-white/10 text-white backdrop-blur-md border border-white/15',
    success: 'bg-[#0BAA7B]/10 text-[#0BAA7B] border border-[#0BAA7B]/20',
    outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
  }[variant];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${variantStyles} ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>}
      {label}
    </span>
  );
};
