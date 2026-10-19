import React from 'react';

interface MascotProps {
  speech?: string;
  size?: 'sm' | 'md' | 'lg';
  mood?: 'happy' | 'thinking' | 'encouraging';
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  speech,
  size = 'md',
  mood = 'happy',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Robot SVG Avatar */}
      <div className={`relative flex-shrink-0 ${sizeMap} bg-gradient-to-tr from-[#734DFD] to-[#22D3EE] rounded-2xl p-2 shadow-md flex items-center justify-center text-white border-2 border-white/80`}>
        {/* Antenna */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-[#22D3EE] rounded-full">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#22D3EE] rounded-full animate-ping" />
        </div>

        {/* Robot Face */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect x="3" y="4" width="18" height="15" rx="3" fill="rgba(255,255,255,0.15)" />
          {/* Eyes */}
          <circle cx="8.5" cy="10.5" r="1.5" fill="white" />
          <circle cx="15.5" cy="10.5" r="1.5" fill="white" />
          {/* Mouth */}
          {mood === 'thinking' ? (
            <path d="M9 15h6" stroke="white" strokeWidth="2" />
          ) : (
            <path d="M8.5 14.5c1 1.5 6 1.5 7 0" stroke="white" strokeWidth="2" />
          )}
        </svg>
      </div>

      {/* Speech Bubble */}
      {speech && (
        <div className="relative bg-[#F3F5FD] dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200/80 dark:border-slate-700 max-w-md shadow-sm">
          <p className="font-medium leading-relaxed">{speech}</p>
        </div>
      )}
    </div>
  );
};
