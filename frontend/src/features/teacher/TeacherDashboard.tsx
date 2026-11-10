import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  KeyRound,
  Pencil,
} from 'lucide-react';
import { api } from '../../services/api';

interface TeacherDashboardProps {
  tab?: string;
  onTab?: (tab: string) => void;
}

function formatLongDate(value?: string | null): string {
  if (!value) return 'No date set';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const fieldClass = 'w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#1E2D4A] bg-[#0C1421] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#734DFD]';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ tab = 'dashboard', onTab }) => {
  const activeTab = tab === 'assignments' || tab === 'groups' || tab === 'weekend' ? tab : 'dashboard';
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState('');
  const [map, setMap] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [work, setWork] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [className, setClassName] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [linkCode, setLinkCode] = useState<{ name: string; code: string; expires: string } | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [editIdea, setEditIdea] = useState('');
  const [editComment, setEditComment] = useState('');

  const [workTitle, setWorkTitle] = useState('');
  const [workKind, setWorkKind] = useState<'quiz' | 'worksheet'>('quiz');
  const [workSubject, setWorkSubject] = useState('');
  const [workPrompt, setWorkPrompt] = useState('');
  const [workDue, setWorkDue] = useState('');
  const [workAudience, setWorkAudience] = useState<'class' | 'group'>('class');
  const [workGroup, setWorkGroup] = useState('');

  const [groupName, setGroupName] = useState('');
  const [groupKind, setGroupKind] = useState<'custom' | 'idea'>('custom');
  const [groupIdea, setGroupIdea] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionWhen, setSessionWhen] = useState('');
  const [sessionUrl, setSessionUrl] = useState('');
  const [sessionActivity, setSessionActivity] = useState('');
  const [sessionGroup, setSessionGroup] = useState('');
  const [rosterNames, setRosterNames] = useState('');
  const [newLearners, setNewLearners] = useState<any[]>([]);

  const go = (next: string) => onTab?.(next);

  const say = (message: string) => {
    setNotice(message);
    setError('');
  };

  const fail = (err: any, fallback: string) => {
    setError(err?.message || fallback);
    setNotice('');
  };

  const loadClass = async (id: string) => {
    const [heatmap, groupRes, workRes, sessionRes] = await Promise.all([
      api.getTeacherHeatmap(id),
      api.listGroups(id).catch((err) => ({ groups: [], error: err.message })),
      api.listAssignments(id).catch((err) => ({ assignments: [], error: err.message })),
      api.listSessions(id).catch((err) => ({ sessions: [], error: err.message })),
    ]);
    setMap(heatmap);
    setGroups(groupRes.groups || []);
    setWork(workRes.assignments || []);
    setSessions(sessionRes.sessions || []);
    const tableError = groupRes.error || workRes.error || sessionRes.error;
    if (tableError) setError(tableError);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.listClasses();
      const list = res.classes || [];
      setClasses(list);
      const id = classId && list.some((item: any) => item.id === classId) ? classId : list[0]?.id || '';
      setClassId(id);
      if (id) await loadClass(id);
      else setMap(null);
    } catch (err: any) {
      setClasses([]);
      setMap(null);
      fail(err, 'Sign in with a teacher account to open your class.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateClass = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const res = await api.createClass(className.trim(), classLevel.trim());
      setClassName('');
      setClassLevel('');
      say(`Class “${res.class?.name || className}” is ready.`);
      setClassId(res.class?.id || '');
      await load();
    } catch (err: any) {
      fail(err, 'The class could not be created.');
    }
  };

  const handleReview = async (diagnosis: any, decision: 'accepted' | 'rejected' | 'edited') => {
    try {
      await api.reviewDiagnosis(
        diagnosis.id,
        decision,
        decision === 'edited' ? editComment : `Teacher ${decision} this case.`,
        decision === 'edited' ? editIdea : undefined,
      );
      setEditing(null);
      say(decision === 'accepted'
        ? 'Accepted. A parent of this child can now see this idea.'
        : decision === 'rejected'
          ? 'Rejected. This case stays off the parent note.'
          : 'Edited. The case stays suspected until you accept it.');
      if (classId) await loadClass(classId);
    } catch (err: any) {
      fail(err, 'The review could not be saved.');
    }
  };

  const handleLinkCode = async (student: any) => {
    try {
      const res = await api.generateLinkCode(student.id);
      setLinkCode({
        name: student.display_name,
        code: res.code,
        expires: res.expires_at,
      });
      say('Parent code created. It works once, for this child only.');
    } catch (err: any) {
      setLinkCode(null);
      fail(err, 'A parent code could not be created for this learner.');
    }
  };

  const handleCreateWork = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classId) return;
    try {
      await api.createAssignment(classId, {
        title: workTitle.trim(),
        kind: workKind,
        subject_label: workSubject.trim(),
        prompt: workPrompt.trim(),
        due_at: workDue,
        audience: workAudience,
        group_id: workAudience === 'group' ? workGroup : '',
      });
      setWorkTitle('');
      setWorkPrompt('');
      setWorkDue('');
      say('The work is stored. Learners answer it from the student desk in the next step.');
      await loadClass(classId);
    } catch (err: any) {
      fail(err, 'The work could not be saved.');
    }
  };

  const handleCreateGroup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classId) return;
    try {
      const res = await api.createGroup(classId, {
        name: groupName.trim(),
        kind: groupKind,
        idea_label: groupIdea,
        student_ids: groupMembers,
      });
      setGroupName('');
      setGroupMembers([]);
      say(groupKind === 'idea'
        ? `Idea group saved with ${res.group?.member_count ?? 0} learners who share that idea.`
        : 'Group saved.');
      await loadClass(classId);
    } catch (err: any) {
      fail(err, 'The group could not be saved.');
    }
  };

  const handleCreateSession = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classId) return;
    try {
      await api.createSession(classId, {
        title: sessionTitle.trim(),
        starts_at: sessionWhen,
        call_url: sessionUrl.trim(),
        activity: sessionActivity.trim(),
        group_id: sessionGroup,
      });
      setSessionTitle('');
      setSessionWhen('');
      setSessionUrl('');
      setSessionActivity('');
      say('Session saved. Share the call link. The activity stays in WhyWrong.');
      await loadClass(classId);
    } catch (err: any) {
      fail(err, 'The session could not be saved.');
    }
  };

  const handleAddLearners = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classId) return;
    const students = rosterNames
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((display_name) => ({ display_name }));
    if (students.length === 0) return;
    try {
      const res = await api.createStudentRoster(classId, students);
      setNewLearners(res.students || []);
      setRosterNames('');
      say('Learners added. Give each one the code and PIN shown here. The PIN is not shown again.');
      await loadClass(classId);
    } catch (err: any) {
      fail(err, 'The learners could not be added.');
    }
  };

  const toggleMember = (id: string) => {
    setGroupMembers((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const kpis = map?.kpis || {};
  const students = map?.students || [];
  const ideas = map?.common_misconceptions || [];
  const topics = map?.heatmap_grid || [];
  const packIdeas = map?.pack_ideas || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100">
      <div className="flex flex-col gap-4 border-b border-[#1E2D4A] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">Teacher</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">Classroom</h1>
          {kpis.is_demo_data && (
            <p className="text-xs text-amber-300 mt-1">{kpis.demo_label}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ['dashboard', 'Class map'],
            ['assignments', 'Quizzes and work'],
            ['groups', 'Groups'],
            ['weekend', 'Weekend session'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                activeTab === id ? 'bg-[#734DFD] text-white' : 'bg-[#111E38] text-slate-300 border border-[#1E2D4A]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-[#0BAA7B]/10 border border-[#0BAA7B]/30 text-[#0BAA7B] text-sm">{notice}</div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#E5484D] text-sm">{error}</div>
      )}

      {loading && <p className="text-sm text-slate-400">Loading your class…</p>}

      {!loading && classes.length === 0 && (
        <Card variant="teacher" className="space-y-4 max-w-xl">
          <h2 className="text-lg font-bold font-display">Create a class</h2>
          <p className="text-sm text-slate-400">A class holds the roster, the work, the groups, and the weekend session.</p>
          <form onSubmit={handleCreateClass} className="space-y-3">
            <input required value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class name" className={fieldClass} />
            <input value={classLevel} onChange={(e) => setClassLevel(e.target.value)} placeholder="Year or form, optional" className={fieldClass} />
            <Button type="submit" variant="gradient">Create class</Button>
          </form>
        </Card>
      )}

      {!loading && classes.length > 0 && (
        <label className="block text-xs text-slate-400">
          Class
          <select
            value={classId}
            onChange={async (e) => {
              setClassId(e.target.value);
              try {
                await loadClass(e.target.value);
              } catch (err: any) {
                fail(err, 'That class could not be opened.');
              }
            }}
            className={`${fieldClass} mt-1 max-w-sm`}
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}{item.level ? ` · ${item.level}` : ''}</option>
            ))}
          </select>
        </label>
      )}

      {activeTab === 'dashboard' && map && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="teacher">
              <p className="text-xs text-slate-400">Learners</p>
              <p className="text-3xl font-black font-display mt-1">{kpis.total_students ?? 0}</p>
            </Card>
            <Card variant="teacher">
              <p className="text-xs text-slate-400">Open cases</p>
              <p className="text-3xl font-black font-display text-amber-300 mt-1">{kpis.open_cases ?? 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Still suspected until you accept them</p>
            </Card>
            <Card variant="teacher">
              <p className="text-xs text-slate-400">Accepted ideas</p>
              <p className="text-3xl font-black font-display text-[#0BAA7B] mt-1">{kpis.accepted_ideas ?? 0}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="teacher" className="space-y-3">
              <h2 className="font-bold font-display">Ideas in this class</h2>
              {ideas.length === 0 && <p className="text-sm text-slate-400">No open idea yet. The map fills from answers, not from a fixed topic list.</p>}
              {ideas.map((idea: any) => (
                <div key={idea.id} className="p-3 rounded-xl bg-[#0C1421] border border-[#1E2D4A] text-sm">
                  <p className="font-semibold">{idea.label}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {idea.student_count} learner{Number(idea.student_count) === 1 ? '' : 's'}
                    {idea.suppressed ? ' · share hidden while fewer than 3 learners have it' : idea.percentage != null ? ` · ${idea.percentage}% of the class` : ''}
                  </p>
                </div>
              ))}
            </Card>

            <Card variant="teacher" className="space-y-3">
              <h2 className="font-bold font-display">Topics with cases</h2>
              {topics.length === 0 && <p className="text-sm text-slate-400">No topic has a case yet.</p>}
              {topics.map((topic: any) => (
                <div key={topic.topic} className="p-3 rounded-xl bg-[#0C1421] border border-[#1E2D4A] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{topic.topic}</p>
                    <p className="text-xs text-slate-400">{topic.open_cases} open · {topic.accepted} accepted</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${Number(topic.open_cases) > 0 ? 'bg-amber-400/15 text-amber-300' : 'bg-[#0BAA7B]/15 text-[#0BAA7B]'}`}>
                    {Number(topic.open_cases) > 0 ? 'Open' : 'Clear'}
                  </span>
                </div>
              ))}
            </Card>
          </div>

          <Card variant="teacher" className="space-y-3 max-w-xl">
            <h2 className="font-bold font-display">Add learners</h2>
            <p className="text-sm text-slate-400">One name on each line. Each learner gets a code and a PIN.</p>
            <form onSubmit={handleAddLearners} className="space-y-3">
              <textarea value={rosterNames} onChange={(e) => setRosterNames(e.target.value)} rows={4} placeholder={'Ama Mensah\nKofi Boateng'} className={fieldClass} />
              <Button type="submit" variant="gradient">Add to this class</Button>
            </form>
            {newLearners.length > 0 && (
              <div className="space-y-2">
                {newLearners.map((learner) => (
                  <p key={learner.id} className="text-sm font-mono">
                    {learner.display_name}: {learner.student_code} · PIN {learner.pin}
                  </p>
                ))}
              </div>
            )}
          </Card>

          <Card variant="teacher" className="space-y-4">
            <h2 className="font-bold font-display">Cases to decide</h2>
            {students.length === 0 && <p className="text-sm text-slate-400">Add learners from the roster when you are ready. This phase stores the class work first.</p>}
            {students.map((student: any) => (
              <div key={student.id} className="p-4 rounded-xl bg-[#0C1421] border border-[#1E2D4A] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{student.display_name} <span className="text-xs font-mono text-slate-400">{student.student_code}</span></p>
                  <button type="button" onClick={() => handleLinkCode(student)} className="text-xs font-bold text-[#22D3EE] inline-flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Parent code
                  </button>
                </div>
                {(student.diagnoses || []).length === 0 && <p className="text-xs text-slate-500">No case yet.</p>}
                {(student.diagnoses || []).map((diagnosis: any) => (
                  <div key={diagnosis.id} className="text-sm space-y-2 border-t border-[#1E2D4A] pt-3">
                    <p>
                      <span className="text-amber-200">{diagnosis.misconception_label || 'Unlabelled idea'}</span>
                      <span className="text-slate-500"> · {diagnosis.state} · {diagnosis.evidence_strength}</span>
                    </p>
                    <p className="text-xs text-cyan-200 font-mono">“{diagnosis.evidence_quote}”</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleReview(diagnosis, 'accepted')} className="px-2.5 py-1.5 rounded-lg bg-[#0BAA7B]/20 text-[#0BAA7B] text-xs font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button type="button" onClick={() => { setEditing(diagnosis); setEditIdea(''); setEditComment(''); }} className="px-2.5 py-1.5 rounded-lg bg-[#734DFD]/20 text-[#c4b5fd] text-xs font-bold inline-flex items-center gap-1">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => handleReview(diagnosis, 'rejected')} className="px-2.5 py-1.5 rounded-lg bg-[#E5484D]/20 text-[#E5484D] text-xs font-bold inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                    {editing?.id === diagnosis.id && (
                      <form
                        className="space-y-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleReview(diagnosis, 'edited');
                        }}
                      >
                        <select required value={editIdea} onChange={(e) => setEditIdea(e.target.value)} className={fieldClass}>
                          <option value="">Choose the idea this evidence supports</option>
                          {packIdeas.filter((idea: any) => idea.id !== diagnosis.misconception_id).map((idea: any) => (
                            <option key={idea.id} value={idea.id}>{idea.label}</option>
                          ))}
                        </select>
                        <input value={editComment} onChange={(e) => setEditComment(e.target.value)} placeholder="Note for your records, optional" className={fieldClass} />
                        <Button type="submit" variant="gradient" size="sm">Save edit</Button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {linkCode && (
              <div className="p-4 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30">
                <p className="text-xs text-[#22D3EE] font-bold">Parent code for {linkCode.name}</p>
                <p className="text-2xl font-mono font-black tracking-widest mt-1">{linkCode.code}</p>
                <p className="text-xs text-slate-400 mt-1">Use by {formatLongDate(linkCode.expires)}. One child, one use.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'assignments' && classId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="teacher" className="space-y-3">
            <h2 className="font-bold font-display">Set a quiz or a worksheet</h2>
            <p className="text-sm text-slate-400">The subject is a label. Any STEM question can be the prompt.</p>
            <form onSubmit={handleCreateWork} className="space-y-3">
              <input required value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} placeholder="Title" className={fieldClass} />
              <div className="grid grid-cols-2 gap-3">
                <select value={workKind} onChange={(e) => setWorkKind(e.target.value as 'quiz' | 'worksheet')} className={fieldClass}>
                  <option value="quiz">Quiz</option>
                  <option value="worksheet">Worksheet</option>
                </select>
                <input required value={workSubject} onChange={(e) => setWorkSubject(e.target.value)} placeholder="Subject" className={fieldClass} />
              </div>
              <textarea required value={workPrompt} onChange={(e) => setWorkPrompt(e.target.value)} placeholder="The question, in the words the class will see" rows={4} className={fieldClass} />
              <input type="datetime-local" value={workDue} onChange={(e) => setWorkDue(e.target.value)} className={fieldClass} />
              <select value={workAudience} onChange={(e) => setWorkAudience(e.target.value as 'class' | 'group')} className={fieldClass}>
                <option value="class">Whole class</option>
                <option value="group">One group</option>
              </select>
              {workAudience === 'group' && (
                <select required value={workGroup} onChange={(e) => setWorkGroup(e.target.value)} className={fieldClass}>
                  <option value="">Choose a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              )}
              <Button type="submit" variant="gradient">Save work</Button>
            </form>
          </Card>
          <Card variant="teacher" className="space-y-3">
            <h2 className="font-bold font-display">Set for this class</h2>
            {work.length === 0 && <p className="text-sm text-slate-400">Nothing set yet.</p>}
            {work.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-[#0C1421] border border-[#1E2D4A] text-sm">
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.kind} · {item.subject_label} · {item.audience === 'group' ? item.group_name || 'Group' : 'Whole class'}</p>
                <p className="text-xs text-slate-300 mt-2">{item.prompt}</p>
                <p className="text-[11px] text-slate-500 mt-2">Due {formatLongDate(item.due_at)}</p>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === 'groups' && classId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="teacher" className="space-y-3">
            <h2 className="font-bold font-display">Make a group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <select value={groupKind} onChange={(e) => setGroupKind(e.target.value as 'custom' | 'idea')} className={fieldClass}>
                <option value="custom">A group you choose</option>
                <option value="idea">Learners who share one idea</option>
              </select>
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder={groupKind === 'idea' ? 'Name, or leave blank to use the idea' : 'Group name'} className={fieldClass} required={groupKind === 'custom'} />
              {groupKind === 'idea' ? (
                <select required value={groupIdea} onChange={(e) => setGroupIdea(e.target.value)} className={fieldClass}>
                  <option value="">Choose the idea</option>
                  {ideas.map((idea: any) => (
                    <option key={idea.id} value={idea.label}>{idea.label}</option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {students.map((student: any) => (
                    <label key={student.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={groupMembers.includes(student.id)} onChange={() => toggleMember(student.id)} />
                      {student.display_name}
                    </label>
                  ))}
                  {students.length === 0 && <p className="text-sm text-slate-400">This class has no learners yet.</p>}
                </div>
              )}
              <Button type="submit" variant="gradient"><Users className="w-4 h-4 mr-1" /> Save group</Button>
            </form>
          </Card>
          <Card variant="teacher" className="space-y-3">
            <h2 className="font-bold font-display">Groups</h2>
            {groups.length === 0 && <p className="text-sm text-slate-400">No groups yet.</p>}
            {groups.map((group) => (
              <div key={group.id} className="p-3 rounded-xl bg-[#0C1421] border border-[#1E2D4A] text-sm">
                <p className="font-semibold">{group.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {group.kind === 'idea' ? `Idea group · ${group.idea_label}` : 'Your group'} · {group.member_count} learners
                </p>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === 'weekend' && classId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="teacher" className="space-y-3">
            <h2 className="font-bold font-display">Weekend session</h2>
            <p className="text-sm text-slate-400">Paste the room link. WhyWrong keeps the activity and does not host the call.</p>
            <form onSubmit={handleCreateSession} className="space-y-3">
              <input required value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Session title" className={fieldClass} />
              <input required type="datetime-local" value={sessionWhen} onChange={(e) => setSessionWhen(e.target.value)} className={fieldClass} />
              <input required type="url" value={sessionUrl} onChange={(e) => setSessionUrl(e.target.value)} placeholder="https://…" className={fieldClass} />
              <textarea required value={sessionActivity} onChange={(e) => setSessionActivity(e.target.value)} placeholder="The five-minute activity they will present" rows={4} className={fieldClass} />
              <select value={sessionGroup} onChange={(e) => setSessionGroup(e.target.value)} className={fieldClass}>
                <option value="">Whole class</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <Button type="submit" variant="gradient">Save session</Button>
            </form>
          </Card>
          <Card variant="teacher" className="space-y-3">
            <h2 className="font-bold font-display">Scheduled</h2>
            {sessions.length === 0 && <p className="text-sm text-slate-400">No session yet.</p>}
            {sessions.map((session) => (
              <div key={session.id} className="p-3 rounded-xl bg-[#0C1421] border border-[#1E2D4A] text-sm space-y-1">
                <p className="font-semibold">{session.title}</p>
                <p className="text-xs text-slate-400">{formatLongDate(session.starts_at)} · {session.group_name || 'Whole class'}</p>
                <a href={session.call_url} className="text-xs text-[#22D3EE] break-all" target="_blank" rel="noreferrer">{session.call_url}</a>
                <p className="text-xs text-slate-300">{session.activity}</p>
              </div>
            ))}
          </Card>
        </div>
      )}

      {!classId && !loading && activeTab !== 'dashboard' && (
        <p className="text-sm text-slate-400 inline-flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Create a class on the class map first.</p>
      )}
    </div>
  );
};
