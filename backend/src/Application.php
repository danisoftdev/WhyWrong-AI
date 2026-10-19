<?php
declare(strict_types=1);

namespace WhyWrong;

use WhyWrong\Http\Request;
use WhyWrong\Http\Response;
use WhyWrong\Http\Router;
use WhyWrong\Database\Connection;
use WhyWrong\Middleware\CorsMiddleware;
use WhyWrong\Middleware\SessionMiddleware;
use WhyWrong\Middleware\CsrfMiddleware;
use WhyWrong\Middleware\RateLimiterMiddleware;
use WhyWrong\Middleware\AuthMiddleware;

/**
 * Application bootstrap: wires the request through middleware and routes.
 */
class Application
{
    private Router $router;
    private Connection $db;

    public function __construct()
    {
        $this->db     = Connection::getInstance();
        $this->router = new Router($this->db);
        $this->registerRoutes();
    }

    public function run(): void
    {
        $request  = Request::fromGlobals();
        $response = new Response();

        // Run middleware pipeline
        $pipeline = [
            new CorsMiddleware(),
            new SessionMiddleware(),
            new RateLimiterMiddleware($this->db),
            new CsrfMiddleware(),
            new AuthMiddleware($this->db),
        ];

        foreach ($pipeline as $middleware) {
            $result = $middleware->handle($request, $response);
            if ($result instanceof Response && $result->isSent()) {
                return;
            }
        }

        // Dispatch route
        $this->router->dispatch($request, $response);
    }

    private function registerRoutes(): void
    {
        $r = $this->router;

        // Health
        $r->get('/api/health',             'HealthController@status',   roles: []);

        // Auth & Registration
        $r->post('/api/auth/login',        'AuthController@login',          roles: []);
        $r->post('/api/auth/register',     'AuthController@register',       roles: []);
        $r->post('/api/auth/logout',       'AuthController@logout',         roles: ['student','teacher','parent','admin']);
        $r->get('/api/auth/me',            'AuthController@me',             roles: []);

        // Demo
        $r->post('/api/demo/session',      'DemoController@session',        roles: []);

        // Subjects (public catalog for dashboard)
        $r->get('/api/subjects',           'SubjectController@list',        roles: []);

        // Attempts
        $r->post('/api/attempts',          'AttemptController@store',       roles: ['student']);

        // Diagnoses
        $r->post('/api/diagnoses',         'DiagnosisController@store',      roles: ['student']);
        $r->get('/api/diagnoses/{id}',     'DiagnosisController@show',       roles: ['student','teacher','parent']);
        $r->post('/api/diagnoses/{id}/probes',     'ProbeController@generate',      roles: ['student']);
        $r->post('/api/diagnoses/{id}/remediation','RemediationController@generate', roles: ['student']);
        $r->post('/api/diagnoses/{id}/retests',    'RetestController@schedule',     roles: ['student','teacher']);
        $r->patch('/api/diagnoses/{id}/review',    'ReviewController@decide',       roles: ['teacher']);
        $r->get('/api/diagnoses/{id}/events',      'AgentEventController@list',     roles: ['student','teacher']);

        // Probes
        $r->post('/api/probes/{id}/responses', 'ProbeController@respond',   roles: ['student']);

        // Classes & Roster
        $r->get('/api/classes',            'ClassController@list',          roles: ['teacher']);
        $r->post('/api/classes',           'ClassController@store',         roles: ['teacher']);
        $r->get('/api/classes/{id}/heatmap', 'ClassController@heatmap',     roles: ['teacher']);
        $r->post('/api/classes/{id}/roster', 'ClassController@roster',      roles: ['teacher']);

        // Students & Link Codes
        $r->post('/api/students/{id}/link-codes', 'LinkCodeController@generate',   roles: ['teacher']);
        $r->post('/api/students/{id}/reset-pin',  'AuthController@resetStudentPin', roles: ['teacher','admin']);

        // Parent
        $r->post('/api/parent/link',                'ParentController@link',          roles: ['parent']);
        $r->get('/api/parent/children',             'ParentController@children',      roles: ['parent']);
        $r->post('/api/parent/children',            'ParentController@createChild',   roles: ['parent']);
        $r->get('/api/parent/children/{id}/summary', 'ParentController@summary',      roles: ['parent']);
        $r->post('/api/parent/children/{id}/revoke', 'ParentController@revoke',       roles: ['parent']);

        // Reports
        $r->get('/api/reports/{id}/pdf',            'ReportController@pdf',           roles: ['teacher','parent']);

        // Administrator Routes
        $r->get('/api/admin/users',                         'AdminController@users',                 roles: ['admin']);
        $r->post('/api/admin/teachers',                     'AdminController@createTeacher',         roles: ['admin']);
        $r->get('/api/admin/ai-health',                     'AdminController@aiHealth',              roles: ['admin']);
        $r->get('/api/admin/audit-logs',                    'AdminController@auditLogs',             roles: ['admin']);
        $r->get('/api/admin/evaluations',                   'AdminController@evaluations',           roles: ['admin']);
        $r->post('/api/admin/deletion-requests',             'AdminController@createDeletionRequest', roles: ['admin']);
        $r->post('/api/admin/deletion-requests/{id}/execute','AdminController@executeDeletion',       roles: ['admin']);

        // AI health (public status)
        $r->get('/api/ai/health',                   'AiHealthController@status',      roles: []);
    }
}
