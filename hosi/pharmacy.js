// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PHARMACY MANAGEMENT JAVASCRIPT
// =======================================


// Get elements

const medicineForm =
document.getElementById("medicineForm");


const medicineTable =
document.querySelector("#medicineTable tbody");


const medicineSearch =
document.getElementById("medicineSearch");



// Load medicines

let medicines =
JSON.parse(localStorage.getItem("medicines")) || [];



// Display medicines

displayMedicines();





// =======================================
// ADD MEDICINE
// =======================================


medicineForm.addEventListener("submit",function(e){


e.preventDefault();



let medicine={



id:
"MED"+Math.floor(Math.random()*10000),



name:
document.getElementById("medicineName").value,



category:
document.getElementById("category").value,



quantity:
document.getElementById("quantity").value,



price:
document.getElementById("price").value,



expiry:
document.getElementById("expiry").value



};





medicines.push(medicine);





localStorage.setItem(

"medicines",

JSON.stringify(medicines)

);





displayMedicines();





medicineForm.reset();





alert(
"Medicine added successfully!"
);



});









// =======================================
// DISPLAY MEDICINES
// =======================================


function displayMedicines(){



medicineTable.innerHTML="";



medicines.forEach((medicine,index)=>{



let row=document.createElement("tr");




row.innerHTML=`



<td>${medicine.id}</td>


<td>${medicine.name}</td>


<td>${medicine.category}</td>


<td>${medicine.quantity}</td>


<td>KES ${medicine.price}</td>


<td>${medicine.expiry}</td>



<td>


<button class="view"
onclick="viewMedicine(${index})">

View

</button>



<button class="delete"
onclick="deleteMedicine(${index})">

Delete

</button>



</td>



`;





medicineTable.appendChild(row);



});



}









// =======================================
// SEARCH MEDICINE
// =======================================


medicineSearch.addEventListener(
"keyup",
function(){



let value=this.value.toLowerCase();



let rows=document.querySelectorAll(
"#medicineTable tbody tr"
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
// VIEW MEDICINE
// =======================================


function viewMedicine(index){



let medicine =
medicines[index];



alert(`

Medicine Details


ID:
${medicine.id}


Medicine:
${medicine.name}


Category:
${medicine.category}


Quantity:
${medicine.quantity}


Price:
KES ${medicine.price}


Expiry:
${medicine.expiry}


`);





}









// =======================================
// DELETE MEDICINE
// =======================================


function deleteMedicine(index){



let confirmDelete =
confirm(
"Delete this medicine?"
);



if(confirmDelete){



medicines.splice(index,1);



localStorage.setItem(

"medicines",

JSON.stringify(medicines)

);



displayMedicines();



alert(
"Medicine removed successfully"
);



}



}