import React from 'react';
import type { User } from '../../types';
import { Search, Bell, Sparkles } from 'lucide-react';

interface TopBarProps {
  user: User | null;
  onNavigateHome?: () => void;
  variant?: 'student' | 'teacher' | 'landing';
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onNavigateHome,
  variant = 'student',
}) => {
  const isTeacher = variant === 'teacher';
  const isLanding = variant === 'landing';

  if (isLanding) {
    return null; // Landing has its own bespoke nav
  }

  return (
    <header
      className={`h-16 px-6 flex items-center justify-between border-b sticky top-[37px] z-40 backdrop-blur-md ${
        isTeacher
          ? 'bg-[#0C1421]/90 border-[#1E2D4A] text-white'
          : 'bg-[#F7F9FC]/90 border-slate-200/80 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#734DFD] to-[#22D3EE] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            W
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            WhyWrong <span className="text-[#734DFD] font-mono text-xs">AI</span>
          </span>
        </button>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative ml-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subjects, topics, or misconceptions..."
            className={`text-xs pl-9 pr-4 py-2 rounded-xl w-64 border focus:outline-none focus:ring-2 focus:ring-[#734DFD] transition-all ${
              isTeacher
                ? 'bg-[#111E38] border-[#1E2D4A] text-white placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Bell Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className={`p-2 rounded-xl transition-colors relative ${
            isTeacher ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-200/60 text-slate-600'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#E5484D] absolute top-1.5 right-1.5" />
        </button>

        {/* User Badge / Profile */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-[#734DFD] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user.display_name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{user.display_name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role} {user.student_code ? `(${user.student_code})` : ''}</p>
            </div>
          </div>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#734DFD]/10 text-[#734DFD]">
            Guest Mode
          </span>
        )}
      </div>
    </header>
  );
};
