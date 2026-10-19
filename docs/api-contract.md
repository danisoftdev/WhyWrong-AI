# WhyWrong AI: Core API Contract

All endpoints adhere to JSON REST conventions.
Base URL: `/api`
Authentication: Secure session cookie with CSRF token for mutations.
Role-based object authorisation enforced on every request.

## Authentication & Demo

### `POST /api/auth/login`
- **Allowed Roles**: Public
- **Request**: `{ "email": "teacher@school.edu", "password": "password" }`
- **Response**: `{ "status": "success", "user": { "id": "...", "role": "teacher", "display_name": "Ms. Mensah" } }`

### `POST /api/auth/logout`
- **Allowed Roles**: student, teacher, parent, admin
- **Response**: `{ "status": "success" }`

### `GET /api/auth/me`
- **Allowed Roles**: student, teacher, parent, admin
- **Response**: `{ "status": "success", "user": { ... }, "csrf_token": "..." }`

### `POST /api/demo/session`
- **Allowed Roles**: Public
- **Request**: `{ "role": "student" | "teacher" | "parent" | "admin" }`
- **Response**: Seeds session as specified role with pre-populated demo data.
- **Rule**: Seeded demonstration data is always marked `is_demo: true`.

---

## Subjects & Questions

### `GET /api/subjects`
- **Allowed Roles**: student, teacher, admin
- **Response**: List of subjects with nested topics and active question count.

### `GET /api/questions/{id}`
- **Allowed Roles**: student, teacher, admin
- **Response**: Question details with prompt, options, difficulty. Note: `distractor_map` and `correct_answer` are omitted for students prior to attempt submission.

---

## Learning & Misconception Flow

### `POST /api/attempts`
- **Allowed Roles**: student
- **Authorisation**: Student can only submit for their own session (`student_id` set from auth).
- **Request**:
  ```json
  {
    "question_id": "q-frac-01",
    "selected_option_id": "opt-b",
    "working_text": "1/3 + 1/4 = (1+1)/(3+4) = 2/7"
  }
  ```
- **Response**: `{ "status": "success", "attempt_id": "...", "is_correct": false }`

### `POST /api/diagnoses`
- **Allowed Roles**: student
- **Request**: `{ "attempt_id": "..." }`
- **Response**:
  ```json
  {
    "id": "diag-123",
    "state": "suspected",
    "misconception": {
      "id": "misc-frac-add-across",
      "label": "Add tops, add bottoms",
      "explanation": "Adding numerators together and denominators together directly."
    },
    "evidence_quote": "1/3 + 1/4 = 2/7",
    "evidence_strength": "moderate",
    "next_action": "probe",
    "provider": "rules_engine"
  }
  ```
- **Rule**: Evidence quote MUST be a literal substring of the student's answer or working. State MUST start as `suspected`.

### `POST /api/diagnoses/{id}/probes`
- **Allowed Roles**: student
- **Authorisation**: Must belong to authenticated student.
- **Response**: Set of 2 discriminating follow-up questions selected from pack.

### `POST /api/probes/{id}/responses`
- **Allowed Roles**: student
- **Request**: `{ "selected_option_id": "opt-c", "rationale": "..." }`
- **Response**: Evaluates if response confirms or contradicts misconception hypothesis and updates evidence strength.

### `POST /api/diagnoses/{id}/remediation`
- **Allowed Roles**: student
- **Response**: Personalised learning path containing counterexample, worked contrast, interactive simulation steps, and practice questions.

### `POST /api/diagnoses/{id}/retests`
- **Allowed Roles**: student, teacher
- **Response**: Schedules retest date (e.g. +7 days).

### `GET /api/diagnoses/{id}/events`
- **Allowed Roles**: student, teacher
- **Response**: Sanitised chronological agent timeline (`ingest`, `diagnose`, `probe`, `remediate`, `retest`).

---

## Teacher Command Center

### `GET /api/classes`
- **Allowed Roles**: teacher
- **Authorisation**: Teacher sees only their own classes (`teacher_id = auth.user.id`).

### `GET /api/classes/{id}/heatmap`
- **Allowed Roles**: teacher
- **Authorisation**: Teacher must own the class.
- **Response**: Topic vs Skill mastery grid (`strong`, `okay`, `weak`), active misconception counts, KPI metrics.

### `PATCH /api/diagnoses/{id}/review`
- **Allowed Roles**: teacher
- **Request**: `{ "decision": "accepted" | "edited" | "rejected", "comment": "..." }`
- **Rule**: Only teacher-accepted diagnoses can appear in parent summaries.

### `POST /api/students/{id}/link-codes`
- **Allowed Roles**: teacher
- **Authorisation**: Student must belong to teacher's class.
- **Response**: `{ "code": "WW-8492", "expires_at": "..." }` (hashed before storage).

---

## Parent Portal

### `POST /api/parent/link`
- **Allowed Roles**: parent
- **Request**: `{ "code": "WW-8492", "consent": true }`
- **Response**: Links parent to student; code marked used.

### `GET /api/parent/children`
- **Allowed Roles**: parent
- **Response**: List of linked children (anonymised student code, display name if consented).

### `GET /api/parent/children/{id}/summary`
- **Allowed Roles**: parent
- **Authorisation**: Verified against `parent_students` table.
- **Response**: Plain-language weekly summary, fixed ideas count, next re-test date, home activity tip. Never includes class ranking or other students.

---

## Admin & System Health

### `GET /api/ai/health`
- **Allowed Roles**: admin
- **Response**: Availability status of Rules Engine, Gemini, Groq, Mock.
