# Skill: Write a Database Migration

## Naming
backend/migrations/{NNN}_{description}.sql
e.g., 001_init.sql, 002_parent_tables.sql, 003_ai_cache.sql

## Template
```sql
-- Migration: {NNN}_{description}.sql
-- Created: {date}
-- Rollback: DROP TABLE IF EXISTS {table_name};

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `{table_name}` (
  `id`          CHAR(36)     NOT NULL,                  -- UUID
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

## Rules
- Engine: InnoDB always.
- Charset: utf8mb4, collation utf8mb4_unicode_ci always.
- IDs: CHAR(36) UUID generated in PHP (Ramsey\Uuid or bin2hex(random_bytes(16))).
- Foreign keys: declare them explicitly. Name them fk_{table}_{column}.
- Indexes: add INDEX on every foreign key column and every frequently filtered column.
- Timestamps: created_at and updated_at on every table.
- Include a rollback comment at the top (the DROP or ALTER that undoes this migration).
- NEVER delete or rename a migration file after it has run on production.
- NEVER use AUTO_INCREMENT for IDs exposed in URLs — use UUIDs or secure opaque tokens.

## After writing
1. Run it on a clean local database and confirm it loads without errors.
2. Update backend/seeds/demo_seed.sql if the new table needs demo data.
3. Update the schema section of docs/architecture.md.
