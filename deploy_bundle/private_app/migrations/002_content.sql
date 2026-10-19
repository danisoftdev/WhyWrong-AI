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
