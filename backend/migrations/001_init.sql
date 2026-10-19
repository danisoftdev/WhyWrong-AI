-- Migration: 001_init.sql
-- Created: 2026-10-19
-- Rollback: See bottom of this file
-- Run AFTER creating the whywrong database:
--   CREATE DATABASE whywrong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET time_zone = '+00:00';

-- ── users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`            CHAR(36)     NOT NULL,
  `role`          ENUM('student','teacher','parent','admin') NOT NULL,
  `display_name`  VARCHAR(120) NOT NULL,
  `student_code`  VARCHAR(24)  NULL COMMENT 'Opaque code for students, shown instead of name in logs',
  `email`         VARCHAR(254) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── subjects ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `subjects` (
  `id`          CHAR(36)     NOT NULL,
  `slug`        VARCHAR(60)  NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `icon`        VARCHAR(60)  NULL,
  `color_token` VARCHAR(30)  NULL,
  `sort_order`  TINYINT      NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subjects_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── topics ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `topics` (
  `id`          CHAR(36)     NOT NULL,
  `subject_id`  CHAR(36)     NOT NULL,
  `slug`        VARCHAR(60)  NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `parent_id`   CHAR(36)     NULL,
  `sort_order`  TINYINT      NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_topics_subject_slug` (`subject_id`, `slug`),
  KEY `idx_topics_subject_id` (`subject_id`),
  CONSTRAINT `fk_topics_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_topics_parent_id`  FOREIGN KEY (`parent_id`)  REFERENCES `topics`(`id`)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── classes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `classes` (
  `id`          CHAR(36)     NOT NULL,
  `teacher_id`  CHAR(36)     NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `level`       VARCHAR(60)  NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_classes_teacher_id` (`teacher_id`),
  CONSTRAINT `fk_classes_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── class_members ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `class_members` (
  `id`          CHAR(36)     NOT NULL,
  `class_id`    CHAR(36)     NOT NULL,
  `student_id`  CHAR(36)     NOT NULL,
  `joined_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_members` (`class_id`, `student_id`),
  KEY `idx_class_members_student_id` (`student_id`),
  CONSTRAINT `fk_cm_class_id`   FOREIGN KEY (`class_id`)   REFERENCES `classes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cm_student_id` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── questions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `questions` (
  `id`               CHAR(36)   NOT NULL,
  `topic_id`         CHAR(36)   NOT NULL,
  `prompt`           TEXT       NOT NULL,
  `prompt_type`      ENUM('text','katex','image') NOT NULL DEFAULT 'text',
  `options_json`     JSON       NOT NULL COMMENT '[{id, text, is_distractor, misconception_id}]',
  `correct_answer`   VARCHAR(10) NOT NULL COMMENT 'Option id of the correct answer',
  `distractor_map`   JSON       NULL     COMMENT '{option_id: misconception_id}',
  `difficulty`       TINYINT    NOT NULL DEFAULT 2 COMMENT '1=easy 2=medium 3=hard',
  `pack_version`     VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  `created_at`       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_topic_id` (`topic_id`),
  CONSTRAINT `fk_questions_topic_id` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── misconceptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `misconceptions` (
  `id`              CHAR(36)     NOT NULL,
  `topic_id`        CHAR(36)     NOT NULL,
  `label`           VARCHAR(120) NOT NULL,
  `explanation`     TEXT         NOT NULL,
  `detector_json`   JSON         NOT NULL,
  `verified_status` ENUM('unverified','verified','deprecated') NOT NULL DEFAULT 'unverified',
  `pack_version`    VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_misconceptions_topic_id` (`topic_id`),
  CONSTRAINT `fk_misconceptions_topic_id` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── attempts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `attempts` (
  `id`           CHAR(36)  NOT NULL,
  `student_id`   CHAR(36)  NOT NULL,
  `question_id`  CHAR(36)  NOT NULL,
  `answer_json`  JSON      NOT NULL COMMENT '{selected_option_id, selected_text}',
  `working_text` TEXT      NULL     COMMENT 'Optional written working — treated as untrusted',
  `is_correct`   TINYINT(1) NOT NULL DEFAULT 0,
  `submitted_at` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_attempts_student_id`  (`student_id`),
  KEY `idx_attempts_question_id` (`question_id`),
  CONSTRAINT `fk_attempts_student_id`  FOREIGN KEY (`student_id`)  REFERENCES `users`(`id`)      ON DELETE CASCADE,
  CONSTRAINT `fk_attempts_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── diagnoses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `diagnoses` (
  `id`               CHAR(36)     NOT NULL,
  `attempt_id`       CHAR(36)     NOT NULL,
  `misconception_id` CHAR(36)     NULL,
  `state`            ENUM('suspected','probing','confirmed','rejected') NOT NULL DEFAULT 'suspected',
  `evidence_quote`   TEXT         NOT NULL COMMENT 'Must be a literal substring of the submitted answer',
  `evidence_strength` ENUM('low','moderate','strong') NOT NULL DEFAULT 'low',
  `provider`         VARCHAR(30)  NOT NULL DEFAULT 'rules_engine',
  `reviewer_id`      CHAR(36)     NULL,
  `is_demo`          TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_diagnoses_attempt_id`       (`attempt_id`),
  KEY `idx_diagnoses_misconception_id` (`misconception_id`),
  KEY `idx_diagnoses_reviewer_id`      (`reviewer_id`),
  CONSTRAINT `fk_diagnoses_attempt_id`  FOREIGN KEY (`attempt_id`)       REFERENCES `attempts`(`id`)       ON DELETE CASCADE,
  CONSTRAINT `fk_diagnoses_misc_id`     FOREIGN KEY (`misconception_id`) REFERENCES `misconceptions`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_diagnoses_reviewer`    FOREIGN KEY (`reviewer_id`)      REFERENCES `users`(`id`)          ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── probes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `probes` (
  `id`                CHAR(36) NOT NULL,
  `diagnosis_id`      CHAR(36) NOT NULL,
  `question_json`     JSON     NOT NULL,
  `predicted_wrong`   VARCHAR(120) NULL,
  `rationale`         TEXT     NULL,
  `answer_json`       JSON     NULL,
  `result`            ENUM('confirms','contradicts','inconclusive','pending') NOT NULL DEFAULT 'pending',
  `answered_at`       DATETIME NULL,
  `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_probes_diagnosis_id` (`diagnosis_id`),
  CONSTRAINT `fk_probes_diagnosis_id` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnoses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── remediations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `remediations` (
  `id`             CHAR(36) NOT NULL,
  `diagnosis_id`   CHAR(36) NOT NULL,
  `lesson_json`    JSON     NOT NULL COMMENT '{counterexample, worked_contrast, interactive}',
  `worksheet_json` JSON     NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_remediations_diagnosis_id` (`diagnosis_id`),
  CONSTRAINT `fk_remediations_diagnosis_id` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnoses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── retests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `retests` (
  `id`               CHAR(36)  NOT NULL,
  `student_id`       CHAR(36)  NOT NULL,
  `misconception_id` CHAR(36)  NOT NULL,
  `due_at`           DATETIME  NOT NULL,
  `status`           ENUM('scheduled','completed','skipped') NOT NULL DEFAULT 'scheduled',
  `result_json`      JSON      NULL,
  `is_simulated`     TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'True when demo time-advance was used',
  `created_at`       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_retests_student_id`       (`student_id`),
  KEY `idx_retests_misconception_id` (`misconception_id`),
  KEY `idx_retests_due_at`           (`due_at`),
  CONSTRAINT `fk_retests_student_id`  FOREIGN KEY (`student_id`)       REFERENCES `users`(`id`)          ON DELETE CASCADE,
  CONSTRAINT `fk_retests_misc_id`     FOREIGN KEY (`misconception_id`) REFERENCES `misconceptions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── agent_events ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `agent_events` (
  `id`                   CHAR(36)    NOT NULL,
  `diagnosis_id`         CHAR(36)    NOT NULL,
  `stage`                VARCHAR(30) NOT NULL COMMENT 'ingest|diagnose|probe|remediate|retest|report',
  `action`               VARCHAR(60) NOT NULL,
  `sanitized_payload`    JSON        NULL     COMMENT 'No raw student text, no keys',
  `status`               ENUM('pending','running','done','failed') NOT NULL DEFAULT 'done',
  `created_at`           DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agent_events_diagnosis_id` (`diagnosis_id`),
  CONSTRAINT `fk_agent_events_diagnosis_id` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnoses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── teacher_reviews ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `teacher_reviews` (
  `id`           CHAR(36)    NOT NULL,
  `diagnosis_id` CHAR(36)    NOT NULL,
  `teacher_id`   CHAR(36)    NOT NULL,
  `decision`     ENUM('accepted','edited','rejected') NOT NULL,
  `comment`      TEXT        NULL,
  `created_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_teacher_reviews_diagnosis_id` (`diagnosis_id`),
  KEY `idx_teacher_reviews_teacher_id`   (`teacher_id`),
  CONSTRAINT `fk_tr_diagnosis_id` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnoses`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tr_teacher_id`   FOREIGN KEY (`teacher_id`)   REFERENCES `users`(`id`)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── parent_students ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `parent_students` (
  `id`          CHAR(36)   NOT NULL,
  `parent_id`   CHAR(36)   NOT NULL,
  `student_id`  CHAR(36)   NOT NULL,
  `status`      ENUM('pending','active','revoked') NOT NULL DEFAULT 'pending',
  `consent_at`  DATETIME   NULL,
  `linked_at`   DATETIME   NULL,
  `created_at`  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_parent_student` (`parent_id`, `student_id`),
  KEY `idx_ps_parent_id`  (`parent_id`),
  KEY `idx_ps_student_id` (`student_id`),
  CONSTRAINT `fk_ps_parent_id`  FOREIGN KEY (`parent_id`)  REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ps_student_id` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── link_codes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `link_codes` (
  `id`          CHAR(36)    NOT NULL,
  `student_id`  CHAR(36)    NOT NULL,
  `code_hash`   VARCHAR(255) NOT NULL COMMENT 'bcrypt hash of the plaintext code',
  `expires_at`  DATETIME    NOT NULL,
  `used_at`     DATETIME    NULL,
  `attempts`    TINYINT     NOT NULL DEFAULT 0,
  `revoked`     TINYINT(1)  NOT NULL DEFAULT 0,
  `created_by`  CHAR(36)    NOT NULL COMMENT 'teacher_id who created this code',
  `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_link_codes_student_id` (`student_id`),
  KEY `idx_link_codes_created_by` (`created_by`),
  CONSTRAINT `fk_lc_student_id` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lc_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── parent_digests ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `parent_digests` (
  `id`            CHAR(36)    NOT NULL,
  `student_id`    CHAR(36)    NOT NULL,
  `week_start`    DATE        NOT NULL,
  `summary_json`  JSON        NOT NULL,
  `generated_by`  VARCHAR(30) NOT NULL DEFAULT 'rules_engine',
  `created_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pd_student_id` (`student_id`),
  CONSTRAINT `fk_pd_student_id` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ai_cache ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `ai_cache` (
  `id`            CHAR(36)    NOT NULL,
  `cache_key`     VARCHAR(64) NOT NULL COMMENT 'sha256 of task + anonymised input',
  `task`          VARCHAR(30) NOT NULL,
  `response_json` JSON        NOT NULL,
  `provider`      VARCHAR(30) NOT NULL,
  `expires_at`    DATETIME    NOT NULL,
  `created_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ai_cache_key` (`cache_key`),
  KEY `idx_ai_cache_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ai_usage ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `ai_usage` (
  `id`          CHAR(36)    NOT NULL,
  `user_id`     CHAR(36)    NULL COMMENT 'NULL for system/background calls',
  `provider`    VARCHAR(30) NOT NULL,
  `task`        VARCHAR(30) NOT NULL,
  `status`      ENUM('success','cache_hit','error','timeout','quota_exceeded') NOT NULL,
  `latency_ms`  INT         NULL,
  `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_usage_user_id`    (`user_id`),
  KEY `idx_ai_usage_provider`   (`provider`),
  KEY `idx_ai_usage_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── audit_logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`            CHAR(36)    NOT NULL,
  `actor_id`      CHAR(36)    NULL,
  `action`        VARCHAR(60) NOT NULL,
  `resource_type` VARCHAR(60) NOT NULL,
  `resource_id`   CHAR(36)    NULL,
  `meta_json`     JSON        NULL,
  `created_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_actor_id`      (`actor_id`),
  KEY `idx_audit_logs_resource_type` (`resource_type`),
  KEY `idx_audit_logs_created_at`    (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ROLLBACK (run these in REVERSE ORDER to undo this migration)
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS ai_usage;
-- DROP TABLE IF EXISTS ai_cache;
-- DROP TABLE IF EXISTS parent_digests;
-- DROP TABLE IF EXISTS link_codes;
-- DROP TABLE IF EXISTS parent_students;
-- DROP TABLE IF EXISTS teacher_reviews;
-- DROP TABLE IF EXISTS agent_events;
-- DROP TABLE IF EXISTS retests;
-- DROP TABLE IF EXISTS remediations;
-- DROP TABLE IF EXISTS probes;
-- DROP TABLE IF EXISTS diagnoses;
-- DROP TABLE IF EXISTS attempts;
-- DROP TABLE IF EXISTS misconceptions;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS class_members;
-- DROP TABLE IF EXISTS classes;
-- DROP TABLE IF EXISTS topics;
-- DROP TABLE IF EXISTS subjects;
-- DROP TABLE IF EXISTS users;
-- ============================================================
