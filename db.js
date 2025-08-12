// db.js
require('dotenv').config();
const mysql = require('mysql2');
const config = require('./config'); // adjust path as needed

const pool = mysql.createPool({

 
  // host:'localhost',
  // user:'hqmrvoda_phoenixs12',
  // password: 'gWVsx-8^%C8N',
  // database: 'hqmrvoda_phoenixtech',
  // port: 3306,
  // waitForConnections: true,
  // connectionLimit: 10, 
  // queueLimit: 0,

  host: config.database_host,
  user: config.database_user,
  password: config.database_password,
  database: config.database,
  port: config.database_port,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
});

// ✅ Use promise-based pool
module.exports = pool.promise();
