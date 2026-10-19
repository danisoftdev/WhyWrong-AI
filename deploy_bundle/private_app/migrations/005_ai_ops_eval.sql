-- WhyWrong AI | Phase 5: AI provider layer, cache, quotas and the evaluation harness
SET NAMES utf8mb4;

CREATE TABLE ai_cache (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cache_key     CHAR(64) NOT NULL UNIQUE,                    -- sha256(task + anonymised input)
  task          VARCHAR(40) NOT NULL,
  provider      VARCHAR(30) NOT NULL,
  response_json JSON NOT NULL,
  hits          INT UNSIGNED NOT NULL DEFAULT 0,
  expires_at    DATETIME NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_cache_exp (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_usage (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NULL,
  provider    VARCHAR(30) NOT NULL,
  task        VARCHAR(40) NOT NULL,
  status      ENUM('ok','error','timeout','rate_limited','fallback','cache_hit') NOT NULL,
  latency_ms  INT UNSIGNED NULL,
  tokens_in   INT UNSIGNED NULL,
  tokens_out  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_usage_user (user_id, created_at),
  KEY ix_usage_provider (provider, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Circuit breaker state per provider
CREATE TABLE ai_provider_state (
  provider         VARCHAR(30) NOT NULL PRIMARY KEY,
  status           ENUM('closed','open','half_open') NOT NULL DEFAULT 'closed',
  failure_count    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  open_until       DATETIME NULL,
  last_error_code  VARCHAR(40) NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evaluation harness: real, labelled accuracy numbers for the submission
CREATE TABLE eval_sets (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  subject_id  BIGINT UNSIGNED NULL,
  labelled_by VARCHAR(120) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_es_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eval_items (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  eval_set_id           BIGINT UNSIGNED NOT NULL,
  question_text         VARCHAR(500) NOT NULL,
  student_answer        VARCHAR(500) NOT NULL,
  working_text          TEXT NULL,
  expected_code         VARCHAR(40) NULL,                    -- misconception code, NULL means slip or correct
  expected_verdict      ENUM('slip','misconception','correct') NOT NULL,
  CONSTRAINT fk_ei_set FOREIGN KEY (eval_set_id) REFERENCES eval_sets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eval_runs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  eval_set_id  BIGINT UNSIGNED NOT NULL,
  provider     VARCHAR(30) NOT NULL,
  notes        VARCHAR(255) NULL,
  started_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at  DATETIME NULL,
  CONSTRAINT fk_er_set FOREIGN KEY (eval_set_id) REFERENCES eval_sets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eval_results (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  eval_run_id      BIGINT UNSIGNED NOT NULL,
  eval_item_id     BIGINT UNSIGNED NOT NULL,
  predicted_code   VARCHAR(40) NULL,
  predicted_verdict ENUM('slip','misconception','correct','unclear') NOT NULL,
  evidence_valid   TINYINT(1) NOT NULL DEFAULT 1,
  is_correct       TINYINT(1) NOT NULL,
  latency_ms       INT UNSIGNED NULL,
  KEY ix_ers_run (eval_run_id),
  CONSTRAINT fk_ers_run FOREIGN KEY (eval_run_id) REFERENCES eval_runs(id) ON DELETE CASCADE,
  CONSTRAINT fk_ers_item FOREIGN KEY (eval_item_id) REFERENCES eval_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version) VALUES ('005_ai_ops_eval');
