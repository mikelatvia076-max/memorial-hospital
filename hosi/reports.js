// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// REPORTS DASHBOARD JAVASCRIPT
// =======================================


// Get saved data


let patients =
JSON.parse(localStorage.getItem("patients")) || [];


let doctors =
JSON.parse(localStorage.getItem("doctors")) || [];


let nurses =
JSON.parse(localStorage.getItem("nurses")) || [];


let appointments =
JSON.parse(localStorage.getItem("appointments")) || [];


let laboratory =
JSON.parse(localStorage.getItem("laboratory")) || [];


let medicines =
JSON.parse(localStorage.getItem("medicines")) || [];


let bills =
JSON.parse(localStorage.getItem("bills")) || [];


let records =
JSON.parse(localStorage.getItem("records")) || [];





// =======================================
// DISPLAY TOTALS
// =======================================



document.getElementById("totalPatients").innerHTML =
patients.length;



document.getElementById("totalDoctors").innerHTML =
doctors.length;



document.getElementById("totalNurses").innerHTML =
nurses.length;



document.getElementById("totalAppointments").innerHTML =
appointments.length;



document.getElementById("totalLab").innerHTML =
laboratory.length;



document.getElementById("totalMedicine").innerHTML =
medicines.length;



document.getElementById("totalRecords").innerHTML =
records.length;








// =======================================
// CALCULATE REVENUE
// =======================================


let totalRevenue = 0;



bills.forEach(bill=>{


totalRevenue += Number(bill.amount);


});



document.getElementById("revenue").innerHTML =

"KES " + totalRevenue.toLocaleString();







// =======================================
// ANIMATION COUNTERS
// =======================================


function animateNumber(id,value){


let number=0;


let timer=setInterval(()=>{


number += Math.ceil(value/50);



if(number>=value){


number=value;


clearInterval(timer);


}



document.getElementById(id).innerHTML=number;



},20);


}






animateNumber(
"totalPatients",
patients.length
);



animateNumber(
"totalDoctors",
doctors.length
);



animateNumber(
"totalNurses",
nurses.length
);



animateNumber(
"totalAppointments",
appointments.length
);



animateNumber(
"totalLab",
laboratory.length
);



animateNumber(
"totalMedicine",
medicines.length
);



animateNumber(
"totalRecords",
records.length
);
