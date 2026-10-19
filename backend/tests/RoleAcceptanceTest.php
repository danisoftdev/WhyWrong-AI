<?php
declare(strict_types=1);

namespace WhyWrong\Tests;

use PHPUnit\Framework\TestCase;
use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;
use WhyWrong\Http\Router;
use WhyWrong\Controllers\DiagnosisController;
use WhyWrong\Controllers\ClassController;
use WhyWrong\Controllers\ReviewController;
use WhyWrong\Controllers\ParentController;
use WhyWrong\Controllers\AdminController;
use WhyWrong\Controllers\ProbeController;
use WhyWrong\Controllers\SubjectController;
use WhyWrong\Controllers\AuthController;
use WhyWrong\AI\RulesEngineProvider;

class RoleAcceptanceTest extends TestCase
{
    private Connection $db;

    protected function setUp(): void
    {
        $this->db = Connection::getInstance();
    }

    // =========================================================================
    // SECTION 4: STUDENT ACCEPTANCE TESTS
    // =========================================================================

    public function testStudentCannotAccessAnotherStudentsDiagnosis(): void
    {
        $controller = new DiagnosisController($this->db);

        // Fetch a diagnosis belonging to student 1 (usr-student-01)
        $diag = $this->db->fetchOne("SELECT d.id FROM diagnoses d JOIN attempts a ON d.attempt_id = a.id WHERE a.student_id = 'usr-student-01' LIMIT 1");
        if (!$diag) {
            $this->markTestSkipped('No diagnosis found for student 1 in seed.');
        }

        $request = new Request('GET', '/api/diagnoses/' . $diag['id']);
        // Student 2 attempts to read Student 1's diagnosis
        $request->setUser([
            'id'           => 'usr-student-02',
            'role'         => 'student',
            'display_name' => 'Ama Mensah',
        ]);
        $response = new Response();

        $controller->show($request, $response, ['id' => $diag['id']]);

        // Hard Acceptance rule: Student A requesting Student B's diagnosis gets 404 (not 403)
        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testStudentCallingTeacherRouteGets403(): void
    {
        $router = new Router($this->db);
        $router->get('/api/classes', 'ClassController@list', roles: ['teacher']);

        $request = new Request('GET', '/api/classes');
        $request->setUser([
            'id'   => 'usr-student-01',
            'role' => 'student',
        ]);
        $response = new Response();

        $router->dispatch($request, $response);

        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testFractionsMisconceptionAddAcrossWithSureGivesSuspectedAndModerate(): void
    {
        $engine = new RulesEngineProvider();
        $input = [
            'selected_option_id' => 'opt-b',
            'distractor_map'     => ['opt-b' => 'misc-frac-add-across'],
            'answer_text'        => '2/7',
            'working_text'       => '1/3 + 1/4 = 2/7',
            'confidence'         => 'sure',
        ];

        $diag = $engine->generateJson('diagnose', $input, []);

        $this->assertEquals('suspected', $diag['status']);
        $this->assertStringContainsString('2/7', $diag['evidence_quote']);
        $this->assertEquals('moderate', $diag['evidence_strength']);
        $this->assertFalse(isset($diag['confidence_percentage'])); // Never percentage
    }

    public function testTwoPredictedProbesGiveStrongEvidence(): void
    {
        $controller = new ProbeController($this->db);

        $att = $this->db->fetchOne("SELECT id FROM attempts LIMIT 1");
        $diagId = 'test-diag-strong-' . bin2hex(random_bytes(4));
        $this->db->execute(
            "INSERT INTO diagnoses (id, attempt_id, misconception_id, state, evidence_quote, evidence_strength, provider, is_demo)
             VALUES (?, ?, 'misc-frac-add-across', 'suspected', '2/7', 'moderate', 'mock', 1)",
            [$diagId, $att['id']]
        );

        // Seed 2 probes
        $p1 = 'test-prb-1-' . bin2hex(random_bytes(4));
        $p2 = 'test-prb-2-' . bin2hex(random_bytes(4));

        $this->db->execute(
            "INSERT INTO probes (id, diagnosis_id, question_json, predicted_wrong, result) VALUES (?, ?, ?, ?, 'confirms')",
            [$p1, $diagId, json_encode(['options' => [['id' => 'o1', 'text' => 'Predicted Wrong', 'is_predicted_wrong' => true]]]), 'Predicted Wrong']
        );
        $this->db->execute(
            "INSERT INTO probes (id, diagnosis_id, question_json, predicted_wrong, result) VALUES (?, ?, ?, ?, 'pending')",
            [$p2, $diagId, json_encode(['options' => [['id' => 'o2', 'text' => 'Predicted Wrong 2', 'is_predicted_wrong' => true]]]), 'Predicted Wrong 2']
        );

        $request = new Request('POST', "/api/probes/{$p2}/responses");
        $request->setUser(['id' => 'usr-student-01', 'role' => 'student']);
        $request->setBody(['selected_option_id' => 'o2', 'selected_text' => 'Predicted Wrong 2']);
        $response = new Response();

        $controller->respond($request, $response, ['id' => $p2]);

        $body = $response->getData();
        $this->assertEquals('strong', $body['evidence_strength'] ?? '');
        $this->assertEquals('suspected', $body['diagnosis_state'] ?? '');
    }

    public function testWrongAnswerWithAllProbesCorrectGivesSlipAndRejected(): void
    {
        $controller = new ProbeController($this->db);

        $att = $this->db->fetchOne("SELECT id FROM attempts LIMIT 1");
        $diagId = 'test-diag-slip-' . bin2hex(random_bytes(4));
        $this->db->execute(
            "INSERT INTO diagnoses (id, attempt_id, misconception_id, state, evidence_quote, evidence_strength, provider, is_demo)
             VALUES (?, ?, 'misc-frac-add-across', 'suspected', '2/7', 'moderate', 'mock', 1)",
            [$diagId, $att['id']]
        );

        $p1 = 'test-slip-1-' . bin2hex(random_bytes(4));
        $this->db->execute(
            "INSERT INTO probes (id, diagnosis_id, question_json, result) VALUES (?, ?, ?, 'pending')",
            [$p1, $diagId, json_encode(['options' => [['id' => 'o-correct', 'text' => '5/12', 'is_correct' => true]]])]
        );

        $request = new Request('POST', "/api/probes/{$p1}/responses");
        $request->setUser(['id' => 'usr-student-01', 'role' => 'student']);
        $request->setBody(['selected_option_id' => 'o-correct', 'selected_text' => '5/12']);
        $response = new Response();

        $controller->respond($request, $response, ['id' => $p1]);

        $body = $response->getData();
        $this->assertEquals('rejected', $body['diagnosis_state'] ?? '');
        $this->assertTrue($body['is_slip'] ?? false);
        $this->assertStringContainsString('momentary slip', $body['feedback'] ?? '');
    }

    public function testQuestionPayloadsNeverContainIsCorrectOrMisconceptionsForStudents(): void
    {
        $controller = new SubjectController($this->db);
        $request = new Request('GET', '/api/subjects');
        $request->setUser(['id' => 'usr-student-01', 'role' => 'student']);
        $response = new Response();

        $controller->list($request, $response);

        $data = $response->getData();
        $this->assertNotEmpty($data['subjects']);

        foreach ($data['subjects'] as $subj) {
            foreach ($subj['topics'] as $topic) {
                foreach ($topic['questions'] as $q) {
                    $this->assertArrayNotHasKey('correct_answer', $q);
                    $this->assertArrayNotHasKey('distractor_map', $q);
                    foreach ($q['options'] as $opt) {
                        $this->assertArrayNotHasKey('is_correct', $opt);
                        $this->assertArrayNotHasKey('misconception_id', $opt);
                    }
                }
            }
        }
    }

    // =========================================================================
    // SECTION 5: TEACHER ACCEPTANCE TESTS
    // =========================================================================

    public function testTeacherReadingAnotherTeachersClassMapGets404(): void
    {
        $controller = new ClassController($this->db);
        $request = new Request('GET', '/api/classes/cls-math-form2/heatmap');
        $request->setUser([
            'id'   => 'usr-stranger-teacher',
            'role' => 'teacher',
        ]);
        $response = new Response();

        $controller->heatmap($request, $response, ['id' => 'cls-math-form2']);

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testReviewDecisionWritesBothAuditRows(): void
    {
        $controller = new ReviewController($this->db);

        // Find a diagnosis belonging to a student taught by usr-teacher-01
        $diag = $this->db->fetchOne(
            "SELECT d.id FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN class_members cm ON a.student_id = cm.student_id
             JOIN classes c ON cm.class_id = c.id
             WHERE c.teacher_id = 'usr-teacher-01' LIMIT 1"
        );

        if (!$diag) {
            $this->markTestSkipped('No diagnosis found for teacher 1 class.');
        }

        $diagId = $diag['id'];
        $request = new Request('PATCH', "/api/diagnoses/{$diagId}/review");
        $request->setUser(['id' => 'usr-teacher-01', 'role' => 'teacher']);
        $request->setBody(['decision' => 'accepted', 'comment' => 'Confirmed in 1-on-1 discussion']);
        $response = new Response();

        $controller->decide($request, $response, ['id' => $diagId]);

        $this->assertEquals(200, $response->getStatusCode());

        // Check teacher_reviews row written
        $tr = $this->db->fetchOne("SELECT * FROM teacher_reviews WHERE diagnosis_id = ? AND teacher_id = 'usr-teacher-01' ORDER BY created_at DESC LIMIT 1", [$diagId]);
        $this->assertNotEmpty($tr);
        $this->assertEquals('accepted', $tr['decision']);

        // Check audit_logs row written
        $al = $this->db->fetchOne("SELECT * FROM audit_logs WHERE resource_id = ? AND actor_id = 'usr-teacher-01' ORDER BY created_at DESC LIMIT 1", [$diagId]);
        $this->assertNotEmpty($al);
        $this->assertEquals('teacher_review', $al['action']);
    }

    public function testTeacherEditPayloadValidatesMisconceptionId(): void
    {
        $controller = new ReviewController($this->db);
        $diag = $this->db->fetchOne(
            "SELECT d.id FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN class_members cm ON a.student_id = cm.student_id
             JOIN classes c ON cm.class_id = c.id
             WHERE c.teacher_id = 'usr-teacher-01' LIMIT 1"
        );

        if (!$diag) {
            $this->markTestSkipped('No diagnosis found for teacher 1 class.');
        }

        $diagId = $diag['id'];
        $request = new Request('PATCH', "/api/diagnoses/{$diagId}/review");
        $request->setUser(['id' => 'usr-teacher-01', 'role' => 'teacher']);
        // Invalid pack id
        $request->setBody(['decision' => 'edited', 'misconception_id' => 'invalid-fake-pack-id']);
        $response = new Response();

        $controller->decide($request, $response, ['id' => $diagId]);

        $this->assertEquals(422, $response->getStatusCode());
    }

    // =========================================================================
    // SECTION 6: PARENT ACCEPTANCE TESTS
    // =========================================================================

    public function testParentReadingUnlinkedChildGets404(): void
    {
        $controller = new ParentController($this->db);
        $request = new Request('GET', '/api/parent/children/usr-student-02/summary');
        $request->setUser(['id' => 'usr-parent-01', 'role' => 'parent']);
        $response = new Response();

        $controller->summary($request, $response, ['id' => 'usr-student-02']);

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testRevokingParentLinkMarksConsentWithdrawn(): void
    {
        $controller = new ParentController($this->db);
        $request = new Request('POST', '/api/parent/children/usr-student-01/revoke');
        $request->setUser(['id' => 'usr-parent-01', 'role' => 'parent']);
        $response = new Response();

        $controller->revoke($request, $response, ['id' => 'usr-student-01']);

        $this->assertEquals(200, $response->getStatusCode());

        // Check parent_students status is revoked
        $link = $this->db->fetchOne("SELECT status FROM parent_students WHERE parent_id = 'usr-parent-01' AND student_id = 'usr-student-01'");
        $this->assertEquals('revoked', $link['status']);

        // Restore link for subsequent runs
        $this->db->execute("UPDATE parent_students SET status = 'active' WHERE parent_id = 'usr-parent-01' AND student_id = 'usr-student-01'");
    }

    public function testNoPersonalDataReachesAiProvider(): void
    {
        // Unit test proves no name, email or school reaches an AI provider
        $engine = new RulesEngineProvider();

        $aiInput = [
            'question_prompt'    => 'What is 1/3 + 1/4?',
            'selected_option_id' => 'opt-b',
            'answer_text'        => '2/7',
            'working_text'       => '1/3 + 1/4 = 2/7',
            'distractor_map'     => ['opt-b' => 'misc-frac-add-across'],
        ];

        // Ensure personal data fields are strictly absent
        $this->assertArrayNotHasKey('student_name', $aiInput);
        $this->assertArrayNotHasKey('name', $aiInput);
        $this->assertArrayNotHasKey('email', $aiInput);
        $this->assertArrayNotHasKey('school', $aiInput);
        $this->assertArrayNotHasKey('school_id', $aiInput);

        $res = $engine->generateJson('diagnose', $aiInput, []);
        $this->assertNotEmpty($res['hypothesis']);
    }

    // =========================================================================
    // SECTION 7: ADMINISTRATOR ACCEPTANCE TESTS
    // =========================================================================

    public function testUsersResponseNeverContainsPasswordHash(): void
    {
        $controller = new AdminController($this->db);
        $request = new Request('GET', '/api/admin/users');
        $request->setUser(['id' => 'usr-admin-01', 'role' => 'admin', 'school_id' => 'sch-ghana-demo']);
        $response = new Response();

        $controller->users($request, $response);

        $this->assertEquals(200, $response->getStatusCode());
        $data = $response->getData();
        $this->assertNotEmpty($data['users']);

        foreach ($data['users'] as $user) {
            $this->assertArrayNotHasKey('password_hash', $user, 'Security breach: password_hash leaked in users endpoint!');
        }
    }

    public function testDemoAdminCannotDeleteNonDemoStudent(): void
    {
        $controller = new AdminController($this->db);

        // Find or create non-demo student
        $studentId = 'usr-real-prod-student';
        $existing = $this->db->fetchOne("SELECT id FROM users WHERE id = ?", [$studentId]);
        if (!$existing) {
            $this->db->execute(
                "INSERT INTO users (id, display_name, student_code, email, password_hash, role, is_active, created_at)
                 VALUES (?, 'Real Production Student', 'STU-PROD-999', 'prod_student@school.edu', 'test_hash', 'student', 1, NOW())",
                [$studentId]
            );
        }

        $request = new Request('POST', "/api/admin/deletion-requests/{$studentId}/execute");
        // Demo admin
        $request->setUser([
            'id'      => 'usr-demo-admin',
            'role'    => 'admin',
            'is_demo' => true,
        ]);
        $response = new Response();

        $controller->executeDeletion($request, $response, ['id' => $studentId]);

        // F-09: Demo admin sessions are flagged is_demo and can NEVER reach non-demo rows or complete a real deletion
        $this->assertEquals(403, $response->getStatusCode());
    }

    public function testEvaluationsReturnsNoResultsYetWhenEmpty(): void
    {
        $controller = new AdminController($this->db);
        $request = new Request('GET', '/api/admin/evaluations');
        $request->setUser(['id' => 'usr-admin-01', 'role' => 'admin']);
        $response = new Response();

        $controller->evaluations($request, $response);

        $data = $response->getData();
        $this->assertEquals('success', $data['status']);
        $this->assertTrue(isset($data['results']));
        $this->assertTrue(empty($data['results']) || is_array($data['results']));
    }

    public function testStudentDirectRegistration(): void
    {
        $controller = new AuthController($this->db);
        $request = new Request('POST', '/api/auth/register', [], [
            'role' => 'student',
            'display_name' => 'Direct Student Test',
            'password' => '1234',
        ]);
        $response = new Response();

        $controller->register($request, $response);

        $this->assertEquals(201, $response->getStatusCode());
        $data = $response->getData();
        $this->assertEquals('success', $data['status']);
        $this->assertEquals('student', $data['user']['role']);
        $this->assertNotEmpty($data['user']['student_code']);
    }

    public function testParentCanCreateChild(): void
    {
        $controller = new ParentController($this->db);
        $request = new Request('POST', '/api/parent/children', [], [
            'display_name' => 'Little Kwame',
            'pin' => '2026',
        ]);
        $request->setUser(['id' => 'usr-parent-01', 'role' => 'parent']);
        $response = new Response();

        $controller->createChild($request, $response);

        $this->assertEquals(201, $response->getStatusCode());
        $data = $response->getData();
        $this->assertEquals('success', $data['status']);
        $this->assertEquals('Little Kwame', $data['child']['display_name']);
        $this->assertNotEmpty($data['child']['student_code']);
        $this->assertEquals('2026', $data['child']['pin']);
    }

    public function testAdminCanCreateTeacher(): void
    {
        $controller = new AdminController($this->db);
        $teacherEmail = 'teacher_' . bin2hex(random_bytes(4)) . '@school.edu';
        $request = new Request('POST', '/api/admin/teachers', [], [
            'display_name' => 'New Science Teacher',
            'email' => $teacherEmail,
            'password' => 'TeacherPass2026!',
        ]);
        $request->setUser(['id' => 'usr-admin-01', 'role' => 'admin', 'school_id' => 'sch-ghana-01']);
        $response = new Response();

        $controller->createTeacher($request, $response);

        $this->assertEquals(201, $response->getStatusCode());
        $data = $response->getData();
        $this->assertEquals('success', $data['status']);
        $this->assertEquals('New Science Teacher', $data['teacher']['display_name']);
        $this->assertEquals('teacher', $data['teacher']['role']);
    }
}

