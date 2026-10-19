import React, { useState, useEffect } from 'react';
import type { Role, User, Subject } from './types';
import { api } from './services/api';
import { DemoBar } from './components/ui/DemoBar';
import { TopBar } from './components/ui/TopBar';
import { Sidebar } from './components/ui/Sidebar';
import { LandingPage } from './features/landing/LandingPage';
import { StudentDashboard } from './features/student/StudentDashboard';
import { QuizFlow } from './features/quiz/QuizFlow';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { ParentPortal } from './features/parent/ParentPortal';
import { ProgressPage } from './features/progress/ProgressPage';
import { ConceptGraphPage } from './features/graph/ConceptGraphPage';
import { ReportPreviewPage } from './features/report/ReportPreviewPage';
import { DesignSystemPage } from './features/design-system/DesignSystemPage';
import { Card } from './components/ui/Card';
import { Shield, Sparkles, Activity, CheckCircle2, Zap } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-student-01',
    role: 'student',
    display_name: 'Kofi Mensah',
    student_code: 'STU-1001',
    email: 'kofi@student.edu',
    is_demo: true,
  });

  const [currentTab, setCurrentTab] = useState<string>('learn');
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);
  const [showDesignSystem, setShowDesignSystem] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [aiHealth, setAiHealth] = useState<any>(null);

  useEffect(() => {
    // Load subjects
    api.getSubjects().then((res) => {
      if (res.subjects) setSubjects(res.subjects);
    }).catch(() => {});

    // Load AI Health
    api.getAiHealth().then((res) => {
      setAiHealth(res.health);
    }).catch(() => {});
  }, []);

  const handleSwitchRole = async (role: Role) => {
    setShowDesignSystem(false);
    setIsTakingQuiz(false);

    if (role === 'visitor') {
      setCurrentUser(null);
      return;
    }

    try {
      const res = await api.setDemoSession(role);
      setCurrentUser(res.user);
      if (role === 'teacher') setCurrentTab('dashboard');
      else if (role === 'parent') setCurrentTab('summary');
      else setCurrentTab('learn');
    } catch {
      // Offline fallback
      const mockUser: User = {
        id: `mock-${role}`,
        role,
        display_name: role === 'teacher' ? 'Ms. Akua Mensah' : (role === 'parent' ? 'Mr. Kwesi Appiah' : 'WhyWrong Admin'),
        student_code: role === 'student' ? 'STU-1001' : undefined,
        email: `${role}@school.edu`,
        is_demo: true,
      };
      setCurrentUser(mockUser);
      if (role === 'teacher') setCurrentTab('dashboard');
      else if (role === 'parent') setCurrentTab('summary');
      else setCurrentTab('learn');
    }
  };

  // If Design System view requested
  if (showDesignSystem) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <DemoBar
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenDesignSystem={() => setShowDesignSystem(false)}
        />
        <div className="p-6">
          <button
            type="button"
            onClick={() => setShowDesignSystem(false)}
            className="mb-6 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            ← Back to App
          </button>
          <DesignSystemPage />
        </div>
      </div>
    );
  }

  // 1. VISITOR / LANDING PAGE
  if (!currentUser || currentUser.role === 'visitor') {
    return (
      <div className="min-h-screen bg-[#0B1020]">
        <DemoBar
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenDesignSystem={() => setShowDesignSystem(true)}
        />
        <LandingPage
          onStartLearning={() => handleSwitchRole('student')}
          onExploreTeacher={() => handleSwitchRole('teacher')}
          onExploreParent={() => handleSwitchRole('parent')}
        />
      </div>
    );
  }

  // 2. TEACHER DASHBOARD (Dark Teacher Center #0C1421)
  if (currentUser.role === 'teacher') {
    return (
      <div className="min-h-screen bg-[#0C1421] text-white">
        <DemoBar
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenDesignSystem={() => setShowDesignSystem(true)}
        />
        <TopBar
          user={currentUser}
          variant="teacher"
          onNavigateHome={() => setCurrentTab('dashboard')}
        />
        <div className="flex">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            variant="teacher"
            className="hidden md:flex"
          />
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {currentTab === 'dashboard' || currentTab === 'classroom' || currentTab === 'misconceptions' ? (
              <TeacherDashboard />
            ) : currentTab === 'reports' ? (
              <ReportPreviewPage />
            ) : (
              <TeacherDashboard />
            )}
          </main>
        </div>
      </div>
    );
  }

  // 3. PARENT PORTAL (Light Studio)
  if (currentUser.role === 'parent') {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <DemoBar
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenDesignSystem={() => setShowDesignSystem(true)}
        />
        <TopBar
          user={currentUser}
          variant="student"
          onNavigateHome={() => setCurrentTab('summary')}
        />
        <main className="max-w-5xl mx-auto p-4 sm:p-8">
          <ParentPortal />
        </main>
      </div>
    );
  }

  // 4. ADMIN VIEW (AI Provider Health & Security Audit)
  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#0B1020] text-white">
        <DemoBar
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenDesignSystem={() => setShowDesignSystem(true)}
        />
        <TopBar
          user={currentUser}
          variant="teacher"
          onNavigateHome={() => setCurrentTab('admin')}
        />
        <main className="max-w-5xl mx-auto p-6 sm:p-10 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/20">
              Administrator Console
            </span>
            <h1 className="text-3xl font-extrabold font-display text-white mt-2">
              AI Provider Health & Security Audit
            </h1>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card variant="teacher" className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#22D3EE]" /> Active Provider Routing
              </h2>
              <div className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] space-y-2 text-xs">
                <p>Configured Provider Mode: <strong className="text-[#22D3EE] uppercase font-mono">{aiHealth?.configured_mode || 'hybrid'}</strong></p>
                <p className="text-slate-400">Order: WhyWrong Engine → Gemini Free → Groq Free → Mock</p>
              </div>

              <div className="space-y-2 pt-2">
                {aiHealth?.providers && Object.entries(aiHealth.providers).map(([key, p]: any) => (
                  <div key={key} className="p-3 rounded-lg bg-[#0C1421] border border-[#1E2D4A] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-100">{p.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.name} ({p.tier})</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {p.available ? 'Available' : 'Standby'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="teacher" className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0BAA7B]" /> Mandatory Security Policies
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Anthropic / Claude APIs Permanently Excluded
                </div>
                <div className="p-3 rounded-lg bg-[#0C1421] border border-[#1E2D4A]">
                  <strong>100% Free Tier Compliance:</strong> Operates completely on the local WhyWrong rules engine and free quotas.
                </div>
                <div className="p-3 rounded-lg bg-[#0C1421] border border-[#1E2D4A]">
                  <strong>Child Data Privacy:</strong> Student names are never sent to external AI providers. Opaque student codes only.
                </div>
                <div className="p-3 rounded-lg bg-[#0C1421] border border-[#1E2D4A]">
                  <strong>Evidence Substring Check:</strong> All AI diagnoses must quote an exact substring of the submitted answer.
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // 5. STUDENT STUDIO (Default Light Studio #F7F9FC)
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col">
      <DemoBar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenDesignSystem={() => setShowDesignSystem(true)}
      />
      <TopBar
        user={currentUser}
        variant="student"
        onNavigateHome={() => {
          setIsTakingQuiz(false);
          setCurrentTab('home');
        }}
      />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsTakingQuiz(tab === 'practice');
          }}
          variant="student"
          className="hidden md:flex"
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {isTakingQuiz || currentTab === 'learn' ? (
            <QuizFlow onFinish={() => setIsTakingQuiz(false)} />
          ) : currentTab === 'progress' ? (
            <ProgressPage />
          ) : currentTab === 'graph' ? (
            <ConceptGraphPage />
          ) : currentTab === 'reports' ? (
            <ReportPreviewPage />
          ) : (
            <StudentDashboard
              subjects={subjects}
              onSelectSubject={() => setIsTakingQuiz(true)}
              onOpenQuickQuiz={() => setIsTakingQuiz(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
