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
-- WhyWrong AI | Phase 2: subject packs, questions, classes
SET NAMES utf8mb4;

CREATE TABLE subjects (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(40) NOT NULL UNIQUE,
  name        VARCHAR(80) NOT NULL,
  category    ENUM('stem','general') NOT NULL,
  description VARCHAR(255) NULL,
  icon        VARCHAR(40) NULL,
  color_hex   CHAR(7) NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE topics (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  subject_id  BIGINT UNSIGNED NOT NULL,
  parent_id   BIGINT UNSIGNED NULL,
  slug        VARCHAR(60) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  level_min   ENUM('primary','jhs','shs','tertiary') NOT NULL DEFAULT 'jhs',
  level_max   ENUM('primary','jhs','shs','tertiary') NOT NULL DEFAULT 'shs',
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_topic (subject_id, slug),
  CONSTRAINT fk_topics_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_topics_parent  FOREIGN KEY (parent_id)  REFERENCES topics(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge graph: prerequisite relationships between topics
CREATE TABLE concept_edges (
  topic_id               BIGINT UNSIGNED NOT NULL,
  prerequisite_topic_id  BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (topic_id, prerequisite_topic_id),
  CONSTRAINT fk_edge_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_edge_prereq FOREIGN KEY (prerequisite_topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pack_versions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  subject_id   BIGINT UNSIGNED NOT NULL,
  version      VARCHAR(20) NOT NULL,
  status       ENUM('draft','reviewed','published') NOT NULL DEFAULT 'draft',
  reviewed_by  BIGINT UNSIGNED NULL,
  reviewed_at  DATETIME NULL,
  notes        VARCHAR(255) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pack (subject_id, version),
  CONSTRAINT fk_pack_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pack_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE misconceptions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code              VARCHAR(40) NOT NULL UNIQUE,            -- e.g. MATH-FRAC-001
  topic_id          BIGINT UNSIGNED NOT NULL,
  pack_version_id   BIGINT UNSIGNED NULL,
  label             VARCHAR(160) NOT NULL,
  student_belief    VARCHAR(255) NOT NULL,                  -- what the learner thinks, in their words
  description       TEXT NOT NULL,
  why_it_feels_true VARCHAR(255) NULL,
  example_wrong     VARCHAR(255) NULL,
  detector_type     ENUM('distractor','pattern','manual') NOT NULL DEFAULT 'distractor',
  detector_json     JSON NULL,                              -- pattern rules for the rules engine
  prior_weight      DECIMAL(4,3) NOT NULL DEFAULT 0.300,    -- heuristic starting weight, not a probability
  verified_status   ENUM('verified','unverified','rejected') NOT NULL DEFAULT 'unverified',
  teacher_reviewed  TINYINT(1) NOT NULL DEFAULT 0,          -- true once a subject teacher signs off
  source            ENUM('pack','teacher','ai_candidate') NOT NULL DEFAULT 'pack',
  created_by        BIGINT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_misc_topic (topic_id, verified_status),
  CONSTRAINT fk_misc_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_misc_pack FOREIGN KEY (pack_version_id) REFERENCES pack_versions(id) ON DELETE SET NULL,
  CONSTRAINT fk_misc_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Misconception chains: one root idea causing others
CREATE TABLE misconception_relations (
  parent_id  BIGINT UNSIGNED NOT NULL,
  child_id   BIGINT UNSIGNED NOT NULL,
  relation   ENUM('root_of','related') NOT NULL DEFAULT 'root_of',
  PRIMARY KEY (parent_id, child_id),
  CONSTRAINT fk_rel_parent FOREIGN KEY (parent_id) REFERENCES misconceptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_rel_child FOREIGN KEY (child_id) REFERENCES misconceptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-written probes: a student with the misconception picks predicted_wrong_key
CREATE TABLE probe_bank (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  misconception_id    BIGINT UNSIGNED NOT NULL,
  prompt              VARCHAR(500) NOT NULL,
  options_json        JSON NOT NULL,                         -- [{"key":"A","text":"Yes"},...]
  correct_key         CHAR(1) NOT NULL,
  predicted_wrong_key CHAR(1) NOT NULL,
  rationale           VARCHAR(255) NULL,
  difficulty          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  KEY ix_probe_misc (misconception_id, is_active),
  CONSTRAINT fk_probe_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE remediation_templates (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  misconception_id  BIGINT UNSIGNED NOT NULL,
  kind              ENUM('counterexample','worked_contrast','practice','real_world','simulation') NOT NULL,
  title             VARCHAR(160) NOT NULL,
  content_json      JSON NOT NULL,
  level             ENUM('primary','jhs','shs','tertiary') NOT NULL DEFAULT 'jhs',
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  KEY ix_rem_misc (misconception_id, kind),
  CONSTRAINT fk_rem_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id        CHAR(32) NOT NULL UNIQUE,
  topic_id         BIGINT UNSIGNED NOT NULL,
  type             ENUM('mcq','numeric','text') NOT NULL DEFAULT 'mcq',
  prompt           VARCHAR(600) NOT NULL,
  prompt_math      VARCHAR(255) NULL,                         -- LaTeX for KaTeX, optional
  level            ENUM('primary','jhs','shs','tertiary') NOT NULL DEFAULT 'jhs',
  difficulty       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  correct_answer   VARCHAR(255) NOT NULL,
  explanation      VARCHAR(600) NULL,
  exam_tag         VARCHAR(30) NULL,                          -- BECE, WASSCE
  source           ENUM('pack','teacher','ai') NOT NULL DEFAULT 'pack',
  verified_status  ENUM('verified','unverified') NOT NULL DEFAULT 'unverified',
  created_by       BIGINT UNSIGNED NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_q_topic (topic_id, is_active),
  CONSTRAINT fk_q_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_q_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diagnostic distractors: choosing option X is evidence for misconception Y
CREATE TABLE question_options (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question_id       BIGINT UNSIGNED NOT NULL,
  option_key        CHAR(1) NOT NULL,
  option_text       VARCHAR(255) NOT NULL,
  is_correct        TINYINT(1) NOT NULL DEFAULT 0,
  misconception_id  BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_option (question_id, option_key),
  CONSTRAINT fk_opt_q FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_opt_misc FOREIGN KEY (misconception_id) REFERENCES misconceptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classes (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id      CHAR(32) NOT NULL UNIQUE,
  school_id      BIGINT UNSIGNED NOT NULL,
  teacher_id     BIGINT UNSIGNED NOT NULL,
  subject_id     BIGINT UNSIGNED NULL,
  name           VARCHAR(100) NOT NULL,
  level          ENUM('primary','jhs','shs','tertiary','other') NOT NULL DEFAULT 'jhs',
  academic_year  VARCHAR(9) NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_class_teacher (teacher_id, is_active),
  CONSTRAINT fk_class_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_class_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE class_members (
  class_id    BIGINT UNSIGNED NOT NULL,
  student_id  BIGINT UNSIGNED NOT NULL,
  joined_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, student_id),
  KEY ix_member_student (student_id),
  CONSTRAINT fk_member_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_member_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignments (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id   CHAR(32) NOT NULL UNIQUE,
  class_id    BIGINT UNSIGNED NOT NULL,
  teacher_id  BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(160) NOT NULL,
  due_at      DATETIME NULL,
  status      ENUM('draft','open','closed') NOT NULL DEFAULT 'open',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_assign_class (class_id, status),
  CONSTRAINT fk_assign_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignment_questions (
  assignment_id  BIGINT UNSIGNED NOT NULL,
  question_id    BIGINT UNSIGNED NOT NULL,
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (assignment_id, question_id),
  CONSTRAINT fk_aq_assign FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_aq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version) VALUES ('002_content');
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
-- WhyWrong AI | Phase 4: parent portal, consent, notifications, data deletion
SET NAMES utf8mb4;

CREATE TABLE link_codes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id  BIGINT UNSIGNED NOT NULL,
  created_by  BIGINT UNSIGNED NOT NULL,                      -- the teacher
  code_hash   CHAR(64) NOT NULL UNIQUE,                      -- SHA-256 of the code; the code is shown once
  code_hint   CHAR(4) NOT NULL,                              -- last 4 chars, for the teacher to recognise it
  attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  used_by     BIGINT UNSIGNED NULL,
  revoked_at  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_code_student (student_id),
  CONSTRAINT fk_lc_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lc_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lc_usedby FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE parent_students (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id        BIGINT UNSIGNED NOT NULL,
  student_id       BIGINT UNSIGNED NOT NULL,
  status           ENUM('pending','active','revoked') NOT NULL DEFAULT 'pending',
  consent_at       DATETIME NULL,
  consent_version  VARCHAR(20) NULL,
  link_code_id     BIGINT UNSIGNED NULL,
  linked_at        DATETIME NULL,
  revoked_at       DATETIME NULL,
  UNIQUE KEY uq_parent_student (parent_id, student_id),
  KEY ix_ps_student (student_id, status),
  CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_code FOREIGN KEY (link_code_id) REFERENCES link_codes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consents (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id            BIGINT UNSIGNED NOT NULL,
  subject_student_id BIGINT UNSIGNED NULL,
  consent_type       ENUM('terms','privacy','parent_access','ai_processing') NOT NULL,
  version            VARCHAR(20) NOT NULL,
  granted_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  withdrawn_at       DATETIME NULL,
  ip_hash            CHAR(64) NULL,
  KEY ix_consent_user (user_id, consent_type),
  CONSTRAINT fk_cons_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cons_student FOREIGN KEY (subject_student_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plain-language weekly summary built only from teacher-accepted diagnoses
CREATE TABLE parent_digests (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id    BIGINT UNSIGNED NOT NULL,
  week_start    DATE NOT NULL,
  summary_json  JSON NOT NULL,
  generated_by  VARCHAR(30) NOT NULL DEFAULT 'template',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_digest (student_id, week_start),
  CONSTRAINT fk_dig_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        VARCHAR(40) NOT NULL,
  title       VARCHAR(160) NOT NULL,
  body        VARCHAR(400) NULL,
  read_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_notif_user (user_id, read_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE deletion_requests (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id    BIGINT UNSIGNED NOT NULL,
  requested_by  BIGINT UNSIGNED NULL,
  status        ENUM('requested','approved','completed','declined') NOT NULL DEFAULT 'requested',
  requested_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at  DATETIME NULL,
  KEY ix_del_status (status),
  CONSTRAINT fk_del_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_del_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version) VALUES ('004_parents');
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
