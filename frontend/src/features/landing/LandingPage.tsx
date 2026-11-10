import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { StackedFraction } from '../../components/ui/StackedFraction';
import {
  Sparkles,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  X,
  CheckCircle2,
  Users,
  ShieldCheck,
  Brain,
  BookOpen,
  Menu,
  CalendarClock,
  Layers,
  ClipboardList,
  Video,
  Quote,
  FlaskConical,
  Atom,
  Sigma,
  Code,
  BarChart3,
  Dna,
} from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreTeacher: () => void;
  onExploreParent: () => void;
  onOpenLogin?: () => void;
  onCreateParent?: () => void;
}

const loop = [
  { n: '1', title: 'Bring the question', text: 'A teacher sets any STEM item, or enters answers the class already wrote.' },
  { n: '2', title: 'Quote the idea', text: 'A wrong answer opens a case. The evidence is a line from the learner’s own work. One answer stays suspected.' },
  { n: '3', title: 'Probe', text: 'Two or three short questions separate that idea from a slip, and from the next likely idea.' },
  { n: '4', title: 'Practice', text: 'The worksheet makes that exact rule fail, then walks through the contrast.' },
  { n: '5', title: 'Check again', text: 'A later check asks whether the new idea held.' },
  { n: '6', title: 'Report', text: 'The teacher sees the class. The parent hears only an accepted case, in plain language.' },
];

const fields = [
  { name: 'Mathematics', icon: Sigma },
  { name: 'Physics', icon: Atom },
  { name: 'Chemistry', icon: FlaskConical },
  { name: 'Biology', icon: Dna },
  { name: 'Computing', icon: Code },
  { name: 'Statistics', icon: BarChart3 },
];

