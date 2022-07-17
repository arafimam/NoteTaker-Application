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
var NumberofNotes = 0;
var QuizScore = 0;
var thingsInToDo = 0;
var errorMessage = ""

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
})


/*
All POST/ requests here.
*/

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
            respose.send("<h1>You are already registered.<h1>"); // render the following pages. --> Need to redirect to login page.
        }
        else{
            const registeredUser = new clientData({
                Email: emailId,
                FullName: name,
                password: passId,
                Notes: NumberofNotes,
                Quiz: QuizScore,
                ToDo: thingsInToDo
            })
            registeredUser.save();
            respose.send("<h1>We are building the app!<h1>"); // render the following pages. --> Need to redirect to main app once implemented.

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
