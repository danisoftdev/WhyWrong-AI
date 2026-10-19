-- WhyWrong AI | Phase 3: the six-stage agent loop
SET NAMES utf8mb4;

CREATE TABLE attempts (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id          CHAR(32) NOT NULL UNIQUE,
  student_id         BIGINT UNSIGNED NOT NULL,
  question_id        BIGINT UNSIGNED NOT NULL,
  assignment_id      BIGINT UNSIGNED NULL,
  answer_text        VARCHAR(500) NOT NULL,
  selected_key       CHAR(1) NULL,
  working_text       TEXT NULL,                              -- untrusted student text
  is_correct         TINYINT(1) NOT NULL,
  self_confidence    ENUM('guessing','think_so','sure') NULL,
  time_taken_ms      INT UNSIGNED NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_attempt_student (student_id, created_at),
  KEY ix_attempt_question (question_id),
  CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_assign FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE diagnoses (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id         CHAR(32) NOT NULL UNIQUE,
  attempt_id        BIGINT UNSIGNED NOT NULL,
  student_id        BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NULL,                    -- leading hypothesis
  state             ENUM('suspected','probing','confirmed','rejected','unclear','resolved') NOT NULL DEFAULT 'suspected',
  verdict           ENUM('slip','misconception','unclear') NOT NULL DEFAULT 'unclear',
  evidence_quote    VARCHAR(500) NULL,                       -- must be a substring of the attempt
  evidence_strength ENUM('low','moderate','strong') NOT NULL DEFAULT 'low',
  evidence_score    DECIMAL(5,2) NOT NULL DEFAULT 0.00,      -- heuristic counter, not a probability
  reasoning_summary VARCHAR(600) NULL,
  provider          VARCHAR(30) NOT NULL DEFAULT 'rules_engine',
  is_demo_mock      TINYINT(1) NOT NULL DEFAULT 0,
  teacher_status    ENUM('pending','accepted','edited','rejected') NOT NULL DEFAULT 'pending',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_diag_student (student_id, state),
  KEY ix_diag_misc (misconception_id, state),
  KEY ix_diag_review (teacher_status, created_at),
  CONSTRAINT fk_diag_attempt FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_diag_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_diag_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Competing hypotheses: the agent keeps 2 to 3 candidates and eliminates them with probes
CREATE TABLE diagnosis_hypotheses (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  diagnosis_id      BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NOT NULL,
  evidence_score    DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  status            ENUM('active','leading','eliminated') NOT NULL DEFAULT 'active',
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hyp (diagnosis_id, misconception_id),
  CONSTRAINT fk_hyp_diag FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
  CONSTRAINT fk_hyp_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE probes (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id         CHAR(32) NOT NULL UNIQUE,
  diagnosis_id      BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NULL,
  probe_bank_id     BIGINT UNSIGNED NULL,
  prompt            VARCHAR(500) NOT NULL,
  options_json      JSON NOT NULL,
  correct_key       CHAR(1) NOT NULL,
  predicted_key     CHAR(1) NOT NULL,                        -- the wrong answer the hypothesis predicts
  rationale         VARCHAR(255) NULL,
  status            ENUM('pending','answered','skipped') NOT NULL DEFAULT 'pending',
  provider          VARCHAR(30) NOT NULL DEFAULT 'rules_engine',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_probe_diag (diagnosis_id, status),
  CONSTRAINT fk_pr_diag FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_bank FOREIGN KEY (probe_bank_id) REFERENCES probe_bank(id) ON DELETE SET NULL,
  CONSTRAINT fk_pr_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE probe_responses (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  probe_id           BIGINT UNSIGNED NOT NULL,
  student_id         BIGINT UNSIGNED NOT NULL,
  selected_key       CHAR(1) NOT NULL,
  is_correct         TINYINT(1) NOT NULL,
  matched_prediction ENUM('yes','no','unclear') NOT NULL,
  self_confidence    ENUM('guessing','think_so','sure') NULL,
  answered_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_probe_once (probe_id, student_id),
  CONSTRAINT fk_pres_probe FOREIGN KEY (probe_id) REFERENCES probes(id) ON DELETE CASCADE,
  CONSTRAINT fk_pres_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Long-lived state per student per misconception
CREATE TABLE student_misconceptions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id        BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NOT NULL,
  state             ENUM('suspected','confirmed','resolved','rejected') NOT NULL DEFAULT 'suspected',
  evidence_strength ENUM('low','moderate','strong') NOT NULL DEFAULT 'low',
  evidence_count    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  first_seen_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at       DATETIME NULL,
  UNIQUE KEY uq_student_misc (student_id, misconception_id),
  KEY ix_sm_state (misconception_id, state),
  CONSTRAINT fk_sm_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE remediations (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id     CHAR(32) NOT NULL UNIQUE,
  diagnosis_id  BIGINT UNSIGNED NOT NULL,
  student_id    BIGINT UNSIGNED NOT NULL,
  status        ENUM('generated','in_progress','completed') NOT NULL DEFAULT 'generated',
  lesson_json   JSON NOT NULL,       -- belief, prediction, contradiction, corrected model
  worksheet_json JSON NULL,
  provider      VARCHAR(30) NOT NULL DEFAULT 'rules_engine',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at  DATETIME NULL,
  KEY ix_rem_student (student_id, status),
  CONSTRAINT fk_remed_diag FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
  CONSTRAINT fk_remed_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE practice_responses (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  remediation_id BIGINT UNSIGNED NOT NULL,
  student_id     BIGINT UNSIGNED NOT NULL,
  item_key       VARCHAR(40) NOT NULL,
  answer_text    VARCHAR(255) NOT NULL,
  is_correct     TINYINT(1) NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_prac_rem (remediation_id),
  CONSTRAINT fk_prac_rem FOREIGN KEY (remediation_id) REFERENCES remediations(id) ON DELETE CASCADE,
  CONSTRAINT fk_prac_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE retests (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id         CHAR(32) NOT NULL UNIQUE,
  student_id        BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NOT NULL,
  remediation_id    BIGINT UNSIGNED NULL,
  due_at            DATETIME NOT NULL,
  status            ENUM('scheduled','due','completed','missed','cancelled') NOT NULL DEFAULT 'scheduled',
  questions_json    JSON NULL,
  result_json       JSON NULL,
  simulated         TINYINT(1) NOT NULL DEFAULT 0,          -- true when the demo clock was advanced
  completed_at      DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_retest_due (status, due_at),
  KEY ix_retest_student (student_id, status),
  CONSTRAINT fk_rt_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rt_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_rt_rem FOREIGN KEY (remediation_id) REFERENCES remediations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transparent agent trace shown on the "AI Agent Activity" screen
CREATE TABLE agent_events (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  diagnosis_id  BIGINT UNSIGNED NULL,
  student_id    BIGINT UNSIGNED NULL,
  stage         ENUM('ingest','diagnose','probe','remediate','retest','report') NOT NULL,
  action        VARCHAR(80) NOT NULL,
  status        ENUM('started','succeeded','failed','skipped') NOT NULL,
  provider      VARCHAR(30) NULL,
  summary       VARCHAR(255) NULL,                           -- human-readable line for the timeline
  payload_json  JSON NULL,                                   -- sanitised, no names, no keys
  duration_ms   INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_event_diag (diagnosis_id, created_at),
  CONSTRAINT fk_ev_diag FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
  CONSTRAINT fk_ev_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teacher_reviews (
  id                       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  diagnosis_id             BIGINT UNSIGNED NOT NULL,
  teacher_id               BIGINT UNSIGNED NOT NULL,
  decision                 ENUM('accept','edit','reject') NOT NULL,
  edited_misconception_id  BIGINT UNSIGNED NULL,
  comment                  VARCHAR(500) NULL,
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_review_diag (diagnosis_id),
  CONSTRAINT fk_tr_diag FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
  CONSTRAINT fk_tr_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tr_misc FOREIGN KEY (edited_misconception_id) REFERENCES misconceptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Five-minute whole-class corrections (starter, main activity, exit ticket)
CREATE TABLE interventions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id         CHAR(32) NOT NULL UNIQUE,
  class_id          BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NOT NULL,
  title             VARCHAR(160) NOT NULL,
  plan_json         JSON NOT NULL,
  provider          VARCHAR(30) NOT NULL DEFAULT 'rules_engine',
  created_by        BIGINT UNSIGNED NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_int_class (class_id),
  CONSTRAINT fk_int_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_int_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_int_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-aggregated class map, refreshed by cron and after teacher reviews
CREATE TABLE class_misconception_stats (
  class_id          BIGINT UNSIGNED NOT NULL,
  misconception_id  BIGINT UNSIGNED NOT NULL,
  student_count     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  resolved_count    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  computed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, misconception_id),
  CONSTRAINT fk_cms_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_cms_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feeds the concept knowledge graph and the mastery heatmap
CREATE TABLE student_topic_mastery (
  student_id  BIGINT UNSIGNED NOT NULL,
  topic_id    BIGINT UNSIGNED NOT NULL,
  state       ENUM('not_started','learning','misconception','mastered') NOT NULL DEFAULT 'not_started',
  attempts    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  correct     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, topic_id),
  CONSTRAINT fk_stm_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_stm_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version) VALUES ('003_learning_loop');
