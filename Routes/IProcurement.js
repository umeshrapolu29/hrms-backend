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

process.env.SECRET_KEY = "sampath";
var today = new Date();

users.use(bodyparser.urlencoded({
    extended: false
}));
users.use(bodyparser.json());

var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/images');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
    
});
var upload=multer({storage:storage});


users.post('/request',upload.single('imageproduct'),function(req,res){

    appData={
        "error":1,
        "data":""
    }
        var fullid=req.body.fullid;
         var item=req.body.item;
         var description=req.body.description;
         var amount=req.body.amount;
         var img= 'http://localhost:3000/images/'+ req.file.originalname;
       


       
         console.log(fullid,item,description,amount,img+"details are");
        

    database.connection.getConnection(function(err,connection){
        
        if(!err){

         connection.query('select id from reimbursement order by id desc limit 1',function(err,rows){
             if (rows.length > 0) {
                var indexid = rows[0].id + 1;
            }
            else {
                var indexid = 1;
            }
            console.log(today.getFullYear() + " year " + today.getMonth() + " month" + indexid);
            var year = today.getFullYear();
            var mon = today.getMonth() + 1;

            if (mon < 10) {
                var month = "0" + mon;
            }
            var tid='TID_'+year+'_'+mon+'_'+indexid;
            console.log(tid+' tid is');

            connection.query('select name from users where fullid=?',[fullid],function(err,data){
                var name=data[0].name;
                console.log(name);

    connection.query('insert into reimbursement(item,description,amount,photo,status,astatus,tid,fullid,Employee) values(?,?,?,?,?,?,?,?,?)',[item,description,amount,img,'false','Not yet approved',tid,fullid,name],function(err,data){
                    
            if(!err){

                console.log('details inserted');
                appData["error"]=0;
                appData["data"]="IProcurement details inserted";
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
                    subject: 'Reimbursement request from '+name+',',
                    
                    
                    text: 'Dear manager'+('\n')+'Please approve me the reimbursement request for the item is '+item+' for the purpose of '+description+' with the transaction id '+tid+' and the amount of this item is '+amount+'.'+('\n')+'Thanks and regards.'+('\n')+name+'.'
                    
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
                console.log('not inserted');
                console.log(err+"error is");
                appData["error"]=1;
                appData["data"]=err;
                res.status(200).json(appData);
            }
        
        })
    })
    });
        }
        else{
            console.log('not connected to database');
            appData.error=1;
            appData["data"]='not connected to database';
            res.status(200).json(appData);
        }
    
    });
    });

//get data of users

users.get('/getdata',function(req,res){
    appData={
        "error":1,
        "data":""
    }
    database.connection.getConnection(function(err,connection){
        if(!err){
            connection.query("select item,description,amount,tid,astatus from reimbursement where status='false' order by id desc",function(err,data){
                if(!err){
                    console.log('details inserted');
                    appData.error=0;
                   // appData["data"]=data;
                    res.send(data);
                    //res.status(201).json(appData);
                }
                else{
                    console.log(err+" error in query");
                    appData.error=1;
                    appData["data"]=err;
                    res.status(200).json(appData);
                }
            })

        }
        else{
            appData["error"]=1;
            appData["data"]=err;
        }
    })
});



//get data of users

users.post('/getSearchData',function(req,res){
    appData={
        "error":1,
        "data":""
    }
    var tid=req.body.tid;
    database.connection.getConnection(function(err,connection){
        if(!err){
            console.log(tid+'  id is')
            connection.query("select * from reimbursement where tid=?",[tid],function(err,rows,fields){
                if(!err){
                    appData.error=0;
                   console.log(rows+' data is');
                   // res.send(data[0].item);
                    //res.status(201).json(appData);
                    appData['data']=rows;
                    res.send(rows[0]);
                   // res.status(201).json(appData);
                }
                else{
                    console.log(err+" error in query");
                    appData.error=1;
                    appData["data"]=err;
                    res.status(200).json(appData);
                }
            })

        }
        else{
            appData["error"]=1;
            appData["data"]=err;
        }
    })
});







