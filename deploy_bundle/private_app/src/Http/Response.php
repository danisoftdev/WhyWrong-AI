<?php
declare(strict_types=1);

namespace WhyWrong\Http;

class Response
{
    private int $statusCode = 200;
    private array $headers = [];
    private string $content = '';
    private bool $sent = false;

    public function __construct()
    {
        $this->headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    public function setStatusCode(int $code): self
    {
        $this->statusCode = $code;
        return $this;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setHeader(string $name, string $value): self
    {
        $this->headers[$name] = $value;
        return $this;
    }

    public function json(array|object $data, int $code = 200): self
    {
        $this->statusCode = $code;
        $this->setHeader('Content-Type', 'application/json; charset=utf-8');
        $this->content = (string)json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        return $this;
    }

    public function error(string $message, string $code = 'ERROR', int $statusCode = 400, ?array $details = null): self
    {
        $payload = [
            'status' => 'error',
            'code' => $code,
            'message' => $message,
        ];
        if ($details !== null) {
            $payload['details'] = $details;
        }
        return $this->json($payload, $statusCode);
    }

    public function isSent(): bool
    {
        return $this->sent;
    }

    public function send(): void
    {
        if ($this->sent) {
            return;
        }

        if (!headers_sent()) {
            http_response_code($this->statusCode);
            foreach ($this->headers as $name => $value) {
                header("{$name}: {$value}");
            }
        }

        echo $this->content;
        $this->sent = true;
    }
}
