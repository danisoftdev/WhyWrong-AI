# PHP API Rules — WhyWrong AI

## Entry Point
- backend/public/index.php is the ONLY web-accessible PHP file.
- All other PHP is in backend/src/ (outside web root when possible).
- Apache .htaccess routes /api/* to index.php. All non-API routes serve frontend/dist/index.html.

## JSON Response Format
Every response is application/json.

Success:
```json
{ "status": "ok", "data": { ... } }
```

Error:
```json
{ "status": "error", "code": "VALIDATION_ERROR", "message": "Human-readable message." }
```

- NEVER expose stack traces, SQL errors, or internal paths in responses.
- Use generic user-facing messages. Log detailed errors server-side only.

## Routing Pattern
```
POST /api/auth/login       -> AuthController::login()
GET  /api/subjects         -> SubjectController::list()
```
Register routes in a central router. No magic globals, no auto-routing by filename.

## Validators
- Every controller method calls a validator before touching the database.
- Validators return a typed result (valid + sanitised data, or error list).
- Required fields, type checks, length limits, and whitelisted enum values.

## Repositories
- All database access goes through Repository classes.
- Repositories return typed objects or arrays, never raw PDO results.
- No SQL outside Repository classes.
- Use PDO::FETCH_ASSOC. Never use FETCH_OBJ with user-supplied column names.

## Migrations
- Numbered SQL files: backend/migrations/001_init.sql, 002_parent_tables.sql, etc.
- Each file is idempotent where possible (CREATE TABLE IF NOT EXISTS).
- Include a rollback comment at the top.
- Run in order. Never rename a migration file after it has run on production.

## Seeds
- backend/seeds/demo_seed.sql for all demonstration data.
- Every seeded record has a comment: -- DEMO DATA.
- Seeds must be safe to run on a fresh database after migrations.

## Tests
- backend/tests/ using PHPUnit or plain PHP assert scripts.
- Every controller gets at least: happy path, validation error, authorisation error.
- Object-level auth tests are MANDATORY: student A vs student B, teacher cross-class.

## Middleware Order
1. HTTPS check (redirect if not)
2. CORS headers (origin whitelist)
3. Session start and CSRF validation (for POST/PATCH/DELETE)
4. Rate limiter
5. Auth (populate $request->user from session)
6. Route dispatch
7. Role check
8. Controller

## PHP Standards
- PHP 8.2+ features allowed (match, named args, readonly, fibers not needed).
- Strict types declared in every file: declare(strict_types=1);
- No global variables. Dependency injection through constructors.
- PSR-4 autoloading via Composer.
- No eval(), no shell_exec(), no system().
