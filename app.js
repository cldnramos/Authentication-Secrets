//jshint esversion:6

require('dotenv').config(); //As early as possible in your application, import and configure dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

//this is the old declaration of Schema
// const userSchema = {
//     email: String,
//     password: String
// };

// this user schema is no longer just a simple Javascript object
// but it's actually an object that's created from the Mongoose schema class.
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// this is going to add our Mongoose encrypt as a plug in to our schema and we're gonna pass over our secret on the .env file as a Javascript object
// it's important that you add this plugin to the schema before you create your Mongoose model because
// you can see that we're passing in the userSchema as a parameter to create our new Mongoose model, that's the user model.
//process.env.SECRET is located on the .env file (a hidden file)
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
//"encryptedFields" will only encrypt the password field
//if you wanted to encrypt multiple fields you can also do that just by adding other entries into the array. ["password", "email"]
// During "save", documents are encrypted and then signed. During "find", documents are authenticated and then decrypted

const User = new mongoose.model("User", userSchema);

app.get("/",  function(req, res) {
    //render the home.ejs
    res.render("home");
});

app.get("/login",  function(req, res) {
    //render the login.ejs
    res.render("login");
});

app.get("/register",  function(req, res) {
    //render the register.ejs
    res.render("register");
});

app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    // try{
    //     newUser.save();
    //     res.render("secrets");
    // } catch(err) {
    //     console.log(err);
    // }
    newUser.save()
        .then((results) => {
            res.render("secrets");
            console.log(results);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // try {
    //     const foundUser = User.findOne({email: username});
    //     if(foundUser)  {
    //         if(foundUser.password === password)  {
    //             res.render("secres");
    //         }
    //     }
    // } catch(err) {
    //     console.log(err);
    // }
    User.findOne({email: username})
        .then((foundUser) => {
            if(foundUser)  {
                if(foundUser.password === password)  {
                    res.render("secrets");
                    console.log(foundUser);
                }
            }            
        })
        .catch((err) => {
            console.log(err);
        });
});

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});