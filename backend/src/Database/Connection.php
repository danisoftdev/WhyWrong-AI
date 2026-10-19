<?php
declare(strict_types=1);

namespace WhyWrong\Database;

use PDO;
use PDOException;

/**
 * Database connection singleton using PDO + MySQL.
 * All queries use prepared statements — NO string interpolation in SQL.
 */
class Connection
{
    private static ?Connection $instance = null;
    private PDO $pdo;

    private function __construct()
    {
        $host    = $_ENV['DB_HOST']    ?? 'localhost';
        $port    = $_ENV['DB_PORT']    ?? '3306';
        $dbname  = $_ENV['DB_NAME']    ?? 'whywrong';
        $user    = $_ENV['DB_USER']    ?? '';
        $pass    = $_ENV['DB_PASS']    ?? '';

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";

        try {
            $this->pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ]);
        } catch (PDOException $e) {
            // Never expose connection details to the client
            error_log('[WhyWrong] DB connection failed: ' . $e->getMessage());
            throw new \RuntimeException('Database unavailable.', 503);
        }
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getPdo(): PDO
    {
        return $this->pdo;
    }

    /**
     * Execute a prepared statement and return all rows.
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Execute a prepared statement and return a single row or null.
     */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    /**
     * Execute a prepared statement (INSERT / UPDATE / DELETE).
     * Returns the number of affected rows.
     */
    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * Return the last insert ID (use only for numeric PKs; prefer UUIDs).
     */
    public function lastInsertId(): string
    {
        return $this->pdo->lastInsertId();
    }

    public function beginTransaction(): void { $this->pdo->beginTransaction(); }
    public function commit(): void           { $this->pdo->commit(); }
    public function rollBack(): void         { $this->pdo->rollBack(); }
}
