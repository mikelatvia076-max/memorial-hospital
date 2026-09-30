// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// HOSPITAL APPOINTMENT MANAGEMENT
// MYSQL VERSION
// =======================================


const appointmentTable =
document.getElementById("appointmentTable");


const appointmentSearch =
document.getElementById("appointmentSearch");



let appointments = [];





// =======================================
// LOAD APPOINTMENTS FROM MYSQL
// =======================================


async function loadAppointments(){


try{


let response = await fetch(

"http://localhost:5000/appointments"

);



if(!response.ok){

throw new Error(
"Failed loading appointments"
);

}



appointments =
await response.json();



console.log(
"Hospital appointments:",
appointments
);



displayAppointments();



}



catch(error){


console.log(error);


alert(
"Unable to load appointments"
);


}



}







// =======================================
// DISPLAY APPOINTMENTS
// =======================================


function displayAppointments(){



if(!appointmentTable)return;



appointmentTable.innerHTML="";





if(appointments.length===0){


appointmentTable.innerHTML=`

<tr>

<td colspan="9">

No appointments found

</td>

</tr>

`;


return;


}






appointments.forEach((app,index)=>{



let row =
document.createElement("tr");





row.innerHTML=`



<td>

${app.id}

</td>




<td>

${app.patient_name || app.patient || "-"}

</td>




<td>

${app.staff || "Not Assigned"}

</td>




<td>

${app.department || "-"}

</td>




<td>

${app.date || "-"}

</td>




<td>

${app.time || "-"}

</td>




<td>

${app.reason || "-"}

</td>





<td>

<span class="status">

${app.status || "Pending"}

</span>

</td>





<td>


<button

onclick="updateAppointment(${app.id},'Confirmed')"

>

Confirm

</button>




<button

onclick="updateAppointment(${app.id},'Counsel')"

>

Counsel

</button>





<button

onclick="updateAppointment(${app.id},'Completed')"

>

Complete

</button>





<button

onclick="updateAppointment(${app.id},'Cancelled')"

>

Cancel

</button>





<button

onclick="deleteAppointment(${app.id})"

>

Delete

</button>



</td>



`;




appointmentTable.appendChild(row);



});



}









// =======================================
// UPDATE STATUS + SEND NOTIFICATION
// =======================================


async function updateAppointment(id,status){



try{



// UPDATE DATABASE VIA HOSPITAL-UPDATE-APPOINTMENT ENDPOINT


let update =
await fetch(

"http://localhost:5000/hospital-update-appointment/"+id,

{


method:"PUT",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({

status:status,

staff_name: (appointments.find(a => a.id == id) || {}).staff || "Hospital Staff",

department: (appointments.find(a => a.id == id) || {}).department || "-"

})


}

);




if(!update.ok){

update =
await fetch(

"http://localhost:5000/appointments/"+id+"/status",

{


method:"PUT",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({

status:status

})


}

);

}




if(!update.ok){

throw new Error(
"Status update failed"
);

}






// GET APPOINTMENT DETAILS


let appointment = {};

try {

let appointmentResponse =
await fetch(

"http://localhost:5000/appointment/"+id

);

if(!appointmentResponse.ok){

appointmentResponse =
await fetch(

"http://localhost:5000/appointments/"+id

);

}

appointment = await appointmentResponse.json();

} catch(e) {

appointment = appointments.find(a => a.id == id) || {};

}






// SEND PATIENT NOTIFICATION (ALREADY HANDLED BY /hospital-update-appointment BACKEND, BUT PRESERVED AS FALLBACK IF NEEDED)


let targetPatientId = appointment.patient_id || (appointments.find(a => a.id == id) || {}).patient_id;

if (targetPatientId) {
    await fetch(

        "http://localhost:5000/notifications",

        {


            method:"POST",


            headers:{


                "Content-Type":"application/json"


            },


            body:JSON.stringify({



                patient_id: targetPatientId,



                title:
                "Appointment Status Updated",




                message:

                "Your appointment status has been updated to \"" + status + "\" by " + (appointment.staff || "Hospital Staff") + ".",




                user_type:
                "Patient"



            })


        }

    );
}





alert(

"Appointment updated and patient notified"

);




loadAppointments();



}




catch(error){



console.log(error);



alert(

"Update failed"

);



}



}









// =======================================
// DELETE APPOINTMENT (HOSPITAL SIDE ONLY)
// =======================================


async function deleteAppointment(id){



let confirmDelete =
confirm(

"Delete this appointment from hospital view?"

);




if(!confirmDelete)return;






try{



// CALL HOSPITAL SOFT-DELETE ENDPOINT TO PRESERVE PATIENT RECORD
let response =
await fetch(

"http://localhost:5000/hospital-delete-appointment/"+id,

{


method:"DELETE"


}

);




if(!response.ok){

response =
await fetch(

"http://localhost:5000/delete-appointment/"+id,

{


method:"DELETE"


}

);

}





if(response.ok){


alert(

"Appointment removed from hospital portal"

);


loadAppointments();



}

else{


alert(

"Delete failed"

);


}



}



catch(error){


console.log(error);


}




}









// =======================================
// SEARCH
// =======================================


if(appointmentSearch){


appointmentSearch.addEventListener(

"keyup",

function(){


let value =
this.value.toLowerCase();



document
.querySelectorAll("#appointmentTable tr")
.forEach(row=>{


row.style.display =

row.innerText
.toLowerCase()
.includes(value)

?

""

:

"none";



});


}



);


}









// =======================================
// AUTO REFRESH
// =======================================


setInterval(()=>{


loadAppointments();


},10000);







// START

loadAppointments();