//get all users data
users.post('/getSearch',upload.single('file'),function(req, res){
    var appData = {
        "error": 1,
        "data": ""
    };
    var tid=req.body.tid;
    //var fullid=req.body.fullid;
    //var fullid='ZYX_2019_08_1';
    console.log(tid+"   getusers name is")
//var name='umesh rapolu'
    //console.log(fullid+'  full id is')
    database.connection.getConnection(function (err,connection) {
      
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query("SELECT * FROM reimbursement where tid=?",[tid],function (err, fields,rows) {
                if (!err) {
                    console.log(rows[0])+" rows";
                    console.log(fields+" fields")

                    appData.error = 0;
                    res.send(fields);
                  // appData["data"] = fields;
                    
                   // res.status(201).json(appData);

                    //appData["name"]=name;
                   // res.status(201).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(200).json(appData);
                }
            });
            
            
        }
    });

})



// get reimbursement data for admin

users.get('/getDataAdmin',function(req,res){
    appData={
        "error":1,
        "data":""
    }
    database.connection.getConnection(function(err,connection){
        if(!err){
            connection.query("select item,description,amount,tid,astatus,name,fullid from reimbursement where astatus='Not yet approved'",function(err,data){
                if(!err){
                    console.log('details inserted');
                    appData.error=0;
                   // appData["data"]=data;
                    res.send(data);
                    //res.status(201).json(appData);
                }
                else{
                    console.log(err+" error in query");
                    appData.error=1;
                    appData["data"]=err;
                    res.status(200).json(appData);
                }
            })

        }
        else{
            appData["error"]=1;
            appData["data"]=err;
        }
    })
});

// update users data
users.get('/update',function(req,res){
    var appData={
        "error":1,
        "data":""
    }
    database.connection.getConnection(function(err,connection){
        if(!err){
           console.log('connected to database');
            connection.query("update reimbursement set status='true' where status='false'",function(err,data){
            if(!err){
                console.log('query executed');
                appData.error=0;
                appData["data"]='procurement details updated';
                res.status(201).json(appData);
            }
            else{
                console.log('query not executed');
                appData.error=0;
                appData["data"]=err;
                res.status(200).json(appData);
            }
            });
        }
        else{
            console.log('database not connected');
            appData.error=1;
            appData["data"]='not connected to database';
            res.status(200).json(appData);

        }
    })
})


// update users data
users.post('/adminUpdate',upload.single('file'),function(req,res){
    var appData={
        "error":1,
        "data":""
    }
    var status=req.body.status;
    var tid=req.body.tid;
    var fullid=req.body.fullid;
    database.connection.getConnection(function(err,connection){
        if(!err){
           console.log(status,tid,fullid+'  connected to database');
           connection.query('select name from users where fullid=?',[fullid],function(err,data){ 
            var name=data[0]["name"];
            console.log(name+' name is');

            connection.query("update reimbursement set astatus=? where astatus='Not yet approved' and tid=?",[status,tid],function(err,data){
            if(!err){
                console.log('query executed');
                appData.error=0;
                appData["data"]='procurement details updated';
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
                    
                    
                    text: 'Dear '+name+','+('\n')+'Your reimbursement request has been '+status+'.'+('\n')+'Thanks and regards.'+('\n')+'Zyclyx'+'.'
                    
                };
                  //console.log(details.title,details.description+"notice details")
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent for Reimbursement status: ' + info.response);
                    }
                  });

            }
            else{
                console.log('query not executed');
                appData.error=0;
                appData["data"]=err;
                res.status(200).json(appData);
            }
            });
        });
        }
        else{
            console.log('database not connected');
            appData.error=1;
            appData["data"]='not connected to database';
            res.status(200).json(appData);

        }
    })
})


//get users for admin


users.get('/getUserName',function(req,res){
    appData={
        "error":1,
        "data":""
    }
    database.connection.getConnection(function(err,connection){
        if(!err){
            connection.query("select name from reimbursement where astatus='Not yet approved' order by id desc",function(err,data){
                if(!err){
                    console.log('details inserted');
                    appData.error=0;
                   // appData["data"]=data;
                    res.send(data);
                    //res.status(201).json(appData);
                }
                else{
                    console.log(err+" error in query");
                    appData.error=1;
                    appData["data"]=err;
                    res.status(200).json(appData);
                }
            })

        }
        else{
            appData["error"]=1;
            appData["data"]=err;
        }
    })
});


module.exports=users;