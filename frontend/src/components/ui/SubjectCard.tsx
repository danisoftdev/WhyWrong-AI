import React from 'react';
import * as LucideIcons from 'lucide-react';

interface SubjectCardProps {
  name: string;
  slug: string;
  description: string;
  iconName: string;
  bgColor: string;
  questionCount?: number;
  onClick?: () => void;
  className?: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  description,
  iconName,
  bgColor,
  questionCount,
  onClick,
  className = '',
}) => {
  // Dynamically resolve icon from Lucide
  const IconComponent = (LucideIcons as Record<string, any>)[iconName] || LucideIcons.BookOpen;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      style={{ backgroundColor: bgColor }}
      className={`group relative p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[170px] border border-black/5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-900 shadow-sm transition-transform duration-300 group-hover:rotate-6">
          <IconComponent className="w-6 h-6 stroke-[2]" />
        </div>
        {questionCount !== undefined && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/60 text-slate-800">
            {questionCount} topics
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight mb-1">
          {name}
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};
