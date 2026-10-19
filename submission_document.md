# WhyWrong AI — Final Submission & Judge's Guide
**NYLP AI Hackathon 2026 | AI Agents & Education Track**  
**Lead Developer:** Daniel Awuah Appiah  
**Deadline:** Monday 19 October 2026, 6:59 PM Ghana Time (11:59 PM PKT)  
**Product Tagline:** *"Fix the thinking, not just the answer."*

> [!IMPORTANT]
> **Key Submission Links & Demo Credentials**
> - **Live Demo / Local Target:** `http://127.0.0.1:5173/` (Frontend) & `http://127.0.0.1:8000/api/health` (Backend)
> - **One-Click Demo Switcher:** Accessible at the top-right of every view in the application header.
> - **Zero Paid Dependencies:** Runs with 100% fidelity on the local WhyWrong Rules Engine (0 external API costs).

---

## 1. Executive Summary

Standard EdTech tools merely evaluate whether an answer is correct or incorrect. When a student answers $\frac{1}{3} + \frac{1}{4} = \frac{2}{7}$, typical systems flag it as wrong and present the correct answer ($\frac{7}{12}$). The student's underlying flawed mental model—*adding numerators and adding denominators independently*—remains unaddressed, leading to repeated failure.

**WhyWrong AI** diagnoses the underlying misconception behind a wrong answer through a transparent 6-stage autonomous agent loop:
1. **Intelligent Ingest:** Gathers student answers, step-by-step working, and metacognitive confidence ratings.
2. **Misconception Diagnosis:** Matches diagnostic distractors or detector rules, extracting strict quoted evidence substrings.
3. **Targeted Probes:** Administers 2–3 separating probes from a validated bank to test competing hypotheses.
4. **Interactive Remediation:** Generates counterexamples, worked contrasts, and stepped practice worksheets.
5. **Scheduled Re-test:** Deploys spaced repetition checks to ensure mental models are restructured.
6. **Parent & Teacher Reporting:** Delivers live misconception heatmaps for educators and jargon-free weekly summaries for parents.

---

## 2. Testing Accounts & Credentials for Judges

WhyWrong AI is pre-loaded with demonstration data for a class of 24 students, including active diagnoses, probes, remediations, and parent linkages.

### A. Instant One-Click Role Switcher
In the application header, judges can toggle between **Student**, **Teacher**, **Parent**, and **Admin** instantly with a single click.

### B. Direct Login Accounts

| Role | Username / Identifier | Password / PIN | Description & Access |
| :--- | :--- | :--- | :--- |
| **Student** | `STU-1001` *(or kofi@student.edu)* | PIN: `1001` | Student Studio, fraction diagnostic test, probe answers, remediation worksheet. |
| **Teacher** | `teacher@school.edu` | `DemoPass2026!` | Teacher Command Center, Class 2A heatmap, review queue, 5-min interventions. |
| **Parent** | `parent@family.edu` | `DemoPass2026!` | Parent Window, linked to Kofi Mensah, plain-language digests. *(Link Code: `WW-8492`)* |
| **Admin** | `admin@school.edu` | `DemoPass2026!` | AI Ops, circuit breakers, evaluation parity benchmark suite. |

> [!NOTE]
> All demonstration rows are marked `is_demo = 1` in the database and surfaced with a "DEMO DATA" badge in the UI.

---

## 3. Visual System Walkthrough

### 3.1 Dark Cinematic Landing Page
*Includes the official WhyWrong AI logo, dark aesthetic (`#0B1020`), and 3D student mascot thinking through problems.*

![Landing Page Hero](C:\Users\user\.gemini\antigravity-ide\brain\a87da14b-0e37-4480-b2fb-2cbf68a671e5\landing_cartoon_student_hero_1792411004691.png)

---

### 3.2 Student Studio: The Diagnostic Loop
*Light, focused student workspace (`#F7F9FC`). Demonstrating the fraction diagnostic test $\frac{1}{3} + \frac{1}{4} = \frac{2}{7}$, generating a suspected diagnosis with quoted evidence and targeted probes.*

![Student Studio View](C:\Users\user\.gemini\antigravity-ide\brain\a87da14b-0e37-4480-b2fb-2cbf68a671e5\media_1792410629358.png)

---

### 3.3 Teacher Command Center & Misconception Heatmap
*Dark educator theme (`#0C1421`). Live class mastery matrix, pending diagnostic review queue, and 5-minute targeted intervention generator.*

![Teacher Command Center View](C:\Users\user\.gemini\antigravity-ide\brain\a87da14b-0e37-4480-b2fb-2cbf68a671e5\media_1792410640396.png)

---

### 3.4 Parent Window: Plain-Language Digest
*Accessible, jargon-free weekly report for parents showing concepts actively being mastered, home discussion tips, and spaced re-test dates.*

![Parent Portal View](C:\Users\user\.gemini\antigravity-ide\brain\a87da14b-0e37-4480-b2fb-2cbf68a671e5\media_1792410674186.png)

---

### 3.5 AI Operations Dashboard
*Real-time provider status, circuit breaker states, and daily quota monitoring across the hybrid fallback router.*

![Admin AI Ops View](C:\Users\user\.gemini\antigravity-ide\brain\a87da14b-0e37-4480-b2fb-2cbf68a671e5\media_1792410682710.png)

---

