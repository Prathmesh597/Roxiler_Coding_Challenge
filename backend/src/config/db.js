const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

const promisePool = pool.promise();

promisePool.getConnection()
    .then(conn =>{
        console.log("Successfully connected to the MySQL database");
        conn.release();
    })
    .catch(err =>{
        console.error("Database connection failed:", err.message);
        
    })

module.exports = promisePool;
