// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT LOGIN SYSTEM
// ======================================


let loginForm = document.getElementById("loginForm");



if(loginForm){



loginForm.addEventListener(
"submit",
async function(e){


e.preventDefault();



let email =
document.getElementById("loginEmail").value.trim();



let password =
document.getElementById("loginPassword").value.trim();





if(email==="" || password===""){


alert(
"Please enter email and password"
);


return;


}





try{



let response = await fetch(

"http://localhost:5000/login",

{


method:"POST",


headers:{


"Content-Type":"application/json"


},



body:JSON.stringify({


email:email,


password:password



})


}


);






let data =
await response.json();





console.log(
"LOGIN RESPONSE:",
data
);








if(response.ok){



console.log(
"PATIENT DETAILS:",
data.patient
);





// SAVE PATIENT INFORMATION


localStorage.setItem(

"loggedPatient",

JSON.stringify(data.patient)

);





// BACKUP STORAGE KEY

localStorage.setItem(

"currentPatient",

JSON.stringify(data.patient)

);





// APPOINTMENT AUTO-FILL KEY

localStorage.setItem(

"currentUser",

JSON.stringify(data.patient)

);






alert(

"Login successful"

);





window.location.href =

"patient-dashboard.html";





}

else{



alert(

data.message ||

"Invalid login details"

);



}




}



catch(error){



console.log(error);



alert(

"Cannot connect to server"

);



}



});



}