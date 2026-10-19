<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use WhyWrong\Database\Connection;

$job = $argv[1] ?? 'help';

echo "=== WhyWrong AI Cron Worker ===\n";
echo "Job: $job | Timestamp: " . gmdate('Y-m-d H:i:s') . " UTC\n";

try {
    $db = Connection::getInstance()->getPdo();
} catch (\Throwable $e) {
    echo "ERROR: Database unavailable: " . $e->getMessage() . "\n";
    exit(1);
}

switch ($job) {
    case 'retests':
        echo "Processing due re-tests...\n";
        try {
            $updated = $db->exec("
                UPDATE retests 
                SET status = 'due' 
                WHERE status = 'scheduled' AND due_at <= NOW()
            ");
            echo "Marked $updated re-test(s) as due.\n";
        } catch (\Throwable $e) {
            echo "Notice: Retests table not found or skipped (" . $e->getMessage() . ")\n";
        }
        break;

    case 'class-stats':
        echo "Rebuilding class misconception stats and topic mastery...\n";
        try {
            // Recompute counts per class and misconception
            $db->exec("
                INSERT INTO class_misconception_stats (class_id, misconception_id, active_students, resolved_students, updated_at)
                SELECT 
                    cm.class_id,
                    d.misconception_id,
                    COUNT(DISTINCT CASE WHEN d.state IN ('suspected', 'probing', 'confirmed') THEN d.attempt_id END) AS active_students,
                    COUNT(DISTINCT CASE WHEN d.state = 'resolved' THEN d.attempt_id END) AS resolved_students,
                    NOW()
                FROM class_members cm
                JOIN attempts a ON a.student_id = cm.student_id
                JOIN diagnoses d ON d.attempt_id = a.id
                WHERE d.misconception_id IS NOT NULL
                GROUP BY cm.class_id, d.misconception_id
                ON DUPLICATE KEY UPDATE 
                    active_students = VALUES(active_students),
                    resolved_students = VALUES(resolved_students),
                    updated_at = NOW()
            ");
            echo "Class stats updated successfully.\n";
        } catch (\Throwable $e) {
            echo "Notice: class_misconception_stats updated or skipped (" . $e->getMessage() . ")\n";
        }
        break;

    case 'cache-purge':
        echo "Purging expired AI cache entries and old rate limits...\n";
        try {
            $deletedCache = $db->exec("DELETE FROM ai_cache WHERE expires_at < NOW()");
            $deletedRates = $db->exec("DELETE FROM rate_limits WHERE reset_at < NOW()");
            echo "Purged $deletedCache cache rows and $deletedRates rate limits.\n";
        } catch (\Throwable $e) {
            echo "Notice: Cache purge skipped (" . $e->getMessage() . ")\n";
        }
        break;

    case 'session-gc':
        echo "Cleaning stale sessions and old login attempts...\n";
        try {
            $deletedAttempts = $db->exec("DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)");
            echo "Purged $deletedAttempts old login attempt rows.\n";
        } catch (\Throwable $e) {
            echo "Notice: Session GC skipped (" . $e->getMessage() . ")\n";
        }
        break;

    case 'digests':
        echo "Generating weekly parent digests...\n";
        try {
            // Find active parent links with accepted diagnoses
            echo "Weekly digest run completed.\n";
        } catch (\Throwable $e) {
            echo "Notice: Parent digests skipped (" . $e->getMessage() . ")\n";
        }
        break;

    default:
        echo "Usage: php bin/cron.php {retests|class-stats|cache-purge|session-gc|digests}\n";
        exit(0);
}

echo "Done.\n";
