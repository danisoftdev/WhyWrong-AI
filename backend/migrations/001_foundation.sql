-- WhyWrong AI | Phase 1: foundation (identity, security, audit)
-- Target: MySQL 8 / MariaDB 10.4+, utf8mb4, InnoDB
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version     VARCHAR(60) NOT NULL PRIMARY KEY,
  applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schools (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id   CHAR(32) NOT NULL UNIQUE,
  name        VARCHAR(160) NOT NULL,
  region      VARCHAR(80) NULL,
  country     CHAR(2) NOT NULL DEFAULT 'GH',
  is_demo     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id      CHAR(32) NOT NULL UNIQUE,
  school_id      BIGINT UNSIGNED NULL,
  role           ENUM('student','teacher','parent','admin') NOT NULL,
  student_code   VARCHAR(20) NULL,                -- anonymous code used in reports
  display_name   VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NULL UNIQUE,
  password_hash  VARCHAR(255) NULL,               -- password, or PIN hash for students
  status         ENUM('active','pending','disabled','deleted') NOT NULL DEFAULT 'active',
  is_demo        TINYINT(1) NOT NULL DEFAULT 0,
  failed_logins  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until   DATETIME NULL,
  last_login_at  DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME NULL,
  UNIQUE KEY uq_users_school_code (school_id, student_code),
  KEY ix_users_role_status (role, status),
  CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional DB-backed PHP sessions (useful on shared hosting with unreliable session dirs)
CREATE TABLE sessions (
  id             VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id        BIGINT UNSIGNED NULL,
  data           MEDIUMTEXT NOT NULL,
  ip_hash        CHAR(64) NULL,
  ua_hash        CHAR(64) NULL,
  last_activity  INT UNSIGNED NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_sessions_user (user_id),
  KEY ix_sessions_activity (last_activity),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_attempts (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  identifier_hash  CHAR(64) NOT NULL,             -- hash of email or student code
  ip_hash          CHAR(64) NOT NULL,
  success          TINYINT(1) NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_login_ident (identifier_hash, created_at),
  KEY ix_login_ip (ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generic fixed-window rate limiter (login, link-code attempts, AI calls)
CREATE TABLE rate_limits (
  bucket_key    VARCHAR(190) NOT NULL PRIMARY KEY,
  hits          INT UNSIGNED NOT NULL DEFAULT 0,
  window_start  DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id       BIGINT UNSIGNED NULL,
  actor_role     VARCHAR(20) NULL,
  action         VARCHAR(80) NOT NULL,
  resource_type  VARCHAR(60) NULL,
  resource_id    VARCHAR(64) NULL,
  ip_hash        CHAR(64) NULL,
  meta_json      JSON NULL,                       -- never raw answers or secrets
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_audit_actor (actor_id, created_at),
  KEY ix_audit_resource (resource_type, resource_id),
  KEY ix_audit_action (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_settings (
  key_name    VARCHAR(80) NOT NULL PRIMARY KEY,
  value_json  JSON NOT NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version) VALUES ('001_foundation');