### 3.6 Evaluation & Model Parity Benchmark
*Live evaluation harness running 12 hand-labelled test cases across Mathematics, Physics, and Computing. Demonstrates 100% diagnostic accuracy and sub-millisecond latency on the WhyWrong Engine.*

![Evaluation Parity View](C:\Users\user\.gemini\antigravity-ide\brain\a87da14b-0e37-4480-b2fb-2cbf68a671e5\media_1792410688945.png)

---

## 4. Free Shared-Host Deployment Guide

WhyWrong AI is specifically engineered for zero-cost deployment on shared hosting platforms (e.g. **InfinityFree, 000webhost, cPanel, or FreeSQLDatabase**). It requires **PHP 8.2** and **MySQL/MariaDB** only—no VPS, no Docker daemon, and no Node background process.

### Step 1: Compile the Static Frontend
The frontend builds into a pure static SPA that shared hosting serves directly via Apache/Nginx:
```bash
cd frontend
npm run build
```
The compiled output is saved in `frontend/dist/` (contains `index.html`, `assets/`, and images).

### Step 2: Set Up the Free MySQL Database
1. Log in to your free hosting control panel (e.g., InfinityFree VistaPanel or cPanel).
2. Open **MySQL Databases** and create a new database (e.g., `epiz_12345_whywrong`).
3. Open **phpMyAdmin**, select your newly created database, and click **Import**.
4. Import the SQL files from `backend/migrations/` in order:
   - `001_foundation.sql`
   - `002_content.sql`
   - `003_learning_loop.sql`
   - `004_parents.sql`
   - `005_ai_ops_eval.sql`
   - `010_seed_content.sql`
   *(Or import `full_schema.sql` and `010_seed_content.sql` in one step).*

### Step 3: Configure Database Credentials
Create `backend/config/local.php` with your hosting credentials (this file is excluded from git):
```php
<?php
// backend/config/local.php
return [
    'app_env'   => 'production',
    'demo_mode' => true,
    'app_key'   => 'ww-production-security-key-32chars!!',
    'db' => [
        'host'    => 'sql123.infinityfree.com',
        'port'    => 3306,
        'name'    => 'epiz_12345_whywrong',
        'user'    => 'epiz_12345',
        'pass'    => 'YourHostDbPassword',
        'charset' => 'utf8mb4',
    ],
    'ai' => [
        'provider'         => 'hybrid', // RulesEngine -> Gemini -> Groq -> Mock
        'timeout'          => 15,
        'user_daily_limit' => 40,
        'gemini_key'       => '', // Optional free key
        'groq_key'         => '', // Optional free key
    ],
    'demo_password' => 'DemoPass2026!',
];
```

### Step 4: Upload Files via FTP / File Manager
Organize files in your hosting file manager:
```
/home/USER/
  ├── private_app/             <-- Upload entire backend/ folder here (outside web root)
  └── htdocs/ (or public_html/)
        ├── index.html         <-- From frontend/dist/index.html
        ├── assets/            <-- From frontend/dist/assets/
        ├── WWAI.png           <-- From frontend/dist/WWAI.png
        ├── .htaccess          <-- Shared hosting routing rules
        └── api/
              └── index.php    <-- Front controller pointing to private_app
```

**Contents of `public_html/api/index.php`:**
```php
<?php
declare(strict_types=1);
require_once __DIR__ . '/../../private_app/vendor/autoload.php';
require_once __DIR__ . '/../../private_app/src/Application.php';

$app = new \WhyWrong\Application();
$app->run();
```

**Contents of `public_html/.htaccess`:**
```apache
Options -Indexes
RewriteEngine On

# 1. Block access to hidden files and sensitive directories
RewriteRule (^|/)\.(?!well-known) - [F,L]
RewriteRule ^private_app - [F,L]
RewriteRule ^config - [F,L]

# 2. Direct API requests to the PHP front controller
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# 3. Direct all frontend routes to React SPA index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ index.html [L]

# 4. Security Headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "DENY"
</IfModule>
```

### Step 5: Post-Deploy Smoke Test
Run the automated verification script against your live domain:
```bash
./scripts/smoke.sh https://yourdomain.infinityfreeapp.com
```
Verification checks:
1. `GET /api/health` returns `HTTP 200` with `db: true`.
2. `GET /.env` returns `HTTP 403` or `404` (secrets cannot be read).
3. Student, Teacher, Parent, and Admin demo roles switch cleanly.
4. Answering $\frac{1}{3} + \frac{1}{4} = \frac{2}{7}$ immediately returns a suspected diagnosis with quoted evidence.

---

## 5. Submission Readiness Summary

| Requirement | Status | Verification Detail |
| :--- | :--- | :--- |
| **Backend & 49 Tables** | COMPLETE | Migrations 001 to 005 + 010 verified on MariaDB/MySQL. |
| **Hardcode Removal** | COMPLETE | `HARDCODE_REPORT.md` and `MIGRATION_NOTES.md` generated; `scripts/check-hardcodes.sh` passes with 0 errors. |
| **Zero Paid APIs** | VERIFIED | Strict rules engine + free tier adapters only. Zero Anthropic/Claude calls. |
| **Object Authorization** | ENFORCED | Strict RBAC in `Application.php` and `Middleware/AuthMiddleware.php`. |
| **Judge Demo Accounts** | PRE-CONFIGURED | 4 roles with instant switcher and seeded demo accounts. |
| **Free Hosting Guide** | COMPLETE | Full runbook for cPanel/InfinityFree with zero daemon requirements. |
