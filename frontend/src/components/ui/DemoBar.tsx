import React, { useState } from 'react';
import type { Role, User } from '../../types';
import { User as UserIcon, GraduationCap, Users, Shield, Compass, X } from 'lucide-react';

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
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const roles: { role: Role; label: string; icon: React.ReactNode }[] = [
    { role: 'visitor', label: 'Visitor (Landing)', icon: <Compass className="w-3.5 h-3.5" /> },
    { role: 'student', label: 'Student (Kofi)', icon: <UserIcon className="w-3.5 h-3.5" /> },
    { role: 'teacher', label: 'Teacher (Ms. Mensah)', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { role: 'parent', label: 'Parent (Mr. Appiah)', icon: <Users className="w-3.5 h-3.5" /> },
    { role: 'admin', label: 'Admin (System)', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="demo-bar w-full bg-[#0B1020] text-white border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-3 shadow-md relative z-50">
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

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        aria-label="Hide role bar"
        title="Hide role bar"
        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

