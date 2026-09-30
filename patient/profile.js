// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT PROFILE MANAGEMENT
// =======================================



// GET CURRENT PATIENT

let patient = JSON.parse(
    localStorage.getItem("currentPatient")
) || {};




// ELEMENTS

const showName =
document.getElementById("showName");

const showEmail =
document.getElementById("showEmail");

const showPhone =
document.getElementById("showPhone");

const showAge =
document.getElementById("showAge");

const showGender =
document.getElementById("showGender");

const showAddress =
document.getElementById("showAddress");

const profileImage =
document.getElementById("profileImage");



const editBtn =
document.getElementById("editBtn");


const editBox =
document.getElementById("editBox");


const saveBtn =
document.getElementById("saveBtn");




// INPUTS

const nameInput =
document.getElementById("patientNameInput");

const emailInput =
document.getElementById("patientEmailInput");

const phoneInput =
document.getElementById("patientPhoneInput");

const ageInput =
document.getElementById("patientAgeInput");

const genderInput =
document.getElementById("patientGenderInput");

const addressInput =
document.getElementById("patientAddressInput");




// =======================================
// DISPLAY PROFILE
// =======================================


function displayProfile(){



if(showName)
showName.textContent =
patient.name || "Not available";



if(showEmail)
showEmail.textContent =
patient.email || "Not available";



if(showPhone)
showPhone.textContent =
patient.phone || "Not available";



if(showAge)
showAge.textContent =
patient.age || "Not available";



if(showGender)
showGender.textContent =
patient.gender || "Not available";



if(showAddress)
showAddress.textContent =
patient.address || "Not available";





if(profileImage && patient.image){

profileImage.src =
patient.image;

}



}



displayProfile();






// =======================================
// OPEN EDIT MODE
// =======================================


if(editBtn){


editBtn.onclick=function(){



editBox.style.display="block";



nameInput.value =
patient.name || "";

emailInput.value =
patient.email || "";

phoneInput.value =
patient.phone || "";

ageInput.value =
patient.age || "";

genderInput.value =
patient.gender || "";

addressInput.value =
patient.address || "";



};


}







// =======================================
// SAVE PROFILE
// =======================================


if(saveBtn){



saveBtn.onclick=function(){



let name =
nameInput.value.trim();


let email =
emailInput.value.trim();


let phone =
phoneInput.value.trim();


let age =
ageInput.value.trim();


let gender =
genderInput.value;


let address =
addressInput.value.trim();





// EMPTY CHECK


if(

name==="" ||

email==="" ||

phone==="" ||

age==="" ||

gender==="" ||

address===""

){


alert(
"Please complete all fields before saving"
);


return;


}






// UPDATE PATIENT OBJECT


patient.name=name;

patient.email=email;

patient.phone=phone;

patient.age=age;

patient.gender=gender;

patient.address=address;






// SAVE CURRENT PATIENT


localStorage.setItem(

"currentPatient",

JSON.stringify(patient)

);







// UPDATE HOSPITAL PATIENT DATABASE


let patients = JSON.parse(

localStorage.getItem("patients")

) || [];





let index = patients.findIndex(p =>

p.email === patient.email

);





if(index !== -1){



patients[index]=patient;



localStorage.setItem(

"patients",

JSON.stringify(patients)

);



}







alert(
"Profile updated successfully"
);





editBox.style.display="none";



displayProfile();



};



}









// =======================================
// IMAGE UPLOAD
// =======================================


let imageUpload =
document.getElementById("imageUpload");



if(imageUpload){



imageUpload.onchange=function(){



let file=this.files[0];



if(!file)
return;




let reader=new FileReader();



reader.onload=function(e){



patient.image =
e.target.result;



profileImage.src =
e.target.result;





localStorage.setItem(

"currentPatient",

JSON.stringify(patient)

);




alert(
"Profile photo updated"
);



};




reader.readAsDataURL(file);



};


}









// =======================================
// RETURN TO DASHBOARD
// =======================================


function goDashboard(){


window.location.href =
"patient-dashboard.html";


}