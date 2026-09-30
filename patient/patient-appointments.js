// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT APPOINTMENT HISTORY
// MYSQL VERSION
// WITH CANCEL OPTION
// ======================================


const table =
document.getElementById("patientAppointments");



let currentPatient =

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

"http://localhost:5000/patient-appointments/"

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



let confirmCancel = confirm(

"Are you sure you want to cancel this appointment?"

);



if(!confirmCancel){

return;

}




try{


let response = await fetch(

"http://localhost:5000/cancel-appointment/"+id,

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


alert(
"Appointment cancelled successfully"
);


loadAppointments();


}


else{


alert(result.message);

}



}



catch(error){


console.log(error);


alert(
"Cancel failed"
);


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