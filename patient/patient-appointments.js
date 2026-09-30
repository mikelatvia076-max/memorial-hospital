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


// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT APPOINTMENT HISTORY
// MYSQL VERSION
// WITH CANCEL OPTION
// ======================================


const table =
document.getElementById("patientAppointments");



let currentPatient =

JSON.parse(localStorage.getItem("currentUser"))

||

JSON.parse(localStorage.getItem("loggedPatient"))

||

JSON.parse(localStorage.getItem("currentPatient"))

||

{};





let appointments = [];





// ======================================
// LOAD APPOINTMENTS FROM SERVER
// ======================================


async function loadAppointments(){


try{


if(!currentPatient.patient_id){


console.log("No patient logged in");

return;

}




let response = await fetch(

PORTAL_API + "/patient-appointments/"

+

currentPatient.patient_id

);




if(!response.ok){

throw new Error(
"Failed loading appointments"
);

}




appointments = await response.json();




console.log(
"Patient appointments:",
appointments
);




displayAppointments();



}



catch(error){


console.log(error);



table.innerHTML = `

<tr>

<td colspan="7">

Unable to load appointments

</td>

</tr>

`;



}



}









// ======================================
// DISPLAY APPOINTMENTS
// ======================================


function displayAppointments(){


table.innerHTML="";




if(appointments.length===0){



table.innerHTML=`

<tr>

<td colspan="7">

<i class="fa-solid fa-calendar-xmark"></i>

No appointments available

</td>

</tr>

`;

return;


}






appointments.forEach((appointment)=>{


let row =
document.createElement("tr");



row.innerHTML=`


<td>

${appointment.id}

</td>



<td>

${appointment.department}

</td>



<td>

${appointment.staff}

</td>



<td>

${appointment.date}

</td>



<td>

${appointment.time}

</td>



<td>


<span class="status ${appointment.status}">

${appointment.status}

</span>


</td>



<td>


${
appointment.status==="Cancelled"

?

`
<button disabled>

Cancelled

</button>
`

:

`

<button 

class="cancel-btn"

onclick="cancelAppointment(${appointment.id})">

<i class="fa-solid fa-xmark"></i>

Cancel

</button>

`

}



</td>



`;



table.appendChild(row);



});



}









// ======================================
// CANCEL APPOINTMENT
// ======================================


async function cancelAppointment(id){



let confirmCancel = await hospitalConfirm(

"Are you sure you want to cancel this appointment?",

{

title:"Cancel Appointment",

confirmText:"Yes, Cancel",

cancelText:"Keep It",

type:"warning"

}

);



if(!confirmCancel){

return;

}




try{


let response = await fetch(

PORTAL_API + "/cancel-appointment/" + id,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

}

}

);





let result =
await response.json();





if(response.ok){


loadAppointments();


await hospitalAlert("Your appointment has been cancelled successfully.", "success", "Appointment Cancelled");


}


else{


await hospitalAlert(result.message || "The appointment could not be cancelled.", "error", "Cancel Failed");

}



}



catch(error){


console.log(error);


await hospitalAlert("Something went wrong while cancelling. Please try again.", "error", "Cancel Failed");


}



}








// ======================================
// BACK DASHBOARD
// ======================================


function goDashboard(){

window.location.href=
"patient-dashboard.html";

}







// START

loadAppointments();