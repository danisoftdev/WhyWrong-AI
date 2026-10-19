export type Role = 'visitor' | 'student' | 'teacher' | 'parent' | 'admin';

export interface User {
  id: string;
  role: Role;
  display_name: string;
  student_code?: string;
  email: string;
  is_demo?: boolean;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color_token: string;
  sort_order: number;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  subject_id: string;
  slug: string;
  name: string;
  question_count?: number;
  questions?: Question[];
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
  misconception_id?: string | null;
}

export interface Question {
  id: string;
  topic_id: string;
  prompt: string;
  prompt_type: 'text' | 'katex' | 'image';
  options: QuestionOption[];
  difficulty: number;
}

export type EvidenceStrength = 'low' | 'moderate' | 'strong';
export type DiagnosisState = 'suspected' | 'probing' | 'confirmed' | 'rejected';

export interface Diagnosis {
  id: string;
  attempt_id: string;
  state: DiagnosisState;
  evidence_quote: string;
  evidence_strength: EvidenceStrength;
  provider: string;
  is_demo?: boolean;
  demo_label?: string;
  misconception?: {
    id: string;
    label: string;
    explanation: string;
  } | null;
  next_action?: string;
}

export interface ProbeOption {
  id: string;
  text: string;
  is_predicted_wrong?: boolean;
  is_correct?: boolean;
  is_unsure?: boolean;
}

export interface Probe {
  id: string;
  diagnosis_id: string;
  question: {
    prompt: string;
    options: ProbeOption[];
  };
  predicted_wrong?: string;
  rationale?: string;
  result?: 'confirms' | 'contradicts' | 'inconclusive' | 'pending';
}

export interface Remediation {
  id: string;
  lesson: {
    counterexample: {
      statement: string;
      analogy: string;
    };
    worked_contrast: {
      incorrect_rule: string;
      correct_rule: string;
      explanation: string;
    };
    interactive_type: string;
    practice_questions: Array<{
      id?: string;
      prompt: string;
      options: string[];
      correct: string;
    }>;
  };
  worksheet: {
    title: string;
  };
}

export interface AgentEvent {
  id: string;
  diagnosis_id: string;
  stage: 'ingest' | 'diagnose' | 'probe' | 'remediate' | 'retest' | 'report';
  action: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  created_at: string;
}
