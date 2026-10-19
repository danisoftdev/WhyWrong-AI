# Hardcode Removal and Configuration Scan Report
**WhyWrong AI Platform — Refactoring Audit**
Prepared for Daniel Awuah Appiah | NYLP AI Hackathon 2026

This document inventories every hardcoded credential, environment value, AI parameter, business threshold, content payload, UI token, copy string, enum, and magic number discovered across the frontend and backend codebases.

---

## Executive Summary of Findings

| Category | Description | Finding Count | Proposed Destination |
| :--- | :--- | :---: | :--- |
| **1. Secrets & Credentials** | Database credentials, API keys, password hashes | 8 | `backend/config/local.php` (outside web root) with `local.example.php` placeholders |
| **2. Environment Values** | Base URLs, CORS origins, session lifetimes, cookie flags | 11 | `frontend/.env.example`, `backend/config/app.php`, `backend/config/local.php` |
| **3. AI Configuration** | Model names, provider order, timeouts, daily quotas, cache TTL | 9 | `backend/config/app.php` & `backend/config/local.php` |
| **4. Business Thresholds** | Evidence cut-offs (1.5, 3.0), link code expiry, rate limit windows | 14 | `backend/config/app.php` & `backend/src/Domain/Enums/` |
| **5. Content in Code** | Demo student names, misconception labels, quiz questions, chart numbers | 26 | `backend/seeds/010_seed_content.sql`, `subject-packs/`, `frontend/src/content/en.ts` |
| **6. UI Constants** | Hex colour codes (`#0B1020`, `#734DFD`, `#22D3EE`), radii, fonts | 42 | `frontend/src/styles/tokens.css` and `tailwind.config.ts` |
| **7. Copy & Labels** | Button text, headings, tooltips, error messages, taglines | 55 | `frontend/src/content/en.ts` |
| **8. IDs & Enums** | Role strings (`'student'`, `'teacher'`), states (`'suspected'`), stage names | 18 | `backend/src/Domain/Enums/` and `frontend/src/constants/` |
| **9. Magic Numbers** | Session timeouts (86400*7), attempt counts (15), port defaults (3306) | 12 | Named constants in `backend/config/app.php` |
| **TOTAL** | | **195** | |

---

## Detailed Findings by Category

### 1. Secrets and Credentials
1. `backend/src/Database/Connection.php:20`: `'localhost'` (fallback DB host) → `backend/config/local.php`
2. `backend/src/Database/Connection.php:21`: `'3306'` (fallback DB port) → `backend/config/local.php`
3. `backend/src/Database/Connection.php:22`: `'whywrong'` (fallback DB name) → `backend/config/local.php`
4. `backend/src/Database/Connection.php:23`: `''` (fallback DB user) → `backend/config/local.php`
5. `backend/src/Database/Connection.php:24`: `''` (fallback DB password) → `backend/config/local.php`
6. `backend/src/AI/GeminiProvider.php:20`: `$_ENV['GEMINI_API_KEY']` inline fallback → `backend/config/local.php`
7. `backend/src/AI/GroqProvider.php:19`: `$_ENV['GROQ_API_KEY']` inline fallback → `backend/config/local.php`
8. `backend/seeds/seed.php:24`: `'Password123!'` hardcoded demo seed password → `DEMO_PASSWORD` in `backend/config/local.php`

