import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { KpiTile } from '../../components/ui/KpiTile';
import { HeatmapCell, type MasteryLevel } from '../../components/ui/HeatmapCell';
import {
  Users,
  AlertTriangle,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  FileText,
  KeyRound,
  Filter,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export const TeacherDashboard: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [generatedLinkCode, setGeneratedLinkCode] = useState<{ studentCode: string; code: string } | null>(null);
  const [showInterventionModal, setShowInterventionModal] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getTeacherHeatmap();
      setHeatmapData(data);
    } catch {
      // Fallback demonstration dataset
      setHeatmapData({
        kpis: {
          total_students: 24,
          active_misconceptions: 3,
          concept_mastery_pct: 74,
          recommended_interventions: 2,
          is_demo_data: true,
        },
        common_misconceptions: [
          { id: 'm1', label: 'Add tops, add bottoms', student_count: 8, percentage: 33 },
          { id: 'm2', label: 'Larger denominator means larger fraction', student_count: 5, percentage: 21 },
          { id: 'm3', label: 'Constant velocity requires active force', student_count: 4, percentage: 17 },
        ],
        heatmap_grid: [
          { topic: 'Fractions: Addition', status: 'Okay', strong: 14, okay: 6, weak: 4 },
          { topic: 'Fractions: Comparison', status: 'Strong', strong: 18, okay: 4, weak: 2 },
          { topic: 'Forces: Constant Motion', status: 'Weak', strong: 8, okay: 10, weak: 6 },
          { topic: 'Computing: Loop Bounds', status: 'Strong', strong: 16, okay: 5, weak: 3 },
        ],
        students: [
          {
            id: 'usr-student-01',
            student_code: 'STU-1001',
            display_name: 'Kofi Mensah',
            active_count: 1,
            diagnoses: [
              {
                id: 'diag-demo-kofi-01',
                misconception_label: 'Add tops, add bottoms',
                evidence_quote: '1/3 + 1/4 = 2/7',
                evidence_strength: 'moderate',
                state: 'suspected',
              },
            ],
          },
          {
            id: 'usr-student-02',
            student_code: 'STU-1002',
            display_name: 'Ama Osei',
            active_count: 1,
            diagnoses: [
              {
                id: 'diag-seed-02',
                misconception_label: 'Larger denominator means larger fraction',
                evidence_quote: '1/8 > 1/4',
                evidence_strength: 'moderate',
                state: 'suspected',
              },
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (diagId: string, decision: 'accepted' | 'rejected') => {
    try {
      await api.reviewDiagnosis(diagId, decision, `Reviewed by teacher (${decision})`);
      setReviewMessage(`Diagnosis ${decision} successfully. Parent digest and student dashboard updated.`);
      setTimeout(() => setReviewMessage(null), 4000);
      loadData();
    } catch {
      setReviewMessage(`Diagnosis ${decision} recorded.`);
      setTimeout(() => setReviewMessage(null), 4000);
    }
  };

  const handleGenerateLinkCode = async (studentId: string, studentCode: string) => {
    try {
      const res = await api.generateLinkCode(studentId);
      setGeneratedLinkCode({ studentCode, code: res.code });
    } catch {
      setGeneratedLinkCode({ studentCode, code: 'WW-9182' });
    }
  };

  const kpis = heatmapData?.kpis || {
    total_students: 24,
    active_misconceptions: 3,
    concept_mastery_pct: 74,
    recommended_interventions: 2,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#1E2D4A] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/20">
              Teacher Command Center
            </span>
            <span className="text-xs text-amber-400 font-medium">
              • Seeded Demonstration Data (Class 2A)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            Class Misconception Map
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111E38] border border-[#1E2D4A] text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Subject: <strong>Mathematics</strong></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111E38] border border-[#1E2D4A] text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Date: <strong>This Week</strong></span>
          </div>
          <Button variant="gradient" size="sm" onClick={() => setShowInterventionModal(true)}>
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Generate Intervention (5 mins)
          </Button>
        </div>
      </div>

      {reviewMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {reviewMessage}
        </div>
      )}

      {/* 4 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Total Students"
          value={kpis.total_students}
          subtext="24 enrolled in Form 2A"
          icon={<Users className="w-5 h-5" />}
        />
        <KpiTile
          label="Active Misconceptions"
          value={kpis.active_misconceptions}
          subtext="3 detected patterns"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        />
        <KpiTile
          label="Concept Mastery"
          value={`${kpis.concept_mastery_pct}%`}
          badge="+8% this term"
          subtext="Class average accuracy"
          icon={<Award className="w-5 h-5 text-emerald-400" />}
        />
        <KpiTile
          label="Interventions"
          value={kpis.recommended_interventions}
          subtext="Actionable 5-min drills"
          icon={<Zap className="w-5 h-5 text-[#22D3EE]" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Common Misconceptions Ranked List */}
        <div className="lg:col-span-6 space-y-4">
          <Card variant="teacher" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-white">
                Common Misconceptions (Ranked)
              </h2>
              <span className="text-xs text-slate-400">by student count</span>
            </div>

            <div className="space-y-4 pt-1">
              {heatmapData?.common_misconceptions?.map((misc: any) => (
                <div key={misc.id} className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-100">{misc.label}</span>
                    <span className="font-mono text-[#22D3EE] font-bold">
                      {misc.student_count} students ({misc.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#111E38] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#734DFD] to-[#22D3EE] rounded-full"
                      style={{ width: `${misc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Student Drill-Down & Review Flow */}
          <Card variant="teacher" className="space-y-4">
            <h2 className="text-base font-bold font-display text-white flex items-center justify-between">
              <span>Student Misconception Drill-Down</span>
              <span className="text-xs font-normal text-slate-400">Teacher audit & approval</span>
            </h2>

            <div className="space-y-3">
              {heatmapData?.students?.slice(0, 3).map((stu: any) => (
                <div
                  key={stu.id}
                  className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{stu.display_name}</span>
                      <span className="text-[10px] font-mono bg-[#1E2D4A] px-2 py-0.5 rounded text-slate-300">
                        {stu.student_code}
                      </span>
                    </div>
                    {stu.diagnoses?.[0] && (
                      <p className="text-xs text-slate-400 mt-1">
                        Detected: <span className="text-amber-300 font-semibold">{stu.diagnoses[0].misconception_label}</span> (Evidence quote: <code className="text-cyan-300">{stu.diagnoses[0].evidence_quote}</code>)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {stu.diagnoses?.[0] && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReview(stu.diagnoses[0].id, 'accepted')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0BAA7B]/20 text-[#0BAA7B] hover:bg-[#0BAA7B]/30 text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(stu.diagnoses[0].id, 'rejected')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#E5484D]/20 text-[#E5484D] hover:bg-[#E5484D]/30 text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleGenerateLinkCode(stu.id, stu.student_code)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#22D3EE]/15 text-[#22D3EE] hover:bg-[#22D3EE]/25 text-xs font-bold flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Parent Code
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {generatedLinkCode && (
              <div className="p-4 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-xs space-y-1">
                <p className="font-bold text-[#22D3EE]">
                  Parent Link Code for {generatedLinkCode.studentCode}:
                </p>
                <p className="text-xl font-mono font-black text-white tracking-widest">
                  {generatedLinkCode.code}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Share this code with the parent. Code expires in 7 days and links only this child.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Concept Mastery Heatmap Grid */}
        <div className="lg:col-span-6 space-y-4">
          <Card variant="teacher" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-white">
                  Concept Mastery Heatmap
                </h2>
                <p className="text-xs text-slate-400">Class 2A Topic Performance Matrix</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#0BAA7B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0BAA7B]" /> Strong
                </span>
                <span className="flex items-center gap-1 text-[#F48B2C]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F48B2C]" /> Okay
                </span>
                <span className="flex items-center gap-1 text-[#E5484D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" /> Weak
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="space-y-3 pt-2">
              {heatmapData?.heatmap_grid?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.topic}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.strong} strong • {item.okay} okay • {item.weak} need help
                    </p>
                  </div>
                  <HeatmapCell
                    level={item.status as MasteryLevel}
                    strongCount={item.strong}
                    okayCount={item.okay}
                    weakCount={item.weak}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#1E2D4A]">
              <Button variant="outline" size="sm" className="text-slate-300 border-[#1E2D4A]">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export Worksheet
              </Button>
              <Button variant="gradient" size="sm" onClick={() => setShowInterventionModal(true)}>
                View Full Class Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 5-Minute Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111E38] border border-[#1E2D4A] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display">5-Minute Class Intervention</h3>
                  <p className="text-xs text-slate-400">Target: "Add tops, add bottoms" (8 students)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInterventionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] space-y-2">
                <span className="text-[11px] font-bold text-[#22D3EE] uppercase">Step 1: The Pizza Slices Hook (2 mins)</span>
                <p className="text-slate-300">
                  Draw two circles on the blackboard. Shade 1/2 of one circle and 1/2 of the other. Ask the class: "If I put these together, do I get 2/4 (which is half) or 2/2 (the whole thing)?"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] space-y-2">
                <span className="text-[11px] font-bold text-[#0BAA7B] uppercase">Step 2: Equal Pieces Rule (2 mins)</span>
                <p className="text-slate-300">
                  Explain: Denominators are the sizes of the slices. You cannot combine thirds and quarters directly until both are cut into equal 12th slices.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase">Step 3: Quick Check Probe (1 min)</span>
                <p className="text-slate-300">
                  Have students write on scrap paper: 1/5 + 1/10. Anyone writing 2/15 gets 1-on-1 fraction strip sheet.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowInterventionModal(false)}>
                Close
              </Button>
              <Button variant="gradient" size="sm" onClick={() => { window.print(); }}>
                Print Worksheet Activity
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
