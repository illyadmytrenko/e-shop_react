/* eslint-disable @typescript-eslint/no-require-imports */
import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.MYSQL_URL);

export default pool;
