const Sequelize = require("sequelize");

var sequelize = new Sequelize('d6s0o8hna1m5a4', 'ztfemxvqsennoj', '91b647eba13228005a67a21fe3aca659e6ea04d4bcc7649f45bf9516929e0433', {
    host: 'ec2-34-196-238-94.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Employee = sequelize.define('employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
       sequelize.sync().then((Employee)=>{
           resolve();
       }).then((Deparment)=>{
           resolve();
       }).catch((err)=>{
            reject("Unable to sync with database");
       });
    });
};

module.exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) { 
        Employee.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.getManagers = function () {
    return new Promise(function (resolve, reject) { reject();
    });
};

module.exports.getDepartments = function(){
    return new Promise(function (resolve, reject) { 
        Department.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.getEmployeesByStatus = function(status){
    return new Promise(function (resolve, reject) { 
        Employee.findAll({
            where: {
                status: status
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.getEmployeesByDepartment = function(departmentNum){
    return new Promise(function (resolve, reject) { 
        Employee.findAll({
            where: {
                department: departmentNum
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.getEmployeesByManager = function(manager){
    return new Promise(function (resolve, reject) { 
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.getEmployeesByNum = function(num){
    return new Promise(function (resolve, reject) { 
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then(function(data){
            resolve(data[0]);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) { 
        employeeData.isManager=(employeeData.isManager)?true:false;

        for(var i in employeeData) {
            if(employeeData[i] == '') { employeeData[i] = null; }
        }

        Employee.create(employeeData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Unable to add new employee");
        }) 
    });
};

module.exports.updateEmployee = function(employeeData){
    return new Promise(function (resolve, reject) { 
        employeeData.isManager=(employeeData.isManager)?true:false;

        for(var i in employeeData) {
            if(employeeData[i] == '') { employeeData[i] = null; }
        }

        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("Unable to update employee");
        }) 
    })
};

module.exports.addDepartment = function(departmentData){
    return new Promise(function (resolve, reject) { 

        for(var i in departmentData) {
                if(departmentData[i] == '') { departmentData[i] = null; }
        }
    
        Department.create(departmentData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Unable to add new Department");
        }) 
    });
};

module.exports.updateDepartment = function(departmentData){
    return new Promise(function (resolve, reject) { 

        for(var i in departmentData) {
            if(departmentData[i] == '') { departmentData[i] = null; }
        }

        Department.update(
            departmentData
        , {
            where: {
                departmentId: departmentData.departmentId
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("Unable to update department");
        }) 
    })
};

module.exports.getDepartmentById = function(id){
    return new Promise(function (resolve, reject) { 
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(function(data){
            resolve(data[0]);
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};

module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise(function (resolve, reject) { 
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("No data to be displayed");
        })
    });
};
