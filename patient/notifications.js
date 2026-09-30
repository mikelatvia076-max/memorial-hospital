// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT NOTIFICATIONS SYSTEM
// MYSQL VERSION
// =======================================



let notificationList =
document.getElementById("notificationList");



let currentPatient =

JSON.parse(localStorage.getItem("loggedPatient"))

||

{};




let notifications=[];





// =======================================
// LOAD NOTIFICATIONS FROM MYSQL
// =======================================


async function loadNotifications(){



if(!currentPatient.patient_id){


console.log(
"No patient logged in"
);


return;


}




try{


let response = await fetch(

"http://localhost:5000/notifications/"

+

currentPatient.patient_id

);





if(!response.ok){


throw new Error(
"Failed loading notifications"
);


}




notifications =
await response.json();





console.log(

"Patient Notifications:",

notifications

);




displayNotifications();


updateBadge();





}


catch(error){


console.log(error);



notificationList.innerHTML=`

<div class="empty">


<i class="fa-solid fa-triangle-exclamation"></i>


<h3>

Unable to load notifications

</h3>


<p>

Server connection error.

</p>


</div>

`;



}



}









// =======================================
// DISPLAY NOTIFICATIONS
// =======================================


function displayNotifications(){



if(!notificationList)return;



notificationList.innerHTML="";





if(notifications.length===0){


notificationList.innerHTML=`

<div class="empty">


<i class="fa-solid fa-bell-slash"></i>


<h3>

No Notifications Available

</h3>


<p>

You have no hospital messages.

</p>


</div>


`;

return;


}







notifications.forEach(notification=>{



let box =
document.createElement("div");



box.className =
"notification-box";





box.innerHTML=`

<h3>

<i class="fa-solid fa-hospital"></i>

${notification.title}

</h3>




<p>

${notification.message}

</p>




<small>

${notification.created_at || ""}

</small>



<div style="display: flex; gap: 10px; margin-top: 10px;">
<button

onclick="markRead(${notification.id})"

class="read-btn">


<i class="fa-solid fa-check"></i>

Mark Read


</button>

<button

onclick="deleteNotification(${notification.id})"

class="delete-btn"
style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">


<i class="fa-solid fa-trash"></i>

Delete


</button>
</div>



`;



notificationList.appendChild(box);



});



}









// =======================================
// MARK READ
// =======================================


async function markRead(id){



try{


await fetch(

"http://localhost:5000/read-notification/"

+

id,

{


method:"PUT"

}


);



loadNotifications();



}

catch(error){


console.log(error);


}



}








// =======================================
// DELETE NOTIFICATION
// =======================================


async function deleteNotification(id){



try{


await fetch(

"http://localhost:5000/notifications/"

+

id,

{


method:"DELETE"

}


);



loadNotifications();



}

catch(error){


console.log(error);


}



}








// =======================================
// UPDATE BADGE
// =======================================


function updateBadge(){



let badge =
document.getElementById(
"notificationCount"
);



if(!badge)return;




let unread =
notifications.filter(n=>

n.status !== "read"

).length;




badge.innerHTML =
unread;



if(unread>0){

badge.style.display =
"inline-flex";

}

else{

badge.style.display =
"none";

}



}









// =======================================
// BACK DASHBOARD
// =======================================


function goDashboard(){


window.location.href =
"patient-dashboard.html";


}








// START

loadNotifications();