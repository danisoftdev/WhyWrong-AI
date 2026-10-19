import React from 'react';
import type { User } from '../../types';
import { Search, Bell, LogIn, LogOut } from 'lucide-react';
import { Button } from './Button';

interface TopBarProps {
  user: User | null;
  onNavigateHome?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  variant?: 'student' | 'teacher' | 'admin' | 'landing',
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onNavigateHome,
  onOpenLogin,
  onLogout,
  variant = 'student',
}) => {
  const isTeacher = variant === 'teacher';
  const isLanding = variant === 'landing';

  if (isLanding) {
    return null; // Landing has its own bespoke nav
  }

  return (
    <header
      className={`h-16 px-6 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${
        isTeacher
          ? 'bg-[#0C1421]/90 border-[#1E2D4A] text-white'
          : 'bg-[#F7F9FC]/90 border-slate-200/80 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
          title="WhyWrong AI Home"
        >
          <img
            src={isTeacher ? "/WWAI_compact_dark.png" : "/WWAI_compact.png"}
            alt="WhyWrong AI"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
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

      <div className="flex items-center gap-3">
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

        {/* User Badge / Profile & Login / Logout Buttons */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-[#734DFD] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user.display_name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{user.display_name}</p>
              <p className="text-[10px] text-slate-400 capitalize">
                {user.role} {user.student_code ? `(${user.student_code})` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-500 hover:text-red-500 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#734DFD]/10 text-[#734DFD]">
              Guest
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenLogin}
              className="gap-1.5 text-xs font-bold py-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
