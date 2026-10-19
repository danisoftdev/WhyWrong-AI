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
