import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Printer,
  Shield,
  Lightbulb,
  TrendingUp,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';

export const ParentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'link' | 'digest'>('home');
  const [linkCodeInput, setLinkCodeInput] = useState<string>('WW-8492');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(true);
  const [linkStatus, setLinkStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getParentSummary('usr-student-01');
      setSummaryData(res.summary);
    } catch {
      // Fallback demonstration dataset
      setSummaryData({
        student: {
          display_name: 'Kofi Mensah',
          student_code: 'STU-1001',
        },
        week_overview: 'This week, Kofi is making steady progress in Fractions.',
        ideas_fixed_count: 2,
        practice_streak_days: 4,
        next_retest_date: new Date(Date.now() + 5 * 86400000).toLocaleDateString(),
        ideas_working_on: [
          {
            concept: 'Add tops, add bottoms',
            plain_explanation: 'Learning that fractions cannot be added directly without first making the slice sizes equal.',
          },
        ],
        help_at_home: {
          title: 'Paper Fraction Strips Activity',
          tip: 'Take two strips of scrap paper. Fold one into thirds and the other into quarters. Notice how the pieces are different sizes. Before adding them, we have to slice them into twelfths so all pieces match!',
          duration: '5 minutes',
        },
        privacy_notice: 'WhyWrong never ranks children or compares scores with peers. Progress focuses on concepts mastered.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async () => {
    if (!consentAccepted) {
      setLinkStatus({ type: 'error', message: 'You must confirm parental consent before linking.' });
      return;
    }

    try {
      await api.linkChild(linkCodeInput, consentAccepted);
      setLinkStatus({ type: 'success', message: 'Child successfully linked! Welcome to Kofi’s learning overview.' });
      setActiveTab('home');
    } catch (e: any) {
      setLinkStatus({ type: 'error', message: e.message || 'Invalid or expired link code.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Parent Sub-Nav Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD]">
            Parent Portal • Light Studio
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Child Learning Digest
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-[#734DFD] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('digest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'digest'
                ? 'bg-[#734DFD] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Weekly Digest (Print)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'link'
                ? 'bg-[#734DFD] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Link a Child
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* SCREEN 14: Parent Home */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeTab === 'home' && summaryData && (
        <div className="space-y-6">
          {/* Child Switcher Pill */}
          <div className="p-4 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#734DFD] text-white flex items-center justify-center font-bold text-sm">
                K
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{summaryData.student.display_name}</p>
                <p className="text-[10px] text-slate-500 font-mono">Code: {summaryData.student.student_code} • Class 2A</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0BAA7B]/10 text-[#0BAA7B]">
              Active Learner
            </span>
          </div>

          {/* This Week Plain-Language Card */}
          <Card variant="student" className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#734DFD] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#22D3EE]" /> Weekly Overview (Plain Language)
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              {summaryData.week_overview}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We look past marks to find the exact rules children use when solving problems. Rather than saying an answer is just "wrong", we help Kofi understand why adding fractions requires identical slice sizes.
            </p>
          </Card>

          {/* 3 Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Ideas Fixed</span>
              <p className="text-2xl font-black font-display text-[#0BAA7B] mt-1">
                {summaryData.ideas_fixed_count} concepts
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Mastered through remediation</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Practice Streak</span>
              <p className="text-2xl font-black font-display text-[#734DFD] mt-1">
                {summaryData.practice_streak_days} days
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Active engagement</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Next Retest Due</span>
              <p className="text-2xl font-black font-display text-slate-900 mt-1">
                {summaryData.next_retest_date}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">7-day retention check</p>
            </div>
          </div>

          {/* How to Help at Home Tip Card */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-400/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-600" /> {summaryData.help_at_home.title} ({summaryData.help_at_home.duration})
            </div>
            <h3 className="font-bold text-sm text-slate-900">How you can help Kofi at home:</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {summaryData.help_at_home.tip}
            </p>
          </div>

          {/* Privacy & No-Rank Notice */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{summaryData.privacy_notice}</span>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* SCREEN 15: Link a Child */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeTab === 'link' && (
        <Card variant="student" className="max-w-xl mx-auto space-y-6 p-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#734DFD]/10 text-[#734DFD] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Link Your Child with a Teacher Code
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your child’s teacher generates a one-time code (e.g. WW-8492). Enter it below to receive plain-language weekly digests.
            </p>
          </div>

          {linkStatus && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
              linkStatus.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}>
              {linkStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {linkStatus.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="text-xs font-bold text-slate-700 block mb-1.5">
                One-Time Link Code
              </label>
              <input
                id="code"
                type="text"
                value={linkCodeInput}
                onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. WW-8492"
                className="w-full text-center text-xl font-mono font-bold tracking-widest p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#734DFD]"
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#734DFD] focus:ring-[#734DFD]"
              />
              <span>
                I confirm consent to view my child’s learning summary. I understand WhyWrong only shows concepts my child is mastering and never shares data with other families.
              </span>
            </label>

            <Button variant="gradient" fullWidth size="lg" onClick={handleLinkChild}>
              Link Child
            </Button>
          </div>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* SCREEN 16: Weekly Digest and Printable Summary */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeTab === 'digest' && summaryData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center no-print">
            <span className="text-xs text-slate-500 font-medium">One-Page Printable Digest</span>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" /> Print Weekly Digest
            </Button>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6 printable-card">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">
                  Weekly Learning Progress Digest
                </h2>
                <p className="text-xs text-slate-500">
                  Student: <strong>{summaryData.student.display_name}</strong> ({summaryData.student.student_code})
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Week of {new Date().toLocaleDateString()}</p>
                <p className="text-[10px] text-[#0BAA7B] font-bold">WhyWrong Diagnostic Report</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-display">
                What Kofi is Working On This Week:
              </h3>
              {summaryData.ideas_working_on.map((idea: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-[#F3F5FD] border border-slate-200/60 text-xs">
                  <p className="font-bold text-slate-800">{idea.concept}</p>
                  <p className="text-slate-600 mt-0.5">{idea.plain_explanation}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 uppercase font-bold">Ideas Fixed</span>
                <p className="text-xl font-black text-[#0BAA7B] mt-1">{summaryData.ideas_fixed_count} breakthrough</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 uppercase font-bold">Next Retention Check</span>
                <p className="text-xl font-black text-[#734DFD] mt-1">{summaryData.next_retest_date}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300/30 space-y-1">
              <p className="text-xs font-bold text-amber-800">5-Minute Home Tip:</p>
              <p className="text-xs text-slate-700">{summaryData.help_at_home.tip}</p>
            </div>

            <div className="pt-4 border-t text-[11px] text-slate-400 text-center">
              Generated by WhyWrong AI • Data protection compliant • No student ranking
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
