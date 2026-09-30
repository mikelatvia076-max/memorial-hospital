// =========================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// APPOINTMENT BOOKING SYSTEM
// =========================================


console.log("appointment.js working");


// ===============================
// LOAD PATIENTS
// ===============================

let patientSelect = document.getElementById("patient");


let patients =
JSON.parse(localStorage.getItem("patients")) || [];


if(patientSelect){

patients.forEach(patient=>{

let option=document.createElement("option");

option.value=patient.name;

option.textContent =
patient.name + " (" + patient.id + ")";

patientSelect.appendChild(option);

});

}



// ===============================
// LOAD DEPARTMENTS
// ===============================


let departmentSelect =
document.getElementById("department");


let departments = [

"Accident & Emergency",
"Cardiology",
"Dental",
"Dermatology",
"ENT",
"General Medicine",
"Gynecology",
"Internal Medicine",
"Neurology",
"Obstetrics",
"Oncology",
"Ophthalmology",
"Orthopedics",
"Pediatrics",
"Physiotherapy",
"Psychiatry",
"Radiology",
"Surgery",
"Urology",
"Laboratory",
"Pharmacy"

];


if(departmentSelect){


departments.forEach(dep=>{


let option=document.createElement("option");

option.value=dep;

option.textContent=dep;

departmentSelect.appendChild(option);


});


}




// ===============================
// LOAD DOCTORS AND NURSES
// ===============================


let staffSelect =
document.getElementById("staff");


let doctors =
JSON.parse(localStorage.getItem("doctors")) || [];


let nurses =
JSON.parse(localStorage.getItem("nurses")) || [];



if(staffSelect){


doctors.forEach(doc=>{


let option=document.createElement("option");


option.value=doc.name;


option.textContent=
doc.name+" (Doctor)";


staffSelect.appendChild(option);


});



nurses.forEach(nurse=>{


let option=document.createElement("option");


option.value=nurse.name;


option.textContent=
nurse.name+" (Nurse)";


staffSelect.appendChild(option);


});


}





// ===============================
// SAVE APPOINTMENT
// ===============================


let form =
document.getElementById("appointmentForm");



if(form){


form.addEventListener("submit",function(e){


e.preventDefault();



let patient =
document.getElementById("patient").value;


let department =
document.getElementById("department").value;


let staff =
document.getElementById("staff").value;


let date =
document.getElementById("date").value;


let time =
document.getElementById("time").value;


let email =
document.getElementById("email").value;


let phone =
document.getElementById("phone").value;


let reason =
document.getElementById("reason").value;



if(
patient==="" ||
department==="" ||
staff==="" ||
date==="" ||
time==="" ||
email===""
){

alert("Please fill all details");

return;

}




let appointment={


id:
"APT-"+Date.now(),


patient:patient,


email:email,


phone:phone,


department:department,


staff:staff,


date:date,


time:time,


reason:reason,


status:"Pending",


created:
new Date().toLocaleString()


};




// SAVE APPOINTMENTS


let appointments =

JSON.parse(localStorage.getItem("appointments"))

|| [];


appointments.push(appointment);



localStorage.setItem(

"appointments",

JSON.stringify(appointments)

);




// ===============================
// PATIENT NOTIFICATION
// ===============================


let notifications =

JSON.parse(localStorage.getItem("notifications"))

|| [];



notifications.push({


title:"Appointment Submitted",


message:
"Your appointment for "+
department+
" with "+
staff+
" has been received.",


date:
new Date().toLocaleString(),


read:false


});



localStorage.setItem(

"notifications",

JSON.stringify(notifications)

);





// ===============================
// HOSPITAL NOTIFICATION
// ===============================


let hospitalNotifications =

JSON.parse(localStorage.getItem("hospitalNotifications"))

|| [];



hospitalNotifications.push({


title:"New Appointment",


message:
patient+
" booked "+
department,


date:
new Date().toLocaleString(),


read:false


});



localStorage.setItem(

"hospitalNotifications",

JSON.stringify(hospitalNotifications)

);





// ===============================
// EMAIL JS
// ===============================


emailjs.send(

"service_rn13jzs",

"template_t2qtmhs",

{


patient_name:patient,

to_email:email,

department:department,

staff:staff,

date:date,

time:time,

status:"Pending"


}

)

.then(()=>{


alert("Appointment sent successfully");


form.reset();


})

.catch(error=>{


console.log(error);


alert("Appointment saved but email failed");


});



});


}




// ===============================
// BACK BUTTON
// ===============================


function goDashboard(){

window.location.href="patient-dashboard.html";

}