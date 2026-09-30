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


async function loginUser(){
 let email = document.getElementById("loginemail").value;
 let password = document.getElementById("loginpassword").value;
      if(email=="" || password==""){
       await hospitalAlert("Email or password should not be blank.", "warning", "Missing Details");
    return;
    }else{
     await hospitalAlert("Welcome back!", "success", "Login Successful");

    }
       document.getElementById("loginpage").style.display = "none";
       document.getElementById("websitepage").style.display = "block";
}

function goToLoginPage(){
     document.getElementById("frontpage").style.display = "none";
     document.getElementById("loginpage").style.display = "block";
}


function goToRegisterPage(){
document.getElementById("frontpage").style.display = "none";

document.getElementById("registerpage").style.display = "block";
}


function goToResetPage(){
document.getElementById("loginpage").style.display = "none";

document.getElementById("resetpage").style.display = "block";

}

async function goToVerifyPage(){
 let phone = document.getElementById("resetphone").value;
 let password = document.getElementById("newpassword").value;
 let newpassword = document.getElementById("oldpassword").value;
 if(phone=="" || password==""){
    await hospitalAlert("Please fill in all the fields.", "warning", "Missing Details");
    return;
}
    if(password != newpassword){
   await hospitalAlert("The two passwords must be the same.", "error", "Passwords Don't Match");
    return;
}
if(password.length <6 ){
    await hospitalAlert("Password must be at least 6 characters long.", "error", "Password Too Short");return;
}
if(phone.length <10 ){
    await hospitalAlert("Your phone number must be 10 digits long.", "error", "Invalid Phone Number");return;
}
if(!phone.startsWith("01") && !phone.startsWith("07")){
    await hospitalAlert("Your phone number must start with 01 or 07.", "error", "Invalid Phone Number");
    return;
} 
else{
    await hospitalAlert("Your one-time password has been sent.", "success", "OTP Sent");
 }
 let generatedOTP = Math.floor(Math.random() *10000);
 await hospitalAlert("Your OTP is: " + generatedOTP, "info", "Your OTP");
 
 
document.getElementById("resetpage").style.display = "none";

document.getElementById("verifypage").style.display = "block";

} 

async function returnToLoginPage(){
    let code= document.getElementById("verifycode").value;
    if(code==""){
        await hospitalAlert("Please enter the OTP to continue.", "warning", "OTP Required");
        return;
    }
    //let enterOTP = document.getElementById("verifycode").value;
   // if(enterOTP != generatedOTP){
       // alert("enter the correct otp ");
      //  return;

   // }

    else{
        await hospitalAlert("Your password was changed successfully.", "success", "Password Changed");
    }
    document.getElementById("verifypage").style.display = "none";
    document.getElementById("loginpage").style.display = "block";

}
async function backToLoginPage(){
    let firstname = document.getElementById("firstname").value;

    let last = document.getElementById("lastname").value;

    let password = document.getElementById("registerpassword").value;

    let confirm = document.getElementById("registerconfirmpassword").value;

    let email = document.getElementById("registeremail").value;

    let phone = document.getElementById("registerphone").value;

if(last==""  || password=="" || phone=="" || email=="" || confirm=="" || firstname==""){

        await hospitalAlert("Please fill in all the fields.", "warning", "Missing Details");

        return;

    }
    if(password!= confirm){
        await hospitalAlert("The two passwords must be the same.", "error", "Passwords Don't Match");
        return;
    }
    else{

        await hospitalAlert("Your account has been created. You can now log in.", "success", "Registration Successful");
    }

    document.getElementById("registerpage").style.display = "none";
     document.getElementById("loginpage").style.display = "block";
}

function showMenu() {
    let menu = document.getElementById("menu");

    if(menu.style.display === "none"){
        menu.style.display = "block";
    }else{
        menu.style.display = "none";
    }
}
function showCategory(categoryId) {

    let categories = document.getElementsByClassName("category");

    for (let i = 0; i < categories.length; i++) {
        categories[i].style.display = "none";
    }

    document.getElementById(categoryId).style.display = "block";
}