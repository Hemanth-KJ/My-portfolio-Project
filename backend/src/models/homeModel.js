import pool from "../config/db.js";

export const getHomeContent = async () => {
  const result = await pool.query(`
    SELECT
      id,
      section_number,
      total_sections,
      portfolio_year,
      top_label,
      index_number,
      index_label,
      eyebrow,
      title_line_1,
      title_line_2,
      title_line_3,
      description,
      primary_button_text,
      primary_button_link,
      secondary_button_text,
      secondary_button_link,
      visual_number,
      visual_label_line_1,
      visual_label_line_2,
      build_year,
      status,
      hero_image_url,
      created_at,
      updated_at
    FROM home_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};

export const getHomeTechnologies = async () => {
  const result = await pool.query(`
    SELECT
      id,
      technology_name,
      display_order
    FROM home_technologies
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};