/*
Require/ use all dependencies here.
*/
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const https = require("https");


/*All global variables defined here.*/
const PORT = 3000;
var message = "";
var displayedEmail = " ";
var displayedName = " ";
var displayedNumberOfNotes = 0;
var displayedNumberOfThings = 0;
var displayedAverageScore = 0;
var errorMessageForLogin = "";
var errorMessageForSignUp = "";


/**
 *Initialize all Database here.
*/
mongoose.connect('mongodb://localhost:27017/clientData');

/**
* Initializae all Schemas here.
*/
const userSchema = new mongoose.Schema({
    Email: String,
    FullName: String,
    password: String, 
    Notes: Number, // This will store the number of Notes the user has made.
    Quiz: Number, // This will store the average score the user has received in the quizzes
    ToDo: Number  //This will store the number of things the user has in his toDo list
});

/*
Initialize database models here.
*/
const clientData = mongoose.model("client",userSchema);

/*
All GET/ requests here.
*/
app.get("/",function(request,response){
    response.render("home",{subscription:message});

});
app.get("/Register",function(request,response){
    response.render("signup");
});
app.get("/login",function(request,response){
    response.render("login",{msg: errorMessageForLogin});
});
app.get("/dashboard",function(request,response){
    response.render("dashboard",{userEmail: displayedEmail, userName: displayedName,userNotes: displayedNumberOfNotes,userToDo: displayedNumberOfThings,userScore:displayedAverageScore});
})


/*
All POST/ requests here.
*/
/*
Post request for client login.
*/
app.post("/login",function(request,response){
    const emailId = request.body.email;
    const pass = request.body.password;

    // Finding user from database. 
    clientData.findOne({"Email": emailId, "password": pass},function(error, docs){
        if (error){
            console.log(error);
        }if (docs){
            // user is logged in --> redirect to user dashboard.
            displayedEmail = emailId;
            displayedName = docs.FullName;
            displayedNumberOfNotes = docs.Notes;
            displayedAverageScore = docs.Quiz;
            response.redirect("/dashboard");
        }else{
            // user entered email/ password that does not exist in db.
            errorMessageForLogin = "Wrong Email or password. Try again!"
            response.redirect("/login");
        }

    })

})

/*
Post request for client signup.
*/
app.post("/Register",function(request,respose){

    const name = request.body.fullName;
    const emailId = request.body.email;
    const passId = request.body.password;

    const checkUser = clientData.countDocuments({Email: emailId},function(error,count){
        if (count>0){
             //user exist in Database.
             errorMessageForSignUp = "User already exist. Try a different email or try logging in."
             respose.redirect("/Register");
            }
        else{
            // user getting stored in database with default values.
            const registeredUser = new clientData({
                Email: emailId,
                FullName: name,
                password: passId,
                Notes: 0,
                Quiz: 0,
                ToDo: 0
            })
            displayedEmail = emailId;
            displayedAverageScore = 0;
            displayedNumberOfNotes = 0;
            displayedNumberOfThings = 0;
            displayedName = name;
            registeredUser.save();
            respose.redirect("/dashboard");

        }
    });
   
    
    
});

/* Post request from Home page.
MailChimp Api Used here. 
TODO: change activation key for mailchimp api.
*/
app.post("/",function(request,response){
    /*
    Parsing the post request from my home page
    */
    const FirstName = request.body.firstName;
    const LastName = request.body.lastName;
    const Email = request.body.email;

    /*
    Using mailchimp api
    */
   const data = {
    members:[
        {
            email_address: Email,
            status: "subscribed",
            merge_fields:{
                FNAME: FirstName,
                LNAME: LastName
            }
        }
    ]
   };

   const JSON_data = JSON.stringify(data);
   const url = "https://us12.api.mailchimp.com/3.0/lists/53648eb595"
   const options = {
    method: "POST",
    auth: "syed:a453cc328902cf5e841a9a44c7433245-us12",
   }
   const req = https.request(url,options,function(res){
    res.on("data",function(data){
        console.log(JSON.parse(data));
        const audienceData = JSON.parse(data);
        if (audienceData.error_count === 0){
            message = "You are sucessfully subscribed!"
            response.redirect("/");
            
        }
        else{
            message = "There are was a problem in resolving your request. Please try again later."
            response.redirect("/");
        }
    });

   });
   req.write(JSON_data);
   req.end();
   //response.send()
})


/*
Listening to port.
*/
app.listen(PORT,function(){
    console.log("Server is currently running at port %d",PORT);
});
