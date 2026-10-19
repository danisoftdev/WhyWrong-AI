export const DIAGNOSIS_STATES = {
  SUSPECTED: 'suspected',
  PROBING: 'probing',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  UNCLEAR: 'unclear',
  RESOLVED: 'resolved',
} as const;

export type AppDiagnosisState = typeof DIAGNOSIS_STATES[keyof typeof DIAGNOSIS_STATES];

export const EVIDENCE_STRENGTHS = {
  LOW: 'low',
  MODERATE: 'moderate',
  STRONG: 'strong',
} as const;

export type AppEvidenceStrength = typeof EVIDENCE_STRENGTHS[keyof typeof EVIDENCE_STRENGTHS];

export const EVIDENCE_THRESHOLDS = {
  MODERATE: 1.5,
  STRONG: 3.0,
  REJECTION: -0.5,
} as const;

export const AGENT_STAGES = {
  INGEST: 'ingest',
  DIAGNOSE: 'diagnose',
  PROBE: 'probe',
  REMEDIATE: 'remediate',
  RETEST: 'retest',
  REPORT: 'report',
} as const;

export type AppAgentStage = typeof AGENT_STAGES[keyof typeof AGENT_STAGES];
