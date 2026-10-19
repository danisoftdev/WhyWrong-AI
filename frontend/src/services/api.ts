import type { User, Subject, Diagnosis, Probe, Remediation, AgentEvent, Role } from '../types';

let csrfToken = '';

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json();
  if (data.csrf_token) {
    csrfToken = data.csrf_token;
  }

  if (!res.ok) {
    throw new Error(data.message || `API error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth & Demo
  async getMe(): Promise<{ user: User | null; csrf_token: string }> {
    try {
      const data = await fetchApi('/api/auth/me');
      return data;
    } catch {
      return { user: null, csrf_token: '' };
    }
  },

  async login(email: string, password: string): Promise<{ user: User }> {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    return fetchApi('/api/auth/logout', { method: 'POST' });
  },

  async setDemoSession(role: Role): Promise<{ user: User }> {
    return fetchApi('/api/demo/session', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Subjects & Questions
  async getSubjects(): Promise<{ subjects: Subject[] }> {
    return fetchApi('/api/subjects');
  },

  // Learning Loop
  async submitAttempt(questionId: string, selectedOptionId: string, workingText: string): Promise<{
    attempt_id: string;
    is_correct: boolean;
    requires_diagnosis: boolean;
  }> {
    return fetchApi('/api/attempts', {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option_id: selectedOptionId,
        working_text: workingText,
      }),
    });
  },

  async getDiagnosis(attemptId: string): Promise<Diagnosis> {
    return fetchApi('/api/diagnoses', {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId }),
    });
  },

  async getProbes(diagnosisId: string): Promise<{ probes: Probe[] }> {
    return fetchApi(`/api/diagnoses/${diagnosisId}/probes`, { method: 'POST' });
  },

  async submitProbeResponse(probeId: string, selectedOptionId: string, selectedText: string): Promise<{
    result: 'confirms' | 'contradicts' | 'inconclusive';
    evidence_strength: string;
    diagnosis_state: string;
    message: string;
  }> {
    return fetchApi(`/api/probes/${probeId}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        selected_option_id: selectedOptionId,
        selected_text: selectedText,
      }),
    });
  },

  async getRemediation(diagnosisId: string): Promise<{ remediation: Remediation }> {
    return fetchApi(`/api/diagnoses/${diagnosisId}/remediation`, { method: 'POST' });
  },

  async scheduleRetest(diagnosisId: string, isSimulated = false): Promise<{ due_at: string; is_simulated: boolean }> {
    return fetchApi(`/api/diagnoses/${diagnosisId}/retests`, {
      method: 'POST',
      body: JSON.stringify({ is_simulated: isSimulated }),
    });
  },

  async getAgentEvents(diagnosisId: string): Promise<{ events: AgentEvent[] }> {
    return fetchApi(`/api/diagnoses/${diagnosisId}/events`);
  },

  // Teacher
  async getTeacherHeatmap(classId = 'cls-math-form2'): Promise<any> {
    return fetchApi(`/api/classes/${classId}/heatmap`);
  },

  async reviewDiagnosis(diagnosisId: string, decision: 'accepted' | 'edited' | 'rejected', comment?: string): Promise<any> {
    return fetchApi(`/api/diagnoses/${diagnosisId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, comment }),
    });
  },

  async generateLinkCode(studentId: string): Promise<{ code: string; expires_at: string }> {
    return fetchApi(`/api/students/${studentId}/link-codes`, { method: 'POST' });
  },

  // Parent
  async linkChild(code: string, consent: boolean): Promise<any> {
    return fetchApi('/api/parent/link', {
      method: 'POST',
      body: JSON.stringify({ code, consent }),
    });
  },

  async getParentChildren(): Promise<any> {
    return fetchApi('/api/parent/children');
  },

  async getParentSummary(studentId: string): Promise<any> {
    return fetchApi(`/api/parent/children/${studentId}/summary`);
  },

  // Report
  async getStudentReport(studentId: string): Promise<any> {
    return fetchApi(`/api/reports/${studentId}/pdf`);
  },

  // AI Health
  async getAiHealth(): Promise<any> {
    return fetchApi('/api/ai/health');
  },
};
