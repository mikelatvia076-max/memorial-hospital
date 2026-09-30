// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// MEDICAL RECORDS JAVASCRIPT
// =======================================


// Get elements

const recordForm = document.getElementById("recordForm");

const recordTable = document.querySelector("#recordTable tbody");

const recordSearch = document.getElementById("recordSearch");



// Load records

let records =
JSON.parse(localStorage.getItem("records")) || [];



// Display records

displayRecords();





// =======================================
// SAVE MEDICAL RECORD
// =======================================


recordForm.addEventListener("submit", function(e){


e.preventDefault();



let record = {


id:
"REC" + Math.floor(Math.random()*10000),



patient:
document.getElementById("recordPatient").value,



doctor:
document.getElementById("doctor").value,



symptoms:
document.getElementById("symptoms").value,



diagnosis:
document.getElementById("diagnosis").value,



treatment:
document.getElementById("treatment").value,



notes:
document.getElementById("notes").value,



prescription:
document.getElementById("prescription").value,



date:
new Date().toLocaleDateString()


};





records.push(record);





localStorage.setItem(

"records",

JSON.stringify(records)

);





displayRecords();





recordForm.reset();





alert(
"Medical record saved successfully!"
);



});









// =======================================
// DISPLAY RECORDS
// =======================================


function displayRecords(){



recordTable.innerHTML="";



records.forEach((record,index)=>{



let row=document.createElement("tr");




row.innerHTML=`



<td>${record.id}</td>


<td>${record.patient}</td>


<td>${record.doctor}</td>


<td>${record.diagnosis}</td>


<td>${record.treatment}</td>


<td>${record.date}</td>



<td>


<button class="view"
onclick="viewRecord(${index})">

View

</button>



<button class="delete"
onclick="deleteRecord(${index})">

Delete

</button>



</td>



`;




recordTable.appendChild(row);



});



}









// =======================================
// SEARCH RECORDS
// =======================================


recordSearch.addEventListener(
"keyup",
function(){



let value=this.value.toLowerCase();



let rows=document.querySelectorAll(
"#recordTable tbody tr"
);



rows.forEach(row=>{



let text=row.innerText.toLowerCase();



if(text.includes(value)){


row.style.display="";


}

else{


row.style.display="none";


}



});


});









// =======================================
// VIEW MEDICAL HISTORY
// =======================================


function viewRecord(index){



let record = records[index];



alert(`

AGNES MEMORIAL MEDICAL HOSPITAL

MEDICAL HISTORY


Record ID:
${record.id}


Patient:
${record.patient}


Doctor:
${record.doctor}


Symptoms:
${record.symptoms}


Diagnosis:
${record.diagnosis}


Treatment:
${record.treatment}


Prescription:
${record.prescription}


Doctor Notes:
${record.notes}


Date:
${record.date}


`);




}









// =======================================
// DELETE RECORD
// =======================================


function deleteRecord(index){



let confirmDelete =
confirm(
"Delete this medical record?"
);



if(confirmDelete){



records.splice(index,1);



localStorage.setItem(

"records",

JSON.stringify(records)

);



displayRecords();



alert(
"Medical record deleted"
);



}



}