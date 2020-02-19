var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var bodyparser = require("body-parser");
var session=require('express-session');
var cookieparser=require('cookie-parser');
var nodemailer = require('nodemailer');
var token;
var bcrypt = require('bcryptjs');

var multer=require('multer');
var fs=require('fs');
//var multipart=require('connect-multiparty');
users.use(cors());
users.use(bodyparser.json());
process.env.SECRET_KEY = "sampath";

//Add Notice

users.use(bodyparser.urlencoded({
    extended: false
}));
users.use(bodyparser.json());

var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
    
});
var upload=multer({storage:storage});


function verifyToken(req, res, next) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                next();
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
};





users.post('/AddNotice',upload.single('file'),function(req,res){
var appData={
    "error":"0",
    "data":""
}
var date=new Date();
console.log(date)
var details={
    "title":req.body.title,
    "description":req.body.description
}
console.log(details.title,details.description+" notice details");
    database.connection.getConnection(function(err,connection){
        if(!err){

          
           console.log('connected to DB');
            connection.query("insert into noticeboardjs(title,description,date) values(?,?,?)",[details.title,details.description,date],function(err,rows){

                if(!err){
                    console.log('data inserted');
                    appData["error"]=0;
                    appData["data"]='data inserted';
                    res.status(201).json(appData);
                    
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sampathkumar0078@gmail.com',
      pass: '$@mp@th586'
    }
  });
  
  var mailOptions = {
    from: 'sampathkumar0078@gmail.com',
    to: 'sampathkumar0078@gmail.com',
    subject: 'Notice board',
    
    
    text: details.title+('\n')+details.description+('\n')+' That was easy!'
    
};
  console.log(details.title,details.description+"notice details")
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent for noticeboard: ' + info.response);
    }
  });
  
  
                }
                else{
                    console.log(err);
                    appData["error"]=1;
                    appData["data"]=err;
                    res.status(400).json(appData);
                }

            })

        }
        else{
            console.log(err);
            console.log('not connected to DB');
            appData["error"]=1;
            appData["data"]='not connected to DB';
            res.status(400).json(appData);
        }
    })
})

//Delete Notice

users.post('/RemoveNotice',upload.single('file'),function(req,res){

    var details={
        "title":req.body.title
    }
    var appData={
        "error":"0",
        "data":""
    }

    database.connection.getConnection(function(err,connection){
        if(!err){
            console.log('database connnected');
        
            connection.query("delete from noticeboardjs where title=?",[details.title],function(err,data){
                if(!err)
                {
                    console.log('details deleted');
                    appData["error"]=0;
                    appData["data"]='record deleted successfully';
                    res.status(201).json(appData);
                }
                else{
                    console.log(err);
                    console.log('record not deleted');
                    res.status(400).json(appData);
                }
            })
        }
        else{
            console.log('database not connected');
        }
    });
    

})

//view notice

users.get('/ViewNotice',function(req,res){
    var appData={
        "error":"0",
        "data":""
    }

database.connection.getConnection(function(err,connection){
    if(!err){
        console.log('connected');
    connection.query("select * from noticeboardjs order by id desc limit 2",function(err,rows){
        if(!err){
            console.log('executed');
            appData["error"]=0;
            //appData["data"]=rows;
            name=rows[0];
            res.send(name);
        //    res.status(201).json(appData);
        }
        else{
            console.log(err);
            appData["error"]=1;
            appData["data"]=err;
            res.status(400).json(appData);
        }
    })
}
else{
    console.log(err);
    appData["error"]=1;
    appData["data"]='database not connected';
    res.status(400).json(appData);
}
})
})

//view last 5 records

users.get('/ViewFiveNotices',function(req,res){
    var appData={
        "error":"0",
        "data":""
    }

database.connection.getConnection(function(err,connection){
    if(!err){
        console.log('connected');
    connection.query("select * from noticeboardjs order by id desc limit 5",function(err,rows){
        if(rows.length>0){
            console.log('executed');
            appData["error"]=0;
           // appData["data"]=rows;
           res.send(rows);
            //res.status(201).json(appData);
        }
        else{
            console.log(err);
            appData["error"]=1;
            appData["data"]='record not deleted';
            res.status(400).json(appData);
        }
    })
}
else{
    console.log(err);
    appData["error"]=1;
    appData["data"]='database not connected';
    res.status(400).json(appData);
}
})
})

users.post('/mail',function(req,res){
    

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sampathkumar0078@gmail.com',
    pass: '$@mp@th586'
  }
});

var mailOptions = {
  from: 'sampathkumar0078@gmail.com',
  to: 'sampathkumar0078@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
})

module.exports=users;