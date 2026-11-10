-- Classroom work for the running CHAR(36) schema (001_init).
-- Quizzes, worksheets, teacher-made groups, idea groups, and weekend sessions.
-- A weekend session stores a call link. WhyWrong does not host the call.

CREATE TABLE IF NOT EXISTS `student_groups` (
  `id`          CHAR(36)     NOT NULL,
  `class_id`    CHAR(36)     NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `kind`        ENUM('custom','idea') NOT NULL,
  `idea_label`  VARCHAR(160) NULL,
  `created_by`  CHAR(36)     NOT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_groups_class` (`class_id`),
  CONSTRAINT `fk_student_groups_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student_groups_teacher` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_members` (
  `id`         CHAR(36) NOT NULL,
  `group_id`   CHAR(36) NOT NULL,
  `student_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_group_member` (`group_id`, `student_id`),
  CONSTRAINT `fk_group_members_group` FOREIGN KEY (`group_id`) REFERENCES `student_groups`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_group_members_student` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assignments` (
  `id`            CHAR(36)     NOT NULL,
  `class_id`      CHAR(36)     NOT NULL,
  `teacher_id`    CHAR(36)     NOT NULL,
  `title`         VARCHAR(160) NOT NULL,
  `kind`          ENUM('quiz','worksheet') NOT NULL,
  `subject_label` VARCHAR(80)  NOT NULL,
  `prompt`        TEXT         NOT NULL,
  `due_at`        DATETIME     NULL,
  `audience`      ENUM('class','group') NOT NULL DEFAULT 'class',
  `group_id`      CHAR(36)     NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_class` (`class_id`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_group` FOREIGN KEY (`group_id`) REFERENCES `student_groups`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `weekend_sessions` (
  `id`         CHAR(36)     NOT NULL,
  `class_id`   CHAR(36)     NOT NULL,
  `teacher_id` CHAR(36)     NOT NULL,
  `title`      VARCHAR(160) NOT NULL,
  `starts_at`  DATETIME     NOT NULL,
  `call_url`   VARCHAR(500) NOT NULL,
  `activity`   TEXT         NOT NULL,
  `group_id`   CHAR(36)     NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_weekend_class` (`class_id`),
  CONSTRAINT `fk_weekend_class` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_weekend_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_weekend_group` FOREIGN KEY (`group_id`) REFERENCES `student_groups`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
