<?php
// Prevent any output before headers
ob_start();

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Set JSON header
header('Content-Type: application/json');

// Function to calculate SGPA
function calculateSGPA($subjects, $credits, $grades) {
    $totalCredits = 0;
    $totalGradePoints = 0;

    for ($i = 0; $i < count($subjects); $i++) {
        $credit = intval($credits[$i]);
        $gradePoint = floatval($grades[$i]);
        
        // Validate credit range
        if ($credit < 1 || $credit > 5) {
            throw new Exception('Invalid credit value. Credits must be between 1 and 5.');
        }

        // Validate grade point
        $validGrades = [10.0, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 0.0];
        if (!in_array($gradePoint, $validGrades)) {
            throw new Exception('Invalid grade point value: ' . $gradePoint);
        }
        
        $totalCredits += $credit;
        $totalGradePoints += ($credit * $gradePoint);
    }

    if ($totalCredits === 0) {
        return 0;
    }

    return $totalGradePoints / $totalCredits;
}

// Function to save to database
function saveToDatabase($studentName, $rollNumber, $semester, $sgpa, $subjects, $credits, $grades) {
    try {
        if (!file_exists('db_config.php')) {
            return false;
        }
        
        require_once 'db_config.php';
        
        if ($conn === null) {
            return false;
        }

        $stmt = $conn->prepare("INSERT INTO sgpa_records (student_name, roll_number, semester, sgpa, subjects, credits, grades) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $subjectsJson = json_encode($subjects);
        $creditsJson = json_encode($credits);
        $gradesJson = json_encode($grades);
        
        $stmt->bind_param("sssdsdd", $studentName, $rollNumber, $semester, $sgpa, $subjectsJson, $creditsJson, $gradesJson);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        return true;
    } catch (Exception $e) {
        error_log("Database Error: " . $e->getMessage());
        return false;
    }
}

// Main execution
try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Log received data for debugging
    error_log("Received POST data: " . print_r($_POST, true));

    // Validate input
    if (!isset($_POST['studentName']) || !isset($_POST['rollNumber']) || 
        !isset($_POST['semester']) || !isset($_POST['subjects']) || 
        !isset($_POST['credits']) || !isset($_POST['grades'])) {
        throw new Exception('Missing required fields');
    }

    $studentName = trim($_POST['studentName']);
    $rollNumber = trim($_POST['rollNumber']);
    $semester = trim($_POST['semester']);
    $subjects = $_POST['subjects'];
    $credits = $_POST['credits'];
    $grades = $_POST['grades'];

    // Validate student name
    if (empty($studentName)) {
        throw new Exception('Student name is required');
    }

    // Validate roll number
    if (empty($rollNumber)) {
        throw new Exception('Roll number is required');
    }

    // Validate semester
    if (empty($semester)) {
        throw new Exception('Semester is required');
    }

    // Validate arrays
    if (count($subjects) !== count($credits) || count($subjects) !== count($grades)) {
        throw new Exception('Invalid subject data');
    }

    // Calculate SGPA
    $sgpa = calculateSGPA($subjects, $credits, $grades);

    // Prepare grade points for display
    $gradePoints = array_map(function($grade) {
        return number_format((float)$grade, 2);
    }, $grades);

    // Calculate total credits
    $totalCredits = array_sum($credits);

    // Try to save to database
    $saved = saveToDatabase($studentName, $rollNumber, $semester, $sgpa, $subjects, $credits, $grades);

    // Clear any previous output
    ob_clean();

    // Return success response
    echo json_encode([
        'success' => true,
        'studentName' => $studentName,
        'rollNumber' => $rollNumber,
        'semester' => $semester,
        'sgpa' => number_format($sgpa, 2),
        'subjects' => $subjects,
        'credits' => $credits,
        'grades' => $grades,
        'gradePoints' => $gradePoints,
        'totalCredits' => $totalCredits,
        'saved' => $saved
    ]);

} catch (Exception $e) {
    // Log the error
    error_log("SGPA Calculator Error: " . $e->getMessage());
    
    // Clear any previous output
    ob_clean();
    
    // Return error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 