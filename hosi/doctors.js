// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// DOCTOR MANAGEMENT MYSQL VERSION
// =======================================


// ================================
// GET ELEMENTS
// ================================

const doctorForm =
document.getElementById("doctorForm");


const doctorTable =
document.querySelector("#doctorTable tbody");


const doctorSearch =
document.getElementById("doctorSearch");



let doctors = [];





// ================================
// LOAD DOCTORS FROM MYSQL
// ================================

async function loadDoctors(){


try{


const response = await fetch(

"http://localhost:5000/doctors"

);



if(!response.ok){

throw new Error(
"Failed to load doctors"
);

}



doctors = await response.json();



displayDoctors();
updateDoctorCountCard();



}

catch(error){


console.log(
"Doctor loading error:",
error
);


alert(
"Unable to load doctors from database"
);


}



}




// ================================
// UPDATE DASHBOARD COUNT CARD
// ================================

function updateDoctorCountCard(){

const doctorCard = document.getElementById("doctors");

if(doctorCard){

doctorCard.textContent = doctors.length;

}

}




// ================================
// ADD DOCTOR TO MYSQL
// ================================

if(doctorForm){


doctorForm.addEventListener(

"submit",

async function(e){


e.preventDefault();




const doctor = {


doctor_id:

"DOC" + Date.now(),



name:

document.getElementById("doctorName").value.trim(),



specialization:

document.getElementById("specialization").value.trim(),



department:

document.getElementById("department").value.trim(),



phone:

document.getElementById("doctorPhone").value.trim(),



email:

document.getElementById("doctorEmail").value.trim(),



availability:

document.getElementById("availability").value



};




// ===============================
// EMAIL VALIDATION
// ===============================

let emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailPattern.test(doctor.email)){

alert(
"Please enter a valid email address"
);

return;

}




// ===============================
// PHONE VALIDATION
// ===============================

if(!/^[0-9]+$/.test(doctor.phone)){

alert(
"Phone number must contain numbers only"
);

return;

}

if(doctor.phone.length !== 10){

alert(
"Phone number must be exactly 10 digits"
);

return;

}

if(
!doctor.phone.startsWith("07")
&&
!doctor.phone.startsWith("01")
){

alert(
"Phone number must start with 07 or 01"
);

return;

}




try{


const response = await fetch(

"http://localhost:5000/doctors",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify(doctor)


}

);





const result =
await response.json();






if(response.ok){



alert(
"Doctor registered successfully"
);



doctorForm.reset();



loadDoctors();



}

else{


alert(
result.message
);


}



}

catch(error){


console.log(error);


alert(
"Doctor saving failed"
);


}



});


}








// ================================
// DISPLAY DOCTORS
// ================================

function displayDoctors(){


if(!doctorTable){

return;

}




doctorTable.innerHTML = "";





if(doctors.length === 0){



doctorTable.innerHTML = `


<tr>

<td colspan="7">

No doctors registered

</td>

</tr>


`;

return;


}







doctors.forEach((doctor,index)=>{



const row =
document.createElement("tr");




row.innerHTML = `



<td>

${doctor.doctor_id}

</td>



<td>

${doctor.name}

</td>



<td>

${doctor.specialization}

</td>



<td>

${doctor.department}

</td>



<td>

${doctor.phone}

</td>



<td>

${doctor.availability}

</td>



<td>



<button class="view"

onclick="viewDoctor(${index})">

View

</button>





<button class="delete"

onclick="deleteDoctor(${doctor.id || index})">

Delete

</button>



</td>



`;





doctorTable.appendChild(row);



});



}










// ================================
// SEARCH DOCTORS
// ================================


if(doctorSearch){


doctorSearch.addEventListener(

"keyup", function(){



let value =
this.value.toLowerCase();





const rows = document.querySelectorAll(

"#doctorTable tbody tr"

);





rows.forEach(row=>{



row.style.display =


row.innerText

.toLowerCase()

.includes(value)


?

""

:

"none";



});



});


}









// ================================
// VIEW DOCTOR
// ================================


function viewDoctor(index){



const doctor =
doctors[index];



alert(`


DOCTOR PROFILE


Doctor ID:
${doctor.doctor_id}


Name:
${doctor.name}


Specialization:
${doctor.specialization}


Department:
${doctor.department}


Phone:
${doctor.phone}


Email:
${doctor.email}


Availability:
${doctor.availability}



`);



}









// ================================
// DELETE DOCTOR FROM MYSQL
// ================================


async function deleteDoctor(id){



let confirmDelete =
confirm(

"Are you sure you want to delete this doctor?"

);



if(!confirmDelete){

return;

}







try{


const response = await fetch(

"http://localhost:5000/doctors/" + id,

{

method:"DELETE"

}

);







const result =
await response.json();






if(response.ok){


alert(

"Doctor deleted successfully"

);



loadDoctors();



}

else{


alert(

result.message || "Delete failed"

);


}



}

catch(error){


console.log(error);


alert(

"Doctor deletion failed"

);


}



}








// ================================
// START SYSTEM
// ================================


loadDoctors();