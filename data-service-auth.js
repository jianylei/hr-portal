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
    let db = mongoose.createConnection("mongodb+srv://jianyonglei:Danny65493839@senecaweb.4wyhe.mongodb.net/web322_a6?retryWrites=true&w=majority");
    db.on('error', (err)=>{
    reject(err);
    });
    db.once('open', ()=>{
    User = db.model("users", userSchema);
    resolve(); });
    }); 
}

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if(userData.password1 != userData.password2) {
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
}