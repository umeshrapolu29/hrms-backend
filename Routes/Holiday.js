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
  
users.post('/AddHoliday',upload.single('file'),function(req,res){
    var appData={
        "error":"1",
        "data":""
    }
    var appData={
        "error":"1",
        "data":""
    }
    //var today =new date();
    //var year=today.getFullYear();

    
        date=req.body.date,
       // fullid=req.body.fullid;
        reason=req.body.reason,
        holidaytype=req.body.holidaytype,
        dayofweek=req.body.dayofweek
      //  console.log(fullid+'  fullid is');
    
    var day=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var days=new Date(date);
     day=day[days.getDay()];
     console.log(date,reason,holidaytype,dayofweek+" details are")
     console.log(day+"day is");

     var str = date;
     var year = str.substring(0, 4);
   // var year=date.substring(date.length -4, date.length);
    console.log(date,reason,holidaytype,day,year+" all details");
    database.connection.getConnection(function(err,connection){
        if(!err){
            connection.query("insert into holiday(date,reason,holidaytype,dayofweek,year) values(?,?,?,?,?)",[date,reason,holidaytype,day,year],function(err,data){
               
                if(!err)
                {
                    console.log('data inserted');
                 //   res.send('data inserted');
                    appData.error=0;
                   // appData["data"]="values inserted succesfully.."
                   res.send('Record inserted')
                 //  res.status(201).json(appData);
                }
                else{
                    console.log(err)
                   // res.end(err);
                    appData.error=1;
                    appData["data"]=err;
                    res.status(400).json(appData);
                }
            })

        }
        else{
            res.end(err);
            appData.error=1;
            appData["data"]='not connected ';
        }
    })
    
})

  

   

    users.get('/ViewHoliday',upload.single('file'),function(req,res){

        var appData = {};
        var holidayType=req.body.holidayType;
        console.log(holidayType+' holiday type')
    var date=new Date();
    var getYear=date.getFullYear();
    console.log(getYear+"current year is");
    console.log(holidayType+'  holiday typ')
//var date=details.date;
   
    database.connection.getConnection(function(err,connection){
        if(!err){
    connection.query("select * from holiday where year=? and holidaytype=? order by id desc limit 5",[getYear,holidayType],function(err,rows){
        console.log('query executed')
        if(!err){
            appData["error"] = 0;
                    res.send(rows);
                   // res.status(200).json(appData);
        }
        else{
            appData["data"] = "No data found";
                    res.status(204).json(appData);
        }

    })


}
else{
    console.log(err)
}
})


/*else{
    appData.error=1;







    
    appData["data"]="connection lost";
   // res.status(400).json(appData);
   console.log('not connected');*/


})


    



module.exports=users;