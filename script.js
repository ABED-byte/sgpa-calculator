document.addEventListener('DOMContentLoaded', function() {
    // Mode switching
    const modeBtns = document.querySelectorAll('.mode-btn');
    const sgpaForm = document.getElementById('sgpaForm');
    const cgpaForm = document.getElementById('cgpaForm');
    const resultDiv = document.getElementById('result');
    const cgpaResultDiv = document.getElementById('cgpaResult');

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (mode === 'sgpa') {
                sgpaForm.classList.remove('hidden');
                cgpaForm.classList.add('hidden');
                resultDiv.style.display = 'none';
                cgpaResultDiv.style.display = 'none';
            } else {
                sgpaForm.classList.add('hidden');
                cgpaForm.classList.remove('hidden');
                resultDiv.style.display = 'none';
                cgpaResultDiv.style.display = 'none';
            }
        });
    });

    // SGPA Form Handling
    const addSubjectBtn = document.getElementById('addSubject');
    const subjectsList = document.getElementById('subjectsList');

    // Show remove button for the first subject row if there are multiple rows
    updateRemoveButtons();

    // Add new subject row
    addSubjectBtn.addEventListener('click', () => {
        const subjectRow = document.createElement('div');
        subjectRow.className = 'subject-row';
        subjectRow.innerHTML = `
            <div class="form-group">
                <label>Subject Name:</label>
                <input type="text" name="subjects[]" required>
            </div>
            <div class="form-group">
                <label>Credits:</label>
                <input type="number" name="credits[]" min="1" max="5" required>
            </div>
            <div class="form-group">
                <label>Grade:</label>
                <select name="grades[]" required>
                    <option value="">Select Grade</option>
                    <option value="10.0">EX (91-100) - 10.0</option>
                    <option value="9.0">AA (86-90) - 9.0</option>
                    <option value="8.5">AB (81-85) - 8.5</option>
                    <option value="8.0">BB (76-80) - 8.0</option>
                    <option value="7.5">BC (71-75) - 7.5</option>
                    <option value="7.0">CC (66-70) - 7.0</option>
                    <option value="6.5">CD (61-65) - 6.5</option>
                    <option value="6.0">DD (56-60) - 6.0</option>
                    <option value="5.5">DE (51-55) - 5.5</option>
                    <option value="5.0">EE (40-50) - 5.0</option>
                    <option value="0.0">EF (<40) - 0.0</option>
                </select>
            </div>
            <button type="button" class="remove-btn" onclick="removeSubject(this)">×</button>
        `;
        subjectsList.appendChild(subjectRow);
        updateRemoveButtons();
    });

    // Form submission handling
    sgpaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(this);
        
        try {
            const response = await fetch('calculate.php', {
                method: 'POST',
                body: formData
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();
            
            if (data.success) {
                displaySGPAResult(data);
            } else {
                showError(data.message || 'An error occurred while calculating SGPA');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to calculate SGPA. Please try again.');
        }
    });

    function validateForm() {
        const form = document.getElementById('sgpaForm');
        const subjects = form.querySelectorAll('input[name="subjects[]"]');
        const credits = form.querySelectorAll('input[name="credits[]"]');
        const grades = form.querySelectorAll('select[name="grades[]"]');

        // Check if at least one subject is added
        if (subjects.length === 0) {
            showError('Please add at least one subject');
            return false;
        }

        // Validate each subject row
        for (let i = 0; i < subjects.length; i++) {
            if (!subjects[i].value.trim()) {
                showError('Please enter subject name for all subjects');
                return false;
            }
            if (!credits[i].value || credits[i].value < 1 || credits[i].value > 5) {
                showError('Credits must be between 1 and 5');
                return false;
            }
            if (!grades[i].value) {
                showError('Please select a grade for all subjects');
                return false;
            }
        }

        return true;
    }

    function showError(message) {
        alert(message);
    }

    function displaySGPAResult(data) {
        // Update student details
        document.getElementById('resultName').textContent = data.studentName;
        document.getElementById('resultRoll').textContent = data.rollNumber;
        document.getElementById('resultSemester').textContent = `Semester ${data.semester}`;
        document.getElementById('resultSGPA').textContent = data.sgpa;

        // Generate marksheet
        const marksheetContent = document.getElementById('marksheetContent');
        marksheetContent.innerHTML = `
            <table class="marksheet-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Credits</th>
                        <th>Grade</th>
                        <th>Grade Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.subjects.map((subject, index) => `
                        <tr>
                            <td>${subject}</td>
                            <td>${data.credits[index]}</td>
                            <td>${getGradeLetter(data.grades[index])}</td>
                            <td>${data.gradePoints[index]}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Total Credits:</strong> ${data.totalCredits}</td>
                        <td colspan="2"><strong>SGPA:</strong> ${data.sgpa}</td>
                    </tr>
                </tfoot>
            </table>
        `;

        // Show result section
        document.getElementById('result').style.display = 'block';
        document.getElementById('cgpaResult').style.display = 'none';
    }

    function getGradeLetter(gradePoint) {
        const gradeMap = {
            '10.0': 'EX',
            '9.0': 'AA',
            '8.5': 'AB',
            '8.0': 'BB',
            '7.5': 'BC',
            '7.0': 'CC',
            '6.5': 'CD',
            '6.0': 'DD',
            '5.5': 'DE',
            '5.0': 'EE',
            '0.0': 'EF'
        };
        return gradeMap[gradePoint] || gradePoint;
    }

    // CGPA Form Handling
    const addSemesterBtn = document.getElementById('addSemester');
    const semestersList = document.getElementById('semestersList');

    addSemesterBtn.addEventListener('click', () => {
        const semesterRow = document.createElement('div');
        semesterRow.className = 'semester-row';
        semesterRow.innerHTML = `
            <div class="form-group">
                <label>Semester:</label>
                <select name="semesters[]" required>
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                </select>
            </div>
            <div class="form-group">
                <label>SGPA:</label>
                <input type="number" name="sgpas[]" step="0.01" min="0" max="10" required>
            </div>
            <div class="form-group">
                <label>Total Credits:</label>
                <input type="number" name="credits[]" min="1" required>
            </div>
            <button type="button" class="remove-btn" onclick="removeSemester(this)">×</button>
        `;
        semestersList.appendChild(semesterRow);
        updateRemoveSemesterButtons();
    });

    function removeSemester(button) {
        button.parentElement.remove();
        updateRemoveSemesterButtons();
    }

    function updateRemoveSemesterButtons() {
        const removeButtons = document.querySelectorAll('#semestersList .remove-btn');
        removeButtons.forEach(btn => {
            btn.style.display = removeButtons.length > 1 ? 'flex' : 'none';
        });
    }

    // Form Submissions
    cgpaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        try {
            const response = await fetch('calculate_cgpa.php', {
                method: 'POST',
                body: formData
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }

            const data = await response.json();
            
            if (data.success) {
                displayCGPAResult(data);
            } else {
                showError(data.message || 'An error occurred while calculating CGPA');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to calculate CGPA. Please try again.');
        }
    });

    function displayCGPAResult(data) {
        document.getElementById('cgpaResultName').textContent = data.studentName;
        document.getElementById('cgpaResultRoll').textContent = data.rollNumber;
        document.getElementById('resultCGPA').textContent = data.cgpa;

        // Generate semester breakdown
        const breakdownContent = document.getElementById('breakdownContent');
        breakdownContent.innerHTML = `
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Semester</th>
                        <th>SGPA</th>
                        <th>Credits</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.semesterBreakdown.map(record => `
                        <tr>
                            <td>Semester ${record.semester}</td>
                            <td>${record.sgpa}</td>
                            <td>${record.credits}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total</strong></td>
                        <td><strong>CGPA: ${data.cgpa}</strong></td>
                        <td><strong>${data.totalCredits}</strong></td>
                    </tr>
                </tfoot>
            </table>
        `;

        resultDiv.style.display = 'none';
        cgpaResultDiv.style.display = 'block';
    }

    // Print and Download Functions
    window.printMarksheet = function() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>SGPA Marksheet</title>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        body { padding: 20px; }
                        .marksheet-table { width: 100%; border-collapse: collapse; }
                        .marksheet-table th, .marksheet-table td { 
                            padding: 10px; 
                            border: 1px solid #ddd; 
                            text-align: left; 
                        }
                        .marksheet-table th { background: #f5f5f5; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="calculator-card">
                        <h1>SGPA Marksheet</h1>
                        <div class="student-details">
                            <p><strong>Student Name:</strong> ${document.getElementById('resultName').textContent}</p>
                            <p><strong>Roll Number:</strong> ${document.getElementById('resultRoll').textContent}</p>
                            <p><strong>Semester:</strong> ${document.getElementById('resultSemester').textContent}</p>
                            <p><strong>SGPA:</strong> ${document.getElementById('resultSGPA').textContent}</p>
                        </div>
                        ${document.getElementById('marksheetContent').innerHTML}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    window.downloadMarksheet = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.text('SGPA Marksheet', 105, 20, { align: 'center' });

        // Add student details
        doc.setFontSize(12);
        doc.text(`Student Name: ${document.getElementById('resultName').textContent}`, 20, 40);
        doc.text(`Roll Number: ${document.getElementById('resultRoll').textContent}`, 20, 50);
        doc.text(`Semester: ${document.getElementById('resultSemester').textContent}`, 20, 60);
        doc.text(`SGPA: ${document.getElementById('resultSGPA').textContent}`, 20, 70);

        // Prepare table data
        const tableData = [];
        const table = document.querySelector('.marksheet-table');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            tableData.push([
                cells[0].textContent,
                cells[1].textContent,
                cells[2].textContent,
                cells[3].textContent
            ]);
        });

        // Add marksheet table
        doc.autoTable({
            startY: 90,
            head: [['Subject', 'Credits', 'Grade', 'Grade Points']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255
            }
        });

        // Save the PDF
        doc.save(`${document.getElementById('resultName').textContent}_SGPA_Report.pdf`);
    };

    window.printCGPAReport = function() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>CGPA Report</title>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        body { padding: 20px; }
                        .breakdown-table { width: 100%; border-collapse: collapse; }
                        .breakdown-table th, .breakdown-table td { 
                            padding: 10px; 
                            border: 1px solid #ddd; 
                            text-align: left; 
                        }
                        .breakdown-table th { background: #f5f5f5; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="calculator-card">
                        <h1>CGPA Report</h1>
                        <div class="student-details">
                            <p><strong>Student Name:</strong> ${document.getElementById('cgpaResultName').textContent}</p>
                            <p><strong>Roll Number:</strong> ${document.getElementById('cgpaResultRoll').textContent}</p>
                            <p><strong>CGPA:</strong> ${document.getElementById('resultCGPA').textContent}</p>
                        </div>
                        ${document.getElementById('breakdownContent').innerHTML}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    window.downloadCGPAReport = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.text('CGPA Report', 105, 20, { align: 'center' });

        // Add student details
        doc.setFontSize(12);
        doc.text(`Student Name: ${document.getElementById('cgpaResultName').textContent}`, 20, 40);
        doc.text(`Roll Number: ${document.getElementById('cgpaResultRoll').textContent}`, 20, 50);
        doc.text(`CGPA: ${document.getElementById('resultCGPA').textContent}`, 20, 60);

        // Prepare table data
        const tableData = [];
        const table = document.querySelector('.breakdown-table');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            tableData.push([
                cells[0].textContent,
                cells[1].textContent,
                cells[2].textContent
            ]);
        });

        // Add breakdown table
        doc.autoTable({
            startY: 80,
            head: [['Semester', 'SGPA', 'Credits']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255
            }
        });

        // Save the PDF
        doc.save(`${document.getElementById('cgpaResultName').textContent}_CGPA_Report.pdf`);
    };
});

// Helper functions
function removeSubject(button) {
    button.parentElement.remove();
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('#subjectsList .remove-btn');
    removeButtons.forEach(btn => {
        btn.style.display = removeButtons.length > 1 ? 'flex' : 'none';
    });
} 