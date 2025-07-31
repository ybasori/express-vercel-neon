import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Set up PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

app.get("/", async (req, res) => {
  try {
    const {rows:result} = await pool.query("SELECT * FROM users");

    return res.status(200).json({
      message: "hello",
      result,
    });
  } catch (err:any) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

export default app;
