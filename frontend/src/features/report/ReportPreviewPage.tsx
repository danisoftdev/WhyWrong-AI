import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Award,
  Shield,
} from 'lucide-react';
import { api } from '../../services/api';

export const ReportPreviewPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentReport('usr-student-01');
      setReport(res.report);
    } catch {
      setReport({
        report_id: 'REP-7F89C2',
        student_code: 'STU-1001',
        student_name: 'Kofi Mensah',
        subject: 'Mathematics',
        topic: 'Fractions & Proportional Reasoning',
        status: 'Improving',
        accuracy_change: '+28% after probe & remediation cycle',
        target_misconception: 'Add tops, add bottoms (direct numerator & denominator summation)',
        resolution_progress: 'Resolved on probe check. Next retest scheduled.',
        recommended_practice: 'Common denominator visual fraction strips (3 questions).',
        teacher_notes: 'Kofi quickly grasped the pizza slice counterexample and successfully identified common denominators on follow-up practice.',
        generated_at: new Date().toLocaleDateString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD]">
            Official Evaluation Report
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-0.5">
            PDF Report Preview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print Report
          </Button>
          <Button variant="gradient" size="sm" onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Printable Sheet */}
      {report && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-lg printable-card space-y-8">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              <img
                src="/WWAI.png"
                alt="WhyWrong AI Logo"
                className="h-12 w-auto object-contain"
              />
              <div className="border-l border-slate-200 pl-4">
                <h2 className="text-xl font-bold font-display text-slate-900">
                  Diagnostic & Remediation Report
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Document ID: {report.report_id} • Issued: {report.generated_at}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0BAA7B]/15 text-[#0BAA7B] border border-[#0BAA7B]/30">
              Status: {report.status}
            </span>
          </div>

          {/* Student & Subject Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F3F5FD] border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Student Code</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{report.student_code}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Subject</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{report.subject}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Topic</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{report.topic}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Accuracy Gain</span>
              <p className="font-bold text-[#0BAA7B] text-sm mt-0.5">{report.accuracy_change}</p>
            </div>
          </div>

          {/* Diagnosis & Resolution Summary */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm font-display text-slate-900 uppercase tracking-wide">
              Misconception Analysis & Resolution
            </h3>

            <div className="p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#734DFD]">Target Rule Diagnosed:</span>
                <span className="text-xs font-mono font-bold text-slate-600">Initial Confidence: Moderate</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                "{report.target_misconception}"
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {report.resolution_progress}
              </p>
            </div>
          </div>

          {/* Teacher Observations & Recommended Practice */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Teacher Notes (Class 2A)
              </span>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{report.teacher_notes}"
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recommended Practice
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {report.recommended_practice}
              </p>
            </div>
          </div>

          {/* Signoff / Audit Notice */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Uses anonymous student identifiers for data privacy.</span>
            </div>
            <span>Certified by WhyWrong Diagnostic Engine • Antigravity AI Stack</span>
          </div>
        </div>
      )}
    </div>
  );
};