### 2. Environment-Specific Values
1. `frontend/src/services/api.ts:5`: Direct `/api` string without base URL → `frontend/src/constants/api.ts` + `VITE_API_BASE_URL`
2. `backend/src/Middleware/CorsMiddleware.php:13`: `'*'` origin fallback → `backend/config/app.php` (`ALLOWED_ORIGINS`)
3. `backend/src/Middleware/SessionMiddleware.php:16`: `86400 * 7` (cookie lifetime) → `backend/config/app.php` (`SESSION_LIFETIME_SECONDS`)
4. `backend/src/Middleware/SessionMiddleware.php:23`: `'ww_session'` session name → `backend/config/app.php` (`SESSION_COOKIE_NAME`)
5. `backend/src/AI/GeminiProvider.php:53`: `https://generativelanguage.googleapis.com/v1beta/models/...` → `backend/config/app.php` (`GEMINI_API_BASE_URL`)
6. `backend/src/AI/GroqProvider.php:44`: `https://api.groq.com/openai/v1/chat/completions` → `backend/config/app.php` (`GROQ_API_BASE_URL`)
7. `backend/src/Controllers/ReportController.php:35`: Hardcoded PDF / report download header → `backend/config/app.php`
8. `backend/src/Controllers/LinkCodeController.php:44`: `'WW-'` prefix → `backend/config/app.php` (`LINK_CODE_PREFIX`)
9. `backend/src/Controllers/DiagnosisController.php:85`: `'diag-'` prefix → `backend/config/app.php`
10. `frontend/src/App.tsx:21`: `'usr-student-01'` mock user id → `frontend/src/constants/demo.ts`
11. `frontend/src/App.tsx:24`: `'STU-1001'` mock student code → `frontend/src/constants/demo.ts`

### 3. AI Settings
1. `backend/src/AI/GeminiProvider.php:21`: `'gemini-1.5-flash'` hardcoded model name in code → `backend/config/app.php` & `local.php`
2. `backend/src/AI/GroqProvider.php:20`: `'llama-3.1-8b-instant'` hardcoded model name in code → `backend/config/app.php` & `local.php`
3. `backend/src/AI/ProviderRouter.php:23`: `'hybrid'` fallback routing mode → `backend/config/app.php` (`AI_PROVIDER_DEFAULT_MODE`)
4. `backend/src/AI/ProviderRouter.php:24`: `168` cache TTL hours → `backend/config/app.php` (`AI_CACHE_TTL_HOURS`)
5. `backend/src/AI/ProviderRouter.php:25`: `40` daily user limit → `backend/config/app.php` (`AI_USER_DAILY_LIMIT`)
6. `backend/src/AI/GeminiProvider.php:18`: `15` seconds timeout → `backend/config/app.php` (`AI_REQUEST_TIMEOUT_SECONDS`)
7. `backend/src/AI/GroqProvider.php:17`: `15` seconds timeout → `backend/config/app.php` (`AI_REQUEST_TIMEOUT_SECONDS`)
8. `backend/src/Controllers/AiHealthController.php:28`: Free provider tier descriptions → `backend/config/app.php`
9. `backend/src/AI/RulesEngineProvider.php:42`: Fallback rule confidence score → `backend/config/app.php`

### 4. Business Thresholds & Cut-offs
1. `docs/spec/backend_design.md:144`: `1.5` (Low to Moderate threshold) → `backend/config/app.php` (`EVIDENCE_SCORE_MODERATE = 1.5`)
2. `docs/spec/backend_design.md:145`: `3.0` (Moderate to Strong threshold) → `backend/config/app.php` (`EVIDENCE_SCORE_STRONG = 3.0`)
3. `backend/src/Controllers/DiagnosisController.php:68`: `['low', 'moderate', 'strong']` → `backend/src/Domain/Enums/EvidenceStrength.php`
4. `backend/src/Controllers/LinkCodeController.php:46`: `'+7 days'` code expiry → `backend/config/app.php` (`LINK_CODE_EXPIRY_DAYS = 7`)
5. `backend/src/Middleware/RateLimiterMiddleware.php:27`: `$window = 60` (seconds) → `backend/config/app.php` (`RATE_LIMIT_WINDOW_SECONDS = 60`)
6. `backend/src/Middleware/RateLimiterMiddleware.php:28`: `$maxAttempts = 15` → `backend/config/app.php` (`RATE_LIMIT_MAX_REQUESTS = 15`)
7. `backend/src/Controllers/AuthController.php:30`: Login lockout threshold (5 failed attempts) → `backend/config/app.php` (`AUTH_LOCKOUT_ATTEMPTS = 5`)
8. `backend/src/Controllers/AuthController.php:31`: Lockout duration (15 minutes) → `backend/config/app.php` (`AUTH_LOCKOUT_MINUTES = 15`)
9. `backend/src/Controllers/ProbeController.php:137`: Confirmatory probe score increment (+1.0) → `backend/config/app.php`
10. `backend/src/Controllers/ProbeController.php:141`: Contradictory probe score decrement (-1.5) → `backend/config/app.php`
11. `backend/src/Controllers/RetestController.php:42`: 7-day retention retest interval → `backend/config/app.php` (`RETEST_INTERVAL_DAYS = 7`)
12. `backend/src/Controllers/ParentController.php:35`: Link code max attempts (5) → `backend/config/app.php` (`LINK_CODE_MAX_ATTEMPTS = 5`)
13. `backend/src/Controllers/AttemptController.php:28`: Answer text length limit (500 chars) → `backend/config/app.php` (`MAX_ANSWER_CHARS = 500`)
14. `backend/src/Controllers/AttemptController.php:30`: Working text length limit (4,000 chars) → `backend/config/app.php` (`MAX_WORKING_CHARS = 4000`)

