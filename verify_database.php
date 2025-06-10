<?php
// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Database Verification Report</h2>";

// 1. Check Database Connection
echo "<h3>1. Database Connection Test</h3>";
try {
    require_once 'db_config.php';
    
    if ($conn === null) {
        throw new Exception("Database connection failed");
    }
    
    echo "<p style='color: green;'>✓ Database connection successful</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Database connection failed: " . $e->getMessage() . "</p>";
    exit;
}

// 2. Check Database Existence
echo "<h3>2. Database Existence Test</h3>";
try {
    $result = $conn->query("SELECT DATABASE()");
    $row = $result->fetch_row();
    $database = $row[0];
    
    if ($database === 'sgpa_calculator') {
        echo "<p style='color: green;'>✓ Database 'sgpa_calculator' exists and is selected</p>";
    } else {
        echo "<p style='color: red;'>✗ Database 'sgpa_calculator' not found or not selected</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error checking database: " . $e->getMessage() . "</p>";
}

// 3. Check Table Structure
echo "<h3>3. Table Structure Test</h3>";
try {
    $result = $conn->query("SHOW TABLES LIKE 'sgpa_records'");
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>✓ Table 'sgpa_records' exists</p>";
        
        // Check table structure
        $result = $conn->query("DESCRIBE sgpa_records");
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "<td>" . $row['Extra'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: red;'>✗ Table 'sgpa_records' does not exist</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error checking table structure: " . $e->getMessage() . "</p>";
}

// 4. Test Data Insertion
echo "<h3>4. Test Data Insertion</h3>";
try {
    $testData = [
        'student_name' => 'Test Student',
        'roll_number' => 'TEST001',
        'semester' => '1',
        'sgpa' => 8.5,
        'subjects' => json_encode(['Test Subject']),
        'credits' => json_encode([3]),
        'grades' => json_encode([8.5])
    ];
    
    $stmt = $conn->prepare("INSERT INTO sgpa_records (student_name, roll_number, semester, sgpa, subjects, credits, grades) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssdsdd", 
        $testData['student_name'],
        $testData['roll_number'],
        $testData['semester'],
        $testData['sgpa'],
        $testData['subjects'],
        $testData['credits'],
        $testData['grades']
    );
    
    if ($stmt->execute()) {
        echo "<p style='color: green;'>✓ Test data inserted successfully</p>";
        
        // Verify the inserted data
        $result = $conn->query("SELECT * FROM sgpa_records WHERE roll_number = 'TEST001'");
        if ($row = $result->fetch_assoc()) {
            echo "<p style='color: green;'>✓ Test data verified in database</p>";
            
            // Clean up test data
            $conn->query("DELETE FROM sgpa_records WHERE roll_number = 'TEST001'");
            echo "<p style='color: green;'>✓ Test data cleaned up</p>";
        }
    } else {
        echo "<p style='color: red;'>✗ Failed to insert test data: " . $stmt->error . "</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error during test data insertion: " . $e->getMessage() . "</p>";
}

// 5. Check PHP Configuration
echo "<h3>5. PHP Configuration</h3>";
echo "<ul>";
echo "<li>PHP Version: " . PHP_VERSION . "</li>";
echo "<li>MySQL Extension: " . (extension_loaded('mysqli') ? 'Loaded' : 'Not Loaded') . "</li>";
echo "<li>JSON Extension: " . (extension_loaded('json') ? 'Loaded' : 'Not Loaded') . "</li>";
echo "</ul>";

// Close connection
$conn->close();
?> 