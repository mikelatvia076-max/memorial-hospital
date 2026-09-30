// =====================================================
// DECORATED POPUPS (replaces the plain browser popups)
//  hospitalAlert   (message, type, title)  -> Promise
//  hospitalConfirm (message, options)      -> Promise true/false
//  hospitalDetails (title, rows, options)  -> Promise
//  hospitalToast   (message, type)         -> small corner notice
//  types: success | error | warning | info
// =====================================================

(function () {

    if (window.hospitalDetails) return;

    const ICONS = { success: "\u2713", error: "\u2715", warning: "!", info: "i" };
    const COLORS = { success: "#16a34a", error: "#dc2626", warning: "#d97706", info: "#0284c7" };
    const TITLES = { success: "Success", error: "Something went wrong", warning: "Please check", info: "Notice" };

    const css = `
    .ha-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999;font-family:Arial,sans-serif;animation:ha-fade .2s ease}
    .ha-box{position:relative;background:#fff;width:100%;max-width:400px;border-radius:18px;padding:0 24px 24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);animation:ha-pop .28s cubic-bezier(.2,1.2,.4,1)}
    .ha-wide{max-width:470px}
    .ha-icon{width:68px;height:68px;margin:-34px auto 14px;border-radius:50%;background:var(--ha-color);color:#fff;font-size:34px;font-weight:bold;line-height:1;display:flex;align-items:center;justify-content:center;border:5px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,.25)}
    .ha-title{margin:0 0 8px;font-size:20px;color:#0f172a}
    .ha-msg{margin:0 0 22px;font-size:15px;line-height:1.5;color:#475569;white-space:pre-line;word-break:break-word}
    .ha-sub{margin-bottom:14px;font-size:13px}
    .ha-rows{text-align:left;max-height:50vh;overflow-y:auto;margin:0 0 20px;border:1px solid #e2e8f0;border-radius:12px}
    .ha-row{display:flex;gap:12px;padding:10px 14px;border-bottom:1px solid #eef2f7;font-size:14px}
    .ha-row:last-child{border-bottom:none}
    .ha-row:nth-child(even){background:#f8fafc}
    .ha-label{flex:0 0 38%;color:#64748b;font-weight:bold}
    .ha-value{flex:1;color:#0f172a;white-space:pre-wrap;word-break:break-word}
    .ha-actions{display:flex;gap:10px;justify-content:center}
    .ha-btn{flex:1;max-width:170px;padding:12px 18px;border:none;border-radius:25px;font-size:15px;font-weight:bold;cursor:pointer;transition:transform .15s,opacity .15s}
    .ha-btn:hover{transform:scale(1.04)}
    .ha-btn:focus-visible{outline:3px solid rgba(2,132,199,.45);outline-offset:2px}
    .ha-btn-main{background:var(--ha-color);color:#fff}
    .ha-btn-cancel{background:#e2e8f0;color:#334155}
    .ha-toasts{position:fixed;top:18px;right:18px;display:flex;flex-direction:column;gap:10px;z-index:100000;font-family:Arial,sans-serif}
    .ha-toast{display:flex;align-items:center;gap:10px;max-width:320px;background:#fff;color:#0f172a;font-size:14px;padding:12px 16px;border-left:5px solid var(--ha-color);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:ha-slide .3s ease}
    .ha-toast-icon{flex:0 0 24px;height:24px;border-radius:50%;background:var(--ha-color);color:#fff;font-weight:bold;font-size:14px;display:flex;align-items:center;justify-content:center}
    @keyframes ha-fade{from{opacity:0}to{opacity:1}}
    @keyframes ha-pop{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:none}}
    @keyframes ha-slide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}
    @media(max-width:480px){.ha-row{flex-direction:column;gap:2px}.ha-label{flex:none}}
    @media(prefers-reduced-motion:reduce){.ha-overlay,.ha-box,.ha-toast{animation:none}}
    `;

    let closeCurrent = null;

    function addStyle() {
        if (document.getElementById("ha-style-2")) return;
        const style = document.createElement("style");
        style.id = "ha-style-2";
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
                '<div class="ha-box' + (o.rows ? " ha-wide" : "") + '" role="alertdialog" aria-modal="true" aria-labelledby="ha-title" aria-describedby="ha-msg">' +
                '<div class="ha-icon"></div>' +
                '<h3 class="ha-title" id="ha-title"></h3>' +
                '<p class="ha-msg" id="ha-msg"></p>' +
                '<div class="ha-rows"></div>' +
                '<div class="ha-actions"></div>' +
                '</div>';

            const box = overlay.firstChild;
            box.style.setProperty("--ha-color", COLORS[type]);
            box.querySelector(".ha-icon").textContent = o.icon || ICONS[type];
            box.querySelector(".ha-title").textContent = o.title || TITLES[type];

            const msgEl = box.querySelector(".ha-msg");
            msgEl.textContent = o.message || "";
            if (!o.message) msgEl.style.display = "none";
            else if (o.rows) msgEl.classList.add("ha-sub");

            const rowsEl = box.querySelector(".ha-rows");
            if (o.rows && o.rows.length) {
                o.rows.forEach(r => {
                    const row = document.createElement("div");
                    row.className = "ha-row";
                    const label = document.createElement("span");
                    label.className = "ha-label";
                    label.textContent = r[0];
                    const value = document.createElement("span");
                    value.className = "ha-value";
                    value.textContent = (r[1] === undefined || r[1] === null || r[1] === "") ? "\u2014" : r[1];
                    row.appendChild(label);
                    row.appendChild(value);
                    rowsEl.appendChild(row);
                });
            } else {
                rowsEl.remove();
            }

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

    window.hospitalDetails = function (title, rows, options) {
        options = options || {};
        return openDialog({
            title: title,
            message: options.subtitle || "",
            type: options.type || "info",
            icon: options.icon || "\u271A",
            rows: rows || [],
            okText: options.okText || "Close"
        });
    };

    window.hospitalToast = function (message, type, ms) {
        addStyle();
        const t = COLORS[type] ? type : "info";
        let holder = document.getElementById("ha-toasts");
        if (!holder) {
            holder = document.createElement("div");
            holder.id = "ha-toasts";
            holder.className = "ha-toasts";
            mount(holder);
        }
        if (Array.prototype.some.call(holder.children, c => c.dataset.msg === message)) return;
        const toast = document.createElement("div");
        toast.className = "ha-toast";
        toast.dataset.msg = message;
        toast.style.setProperty("--ha-color", COLORS[t]);
        const icon = document.createElement("span");
        icon.className = "ha-toast-icon";
        icon.textContent = ICONS[t];
        const text = document.createElement("span");
        text.textContent = message;
        toast.appendChild(icon);
        toast.appendChild(text);
        toast.onclick = () => toast.remove();
        holder.appendChild(toast);
        setTimeout(() => toast.remove(), ms || 4500);
    };

})();


// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT MANAGEMENT JAVASCRIPT
// =====================================

// SELECT ELEMENTS
const patientForm = document.getElementById("patientForm");
const patientTable = document.querySelector("#patientTable tbody");
const searchBox = document.getElementById("patientSearch");

// API Base URL
// API_URL now comes from config.js. Declaring it again here crashed the whole page
// ("Identifier API_URL has already been declared"), so the old line is kept as a comment:
// const API_URL = "http://localhost:5000";

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
            hospitalAlert("Please enter a valid phone number starting with 01 or 07 (10 digits total).", "error", "Invalid Phone Number");
            return;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(emailValue)){
            hospitalAlert("Please enter a valid email address.", "error", "Invalid Email");
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
                hospitalAlert("The patient has been registered successfully.", "success", "Patient Registered");
                patientForm.reset();
                fetchPatients(); // Reload table data from MySQL
            } else {
                hospitalAlert("Failed to register patient: " + (result.error || result.message || "Unknown error"), "error", "Registration Failed");
                console.error("Server error details:", result);
            }
        } catch (error) {
            console.error("Network error during patient registration:", error);
            hospitalAlert("We could not reach the server. Make sure the backend is running and try again.", "error", "Server Error");
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
    hospitalDetails("Patient Details", [
    ["ID", patient.patient_id || patient.id],
    ["Name", patient.name || "N/A"],
    ["Age", patient.age || "N/A"],
    ["Gender", patient.gender || "N/A"],
    ["Phone", patient.phone || "N/A"],
    ["Email", patient.email || "N/A"],
    ["Address", patient.address || "N/A"],
    ["Status", patient.status || "Active"],
    ["Registered", (patient.registered || (patient.created_at ? new Date(patient.created_at).toLocaleDateString("en-GB") : "N/A"))]
]);
}

// ================================
// DELETE PATIENT FROM MYSQL
// ================================

async function deletePatient(id) {
    let confirmDelete = await hospitalConfirm("Are you sure you want to delete this patient?", { title: "Delete Patient", confirmText: "Yes, Delete", cancelText: "Cancel", type: "error" });
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/patients/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            hospitalAlert("The patient record has been deleted.", "success", "Patient Deleted");
            fetchPatients(); // Refresh table from database
        } else {
            hospitalAlert("We could not delete the patient record. Please try again.", "error", "Delete Failed");
        }
    } catch (err) {
        console.error("Error deleting patient:", err);
        hospitalAlert("Something went wrong on the server while deleting the patient.", "error", "Server Error");
    }
}