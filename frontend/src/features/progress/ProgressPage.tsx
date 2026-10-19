import React from 'react';
import { Card } from '../../components/ui/Card';
import { KpiTile } from '../../components/ui/KpiTile';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const chartData = [
    { week: 'Week 1', ideasFixed: 0, accuracy: 52 },
    { week: 'Week 2', ideasFixed: 1, accuracy: 60 },
    { week: 'Week 3', ideasFixed: 2, accuracy: 68 },
    { week: 'Week 4', ideasFixed: 4, accuracy: 82 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD]">
            Student Growth Tracking
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
            My Conceptual Progress
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Progress is phrased as ideas fixed and rules understood, never marks lost.
          </p>
        </div>
      </div>

      {/* 4 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          variant="student"
          label="Questions Attempted"
          value="28"
          subtext="Across Math & Physics"
          icon={<Award className="w-5 h-5" />}
        />
        <KpiTile
          variant="student"
          label="Misconceptions Fixed"
          value="4"
          badge="+2 this week"
          subtext="Rules resolved"
          icon={<CheckCircle2 className="w-5 h-5 text-[#0BAA7B]" />}
        />
        <KpiTile
          variant="student"
          label="Accuracy Rate"
          value="82%"
          badge="+14%"
          subtext="Conceptual stability"
          icon={<TrendingUp className="w-5 h-5 text-[#734DFD]" />}
        />
        <KpiTile
          variant="student"
          label="Day Streak"
          value="5"
          badge="Personal best"
          subtext="Consecutive learning days"
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* You're Improving Card & Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Progress Line Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-slate-900">
                Mastery Growth Over Time
              </h2>
              <p className="text-xs text-slate-500">Tracking conceptual accuracy after diagnostic remediation</p>
            </div>
            <span className="text-xs font-bold text-[#0BAA7B] bg-[#0BAA7B]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +30% Net Gain
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[40, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1020', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#734DFD" strokeWidth={3} dot={{ r: 5, fill: '#734DFD' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* You're Improving Encouragement Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#734DFD] to-[#3B82F6] text-white shadow-md space-y-4">
            <div className="p-3 rounded-2xl bg-white/20 w-fit backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-[#22D3EE]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">You’re improving!</h3>
              <p className="text-xs text-slate-100/90 mt-1.5 leading-relaxed">
                By taking time to understand <em>why</em> your fraction addition rule didn’t work with unequal slices, your accuracy jumped from 52% to 82%!
              </p>
            </div>
            <div className="pt-2 border-t border-white/20 text-xs text-slate-200">
              Next scheduled check: <strong>Retention Retest in 5 days</strong>
            </div>
          </div>

          <Card variant="student" className="p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400">Recently Resolved Misconceptions</h4>
            <ul className="text-xs space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA7B] shrink-0" />
                <span>Add tops, add bottoms (Fractions)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA7B] shrink-0" />
                <span>Larger denominator means larger fraction</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
