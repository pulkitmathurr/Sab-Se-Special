//config.js
const mysql = require('mysql2');

//const nodemailer = require('nodemailer');
 const key = 'hgffgf@#w2324233@#<&>rgrt5433@';

 const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_sabse_spacial',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  module.exports = { pool,key };