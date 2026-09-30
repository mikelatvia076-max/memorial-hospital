// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// NURSE MANAGEMENT JAVASCRIPT
// =======================================


// GET ELEMENTS


const nurseForm =
document.getElementById("nurseForm");



const nurseTable =
document.querySelector("#nurseTable tbody");



const nurseSearch =
document.getElementById("nurseSearch");







// LOAD NURSES


let nurses =
[];


// Dynamic asynchronous migration launcher instead of static storage data
async function loadNurses(){

try {

const response = await fetch("http://localhost:5000/nurses");

if(!response.ok) throw new Error("Failed fetching metrics");

nurses = await response.json();

displayNurses();

} catch(err) {

console.log("Database loading error:", err);

}

}






// DISPLAY NURSES


loadNurses();









// =======================================
// ADD NURSE
// =======================================


if(nurseForm){



nurseForm.addEventListener("submit", async function(e){


e.preventDefault();





let phoneValue = document.getElementById("nursePhone").value.trim();
let emailValue = document.getElementById("nurseEmail").value.trim();

// Phone Validation (e.g., must be digits, optional +, min length 10)
const phoneRegex = /^\+?[0-9]{10,15}$/;
if(!phoneRegex.test(phoneValue)){
    alert("Please enter a valid phone number (at least 10 digits).");
    return;
}

// Email Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if(!emailRegex.test(emailValue)){
    alert("Please enter a valid email address.");
    return;
}





let nurse = {




nurse_id:

"NUR" + Math.floor(Math.random()*10000),





name:

document.getElementById("nurseName").value,





department:

document.getElementById("nurseDepartment").value,





phone:

phoneValue,





email:

emailValue,





shift:

document.getElementById("shift").value,





status:

document.getElementById("nurseStatus").value,





// IMPORTANT FOR APPOINTMENTS

role:

"Nurse"





};







try {

const response = await fetch("http://localhost:5000/nurses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nurse)
});

const result = await response.json();

if(response.ok) {

    alert("Nurse registered successfully!");
    nurseForm.reset();
    loadNurses();

} else {
    alert(result.message || "Registration failed");
}

} catch(err) {
    console.log(err);
    alert("Server error connecting pipeline.");
}






});



}











// =======================================
// DISPLAY NURSES
// =======================================


function displayNurses(){



if(!nurseTable) return;





nurseTable.innerHTML="";






if(nurses.length===0){



nurseTable.innerHTML=`

<tr>

<td colspan="7">

No nurses registered

</td>

</tr>

`;

return;


}







nurses.forEach((nurse,index)=>{





let row =
document.createElement("tr");






row.innerHTML=`



<td>${nurse.nurse_id || nurse.id}</td>


<td>${nurse.name}</td>


<td>${nurse.department}</td>


<td>${nurse.phone}</td>


<td>${nurse.shift}</td>


<td>${nurse.status}</td>



<td>



<button class="view"

onclick="viewNurse(${index})">

View

</button>





<button class="delete"

onclick="deleteNurse(${nurse.id || index})">

Delete

</button>



</td>



`;






nurseTable.appendChild(row);





});



}












// =======================================
// SEARCH NURSES
// =======================================


if(nurseSearch){



nurseSearch.addEventListener(

"keyup",

function(){



let value =
this.value.toLowerCase();





let rows =
document.querySelectorAll(

"#nurseTable tbody tr"

);






rows.forEach(row=>{



let text =
row.innerText.toLowerCase();





if(text.includes(value)){


row.style.display="";


}

else{


row.style.display="none";


}





});



});



}












// =======================================
// VIEW NURSE
// =======================================


function viewNurse(index){



let nurse =
nurses[index];



alert(`

Nurse Profile


ID:

${nurse.nurse_id || nurse.id}



Name:

${nurse.name}



Department:

${nurse.department}



Phone:

${nurse.phone}



Email:

${nurse.email}



Shift:

${nurse.shift}



Status:

${nurse.status}



Role:

${nurse.role || "Nurse"}



`);





}












// =======================================
// DELETE NURSE
// =======================================


async function deleteNurse(index){





let confirmDelete =
confirm(

"Are you sure you want to delete this nurse?"

);






if(confirmDelete){





try {

const response = await fetch("http://localhost:5000/nurses/" + index, {
    method: "DELETE"
});

if(response.ok) {
    alert("Nurse deleted successfully");
    loadNurses();
} else {
    alert("Drop index action failed against server matrix.");
}

} catch(err) {
    console.log(err);
}





}



}