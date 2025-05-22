/* eslint-disable @typescript-eslint/no-require-imports */
import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.VITE_MYSQL_URL);

export default pool;
