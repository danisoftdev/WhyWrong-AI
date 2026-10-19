import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Stepper, type StepItem } from '../../components/ui/Stepper';
import { OptionButton } from '../../components/ui/OptionButton';
import { StackedFraction } from '../../components/ui/StackedFraction';
import { Mascot } from '../../components/ui/Mascot';
import { StrengthMeter } from '../../components/ui/ProgressBar';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  HelpCircle,
  Award,
} from 'lucide-react';
import type { Diagnosis, Probe, Remediation } from '../../types';
import { api } from '../../services/api';

interface QuizFlowProps {
  onFinish?: () => void;
}

export const QuizFlow: React.FC<QuizFlowProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string>('opt-b'); // default 2/7 to demonstrate workflow
  const [workingText, setWorkingText] = useState<string>('1/3 + 1/4 = (1+1)/(3+4) = 2/7');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(true); // Preloaded for immediate demonstration of Screen 3/4
  const [loading, setLoading] = useState<boolean>(false);

  // Diagnosis State
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    id: 'diag-demo-kofi-01',
    attempt_id: 'att-demo-kofi-01',
    state: 'suspected',
    evidence_quote: '1/3 + 1/4 = 2/7',
    evidence_strength: 'moderate',
    provider: 'rules_engine',
    is_demo: false,
    misconception: {
      id: 'misc-frac-add-across',
      label: 'Add tops, add bottoms',
      explanation: 'Adding numerators together and denominators together directly as independent integers.',
    },
  });

  // Probe State
  const [selectedProbeOption, setSelectedProbeOption] = useState<string>('p-opt-a'); // 2/15
  const [probeResult, setProbeResult] = useState<string>('confirms');

  // Remediation State
  const [activeRemediationTab, setActiveRemediationTab] = useState<'learn' | 'simulation' | 'practice' | 'real_world'>('learn');
  const [isPlayingStrip, setIsPlayingStrip] = useState<boolean>(false);
  const [retestScheduled, setRetestScheduled] = useState<boolean>(false);

  const steps: StepItem[] = [
    { id: 1, label: 'Answer Question', description: 'Fraction Addition' },
    { id: 2, label: 'AI Analysis', description: 'Evidence Diagnosis' },
    { id: 3, label: 'Probe Questions', description: 'Test Mental Model' },
    { id: 4, label: 'Remediation', description: 'Counterexample & Lab' },
    { id: 5, label: 'Re-test', description: '7-Day Retention' },
  ];

  const questionOptions = [
    { id: 'opt-a', text: '\\frac{7}{12}', label: 'A' },
    { id: 'opt-b', text: '\\frac{2}{7}', label: 'B' },
    { id: 'opt-c', text: '\\frac{2}{12}', label: 'C' },
    { id: 'opt-d', text: '\\frac{5}{12}', label: 'D' },
  ];

  const probeOptions = [
    { id: 'p-opt-a', text: '\\frac{2}{15}', label: 'A', note: 'Predicted wrong rule' },
    { id: 'p-opt-b', text: '\\frac{3}{10}', label: 'B', note: 'Correct sum' },
    { id: 'p-opt-c', text: '\\frac{2}{10}', label: 'C', note: 'Slip' },
    { id: 'p-opt-d', text: "I'm not sure", label: 'D', note: 'Unsure' },
  ];

  const handleInitialSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.submitAttempt('q-math-frac-01', selectedOption, workingText);
      const diagRes = await api.getDiagnosis(res.attempt_id);
      setDiagnosis(diagRes);
      setHasSubmitted(true);
      setCurrentStep(2);
    } catch {
      setHasSubmitted(true);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleProbeSubmit = async () => {
    setLoading(true);
    try {
      await api.submitProbeResponse('prb-demo-kofi-01', selectedProbeOption, '2/15');
      setProbeResult('confirms');
      setDiagnosis(prev => ({ ...prev, evidence_strength: 'strong' }));
      setCurrentStep(4);
    } catch {
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleRetest = async (isSimulated = false) => {
    setLoading(true);
    try {
      await api.scheduleRetest(diagnosis.id, isSimulated);
      setRetestScheduled(true);
      setCurrentStep(5);
    } catch {
      setRetestScheduled(true);
      setCurrentStep(5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Quiz Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD] bg-[#734DFD]/10 px-2.5 py-1 rounded-full">
            Mathematics • Fractions & Ratios
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-2">
            WhyWrong Conceptual Diagnostics
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Step {currentStep} of 5
          </span>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#734DFD] to-[#22D3EE] transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 5-Step Stepper */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm sticky top-[110px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Diagnostic Workflow
          </h2>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(id) => setCurrentStep(id)}
          />

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Sparkles className="w-4 h-4 text-[#22D3EE]" /> Engine Status: Active
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Every step is recorded in the agent timeline. Teacher review and parent digest update automatically.
            </p>
          </div>
        </div>

        {/* Right Column: Active Step Screen Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 3: Answer Question */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <Card variant="student" className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Question 1 of 5</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Multiple Choice
                </span>
              </div>

              {/* Stacked Fraction Question */}
              <div className="p-8 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 text-center">
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-wide">
                  <StackedFraction math="\frac{1}{3} + \frac{1}{4} = \text{?}" />
                </h3>
              </div>

              {/* Options A to D */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {questionOptions.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    label={opt.label}
                    text={opt.text}
                    isSelected={selectedOption === opt.id}
                    isWrong={hasSubmitted && selectedOption === opt.id && opt.id === 'opt-b'}
                    onClick={() => setSelectedOption(opt.id)}
                  />
                ))}
              </div>

              {/* Written Working Box */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="working" className="text-xs font-bold text-slate-700">
                    Your Working (Optional — helps AI find your thinking rule):
                  </label>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 cursor-not-allowed"
                    title="Camera handwriting analysis available in mobile app"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Add Image (Camera)
                  </button>
                </div>
                <textarea
                  id="working"
                  rows={2}
                  value={workingText}
                  onChange={(e) => setWorkingText(e.target.value)}
                  placeholder="e.g. 1/3 + 1/4 = 2/7"
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#734DFD]"
                />
              </div>

              {/* Robot Mascot Bubble */}
              <Mascot
                mood="thinking"
                speech="Great! Take your time. When you submit, I will analyze your answer to uncover the exact mental rule you were using."
              />

              <div className="flex justify-end pt-2">
                <Button variant="gradient" size="lg" onClick={handleInitialSubmit}>
                  Submit Answer & Analyze <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 4: Diagnosis Screen */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Incorrect Answer Banner */}
              <div className="p-5 rounded-2xl bg-[#E5484D]/10 border border-[#E5484D]/30 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#E5484D] font-display flex items-center gap-2">
                      Incorrect Answer. But that’s okay! Let’s find out why.
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      You chose <span className="font-bold text-slate-900">2/7</span>. A mistake is just an opportunity to fix the underlying thinking rule.
                    </p>
                  </div>
                </div>

                <StrengthMeter strength={diagnosis.evidence_strength} />
              </div>

              {/* Detected Misconception Card */}
              <Card variant="student" className="space-y-4 border-l-4 border-l-[#734DFD]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD] bg-[#734DFD]/10 px-2.5 py-0.5 rounded-full">
                    Detected Misconception
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Status: <span className="text-[#F48B2C] font-bold">Tentative Hypothesis</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 font-display">
                    "{diagnosis.misconception?.label}"
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {diagnosis.misconception?.explanation}
                  </p>
                </div>

                {/* Evidence From Your Answer */}
                <div className="p-4 rounded-xl bg-[#F3F5FD] border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Evidence From Your Answer
                  </span>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-900">
                    <span className="px-3 py-1 bg-white rounded-lg border font-mono">
                      {diagnosis.evidence_quote}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="text-xs text-slate-600">
                      Tops: <code className="bg-white px-1.5 py-0.5 rounded border">1 + 1 = 2</code>,
                      Bottoms: <code className="bg-white px-1.5 py-0.5 rounded border">3 + 4 = 7</code>
                    </span>
                  </div>
                </div>
              </Card>

              {/* Common Misconception Lightbulb Card */}
              <Card variant="subtle" className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-500 shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">This is a very common misconception!</h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Over 35% of secondary students apply whole-number addition rules to fractions before understanding equal piece sizes. Let's run a probe question to confirm if this is your rule.
                  </p>
                </div>
              </Card>

              <Mascot
                mood="encouraging"
                speech="Don't worry, Kofi! Let's answer two quick probe questions to confirm whether this is really your thinking pattern or just a small slip."
              />

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Review Question
                </Button>
                <Button variant="gradient" size="lg" onClick={() => setCurrentStep(3)}>
                  Continue to Probe Questions <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 5: Probe Questions */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <Card variant="student" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD]">
                    Step 3 of 5 • Adaptive Discrimination
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
                    Probe Questions
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#734DFD]/10 text-[#734DFD]">
                  Probe 1 of 2
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Let’s check if this is really your thinking or just a small mistake. Consider this problem:
              </p>

              {/* Probe Prompt */}
              <div className="p-6 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 text-center">
                <p className="text-xs text-slate-500 mb-2 font-medium">Evaluate the expression:</p>
                <h4 className="text-2xl font-bold font-display text-slate-900">
                  <StackedFraction math="\frac{1}{5} + \frac{1}{10} = \text{?}" />
                </h4>
              </div>

              {/* Probe Options */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {probeOptions.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    label={opt.label}
                    text={opt.text}
                    isSelected={selectedProbeOption === opt.id}
                    onClick={() => setSelectedProbeOption(opt.id)}
                  />
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#734DFD] shrink-0" />
                <span>
                  This question is specially constructed: picking 2/15 confirms the "add tops, add bottoms" hypothesis. Picking 3/10 shows the first was an accidental slip.
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Diagnosis
                </Button>
                <Button variant="gradient" size="lg" onClick={handleProbeSubmit}>
                  Confirm Pattern & Remediate <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 6 & 7: Personalised Learning Path & Practice Lab */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card variant="student" className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0BAA7B]">
                      Step 4 of 5 • Remediation Lab
                    </span>
                    <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
                      WhyWrong Conceptual Breakthrough
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0BAA7B]/10 text-[#0BAA7B] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pattern Confirmed
                  </span>
                </div>

                {/* 4 Tabs: Learn Concept | Simulation | Practice Questions | Real World */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                  {[
                    { id: 'learn', label: '1. Learn the Concept' },
                    { id: 'simulation', label: '2. Interactive Simulation' },
                    { id: 'practice', label: '3. Practice Questions' },
                    { id: 'real_world', label: '4. Real World Examples' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveRemediationTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        activeRemediationTab === tab.id
                          ? 'bg-[#734DFD] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Learn the Concept (Worked Contrast) */}
                {activeRemediationTab === 'learn' && (
                  <div className="space-y-6">
                    {/* The Pizza Counterexample */}
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-600 shrink-0">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          The Counterexample: Why you can't just add across
                        </h4>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          If you eat <span className="font-bold">1/2</span> of a pizza and then eat another <span className="font-bold">1/2</span> of a pizza, how much did you eat?
                          You ate <span className="font-bold text-[#0BAA7B]">1 whole pizza (2/2)</span>! You did NOT eat <span className="font-bold text-[#E5484D]">2/4</span> (which would only be half a pizza).
                        </p>
                      </div>
                    </div>

                    {/* Side-by-side Worked Contrast */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-[#E5484D]/5 border border-[#E5484D]/30 space-y-2">
                        <span className="text-[11px] font-bold text-[#E5484D] uppercase tracking-wider">
                          ✕ Mistaken Rule (Add Tops & Bottoms)
                        </span>
                        <p className="text-lg font-bold font-mono text-[#E5484D]">
                          1/3 + 1/4 = 2/7
                        </p>
                        <p className="text-xs text-slate-600">
                          Treats numerator and denominator as separate whole numbers. But fractions are part-to-whole ratios.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#0BAA7B]/5 border border-[#0BAA7B]/30 space-y-2">
                        <span className="text-[11px] font-bold text-[#0BAA7B] uppercase tracking-wider">
                          ✓ Correct Rule (Common Denominator)
                        </span>
                        <p className="text-lg font-bold font-mono text-[#0BAA7B]">
                          1/3 + 1/4 = 4/12 + 3/12 = 7/12
                        </p>
                        <p className="text-xs text-slate-600">
                          Slice into equal-sized twelfths first. Once pieces are the same size, add the tops: 4 + 3 = 7.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Interactive Simulation (Fraction Strips) */}
                {activeRemediationTab === 'simulation' && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-[#0B1020] text-white border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm font-display text-white">
                            Fraction Strip Visualizer
                          </h4>
                          <p className="text-xs text-slate-400">
                            Watch what happens when 1/3 and 1/4 are divided into equal 12th slices.
                          </p>
                        </div>
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => setIsPlayingStrip(!isPlayingStrip)}
                          className="gap-1.5"
                        >
                          {isPlayingStrip ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isPlayingStrip ? 'Reset' : 'Play Simulation'}
                        </Button>
                      </div>

                      {/* Strip 1: Thirds */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400">Strip A: 1/3</span>
                        <div className="grid grid-cols-3 h-8 rounded-lg overflow-hidden border border-white/20">
                          <div className="bg-[#734DFD] flex items-center justify-center text-xs font-bold">1/3</div>
                          <div className="bg-white/10" />
                          <div className="bg-white/10" />
                        </div>
                      </div>

                      {/* Strip 2: Quarters */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400">Strip B: 1/4</span>
                        <div className="grid grid-cols-4 h-8 rounded-lg overflow-hidden border border-white/20">
                          <div className="bg-[#22D3EE] text-slate-900 flex items-center justify-center text-xs font-bold">1/4</div>
                          <div className="bg-white/10" />
                          <div className="bg-white/10" />
                          <div className="bg-white/10" />
                        </div>
                      </div>

                      {/* Strip 3: Combined in 12ths */}
                      <div className="space-y-1 pt-2 border-t border-white/10">
                        <span className="text-[11px] text-[#22D3EE] font-bold">
                          Equivalent 12ths: (4/12) + (3/12) = 7/12
                        </span>
                        <div className="grid grid-cols-12 h-10 rounded-lg overflow-hidden border-2 border-[#22D3EE]">
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className={`border-r border-black/30 flex items-center justify-center text-[10px] font-bold ${
                                i < 4
                                  ? 'bg-[#734DFD] text-white'
                                  : i < 7
                                  ? 'bg-[#22D3EE] text-slate-900'
                                  : 'bg-white/10'
                              } ${isPlayingStrip ? 'transition-all duration-500 scale-100' : ''}`}
                            >
                              {i < 7 ? '1/12' : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Practice Questions */}
                {activeRemediationTab === 'practice' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                      <Award className="w-5 h-5 text-[#0BAA7B]" />
                      <p className="text-xs font-semibold text-slate-700">
                        Practice replaces the mistaken rule with real conceptual understanding!
                      </p>
                    </div>

                    {[
                      { prompt: '1/4 + 1/2 = ?', options: ['2/6', '3/4', '2/4'], correct: '3/4' },
                      { prompt: '2/5 + 1/10 = ?', options: ['3/15', '5/10 (1/2)', '2/15'], correct: '5/10 (1/2)' },
                      { prompt: '1/3 + 1/6 = ?', options: ['2/9', '3/6 (1/2)', '2/6'], correct: '3/6 (1/2)' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Practice Item {idx + 1}</span>
                          <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{item.prompt}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Start Practice
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 4: Real World Examples */}
                {activeRemediationTab === 'real_world' && (
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p>
                      <strong>Recipe Baking:</strong> When combining 1/3 cup of milk and 1/4 cup of melted butter, you can't measure 2/7 cup with standard spoons. You use the 12th cup markings to combine 7/12 cup total liquid.
                    </p>
                    <p>
                      <strong>Carpentry & Construction:</strong> Cutting 1/3 meter and 1/4 meter wooden planks requires common millimetre conversions before measuring total length.
                    </p>
                  </div>
                )}
              </Card>

              {/* Schedule Retest Section */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#734DFD]" /> Retention Check Scheduling
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    WhyWrong schedules a retest in 7 days to verify the new mental rule has stuck.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleScheduleRetest(true)}>
                    Simulate +7 Days (Demo)
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleScheduleRetest(false)}>
                    Schedule for Next Week
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 5 (Stepper Step 5): Re-test Confirmation */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 5 && (
            <Card variant="student" className="text-center p-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#0BAA7B]/15 text-[#0BAA7B] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold font-display text-slate-900">
                  Diagnostic Loop Completed!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  Your tentative misconception has been addressed through counterexamples and common-denominator simulation. Retest is scheduled for retention validation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3F5FD] max-w-sm mx-auto text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">Kofi Mensah (STU-1001)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Concept Targeted:</span>
                  <span className="font-bold text-slate-900">Add tops, add bottoms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Evidence Status:</span>
                  <span className="font-bold text-[#0BAA7B]">Probe Confirmed & Remediation Provided</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Retest Date:</span>
                  <span className="font-bold text-[#734DFD]">{new Date(Date.now() + 7 * 86400000).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Try Another Question
                </Button>
                <Button variant="gradient" onClick={onFinish}>
                  Return to Dashboard
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
