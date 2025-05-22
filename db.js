/* eslint-disable @typescript-eslint/no-require-imports */
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.VITE_MYSQL_HOST,
  port: Number(process.env.VITE_MYSQL_PORT),
  user: process.env.VITE_MYSQL_USER,
  password: process.env.VITE_MYSQL_PASSWORD,
  database: process.env.VITE_MYSQL_DATABASE,
});

export default pool;
