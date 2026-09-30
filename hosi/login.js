// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// LOGIN + REGISTER SYSTEM
// =====================================



let users =
JSON.parse(localStorage.getItem("users")) || [];





// SWITCH TO REGISTER


document.getElementById("showRegister")
.onclick=function(){


document.getElementById("loginForm").style.display="none";

document.getElementById("registerForm").style.display="block";


document.getElementById("formTitle").innerHTML=
"Create Hospital Account";


};






// SWITCH TO LOGIN


document.getElementById("showLogin")
.onclick=function(){


document.getElementById("registerForm").style.display="none";

document.getElementById("loginForm").style.display="block";


document.getElementById("formTitle").innerHTML=
"Medical Hospital Login";


};









// REGISTER USER


document.getElementById("registerForm")
.addEventListener("submit",function(e){


e.preventDefault();



let user={


name:
document.getElementById("fullname").value,


username:
document.getElementById("registerUsername").value,


email:
document.getElementById("email").value,


password:
document.getElementById("registerPassword").value,


role:
document.getElementById("registerRole").value



};





let exists =
users.find(u=>u.username===user.username);





if(exists){


document.getElementById("registerMessage")
.innerHTML=
"Username already exists";


return;


}






users.push(user);



localStorage.setItem(
"users",
JSON.stringify(users)
);





document.getElementById("registerMessage")
.innerHTML=
"Account created successfully";





});









// LOGIN USER


document.getElementById("loginForm")
.addEventListener("submit",function(e){


e.preventDefault();



let username =
document.getElementById("username").value;



let password =
document.getElementById("password").value;



let role =
document.getElementById("role").value;





let user =
users.find(u=>

u.username===username &&

u.password===password &&

u.role===role

);





if(user){


sessionStorage.setItem(
"currentUser",
JSON.stringify(user)
);



document.getElementById("loginMessage")
.innerHTML=
"Login successful";



setTimeout(()=>{


window.location.href="dashboard.html";


},1000);



}

else{


document.getElementById("loginMessage")
.innerHTML=
"Invalid login details";


}



});