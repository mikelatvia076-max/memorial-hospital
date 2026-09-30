// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// ADMIN DASHBOARD JAVASCRIPT (UPDATED)
// =======================================

// ===============================
// GET HOSPITAL DATA & METRICS
// ===============================

async function loadHospitalData() {
    let patients = [];
    let patientCount = 0;
    let doctors = [];
    let nurses = [];
    let appointments = [];

    // Fetch all records asynchronously with robust individual error isolation
    try {
        const [pRes, pCountRes, dRes, nRes, aRes] = await Promise.all([
            fetch("http://localhost:5000/patients"),
            fetch("http://localhost:5000/api/patients/count"),
            fetch("http://localhost:5000/doctors"),
            fetch("http://localhost:5000/nurses"),
            fetch("http://localhost:5000/appointments")
        ]);

        if (pRes.ok) {
            patients = await pRes.json();
            patientCount = patients.length;
        }

        if (pCountRes.ok) {
            const countData = await pCountRes.json();
            if (Array.isArray(countData) && countData.length > 0) {
                patientCount = countData[0].totalPatients || countData[0].count || patientCount;
            } else if (countData && countData.totalPatients !== undefined) {
                patientCount = countData.totalPatients;
            } else if (countData && countData.count !== undefined) {
                patientCount = countData.count;
            }
        }

        if (dRes.ok) doctors = await dRes.json();
        if (nRes.ok) nurses = await nRes.json();
        if (aRes.ok) appointments = await aRes.json();

    } catch (err) {
        console.log("Error loading MySQL metrics:", err);
    }

    // Update UI Metric Counters
    countUp("patients", patientCount);
    countUp("doctors", doctors.length);
    countUp("nurses", nurses.length);
    countUp("appointments", appointments.length);

    // ===============================
    // POPULATE APPOINTMENTS TABLE
    // ===============================

    let appointmentTable = document.getElementById("appointmentTable");

    if (appointmentTable) {
        appointmentTable.innerHTML = "";

        if (appointments.length === 0) {
            appointmentTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #777;">
                        No patient appointments received
                    </td>
                </tr>
            `;
        } else {
            appointments.forEach((app) => {
                let row = document.createElement("tr");

                row.innerHTML = `
                    <td>${app.patient_name || app.patient || "Unknown"}</td>
                    <td>${app.staff || "Not Assigned"}</td>
                    <td>${app.department || "Not Selected"}</td>
                    <td>${app.date || ""}<br>${app.time || ""}</td>
                    <td><span class="status-badge ${String(app.status || "Pending").toLowerCase()}">${app.status || "Pending"}</span></td>
                    <td style="text-align: center;">
                        <button class="btn-delete" data-id="${app.id}" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: background 0.2s;">
                            Delete
                        </button>
                    </td>
                `;

                // Row click triggers full modal/alert breakdown
                row.addEventListener("click", (e) => {
                    if (e.target.classList.contains("btn-delete")) return;
                    alert(
                        "Appointment Details\n\n" +
                        "Patient: " + (app.patient_name || app.patient || "N/A") + "\n" +
                        "Medical Staff: " + (app.staff || "N/A") + "\n" +
                        "Department: " + (app.department || "N/A") + "\n" +
                        "Date: " + (app.date || "N/A") + "\n" +
                        "Time: " + (app.time || "N/A") + "\n" +
                        "Reason: " + (app.reason || "N/A") + "\n" +
                        "Status: " + (app.status || "Pending")
                    );
                });

                // Attach event listener directly to delete button
                let deleteBtn = row.querySelector(".btn-delete");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        deleteHospitalAppointment(app.id);
                    });
                }

                appointmentTable.appendChild(row);
            });
        }
    }
}


// ===============================
// ANIMATED COUNTERS ENGINE
// ===============================

function countUp(id, target) {
    let element = document.getElementById(id);
    if (!element) return;

    let number = 0;
    let step = Math.max(1, Math.ceil(target / 50));

    let counter = setInterval(() => {
        number += step;
        if (number >= target) {
            number = target;
            clearInterval(counter);
        }
        element.innerHTML = number;
    }, 20);
}


// =======================================
// DELETE HOSPITAL APPOINTMENT
// =======================================

async function deleteHospitalAppointment(appointmentId) {
    let confirmDelete = confirm("Are you sure you want to delete this appointment from the hospital view?");
    if (!confirmDelete) return;

    try {
        const response = await fetch("http://localhost:5000/hospital-delete-appointment/" + appointmentId, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Appointment deleted successfully from hospital view");
            loadHospitalData();
            updateHospitalNotifications();
        } else {
            alert("Failed to delete appointment");
        }
    } catch (err) {
        console.error("Error deleting appointment:", err);
        alert("Server error while deleting appointment");
    }
}

// Initial Data Load
loadHospitalData();


// ===============================
// SIDEBAR ACTIVE NAVIGATION
// ===============================

let menuItems = document.querySelectorAll(".sidebar li");

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(menu => {
            menu.classList.remove("active");
        });
        item.classList.add("active");
    });
});


// ===============================
// SEARCH / FILTER APPOINTMENTS
// ===============================

let search = document.getElementById("search");

if (search) {
    search.addEventListener("keyup", () => {
        let value = search.value.toLowerCase();
        let rows = document.querySelectorAll("#appointmentTable tr");

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


// ===============================
// HEADER NOTIFICATIONS MODAL
// ===============================

let notification = document.querySelector(".fa-bell");

if (notification) {
    notification.addEventListener("click", async () => {
        let appointments = [];
        try {
            const response = await fetch("http://localhost:5000/appointments");
            if (response.ok) appointments = await response.json();
        } catch (e) {}

        alert(
            "Agnes Memorial Notifications\n\n" +
            "✔ " + appointments.length + " Total Appointments\n" +
            "✔ New patient appointments received\n" +
            "✔ Pending approvals available\n" +
            "✔ Laboratory updates synchronized\n" +
            "✔ Pharmacy records active"
        );
    });
}


// =======================================
// HOSPITAL NOTIFICATION BADGE COUNT
// =======================================

async function updateHospitalNotifications() {
    let hospitalNotifications = [];

    try {
        const response = await fetch("http://localhost:5000/appointments");
        if (response.ok) {
            const data = await response.json();
            hospitalNotifications = data.filter(a => a.status === "Pending");
        }
    } catch (e) {}

    let count = hospitalNotifications.length;
    let badge = document.getElementById("hospitalNotificationCount");

    if (badge) {
        badge.innerHTML = count;
        if (count > 0) {
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }
    }
}

updateHospitalNotifications();


// ===============================
// REAL-TIME CLOCK WIDGET
// ===============================

let clock = document.createElement("div");
clock.style.fontWeight = "bold";
clock.style.marginLeft = "auto";
clock.style.color = "#333";

let topbar = document.querySelector(".topbar");

if (topbar) {
    topbar.appendChild(clock);
}

function updateTime() {
    let now = new Date();
    clock.innerHTML = now.toLocaleDateString() + " " + now.toLocaleTimeString();
}

setInterval(updateTime, 1000);
updateTime();


// ===============================
// ADMIN SESSION LOGOUT
// ===============================

let logout = [...menuItems].find(item => item.innerText.includes("Logout"));

if (logout) {
    logout.addEventListener("click", () => {
        let confirmLogout = confirm("Do you want to logout?");
        if (confirmLogout) {
            sessionStorage.removeItem("currentUser");
            alert("Logged out successfully");
            window.location.href = "login.html";
        }
    });
}