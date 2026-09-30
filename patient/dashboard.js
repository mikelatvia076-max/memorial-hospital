// =========================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT DASHBOARD JAVASCRIPT
// MYSQL VERSION
// =========================================



// ===============================
// CURRENT PATIENT
// ===============================


let currentPatient =

JSON.parse(localStorage.getItem("loggedPatient"))

||

JSON.parse(localStorage.getItem("currentPatient"))

||

{};





let mysqlAppointments=[];

let mysqlNotifications=[];







// ===============================
// DISPLAY PATIENT NAME
// ===============================


let patientName =
document.getElementById("patientName");



if(patientName){

patientName.innerHTML =
currentPatient.name || "Patient";

}









// ===============================
// LOAD DOCTORS & NURSES FROM MYSQL
// ===============================


let doctors = [];
let nurses = [];

async function loadMedicalStaffCounts(){

try{

const docResponse = await fetch(
"http://localhost:5000/doctors"
);

if(docResponse.ok){
doctors = await docResponse.json();
}

const nurseResponse = await fetch(
"http://localhost:5000/nurses"
);

if(nurseResponse.ok){
nurses = await nurseResponse.json();
}

let doctorCount =
document.getElementById("doctorCount");

if(doctorCount){
doctorCount.innerHTML =
doctors.length;
}

let nurseCount =
document.getElementById("nurseCount");

if(nurseCount){
nurseCount.innerHTML =
nurses.length;
}

}
catch(error){
console.log("Failed loading staff count from MySQL:", error);
}

}


loadMedicalStaffCounts();









// ===============================
// LOAD PATIENT APPOINTMENTS
// ===============================


async function loadAppointments(){



if(!currentPatient.patient_id){

console.log(
"Patient ID missing"
);

return;

}



try{



let response = await fetch(

"http://localhost:5000/patient-appointments/"

+

currentPatient.patient_id

);




if(!response.ok){

throw new Error(
"Appointment loading failed"
);

}




mysqlAppointments =
await response.json();




console.log(
"Appointments:",
mysqlAppointments
);




let list =
document.getElementById("appointmentList");




if(list){


list.innerHTML="";



if(mysqlAppointments.length===0){


list.innerHTML=`

<tr>

<td colspan="6" style="text-align: center; padding: 15px;">

No appointments booked yet

</td>

</tr>

`;



}

else{


mysqlAppointments.forEach(app=>{


let row =
document.createElement("tr");



row.innerHTML=`


<td>

${app.department || ""}

</td>


<td>

${app.staff || "Not Assigned"}

</td>



<td>

${app.date || ""}

</td>



<td>

${app.time || ""}

</td>



<td>

${app.status || "Pending"}

</td>


<td style="text-align: center;">

<button class="btn-delete" data-id="${app.id}" style="background-color: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">

Delete

</button>

</td>


`;


let deleteBtn = row.querySelector(".btn-delete");

if (deleteBtn) {

deleteBtn.addEventListener("click", (e) => {

e.stopPropagation();

deletePatientAppointment(app.id);

});

}


list.appendChild(row);



});


}



}






let counter =
document.getElementById("appointmentCount");



if(counter){

counter.innerHTML =
mysqlAppointments.length;

}



}

catch(error){


console.log(error);



}



}









// =======================================
// DELETE PATIENT APPOINTMENT
// =======================================


async function deletePatientAppointment(appointmentId) {

let confirmDelete = confirm("Are you sure you want to remove this appointment from your view?");

if (!confirmDelete) return;


try {

const response = await fetch(`http://localhost:5000/patient-delete-appointment/${appointmentId}`, {

method: "DELETE"

});


if (response.ok) {

alert("Appointment deleted successfully from your portal");

loadAppointments();

} else {

alert("Failed to delete appointment");

}

} catch (err) {

console.error("Error deleting appointment:", err);

alert("Server error while deleting appointment");

}

}









// ===============================
// LOAD NOTIFICATIONS
// ===============================


async function loadNotifications(){



if(!currentPatient.patient_id){

return;

}




try{


let response = await fetch(

"http://localhost:5000/notifications/"

+

currentPatient.patient_id

);





mysqlNotifications =
await response.json();





console.log(

"Notifications:",

mysqlNotifications

);





let badge =
document.getElementById("notificationCount");




if(badge){



badge.innerHTML =
mysqlNotifications.length;



if(mysqlNotifications.length>0){

badge.style.display="inline-flex";

}

else{

badge.style.display="none";

}



}



}

catch(error){


console.log(error);


}



}









// ===============================
// AUTO REFRESH
// ===============================


setInterval(()=>{


loadMedicalStaffCounts();


loadAppointments();


loadNotifications();



},5000);









// ===============================
// LOGOUT
// ===============================


function logout(){


localStorage.removeItem(
"loggedPatient"
);


localStorage.removeItem(
"currentPatient"
);



window.location.href=
"patient-login.html";


}








// ===============================
// INITIAL LOAD
// ===============================


loadAppointments();

loadNotifications();