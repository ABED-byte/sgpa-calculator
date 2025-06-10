<?php
// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'sgpa_calculator';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    error_log("Database Connection Error: " . $e->getMessage());
    $conn = null;
}

// Create table if not exists
$sql = "CREATE TABLE IF NOT EXISTS sgpa_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) NOT NULL,
    sgpa DECIMAL(4,2) NOT NULL,
    created_at DATETIME NOT NULL
)";

if (!$conn->query($sql)) {
    die("Error creating table: " . $conn->error);
}
?> 