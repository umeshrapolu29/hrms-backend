var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DB = process.env.DB;

var connection = mysql.createPool({
    host:HOST,
    user:USER,
    password:PASSWORD,
    database:DB
});
module.exports.connection = connection;