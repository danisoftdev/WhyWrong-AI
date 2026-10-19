# WhyWrong AI: System Architecture

## 1. Overview & Principles
WhyWrong AI is an educational diagnostic and remediation system built to uncover and resolve deep student misconceptions behind incorrect answers.
The architecture is designed for deployment on low-cost cPanel shared hosting (PHP 8.2+ REST + MySQL) without persistent Node.js background services, while serving a reactive modern SPA frontend (React 19 + TypeScript + Vite + Tailwind CSS).

## 2. Component Topology
```
               [ Browser / Mobile Client ]
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
Static Assets (React SPA)             REST API (/api/*)
(Vite build in public_html)           (PHP Front Controller)
                                               │
                                      ┌────────┴────────┐
                                      ▼                 ▼
                                MySQL Database   AI Provider Layer
                               (PDO Prepared)    (Engine, Gemini, Groq, Mock)
```

## 3. Layer Separation
1. **Frontend (`frontend/`)**:
   - Single-Page Application with client-side routing (`react-router-dom`).
   - Strict design token fidelity mapped to reference mockups (`docs/design/`).
   - Accessible KaTeX math rendering, React Flow knowledge graphs, and Recharts analytics.
   - Demo mode switcher allowing judges to toggle student, teacher, parent, admin personas instantly.

2. **Backend API (`backend/`)**:
   - Front controller (`backend/public/index.php`) with Apache mod_rewrite routing.
   - Middleware pipeline: CORS, Session, Rate Limiting, CSRF, and Role-Based Access Control.
   - Database abstraction using PDO prepared statements; zero raw SQL concatenation.
   - Data repositories isolating SQL queries from controllers.

3. **AI Provider Layer (`backend/src/AI/`)**:
   - Pluggable `AiProvider` interface with runtime routing controlled by `AI_PROVIDER`.
   - **WhyWrong Engine (`RulesEngineProvider`)**: Primary deterministic engine using verified misconception packs, distractor mapping, pattern detection, and probe banks. Zero latency, 100% free, immune to rate limits.
   - **Gemini Provider (`GeminiProvider`)**: Free tier Google Gemini Flash for open-ended student working, parent summaries, and unknown topic candidate generation. Wraps student text in untrusted delimiters.
   - **Groq Provider (`GroqProvider`)**: Free tier Groq Llama-3 fallback.
   - **Mock Provider (`MockProvider`)**: Offline deterministic fallback for guaranteed judging resilience.
   - Caching layer (`ai_cache`) and per-user daily quota limiter (`ai_usage`).

4. **Subject Packs (`subject-packs/`)**:
   - Curated misconception definitions across Mathematics, Physics, and Computing.
   - Each pack defines: topic, misconception id, explanation, detector rule, probe bank, counterexamples, and remediation pathways.
