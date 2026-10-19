import React from 'react';

interface CardProps {
  variant?: 'student' | 'teacher' | 'midnight' | 'subtle';
  className?: string;
  glow?: boolean;
  children: React.ReactNode;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'student',
  className = '',
  glow = false,
  children,
  id,
}) => {
  const variantStyles = {
    student: 'bg-white text-slate-800 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(115,77,253,0.06)] rounded-2xl',
    teacher: 'bg-[#111E38] text-slate-100 border border-[#1E2D4A] rounded-2xl shadow-lg',
    midnight: 'bg-[#0E1528] text-white border border-slate-800/80 rounded-3xl',
    subtle: 'bg-[#F3F5FD] text-slate-800 border border-slate-200/60 rounded-2xl',
  }[variant];

  const glowStyle = glow ? 'shadow-[0_0_35px_-5px_rgba(115,77,253,0.3)]' : '';

  return (
    <div id={id} className={`p-6 transition-all duration-200 ${variantStyles} ${glowStyle} ${className}`}>
      {children}
    </div>
  );
};
