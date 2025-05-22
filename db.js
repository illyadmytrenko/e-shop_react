/* eslint-disable @typescript-eslint/no-require-imports */
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.VITE_MYSQLHOST,
  port: Number(process.env.VITE_MYSQLPORT),
  user: process.env.VITE_MYSQLUSER,
  password: process.env.VITE_MYSQLPASSWORD,
  database: process.env.VITE_MYSQLDATABASE,
});

export default pool;
