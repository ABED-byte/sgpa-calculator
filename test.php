<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header('Content-Type: application/json');

// Test database connection
try {
    require_once 'db_config.php';
    
    if ($conn === null) {
        throw new Exception("Database connection failed");
    }
    
    // Test response
    echo json_encode([
        'success' => true,
        'message' => 'PHP is working correctly',
        'database' => 'Connected successfully',
        'php_version' => PHP_VERSION,
        'server' => $_SERVER['SERVER_SOFTWARE']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_details' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}
?> 