<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header('Content-Type: application/json');

// Test data
$testData = [
    'test' => true,
    'message' => 'JSON is working',
    'timestamp' => time(),
    'php_version' => PHP_VERSION,
    'json_extension' => extension_loaded('json') ? 'Loaded' : 'Not Loaded'
];

// Output JSON
echo json_encode($testData);
?> 