import React from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { StackedFraction } from '../../components/ui/StackedFraction';
import {
  Sparkles,
  ArrowRight,
  Play,
  Lightbulb,
  TrendingUp,
  X,
  Compass,
  CheckCircle2,
  Users,
  ShieldCheck,
  Brain,
  BookOpen,
} from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreTeacher: () => void;
  onExploreParent: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onExploreTeacher,
  onExploreParent,
}) => {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white selection:bg-[#734DFD] selection:text-white relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#734DFD]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-[#22D3EE]/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/10 relative z-20">
        <div className="flex items-center gap-3">
          <img
            src="/WWAI_compact_dark.png"
            alt="WhyWrong AI"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button type="button" onClick={onStartLearning} className="hover:text-white transition-colors">Students</button>
          <button type="button" onClick={onExploreTeacher} className="hover:text-white transition-colors">Teachers</button>
          <button type="button" onClick={onExploreParent} className="flex items-center gap-1.5 hover:text-white transition-colors">
            For Parents <span className="text-[10px] bg-[#22D3EE]/20 text-[#22D3EE] px-1.5 py-0.5 rounded-full">New</span>
          </button>
          <button type="button" onClick={onStartLearning} className="hover:text-white transition-colors">Subjects</button>
          <button type="button" onClick={onStartLearning} className="hover:text-white transition-colors">Features</button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onStartLearning} className="border-white/20 text-white hover:bg-white/10">
            Sign In
          </Button>
          <Button variant="gradient" size="sm" onClick={onStartLearning} className="shadow-lg shadow-[#734DFD]/25">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              AI Agent for Smarter Learning
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.12]">
            Every wrong answer <br />
            has a reason. <br />
            <span className="bg-gradient-to-r from-[#734DFD] via-[#A855F7] to-[#22D3EE] bg-clip-text text-transparent">
              Let’s discover it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            WhyWrong finds the mistaken rule behind a student’s wrong answer: diagnose, probe, remediate, re-test, and report. Built on free and open reasoning engines with transparent evidence verification.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="gradient"
              size="lg"
              onClick={onStartLearning}
              className="gap-2.5 px-8 shadow-xl shadow-[#734DFD]/30"
            >
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onExploreTeacher}
              className="border-white/20 hover:bg-white/10 text-white gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Demo
            </Button>
          </div>

          {/* 4 Feature Chips */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2.5">
            <Chip variant="dark" icon={<Brain className="w-3.5 h-3.5 text-[#734DFD]" />} label="AI-Powered Diagnosis" />
            <Chip variant="dark" icon={<Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />} label="Personalized Practice" />
            <Chip variant="dark" icon={<BookOpen className="w-3.5 h-3.5 text-[#0BAA7B]" />} label="Supports All Subjects" />
            <Chip variant="dark" icon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />} label="Free and Open Powered" />
            <Chip variant="dark" icon={<Users className="w-3.5 h-3.5 text-pink-400" />} label="For Parents" />
          </div>
        </div>

        {/* Right Column: Hero Visual & Floating Diagnostic Cards */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Glowing Ring */}
          <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full border-2 border-[#22D3EE]/30 p-4 flex items-center justify-center shadow-[0_0_80px_-20px_rgba(34,211,238,0.35)]">
            <div className="w-full h-full rounded-full border border-[#734DFD]/40 p-4 flex items-center justify-center">
              {/* Illustrated Student Character / Mascot Centerpiece */}
              <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#734DFD]/30 to-[#22D3EE]/30 backdrop-blur-xl flex flex-col items-center justify-center border border-white/20 p-4 shadow-inner text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#734DFD] to-[#22D3EE] flex items-center justify-center text-white mb-2 shadow-lg">
                  <Brain className="w-10 h-10 text-white stroke-[2]" />
                </div>
                <span className="text-xs font-bold text-white font-display">Student Studio</span>
                <span className="text-[10px] text-[#22D3EE]">Active Diagnostic Loop</span>
              </div>
            </div>

            {/* Floating Card 1: Question & Mistake */}
            <div className="absolute -top-4 -left-6 bg-[#111E38]/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-2xl max-w-[200px] animate-bounce-slow">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E5484D] uppercase tracking-wider mb-1">
                <X className="w-3.5 h-3.5 stroke-[3]" /> Why was this wrong?
              </div>
              <div className="text-sm font-bold text-white">
                <StackedFraction math="\frac{1}{3} + \frac{1}{4} = \frac{2}{7}" />
              </div>
            </div>

            {/* Floating Card 2: Misconception Detected */}
            <div className="absolute -bottom-6 -left-4 bg-[#111E38]/95 backdrop-blur-md p-4 rounded-2xl border border-[#734DFD]/40 shadow-2xl max-w-[220px]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22D3EE] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" /> Found Misconception
              </div>
              <p className="text-xs font-bold text-white">"Add tops, add bottoms"</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Added numerators 1+1=2 and denominators 3+4=7 directly.</p>
            </div>

            {/* Floating Card 3: Counterexample Lightbulb */}
            <div className="absolute -top-2 -right-4 bg-[#111E38]/95 backdrop-blur-md p-3 rounded-2xl border border-amber-400/40 shadow-xl flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Counterexample</p>
                <p className="text-xs font-bold text-white">1/2 + 1/2 ≠ 2/4</p>
              </div>
            </div>

            {/* Floating Card 4: Tagline Chart Card */}
            <div className="absolute -bottom-2 -right-6 bg-gradient-to-br from-[#734DFD]/90 to-[#3B82F6]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-2xl text-left max-w-[190px]">
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-200 uppercase mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> Breakthrough
              </div>
              <p className="text-xs font-extrabold text-white leading-tight">
                Fix the thinking. Not just the answer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Role Switcher Banner */}
      <section className="bg-white/5 border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-xl font-bold font-display text-white">
            Designed for the Full Educational Ecosystem
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            <button
              type="button"
              onClick={onStartLearning}
              className="p-4 rounded-2xl bg-[#111E38] border border-white/10 hover:border-[#734DFD] transition-all text-left group"
            >
              <div className="p-2 rounded-xl bg-[#734DFD]/20 text-[#734DFD] w-fit mb-2 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Student Studio</h3>
              <p className="text-xs text-slate-400 mt-1">Adaptive quiz, diagnostic probes, and counterexample lab.</p>
            </button>

            <button
              type="button"
              onClick={onExploreTeacher}
              className="p-4 rounded-2xl bg-[#111E38] border border-white/10 hover:border-[#22D3EE] transition-all text-left group"
            >
              <div className="p-2 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] w-fit mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Teacher Command</h3>
              <p className="text-xs text-slate-400 mt-1">Class misconception heatmap, 5-min interventions, and audit review.</p>
            </button>

            <button
              type="button"
              onClick={onExploreParent}
              className="p-4 rounded-2xl bg-[#111E38] border border-white/10 hover:border-[#0BAA7B] transition-all text-left group"
            >
              <div className="p-2 rounded-xl bg-[#0BAA7B]/20 text-[#0BAA7B] w-fit mb-2 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Parent Portal</h3>
              <p className="text-xs text-slate-400 mt-1">Plain language weekly summaries, home tips, and no ranking anxiety.</p>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 relative z-20">
        <div className="flex items-center gap-3">
          <img src="/WWAI_dark.png" alt="WhyWrong AI" className="h-8 w-auto object-contain opacity-80" />
        </div>
        <p>© 2026 WhyWrong AI • Fix the thinking, not just the answer.</p>
      </footer>
    </div>
  );
};
