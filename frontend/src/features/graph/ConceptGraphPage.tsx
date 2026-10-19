import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { TimelineItem } from '../../components/ui/TimelineItem';
import {
  Share2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import type { AgentEvent } from '../../types';

export const ConceptGraphPage: React.FC = () => {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('Fractions');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.getAgentEvents('diag-demo-kofi-01');
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
      } else {
        throw new Error('No events');
      }
    } catch {
      // Fallback demonstration events matching Screen 13
      setEvents([
        {
          id: '1',
          diagnosis_id: 'diag-1',
          stage: 'ingest',
          action: 'Analyzing submitted response: 1/3 + 1/4 = 2/7 with written working',
          status: 'done',
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: '2',
          diagnosis_id: 'diag-1',
          stage: 'diagnose',
          action: 'Checking verified subject pack: Matched pattern "Add tops, add bottoms" (moderate evidence)',
          status: 'done',
          created_at: new Date(Date.now() - 240000).toISOString(),
        },
        {
          id: '3',
          diagnosis_id: 'diag-1',
          stage: 'probe',
          action: 'Generating discriminating probe question (1/5 + 1/10) to test hypothesis stability',
          status: 'done',
          created_at: new Date(Date.now() - 180000).toISOString(),
        },
        {
          id: '4',
          diagnosis_id: 'diag-1',
          stage: 'remediate',
          action: 'Planning remediation: Pizza counterexample & 12ths common denominator strip simulation',
          status: 'done',
          created_at: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: '5',
          diagnosis_id: 'diag-1',
          stage: 'retest',
          action: 'Retention re-test scheduled for +7 days (retention validation cycle)',
          status: 'done',
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
      ]);
    }
  };

  // Concept Graph Nodes data from section 4.3 screen 12
  const nodes = [
    { id: 'Addition', label: 'Addition', status: 'Mastered', color: '#0BAA7B', x: 20, y: 30, desc: 'Single & multi-digit integer summation.' },
    { id: 'Multiplication', label: 'Multiplication', status: 'Mastered', color: '#0BAA7B', x: 20, y: 70, desc: 'Repeated addition and area models.' },
    { id: 'Fractions', label: 'Fractions', status: 'Misconception', color: '#E5484D', x: 50, y: 50, desc: 'Part-whole relationships; direct summation error detected.' },
    { id: 'Division', label: 'Division', status: 'Learning', color: '#734DFD', x: 50, y: 80, desc: 'Inverse multiplication and equal partitioning.' },
    { id: 'Common Denominators', label: 'Common Denominators', status: 'Learning', color: '#734DFD', x: 80, y: 30, desc: 'LCM and equivalent slice scaling.' },
    { id: 'Comparing', label: 'Comparing', status: 'Mastered', color: '#0BAA7B', x: 80, y: 60, desc: 'Evaluating unit fractions and cross-products.' },
    { id: 'Mixed Numbers', label: 'Mixed Numbers', status: 'Not Started', color: '#64748B', x: 80, y: 85, desc: 'Improper fractions and whole-part notation.' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/20">
            Cognitive Map & Autonomous Agent
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Knowledge Graph & Agent Activity
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Screen 12): Concept Knowledge Graph */}
        <div className="lg:col-span-7 bg-[#0B1020] text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#22D3EE]" /> Interactive Concept Knowledge Graph
              </h2>
              <p className="text-xs text-slate-400">Click any concept node to inspect cognitive status</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#0BAA7B]">
                <span className="w-2 h-2 rounded-full bg-[#0BAA7B]" /> Mastered
              </span>
              <span className="flex items-center gap-1 text-[#734DFD]">
                <span className="w-2 h-2 rounded-full bg-[#734DFD]" /> Learning
              </span>
              <span className="flex items-center gap-1 text-[#E5484D]">
                <span className="w-2 h-2 rounded-full bg-[#E5484D]" /> Misconception
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#64748B]" /> Not Started
              </span>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className="relative h-80 w-full rounded-2xl bg-[#070D1D] border border-white/10 overflow-hidden p-4 flex items-center justify-center">
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/15 stroke-2">
              <line x1="20%" y1="35%" x2="50%" y2="50%" strokeDasharray="4 4" />
              <line x1="20%" y1="70%" x2="50%" y2="50%" />
              <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#E5484D" strokeWidth="2.5" />
              <line x1="50%" y1="50%" x2="80%" y2="60%" />
              <line x1="50%" y1="80%" x2="80%" y2="85%" strokeDasharray="4 4" />
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.label;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.label)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg select-none ${
                    isSelected
                      ? 'scale-110 ring-4 ring-white/30 z-20'
                      : 'hover:scale-105 z-10'
                  }`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    backgroundColor: node.color,
                    color: '#fff',
                  }}
                >
                  {node.label}
                </button>
              );
            })}
          </div>

          {/* Selected Node Details Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{selectedNode}</span>
              <span className="text-[10px] text-cyan-300 font-mono">
                {nodes.find(n => n.label === selectedNode)?.status}
              </span>
            </div>
            <p className="text-slate-300">
              {nodes.find(n => n.label === selectedNode)?.desc}
            </p>
          </div>
        </div>

        {/* Right Column (Screen 13): AI Agent Activity Timeline */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1020] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#734DFD]" /> AI Agent Activity (Screen 13)
            </h2>
            <span className="text-[11px] font-bold text-[#0BAA7B] bg-[#0BAA7B]/10 px-2 py-0.5 rounded-full">
              Live State Machine
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Real-time trace from the <code>agent_events</code> table logging autonomous state transitions.
          </p>

          <div className="pt-2">
            {events.map((ev, idx) => (
              <TimelineItem
                key={ev.id}
                stage={ev.stage}
                action={ev.action}
                status={ev.status}
                timestamp={ev.created_at}
                isLast={idx === events.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
