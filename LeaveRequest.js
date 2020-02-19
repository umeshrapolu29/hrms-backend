var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var bodyparser = require('body-parser');
var token;
var bcrypt = require('bcryptjs');
var multer=require('multer');
var fs=require('fs');
var multipart=require('connect-multiparty');
users.use(cors());
users.use(bodyparser.json());
process.env.SECRET_KEY = "sampath";

users.post('/LeaveRequest',function(req,res){



    var details={
        "reason":req.body.reason,
        "days":req.body.days,
        "type":req.body.type,
        "toRequest":req.body.toRequest
    }
    database.connection.getConnection(function(err,connection){
        if(err)
        {
            res.send(err);
        }
        else{
            var requestTo="select first_name from users";
           connection.query(requestTo,function(err,data){
            if(err)
            {
                res.send('sql exception');
                console.log(err);
            }
            else{
                var names=data.first_name;
            }
           });

           connection.query('insert into users(reason,days,reqtype,toRequest) values(?,?,?,?)',[details.reason, details.days, details.type, details.toRequest],function(errr,data){
            if(err)
            {
                res.send('problem in insertion');
                console.log(err)
            }
            else{
                res.send('data inserted');
                console.log('data inserted');
            }

           })
            connection.query()
        }
    })    

});