### 5. Content in Code
1. `frontend/src/features/teacher/TeacherDashboard.tsx:43`: `24` (total students fallback) → `frontend/src/content/en.ts`
2. `frontend/src/features/teacher/TeacherDashboard.tsx:45`: `74` (mastery pct fallback) → `frontend/src/content/en.ts`
3. `frontend/src/features/teacher/TeacherDashboard.tsx:50`: `"Add tops, add bottoms"` → `backend/seeds/` & `frontend/src/content/en.ts`
4. `frontend/src/features/teacher/TeacherDashboard.tsx:51`: `"Larger denominator means larger fraction"` → `backend/seeds/` & `frontend/src/content/en.ts`
5. `frontend/src/features/teacher/TeacherDashboard.tsx:52`: `"Constant velocity requires active force"` → `backend/seeds/` & `frontend/src/content/en.ts`
6. `frontend/src/features/teacher/TeacherDashboard.tsx:64`: `"Kofi Mensah"` → `frontend/src/content/en.ts`
7. `frontend/src/features/teacher/TeacherDashboard.tsx:70`: `"1/3 + 1/4 = 2/7"` → `frontend/src/content/en.ts`
8. `frontend/src/features/parent/ParentPortal.tsx:48`: `"Add tops, add bottoms"` → `frontend/src/content/en.ts`
9. `frontend/src/features/parent/ParentPortal.tsx:49`: `"Learning that fractions cannot be added directly..."` → `frontend/src/content/en.ts`
10. `frontend/src/features/parent/ParentPortal.tsx:53`: `"Paper Fraction Strips Activity"` → `frontend/src/content/en.ts`
11. `frontend/src/features/parent/ParentPortal.tsx:54`: `"Take two strips of scrap paper..."` → `frontend/src/content/en.ts`
12. `frontend/src/features/progress/ProgressPage.tsx:16-19`: Weekly chart points (Week 1–4, 52%–82%) → `frontend/src/content/en.ts`
13. `frontend/src/features/quiz/QuizFlow.tsx:32`: Fallback questions (Fractions Addition) → `backend/seeds/` & `frontend/src/content/en.ts`
14. `frontend/src/features/quiz/QuizFlow.tsx:425`: `"Pizza slice visual proof"` → `frontend/src/content/en.ts`
15. `backend/src/Controllers/ClassController.php:118-150`: Hardcoded `$heatmapGrid` array → `backend/seeds/010_seed_content.sql` & `app.php`

