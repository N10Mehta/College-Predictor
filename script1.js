// Function to parse CSV data and return an array of objects
function parseCSV(data) {
    const rows = data.split('\n').slice(1); // Skip headers
    return rows
        .map(row => {
            const columns = row.split(',');
            if (columns.length < 4) return null; // Ensure there are at least 4 columns (rank, name, course, category)

            const [rank, name, course, category] = columns;
            if (!rank || !name || !course || !category) return null; // Skip rows with missing data

            return {
                name: name.trim(),
                category: category.trim().toLowerCase(), // Normalize category
                course: course.trim(),
                minRank: parseInt(rank.trim(), 10),  // Using rank as both minRank and maxRank
                maxRank: parseInt(rank.trim(), 10)   // Modify this logic if there's a range
            };
        })
        .filter(college => college !== null); // Filter out invalid rows
}

// Fetch CSV and parse it
let collegesData = [];
fetch('medical_data.csv')
    .then(response => response.text())
    .then(data => {
        collegesData = parseCSV(data);
        console.log("Colleges Data Loaded:", collegesData);
    })
    .catch(error => {
        console.error("Error loading CSV file:", error);
    });

// Function to predict colleges based on user input
function predictCollege(rank, category, course) {
    const predictedColleges = collegesData.filter(college => 
        college.category === category && 
        college.course.toLowerCase() === course.toLowerCase() && 
        rank >= college.minRank && 
        rank <= college.maxRank
    );

    return predictedColleges.length > 0 ? predictedColleges : [{ name: "No colleges found for the given criteria." }];
}

// Event listener for form submission
document.getElementById('predictionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather the input data
    const rank = parseInt(document.getElementById('rank').value, 10);
    const category = document.getElementById('category').value.toLowerCase(); // Normalize category
    const courseType = document.querySelector('input[name="courseType"]:checked').value;
    const course = document.getElementById('course').value;

    // Validate course type against selected course
    const isValidCourse = (courseType === "Medical" && ["MBBS", "Nursing", "BDS", "Pharmacy"].includes(course)) ||
                          (courseType === "Engineering" && ["Computer Science", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"].includes(course));

    if (!isValidCourse) {
        document.getElementById('results').innerHTML = `<h3>Error: Selected course does not match course type.</h3>`;
        return;
    }

    // Predict colleges
    const predictedColleges = predictCollege(rank, category, course);

    // Display the predicted colleges in the results section
    document.getElementById('results').innerHTML = `
        <h3>Predicted Colleges:</h3>
        <ul>
            ${predictedColleges.map(college => `<li>${college.name}</li>`).join('')}
        </ul>
    `;
});

// Function to filter courses based on course type
document.querySelectorAll('input[name="courseType"]').forEach((elem) => {
    elem.addEventListener('change', function() {
        const selectedCourseType = document.querySelector('input[name="courseType"]:checked').value;
        const courses = document.querySelectorAll('#course option');

        // Show only relevant courses based on selected course type
        courses.forEach((option) => {
            if (selectedCourseType === 'Engineering' && option.classList.contains('engineering')) {
                option.style.display = 'block';
            } else if (selectedCourseType === 'Medical' && option.classList.contains('medical')) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });

        // Reset the selected course if it gets hidden
        document.getElementById('course').value = '';
    });
});
