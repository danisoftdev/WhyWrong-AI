# WhyWrong AI: cPanel Shared Hosting Deployment Runbook

This guide covers deployment to a standard cPanel shared hosting environment running Apache, PHP 8.2+, and MySQL 8.0+/MariaDB.

---

## 1. Pre-Deployment Hosting Verification (Step 0)

Execute these checks via cPanel Terminal, SSH, or PHP Info:
- **PHP Version**: 8.2+ with extensions: `pdo_mysql`, `curl`, `mbstring`, `openssl`, `json`.
- **MySQL / MariaDB**: 8.0+ or MariaDB 10.4+ with `utf8mb4_unicode_ci`.
- **Outbound HTTPS**: Test curl connectivity:
  ```bash
  curl -sS -o /dev/null -w "%{http_code}" https://generativelanguage.googleapis.com/
  ```
  *(Returns 200 or 404, proving outbound HTTPS is unblocked).*

---

## 2. Directory Layout: Public vs Private Separation

To prevent sensitive files (e.g. `.env`, logs, migrations) from being web-accessible, use two directories:

```
/home/yourusername/
├── private_app/               <-- PRIVATE (Outside public_html)
│   ├── backend/
│   │   ├── src/
│   │   ├── config/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── vendor/
│   ├── subject-packs/
│   ├── .env                   <-- Sensitive credentials NEVER in web root
│
└── public_html/               <-- PUBLIC (Web root)
    ├── assets/                <-- Compiled React assets (frontend/dist/assets)
    ├── index.html             <-- React SPA entry point (frontend/dist/index.html)
    ├── api/                   <-- Symlink or rewrite to backend/public/index.php
    └── .htaccess              <-- Security & routing rules
```

---

## 3. Database Migration & Seeding

1. Open cPanel **MySQL Databases**.
2. Create database: `yourusername_whywrong`.
3. Create user: `yourusername_wwuser` with a strong password; grant ALL PRIVILEGES.
4. Import schema:
   ```bash
   mysql -u yourusername_wwuser -p yourusername_whywrong < private_app/backend/migrations/001_init.sql
   ```
5. Run the demonstration seed:
   ```bash
   cd private_app/backend && php seeds/seed.php
   ```

---

## 4. Environment Configuration (`.env`)

Create `/home/yourusername/private_app/.env`:
```ini
AI_PROVIDER=hybrid
GEMINI_API_KEY=your_free_gemini_key_here
GEMINI_MODEL=gemini-1.5-flash
GROQ_API_KEY=your_free_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant
AI_TIMEOUT_SECONDS=15
AI_USER_DAILY_LIMIT=40
AI_CACHE_TTL_HOURS=168

DB_HOST=localhost
DB_PORT=3306
DB_NAME=yourusername_whywrong
DB_USER=yourusername_wwuser
DB_PASS=your_db_password
APP_ENV=production
APP_URL=https://yourdomain.com
SESSION_NAME=ww_session
```

---

## 5. Web Server Configuration (`public_html/.htaccess`)

```apache
RewriteEngine On

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Block direct access to hidden & sensitive files
RewriteRule ^\.env - [F,L]
RewriteRule ^composer\.(json|lock) - [F,L]
RewriteRule ^(vendor|config|logs|migrations|seeds)/ - [F,L]

# 3. Route API calls to PHP front controller
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ ../private_app/backend/public/index.php [QSA,L]

# 4. Serve existing static assets directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 5. SPA Fallback: send all other paths to React index.html
RewriteRule ^ index.html [L]

# 6. Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';"
</IfModule>
```

---

## 6. Smoke Test Checklist

- [ ] Visit `https://yourdomain.com/` — Landing page loads with Space Grotesk fonts and glowing ring.
- [ ] Direct deep link refresh: `https://yourdomain.com/learn` loads without 404.
- [ ] API Health Check: `https://yourdomain.com/api/demo/session` returns valid user session and CSRF token.
- [ ] Direct URL attack: Requesting `https://yourdomain.com/.env` returns `403 Forbidden`.
- [ ] Complete diagnostic quiz: Submit `2/7`, receive suspected misconception, probe, and counterexample.
- [ ] Teacher heatmap: Review Class 2A data, approve diagnosis, generate link code.
- [ ] Parent digest: Enter link code, view plain-language summary, test print CSS.
