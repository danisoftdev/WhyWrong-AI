# WhyWrong AI: Backend and Database Design
**Companion to Implementation Guide v2**
Prepared for Daniel Awuah Appiah | NYLP AI Hackathon 2026 | AI Agents / Education
Deadline: Monday 19 October 2026, 6:59 PM Ghana time (11:59 PM PKT)

---

## 1. Design Principles

| Principle | What it means in the code |
| :--- | :--- |
| **Deadline first** | Every phase ends with a deployable system. Cut features, never the diagnose, probe, remediate loop. |
| **Shared-hosting safe** | PHP 8.2 and MySQL/MariaDB only. No daemon, no queue server, no Redis. Background work runs from cPanel cron. |
| **Server is the authority** | The browser is untrusted. Every route validates input and authorises the specific object. |
| **Evidence, not guesses** | A diagnosis stores an exact quote from the answer. One wrong answer is only suspected. |
| **Free by default** | The rules engine works with no external API. Free LLMs are optional helpers behind one interface. |
| **Children’s data is special** | Student codes by default, parents see own child only, AI receives anonymous text only, deletion is supported. |
| **Honest demo** | Seeded data and mock AI output are labelled in the UI and in the README. |

---

## 2. Architecture

```
HTTP request
  -> public_html/api/index.php            (front controller)
  -> Middleware pipeline
       SecurityHeaders -> RequestId -> Session -> Csrf -> RateLimit
       -> Auth -> Role -> Validate
  -> Router -> Controller                 (thin: parse, call service, shape response)
  -> Service                              (business rules, transactions)
       DiagnosisService  ProbeService  RemediationService  ReviewService
       ClassMapService  ParentService  RetestService  ReportService
  -> Repository                           (PDO prepared statements only)
  -> MySQL
 
Service -> AgentOrchestrator -> ProviderRouter -> RulesEngine | Gemini | Groq | Mock
Cron   -> bin/cron.php {retests|class-stats|cache-purge|session-gc|digests}
```

### Directory Structure
```
private_app/                       (outside web root where the host allows)
  config/{config.php, local.php, local.example.php, app.php}
  src/
    Core/        Router, Request, Response, Container, ErrorHandler, Logger, Env
    Http/        Middleware/*, Controllers/*, Validators/*
    Domain/      Services/*, Policies/*, Agent/{Orchestrator, StateMachine, EvidenceRules}, Enums/*
    Data/        Db.php (PDO), Repositories/*
    AI/          AiProvider, ProviderRouter, RulesEngineProvider, GeminiProvider, GroqProvider, MockProvider
  bin/           migrate.php  seed_demo.php  cron.php  eval.php
  database/      001_foundation.sql ... 005_ai_ops_eval.sql  010_seed_content.sql
  storage/       logs/  cache/   (not web readable)
  tests/
public_html/
  index.html + assets/             (React build)
  api/index.php                    (loads private_app, nothing else)
  .htaccess
```

---

## 3. Delivery Phases

| Phase | Goal and target | Database | Deliverables | Done when |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | Skeleton and hosting smoke test. | Create empty DB. Import 001. | Front controller, router, config loader, error handler, `/api/health`, DB connection, `.htaccess`, first deploy. | `/api/health` returns ok with `db: true` from live host. |
| **P1** | Identity and security. | `001_foundation` (users, sessions, login_attempts, rate_limits, audit_logs, app_settings). | Login, logout, sessions, CSRF, RBAC middleware, rate limiter, audit log, guest demo session, demo seed script. | All 4 roles can sign in; Student A cannot read Student B; demo role switch works. |
| **P2** | Content and the learning loop. | `002_content`, `003_learning_loop`, `010_seed`. | Subjects, topics, questions, attempts, rules-engine diagnosis, probes, hypothesis update, remediation, agent events. | Entering 2/7 for 1/3 + 1/4 gives suspected diagnosis with quoted evidence, two probes lift it to strong. |
| **P3** | Teacher and Parent. | `004_parents`, `class_misconception_stats`. | Class map, review queue, interventions, link codes, parent summary, weekly digest. | Teacher accepts a diagnosis; linked parent sees plain-language summary of that child only. |
| **P4** | Deploy v1 and harden. | All migrations on live DB. | HTTPS check, security headers, cron jobs, backups, smoke script, README. | Live demo passes smoke script from live URL on a phone. |
| **P5** | Free AI providers & evaluation. | `005_ai_ops_eval`. | Gemini and Groq adapters, cache, quotas, eval harness, parity numbers, PDF export, retest cron. | Parity table shows real measured numbers. |

---

## 4. Database Design

