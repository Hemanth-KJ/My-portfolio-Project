import pool from "../config/db.js";

// ============================================================
// ABOUT CONTENT
// ============================================================

export const getAboutContent = async () => {
  const result = await pool.query(`
    SELECT
      id,
      section_index,
      section_label,
      eyebrow,
      title_line_1,
      title_line_2,
      title_line_3,
      profile_image_url,
      profile_name,
      profile_number,
      profile_caption,
      copy_number,
      copy_heading,
      introduction,
      technical_focus,
      link_text,
      link_url
    FROM about_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};


// ============================================================
// PHILOSOPHY
// ============================================================

export const getAboutPhilosophy = async () => {
  const result = await pool.query(`
    SELECT
      id,
      section_number,
      section_label,
      title,
      introduction
    FROM about_philosophy
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};


// ============================================================
// PRINCIPLES
// ============================================================

export const getAboutPrinciples = async () => {
  const result = await pool.query(`
    SELECT
      id,
      principle_number,
      title,
      description,
      display_order
    FROM about_principles
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};


// ============================================================
// STACK
// ============================================================

export const getAboutStack = async () => {
  const result = await pool.query(`
    SELECT
      id,
      technology_name,
      category,
      display_order
    FROM about_stack
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};