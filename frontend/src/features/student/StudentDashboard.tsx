import React from 'react';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { Card } from '../../components/ui/Card';
import { Sparkles, ArrowRight, Brain, Clock, Award } from 'lucide-react';
import type { Subject } from '../../types';

interface StudentDashboardProps {
  subjects: Subject[];
  onSelectSubject: (subjectSlug: string) => void;
  onOpenQuickQuiz: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  subjects,
  onSelectSubject,
  onOpenQuickQuiz,
}) => {
  // 9 Pastel Colors for the 3x3 grid from section 4.1
  const defaultPastels = [
    { slug: 'mathematics', name: 'Mathematics', desc: 'Fractions, Equations, Geometry & Proportions', icon: 'Sigma', color: '#D9C2FC' },
    { slug: 'physics', name: 'Physics', desc: 'Forces, Motion, Momentum & Energy Conservation', icon: 'Zap', color: '#D4FBE9' },
    { slug: 'computing', name: 'Computing', desc: 'Loops, Array Boundaries, Logic & Algorithms', icon: 'Code', color: '#FDDFE6' },
    { slug: 'chemistry', name: 'Chemistry', desc: 'Bonding, Stoichiometry, Atoms & Reactions', icon: 'FlaskConical', color: '#E3F7E0' },
    { slug: 'biology', name: 'Biology', desc: 'Cellular Division, Genetics & Ecosystems', icon: 'Dna', color: '#FEEACC' },
    { slug: 'english', name: 'English', desc: 'Grammar, Syntax, Comprehension & Voice', icon: 'BookOpen', color: '#E2F1FE' },
    { slug: 'geography', name: 'Geography', desc: 'Topography, Climate Patterns & Resource Maps', icon: 'Globe', color: '#FEF5D7' },
    { slug: 'economics', name: 'Economics', desc: 'Supply, Demand, Inflation & Markets', icon: 'TrendingUp', color: '#ECE0FC' },
    { slug: 'health-science', name: 'Health Science', desc: 'Nutrition, Physiology & Community Wellness', icon: 'HeartPulse', color: '#FFEBE5' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#734DFD] to-[#3B82F6] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" /> Diagnostic Studio Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Welcome back, Kofi!
          </h1>
          <p className="text-sm text-slate-100/90 leading-relaxed">
            Ready to test your thinking? We look behind wrong answers to discover the mental rule you were using, so you never make that mistake again.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenQuickQuiz}
          className="relative z-10 px-6 py-3.5 rounded-2xl bg-white text-[#734DFD] font-bold text-sm shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <span>Continue Fraction Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
          Choose a subject to start learning
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select any domain below to begin an adaptive concept diagnostic session.
        </p>
      </div>

      {/* 3 by 3 Pastel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {defaultPastels.map((p) => {
          const match = subjects.find((s) => s.slug === p.slug);
          return (
            <SubjectCard
              key={p.slug}
              name={p.name}
              slug={p.slug}
              description={p.desc}
              iconName={p.icon}
              bgColor={p.color}
              questionCount={match?.topics?.length ?? 2}
              onClick={() => onSelectSubject(p.slug)}
            />
          );
        })}
      </div>

      {/* Recent Activity Card */}
      <Card variant="student" className="p-6">
        <h3 className="font-bold text-base text-slate-900 font-display mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#734DFD]" /> Active Diagnostic Target
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#F3F5FD] border border-slate-200/60 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#734DFD]/10 text-[#734DFD] flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Fractions: Addition with Unequal Denominators</p>
              <p className="text-xs text-slate-500">Suspected rule: "Add tops, add bottoms" (1/3 + 1/4 = 2/7)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenQuickQuiz}
            className="px-4 py-2 rounded-xl bg-[#734DFD] text-white text-xs font-semibold hover:bg-[#5F37F3] transition-colors shrink-0"
          >
            Review Probe & Practice
          </button>
        </div>
      </Card>
    </div>
  );
};
