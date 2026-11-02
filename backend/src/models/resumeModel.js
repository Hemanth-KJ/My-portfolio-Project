import pool from "../config/db.js";

/* =========================================================
   RESUME CONTENT
========================================================= */

export const getResumeContent = async () => {
  const result = await pool.query(`
    SELECT
      id,
      section_number,
      section_label,
      hero_kicker,
      hero_name_line_1,
      hero_name_line_2,
      hero_description,
      availability_status,
      resume_pdf_url,
      cta_label,
      cta_title_line_1,
      cta_title_line_2
    FROM resume_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};


/* =========================================================
   EXPERIENCE
========================================================= */

export const getResumeExperience = async () => {
  const result = await pool.query(`
    SELECT
      id,
      year,
      role,
      experience_type,
      description,
      display_order
    FROM resume_experience
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};


/* =========================================================
   EDUCATION
========================================================= */

export const getResumeEducation = async () => {
  const result = await pool.query(`
    SELECT
      id,
      year,
      degree,
      institution,
      display_order
    FROM resume_education
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};


/* =========================================================
   SKILLS
========================================================= */

export const getResumeSkills = async () => {
  const result = await pool.query(`
    SELECT
      id,
      skill_name,
      display_order
    FROM resume_skills
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  return result.rows;
};


/* =========================================================
   PROJECTS
   Reuses existing projects table
========================================================= */

export const getResumeProjects = async () => {
  const projectsResult = await pool.query(`
    SELECT
      id,
      project_number,
      title,
      display_order
    FROM projects
    WHERE is_active = true
    ORDER BY display_order ASC
  `);

  const itemsResult = await pool.query(`
    SELECT
      id,
      project_id,
      item_text,
      display_order
    FROM project_items
    WHERE item_type = 'TECHNOLOGY'
      AND is_active = true
    ORDER BY project_id ASC, display_order ASC
  `);

  return projectsResult.rows.map((project) => {
    const technologies = itemsResult.rows
      .filter((item) => item.project_id === project.id)
      .map((item) => item.item_text);

    return {
      id: project.id,
      number: project.project_number,
      name: project.title.replace(/\n/g, " "),
      stack: technologies
        .map((technology) => technology.toUpperCase())
        .join(" · "),
    };
  });
};