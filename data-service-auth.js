var bcrypt = require("bcryptjs");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName":  {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String
    }]
  });

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection("mongodb+srv://dbUser:Danny6549389@senecaweb.aflkq.mongodb.net/web322_a6?retryWrites=true&w=majority");
    db.on('error', (err)=>{
    reject(err);
    });
    db.once('open', ()=>{
    User = db.model("users", userSchema);
    resolve(); });
    }); 
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if(userData.password !== userData.password2) {
            reject("Passwords do not match");
        }
        let newUser = new User(userData);
        newUser.save((err) => {
            if(err && err.code == 11000) {
              reject("User Name already taken");
            } 
            else if(err && err.code != 11000) {
              reject("There was an error creating the user: " + err);
            }
            else {
                resolve();
            }
          });
    }); 
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
       User.find({
           userName: userData.userName
    }).exec()
    .then((user)=>{
        if(user[0].password != userData.password) {
            reject("Incorrect Password for user: " + userData.userName);
        };
        user[0].loginHistory.push({
            dateTime: (new Date()).toString(),
            userAgent: userData.userAgent
        });

        User.update({
            userName: user[0].userName
        }, {
            $set: {
                loginHistory: user[0].loginHistory
            }
        }, {
                multi: false
        }).exec()
        .then(() => {
            resolve(user[0]);
        })
        .catch((err) => {
            reject("There was an error verifying the user: " + err);
        })
    }).catch((err)=>{
        reject("Unable to find user: " + userData.userName);
        }); 
    }); 
}
