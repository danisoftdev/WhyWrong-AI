# WhyWrong AI: Core API Contract

All endpoints adhere to JSON REST conventions.
Base URL: `/api`
Authentication: Secure session cookie with CSRF token for mutations.
Role-based object authorisation enforced on every request.

## Authentication & Demo

### `POST /api/auth/login`
- **Allowed Roles**: Public
- **Request**: `{ "identifier": "kofi@student.edu", "password": "..." }` or `{ "student_code": "STU-1001", "pin": "1001" }`
- **Response**: `{ "status": "success", "user": { "id": "...", "role": "student", "display_name": "Kofi Mensah" }, "csrf_token": "..." }`
- **Security Rule**: 5 failed login attempts lock the account for 15 minutes, returning the exact same generic message (`"Invalid credentials or account temporarily locked."`) to prevent username enumeration.

### `POST /api/auth/register`
- **Allowed Roles**: Public
- **Request**:
  ```json
  {
    "role": "parent" | "teacher",
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "display_name": "Jane Doe"
  }
  ```
- **Response**: `{ "status": "success", "user": { ... }, "csrf_token": "...", "message": "Account successfully registered and signed in." }` (HTTP 201)

### `POST /api/auth/logout`
- **Allowed Roles**: student, teacher, parent, admin
- **Response**: `{ "status": "success" }`

### `GET /api/auth/me`
- **Allowed Roles**: Public (returns `user: null` and fresh `csrf_token` when unauthenticated, or authenticated user profile)
- **Response**: `{ "status": "success", "user": { ... } | null, "csrf_token": "..." }`

### `POST /api/demo/session`
- **Allowed Roles**: Public
- **Request**: `{ "role": "student" | "teacher" | "parent" | "admin" }`
- **Response**: Seeds session as specified role with pre-populated demo data.
- **Rule**: Seeded demonstration data is always marked `is_demo: true`.

---

## Subjects & Questions

### `GET /api/subjects`
- **Allowed Roles**: Public / student / teacher / admin
- **Response**: List of subjects with nested topics and active question count.
- **Rule**: Question payloads never contain `correct_answer`, `distractor_map`, or `is_correct` flags for students or visitors prior to attempt submission.

---

## Learning & Misconception Flow

### `POST /api/attempts`
- **Allowed Roles**: student
- **Authorisation**: Student can only submit for their own session (`student_id` set from auth).
- **Headers**: Supports `Idempotency-Key` to safely prevent duplicate submission on weak mobile networks.
- **Request**:
  ```json
  {
    "question_id": "q-frac-01",
    "selected_option_id": "opt-b",
    "working_text": "1/3 + 1/4 = 2/7",
    "confidence": "sure" | "unsure" | "guessing"
  }
  ```
