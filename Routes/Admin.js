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
var request=require('request')
var alert=require('alert-node');
//var upload=multer({dest:'uploads/'});
var fs=require('fs');
//var multipart=require('connect-multiparty');
users.use(cors());
users.use('/uploads',express.static('uploads'));
users.use(bodyparser.json());
process.env.SECRET_KEY = "sampath";
var store = require('store');



users.use(bodyparser.urlencoded({
    extended: false
}));

var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/images');
    },
     filename:function(req,file,cb){
        // console.log(new Date().getMinutes+"time before");
         var file=file.originalname;
        cb(null,file);
        console.log(file+"file name is");
  
    }
});
var upload=multer({storage:storage});
        
// registration functinality 

users.post('/uploads',upload.single('imageproduct'),function(req,res) {
    //console.log(req.file);
    //var token=localStorage.getItem('token');
    //console.log(token+" token")
    var today = new Date();
    console.log("date is" + today);
    var appData = {
        "error": 1,
        "data": ""
 
    };
 
    
    var appData = {};
    var token=req.body.token;
    var id=req.body.id;
       var first_name= req.body.first_name;
       var last_name=req.body.last_name;
       var email=req.body.email;
       var password=req.body.password;
        var img= 'http://localhost:3000/images/'+ req.file.originalname;
        var img2=req.body.imageproduct;
        var DOJ=req.body.DOJ;
        var phone=req.body.phonenumber;
        var gender=req.body.gender;
        var DOB=req.body.DOB;   

        var created=today;
        
        
        store.set('fullid', { name:id })
        //store.get('user')

       console.log(img+" image is");
       console.log(token+" token")
      //  file=new Date().getMinutes+file;
        
     
    
      var name=first_name+' '+last_name;
      console.log(name+' name is');
        
        console.log(id+" id is");

       
       
       
   console.log(name,email,password,created,DOJ,phone,gender,DOB+"register deta");


 // fs.readFile(file,function(err,buff){
  // let img=buff.toString('base64');
   
  
    

    var emailCheckQuery = "select * from users where email=?";
  

    database.connection.getConnection(function (err, connection) {
        if (err) {
          
            console.log(err);
          //  res.status(500).json(appData);
        }

        else {
            connection.query((emailCheckQuery), [email], function (err, rows, fields) {
                //console.log(rows.length + " rows length");

                if (rows.length > 0) {
res.send('user already exists');
alert('email already exists')
                    appData["data"] = "user already exists";
                    
                    //res.send(appData);
                }
                else {

                    var id = connection.query("select id from users order by id desc limit 1", function (err, rows, fields) {
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

                        var fullid = "ZYX_" + year + "_" + month + "_" + indexid;
                        console.log(fullid + " full id");
                        //console.log(new Date().getMinutes()+"time after");
                        connection.query('INSERT INTO users (name,email,password,created,photo,fullid,phone,gender,DOB,DOJ) values(?,?,?,?,?,?,?,?,?,?)', [name, email, bcrypt.hashSync(password, 10),created,img,fullid,phone,gender,DOB,DOJ], function (err, rows, fields) {
                            if (!err) {
                                appData.error = 0;
                                console.log('registered')
                                appData["data"] = "User registered successfully!";
                                res.status(201).json(appData);
                              //  console.log(err);
                               /// res.status(201).json(appData);
                            }
                      
                            else {
                                console.log(err);
                                appData.error = 1;
                                appData["data"]=err;
                                res.status(200).json(appData);
                            }
                        });
                    });
                    
              
                }
            
                connection.release();

            });
        }
    });

});





   




//sample  test data 
users.post('/data', verifyToken, function (req, res) {
    console.log('in data');
    res.send('hii');
})







//User login and token verification

