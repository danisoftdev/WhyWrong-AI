<?php
declare(strict_types=1);

namespace WhyWrong\Http;

use WhyWrong\Database\Connection;

class Router
{
    private array $routes = [];
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function get(string $path, string|callable $handler, array $roles = []): void
    {
        $this->addRoute('GET', $path, $handler, $roles);
    }

    public function post(string $path, string|callable $handler, array $roles = []): void
    {
        $this->addRoute('POST', $path, $handler, $roles);
    }

    public function patch(string $path, string|callable $handler, array $roles = []): void
    {
        $this->addRoute('PATCH', $path, $handler, $roles);
    }

    public function delete(string $path, string|callable $handler, array $roles = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $roles);
    }

    private function addRoute(string $method, string $path, string|callable $handler, array $roles): void
    {
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        $regex = '#^' . $pattern . '$#';

        $this->routes[] = [
            'method'  => $method,
            'path'    => $path,
            'regex'   => $regex,
            'handler' => $handler,
            'roles'   => $roles,
        ];
    }

    public function dispatch(Request $request, Response $response): void
    {
        $reqMethod = $request->getMethod();
        $reqPath   = rtrim($request->getPath(), '/');
        if ($reqPath === '') {
            $reqPath = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $reqMethod) {
                continue;
            }

            $routePath = rtrim($route['path'], '/');
            if ($routePath === '') {
                $routePath = '/';
            }

            if (preg_match($route['regex'], $reqPath, $matches)) {
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                // Role Authorization Check
                $allowedRoles = $route['roles'];
                if (!empty($allowedRoles)) {
                    $user = $request->getUser();
                    if (!$user) {
                        $response->error('Authentication required.', 'UNAUTHORIZED', 401)->send();
                        return;
                    }
                    if (!in_array($user['role'], $allowedRoles, true)) {
                        $response->error('Forbidden: insufficient permissions for this role.', 'FORBIDDEN', 403)->send();
                        return;
                    }
                }

                $this->executeHandler($route['handler'], $request, $response, $params);
                if (!$response->isSent()) {
                    $response->send();
                }
                return;
            }
        }

        $response->error("Route not found: {$reqMethod} {$reqPath}", 'NOT_FOUND', 404)->send();
    }

    private function executeHandler(string|callable $handler, Request $request, Response $response, array $params): void
    {
        if (is_callable($handler)) {
            $handler($request, $response, $params);
            return;
        }

        [$controllerName, $action] = explode('@', $handler);
        $fullClass = "\\WhyWrong\\Controllers\\{$controllerName}";

        if (!class_exists($fullClass)) {
            $response->error("Controller {$controllerName} not found.", 'SERVER_ERROR', 500);
            return;
        }

        $controller = new $fullClass($this->db);
        if (!method_exists($controller, $action)) {
            $response->error("Action {$action} not found in {$controllerName}.", 'SERVER_ERROR', 500);
            return;
        }

        $controller->$action($request, $response, $params);
    }
}
