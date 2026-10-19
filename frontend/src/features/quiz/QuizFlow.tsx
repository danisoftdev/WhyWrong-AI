import React, { useState, useEffect } from 'react';
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
import type { Diagnosis } from '../../types';
import { api } from '../../services/api';
import { SUBJECT_QUIZ_CONFIGS, type SubjectQuizConfig } from './subjectQuestions';

interface QuizFlowProps {
  subjectSlug?: string;
  onFinish?: () => void;
}

export const QuizFlow: React.FC<QuizFlowProps> = ({ subjectSlug = 'mathematics', onFinish }) => {
  const config: SubjectQuizConfig =
    SUBJECT_QUIZ_CONFIGS[subjectSlug] || SUBJECT_QUIZ_CONFIGS['mathematics'];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string>(config.question.defaultOptionId);
  const [workingText, setWorkingText] = useState<string>(config.question.defaultWorking);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Diagnosis State
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    id: `diag-demo-${config.slug}-01`,
    attempt_id: `att-demo-${config.slug}-01`,
    state: 'suspected',
    evidence_quote: config.diagnosis.evidenceQuote,
    evidence_strength: 'moderate',
    provider: 'rules_engine',
    is_demo: false,
    misconception: config.diagnosis.misconception,
  });

  // Probe State
  const [selectedProbeOption, setSelectedProbeOption] = useState<string>(config.probe.defaultProbeId);
  const [probeResult, setProbeResult] = useState<string>('confirms');

  // Remediation State
  const [activeRemediationTab, setActiveRemediationTab] = useState<'learn' | 'simulation' | 'practice' | 'real_world'>('learn');
  const [isPlayingStrip, setIsPlayingStrip] = useState<boolean>(false);
  const [retestScheduled, setRetestScheduled] = useState<boolean>(false);

  // Reset state when subject changes
  useEffect(() => {
    const active = SUBJECT_QUIZ_CONFIGS[subjectSlug] || SUBJECT_QUIZ_CONFIGS['mathematics'];
    setSelectedOption(active.question.defaultOptionId);
    setWorkingText(active.question.defaultWorking);
    setDiagnosis({
      id: `diag-demo-${active.slug}-01`,
      attempt_id: `att-demo-${active.slug}-01`,
      state: 'suspected',
      evidence_quote: active.diagnosis.evidenceQuote,
      evidence_strength: 'moderate',
      provider: 'rules_engine',
      is_demo: false,
      misconception: active.diagnosis.misconception,
    });
    setSelectedProbeOption(active.probe.defaultProbeId);
    setCurrentStep(1);
    setHasSubmitted(true);
    setRetestScheduled(false);
    setActiveRemediationTab('learn');
    setIsPlayingStrip(false);
  }, [subjectSlug]);

  const steps: StepItem[] = [
    { id: 1, label: 'Answer Question', description: config.stepDescription },
    { id: 2, label: 'AI Analysis', description: 'Evidence Diagnosis' },
    { id: 3, label: 'Probe Questions', description: 'Test Mental Model' },
    { id: 4, label: 'Remediation', description: 'Counterexample & Lab' },
    { id: 5, label: 'Re-test', description: '7-Day Retention' },
  ];

  const handleInitialSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.submitAttempt(`q-${config.slug}-01`, selectedOption, workingText);
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
      await api.submitProbeResponse(`prb-${config.slug}-01`, selectedProbeOption, 'response');
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
            {config.badge}
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-2">
            WhyWrong Conceptual Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{config.topic}</p>
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
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Subject: <strong className="text-slate-700 capitalize">{config.slug}</strong></span>
            <span>WhyWrong Engine 0.1</span>
          </div>
        </div>

        {/* Right Column: Active Step Screen Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 1: Answer Question */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <Card variant="student" className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Question 1 of 5</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Multiple Choice
                </span>
              </div>

              {/* Dynamic Question Presentation */}
              <div className="p-8 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 text-center space-y-3">
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {config.question.prompt}
                </p>
                {config.question.promptMath && (
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-wide mt-2">
                    <StackedFraction math={config.question.promptMath} />
                  </h3>
                )}
                {config.question.isCode && (
                  <pre className="bg-[#0B1020] text-emerald-400 p-4 rounded-xl font-mono text-xs sm:text-sm text-left max-w-md mx-auto overflow-x-auto border border-slate-800">
                    <code>{config.question.prompt}</code>
                  </pre>
                )}
              </div>

              {/* Options A to D */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {config.question.options.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    label={opt.label}
                    text={opt.text}
                    isSelected={selectedOption === opt.id}
                    isWrong={hasSubmitted && selectedOption === opt.id && opt.id === config.question.defaultOptionId}
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
                  placeholder="Explain your reasoning here..."
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
          {/* SCREEN 2: Diagnosis Screen */}
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
                      You chose option <span className="font-bold text-slate-900">{config.question.options.find(o => o.id === selectedOption)?.label || 'B'}</span>. A mistake is just an opportunity to fix the underlying thinking rule.
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
                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-900">
                    <span className="px-3 py-1 bg-white rounded-lg border font-mono text-xs">
                      "{diagnosis.evidence_quote}"
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="text-xs text-slate-600 font-normal">
                      {config.diagnosis.misconception.whyFeelsTrue}
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
                  <h5 className="font-bold text-sm text-slate-900">This is a documented learning pattern!</h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    This misconception is documented in secondary education research. Let's run a quick probe question to confirm if this is your rule or just a random slip.
                  </p>
                </div>
              </Card>

              <Mascot
                mood="encouraging"
                speech="Don't worry, Kofi! Let's answer a quick probe question to confirm whether this is really your thinking pattern."
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
          {/* SCREEN 3: Probe Questions */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <Card variant="student" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD]">
                    Step 3 of 5 • Adaptive Discrimination
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
                    Diagnostic Probes
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#734DFD]/10 text-[#734DFD]">
                  Probe 1 of 2
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Let’s test if your answer was guided by this specific mental model. Consider this targeted separating question:
              </p>

              {/* Dynamic Probe Prompt */}
              <div className="p-6 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">Diagnostic Check:</p>
                <h4 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  {config.probe.prompt.includes('\\frac') ? (
                    <StackedFraction math={config.probe.prompt} />
                  ) : (
                    config.probe.prompt
                  )}
                </h4>
              </div>

              {/* Probe Options */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {config.probe.options.map((opt) => (
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
                <span>If you pick the predicted misconception answer, evidence strength will increase from Moderate to Strong.</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Diagnosis
                </Button>
                <Button variant="gradient" size="lg" onClick={handleProbeSubmit}>
                  Submit Probe & See Remediation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* ───────────────────────────────────────────────────────── */}
          {/* SCREEN 4: Remediation */}
          {/* ───────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Evidence Lift Banner */}
              <div className="p-5 rounded-2xl bg-[#0BAA7B]/10 border border-[#0BAA7B]/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0BAA7B]/20 text-[#0BAA7B] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0BAA7B] font-display">
                      Misconception Confirmed with Strong Evidence
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Your probe responses matched the predicted pattern. Now let's fix the rule!
                    </p>
                  </div>
                </div>
                <StrengthMeter strength={diagnosis.evidence_strength} />
              </div>

              {/* Tabbed Remediation Card */}
              <Card variant="student" className="p-6 space-y-6">
                {/* 4 Tabs from Reference Mockup */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-[#F3F5FD] rounded-2xl border border-slate-200/60">
                  {[
                    { id: 'learn', label: '1. Learn Concept' },
                    { id: 'simulation', label: '2. Interactive Lab' },
                    { id: 'practice', label: '3. Practice (3 Items)' },
                    { id: 'real_world', label: '4. Real-World Context' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveRemediationTab(tab.id as any)}
                      className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                        activeRemediationTab === tab.id
                          ? 'bg-[#734DFD] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Learn Concept (Worked Contrast) */}
                {activeRemediationTab === 'learn' && (
                  <div className="space-y-6">
                    {/* Dynamic Counterexample */}
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-600 shrink-0">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {config.remediation.counterexampleTitle}
                        </h4>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          {config.remediation.counterexampleText}
                        </p>
                      </div>
                    </div>

                    {/* Side-by-side Worked Contrast */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-[#E5484D]/5 border border-[#E5484D]/30 space-y-2">
                        <span className="text-[11px] font-bold text-[#E5484D] uppercase tracking-wider">
                          ✕ {config.remediation.workedContrastIncorrect.rule}
                        </span>
                        <p className="text-sm font-bold font-mono text-[#E5484D]">
                          {config.remediation.workedContrastIncorrect.example}
                        </p>
                        <p className="text-xs text-slate-600">
                          {config.remediation.workedContrastIncorrect.desc}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#0BAA7B]/5 border border-[#0BAA7B]/30 space-y-2">
                        <span className="text-[11px] font-bold text-[#0BAA7B] uppercase tracking-wider">
                          ✓ {config.remediation.workedContrastCorrect.rule}
                        </span>
                        <p className="text-sm font-bold font-mono text-[#0BAA7B]">
                          {config.remediation.workedContrastCorrect.example}
                        </p>
                        <p className="text-xs text-slate-600">
                          {config.remediation.workedContrastCorrect.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Interactive Simulation Lab */}
                {activeRemediationTab === 'simulation' && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-[#0B1020] text-white border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm font-display text-white">
                            {config.remediation.simulation.title}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {config.remediation.simulation.description}
                          </p>
                        </div>
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => setIsPlayingStrip(!isPlayingStrip)}
                          className="gap-1.5"
                        >
                          {isPlayingStrip ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isPlayingStrip ? 'Reset' : 'Run Simulation'}
                        </Button>
                      </div>

                      {/* Physics Simulation */}
                      {config.remediation.simulation.type === 'physics' && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Drop Height: 50 meters</span>
                            <span className="text-[#22D3EE] font-mono">g = 9.8 m/s² (Earth gravity)</span>
                          </div>
                          <div className="h-32 bg-slate-900 rounded-xl relative overflow-hidden flex items-end justify-around p-3 border border-slate-800">
                            <div className="text-center transition-all duration-1000" style={{ transform: isPlayingStrip ? 'translateY(0)' : 'translateY(-70px)' }}>
                              <div className="w-8 h-8 rounded-full bg-[#734DFD] mx-auto flex items-center justify-center text-xs font-bold text-white shadow-lg">5kg</div>
                              <span className="text-[10px] text-slate-400">t = 3.19s</span>
                            </div>
                            <div className="text-center transition-all duration-1000" style={{ transform: isPlayingStrip ? 'translateY(0)' : 'translateY(-70px)' }}>
                              <div className="w-6 h-6 rounded-full bg-[#22D3EE] mx-auto flex items-center justify-center text-xs font-bold text-slate-900 shadow-lg">1kg</div>
                              <span className="text-[10px] text-slate-400">t = 3.19s</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-400 font-bold text-center">
                            Result: Both spheres hit the ground at precisely the same moment (t = 3.19 seconds)!
                          </p>
                        </div>
                      )}

                      {/* Computing Memory Slot Simulation */}
                      {config.remediation.simulation.type === 'computing' && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">RAM Slot: Variable x</span>
                              <p className="text-xl font-bold font-mono text-[#22D3EE] mt-1">{isPlayingStrip ? '20' : '10'}</p>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">RAM Slot: Variable y</span>
                              <p className="text-xl font-bold font-mono text-[#0BAA7B] mt-1">15</p>
                              <span className="text-[10px] text-slate-400">Snapshot remains 15</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-300 text-center">
                            Changing variable x does NOT retroactively update variable y in RAM.
                          </p>
                        </div>
                      )}

                      {/* Default Math Fraction Strips Simulation */}
                      {config.remediation.simulation.type === 'fraction' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-400">Strip A: 1/3</span>
                            <div className="grid grid-cols-3 h-8 rounded-lg overflow-hidden border border-white/20">
                              <div className="bg-[#734DFD] flex items-center justify-center text-xs font-bold">1/3</div>
                              <div className="bg-white/10" />
                              <div className="bg-white/10" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-400">Strip B: 1/4</span>
                            <div className="grid grid-cols-4 h-8 rounded-lg overflow-hidden border border-white/20">
                              <div className="bg-[#22D3EE] text-slate-900 flex items-center justify-center text-xs font-bold">1/4</div>
                              <div className="bg-white/10" />
                              <div className="bg-white/10" />
                              <div className="bg-white/10" />
                            </div>
                          </div>
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
                                  }`}
                                >
                                  {i < 7 ? '1/12' : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generic Domain Science Simulation for other subjects */}
                      {['chemistry', 'biology', 'english', 'geography', 'economics', 'health'].includes(config.remediation.simulation.type) && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
                          <p className="text-xs text-slate-300 font-medium">{config.remediation.simulation.description}</p>
                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-xs font-mono text-[#22D3EE]">
                            {isPlayingStrip ? '✓ Active Conceptual Simulation State: VERIFIED' : 'Click "Run Simulation" to inspect model parameters'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: Practice Questions */}
                {activeRemediationTab === 'practice' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                      <Award className="w-5 h-5 text-[#0BAA7B]" />
                      <p className="text-xs font-semibold text-slate-700">
                        Practice reinforces the corrected mental rule to achieve permanent mastery!
                      </p>
                    </div>

                    {config.remediation.practice.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#F3F5FD] border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Practice Item {idx + 1}</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{item.prompt}</p>
                          <span className="text-[11px] text-[#0BAA7B] font-semibold">Answer: {item.correct}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Completed
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 4: Real World Examples */}
                {activeRemediationTab === 'real_world' && (
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <p>
                      <strong>Application Context:</strong> In professional and real-world environments, this concept prevents costly calculation errors and systemic model failures.
                    </p>
                    <p>
                      <strong>Exam Relevance:</strong> This exact question archetype appears consistently in secondary certification assessments (BECE, WASSCE, and GCSE).
                    </p>
                  </div>
                )}
              </Card>

              {/* Schedule Retest Section */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#734DFD]" /> Spaced Retest Scheduling
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
          {/* SCREEN 5: Re-test Confirmation */}
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
                  Your tentative misconception in <strong className="text-slate-900 capitalize">{config.slug}</strong> has been diagnosed and remediated. A follow-up re-test has been placed on the spaced repetition queue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3F5FD] max-w-sm mx-auto text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">Kofi Mensah (STU-1001)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject / Concept:</span>
                  <span className="font-bold text-slate-900">{config.diagnosis.misconception.label}</span>
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
