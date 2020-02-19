var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var bodyparser = require("body-parser");
var session=require('express-session');
var cookieparser=require('cookie-parser');
var token;
var bcrypt = require('bcryptjs');
var base64=require('file-base64');
var multer=require('multer');
var replace=require('replace-string')
var request=require('request');
//var upload=multer({dest:'uploads/'});
var fs=require('fs');
//var multipart=require('connect-multiparty');
users.use(cors());
users.use('/uploads',express.static('uploads'));
users.use(bodyparser.json());
process.env.SECRET_KEY = "sampath";


users.use(bodyparser.urlencoded({
    extended: false
}));

var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,__dirname +'/uploads/images');
    },
     filename:function(req,file,cb){
        // console.log(new Date().getMinutes+"time before");
         var file=file.originalname;
        cb(null,file);
        console.log(file+"file name is");
  
    }
});
var upload=multer({storage:storage});


users.post('/request',upload.single('imageproduct'),function(req,res){
    var appData = {
        "error": 1,
        "data": ""
    };


    
        var name=req.body.name;
        var file= 'http://localhost:3000/images/'+req.file.originalname;
        var image='/images/'+req.file.originalname;
        var month=req.body.month;
        var year=req.body.year;
    
    console.log(name,file,month,year+' details are');
    database.connection.getConnection(function(err,connection){
        if(!err)
        {
            connection.query("select fullid from users where name=?",[name],function(err,data){
                var fullid=data[0].fullid;
                console.log(name,file,month,year,fullid+' details are');
            connection.query("insert into payslips (file,month,year,name,fullid,image) values(?,?,?,?,?,?)",[file,month,year,name,fullid,image],function(err,data){
                if(err)
                { 
                    console.log(err);
                   res.send(err);
                   appData["error"] = 1;
                   appData["data"] = "Internal query Error";
                }
                else{
                    console.log(data);
                  
                    appData.error = 0;
                    res.send(data);
                   // appData["data"] = data;
                 
                }
    
               })
            })
        }
        else{
      
                                res.send('not connected');
           
        }
           
            connection.release();
        
    })    

});

//get payslips


//get payslips
users.post('/getPayslips',upload.single('file'),function (req, res) {
    var appData = {
        "error": 1,
        "data": ""
    };


  
    var fullid=req.body.fullid;
    var month=req.body.month;
    var year=req.body.year;
   // var name=req.body.name;
   console.log(fullid+' fullid is');
   console.log(fullid,month,year+'  details are');
    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT file FROM payslips where fullid=? and month=? and year=?',[fullid,month,year],function (err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    res.send(rows);
                    console.log(rows+' data path');
                   // appData["data"] = rows[0];
                    //res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});

users.post('/download',upload.single('file'),function(req, res){
    var appData = {
        "error": 1,
        "data": ""
    };
    console.log('download page')
    var month=req.body.month;
    var year=req.body.year;
    var fullid=req.body.fullid;
    console.log(month,year,fullid+' details are in download')
    database.connection.getConnection(function(err,connection){
if(err){
    console.log(err+' error in connection');
}
        else{
        connection.query('select image from payslips where month=? and year=? and fullid=?',[month,year,fullid],function(err,data){
          //  var img=data[0]['image'];
          if(!err){
          var img=data[0]["image"];
            console.log(img+'  image is')
            var file = __dirname +'/uploads/'+img;
    
    appData.error=0;
    res.send(file);
        console.log('no error')
       // res.send('no error')
          
          }
          else
{
    console.log(err+' error is');
}
        
  });

        }

})
    
})

//get users data

users.get('/getEmployeeNames',function (req, res) {

    var appData = {};

    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT name FROM users',function (err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    res.send(rows);
                   // appData["data"] = rows[0];
                    //res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});

// Delete users data


//get users data

// users.get('/deleteData',verifyToken, function (req, res) {

//     var appData = {};

//     database.connection.getConnection(function (err, connection) {
//         if (err) {
//             appData["error"] = 1;
//             appData["data"] = "Internal Server Error";
//             res.status(500).json(appData);
//         } else {
//             connection.query("alter table payslips drop ",function (err, rows, fields) {
//                 if (!err) {
//                     appData["error"] = 0;
//                     res.send(rows);
//                    // appData["data"] = rows[0];
//                     //res.status(200).json(appData);
//                 } else {
//                     appData["data"] = "No data found";
//                     res.status(204).json(appData);
//                 }
//             });
//             connection.release();
//         }
//     });
// });

module.exports = users;
