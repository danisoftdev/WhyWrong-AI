import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { api } from '../../services/api';
import type { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState<string>('STU-1001');
  const [password, setPassword] = useState<string>('1001');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.login(identifier, password);
      if (res && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg('Invalid login credentials. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or account temporarily locked.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111E38] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-800 dark:text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#734DFD]/10 text-[#734DFD] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Sign In to WhyWrong
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your student code or staff credentials
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Student Code or Email Address:
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. STU-1001 or teacher@school.edu"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#734DFD] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password or 4-Digit Student PIN:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. 1001 or DemoPass2026!"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#734DFD] text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="gradient"
              disabled={loading}
              className="w-full py-3 font-bold text-sm shadow-md"
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </Button>
          </div>
        </form>

        {/* Quick Demo Fill Buttons for Judges */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Judge Quick Fill Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('STU-1001', '1001')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#734DFD]/10 hover:text-[#734DFD] text-left transition-colors font-medium border border-transparent hover:border-[#734DFD]/30"
            >
              🎓 Student: STU-1001
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('teacher@school.edu', 'DemoPass2026!')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#734DFD]/10 hover:text-[#734DFD] text-left transition-colors font-medium border border-transparent hover:border-[#734DFD]/30"
            >
              👩‍🏫 Teacher Account
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('parent@family.edu', 'DemoPass2026!')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#734DFD]/10 hover:text-[#734DFD] text-left transition-colors font-medium border border-transparent hover:border-[#734DFD]/30"
            >
              👨‍👩‍👧 Parent Account
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@school.edu', 'DemoPass2026!')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#734DFD]/10 hover:text-[#734DFD] text-left transition-colors font-medium border border-transparent hover:border-[#734DFD]/30"
            >
              🛡️ Admin Account
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0BAA7B] shrink-0" />
          <span>Protected with object-level RBAC, bcrypt hashes, and 15-min lockout defense.</span>
        </div>
      </div>
    </div>
  );
};
