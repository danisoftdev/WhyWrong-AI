import React from 'react';
import {
  Home,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Award,
  FileText,
  LayoutGrid,
  Users,
  ClipboardList,
  Calendar,
  Share2,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  variant?: 'student' | 'teacher' | 'parent';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  variant = 'student',
  className = '',
}) => {
  const isTeacher = variant === 'teacher';

  const studentNav = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'learn', label: 'Learn & Quiz', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ask-ai', label: 'Ask AI Agent', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'progress', label: 'My Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'graph', label: 'Knowledge Graph', icon: <Share2 className="w-4 h-4" /> },
    { id: 'practice', label: 'Practice Lab', icon: <Award className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Class map', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'assignments', label: 'Quizzes and work', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'groups', label: 'Groups', icon: <Users className="w-4 h-4" /> },
    { id: 'weekend', label: 'Weekend session', icon: <Calendar className="w-4 h-4" /> },
  ];

  const parentNav = [
    { id: 'summary', label: 'This week', icon: <Home className="w-4 h-4" /> },
    { id: 'digest', label: 'Weekly note', icon: <FileText className="w-4 h-4" /> },
    { id: 'link', label: 'Link a child', icon: <Users className="w-4 h-4" /> },
  ];

  const navItems = isTeacher ? teacherNav : variant === 'parent' ? parentNav : studentNav;

  return (
    <aside
      className={`w-64 shrink-0 border-r min-h-[calc(100vh-100px)] p-4 flex flex-col justify-between ${
        isTeacher
          ? 'bg-[#0C1421] border-[#1E2D4A] text-white'
          : 'bg-[#F3F5FD] border-slate-200/80 text-slate-800'
      } ${className}`}
    >
      <div>
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          {isTeacher ? 'Command Center' : variant === 'parent' ? 'Your child' : 'Learning Studio'}
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#734DFD] text-white shadow-sm'
                    : isTeacher
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info in Sidebar */}
      <div className={`p-3 rounded-2xl border text-xs flex items-center gap-3 ${
        isTeacher ? 'bg-[#111E38] border-[#1E2D4A]' : 'bg-white border-slate-200/60'
      }`}>
        <img
          src="/WWAI_icon.png"
          alt="WhyWrong Engine"
          className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
        />
        <div>
          <p className="font-bold text-slate-700 dark:text-slate-200 leading-tight">WhyWrong Engine</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Diagnostic AI Layer</p>
        </div>
      </div>
    </aside>
  );
};
