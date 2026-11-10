<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class ClassroomController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function groups(Request $request, Response $response, array $params): void
    {
        $class = $this->ownedClass($request, $response, $params['id'] ?? '');
        if (!$class) {
            return;
        }

        try {
            $groups = $this->db->fetchAll(
                "SELECT g.id, g.name, g.kind, g.idea_label, g.created_at,
                        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
                 FROM student_groups g
                 WHERE g.class_id = ?
                 ORDER BY g.created_at DESC",
                [$class['id']]
            );
        } catch (\Throwable $e) {
            $this->missingTables($response);
            return;
        }

        $response->json(['status' => 'success', 'groups' => $groups]);
    }

    public function createGroup(Request $request, Response $response, array $params): void
    {
        $class = $this->ownedClass($request, $response, $params['id'] ?? '');
        if (!$class) {
            return;
        }

        $kind = (string)$request->get('kind', 'custom');
        $name = trim((string)$request->get('name', ''));
        $ideaLabel = trim((string)$request->get('idea_label', ''));
        if (!in_array($kind, ['custom', 'idea'], true)) {
            $response->error('A group is either custom or idea.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($kind === 'idea' && $ideaLabel === '') {
            $response->error('An idea group needs the idea it is built from.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($name === '') {
            $name = $kind === 'idea' ? $ideaLabel : '';
        }
        if ($name === '' || mb_strlen($name) > 120) {
            $response->error('Give the group a name of 120 characters or fewer.', 'VALIDATION_ERROR', 422);
            return;
        }

        $studentIds = $kind === 'idea'
            ? $this->studentsForIdea($class['id'], $ideaLabel)
            : $this->cleanIds($request->get('student_ids'));

        if ($kind === 'custom' && $studentIds === []) {
            $response->error('Choose at least one learner from this class.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($kind === 'custom' && !$this->studentsBelong($class['id'], $studentIds)) {
            $response->error('Every member must already be in this class.', 'VALIDATION_ERROR', 422);
            return;
        }

        $groupId = 'grp-' . bin2hex(random_bytes(8));
        try {
            $this->db->execute(
                "INSERT INTO student_groups (id, class_id, name, kind, idea_label, created_by)
                 VALUES (?, ?, ?, ?, ?, ?)",
                [$groupId, $class['id'], $name, $kind, $ideaLabel !== '' ? $ideaLabel : null, $request->getUserId()]
            );
            foreach ($studentIds as $studentId) {
                $this->db->execute(
                    "INSERT INTO group_members (id, group_id, student_id) VALUES (?, ?, ?)",
                    ['gm-' . bin2hex(random_bytes(8)), $groupId, $studentId]
                );
            }
        } catch (\Throwable $e) {
            $this->missingTables($response);
            return;
        }

        $response->json([
            'status' => 'success',
            'group' => [
                'id' => $groupId,
                'name' => $name,
                'kind' => $kind,
                'idea_label' => $ideaLabel,
                'member_count' => count($studentIds),
            ],
        ], 201);
    }

    public function assignments(Request $request, Response $response, array $params): void
    {
        $class = $this->ownedClass($request, $response, $params['id'] ?? '');
        if (!$class) {
            return;
        }

        try {
            $rows = $this->db->fetchAll(
                "SELECT a.id, a.title, a.kind, a.subject_label, a.prompt, a.due_at, a.audience, a.group_id, a.created_at,
                        g.name AS group_name
                 FROM assignments a
                 LEFT JOIN student_groups g ON a.group_id = g.id
                 WHERE a.class_id = ?
                 ORDER BY a.created_at DESC",
                [$class['id']]
            );
        } catch (\Throwable $e) {
            $this->missingTables($response);
            return;
        }

        $response->json(['status' => 'success', 'assignments' => $rows]);
    }

    public function createAssignment(Request $request, Response $response, array $params): void
    {
        $class = $this->ownedClass($request, $response, $params['id'] ?? '');
        if (!$class) {
            return;
        }

        $title = trim((string)$request->get('title', ''));
        $kind = (string)$request->get('kind', 'quiz');
        $subject = trim((string)$request->get('subject_label', ''));
        $prompt = trim((string)$request->get('prompt', ''));
        $audience = (string)$request->get('audience', 'class');
        $groupId = trim((string)$request->get('group_id', ''));
        $dueRaw = trim((string)$request->get('due_at', ''));

        if ($title === '' || mb_strlen($title) > 160) {
            $response->error('Give the work a title of 160 characters or fewer.', 'VALIDATION_ERROR', 422);
            return;
        }
        if (!in_array($kind, ['quiz', 'worksheet'], true)) {
            $response->error('Work is either a quiz or a worksheet.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($subject === '' || mb_strlen($subject) > 80) {
            $response->error('Name the subject in 80 characters or fewer.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($prompt === '' || mb_strlen($prompt) > 4000) {
            $response->error('Write the question the class will answer.', 'VALIDATION_ERROR', 422);
            return;
        }
        if (!in_array($audience, ['class', 'group'], true)) {
            $response->error('Send the work to the class or to one group.', 'VALIDATION_ERROR', 422);
            return;
        }

        $dueAt = null;
        if ($dueRaw !== '') {
            $stamp = strtotime($dueRaw);
            if ($stamp === false) {
                $response->error('The due date could not be read.', 'VALIDATION_ERROR', 422);
                return;
            }
            $dueAt = date('Y-m-d H:i:s', $stamp);
        }

        if ($audience === 'class') {
            $groupId = '';
        } elseif (!$this->groupInClass($class['id'], $groupId)) {
            $response->error('Choose a group from this class.', 'VALIDATION_ERROR', 422);
            return;
        }

        $id = 'asg-' . bin2hex(random_bytes(8));
        try {
            $this->db->execute(
                "INSERT INTO assignments (id, class_id, teacher_id, title, kind, subject_label, prompt, due_at, audience, group_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [$id, $class['id'], $request->getUserId(), $title, $kind, $subject, $prompt, $dueAt, $audience, $groupId !== '' ? $groupId : null]
            );
        } catch (\Throwable $e) {
            $this->missingTables($response);
            return;
        }

        $response->json([
            'status' => 'success',
            'assignment' => [
                'id' => $id,
                'title' => $title,
                'kind' => $kind,
                'subject_label' => $subject,
                'due_at' => $dueAt,
                'audience' => $audience,
            ],
        ], 201);
    }

    public function sessions(Request $request, Response $response, array $params): void
    {
        $class = $this->ownedClass($request, $response, $params['id'] ?? '');
        if (!$class) {
            return;
        }

        try {
            $rows = $this->db->fetchAll(
                "SELECT s.id, s.title, s.starts_at, s.call_url, s.activity, s.group_id, s.created_at, g.name AS group_name
                 FROM weekend_sessions s
                 LEFT JOIN student_groups g ON s.group_id = g.id
                 WHERE s.class_id = ?
                 ORDER BY s.starts_at ASC",
                [$class['id']]
            );
        } catch (\Throwable $e) {
            $this->missingTables($response);
            return;
        }

        $response->json(['status' => 'success', 'sessions' => $rows]);
    }

    public function createSession(Request $request, Response $response, array $params): void
    {
        $class = $this->ownedClass($request, $response, $params['id'] ?? '');
        if (!$class) {
            return;
        }

        $title = trim((string)$request->get('title', ''));
        $startsRaw = trim((string)$request->get('starts_at', ''));
        $callUrl = trim((string)$request->get('call_url', ''));
        $activity = trim((string)$request->get('activity', ''));
        $groupId = trim((string)$request->get('group_id', ''));

        if ($title === '' || mb_strlen($title) > 160) {
            $response->error('Give the session a title of 160 characters or fewer.', 'VALIDATION_ERROR', 422);
            return;
        }
        $stamp = strtotime($startsRaw);
        if ($startsRaw === '' || $stamp === false) {
            $response->error('Set the day and time of the session.', 'VALIDATION_ERROR', 422);
            return;
        }
        if (!$this->validCallUrl($callUrl)) {
            $response->error('Paste an http or https link for the call. WhyWrong does not host the call.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($activity === '' || mb_strlen($activity) > 2000) {
            $response->error('Write the short activity the group will present.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($groupId !== '' && !$this->groupInClass($class['id'], $groupId)) {
            $response->error('Choose a group from this class, or leave the session open to the class.', 'VALIDATION_ERROR', 422);
            return;
        }

        $id = 'ses-' . bin2hex(random_bytes(8));
        try {
            $this->db->execute(
                "INSERT INTO weekend_sessions (id, class_id, teacher_id, title, starts_at, call_url, activity, group_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [$id, $class['id'], $request->getUserId(), $title, date('Y-m-d H:i:s', $stamp), $callUrl, $activity, $groupId !== '' ? $groupId : null]
            );
        } catch (\Throwable $e) {
            $this->missingTables($response);
            return;
        }

        $response->json([
            'status' => 'success',
            'session' => [
                'id' => $id,
                'title' => $title,
                'starts_at' => date('Y-m-d H:i:s', $stamp),
                'call_url' => $callUrl,
            ],
        ], 201);
    }

    private function ownedClass(Request $request, Response $response, string $classId): ?array
    {
        if ($classId === '') {
            $response->error('Class not found or unauthorized.', 'NOT_FOUND', 404);
            return null;
        }
        $class = $this->db->fetchOne(
            "SELECT * FROM classes WHERE id = ? AND teacher_id = ?",
            [$classId, $request->getUserId()]
        );
        if (!$class) {
            $response->error('Class not found or unauthorized.', 'NOT_FOUND', 404);
            return null;
        }
        return $class;
    }

    private function studentsForIdea(string $classId, string $ideaLabel): array
    {
        $rows = $this->db->fetchAll(
            "SELECT DISTINCT a.student_id
             FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN class_members cm ON a.student_id = cm.student_id AND cm.class_id = ?
             JOIN misconceptions m ON d.misconception_id = m.id
             WHERE m.label = ? AND d.state IN ('suspected', 'probing', 'confirmed')",
            [$classId, $ideaLabel]
        );
        return array_column($rows, 'student_id');
    }

    /** @param mixed $raw */
    private function cleanIds($raw): array
    {
        if (!is_array($raw)) {
            return [];
        }
        $ids = [];
        foreach ($raw as $id) {
            $id = trim((string)$id);
            if ($id !== '' && !in_array($id, $ids, true)) {
                $ids[] = $id;
            }
        }
        return array_slice($ids, 0, 60);
    }

    private function studentsBelong(string $classId, array $studentIds): bool
    {
        if ($studentIds === []) {
            return false;
        }
        $placeholders = implode(',', array_fill(0, count($studentIds), '?'));
        $row = $this->db->fetchOne(
            "SELECT COUNT(*) AS n FROM class_members WHERE class_id = ? AND student_id IN ($placeholders)",
            array_merge([$classId], $studentIds)
        );
        return (int)($row['n'] ?? 0) === count($studentIds);
    }

    private function groupInClass(string $classId, string $groupId): bool
    {
        if ($groupId === '') {
            return false;
        }
        $row = $this->db->fetchOne(
            "SELECT id FROM student_groups WHERE id = ? AND class_id = ?",
            [$groupId, $classId]
        );
        return (bool)$row;
    }

    private function validCallUrl(string $url): bool
    {
        if (strlen($url) > 500 || filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }
        $scheme = parse_url($url, PHP_URL_SCHEME);
        return in_array($scheme, ['http', 'https'], true);
    }

    private function missingTables(Response $response): void
    {
        $response->error(
            'The classroom tables are not installed yet. Import migrations/012_classroom.sql.',
            'MIGRATION_REQUIRED',
            503
        );
    }
}
