import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    if (password.length < 12) {
      throw new Error("Admin password must contain at least 12 characters.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_active = TRUE,
         updated_at = CURRENT_TIMESTAMP`,
      [email, passwordHash]
    );

    console.log(`Admin account seeded: ${email}`);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedAdmin();