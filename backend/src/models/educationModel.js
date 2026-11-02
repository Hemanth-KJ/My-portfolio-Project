import pool from "../config/db.js";

// ============================================================
// EDUCATION PAGE CONTENT
// ============================================================

export const getEducationContent = async () => {
  const result = await pool.query(`
    SELECT
      id,
      section_number,
      section_label,
      intro_eyebrow,
      intro_title_line_1,
      intro_title_line_2,
      bottom_label,
      bottom_description
    FROM education_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};


// ============================================================
// EDUCATION TIMELINE ITEMS
// ============================================================

export const getEducationItems = async () => {
  const result = await pool.query(`
    SELECT
      id,
      year,
      item_number,
      title,
      institution,
      description,
      status,
      display_order
    FROM education_items
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};