const classroom = [
  { icon: ClipboardList, title: 'Quizzes and assignments', text: 'Any STEM question, a due date, and the working that lets the agent quote the idea.' },
  { icon: Layers, title: 'Two kinds of group', text: 'Group by the idea the class shares, or make your own groups and send work to one of them.' },
  { icon: CalendarClock, title: 'Weekend sessions', text: 'A time, a group, and the five-minute activity ready to present.' },
  { icon: Video, title: 'A call link, not a studio', text: 'The session holds the room link. The lesson, the worksheet, and the exit question stay in WhyWrong.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onExploreTeacher,
  onExploreParent,
  onOpenLogin,
  onCreateParent,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#0B1020] text-white selection:bg-[#734DFD] selection:text-white relative overflow-x-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#734DFD]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-[#22D3EE]/15 rounded-full blur-[130px] pointer-events-none" />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between border-b border-white/10 relative z-20">
        <a href="#top" className="flex items-center gap-3">
          <img src="/WWAI_compact_dark.png" alt="WhyWrong AI" className="h-12 sm:h-14 w-auto object-contain" />
        </a>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#stem" className="hover:text-white transition-colors">STEM</a>
          <a href="#classroom" className="hover:text-white transition-colors">Classroom</a>
          <a href="#accounts" className="hover:text-white transition-colors">Accounts</a>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onOpenLogin || onStartLearning} className="border-white/20 text-white hover:bg-white/10">
            Sign in
          </Button>
          <Button variant="gradient" size="sm" onClick={onStartLearning} className="shadow-lg shadow-[#734DFD]/25">
            Try a live case
          </Button>
        </div>

        <button
          type="button"
          className="sm:hidden p-2 rounded-xl border border-white/15 text-white"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden relative z-20 border-b border-white/10 bg-[#0B1020] px-4 py-4 space-y-3">
          <a href="#how" onClick={closeMenu} className="block text-sm text-slate-200">How it works</a>
          <a href="#stem" onClick={closeMenu} className="block text-sm text-slate-200">STEM</a>
          <a href="#classroom" onClick={closeMenu} className="block text-sm text-slate-200">Classroom</a>
          <a href="#accounts" onClick={closeMenu} className="block text-sm text-slate-200">Accounts</a>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onOpenLogin || onStartLearning} className="border-white/20 text-white">
              Sign in
            </Button>
            <Button variant="gradient" size="sm" onClick={onStartLearning}>
              Try a live case
            </Button>
          </div>
        </div>
      )}

      <section id="top" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">Any STEM question. One diagnostic agent.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.12]">
            Every wrong answer <br />
            has a reason. <br />
            <span className="bg-gradient-to-r from-[#734DFD] via-[#A855F7] to-[#22D3EE] bg-clip-text text-transparent">
              Let’s discover it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Bring the question your class already set. WhyWrong quotes the faulty idea in the learner’s own work, checks it with probes, builds practice for that idea, and looks again days later.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="gradient" size="lg" onClick={onStartLearning} className="gap-2.5 px-8 shadow-xl shadow-[#734DFD]/30">
              Try a live case <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={onOpenLogin || onStartLearning} className="border-white/20 hover:bg-white/10 text-white">
              Sign in
            </Button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2.5">
            <Chip variant="dark" icon={<Quote className="w-3.5 h-3.5 text-[#22D3EE]" />} label="Evidence is a quote" />
            <Chip variant="dark" icon={<Brain className="w-3.5 h-3.5 text-[#734DFD]" />} label="Suspected until probes agree" />
            <Chip variant="dark" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#0BAA7B]" />} label="Teacher confirms" />
            <Chip variant="dark" icon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />} label="Parent sees their child" />
          </div>
        </div>

        <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
          <div className="relative w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full border-2 border-[#22D3EE]/30 p-4 flex items-center justify-center shadow-[0_0_80px_-20px_rgba(34,211,238,0.35)]">
            <div className="w-full h-full rounded-full border border-[#734DFD]/40 p-3 sm:p-4 flex items-center justify-center">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full p-1.5 bg-gradient-to-tr from-[#734DFD] via-[#22D3EE] to-[#3B82F6] shadow-[0_0_60px_rgba(115,77,253,0.5)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0B1020] relative flex items-center justify-center border border-white/20">
                  <img
                    src="/student_thinking_portrait.png"
                    alt="A student thinking through a problem"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/90 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 inset-x-4 bg-[#0B1020]/85 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/20 text-center">
                    <span className="text-[11px] font-bold text-white font-display flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0BAA7B]" />
                      Case open · suspected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:block absolute -top-3 -left-2 sm:-left-6 bg-[#111E38]/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-2xl max-w-[200px] z-20">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E5484D] uppercase tracking-wider mb-1">
                <X className="w-3.5 h-3.5 stroke-[3]" /> Quoted from the answer
              </div>
              <div className="text-sm font-bold text-white">
                <StackedFraction math="\frac{1}{3} + \frac{1}{4} = \frac{2}{7}" />
              </div>
            </div>

            <div className="hidden md:block absolute -bottom-5 -left-2 sm:-left-4 bg-[#111E38]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#734DFD]/40 shadow-2xl max-w-[220px] z-20">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22D3EE] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Suspected idea
              </div>
              <p className="text-xs font-bold text-white">Add the tops and the bottoms</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Strength stays low, moderate, or strong. One answer is not a verdict.</p>
            </div>

            <div className="hidden md:flex absolute -top-2 right-0 sm:-right-3 bg-[#111E38]/95 backdrop-blur-md p-3 rounded-2xl border border-amber-400/40 shadow-xl items-center gap-2.5 z-20">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Practice</p>
                <p className="text-xs font-bold text-white">1/2 + 1/2 ≠ 2/4</p>
              </div>
            </div>

            <div className="hidden md:block absolute -bottom-3 right-0 sm:-right-4 bg-gradient-to-br from-[#734DFD]/90 to-[#3B82F6]/90 p-3.5 rounded-2xl border border-white/20 shadow-2xl max-w-[190px] z-20">
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-200 uppercase mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> The line
              </div>
              <p className="text-xs font-extrabold text-white leading-tight">Fix the thinking, not just the answer.</p>
            </div>
          </div>
          <div className="md:hidden mt-8 grid gap-3 text-left w-full max-w-md">
            <div className="rounded-2xl bg-[#111E38] border border-white/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#E5484D]">Quoted from the answer</p>
              <p className="mt-1 font-bold">1/3 + 1/4 = 2/7</p>
            </div>
            <div className="rounded-2xl bg-[#111E38] border border-[#734DFD]/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#22D3EE]">Suspected idea</p>
              <p className="mt-1 font-bold">Add the tops and the bottoms</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#734DFD] to-[#3B82F6] p-4">
              <p className="font-bold">Fix the thinking, not just the answer.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 border-t border-white/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">How it works</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-display max-w-2xl">The same case, on every STEM question</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loop.map((step) => (
              <article key={step.n} className="rounded-3xl bg-[#111E38] border border-white/10 p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#734DFD]/20 text-sm font-bold text-[#A78BFA]">{step.n}</span>
                <h3 className="mt-4 font-bold font-display text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stem" className="relative z-10 border-t border-white/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">STEM</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-display">The field is the label. The question can be any question.</h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Mathematics, physics, chemistry, biology, computing, and statistics all use one engine. A known idea uses the reviewed library. A new question proposes candidate ideas marked unverified, and the teacher confirms before that idea is saved or sent home.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="rounded-2xl bg-white/5 border border-white/10 p-4 min-h-[108px]">
                  <Icon className="w-5 h-5 text-[#22D3EE]" />
                  <p className="mt-3 font-bold text-sm">{field.name}</p>
                  <p className="mt-1 text-xs text-slate-400">Any question in this field</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="classroom" className="relative z-10 border-t border-white/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">Classroom</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-display max-w-3xl">Work, groups, and a weekend session you can present</h2>
          <p className="mt-4 max-w-2xl text-slate-300 leading-relaxed">
            The class map decides who needs which task. The teacher assigns a quiz or a worksheet to the whole class, to a group they made, or to the learners who share one idea.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {classroom.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-3xl bg-[#111E38] border border-white/10 p-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#734DFD]/15 text-[#A78BFA] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-bold font-display">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="accounts" className="relative z-10 border-t border-white/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">Three accounts</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-display">Each person has one job</h2>
          <div className="mt-10 grid lg:grid-cols-3 gap-4">
            <article className="rounded-3xl bg-[#111E38] border border-white/10 p-6 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-[#734DFD]/20 text-[#A78BFA] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold font-display">Student</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Answers the assigned work, sees the quote and the probes, practices the idea, and returns for the later check. Progress is ideas fixed, not a rank.</p>
              <Button variant="gradient" size="sm" onClick={onStartLearning} className="mt-6 self-start">
                Preview the learner desk
              </Button>
            </article>

            <article className="rounded-3xl bg-[#111E38] border border-white/10 p-6 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold font-display">Teacher</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Owns the class. Sets quizzes and assignments, groups learners, schedules the weekend session, and accepts, edits, or rejects every case before it travels further.</p>
              <Button variant="outline" size="sm" onClick={onExploreTeacher} className="mt-6 self-start border-white/20 text-white hover:bg-white/10">
                Preview the teacher desk
              </Button>
            </article>

            <article className="rounded-3xl bg-[#111E38] border border-white/10 p-6 flex flex-col">
              <div className="w-10 h-10 rounded-2xl bg-[#0BAA7B]/15 text-[#0BAA7B] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold font-display">Parent</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Creates their own account, links one child with a code from the teacher, and reads a plain weekly note plus one home activity. Unaccepted cases stay out.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="gradient" size="sm" onClick={onCreateParent || onOpenLogin}>
                  Create a parent account
                </Button>
                <Button variant="outline" size="sm" onClick={onExploreParent} className="border-white/20 text-white hover:bg-white/10">
                  Preview
                </Button>
              </div>
            </article>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            The previews use a labelled demonstration class. A parent can create an account here. The teacher classroom stores quizzes, groups, and a weekend call link. Learners answer that work next.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <img src="/WWAI_dark.png" alt="WhyWrong AI" className="h-8 w-auto object-contain opacity-80" />
          <p>WhyWrong · Fix the thinking, not just the answer.</p>
          <a href="https://danysoftdev.com" target="_blank" rel="noopener noreferrer" className="text-[#22D3EE] hover:underline">
            danysoftdev.com
          </a>
        </div>
      </footer>
    </div>
  );
};
