// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT CONTACT SYSTEM
// ======================================



let contactForm =

document.getElementById("contactForm");







if(contactForm){



contactForm.addEventListener(

"submit",

function(e){



e.preventDefault();







let contactMessage={



name:

document.getElementById("name").value,



email:

document.getElementById("email").value,



phone:

document.getElementById("phone").value,



message:

document.getElementById("message").value,



date:

new Date().toLocaleString()



};








let messages =

JSON.parse(localStorage.getItem("messages"))

|| [];






messages.push(contactMessage);






localStorage.setItem(

"messages",

JSON.stringify(messages)

);






alert(

"Your message has been sent to Agnes Memorial Medical Hospital"

);





contactForm.reset();





});


}