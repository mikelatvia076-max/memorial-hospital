// =================================
// DEPARTMENT MANAGEMENT
// =================================



let departments =
JSON.parse(localStorage.getItem("departments")) || [];





function addDepartment(){


let name =
document.getElementById("departmentName").value;



if(name==""){

alert("Enter department name");

return;

}



departments.push(name);



localStorage.setItem(
"departments",
JSON.stringify(departments)
);



alert("Department added successfully");



document.getElementById("departmentName").value="";



displayDepartments();


}







function displayDepartments(){


let list =
document.getElementById("departmentList");



list.innerHTML="";



departments.forEach(dep=>{


let li =
document.createElement("li");


li.innerHTML=dep;



list.appendChild(li);



});


}



displayDepartments();