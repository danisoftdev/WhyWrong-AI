-- Parent account consent records.
-- Safe to import on a database that already has 001_init.sql.
-- The weekly note itself is stored in parent_digests.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `consents` (
  `id`                 CHAR(36)     NOT NULL,
  `user_id`            CHAR(36)     NOT NULL,
  `subject_student_id` CHAR(36)     NULL,
  `consent_type`       VARCHAR(40)  NOT NULL,
  `version`            VARCHAR(20)  NOT NULL,
  `granted_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `withdrawn_at`       DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `idx_consents_user` (`user_id`, `consent_type`),
  KEY `idx_consents_student` (`subject_student_id`),
  CONSTRAINT `fk_consents_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consents_student` FOREIGN KEY (`subject_student_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
