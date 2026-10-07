<?php
/**
 * Delicious Recipe Hub - Database Connection Setup (PDO)
 * XAMPP Compatible MySQL Connection Script
 */

header('Content-Type: application/json; charset=utf-8');

$host = '127.0.0.1';
$db   = 'recipe_hub_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // If DB connection fails, return formatted error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'hint' => 'Ensure XAMPP MySQL server is active and schema.sql has been imported.'
    ]);
    exit;
}
?>
