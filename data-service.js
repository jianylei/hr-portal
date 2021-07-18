module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/departments.json', (err, data) => {
            if (err) {
                reject(err);
            }

            departments = JSON.parse(data);

            fs.readFile('./data/employees.json', (err, data) => {
                if (err) {
                    reject(err);
                }

                employees = JSON.parse(data);
                resolve();
            });
        });
    });
}

module.exports.getAllEmployees = function(){
    return new Promise((resolve,reject)=>{
        if (employees.length == 0) {
            reject("query returned 0 results");
        }

        resolve(employees);
    })
}

module.exports.getManagers = function () {
    return new Promise(function (resolve, reject) {
        var filteredEmployeees = [];

        for (let i = 0; i < employees.length; i++) {
            if (employees[i].isManager == true) {
                filteredEmployeees.push(employees[i]);
            }
        }

        if (filteredEmployeees.length == 0) {
            reject("query returned 0 results");
        }

        resolve(filteredEmployeees);
    });
};

module.exports.getDepartments = function(){
   return new Promise((resolve,reject)=>{
    if (departments.length == 0) {
        reject("query returned 0 results");
    }

    resolve(departments);
   });
};

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        if(!employeeData) { reject("No data to be added") }
        employeeData.employeeNum = employees.length + 1;
        employeeData.isManager = (employeeData.isManager) ? true : false;

        employees.push(employeeData);
        resolve();
    });
};


module.exports.getEmployeesByStatus = function(status){
    return new Promise((resolve, reject) =>{
        var newArr = [];
        for(let i = 0; i < employees.length; i++) {
            if(employees[i].status == status) {
                newArr.push(employees[i]);
            }
        }

        if (newArr.length == 0) {
            reject("query returned 0 results");
        }
        resolve(newArr);
    })
};

module.exports.getEmployeesByDepartment = function(department){
    return new Promise((resolve, reject) =>{
        var newArr = [];
        for(let i = 0; i < employees.length; i++) {
            if(employees[i].department == department) {
                newArr.push(employees[i]);
            }
        }

        if (newArr.length == 0) {
            reject("query returned 0 results");
        }
        resolve(newArr);
    })
};

module.exports.getEmployeesByManager = function(manager){
    return new Promise((resolve, reject) =>{
        var newArr = [];
        for(let i = 0; i < employees.length; i++) {
            if(employees[i].employeeManagerNum == manager) {
                newArr.push(employees[i]);
            }
        }

        if (newArr.length == 0) {
            reject("query returned 0 results");
        }
        resolve(newArr);
    })
};

module.exports.getEmployeesByNum = function(num){
    return new Promise((resolve, reject) =>{
        for(let i = 0; i < employees.length; i++) {
            if(employees[i].employeeNum == num) {
                
                resolve(employees[i]);
            }
        }
        reject("query returned 0 results");
    })
};

module.exports.updateEmployee = function(employeeData){
    return new Promise((resolve, reject) =>{
        for(let i = 0; i < employees.length; i++) {
            if(employees[i].employeeNum == employeeData.employeeNum) {
                employees[i].firstName = employeeData.firstName;
                employees[i].lastName = employeeData.lastName;
                employees[i].email = employeeData.email;
                employees[i].ssn = employeeData.ssn;
                employees[i].addressStreet = employeeData.addressStreet;
                employees[i].addressCity = employeeData.addressCity;
                employees[i].addressState = employeeData.addressState;
                employees[i].addressPostal = employeeData.addressPostal;
                employees[i].isManager = (employeeData.isManager) ? true : false;
                employees[i].employeeManagerNum = employeeData.employeeManagerNum;
                employees[i].status = employeeData.status;
                employees[i].department = employeeData.department;

                resolve();
            }
        }
        reject("query returned 0 results");
    })
};
