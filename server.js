var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

var session=require('express-session');  

var app = express();
var port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'uploads')));
app.use("/public", express.static('public')); 
// app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

// app.use(express.static('uploads'));
app.use(session({secret:'zyclyx',saveUninitialized:true,resave:false}));
//  app.use(favicon(__dirname + '/public/'));
var Users = require('./Routes/Users');
{
    
app.use('/users',Users);
}

var Admin =require('./Routes/Admin');{
    //app.use(bodyParser.urlencoded({extended: false}));
app.use('/Admin',Admin);
// app.use('/JS', express.static(__dirname + 'uploads/'));

}

var LeaveRequest =require('./Routes/LeaveRequest');{

app.use('/LeaveRequest',LeaveRequest);
}

var Holiday=require('./Routes/Holiday');{
    app.use('/Holiday',Holiday);
}

var NoticeBoard=require('./Routes/NoticeBoard');
{
    app.use('/NoticeBoard',NoticeBoard);
}

var IProcurement=require('./Routes/IProcurement');
{
    app.use('/IProcurement',IProcurement);
}


var Payslips=require('./Routes/Payslips');
{
    app.use('/Payslips',Payslips);
}


// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'public/index.html'));
// });
app.listen(port,function(){

    console.log("Server is running on port: "+port);
});


