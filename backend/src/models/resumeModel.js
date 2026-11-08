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


/* =========================================================
   UPDATE RESUME PAGE
========================================================= */

export const updateResumePage = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const contentResult = await client.query(`
      SELECT id
      FROM resume_content
      ORDER BY id
      LIMIT 1
      FOR UPDATE
    `);

    if (!contentResult.rows.length) {
      throw new Error("Resume content not found");
    }

    const contentId = contentResult.rows[0].id;

    /* =====================================================
       UPDATE RESUME CONTENT
    ===================================================== */

    await client.query(
      `
      UPDATE resume_content
      SET
        section_number = $1,
        section_label = $2,
        hero_kicker = $3,
        hero_name_line_1 = $4,
        hero_name_line_2 = $5,
        hero_description = $6,
        availability_status = $7,
        resume_pdf_url = $8,
        cta_label = $9,
        cta_title_line_1 = $10,
        cta_title_line_2 = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      `,
      [
        data.section.number,
        data.section.label,
        data.hero.kicker,
        data.hero.name.line1,
        data.hero.name.line2,
        data.hero.description,
        data.hero.availability,
        data.resumePdfUrl,
        data.cta.label,
        data.cta.title.line1,
        data.cta.title.line2,
        contentId,
      ]
    );

    /* =====================================================
       LOCK EXISTING ROWS
    ===================================================== */

    await client.query(
      "SELECT id FROM resume_experience ORDER BY id FOR UPDATE"
    );
    await client.query(
      "SELECT id FROM resume_education ORDER BY id FOR UPDATE"
    );
    await client.query(
      "SELECT id FROM resume_skills ORDER BY id FOR UPDATE"
    );

    /* =====================================================
       EXPERIENCE
    ===================================================== */

    const experienceIds = [];

    for (const [index, item] of data.experience.entries()) {
      let id;

      if (item.id != null) {
        const result = await client.query(
          `
          UPDATE resume_experience
          SET
            year = $1,
            role = $2,
            experience_type = $3,
            description = $4,
            display_order = $5,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
          RETURNING id
          `,
          [
            item.year,
            item.role,
            item.type,
            item.description,
            index,
            item.id,
          ]
        );

        if (!result.rowCount) {
          throw new Error(
            `Experience ID ${item.id} not found`
          );
        }

        id = result.rows[0].id;
      } else {
        const result = await client.query(
          `
          INSERT INTO resume_experience
          (
            year,
            role,
            experience_type,
            description,
            display_order
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
          `,
          [
            item.year,
            item.role,
            item.type,
            item.description,
            index,
          ]
        );

        id = result.rows[0].id;
      }

      experienceIds.push(id);
    }

    await client.query(
      `
      UPDATE resume_experience
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE NOT (id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [experienceIds]
    );

    /* =====================================================
       EDUCATION
    ===================================================== */

    const educationIds = [];

    for (const [index, item] of data.education.entries()) {
      let id;

      if (item.id != null) {
        const result = await client.query(
          `
          UPDATE resume_education
          SET
            year = $1,
            degree = $2,
            institution = $3,
            display_order = $4,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING id
          `,
          [
            item.year,
            item.degree,
            item.institution,
            index,
            item.id,
          ]
        );

        if (!result.rowCount) {
          throw new Error(
            `Education ID ${item.id} not found`
          );
        }

        id = result.rows[0].id;
      } else {
        const result = await client.query(
          `
          INSERT INTO resume_education
          (
            year,
            degree,
            institution,
            display_order
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [
            item.year,
            item.degree,
            item.institution,
            index,
          ]
        );

        id = result.rows[0].id;
      }

      educationIds.push(id);
    }

    await client.query(
      `
      UPDATE resume_education
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE NOT (id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [educationIds]
    );

    /* =====================================================
       TECHNICAL SKILLS
    ===================================================== */

    // Skills are returned as strings, not objects with IDs.
    // Rebuild active skill entries on each save.

    await client.query(`
      UPDATE resume_skills
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE is_active = TRUE
    `);

    for (const [index, skill] of data.skills.entries()) {
      await client.query(
        `
        INSERT INTO resume_skills
        (
          skill_name,
          display_order,
          is_active
        )
        VALUES ($1, $2, TRUE)
        `,
        [skill, index]
      );
    }

    await client.query("COMMIT");

    return {
      experienceCount: experienceIds.length,
      educationCount: educationIds.length,
      skillsCount: data.skills.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
