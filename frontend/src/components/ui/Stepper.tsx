import React from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1-indexed
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="relative flex items-start gap-3.5 group">
            {/* Step Line Connector */}
            {!isLast && (
              <div
                className={`absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] transition-colors duration-300 ${
                  isCompleted ? 'bg-[#734DFD]' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}

            {/* Step Icon Badge */}
            <button
              type="button"
              disabled={!onStepClick || step.id > currentStep}
              onClick={() => onStepClick && onStepClick(step.id)}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                isCompleted
                  ? 'bg-[#734DFD] text-white shadow-sm'
                  : isActive
                  ? 'bg-[#734DFD] text-white ring-4 ring-[#734DFD]/20 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : isActive ? (
                <CircleDot className="w-4 h-4 animate-pulse" />
              ) : (
                step.id
              )}
            </button>

            {/* Step Details */}
            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#734DFD] dark:text-[#A78BFA]'
                    : isCompleted
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
