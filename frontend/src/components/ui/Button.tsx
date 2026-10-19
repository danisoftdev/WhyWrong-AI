import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-5 py-2.5 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-2xl font-semibold',
  }[size];

  const variantStyles = {
    primary: 'bg-[#734DFD] text-white hover:bg-[#5F37F3] focus:ring-[#734DFD] shadow-sm active:scale-[0.98]',
    gradient: 'bg-gradient-to-r from-[#734DFD] to-[#3B82F6] text-white hover:opacity-95 shadow-md hover:shadow-lg focus:ring-[#734DFD] active:scale-[0.98]',
    secondary: 'bg-[#F3F5FD] text-[#1E293B] hover:bg-[#E9ECFB] focus:ring-[#734DFD]',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:ring-[#734DFD]',
    ghost: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50',
    danger: 'bg-[#E5484D] text-white hover:bg-red-600 focus:ring-[#E5484D]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
