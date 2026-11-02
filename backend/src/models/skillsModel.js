import pool from "../config/db.js";

export const getSkillsContent = async () => {
  const result = await pool.query(`
    SELECT
      id,
      section_number,
      section_label,
      header_right,
      intro_kicker,
      intro_title_line_1,
      intro_title_line_2,
      intro_description,
      footer_core_areas,
      footer_technologies,
      footer_mindset,
      footer_statement_1,
      footer_statement_2,
      footer_statement_3
    FROM skills_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};

export const getSkillCategories = async () => {
  const result = await pool.query(`
    SELECT
      id,
      category_number,
      category_name,
      display_order
    FROM skill_categories
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};

export const getSkills = async () => {
  const result = await pool.query(`
    SELECT
      id,
      category_id,
      skill_name,
      short_code,
      description,
      display_order
    FROM skills
    WHERE is_active = true
    ORDER BY category_id, display_order ASC
  `);

  return result.rows;
};