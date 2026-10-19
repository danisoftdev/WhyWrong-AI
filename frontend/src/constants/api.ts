export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ROUTES = {
  HEALTH: `${API_BASE_URL}/health`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  DEMO_SESSION: `${API_BASE_URL}/demo/session`,
  DEMO_RESET: `${API_BASE_URL}/demo/reset`,
  DEMO_ADVANCE: `${API_BASE_URL}/demo/advance`,
  
  SUBJECTS: `${API_BASE_URL}/subjects`,
  TOPIC_QUESTIONS: (topicSlug: string) => `${API_BASE_URL}/topics/${topicSlug}/questions`,
  ATTEMPTS: `${API_BASE_URL}/attempts`,
  DIAGNOSIS: (id: string) => `${API_BASE_URL}/diagnoses/${id}`,
  DIAGNOSIS_PROBES: (id: string) => `${API_BASE_URL}/diagnoses/${id}/probes`,
  PROBE_RESPONSE: (probeId: string) => `${API_BASE_URL}/probes/${probeId}/responses`,
  DIAGNOSIS_REMEDIATION: (id: string) => `${API_BASE_URL}/diagnoses/${id}/remediation`,
  PRACTICE_RESPONSE: (remediationId: string) => `${API_BASE_URL}/remediations/${remediationId}/practice`,
  DIAGNOSIS_EVENTS: (id: string) => `${API_BASE_URL}/diagnoses/${id}/events`,
  STUDENT_PROGRESS: `${API_BASE_URL}/me/progress`,
  DIAGNOSIS_RETESTS: (id: string) => `${API_BASE_URL}/diagnoses/${id}/retests`,
  RETEST_RESPONSE: (retestId: string) => `${API_BASE_URL}/retests/${retestId}/responses`,

  CLASSES: `${API_BASE_URL}/classes`,
  CLASS_MAP: (classId: string) => `${API_BASE_URL}/classes/${classId}/map`,
  CLASS_REVIEW_QUEUE: (classId: string) => `${API_BASE_URL}/classes/${classId}/review-queue`,
  DIAGNOSIS_REVIEW: (id: string) => `${API_BASE_URL}/diagnoses/${id}/review`,
  CLASS_INTERVENTIONS: (classId: string) => `${API_BASE_URL}/classes/${classId}/interventions`,
  CLASS_ASSIGNMENTS: (classId: string) => `${API_BASE_URL}/classes/${classId}/assignments`,
  CLASS_IMPORT: (classId: string) => `${API_BASE_URL}/classes/${classId}/import`,
  STUDENT_LINK_CODES: (studentId: string) => `${API_BASE_URL}/students/${studentId}/link-codes`,

  PARENT_LINK: `${API_BASE_URL}/parent/link`,
  PARENT_CHILDREN: `${API_BASE_URL}/parent/children`,
  PARENT_CHILD_SUMMARY: (childId: string) => `${API_BASE_URL}/parent/children/${childId}/summary`,
  PARENT_CHILD_REVOKE: (childId: string) => `${API_BASE_URL}/parent/children/${childId}`,

  REPORT_PRINT: (id: string) => `${API_BASE_URL}/reports/${id}/print`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_AI_HEALTH: `${API_BASE_URL}/admin/ai/health`,
  ADMIN_EVAL_RUN: `${API_BASE_URL}/admin/eval/run`,
  ADMIN_EVAL_RESULTS: `${API_BASE_URL}/admin/eval/results`,
} as const;

export const CSRF_HEADER_NAME = 'X-CSRF-Token';
export const IDEMPOTENCY_HEADER_NAME = 'Idempotency-Key';