### 4.1 Design Decisions
- **Engine and charset**: InnoDB, `utf8mb4`, `utf8mb4_unicode_ci` (maths symbols, African languages, emoji safe).
- **Two IDs**: Every public record has an internal BIGINT `id` and a 32-character opaque `public_id`. URLs and JSON use only `public_id`, preventing IDOR.
- **No ORM**: PDO with prepared statements and numbered SQL files. Works on any cPanel host.
- **Foreign keys**: Cascade for owned child data, `SET NULL` for optional links, `RESTRICT` where deleting would orphan a class.
- **JSON columns**: Only for flexible payloads (lessons, options, detector rules, digests). Anything filtered/joined on is a real column.
- **Privacy**: No names in `agent_events` or `ai_usage`; `student_code` is the identifier in reports; `deletion_requests` and `ON DELETE CASCADE` support complete removal.

### 4.2 Tables by Phase (49 in total)
1. `001_foundation` (8): `schema_migrations`, `schools`, `users`, `sessions`, `login_attempts`, `rate_limits`, `audit_logs`, `app_settings`
2. `002_content` (14): `subjects`, `topics`, `concept_edges`, `pack_versions`, `misconceptions`, `misconception_relations`, `probe_bank`, `remediation_templates`, `questions`, `question_options`, `classes`, `class_members`, `assignments`, `assignment_questions`
3. `003_learning_loop` (14): `attempts`, `diagnoses`, `diagnosis_hypotheses`, `probes`, `probe_responses`, `student_misconceptions`, `remediations`, `practice_responses`, `retests`, `agent_events`, `teacher_reviews`, `interventions`, `class_misconception_stats`, `student_topic_mastery`
4. `004_parents` (6): `link_codes`, `parent_students`, `consents`, `parent_digests`, `notifications`, `deletion_requests`
5. `005_ai_ops_eval` (7): `ai_cache`, `ai_usage`, `ai_provider_state`, `eval_sets`, `eval_items`, `eval_runs`, `eval_results`
6. `010_seed_content`: Demonstration & starter content.

---

## 5. API Design & Conventions

- **Base path**: `/api` (same origin as React frontend).
- **Success envelope**:
  ```json
  { "ok": true, "data": { ... }, "meta": { "request_id": "..." } }
  ```
- **Error envelope**:
  ```json
  { "ok": false, "error": { "code": "FORBIDDEN", "message": "Generic text", "fields": { "answer": "required" } }, "meta": { "request_id": "..." } }
  ```
- **Status codes**: 200, 201, 204, 400 (validation), 401 (unauthenticated), 403 (unauthorised), 404 (not found / object hidden), 409 (conflict), 422 (semantic), 429 (rate limited), 500 (generic error).
- **Security**: HttpOnly, Secure, SameSite=Lax session cookie. Mutations require `X-CSRF-Token` header.
- **Idempotency**: `POST /api/attempts` and `POST /api/probes/{id}/responses` accept `Idempotency-Key` header.
- **Validation**: Allow-list fields, check types/lengths. Answer max 500 chars, working text max 4,000 chars.

---

## 6. Domain Logic: The Misconception Agent

### 6.1 State Machine
`suspected` → `probing` → `confirmed` (evidence ≥ 3.0) or `rejected` (verdict = slip) or `unclear` → `resolved` (7-day retest passed).

### 6.2 Evidence Rules (Deterministic Heuristics)
| Event | Score Change | Notes |
| :--- | :--- | :--- |
| Diagnostic distractor matched | +1.0 | Strongest single signal |
| Pattern detector matched | +0.8 | For typed answers |
| Free AI provider matched | +0.5 | If quoted substring in student answer |
| Self-confidence "sure" on error | +0.5 | Indicates mistaken rule, not slip |
| Self-confidence "guessing" on error | -0.3 | Likely random slip |
| Probe answered as predicted | +1.0 | Both needed to confirm |
| Probe answered correctly | -1.5 | Disconfirms misconception |
| Probe answered wrong but unpredicted | -0.3 | Separate idea or noise |

Evidence strength:
- `< 1.5`: `low`
- `1.5 - 2.9`: `moderate`
- `≥ 3.0`: `strong`

---

## 7. AI Provider Contract

```php
namespace WhyWrong\AI;

interface AiProvider {
    public function name(): string;
    public function isAvailable(): bool;
    public function generateJson(string $task, array $input, array $schema): array;
}
```
**Router Order**: RulesEngine (WhyWrong Engine) → Gemini Free → Groq Free → MockProvider.
- Never use Anthropic or Claude APIs.
- Timeouts: 15 seconds per call, 1 retry on 5xx.
- Anonymisation: send only student code and answer text.
