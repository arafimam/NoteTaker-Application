/*
Require/ use all dependencies here.
*/
const express = require("express");
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
