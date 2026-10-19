# WhyWrong AI: Configuration & Hardcode Migration Notes

This document logs all relocated constants, secrets, business rules, copy, and UI tokens from across the WhyWrong codebase.

---

## 1. Secrets & Environment Settings

| Previous Hardcoded Location | Type | New Canonical Location | Mechanism |
| :--- | :--- | :--- | :--- |
| `backend/src/Database/Connection.php` | DB Host / User / Pass / Name | `backend/config/local.php` & `local.example.php` | `getenv()` with fallback to config array |
| `backend/src/Application.php` | App Environment & App Key | `backend/config/local.php` | `APP_ENV`, `APP_KEY` env variables |
| `backend/src/AI/GeminiProvider.php` | Gemini API Key | `backend/config/local.php` | `GEMINI_API_KEY` |
| `backend/src/AI/GroqProvider.php` | Groq API Key | `backend/config/local.php` | `GROQ_API_KEY` |
| Multiple backend seed files | Demo Passwords | `backend/config/local.php` | `DEMO_PASSWORD` |
| Frontend fetch calls | API Base URL | `frontend/.env` & `.env.example` | `import.meta.env.VITE_API_BASE_URL` |

---

## 2. Business Thresholds & Agent Limits

| Concept | Hardcoded Value | New Canonical Location | Constant Name |
| :--- | :--- | :--- | :--- |
| Evidence Score: Moderate | `1.5` | `backend/config/app.php` & `frontend/src/constants/states.ts` | `EVIDENCE_SCORE_MODERATE` |
| Evidence Score: Strong | `3.0` | `backend/config/app.php` & `frontend/src/constants/states.ts` | `EVIDENCE_SCORE_STRONG` |
| Evidence Score: Rejection | `-0.5` | `backend/config/app.php` & `frontend/src/constants/states.ts` | `EVIDENCE_SCORE_REJECTION` |
| Link Code Expiry | `7 days` | `backend/config/app.php` | `LINK_CODE_EXPIRY_DAYS` |
| Link Code Attempt Limit | `5` | `backend/config/app.php` | `LINK_CODE_MAX_ATTEMPTS` |
| Session Idle Timeout | `120 mins` | `backend/config/app.php` | `SESSION_IDLE_MINUTES` |
| Admin Session Timeout | `30 mins` | `backend/config/app.php` | `SESSION_ADMIN_IDLE_MINUTES` |
| Rate Limit: Authenticated | `60 req/min` | `backend/config/app.php` | `RATE_LIMIT_AUTHENTICATED_PER_MINUTE` |
| Rate Limit: Public Auth | `15 req/min` | `backend/config/app.php` | `RATE_LIMIT_PUBLIC_AUTH_PER_MINUTE` |
| Answer Retention Period | `12 months` | `backend/config/app.php` | `RETENTION_RAW_ANSWERS_MONTHS` |

---

## 3. AI Settings & Provider Routing

| Setting | Default | New Canonical Location | Comment |
| :--- | :--- | :--- | :--- |
| Default Provider Strategy | `hybrid` | `backend/config/local.php` | Priority: RulesEngine -> Gemini -> Groq -> Mock |
| Gemini Free Model | `gemini-1.5-flash` | `backend/config/local.php` | Free tier configuration |
| Groq Free Model | `llama-3.1-8b-instant` | `backend/config/local.php` | Free tier configuration |
| Provider Timeout | `15` seconds | `backend/config/local.php` | Strict shared-hosting timeout |
| Daily Per-User AI Quota | `40` calls | `backend/config/local.php` | Free tier conservation |
| Cache TTL | `168` hours (7 days) | `backend/config/local.php` | SHA-256 anonymized prompt cache |

---

## 4. Enums & Role Constants

| Concept | Items | Backend Location | Frontend Location |
| :--- | :--- | :--- | :--- |
| Roles | `visitor, student, teacher, parent, admin` | `backend/src/Domain/Enums/Role.php` | `frontend/src/constants/roles.ts` |
| Evidence Strengths | `low, moderate, strong` | `backend/src/Domain/Enums/EvidenceStrength.php` | `frontend/src/constants/states.ts` |
| Diagnosis States | `suspected, probing, confirmed, rejected, unclear, resolved` | `backend/src/Domain/Enums/DiagnosisState.php` | `frontend/src/constants/states.ts` |
| Agent Stages | `ingest, diagnose, probe, remediate, retest, report` | `backend/src/Application.php` | `frontend/src/constants/states.ts` |

---

## 5. UI Tokens & Styling

| Token | Hex / Value | New CSS Variable | New TS Constant |
| :--- | :--- | :--- | :--- |
| Landing Dark Background | `#0B1020` | `--color-bg-landing` | `COLOR_TOKENS.BG_LANDING` |
| Student Light Background | `#F7F9FC` | `--color-bg-student` | `COLOR_TOKENS.BG_STUDENT` |
| Student Sidebar Background | `#F3F5FD` | `--color-bg-student-sidebar` | `COLOR_TOKENS.BG_STUDENT_SIDEBAR` |
| Teacher Dark Background | `#0C1421` | `--color-bg-teacher` | `COLOR_TOKENS.BG_TEACHER` |
| Teacher Card Background | `#111E38` | `--color-bg-teacher-card` | `COLOR_TOKENS.BG_TEACHER_CARD` |
| Primary Violet | `#734DFD` | `--color-primary` | `COLOR_TOKENS.PRIMARY` |
| Cyan Accent | `#22D3EE` | `--color-accent-cyan` | `COLOR_TOKENS.ACCENT_CYAN` |
| Success Emerald | `#0BAA7B` | `--color-success` | `COLOR_TOKENS.SUCCESS` |
| Warning Orange | `#F48B2C` | `--color-warning` | `COLOR_TOKENS.WARNING` |
| Danger Red | `#E5484D` | `--color-danger` | `COLOR_TOKENS.DANGER` |

---

## 6. Content, Copy, and Demo Data

- **Content & Misconceptions**: Sourced cleanly from `backend/migrations/010_seed_content.sql` and `subject-packs/*.json`.
- **Demo Accounts**: Sourced from `backend/bin/seed_demo.php` and referenced via `frontend/src/constants/demo.ts`.
- **English Strings**: Centralized in `frontend/src/content/en.ts` for future i18n support.
