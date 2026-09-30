// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT PORTAL SERVICES
// SEARCH ENABLED
// ======================================


const services = [


"Accident & Emergency",
"Ambulance Services",
"Intensive Care Unit (ICU)",
"High Dependency Unit (HDU)",
"Trauma Care",


"General Medicine",
"Internal Medicine",
"Family Medicine",
"Cardiology",
"Neurology",
"Oncology",
"Nephrology",
"Pulmonology",
"Endocrinology",
"Gastroenterology",
"Rheumatology",


"Obstetrics",
"Gynecology",
"Maternity Services",
"Antenatal Care",
"Postnatal Care",
"Fertility Services",
"Pediatrics",
"Neonatal Care",


"General Surgery",
"Orthopedic Surgery",
"Neurosurgery",
"Plastic Surgery",
"ENT Surgery",
"Urology Surgery",
"Ophthalmic Surgery",


"Dental Clinic",
"Dermatology",
"ENT Clinic",
"Eye Clinic",
"Physiotherapy",
"Psychiatry & Mental Health",
"Nutrition & Dietetics",
"Pain Management Clinic",


"Laboratory Services",
"Blood Testing",
"Pathology",
"Radiology",
"X-Ray",
"Ultrasound",
"CT Scan",
"MRI Scan",
"ECG Testing",
"Endoscopy",


"Pharmacy",
"Blood Bank",
"Vaccination Services",
"Wound Care",
"Diabetes Management",
"Hypertension Management",
"Chronic Disease Management",
"Infection Control Services",
"Rehabilitation Services",


"Outpatient Department (OPD)",
"Inpatient Services",
"Private Rooms",
"Patient Admission Services",
"Discharge Services",
"Medical Records",
"Health Screening Packages",
"Corporate Medical Checkups",


"Online Appointment Booking",
"Telemedicine Consultation",
"Patient Portal",
"Online Medical Reports",
"Online Payment",
"Insurance Services",
"Health Education",
"Follow-up Consultation"



];





let container =

document.getElementById("servicesContainer");






function displayServices(list){



container.innerHTML="";





if(list.length===0){


container.innerHTML=`

<h3>

No service found

</h3>

`;

return;


}







list.forEach(service=>{



let card=document.createElement("div");


card.className="service-card";



card.innerHTML=`

<i class="fa-solid fa-circle-check"></i>


<h3>

${service}

</h3>



<p>

Agnes Memorial Medical Hospital provides quality care through our ${service} department.

</p>



`;



container.appendChild(card);



});



}







// SHOW ALL SERVICES


displayServices(services);








// SEARCH OPTION


let search =

document.getElementById("serviceSearch");





search.addEventListener("keyup",()=>{



let value =

search.value.toLowerCase();





let result = services.filter(service=>


service.toLowerCase().includes(value)


);





displayServices(result);



});









// RETURN DASHBOARD


function goDashboard(){


window.location.href="patient-dashboard.html";


}