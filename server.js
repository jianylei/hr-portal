
/************************************************************************ *********
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: Danny Student ID: 164700197 Date: 08/10/21 *
* Online (Heroku) Link: https://webapp-web322.herokuapp.com
* ********************************************************************************/
const dataServiceAuth = require("./data-service-auth.js");
const express = require("express");
const multer = require("multer");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions")
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
        navLink: function (url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters"); if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                return options.fn(this);
            }
        },
        log: function (obj) {
            console.log(obj);
        }
    }
}));
app.set('view engine', '.hbs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, ""); next();
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(clientSessions({
    cookieName: "session",
    secret: "web322-a6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function(req, res, next) { 
    res.locals.session = req.session; next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
};

app.get("/images", ensureLogin, function (req, res) {
    fs.readdir(__dirname + "/public/images/uploaded", function (err, images) {
        res.render("images", { data: images });
    });
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/employees/add", ensureLogin, (req, res) => {
    data.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch((err) => {
        res.render("addEmployee", { departments: [] });
    })
});

app.get("/images/add", ensureLogin, (req, res) => {
    res.render("addImage");
});

app.get("/departments", ensureLogin, (req, res) => {
    data.getDepartments().then((data) => {
        if (data.length > 0) {
            res.render("departments", { departments: data });
        }
        else {
            res.render("departments", { message: "no results" });
        }
    }).catch(function (err) {
        res.render("departments", { message: "no results" });
    });
});

app.get("/employees", ensureLogin, function (req, res) {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch(function (err) {
            res.render("employees", { message: "no results" });
        });
    }
    else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch(function (err) {
            res.render("employees", { message: "no results" });
        });
    }
    else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch(function (err) {
            res.render("employees", { message: "no results" });
        });
    }
    else {
        data.getAllEmployees().then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch(function (err) {
            res.render("employees", { message: "no results" });
        });
    }
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
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
        }).catch((err) => {
            res.status(500).send("Employee Not Found");
        });
});

app.get("/departments/add", ensureLogin, function (req, res) {
    res.render("addDepartment");
});

app.get("/department/:departmentId", ensureLogin, function (req, res) {
    data.getDepartmentById(req.params.departmentId).then(function (data) {
        res.render("department", { department: data });
    })
        .catch(function (err) {
            res.status(404).send("Department Not Found");
        });
});

app.get("/employees/delete/:empNum", ensureLogin, function (req, res) {
    data.deleteEmployeeByNum(req.params.empNum).then(function () {
        res.redirect("/employees");
    }).catch(function (err) {
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});

//post
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post("/employees/add", ensureLogin, (req, res) => {
    data.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to add Employee / Employee not found)");
    });
});

app.post("/employee/update", ensureLogin, (req, res) => {
    data.updateEmployee(req.body).then(function () {
        res.redirect("/employees");
    }).catch(function (err) {
        console.log(err);
    })
});

app.post("/departments/add", ensureLogin, (req, res) => {
    data.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to add Department / Department not found)");
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
    data.updateDepartment(req.body).then(function () {
        res.redirect("/departments");
    }).catch(function (err) {
        console.log(err);
    })
});

//routes for login/logout/register
app.get("/login", (req, res)=>{
    res.render("login");
});
app.get("/register", (req, res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
    dataServiceAuth.registerUser(req.body).then((data)=>{
        res.render("register", {successMessage: "User created"});
    }).catch((err)=>{
        res.render("register", {errorMessage: err, userName: req.body.userName});
    })
});
app.post("/login",(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((data)=>{
        req.session.user = {
            userName: data.userName,
            email: data.email,
            loginHistory: data.loginHistory
            }
            res.redirect('/employees');
    }).catch((err)=>{
        res.render("login", {errorMessage: err, userName: req.body.userName});
    })
});
app.get("/logout", (req, res)=>{
    req.session.reset();
    res.redirect('/');
})
app.get("/userHistory", ensureLogin, (req, res)=>{
    res.render("userHistory");
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

data.initialize().then(dataServiceAuth.initialize).then(function () {
    app.listen(HTTP_PORT, function () {
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function (err) {
    console.log("unable to start server: " + err);
});
