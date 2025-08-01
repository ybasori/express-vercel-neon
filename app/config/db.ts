import mysql from "mysql2/promise";

import { Pool } from "pg";

import dotenv from "dotenv";

dotenv.config();

const dbs: { [x: string]: Pool | mysql.Pool } = {
  webivert_app: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
  }),
};

export default dbs;
