# Security Rules — WhyWrong AI

## Secrets
- Never read, log, print or commit secrets (.env, API keys, DB passwords, SMTP credentials).
- Use .env.example with placeholder values only. Real keys stay on the server, loaded at runtime.
- Verify .env, config/ and logs/ are unreachable over HTTP after every deployment.

## Authentication & Sessions
- Use password_hash (Argon2id preferred) for all stored passwords.
- Regenerate session ID on login/logout. Destroy session on logout.
- Cookies: HttpOnly, Secure, SameSite=Strict.
- Include a CSRF token on every state-changing request. Reject requests without valid token.

## Object-Level Authorisation (enforce on EVERY request)
- **Student**: can only read/write their own attempts, diagnoses, probes, remediations and retests.
- **Teacher**: can only read their own classes and the students in those classes.
- **Parent**: can only read children listed in parent_students where status='active' and consent_at IS NOT NULL.
- **Admin**: all resources. Log every admin action in audit_logs.
- Test each boundary: Student A cannot access Student B. Teacher X cannot access Teacher Y's class.

## SQL / Injection
- Use PDO prepared statements for ALL database queries. No string interpolation in SQL.
- Whitelist column names and sort directions for dynamic queries.
- Validate and cast all input types server-side.

## XSS & Output
- Escape all output: htmlspecialchars with ENT_QUOTES|ENT_HTML5 when echoing user data.
- Content-Security-Policy header with nonce or hash for inline scripts.
- X-Content-Type-Options: nosniff, Referrer-Policy, X-Frame-Options: DENY.

## Rate Limiting
- Rate-limit login (5 attempts / 15 min per IP), link-code attempts (3 per code), AI endpoints (AI_USER_DAILY_LIMIT per user).
- Return 429 with a Retry-After header.

## File Uploads
- Validate real MIME type (finfo), not extension or Content-Type header.
- Maximum 5 MB. Store outside web root. Never execute uploaded files.
- Reject if MIME not in whitelist [image/jpeg, image/png, image/webp].

## AI / Prompt Injection
- Wrap student-submitted text in explicit delimiters: <<<STUDENT_ANSWER>>> ... <<<END_ANSWER>>>.
- Tell the model in the system prompt that content inside those delimiters is untrusted user data.
- Never let model output trigger server-side actions directly. Parse validated JSON fields only.
- Validate evidence_quote is a literal substring of the submitted answer — reject otherwise.

## Link Codes (Parent)
- Store as bcrypt hash. Never store or log the plaintext code.
- Expire after 7 days. One use only (set used_at on first valid redemption).
- Allow max 3 failed attempts per code before locking.
- Teachers can revoke codes. Revocation immediately blocks parent access.

## Logging
- Structured JSON logs. Redact: API keys, student names, raw answers, parent email.
- Log only: student_code, timestamp, action, result, error_code.
- Never log the full AI prompt or response.

## Children's Data (GDPR / Ghana DPA aligned)
- Student codes by default — no real names in logs or AI calls.
- Consent recorded in parent_students.consent_at before any parent view.
- Retain data per school's retention policy. Admin can delete all data for a student.
- No public rankings, no cross-student comparisons.
