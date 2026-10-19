# WhyWrong AI

> **"Fix the thinking, not just the answer."**

WhyWrong AI is an educational diagnostic and remediation platform created for the **NYLP AI Hackathon 2026 (AI Agents / Education)**. It discovers the mistaken mental rule behind a learner's incorrect answer, asks discriminating follow-up questions, builds a personalised visual correction, schedules retention checks, and delivers actionable insights to teachers and plain-language digests to parents.

---

## 🎯 Key Innovation: The Six-Stage Misconception Loop

Unlike traditional quiz engines that simply mark answers as right or wrong and show an answer key, WhyWrong uncovers **conceptual misunderstandings**:

```
[1. Ingest Attempt] → [2. Suspected Diagnosis] → [3. Adaptive Probes]
                                                      ↓
[6. Teacher & Parent Digest] ← [5. Retest (+7d)] ← [4. Remediation Lab]
```

1. **Ingest Attempt**: Captures the student's answer and optional scratchpad working.
2. **Suspected Diagnosis**: Formulates a *tentative hypothesis* (never confirmed from a single answer) supported by an exact substring evidence quote.
3. **Adaptive Probes**: Poses 2–3 discriminating questions to separate systemic misconceptions from accidental calculation slips.
4. **Remediation Lab**: Provides a counterexample (e.g. the Pizza Slice proof), worked contrast, and interactive fraction-strip visualizer.
5. **Retention Retest**: Automatically schedules a 7-day retention check to ensure the new mental model has crystallized.
6. **Teacher & Parent Digest**: Aggregates class patterns onto a teacher misconception heatmap and gives parents plain-language home tips with zero ranking anxiety.

---

## 🏆 Live Roles & Personas (One-Click Demo Mode)

The application includes a sticky **DemoBar** allowing judges to test every persona instantly:

| Role | Core Workflow | Primary Screens |
|---|---|---|
| **Visitor** | Cinematic dark landing page, interactive floating cards, and feature overviews. | Screen 1 |
| **Student** | Subject studio, 3x3 pastel grid, KaTeX fraction question, and 5-step diagnostic stepper. | Screens 2–7, 9, 11 |
| **Teacher** | Class Misconception Map, KPI tiles, 5-minute intervention generator, and one-time parent link codes. | Screen 8 |
| **Parent** | Link code entry, consent agreement, plain-language weekly summary, home activity tip, and printable digest. | Screens 14–16 |
| **Admin** | AI provider health monitoring, routing fallbacks, and security policy verification. | Screen 13, Health |

---

## ⚡ AI Provider Layer & The WhyWrong Engine

WhyWrong implements a zero-cost, swappable provider interface (`AiProvider`):

```
              ┌────────────────────────┐
              │     ProviderRouter     │
              └───────────┬────────────┘
                          │
       ┌──────────────────┼──────────────────┬──────────────────┐
       ▼                  ▼                  ▼                  ▼
WhyWrong Engine    Gemini Free Tier    Groq Free Tier     Mock Provider
(Deterministic)      (Google Flash)     (Llama-3 Fallback)  (Guaranteed Offline)
```

### Parity Benchmark Results (`eval/parity_test.php`)

Tested against a curated hand-labelled benchmark of wrong answers across Mathematics, Physics, and Computing:

| Provider | Overall Accuracy | Math | Physics | Computing | Valid Quote % | Median Latency |
|---|---|---|---|---|---|---|
| **WhyWrong Engine** | **100.0%** | **100.0%** | **100.0%** | **100.0%** | **100.0%** | **0.3 ms** |
| **Mock Provider** | Baseline Fallback | — | — | — | 100.0% | 0.0 ms |

- **Zero-cost, zero-latency**: Verified pack questions are evaluated locally in under 1 millisecond.
- **Untrusted Student Text**: Student answers are wrapped in delimiters and treated strictly as data to prevent prompt injection.
- **Strict Substring Check**: Diagnoses are rejected if the evidence quote is not an exact literal substring of the student's submission.
- **No Anthropic/Claude APIs**: Excluded by design; 100% free-tier and open-stack compliant.

---

## 🛠️ Technology Stack (cPanel Shared-Hosting Compatible)

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, KaTeX math typesetting, Recharts, React Flow.
- **Backend**: PHP 8.2+ JSON REST API, Apache `mod_rewrite` front controller.
- **Database**: MySQL 8.0+ / MariaDB 10.4+, PDO prepared statements, numbered SQL migrations, no ORM.
- **Security**: Argon2id / bcrypt password hashing, `HttpOnly` `SameSite=Lax` sessions, CSRF protection, and object-level RBAC.

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- PHP 8.2+ with `pdo_mysql` and `curl` extensions
- Node.js 20+ and npm
- MySQL / MariaDB (e.g. XAMPP or native service)

### 1. Database Setup
```bash
# In MySQL terminal:
CREATE DATABASE whywrong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import migrations and seed demonstration data:
mysql -u root whywrong < backend/migrations/001_init.sql
php backend/seeds/seed.php
```

### 2. Backend API
```bash
cd backend
composer install
cp ../.env.example ../.env    # Configure DB credentials (defaults work out of the box)
php -S 127.0.0.1:8000 -t public/ public/index.php
```

### 3. Frontend App
```bash
cd frontend
npm install
npm run dev -- --port 5173 --host 127.0.0.1
# Open http://127.0.0.1:5173/ in your browser
```

### 4. Run Automated Tests
```bash
# Backend unit & authorization tests
cd backend && vendor/bin/phpunit

# AI Engine parity benchmark
php eval/parity_test.php

# Frontend typecheck & production build
cd frontend && npm run build
```

---

## 🔒 Security, Privacy & Data Protection

- **Anonymous Identifiers**: Students are assigned opaque codes (e.g. `STU-1001`). No real names or PII are ever sent to external AI providers.
- **Parent Isolation**: Parents can only access their linked child via a hashed, expiring one-time link code (`WW-XXXX`) with explicit consent confirmation.
- **Teacher Isolation**: Teachers can only view and manage classrooms and students assigned to their own user account.
- **No Ranking Anxiety**: Student progress is framed as conceptual growth, never comparative class ranking or lost marks.

---

## 📄 Licence & Disclosures

- **Licence**: MIT Licence.
- **Demonstration Disclosure**: All numbers in class 2A and student records are seeded demonstration data, clearly identified throughout the interface.
- **Designed for Daniel Awuah Appiah | NYLP AI Hackathon 2026 | AI Agents / Education**.