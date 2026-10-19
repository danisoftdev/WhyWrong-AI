# Deployment Check Workflow (/deploy-check)

Follow this checklist when deploying to cPanel shared hosting or staging environment.

## 1. Hosting Pre-Flight
- PHP version >= 8.2 with `pdo_mysql`, `curl`, `mbstring`, `openssl`, `json` enabled.
- MySQL 8.0+ / MariaDB 10.4+ with `utf8mb4_unicode_ci`.
- Outbound HTTPS enabled (test cURL to `https://generativelanguage.googleapis.com/`).
- SSL certificate active with automatic HTTP to HTTPS redirect.

## 2. Directory Separation
- `public_html/`:
  - Static Vite build output (`frontend/dist/*`).
  - API front controller (`backend/public/index.php` and `.htaccess`).
- `private_app/` (above web root):
  - `backend/src/`
  - `backend/config/`
  - `backend/migrations/`
  - `backend/vendor/`
  - `.env` (Never inside public_html!)

## 3. Web Server Access Protection
- Confirm `.htaccess` blocks public access to `.env`, `.git`, `logs/`, `config/`.
- Verify Apache fallback to `index.html` for single-page app routes and `/api/*` to `index.php`.

## 4. Database Setup & Migrations
- Create database `whywrong`.
- Run migrations: `backend/migrations/001_init.sql`.
- Run seed data: `php backend/seeds/seed.php`.

## 5. Security & Isolation Checks
- Verify Student A cannot fetch Student B's diagnoses or attempts.
- Verify Teacher A cannot access Teacher B's classes.
- Verify Parent can only access linked child via valid link code.
- Ensure API keys and passwords never leak in error responses or logs.
