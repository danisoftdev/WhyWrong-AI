<?php
declare(strict_types=1);

namespace WhyWrong\Tests;

use PHPUnit\Framework\TestCase;
use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;
use WhyWrong\Controllers\ClassController;
use WhyWrong\Controllers\ParentController;

class AuthorisationTest extends TestCase
{
    private Connection $db;

    protected function setUp(): void
    {
        $this->db = Connection::getInstance();
    }

    public function testTeacherCannotAccessAnotherTeachersClass(): void
    {
        $controller = new ClassController($this->db);
        $request = new Request('GET', '/api/classes/cls-math-form2/heatmap');
        // Simulate a different teacher who does not own this class
        $request->setUser([
            'id' => 'usr-unauthorized-teacher',
            'role' => 'teacher',
            'display_name' => 'Stranger Teacher',
        ]);
        $response = new Response();

        $controller->heatmap($request, $response, ['id' => 'cls-math-form2']);

        // Must fail with 404 or 403
        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testParentCannotAccessUnlinkedChild(): void
    {
        $controller = new ParentController($this->db);
        $request = new Request('GET', '/api/parent/children/usr-student-02/summary');
        // Parent is only linked to student 1 (Kofi), not student 2 (Ama)
        $request->setUser([
            'id' => 'usr-parent-01',
            'role' => 'parent',
            'display_name' => 'Mr. Kwesi Appiah',
        ]);
        $response = new Response();

        $controller->summary($request, $response, ['id' => 'usr-student-02']);

        // Section 6 Acceptance Test: A parent reading an unlinked child gets 404
        $this->assertEquals(404, $response->getStatusCode());
    }
}
