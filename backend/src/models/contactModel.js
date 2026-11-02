import pool from "../config/db.js";

// =========================================================
// GET CONTACT CONTENT
// =========================================================

export const getContactContent = async () => {
  const result = await pool.query(`
    SELECT *
    FROM contact_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};

// =========================================================
// GET CONTACT LINKS
// =========================================================

export const getContactLinks = async () => {
  const result = await pool.query(`
    SELECT
      id,
      link_label,
      link_url,
      display_order
    FROM contact_links
    WHERE is_active = TRUE
    ORDER BY display_order ASC
  `);

  return result.rows;
};

// =========================================================
// CREATE CONTACT MESSAGE
// =========================================================

export const createContactMessage = async (name, email, message) => {
  const result = await pool.query(
    `
      INSERT INTO contact_messages (
        name,
        email,
        message
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        email,
        message,
        status,
        created_at
    `,
    [name, email, message]
  );

  return result.rows[0];
};