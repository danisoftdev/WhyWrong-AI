<?php
declare(strict_types=1);

namespace WhyWrong\Http;

class Request
{
    private string $method;
    private string $path;
    private array $queryParams;
    private array $body;
    private array $headers;
    private ?array $user = null;

    public function __construct(string $method, string $path, array $queryParams = [], array $body = [], array $headers = [])
    {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->queryParams = $queryParams;
        $this->body = $body;
        $this->headers = $headers;
    }

    public static function fromGlobals(): self
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headerName = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$headerName] = $value;
            }
        }

        $body = [];
        $rawInput = file_get_contents('php://input');
        if (!empty($rawInput)) {
            $json = json_decode($rawInput, true);
            if (is_array($json)) {
                $body = $json;
            }
        } elseif (!empty($_POST)) {
            $body = $_POST;
        }

        return new self($method, $path, $_GET, $body, $headers);
    }

    public function getMethod(): string { return $this->method; }
    public function getPath(): string { return $this->path; }
    public function getQueryParams(): array { return $this->queryParams; }
    public function getQuery(string $key, mixed $default = null): mixed { return $this->queryParams[$key] ?? $default; }
    public function getBody(): array { return $this->body; }
    public function setBody(array $body): self { $this->body = $body; return $this; }
    public function get(string $key, mixed $default = null): mixed { return $this->body[$key] ?? $this->queryParams[$key] ?? $default; }
    public function getHeader(string $name, ?string $default = null): ?string { return $this->headers[strtolower($name)] ?? $default; }
    public function header(string $name, ?string $default = null): ?string { return $this->getHeader($name, $default); }

    public function setUser(?array $user): void { $this->user = $user; }
    public function getUser(): ?array { return $this->user; }
    public function getUserId(): ?string { return $this->user['id'] ?? null; }
    public function getUserRole(): ?string { return $this->user['role'] ?? null; }
}
