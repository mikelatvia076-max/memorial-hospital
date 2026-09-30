// =========================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// BOOK APPOINTMENT SYSTEM
// MYSQL + EMAILJS + NOTIFICATIONS
// =========================================


// ===============================
// API BASE URL (FIX)
// Uses API_URL from config.js if it exists (API_BASE also accepted), otherwise:
// hosted / served by server.js -> same origin ("")
// Live Server or file          -> http://localhost:5000
// ===============================

const PORTAL_API = (

    (typeof API_URL !== "undefined" && API_URL)

    ? String(API_URL).replace(/\/+$/, "")

    : (typeof API_BASE !== "undefined" && API_BASE)

    ? String(API_BASE).replace(/\/+$/, "")

    : (
        (
            (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            && location.port !== "5000"
        )
        || location.protocol === "file:"
    )
    ? "http://localhost:5000"
    : ""

);


// =====================================================
// DECORATED ALERTS (replaces the plain browser popups)
// hospitalAlert  (message, type, title) -> Promise
// hospitalConfirm (message, options)    -> Promise true/false
// types: success | error | warning | info
// =====================================================

(function () {

    if (window.hospitalAlert) return;

    const ICONS = { success: "\u2713", error: "\u2715", warning: "!", info: "i" };
    const COLORS = { success: "#16a34a", error: "#dc2626", warning: "#d97706", info: "#0284c7" };
    const TITLES = { success: "Success", error: "Something went wrong", warning: "Please check", info: "Notice" };

    const css = `
    .ha-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999;font-family:Arial,sans-serif;animation:ha-fade .2s ease}
    .ha-box{position:relative;background:#fff;width:100%;max-width:400px;border-radius:18px;padding:0 24px 24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);animation:ha-pop .28s cubic-bezier(.2,1.2,.4,1)}
    .ha-icon{width:68px;height:68px;margin:-34px auto 14px;border-radius:50%;background:var(--ha-color);color:#fff;font-size:34px;font-weight:bold;line-height:1;display:flex;align-items:center;justify-content:center;border:5px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,.25)}
    .ha-title{margin:0 0 8px;font-size:20px;color:#0f172a}
    .ha-msg{margin:0 0 22px;font-size:15px;line-height:1.5;color:#475569;white-space:pre-line;word-break:break-word}
    .ha-actions{display:flex;gap:10px;justify-content:center}
    .ha-btn{flex:1;max-width:170px;padding:12px 18px;border:none;border-radius:25px;font-size:15px;font-weight:bold;cursor:pointer;transition:transform .15s,opacity .15s}
    .ha-btn:hover{transform:scale(1.04)}
    .ha-btn:focus-visible{outline:3px solid rgba(2,132,199,.45);outline-offset:2px}
    .ha-btn-main{background:var(--ha-color);color:#fff}
    .ha-btn-cancel{background:#e2e8f0;color:#334155}
    @keyframes ha-fade{from{opacity:0}to{opacity:1}}
    @keyframes ha-pop{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:none}}
    @media(prefers-reduced-motion:reduce){.ha-overlay,.ha-box{animation:none}}
    `;

    let closeCurrent = null;

    function addStyle() {
        if (document.getElementById("ha-style")) return;
        const style = document.createElement("style");
        style.id = "ha-style";
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    function mount(el) {
        if (document.body) document.body.appendChild(el);
        else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(el));
    }

    function openDialog(o) {

        return new Promise(resolve => {

            addStyle();

            if (closeCurrent) closeCurrent(false);

            const type = COLORS[o.type] ? o.type : "info";

            const overlay = document.createElement("div");
            overlay.className = "ha-overlay";
            overlay.innerHTML =
                '<div class="ha-box" role="alertdialog" aria-modal="true" aria-labelledby="ha-title" aria-describedby="ha-msg">' +
                '<div class="ha-icon"></div>' +
                '<h3 class="ha-title" id="ha-title"></h3>' +
                '<p class="ha-msg" id="ha-msg"></p>' +
                '<div class="ha-actions"></div>' +
                '</div>';

            const box = overlay.firstChild;
            box.style.setProperty("--ha-color", COLORS[type]);
            box.querySelector(".ha-icon").textContent = o.icon || ICONS[type];
            box.querySelector(".ha-title").textContent = o.title || TITLES[type];
            box.querySelector(".ha-msg").textContent = o.message || "";

            const actions = box.querySelector(".ha-actions");

            function close(result) {
                document.removeEventListener("keydown", onKey);
                overlay.remove();
                closeCurrent = null;
                resolve(result);
            }

            function onKey(e) {
                if (e.key === "Escape") close(false);
            }

            if (o.cancelText) {
                const cancelBtn = document.createElement("button");
                cancelBtn.type = "button";
                cancelBtn.className = "ha-btn ha-btn-cancel";
                cancelBtn.textContent = o.cancelText;
                cancelBtn.onclick = () => close(false);
                actions.appendChild(cancelBtn);
            }

            const okBtn = document.createElement("button");
            okBtn.type = "button";
            okBtn.className = "ha-btn ha-btn-main";
            okBtn.textContent = o.okText || "OK";
            okBtn.onclick = () => close(true);
            actions.appendChild(okBtn);

            if (!o.cancelText) {
                overlay.addEventListener("click", e => { if (e.target === overlay) close(true); });
            }

            closeCurrent = close;
            document.addEventListener("keydown", onKey);
            mount(overlay);
            setTimeout(() => okBtn.focus(), 30);
        });
    }

    window.hospitalAlert = function (message, type, title) {
        return openDialog({ message: message, type: type || "info", title: title });
    };

    window.hospitalConfirm = function (message, options) {
        options = options || {};
        return openDialog({
            message: message,
            type: options.type || "warning",
            title: options.title || "Are you sure?",
            icon: options.icon || "?",
            okText: options.confirmText || "Yes",
            cancelText: options.cancelText || "Cancel"
        });
    };

})();


// ===============================
// ELEMENTS
// ===============================

const form = document.getElementById("appointmentForm");
const patientName = document.getElementById("patientName");
const patientID = document.getElementById("patientID");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const department = document.getElementById("department");
const staff = document.getElementById("staff");


// ===============================
// CURRENT PATIENT
// ===============================

let currentPatient =
    JSON.parse(localStorage.getItem("currentUser"))
    || JSON.parse(localStorage.getItem("loggedPatient"))
    || JSON.parse(localStorage.getItem("currentPatient"))
    || {};


// ===============================
// LOAD PATIENT DETAILS
// ===============================

function loadPatient() {

    if (!currentPatient.patient_id) {
        hospitalAlert("Please login first to book an appointment.", "warning", "Login Required").then(() => {
            window.location.href = "patient-login.html";
        });
        return;
    }

    patientName.value = currentPatient.name || "";
    patientID.value = currentPatient.patient_id || "";
    phone.value = currentPatient.phone || "";
    email.value = currentPatient.email || "";
}

loadPatient();


// ===============================
// DEPARTMENTS
// ===============================

const departments = [
    "Accident & Emergency",
    "Cardiology",
    "Dental",
    "Dermatology",
    "ENT",
    "General Medicine",
    "Gynecology",
    "Neurology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Physiotherapy",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Urology"
];

departments.forEach(dep => {
    let option = document.createElement("option");
    option.value = dep;
    option.textContent = dep;
    department.appendChild(option);
});


// =========================================
// LOAD DOCTORS FROM HOSPITAL DB
// =========================================

async function loadMedicalStaff() {

    try {

        staff.innerHTML = `<option value="">Loading doctors from hospital portal...</option>`;

        // Timeout so a sleeping Render server doesn't hang forever
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 60000);

        const doctorResponse = await fetch(PORTAL_API + "/doctors", {
            signal: controller.signal
        });

        clearTimeout(timer);

        if (!doctorResponse.ok) {
            throw new Error("Failed fetching doctors (status " + doctorResponse.status + ")");
        }

        const doctors = await doctorResponse.json();

        if (!Array.isArray(doctors)) {
            throw new Error("Unexpected doctors response");
        }

        if (doctors.length === 0) {
            staff.innerHTML = `<option value="">No doctors registered yet</option>`;
            return;
        }

        staff.innerHTML = `<option value="">Choose Doctor</option>`;

        doctors.forEach(doctor => {
            let option = document.createElement("option");
            option.value = doctor.name;
            option.textContent =
                doctor.name +
                " - Doctor (" +
                (doctor.department || "General") +
                ")";
            staff.appendChild(option);
        });

    }
    catch (error) {

        console.log("Load doctors error:", error);

        staff.innerHTML = `<option value="">Failed loading doctors - refresh the page</option>`;
    }
}

