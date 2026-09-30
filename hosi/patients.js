// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT MANAGEMENT JAVASCRIPT
// =====================================

// SELECT ELEMENTS
const patientForm = document.getElementById("patientForm");
const patientTable = document.querySelector("#patientTable tbody");
const searchBox = document.getElementById("patientSearch");

// API Base URL
const API_URL = "http://localhost:5000";

// LOAD PATIENTS ON PAGE LOAD
fetchPatients();

// ================================
// ADD NEW PATIENT
// ================================

if (patientForm) {
    patientForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        let phoneValue = document.getElementById("phone").value.trim();
        let emailValue = document.getElementById("email").value.trim();

        // Phone Validation (Kenyan format: must start with 01 or 07 and be exactly 10 digits)
        const phoneRegex = /^(01|07)[0-9]{8}$/;
        if(!phoneRegex.test(phoneValue)){
            alert("Please enter a valid phone number starting with 01 or 07 (10 digits total).");
            return;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(emailValue)){
            alert("Please enter a valid email address.");
            return;
        }

        let patientData = {
            patient_id: "AMMH" + Math.floor(Math.random() * 10000),
            name: document.getElementById("name").value,
            age: document.getElementById("age") ? document.getElementById("age").value : null,
            gender: document.getElementById("gender") ? document.getElementById("gender").value : null,
            phone: phoneValue,
            email: emailValue,
            address: document.getElementById("address") ? document.getElementById("address").value : null,
            status: "Active",
            registered: new Date().toLocaleDateString("en-GB")
        };

        try {
            const response = await fetch(`${API_URL}/patients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patientData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Patient registered successfully!");
                patientForm.reset();
                fetchPatients(); // Reload table data from MySQL
            } else {
                alert("Failed to register patient: " + (result.error || result.message || "Unknown error"));
                console.error("Server error details:", result);
            }
        } catch (error) {
            console.error("Network error during patient registration:", error);
            alert("Server error. Ensure the backend server is running.");
        }
    });
}

// ================================
// FETCH & DISPLAY PATIENTS FROM MYSQL
// ================================

async function fetchPatients() {
    if (!patientTable) return;

    try {
        const response = await fetch(`${API_URL}/patients`);
        if (response.ok) {
            let patients = await response.json();
            displayPatients(patients);
        } else {
            patientTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #e74c3c;">Failed to load patients from database</td></tr>`;
        }
    } catch (error) {
        console.error("Error fetching patients:", error);
        patientTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #e74c3c;">Server connection error</td></tr>`;
    }
}

function displayPatients(patients) {
    patientTable.innerHTML = "";

    if (!patients || patients.length === 0) {
        patientTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #777;">
                    No patients registered
                </td>
            </tr>
        `;
        return;
    }

    patients.forEach((patient) => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${patient.patient_id || patient.id}</td>
            <td>${patient.name || "Unknown"}</td>
            <td>${patient.age || "N/A"}</td>
            <td>${patient.gender || "N/A"}</td>
            <td>${patient.phone || "N/A"}</td>
            <td>
                <button class="view" onclick='viewPatient(${JSON.stringify(patient)})'>
                    View
                </button>
                <button class="delete" onclick="deletePatient(${patient.id})">
                    Delete
                </button>
            </td>
        `;

        patientTable.appendChild(row);
    });
}

// ================================
// SEARCH PATIENT
// ================================

if (searchBox) {
    searchBox.addEventListener("keyup", function () {
        let value = this.value.toLowerCase();
        let rows = document.querySelectorAll("#patientTable tbody tr");

        rows.forEach(row => {
            let text = row.innerText.toLowerCase();
            if (text.includes(value)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
}

// ================================
// VIEW PATIENT
// ================================

function viewPatient(patient) {
    alert(
        "Patient Details\n\n" +
        "ID: " + (patient.patient_id || patient.id) + "\n" +
        "Name: " + (patient.name || "N/A") + "\n" +
        "Age: " + (patient.age || "N/A") + "\n" +
        "Gender: " + (patient.gender || "N/A") + "\n" +
        "Phone: " + (patient.phone || "N/A") + "\n" +
        "Email: " + (patient.email || "N/A") + "\n" +
        "Address: " + (patient.address || "N/A") + "\n" +
        "Status: " + (patient.status || "Active") + "\n" +
        "Registered: " + (patient.registered || (patient.created_at ? new Date(patient.created_at).toLocaleDateString("en-GB") : "N/A")) + "\n"
    );
}

// ================================
// DELETE PATIENT FROM MYSQL
// ================================

async function deletePatient(id) {
    let confirmDelete = confirm("Are you sure you want to delete this patient?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/patients/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Patient deleted");
            fetchPatients(); // Refresh table from database
        } else {
            alert("Failed to delete patient record");
        }
    } catch (err) {
        console.error("Error deleting patient:", err);
        alert("Server error while deleting patient");
    }
}