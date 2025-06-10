<?php
$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Create connection
    $conn = new mysqli($host, $username, $password);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS sgpa_calculator";
    if ($conn->query($sql) === TRUE) {
        echo "Database created successfully<br>";
    } else {
        throw new Exception("Error creating database: " . $conn->error);
    }

    // Select the database
    $conn->select_db("sgpa_calculator");

    // Create table
    $sql = "CREATE TABLE IF NOT EXISTS sgpa_records (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(50) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        sgpa DECIMAL(4,2) NOT NULL,
        subjects JSON NOT NULL,
        credits JSON NOT NULL,
        grades JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql) === TRUE) {
        echo "Table created successfully";
    } else {
        throw new Exception("Error creating table: " . $conn->error);
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?> 