users.post('/login',upload.single('file'),function(req, res) {

    var appData = {};
    var email = req.body.email;
    var password = req.body.password;
console.log(email,password+' login details')
    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = err;
            res.status(500).json(appData);
        } else {
            console.log(email + 'email is');
            console.log(password + 'pass is');
            connection.query('SELECT * FROM admin WHERE email = ?', [email], function (err, rows, fields) {
                if (err) {

                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        console.log(bcrypt.compareSync(password, rows[0].password));
                        if (bcrypt.compareSync(password, rows[0].password)) {
                            let token = jwt.sign(rows[0], process.env.SECRET_KEY, {
                                expiresIn: 1440
                            });
                            appData.error = 0;
                            appData["token"]=token;
                            appData["email"]=email;
                            console.log(token,email+" values are");
                            console.log('authentication done')
                         //  appData["email"]=email;
                         //  res.send(token);
                           // res.send(email);
                           res.status(200).json(appData);
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(201).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not !";
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


users.post('request',function(req,res){
    var name="sampath";
});
users.get('getReq',function(req,res){
    request('http://localhost:3000/admin/request',function(err,res,body){
        console.log(err+' error');
        console.log(body+' body');

    })
});



//get all users data
users.post('/getUsers',upload.single('file'),function(req, res){
    var appData = {
        "error": 1,
        "data": ""
    };
    var fullid=req.body.fullid;
   
    //var fullid=req.body.fullid;
    //var fullid='ZYX_2019_08_1';
    console.log(fullid+"   getusers name is")
//var name='umesh rapolu'
    //console.log(fullid+'  full id is')
    database.connection.getConnection(function (err,connection) {
      
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query("SELECT * FROM users where fullid=?",[fullid],function (err, fields,rows) {
                if (!err) {
                    console.log(rows[0])+" rows";
                    console.log(fields[0]+" fields")

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


    
//get all users names list data
users.get('/getUsersData', function (req, res) {
    appData={"error":"1",
"data":""
}
const options={
    method:'POST',
    uri:'http://localhost:3000/admin/getUsers'
}
request(options,function(err,res,body){
    console.log(err+' error is')
    console.log(body+' response in response new');
   // res.send(body);
})

  

});

    
//get all users names list data
users.get('/getUsersList', function (req, res) {
    appData={"error":"1",
"data":""
}
const options={
    method:'POST',
    uri:'http://localhost:3000/admin/getUsers'
}
request(options,function(err,res,body){
    console.log(err+' error is')
    console.log(body+' response in response');
})

   // var fullid=req.body.id;
   var fullid=store.get('fullid');
    console.log(fullid+'  full id is')
    database.connection.getConnection(function (err,connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT name,fullid FROM users order by id desc',function (err, rows, fields) {
                if (!err) {
                    appData.error=0;
                    var name=rows;
                  
                    res.send(name);
                   
                    console.log(name+' name from db');
                    //appData['data']=name;
                  //  res.status(201).json(appData);


                
          //  base64.decode(rows[0].photo,rows=rows[0].url,function(err,success){

                console.log(err+"error message");
                 //     console.log(success+"success message");
                     // console.log(img+"image message");

                 
            
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            
            connection.release();
        }
    });

});
//get all admins
users.get('/getadmins',verifyToken, function (req, res) {

    var appData = {};

    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT *FROM admin', function (err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows[0].email;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});





//Admin login API....

users.post('/adminregister',upload.single('file'), function (req, res) {

    var today = new Date();
    console.log("date is" + today);
    var appData = {
        "error": 1,
        "data": ""
    };
    var userData = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": req.body.password,
        "created": today

    }

    var emailCheckQuery = "select * from admin where email=?";
    var check = "";

    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData.error = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
            console.log(err);
        }

        else {
            connection.query((emailCheckQuery), [userData.email], function (err, rows, fields) {
                console.log(rows.length + " rows length");

                if (rows.length > 0) {

                    appData["data"] = "user already exists";
                    res.status(201).json(appData);
                }
                else {

                    var id = connection.query("select id from admin order by id desc limit 1", function (err, rows, fields) {
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

                        var fullid = "ADMIN_ZYX_" + year + "_" + month + "_" + indexid;
                        console.log(fullid + " full id");

                        connection.query('INSERT INTO admin (first_name,last_name,email,password,created,fullid) values(?,?,?,?,?,?)', [userData.first_name, userData.last_name, userData.email, bcrypt.hashSync(userData.password, 10), userData.created, fullid], function (err, rows, fields) {
                            if (!err) {
                                appData.error = 0;
                                appData["data"] = "Admin registered successfully!";
                                res.status(201).json(appData);
                            }
                            else {
                                appData["data"] = "Error Occured!";
                                res.status(400).json(appData);
                            }
                        });
                    });
                }
                connection.release();

            });
        }
    });
});

//Admin login API....


users.post('/photoregister', function (req, res) {

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'uploads')
        },
        filename: function (req, file, cb) {
          cb(null, file.fieldname + '-' + Date.now())
        }
      })
       
    
   
   
    
        var today = new Date();
        console.log("date is" + today);
        var appData = {
            "error": 1,
            "data": ""
        };
        var userData = {
            "first_name": req.body.first_name,
            "last_name": req.body.last_name,
            "email": req.body.email,
            "password": req.body.password,
            "photo": photo,
            "created": today
    
        }

    var today = new Date();
 //   console.log(userData.photo+"photo here");
    console.log('image storing page');
    console.log("date is" + today);
    var appData = {
        "error": 1,
        "data": ""
    };
    var userData = {
       "photo":req.body.photo
    }

    var emailCheckQuery = "select * from admin where email=?";
    var check = "";

    database.connection.getConnection(function (err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        }

        else {
            connection.query((emailCheckQuery), [userData.email], function (err, rows, fields) {
                console.log(rows.length + " rows length");

                if (rows.length > 0) {

                    appData["data"] = "user already exists";
                    res.status(201).json(appData);
                }
                else {

                    var id = connection.query("select id from admin order by id desc limit 1", function (err, rows, fields) {
                        if (rows.length > 0) {
                            var indexid = rows[0].id + 1;
                            res.end('retrieved');
                            appData.error = 0;
                            appData["data"] = "details retieved successfully at admin!";

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

                        var fullid = "ADMIN_ZYX_" + year + "_" + month + "_" + indexid;
                        console.log(fullid + " full id");

                        connection.query('INSERT INTO users (first_name,last_name,email,password,created,fullid,photo) values(?,?,?,?,?,?,?)', ['ss', 'aa', 'mm', 'pp', 'aa','tt',userData.photo], function (err, rows, fields) {
                            if (!err) {
                                appData.error = 0;
                                appData["data"] = "Admin registered successfully!";
                                res.status(201).json(appData);
                            }
                            else {
                                console.log(err);
                                appData["data"] = err;
                                appData["data"] = "Error Occured...!";
                                res.status(400).json(appData);
                            }
                        });
                    });
                }
                connection.release();

            });
        }
    });
});


users.post('/request',function(req,res){



    var details={
        "reason":req.body.reason,
        "days":req.body.days,
        "type":req.body.type,
        "toRequest":req.body.toRequest
    }
    console.log(details.reason,details.days,details.type,details.toRequest+'details are');
    database.connection.getConnection(function(err,connection){
        if(!err)
        {
            connection.query("update users set reason=?,days=?,reqtype=?,requestto=? where first_name='sampath'",[details.reason, details.days, details.type, details.toRequest],function(err,data){
                if(err)
                { 
                    console.log(err);
                   res.send(err);
                   appData["error"] = 1;
                   appData["data"] = "Internal query Error";
                }
                else{
                    console.log(data);
                    res.send('inserted');
                    appData.error = 0;
                    appData["data"] = "details inserted successfully!";
                 
                }
    
               })
        }
        else{
      
                                res.send('not connected');
           
        }
           
            connection.release();
        
    })    

});













module.exports = users;