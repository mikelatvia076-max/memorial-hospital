// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// LABORATORY MANAGEMENT JAVASCRIPT
// =======================================


// Get elements

const labForm =
document.getElementById("labForm");


const labTable =
document.querySelector("#labTable tbody");


const labSearch =
document.getElementById("labSearch");



// Load laboratory records

let laboratory =
JSON.parse(localStorage.getItem("laboratory")) || [];



// Display records

displayLaboratory();





// =======================================
// ADD LAB RECORD
// =======================================


labForm.addEventListener("submit",function(e){


e.preventDefault();



let test={



id:
"LAB"+Math.floor(Math.random()*10000),



patient:
document.getElementById("labPatient").value,



doctor:
document.getElementById("labDoctor").value,



testName:
document.getElementById("testName").value,



status:
document.getElementById("sampleStatus").value,



results:
document.getElementById("results").value



};





laboratory.push(test);





localStorage.setItem(

"laboratory",

JSON.stringify(laboratory)

);





displayLaboratory();





labForm.reset();





alert(
"Laboratory record saved successfully!"
);



});









// =======================================
// DISPLAY LAB RECORDS
// =======================================


function displayLaboratory(){



labTable.innerHTML="";



laboratory.forEach((test,index)=>{



let row=document.createElement("tr");




row.innerHTML=`



<td>${test.id}</td>


<td>${test.patient}</td>


<td>${test.doctor}</td>


<td>${test.testName}</td>


<td>${test.status}</td>


<td>${test.results}</td>



<td>


<button class="view"
onclick="viewLab(${index})">

View

</button>



<button class="delete"
onclick="deleteLab(${index})">

Delete

</button>



</td>



`;





labTable.appendChild(row);



});



}









// =======================================
// SEARCH LAB RESULTS
// =======================================


labSearch.addEventListener(
"keyup",
function(){



let value=this.value.toLowerCase();



let rows=document.querySelectorAll(
"#labTable tbody tr"
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
// VIEW LAB RESULT
// =======================================


function viewLab(index){



let test =
laboratory[index];



alert(`

Laboratory Report


ID:
${test.id}


Patient:
${test.patient}


Doctor:
${test.doctor}


Test:
${test.testName}


Status:
${test.status}


Results:
${test.results}


`);




}









// =======================================
// DELETE LAB RECORD
// =======================================


function deleteLab(index){



let confirmDelete =
confirm(
"Delete laboratory record?"
);



if(confirmDelete){



laboratory.splice(index,1);




localStorage.setItem(

"laboratory",

JSON.stringify(laboratory)

);




displayLaboratory();



alert(
"Laboratory record deleted"
);



}



}