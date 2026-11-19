
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Limit concurrent database connections
  max: 5,

  // Close idle connections after 30 seconds
  idleTimeoutMillis: 30000,

  // Fail connection attempts after 10 seconds
  connectionTimeoutMillis: 10000,

  // Keep TCP connections alive
  keepAlive: true,
});

pool.query("SELECT NOW()")
  .then((result) => {
    console.log("Supabase connected:", result.rows[0].now);
  })
  .catch((error) => {
    console.error("Supabase connection failed:", error.message);
  });

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export default pool;
