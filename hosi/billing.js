// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// BILLING MANAGEMENT JAVASCRIPT
// =======================================


// Get elements

const billingForm = document.getElementById("billingForm");

const billingTable = document.querySelector("#billingTable tbody");

const billSearch = document.getElementById("billSearch");



// Load billing records

let bills = JSON.parse(localStorage.getItem("bills")) || [];



// Display bills

displayBills();




// =======================================
// CREATE INVOICE
// =======================================


billingForm.addEventListener("submit", function(e){

    e.preventDefault();


    let bill = {


        receipt:
        "REC" + Math.floor(Math.random()*100000),


        patient:
        document.getElementById("patientBillName").value,


        service:
        document.getElementById("service").value,


        amount:
        document.getElementById("amount").value,


        payment:
        document.getElementById("paymentMethod").value,


        status:
        document.getElementById("paymentStatus").value,


        date:
        new Date().toLocaleDateString()


    };



    bills.push(bill);



    localStorage.setItem(
        "bills",
        JSON.stringify(bills)
    );



    displayBills();



    billingForm.reset();



    alert("Invoice generated successfully!");

});







// =======================================
// DISPLAY BILLING RECORDS
// =======================================


function displayBills(){


    billingTable.innerHTML="";


    bills.forEach((bill,index)=>{


        let row=document.createElement("tr");



        row.innerHTML=`


        <td>${bill.receipt}</td>


        <td>${bill.patient}</td>


        <td>${bill.service}</td>


        <td>KES ${bill.amount}</td>


        <td>${bill.payment}</td>


        <td>${bill.status}</td>


        <td>


        <button class="view"
        onclick="viewBill(${index})">

        View

        </button>



        <button class="delete"
        onclick="deleteBill(${index})">

        Delete

        </button>



        </td>


        `;



        billingTable.appendChild(row);


    });


}








// =======================================
// SEARCH INVOICE
// =======================================


billSearch.addEventListener("keyup",function(){


    let value=this.value.toLowerCase();



    let rows=document.querySelectorAll(
        "#billingTable tbody tr"
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
// VIEW RECEIPT
// =======================================


function viewBill(index){


let bill=bills[index];


alert(`

AGNES MEMORIAL MEDICAL HOSPITAL

PAYMENT RECEIPT

Receipt No:
${bill.receipt}

Patient:
${bill.patient}

Service:
${bill.service}

Amount:
KES ${bill.amount}

Payment Method:
${bill.payment}

Status:
${bill.status}

Date:
${bill.date}

`);

}









// =======================================
// DELETE BILL
// =======================================


function deleteBill(index){


let confirmDelete =
confirm("Delete this invoice?");



if(confirmDelete){


bills.splice(index,1);



localStorage.setItem(
"bills",
JSON.stringify(bills)
);



displayBills();



alert("Invoice deleted successfully");


}


}