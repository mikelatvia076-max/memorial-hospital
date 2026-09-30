// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// HOSPITAL NOTIFICATION SYSTEM (MySQL API)
// ======================================

const API_BASE_URL = "http://localhost:5000";
let notifications = [];
let syncInterval = null;

// Helper: Prevent XSS when injecting strings into innerHTML
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 1. Update Badge Counter safely in DOM
function updateBadgeUI() {
    const badge = document.getElementById("notificationCount") || 
                  document.querySelector(".badge");

    if (!badge) return;

    if (!Array.isArray(notifications) || notifications.length === 0) {
        badge.textContent = "0";
        badge.style.display = "none";
        return;
    }

    // Filter unread notifications
    const unreadCount = notifications.filter(n => {
        if (n.status) {
            return n.status.toLowerCase() === "unread";
        }
        return n.is_read === 0 || n.is_read === "0" || !n.is_read;
    }).length;

    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "inline-block" : "none";
}

// 2. Fetch all hospital notifications from Express backend
async function fetchNotifications() {
    const notificationList = document.getElementById("hospitalNotificationList");

    try {
        const response = await fetch(`${API_BASE_URL}/hospital-notifications`, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        notifications = Array.isArray(data) ? data : [];

        if (notificationList) {
            renderNotifications(notifications);
        }

        updateBadgeUI();

    } catch (error) {
        console.error("Error loading notifications from server:", error);
        notifications = [];
        updateBadgeUI();

        if (notificationList) {
            notificationList.innerHTML = `<h3 style="color: red;">Failed to load notifications from server.</h3>`;
        }
    }
}

// 3. Render Notifications in the DOM using Event Delegation
function renderNotifications(dataList) {
    const notificationList = document.getElementById("hospitalNotificationList");
    if (!notificationList) return;

    notificationList.innerHTML = "";

    if (!Array.isArray(dataList) || dataList.length === 0) {
        notificationList.innerHTML = `<h3>No new hospital notifications</h3>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    dataList.forEach((notification) => {
        const div = document.createElement("div");

        // Determine read status safely
        let isRead = false;
        if (notification.status) {
            isRead = notification.status.toLowerCase() === "read";
        } else {
            isRead = Number(notification.is_read) === 1 || notification.read === true;
        }

        div.className = `notification-card ${isRead ? "read" : "unread"}`;

        const rawTitle = notification.type || notification.title || "Appointment Request";
        const rawName = notification.patient_name || "N/A";
        const rawStaff = notification.staff || "Unassigned";
        
        let dateStr = notification.date || notification.created_at || "N/A";
        if (notification.time && !notification.created_at) {
            dateStr += ` at ${notification.time}`;
        }

        div.innerHTML = `
            <h2>
                <i class="fa-solid fa-calendar-check"></i>
                ${escapeHTML(rawTitle)}
            </h2>

            <p>
                Patient Name: ${escapeHTML(rawName)}<br>
                Assigned Staff: ${escapeHTML(rawStaff)}
            </p>

            <small>${escapeHTML(dateStr)}</small>

            <div class="notification-actions">
                <button class="view-btn" data-action="view" data-id="${notification.id}">
                    <i class="fa-solid fa-eye"></i> View
                </button>

                <button class="read-btn" data-action="read" data-id="${notification.id}">
                    <i class="fa-solid fa-check"></i> Mark as Read
                </button>

                <button class="delete-btn" data-action="delete" data-id="${notification.id}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>`;

        fragment.appendChild(div);
    });

    notificationList.appendChild(fragment);
}

// 4. Handle Actions via Event Delegation
function handleNotificationActions(event) {
    const target = event.target.closest("button");
    if (!target) return;

    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");

    if (!action || !id) return;

    if (action === "view") viewNotification(id);
    if (action === "read") markAsRead(id);
    if (action === "delete") deleteNotification(id);
}

// 5. Delete Notification
async function deleteNotification(id) {
    notifications = notifications.filter(n => Number(n.id) !== Number(id));

    renderNotifications(notifications);
    updateBadgeUI();

    try {
        const response = await fetch(`${API_BASE_URL}/hospital-notifications/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            console.error("Server deletion failed. Refetching state...");
            fetchNotifications();
        }
    } catch (error) {
        console.error("Error deleting notification:", error);
        fetchNotifications();
    }
}

// 6. View Notification Details
function viewNotification(id) {
    const notification = notifications.find(n => Number(n.id) === Number(id));
    if (!notification) return;

    const title = notification.type || notification.title || "Appointment Request";
    const message = notification.message || 
        `Patient Name: ${notification.patient_name || 'N/A'}\nAssigned Staff: ${notification.staff || 'N/A'}`;
    let dateStr = notification.date || notification.created_at || "N/A";
    if (notification.time && !notification.created_at) dateStr += ` at ${notification.time}`;

    const modal = document.getElementById("notificationModal");
    if (modal) {
        document.getElementById("modalTitle").textContent = title;
        document.getElementById("modalBody").textContent = message;
        document.getElementById("modalDate").textContent = dateStr;
        modal.style.display = "block";
    } else {
        alert(`TITLE: ${title}\n\nDETAILS:\n${message}\n\nDATE / TIME: ${dateStr}`);
    }
}

// 7. Mark Notification as Read
async function markAsRead(id) {
    notifications = notifications.map(n => {
        if (Number(n.id) === Number(id)) {
            return { ...n, status: "read", is_read: 1, read: true };
        }
        return n;
    });

    renderNotifications(notifications);
    updateBadgeUI();

    try {
        const response = await fetch(`${API_BASE_URL}/hospital-notifications/mark-read/${id}`, {
            method: "PUT"
        });

        if (!response.ok) {
            fetchNotifications();
        }
    } catch (error) {
        console.error("Error updating notification status:", error);
        fetchNotifications();
    }
}

// 8. Navigation Back to Dashboard
function goDashboard() {
    window.location.href = "dashboard.html";
}

// ================================
// INITIALIZATION
// ================================

function init() {
    fetchNotifications();

    const notificationList = document.getElementById("hospitalNotificationList");
    if (notificationList) {
        notificationList.addEventListener("click", handleNotificationActions);
    }

    // Auto-poll notifications every 30 seconds
    if (!syncInterval) {
        syncInterval = setInterval(fetchNotifications, 30000);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}