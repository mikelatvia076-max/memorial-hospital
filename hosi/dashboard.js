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
            fetch(API_URL + "/patients"),
            fetch(API_URL + "/api/patients/count"),
            fetch(API_URL + "/doctors"),
            fetch(API_URL + "/nurses"),
            fetch(API_URL + "/appointments")
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
                    hospitalDetails("Appointment Details", [
                        ["Patient", app.patient_name || app.patient || "N/A"],
                        ["Medical Staff", app.staff || "N/A"],
                        ["Department", app.department || "N/A"],
                        ["Date", app.date || "N/A"],
                        ["Time", app.time || "N/A"],
                        ["Reason", app.reason || "N/A"],
                        ["Status", app.status || "Pending"]
                    ]);
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
    let confirmDelete = await hospitalConfirm("Are you sure you want to delete this appointment from the hospital view?", { title: "Delete Appointment", confirmText: "Yes, Delete", cancelText: "Cancel", type: "error" });
    if (!confirmDelete) return;

    try {
        const response = await fetch(API_URL + "/hospital-delete-appointment/" + appointmentId, {
            method: "DELETE"
        });

        if (response.ok) {
            hospitalAlert("The appointment was deleted from the hospital view.", "success", "Appointment Deleted");
            loadHospitalData();
            updateHospitalNotifications();
        } else {
            hospitalAlert("We could not delete the appointment. Please try again.", "error", "Delete Failed");
        }
    } catch (err) {
        console.error("Error deleting appointment:", err);
        hospitalAlert("Something went wrong on the server while deleting the appointment.", "error", "Server Error");
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
            const response = await fetch(API_URL + "/appointments");
            if (response.ok) appointments = await response.json();
        } catch (e) {}

        hospitalAlert(
            "\u2714 " + appointments.length + " Total Appointments\n" +
            "\u2714 New patient appointments received\n" +
            "\u2714 Pending approvals available\n" +
            "\u2714 Laboratory updates synchronized\n" +
            "\u2714 Pharmacy records active",
            "info",
            "Agnes Memorial Notifications"
        );
    });
}


// =======================================
// HOSPITAL NOTIFICATION BADGE COUNT
// =======================================

async function updateHospitalNotifications() {
    let hospitalNotifications = [];

    try {
        const response = await fetch(API_URL + "/appointments");
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
    logout.addEventListener("click", async () => {
        let confirmLogout = await hospitalConfirm("Do you want to logout?", { title: "Logout", confirmText: "Yes, Logout", cancelText: "Cancel", type: "warning" });
        if (confirmLogout) {
            sessionStorage.removeItem("currentUser");
            await hospitalAlert("You have been logged out successfully.", "success", "Logged Out");
            window.location.href = "login.html";
        }
    });
}