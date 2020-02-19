var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var bodyparser = require("body-parser");
var session=require('express-session');
var cookieparser=require('cookie-parser');
var token;
var bcrypt = require('bcryptjs')
var base64=require('file-base64');
var multer=require('multer');
var mysql = require('mysql');
var nodemailer=require('nodemailer');
//var upload=multer({dest:'uploads/'});
var fs=require('fs');
//var multipart=require('connect-multiparty');
users.use(cors());
users.use('/uploads',express.static('uploads'));
//users.use(bodyparser.json());
process.env.SECRET_KEY = "sampath";

users.use(bodyparser.urlencoded({
    extended: false
}));


var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/');
    },
     filename:function(req,file,cb){
        // console.log(new Date().getMinutes+"time before");
         var file=file.originalname;
        cb(null,file);
        console.log(file+"file name is");
  
    }
});
var upload=multer({storage:storage});
        



users.post('/LeaveRequest',upload.single('file'),function(req,res){

    var appData={
        "error":1,
        "data":""
    }

    var reason=req.body.reason;
    var fromDate=req.body.fromDate;
    var toDate=req.body.toDate;
    var type=req.body.type;
    var torequest=req.body.torequest;
    var fullid=req.body.fullid;
    console.log(fullid+'  fullid');
    console.log(reason,fromDate,toDate,type,torequest,fullid+"details are");
    database.connection.getConnection(function(err,connection){
        if(!err){
            console.log('connected');
            connection.query('select name from users where fullid=?',[fullid],function(err,data){
                var name=data[0].name;
                console.log(name)
            connection.query('update users set reason=?,reqtype=?,requestto=?,status=?,fromDays=?,toDays=? where fullid=?',[reason,type,torequest,'Not yet approved',fromDate,toDate,fullid],function(err,data){
                if(!err){
                    appData.error=0;
                    appData["data"]="record updated";
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
    subject: 'Leave request from '+name,
    
    
    text: 'Dear manager'+('\n')+'Please grant me the '+type+' leave for the reason of '+reason+' from the date '+fromDate+' to '+toDate+'.'+('\n')+'Thanks and regards'+('\n')+name+'.'
    
};
 // console.log(details.title,details.description+"notice details")
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent for Leave request: ' + info.response);
    }
  });
  
  

                }
                else{
                    appData.error=1;
                    appData["data"]=err;
                    res.status(200).json(appData);
                }
            })
        })
        }
        else{
            console.log('not connnected');
        }
    })
})

users.get('/getLeaveEmployee',function(req,res){
    var appData={
        "error":"1",
        "data":""
    }

    database.connection.getConnection(function(err,connection){
        if(!err){
            console.log('connected to database');
        connection.query("select name from users where status='Not yet approved'",function(err,data){
            if(!err){
                appData.error=0;
                appData["data"]=data;
                res.status(201).json(appData);
            }
            else{
                appData.error=1;
                appData["data"]=data;
                res.status(200).json(appData);
            }
        })
    }
    else{
        console.log('not connected to db');
        appData.error=1;
        appData["data"]=err;
        res.status(200).json(appData);
    }
    })
    
});

//get status

users.post('/getStatus',upload.single('file'),function(req,res){
    var appData={
        "error":"1",
        "data":""
    }
    var fullid=req.body.fullid;
    console.log(fullid+'  fulid is')
    database.connection.getConnection(function(err,connection){
        if(!err){
            console.log('connected to database');
        connection.query("select status from users where fullid=?",[fullid],function(err,data){
            if(!err){
                appData.error=0;
               // appData["data"]=data;
                //res.status(201).json(appData);
                res.send(data);
            }
            else{
                appData.error=1;
                appData["data"]=data;
                res.status(200).json(appData);
            }
        })
    }
    else{
        console.log('not connected to db');
        appData.error=1;
        appData["data"]=err;
        res.status(200).json(appData);
    }
    })
    
});
// get admins


users.get('/getAdmins',function(req,res){
    var appData={
        "error":"1",
        "data":""
    }

    database.connection.getConnection(function(err,connection){
        if(!err){
            console.log('connected to database');
        connection.query("select name from users where status='Not yet approved'",function(err,data){
            if(!err){
                appData.error=0;
                res.send(data);
                //appData["data"]=data;
               // res.status(201).json(appData);
            }
            else{
                appData.error=1;
                appData["data"]=data;
                res.status(200).json(appData);
            }
        })
    }
    else{
        console.log('not connected to db');
        appData.error=1;
        appData["data"]=err;
        res.status(200).json(appData);
    }
    })
    
});

users.post('/getLeaveData',upload.single('file'),function(req,res){
    var appData={
        "error":"1",
        "data":""
    }
    var name=req.body.name;
    console.log(name);
    database.connection.getConnection(function(err,connection){
        if(!err){
            connection.query("select name,reason,fullid,fromdays,todays,reqtype,status from users where name=? and status='Not yet approved'",[name],function(err,data){
                if(!err){
                    console.log('no error');
                    console.log(data['name'],data['reason'],data['fullid'],data['fromdays'],data['todays'],data['reqtype'],data['status']);
                appData.error=0;
                res.send(data[0]);
                
               //appData["data"]=data;
               //res.status(201).json(appData);    
                    
                    }
                else{
                    appData.error=1;
                    appData["data"]=err.first_name;
                    appData["data"]=err.reason;
                    appData["data"]=err.days;
                    appData["data"]=err;
                    res.status(200).json(appData);    
                }
            })
        }
        else{
            console.log('not connected to db');
        }
    })
})

users.post('/updateStatus',upload.single('file'),function(req,res){
    var appData={
        "error":"1",
        "data":""
    }
    var status=req.body.status;
    var fullid=req.body.fullid;
    console.log(status,fullid+" details are")
    database.connection.getConnection(function(err,connection){
        if(!err){
            connection.query('select name from users where fullid=?',[fullid],function(err,data){ 
                var name=data[0].name;
                console.log(name+' name is');

            connection.query("update users set status=? where status='Not yet approved' and fullid=?",[status,fullid],function(err,data){
                if(!err){
                    appData.error=0;
                    appData["data"]='status updated';
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
                        subject: 'Leave status',
                        
                        
                        text: 'Dear '+name+','+('\n')+'Your leave request has been '+status+'.'+('\n')+'Thanks and regards.'+('\n')+'Zyclyx'+'.'
                        
                    };
                      //console.log(details.title,details.description+"notice details")
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent for update leave status: ' + info.response);
                        }
                      });
                      
                      
                    

                }
                else{
                    appData.error=1;
                    appData["data"]=err;
                    res.status(200).json(appData);
                }
            })
        })
        }
        else{
            console.log('database not connected');
        }
    })

})




module.exports = users;