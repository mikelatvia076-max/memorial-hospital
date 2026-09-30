function loginUser(){
 let email = document.getElementById("loginemail").value;
 let password = document.getElementById("loginpassword").value;
      if(email=="" || password==""){
       alert("email or password should not be black");
    return;
    }else{
     alert("login successfull");

    }
       document.getElementById("loginpage").style.display = "none";
       document.getElementById("websitepage").style.display = "block";
}

function goToLoginPage(){
     document.getElementById("frontpage").style.display = "none";
     document.getElementById("loginpage").style.display = "block";
}


function goToRegisterPage(){
document.getElementById("frontpage").style.display = "none";

document.getElementById("registerpage").style.display = "block";
}


function goToResetPage(){
document.getElementById("loginpage").style.display = "none";

document.getElementById("resetpage").style.display = "block";

}

function goToVerifyPage(){
 let phone = document.getElementById("resetphone").value;
 let password = document.getElementById("newpassword").value;
 let newpassword = document.getElementById("oldpassword").value;
 if(phone=="" || password==""){
    alert("spaces cannot be blank");
    return;
}
    if(password != newpassword){
   alert("password must be same");
    return;
}
if(password.length <6 ){
    alert("password must be 6 digit long")
    return;
}
if(phone.length <10 ){
    alert("your phone number must be 10 digits long")
    return;
}
if(!phone.startsWith("01") && !phone.startsWith("07")){
    alert("your number should start with 01 or 07");
    return;
} 
else{
    alert("otp sent successfully");
 }
 let generatedOTP = Math.floor(Math.random() *10000);
 alert("your OTP is: " + generatedOTP);
 
 
document.getElementById("resetpage").style.display = "none";

document.getElementById("verifypage").style.display = "block";

} 

function returnToLoginPage(){
    let code= document.getElementById("verifycode").value;
    if(code==""){
        alert("the OTP is required");
        return;
    }
    //let enterOTP = document.getElementById("verifycode").value;
   // if(enterOTP != generatedOTP){
       // alert("enter the correct otp ");
      //  return;

   // }

    else{
        alert("your password was successfully changed");
    }
    document.getElementById("verifypage").style.display = "none";
    document.getElementById("loginpage").style.display = "block";

}
function backToLoginPage(){
    let firstname = document.getElementById("firstname").value;

    let last = document.getElementById("lastname").value;

    let password = document.getElementById("registerpassword").value;

    let confirm = document.getElementById("registerconfirmpassword").value;

    let email = document.getElementById("registeremail").value;

    let phone = document.getElementById("registerphone").value;

if(last==""  || password=="" || phone=="" || email=="" || confirm=="" || firstname==""){

        alert("ensure you fill all the spaces");

        return;

    }
    if(password!= confirm){
        alert("password must be the same");
        return;
    }
    else{

        alert("registration successfull");
    }

    document.getElementById("registerpage").style.display = "none";
     document.getElementById("loginpage").style.display = "block";
}

function showMenu() {
    let menu = document.getElementById("menu");

    if(menu.style.display === "none"){
        menu.style.display = "block";
    }else{
        menu.style.display = "none";
    }
}
function showCategory(categoryId) {

    let categories = document.getElementsByClassName("category");

    for (let i = 0; i < categories.length; i++) {
        categories[i].style.display = "none";
    }

    document.getElementById(categoryId).style.display = "block";
}