- **Limits**: Answer text max 500 characters, working text max 4,000 characters.
- **Response**: `{ "status": "success", "attempt_id": "...", "is_correct": false, "requires_diagnosis": true }`

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
    "evidence_quote": "2/7",
    "evidence_strength": "moderate",
    "next_action": "probe",
    "provider": "rules_engine"
  }
  ```
- **Hard Rule**: Evidence quote MUST be a literal substring of the student's answer or working. State MUST start as `suspected`. No calibrated probability percentage is ever exposed to the student.

### `GET /api/diagnoses/{id}`
- **Allowed Roles**: student, teacher, parent
- **Authorisation**: Student A requesting Student B's diagnosis receives HTTP 404. Unlinked parents receive HTTP 404.
- **Rule**: If diagnosis state is `rejected` (slip), no technical misconception label or ID is shown; encouraging feedback is returned instead.

### `POST /api/diagnoses/{id}/probes`
- **Allowed Roles**: student
- **Authorisation**: Must belong to authenticated student.
- **Response**: Set of discriminating follow-up questions. Question payloads never contain `is_correct`, `predicted_wrong`, or `rationale` for the student.

### `POST /api/probes/{id}/responses`
- **Allowed Roles**: student
- **Request**: `{ "selected_option_id": "opt-c", "selected_text": "..." }`
- **Response**: Evaluates response. Two predicted probes confirm hypothesis to `strong`. Answering all probes correctly diagnoses error as a momentary slip, transitions state to `rejected`, and shows encouraging feedback with zero misconception label.

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
- **Authorisation**: Teacher must own the class; unowned returns HTTP 404.
- **Privacy Rule**: Groups with fewer than 3 students have percentages suppressed (`suppressed: true`).
- **Response**: Topic vs Skill mastery grid (`strong`, `okay`, `weak`), active misconception counts, KPI metrics, `last_updated_at` freshness timestamp.

### `POST /api/classes/{id}/roster`
- **Allowed Roles**: teacher
- **Authorisation**: Teacher must own the class.
- **Request**:
  ```json
  {
    "students": [
      { "display_name": "Kofi Mensah" },
      { "display_name": "Ama Serwaa" }
    ],
    "csv": "Name\nKofi Mensah\nAma Serwaa"
  }
  ```
- **Response**: `{ "status": "success", "students": [ { "id": "...", "display_name": "...", "student_code": "STU-1005", "pin": "8492" } ] }` (HTTP 201)

### `PATCH /api/diagnoses/{id}/review`
- **Allowed Roles**: teacher
- **Authorisation**: Diagnosis must belong to a student in teacher's class (returns HTTP 404 otherwise).
- **Request (Accept/Reject)**:
  ```json
  {
    "decision": "accepted" | "rejected",
    "comment": "Confirmed in class discussion."
  }
  ```
- **Request (Edit - F-12 Defined Payload)**:
  ```json
  {
    "decision": "edited",
    "misconception_id": "misc-frac-add-across",
    "comment": "Adjusted to specific fraction pack concept."
  }
  ```
- **Audit Rule**: Every decision writes rows to BOTH `teacher_reviews` and `audit_logs`.

### `POST /api/students/{id}/link-codes`
- **Allowed Roles**: teacher
- **Authorisation**: Student must belong to teacher's class (returns HTTP 404 otherwise).
- **Response**: `{ "code": "WW-8492", "expires_at": "..." }`
- **Rule**: Code is shown once, stored only as SHA-256 hash. Generating a new code revokes any prior pending codes for that student.

### `POST /api/students/{id}/reset-pin`
- **Allowed Roles**: teacher, admin
- **Authorisation**: Teacher must own student's class.
- **Response**: Generates a new 4-digit PIN for student without requiring email.

---

## Parent Portal

### `POST /api/parent/link`
- **Allowed Roles**: parent
- **Request**: `{ "code": "WW-8492", "consent": true }`
- **Response**: Links parent to student; code marked used; consent record logged. Reused/expired/invalid codes return single generic error.

### `POST /api/parent/children/{id}/revoke`
- **Allowed Roles**: parent
- **Authorisation**: Must be actively linked to student.
- **Response**: Sets link status to `revoked`, records consent withdrawal, and immediately halts weekly digests.

### `GET /api/parent/children`
- **Allowed Roles**: parent
- **Response**: List of linked children.

### `GET /api/parent/children/{id}/summary`
- **Allowed Roles**: parent
- **Authorisation**: Parent must be actively linked to child (unlinked returns HTTP 404).
- **Rule**: Digest is built ONLY from teacher-accepted diagnoses. Uses plain-language concept explanations. Never displays raw answers, technical misconception codes, or peer rankings.

---

## Administrator & System Governance

### `GET /api/admin/users`
- **Allowed Roles**: admin
- **Authorisation**: Admin acts strictly within their own school.
- **Security Rule**: The users list NEVER returns `password_hash` fields.

### `GET /api/admin/ai-health`
- **Allowed Roles**: admin
- **Response**: Health, availability, and daily quota consumption for AI providers in zero-cost offline-first mode.

### `GET /api/admin/audit-logs`
- **Allowed Roles**: admin
- **Response**: Audit log trail for school compliance.

### `GET /api/admin/evaluations`
- **Allowed Roles**: admin
- **Response**: Parity evaluation benchmarks. Returns `"No results yet"` if empty; never invents benchmark figures.

### `POST /api/admin/deletion-requests`
- **Allowed Roles**: admin
- **Request**: `{ "student_id": "...", "reason": "Parent request for data erasure" }`
- **Response**: Logs pending deletion request.

### `POST /api/admin/deletion-requests/{id}/execute`
- **Allowed Roles**: admin
- **Hard Rule (F-09)**: Demo administrators (`is_demo = true`) are strictly forbidden from deleting production records (HTTP 403).
- **Action**: Cascades deletion from student record across all attempts, diagnoses, parent links, and class memberships. The audit log retains only the action and an opaque sha256 hash.

