import pool from "../config/db.js";

// =========================================================
// GET PROJECTS PAGE CONTENT
// =========================================================

export const getProjectsContent = async () => {
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
      bottom_project_count,
      bottom_project_label,
      bottom_focus_value,
      bottom_focus_label,
      bottom_architecture_value,
      bottom_architecture_label
    FROM projects_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};


// =========================================================
// GET ACTIVE PROJECTS
// =========================================================

export const getProjects = async () => {
  const result = await pool.query(`
    SELECT
      id,
      project_number,
      category,
      title,
      description,
      github_url,
      live_url,
      visual_status,
      visual_year,
      display_order
    FROM projects
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};


// =========================================================
// GET PROJECT ITEMS
// TECHNOLOGIES + HIGHLIGHTS
// =========================================================

export const getProjectItems = async () => {
  const result = await pool.query(`
    SELECT
      id,
      project_id,
      item_type,
      item_text,
      display_order
    FROM project_items
    WHERE is_active = true
    ORDER BY project_id ASC, display_order ASC
  `);

  return result.rows;
};