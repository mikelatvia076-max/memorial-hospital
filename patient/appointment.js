// =========================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// BOOK APPOINTMENT SYSTEM
// MYSQL + EMAILJS + NOTIFICATIONS
// =========================================


// ===============================
// ELEMENTS
// ===============================

const form = document.getElementById("appointmentForm");

const patientName =
document.getElementById("patientName");

const patientID =
document.getElementById("patientID");

const phone =
document.getElementById("phone");

const email =
document.getElementById("email");

const department =
document.getElementById("department");

const staff =
document.getElementById("staff");





// ===============================
// CURRENT PATIENT
// ===============================


let currentPatient =

JSON.parse(localStorage.getItem("currentUser"))

||

JSON.parse(localStorage.getItem("loggedPatient"))

||

JSON.parse(localStorage.getItem("currentPatient"))

||

{};






// ===============================
// LOAD PATIENT DETAILS
// ===============================


function loadPatient(){


if(!currentPatient.patient_id){


alert("Please login first");

window.location.href="patient-login.html";

return;


}



patientName.value =
currentPatient.name || "";



patientID.value =
currentPatient.patient_id || "";



phone.value =
currentPatient.phone || "";



email.value =
currentPatient.email || "";



}



loadPatient();







// ===============================
// DEPARTMENTS
// ===============================


const departments=[


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





departments.forEach(dep=>{


let option =
document.createElement("option");


option.value=dep;

option.textContent=dep;


department.appendChild(option);


});









// =========================================
// LOAD DOCTORS ONLY FROM HOSPITAL DB
// =========================================

async function loadMedicalStaff(){


try{


staff.innerHTML = `
<option value="">
Loading doctors from hospital portal...
</option>
`;



// LOAD DOCTORS FROM HOSPITAL PORTAL DATABASE ONLY

const doctorResponse = await fetch(
"http://localhost:5000/doctors"
);


if(!doctorResponse.ok){

throw new Error(
"Failed fetching doctors"
);

}


const doctors = await doctorResponse.json();





// CLEAR DROPDOWN AND ADD DEFAULT OPTION

staff.innerHTML = `

<option value="">

Choose Doctor

</option>

`;





// POPULATE DROPDOWN WITH REGISTERED DOCTORS ONLY

doctors.forEach(doctor=>{


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

catch(error){


console.log(error);


staff.innerHTML = `

<option value="">

Failed loading doctors

</option>

`;

}


}



loadMedicalStaff();


// ===============================
// SUBMIT APPOINTMENT
// ===============================


form.addEventListener(
"submit",
async function(e){



e.preventDefault();




let now = new Date();
let currentDateStr = now.toISOString().split("T")[0];
let currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
let fullTimeStamp = currentDateStr + " " + currentTimeStr;


let appointment={



patient_id:
currentPatient.patient_id,



patient_name:
currentPatient.name,



email:
email.value.trim(),



phone:
phone.value.trim(),



department:
department.value,



staff:
staff.value,



date:
document.getElementById("date").value,



time:
document.getElementById("time").value,



reason:
document.getElementById("reason").value,



status:
"Pending"



};







// ===============================
// VALIDATION
// ===============================


if(
!appointment.department ||
!appointment.staff ||
!appointment.date ||
!appointment.time ||
!appointment.reason
){


alert(
"Please fill all appointment details"
);


return;


}







// EMAIL CHECK


let emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;



if(!emailPattern.test(appointment.email)){


alert(
"Enter a valid email"
);


return;


}







// PHONE CHECK


if(!/^[0-9]+$/.test(appointment.phone)){


alert(
"Phone must contain numbers only"
);


return;


}



if(appointment.phone.length!==10){


alert(
"Phone must be exactly 10 digits"
);


return;


}



if(
!appointment.phone.startsWith("07")
&&
!appointment.phone.startsWith("01")
){


alert(
"Phone must start with 07 or 01"
);


return;


}









// ===============================
// SAVE APPOINTMENT MYSQL
// ===============================


try{



let response =
await fetch(

"http://localhost:5000/appointments",

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:
JSON.stringify(appointment)


}


);






let result =
await response.json();





if(!response.ok){


throw new Error(
result.message
);


}









// ===============================
// CREATE PATIENT NOTIFICATION
// ===============================


await fetch(

"http://localhost:5000/notifications",

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


patient_id:
appointment.patient_id,


title:
"Appointment Submitted",


message:

"Your appointment with "
+
appointment.staff
+
" on "
+
appointment.date
+
" at "
+
appointment.time
+
" has been received and is waiting confirmation.",


date:
currentDateStr,


time:
currentTimeStr,


created_at:
fullTimeStamp,


user_type:
"Patient"



})


}

);







// ===============================
// CREATE HOSPITAL/ADMIN NOTIFICATION
// ===============================


try {
    await fetch(
        "http://localhost:5000/notifications",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                patient_id: appointment.patient_id,
                title: "New Appointment Request",
                message: "New appointment booked by " + appointment.patient_name + " for " + appointment.staff + " on " + appointment.date + " at " + appointment.time,
                date: currentDateStr,
                time: currentTimeStr,
                created_at: fullTimeStamp,
                user_type: "Admin"
            })
        }
    );

    await fetch(
        "http://localhost:5000/hospital-notifications",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                patient_name: appointment.patient_name,
                staff: appointment.staff,
                date: appointment.date,
                time: appointment.time,
                created_at: fullTimeStamp,
                type: "Appointment Request"
            })
        }
    );
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


patient_name:
appointment.patient_name,


to_email:
appointment.email,


department:
appointment.department,


staff:
appointment.staff,


date:
appointment.date,


time:
appointment.time


}


)

.then(()=>{


console.log(
"Email sent"
);


})

.catch(error=>{


console.log(
"Email error",
error
);


});







alert(

"Appointment booked successfully. Confirmation email sent."

);



form.reset();



loadPatient();



}

catch(error){


console.log(
error
);



alert(

"Appointment failed. Check server."

);



}



});