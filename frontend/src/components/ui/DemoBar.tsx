import React from 'react';
import type { Role, User } from '../../types';
import { Sparkles, User as UserIcon, GraduationCap, Users, Shield, Compass } from 'lucide-react';

interface DemoBarProps {
  currentUser: User | null;
  onSwitchRole: (role: Role) => void;
  onOpenDesignSystem?: () => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({
  currentUser,
  onSwitchRole,
  onOpenDesignSystem,
}) => {
  const roles: { role: Role; label: string; icon: React.ReactNode }[] = [
    { role: 'visitor', label: 'Visitor (Landing)', icon: <Compass className="w-3.5 h-3.5" /> },
    { role: 'student', label: 'Student (Kofi)', icon: <UserIcon className="w-3.5 h-3.5" /> },
    { role: 'teacher', label: 'Teacher (Ms. Mensah)', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { role: 'parent', label: 'Parent (Mr. Appiah)', icon: <Users className="w-3.5 h-3.5" /> },
    { role: 'admin', label: 'Admin (System)', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="demo-bar w-full bg-[#0B1020] text-white border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#734DFD]/20 text-[#22D3EE] font-bold tracking-wider uppercase text-[10px] border border-[#22D3EE]/30">
          <Sparkles className="w-3 h-3 text-[#22D3EE]" /> NYLP Hackathon 2026 Demo Mode
        </span>
        <span className="hidden md:inline text-slate-400">
          Click any role to test live:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {roles.map((r) => {
          const isActive = currentUser?.role === r.role || (!currentUser && r.role === 'visitor');
          return (
            <button
              key={r.role}
              type="button"
              onClick={() => onSwitchRole(r.role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#734DFD] to-[#3B82F6] text-white shadow-sm ring-1 ring-white/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {r.icon}
              {r.label}
            </button>
          );
        })}

        {onOpenDesignSystem && (
          <button
            type="button"
            onClick={onOpenDesignSystem}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
          >
            Design Tokens
          </button>
        )}
      </div>
    </div>
  );
};
