import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';

interface TimelineItemProps {
  stage: string;
  action: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  timestamp?: string;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  stage,
  action,
  status,
  timestamp,
  isLast = false,
}) => {
  const icon = {
    done: <CheckCircle2 className="w-5 h-5 text-[#0BAA7B]" />,
    running: <Loader2 className="w-5 h-5 text-[#22D3EE] animate-spin" />,
    pending: <Clock className="w-5 h-5 text-slate-400" />,
    failed: <AlertCircle className="w-5 h-5 text-[#E5484D]" />,
  }[status];

  return (
    <div className="relative flex items-start gap-4 pb-6 group">
      {!isLast && (
        <div className="absolute left-2.5 top-6 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700/60" />
      )}

      <div className="relative z-10 shrink-0 mt-0.5 bg-white dark:bg-[#0B1020] rounded-full p-0.5">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">
            {stage}
          </p>
          {timestamp && (
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {action}
        </p>
      </div>
    </div>
  );
};