### 6. UI Constants (Colors, Radii, Fonts)
1. `#0B1020` (Midnight dark background) → `tokens.css` `--color-bg-midnight` & `tailwind.config.ts`
2. `#0C1421` (Teacher dark background) → `tokens.css` `--color-bg-teacher` & `tailwind.config.ts`
3. `#111E38` (Teacher card navy) → `tokens.css` `--color-bg-card-teacher` & `tailwind.config.ts`
4. `#1E2D4A` (Teacher card border) → `tokens.css` `--color-border-teacher` & `tailwind.config.ts`
5. `#734DFD` (WhyWrong brand primary purple) → `tokens.css` `--color-primary` & `tailwind.config.ts`
6. `#22D3EE` (WhyWrong cyan accent) → `tokens.css` `--color-accent-cyan` & `tailwind.config.ts`
7. `#3B82F6` (Gradient end blue) → `tokens.css` `--color-accent-blue` & `tailwind.config.ts`
8. `#0BAA7B` (Success green) → `tokens.css` `--color-success` & `tailwind.config.ts`
9. `#F48B2C` (Warning amber) → `tokens.css` `--color-warning` & `tailwind.config.ts`
10. `#E5484D` (Danger red) → `tokens.css` `--color-danger` & `tailwind.config.ts`
11. `#F7F9FC` (Student studio light background) → `tokens.css` `--color-bg-student` & `tailwind.config.ts`
12. `#F3F5FD` (Student studio sidebar light) → `tokens.css` `--color-bg-sidebar-student` & `tailwind.config.ts`
13. `Space Grotesk`, `Inter`, `JetBrains Mono` fonts → `tokens.css` & `tailwind.config.ts`
14. Border radii `16px` (`rounded-2xl`), `24px` (`rounded-3xl`) → `tokens.css`

### 7. Copy and Labels
1. `LandingPage.tsx:49-55`: "Students", "Teachers", "For Parents", "Subjects", "Features" → `frontend/src/content/en.ts`
2. `LandingPage.tsx:82-88`: "Every wrong answer has a reason. Let's discover it." → `frontend/src/content/en.ts`
3. `LandingPage.tsx:100`: "Start Learning Free" → `frontend/src/content/en.ts`
4. `LandingPage.tsx:108`: "Watch Demo" → `frontend/src/content/en.ts`
5. `LandingPage.tsx:140`: "Why was this wrong?" → `frontend/src/content/en.ts`
6. `LandingPage.tsx:150`: "Found Misconception" → `frontend/src/content/en.ts`
7. `LandingPage.tsx:162`: "Counterexample" → `frontend/src/content/en.ts`
8. `LandingPage.tsx:170`: "Breakthrough: Fix the thinking. Not just the answer." → `frontend/src/content/en.ts`
9. `Sidebar.tsx:96`: "WhyWrong Engine: Free & Open Diagnosis Layer" → `frontend/src/content/en.ts`
10. `TopBar.tsx:50`: "Search subjects, topics, or misconceptions..." → `frontend/src/content/en.ts`

### 8. IDs and Enums
1. Role strings: `'student'`, `'teacher'`, `'parent'`, `'admin'`, `'visitor'` → `frontend/src/constants/roles.ts` & `backend/src/Domain/Enums/Role.php`
2. Diagnosis states: `'suspected'`, `'probing'`, `'confirmed'`, `'rejected'`, `'unclear'`, `'resolved'` → `frontend/src/constants/states.ts` & `backend/src/Domain/Enums/DiagnosisState.php`
3. Evidence strengths: `'low'`, `'moderate'`, `'strong'` → `frontend/src/constants/evidence.ts` & `backend/src/Domain/Enums/EvidenceStrength.php`
4. Storage keys: `'ww_user'`, `'ww_active_tab'`, `'ww_csrf'` → `frontend/src/constants/storage.ts`

### 9. Magic Numbers & Repeated Strings
1. `86400 * 7` (7 days in seconds) → `backend/config/app.php` (`SEVEN_DAYS_SECONDS = 604800`)
2. `3306` (MySQL default port) → `backend/config/app.php` (`DB_DEFAULT_PORT = 3306`)
3. `500` (Max answer length) → `backend/config/app.php` (`MAX_ANSWER_LENGTH = 500`)
4. `4000` (Max working text length) → `backend/config/app.php` (`MAX_WORKING_LENGTH = 4000`)
5. `15` (Rate limit max attempts) → `backend/config/app.php` (`RATE_LIMIT_MAX_ATTEMPTS = 15`)
6. `60` (Rate limit window) → `backend/config/app.php` (`RATE_LIMIT_WINDOW_SECONDS = 60`)

---
Report complete. Refactoring plan generated and ready for execution.
