import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import { renderHtml } from "./helper";

dotenv.config();
const app = express();

// Set up PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

app.get("/api", async (req, res) => {
  try {
    const {rows:result} = await pool.query("SELECT * FROM users");

    return res.status(200).json({
      message: "hello 5 jajaja",
      result,
    });
  } catch (err:any) {
    return res.status(500).json({
      message: err.message,
    });
  }
});


app.get("/{*any}", async (req, res) => {
  
      res.status(200).send(
        renderHtml({
          title: "nice"
        })
      );
});

module.exports = app;
