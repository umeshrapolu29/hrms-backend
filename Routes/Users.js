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
var base64 =require('file-base64');
var multer=require('multer');
//var upload=multer({dest:'uploads/'});
var fs=require('fs');
//var multipart=require('connect-multiparty');
users.use(cors());
users.use('/uploads',express.static('uploads'));
users.use(bodyparser.json());
process.env.SECRET_KEY = "sampath";
var store=require('store');

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
 

//sample  test data 
users.post('/data', verifyToken, function (req, res) {
    console.log('in data');
    res.send('hai');
})






//User login and token verification

users.post('/login',upload.single('file'),function(req, res) {

  
    var appData = {};
    var fullid = req.body.fullid;
    var password = req.body.password;

    store.set('fullid', { name:fullid })
    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            console.log(err);
           // res.status(500).json(appData);
        } else {
            console.log(fullid + 'email is');
            console.log(password + 'pass is');
            console.log(' login page')
            connection.query('SELECT * FROM users WHERE fullid = ?', [fullid], function (err, rows, fields) {
                if (err) {

                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    console.log(err);
                    //res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        console.log(bcrypt.compareSync(password, rows[0].password));
                        if (bcrypt.compareSync(password, rows[0].password)) {
                            let token = jwt.sign(rows[0], process.env.SECRET_KEY, {
                                expiresIn: 1440
                            });
                            appData.error = 0;
                            appData["token"] = token;
                            appData["fullid"]=fullid;
                            res.status(200).json(appData);
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(201).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(201).json(appData);
                    }
                }
            });
            connection.release();
        }
    });
});








// token verification functionality..

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







//get all users data
users.get('/getUsers',function (req, res) {
    

        req.get
  var appData = {};
    var fid=store.get('fullid');
    console.log(fid+'  fid is');
    database.connection.getConnection(function (err, connection) {
        if (err) {
            console.log(req.token+' token is');
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT *FROM users where fullid="ZYX_2019_08_32"', function (err, rows, fields) {
                if (!err) {
                    
                    console.log(token+"token is");
                    var name=rows;
                    var email=rows[0];
                    //var image=rows[0].photo;
                    //console.log(image)
                   // const img = new Buffer(image, 'utf-8');
                    //var img = base64.decode(image);
                  // console.log(image+" decoded image");
                  console.log(name, email+' details are')
                 res.send(name);
                 //res.send(email);
                //    appData["email"] = name;
                //   appData["name"] = name;
                   

                   // res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});


module.exports = users;