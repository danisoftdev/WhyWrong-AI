import React from 'react';
import { X, Check } from 'lucide-react';
import { StackedFraction } from './StackedFraction';

interface OptionButtonProps {
  label: string; // "A", "B", "C", "D"
  text: string;
  isSelected?: boolean;
  isWrong?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  text,
  isSelected = false,
  isWrong = false,
  isCorrect = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  let stateStyles = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-[#734DFD]/50 hover:bg-[#F3F5FD]/50';

  if (isWrong) {
    stateStyles = 'border-[#E5484D] bg-[#E5484D]/5 text-[#E5484D] shadow-[0_0_0_1px_#E5484D]';
  } else if (isCorrect) {
    stateStyles = 'border-[#0BAA7B] bg-[#0BAA7B]/5 text-[#0BAA7B] shadow-[0_0_0_1px_#0BAA7B]';
  } else if (isSelected) {
    stateStyles = 'border-[#734DFD] bg-[#734DFD]/5 text-[#734DFD] shadow-[0_0_0_1px_#734DFD]';
  }

  const isMath = text.includes('\\frac') || text.includes('/');

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full min-h-[56px] px-4 py-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 select-none ${stateStyles} ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
            isWrong
              ? 'bg-[#E5484D] text-white'
              : isCorrect
              ? 'bg-[#0BAA7B] text-white'
              : isSelected
              ? 'bg-[#734DFD] text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {label}
        </span>
        <div className="text-base font-medium">
          {isMath ? <StackedFraction math={text} /> : text}
        </div>
      </div>

      {isWrong && (
        <span className="w-6 h-6 rounded-full bg-[#E5484D] text-white flex items-center justify-center shrink-0">
          <X className="w-4 h-4 stroke-[2.5]" />
        </span>
      )}
      {isCorrect && (
        <span className="w-6 h-6 rounded-full bg-[#0BAA7B] text-white flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </span>
      )}
    </button>
  );
};
