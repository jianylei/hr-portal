
/************************************************************************ *********
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: Danny Student ID: 164700197 Date: 07/10/21 *
* Online (Heroku) Link: https://webapp-v4.herokuapp.com
* ********************************************************************************/
const express = require("express");
const multer = require("multer");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const data = require("./data-service.js");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){ 
            return '<li' +((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
        },
        equal: function (lvalue, rvalue, options) { 
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters"); if (lvalue != rvalue) {
            return options.inverse(this); } else {
            return options.fn(this); }
        },
        log: function(obj) {
            console.log(obj);
        }
    }
}));
app.set('view engine', '.hbs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, ""); next();
})

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({storage: storage});

app.get("/images", function(req, res){
    fs.readdir(__dirname + "/public/images/uploaded", function(err, images){
        res.render("images", {data: images});
    });
})

app.get("/", (req,res) => {
    res.render("home");
})

app.get("/about", (req,res) => {
    res.render("about");
})

app.get("/employees/add", (req,res) => {
    data.getDepartments().then((data)=>{
        res.render("addEmployee",{departments: data});
    }).catch((err)=>{
        res.render("addEmployee",{departments: []});
    })
})

app.get("/images/add", (req,res) => {
    res.render("addImage");
})

app.get("/departments", (req,res) => {
    data.getDepartments().then((data)=>{
        if(data.length > 0) {
            res.render("departments", {departments: data});
        }
        else {
            res.render("departments",{ message: "no results" });
        }
    }).catch(function(err){
        res.render("departments",{ message: "no results" });
    });
})

app.get("/employees", function(req, res) {
    if(req.query.status){
        data.getEmployeesByStatus(req.query.status).then((data)=>{
            if(data.length > 0) {
                res.render("employees", {employees: data});
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch(function(err){
            res.render("employees",{ message: "no results" });
        });
    }
    else if(req.query.department){
        data.getEmployeesByDepartment(req.query.department).then((data)=>{
            if(data.length > 0) {
                res.render("employees", {employees: data});
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch(function(err){
            res.render("employees",{ message: "no results" });
        });
    }
    else if(req.query.manager){
        data.getEmployeesByManager(req.query.manager).then((data)=>{
            if(data.length > 0) {
                res.render("employees", {employees: data});
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch(function(err){
            res.render("employees",{ message: "no results" });
        });
    }
    else{
        data.getAllEmployees().then((data)=>{
            if(data.length > 0) {
                res.render("employees", {employees: data});
            }
            else {
                res.render("employees",{ message: "no results" });
            }
        }).catch(function(err){
            res.render("employees",{ message: "no results" });
        });
    }    
})

app.get("/employee/:empNum", (req, res) => {
    let viewData = {};
    
    data.getEmployeesByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data;
        } else {
            viewData.employee = null;
        }
    }).catch(() => {
        viewData.employee = null;
    }).then(data.getDepartments)
        .then((data) => {
            viewData.departments = data;
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = [];
        }).then(() => {
            if (viewData.employee == null) {
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData });
            }
        });
});

app.get("/departments/add",  function(req, res){
    res.render("addDepartment");
})

app.get("/department/:departmentId",  function(req, res){
    data.getDepartmentById(req.params.departmentId).then(function(data){
        res.render("department",{department: data});
    })
    .catch(function(err){
        res.status(404).send("Department Not Found");
    });
})

app.get("/employees/delete/:empNum",  function(req, res){
    console.log(1);
    data.deleteEmployeeByNum(req.params.empNum).then(function(){
        console.log(2);
        res.redirect("/employees");
    }).catch(function(err){ console.log(3);
        res.status(500).send( "Unable to Remove Employee / Employee not found)");
    });
})

//post
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
})

app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
})

app.post("/employee/update", (req, res) => { 
    data.updateEmployee(req.body).then(function() {
        res.redirect("/employees");
    }).catch(function(err){
        console.log(err);
    })
})

app.post("/departments/add", (req, res) => {
    data.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
})

app.post("/department/update", (req, res) => { 
    data.updateDepartment(req.body).then(function() {
        res.redirect("/departments");
    }).catch(function(err){
        console.log(err);
    })
})

app.use((req, res) => {
    res.status(404).send("Page Not Found");
})

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT);
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
})
