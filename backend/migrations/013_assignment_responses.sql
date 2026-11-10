-- A learner's answer to work a teacher set.
-- The quote stored here must be a substring of answer_text.

CREATE TABLE IF NOT EXISTS `assignment_responses` (
  `id`              CHAR(36) NOT NULL,
  `assignment_id`   CHAR(36) NOT NULL,
  `student_id`      CHAR(36) NOT NULL,
  `answer_text`     TEXT     NOT NULL,
  `evidence_quote`  TEXT     NOT NULL,
  `state`           ENUM('suspected','rejected') NOT NULL DEFAULT 'suspected',
  `evidence_strength` ENUM('low','moderate','strong') NOT NULL DEFAULT 'low',
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_responses_assignment` (`assignment_id`),
  KEY `idx_responses_student` (`student_id`),
  CONSTRAINT `fk_responses_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_responses_student` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
