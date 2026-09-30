// =================================
// AGNES MEMORIAL HOSPITAL DATABASE
// =================================

const mysql = require("mysql2");

// ---- ORIGINAL (single connection) - kept for reference ----
// const db = mysql.createConnection({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "agnes_hospital",
//     port: process.env.DB_PORT || 3306,
//     dateStrings: true
// });
//
// db.connect((err)=>{
//     if(err){
//         console.log("Database connection failed");
//         console.log(err);
//     }
//     else{
//         console.log("Database connected successfully");
//     }
// });

// ---- CORRECTED: connection pool ----
// A single connection gets closed by cloud MySQL after a while of no use
// and then every login fails. A pool reconnects by itself. db.query(...)
// is used exactly the same way, so server.js needs no change.
//
// Cloud databases (Aiven, TiDB Cloud, PlanetScale, Railway...) usually need
// SSL. On your host set DB_SSL=true to turn it on.
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "agnes_hospital",
    port: process.env.DB_PORT || 3306,
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

db.getConnection((err, connection)=>{
    if(err){
        console.log("Database connection failed");
        console.log(err);
    }
    else{
        console.log("Database connected successfully");
        connection.release();
    }
});

module.exports = db;