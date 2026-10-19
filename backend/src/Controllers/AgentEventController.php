<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class AgentEventController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function list(Request $request, Response $response, array $params): void
    {
        $diagId = $params['id'] ?? '';
        $events = $this->db->fetchAll(
            "SELECT id, diagnosis_id, stage, action, sanitized_payload, status, created_at
             FROM agent_events
             WHERE diagnosis_id = ?
             ORDER BY created_at ASC",
            [$diagId]
        );

        foreach ($events as &$ev) {
            $ev['payload'] = json_decode($ev['sanitized_payload'] ?? '{}', true);
            unset($ev['sanitized_payload']);
        }

        $response->json(['status' => 'success', 'events' => $events]);
    }
}