loadMedicalStaff();


// ===============================
// SUBMIT APPOINTMENT
// ===============================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    let now = new Date();
    let currentDateStr = now.toISOString().split("T")[0];
    let currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let fullTimeStamp = currentDateStr + " " + currentTimeStr;

    let appointment = {
        patient_id: currentPatient.patient_id,
        patient_name: currentPatient.name,
        email: email.value.trim(),
        phone: phone.value.trim(),
        department: department.value,
        staff: staff.value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        reason: document.getElementById("reason").value,
        status: "Pending"
    };


    // ===============================
    // VALIDATION
    // ===============================

    if (
        !appointment.department ||
        !appointment.staff ||
        !appointment.date ||
        !appointment.time ||
        !appointment.reason
    ) {
        await hospitalAlert("Please fill in all the appointment details before submitting.", "warning", "Missing Details");
        return;
    }

    // EMAIL CHECK
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(appointment.email)) {
        await hospitalAlert("Please enter a valid email address.", "error", "Invalid Email");
        return;
    }

    // PHONE CHECK
    if (!/^[0-9]+$/.test(appointment.phone)) {
        await hospitalAlert("Phone number must contain digits only.", "error", "Invalid Phone Number");
        return;
    }

    if (appointment.phone.length !== 10) {
        await hospitalAlert("Phone number must be exactly 10 digits.", "error", "Invalid Phone Number");
        return;
    }

    if (!appointment.phone.startsWith("07") && !appointment.phone.startsWith("01")) {
        await hospitalAlert("Phone number must start with 07 or 01.", "error", "Invalid Phone Number");
        return;
    }


    // ===============================
    // SAVE APPOINTMENT MYSQL
    // ===============================

    try {

        let response = await fetch(PORTAL_API + "/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointment)
        });

        let result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }


        // ===============================
        // CREATE PATIENT NOTIFICATION
        // ===============================

        await fetch(PORTAL_API + "/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patient_id: appointment.patient_id,
                title: "Appointment Submitted",
                message:
                    "Your appointment with " +
                    appointment.staff +
                    " on " +
                    appointment.date +
                    " at " +
                    appointment.time +
                    " has been received and is waiting confirmation.",
                date: currentDateStr,
                time: currentTimeStr,
                created_at: fullTimeStamp,
                user_type: "Patient"
            })
        });


        // ===============================
        // CREATE HOSPITAL/ADMIN NOTIFICATION
        // ===============================

        try {

            await fetch(PORTAL_API + "/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_id: appointment.patient_id,
                    title: "New Appointment Request",
                    message:
                        "New appointment booked by " +
                        appointment.patient_name +
                        " for " +
                        appointment.staff +
                        " on " +
                        appointment.date +
                        " at " +
                        appointment.time,
                    date: currentDateStr,
                    time: currentTimeStr,
                    created_at: fullTimeStamp,
                    user_type: "Admin"
                })
            });

            await fetch(PORTAL_API + "/hospital-notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_name: appointment.patient_name,
                    staff: appointment.staff,
                    date: appointment.date,
                    time: appointment.time,
                    created_at: fullTimeStamp,
                    type: "Appointment Request"
                })
            });

        } catch (e) {
            console.log("Hospital notification log error:", e);
        }


        // ===============================
        // EMAILJS
        // ===============================

        emailjs.send(
            "service_rn13jzs",
            "template_t2qtmhs",
            {
                patient_name: appointment.patient_name,
                to_email: appointment.email,
                department: appointment.department,
                staff: appointment.staff,
                date: appointment.date,
                time: appointment.time
            }
        )
        .then(() => {
            console.log("Email sent");
        })
        .catch(error => {
            console.log("Email error", error);
        });

        form.reset();

        loadPatient();

        await hospitalAlert("Your appointment has been booked successfully.\nA confirmation email has been sent to you.", "success", "Appointment Booked");

    }
    catch (error) {

        console.log(error);

        await hospitalAlert("We could not book your appointment. Please check your connection and try again.", "error", "Booking Failed");
    }

});