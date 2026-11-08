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


export const updateProjectsPage = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // =====================================================
    // UPDATE PAGE CONTENT
    // =====================================================

    const contentResult = await client.query(
      "SELECT id FROM projects_content ORDER BY id LIMIT 1 FOR UPDATE"
    );

    if (contentResult.rows.length === 0) {
      throw new Error("Projects page content not found.");
    }

    await client.query(
      `
      UPDATE projects_content
      SET
        section_number = $1,
        section_label = $2,
        header_right = $3,
        intro_kicker = $4,
        intro_title_line_1 = $5,
        intro_title_line_2 = $6,
        intro_description = $7,
        bottom_project_count = $8,
        bottom_project_label = $9,
        bottom_focus_value = $10,
        bottom_focus_label = $11,
        bottom_architecture_value = $12,
        bottom_architecture_label = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      `,
      [
        data.section.number,
        data.section.label,
        data.section.headerRight,
        data.intro.kicker,
        data.intro.title.line1,
        data.intro.title.line2,
        data.intro.description,
        data.bottom.projectCount,
        data.bottom.projectLabel,
        data.bottom.focusValue,
        data.bottom.focusLabel,
        data.bottom.architectureValue,
        data.bottom.architectureLabel,
        contentResult.rows[0].id,
      ]
    );

    // =====================================================
    // LOCK EXISTING PROJECTS
    // =====================================================

    await client.query(
      "SELECT id FROM projects ORDER BY id FOR UPDATE"
    );

    const retainedProjectIds = [];

    // =====================================================
    // INSERT / UPDATE PROJECTS
    // =====================================================

    for (let index = 0; index < data.projects.length; index++) {
      const project = data.projects[index];

      let projectId;

      if (project.id != null) {
        const result = await client.query(
          `
          UPDATE projects
          SET
            project_number = $1,
            category = $2,
            title = $3,
            description = $4,
            github_url = $5,
            live_url = $6,
            visual_status = $7,
            visual_year = $8,
            display_order = $9,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $10
          RETURNING id
          `,
          [
            project.number,
            project.category,
            project.title,
            project.description,
            project.github || null,
            project.live || null,
            project.visualStatus,
            project.visualYear,
            index,
            project.id,
          ]
        );

        if (result.rowCount !== 1) {
          throw new Error(
            `Project with ID ${project.id} does not exist.`
          );
        }

        projectId = result.rows[0].id;
      } else {
        const result = await client.query(
          `
          INSERT INTO projects (
            project_number,
            category,
            title,
            description,
            github_url,
            live_url,
            visual_status,
            visual_year,
            display_order,
            is_active
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, TRUE
          )
          RETURNING id
          `,
          [
            project.number,
            project.category,
            project.title,
            project.description,
            project.github || null,
            project.live || null,
            project.visualStatus,
            project.visualYear,
            index,
          ]
        );

        projectId = result.rows[0].id;
      }

      retainedProjectIds.push(projectId);

      // ===================================================
      // UPDATE PROJECT ITEMS
      // ===================================================

      // The public API exposes technologies and highlights
      // as string arrays rather than item IDs.
      // Replace this project's active items on each save.

      await client.query(
        `
        UPDATE project_items
        SET
          is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $1
          AND is_active = TRUE
        `,
        [projectId]
      );

      const items = [
        ...project.technologies.map((text) => ({
          type: "TECHNOLOGY",
          text,
        })),
        ...project.highlights.map((text) => ({
          type: "HIGHLIGHT",
          text,
        })),
      ];

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex];

        await client.query(
          `
          INSERT INTO project_items (
            project_id,
            item_type,
            item_text,
            display_order,
            is_active
          )
          VALUES ($1, $2, $3, $4, TRUE)
          `,
          [
            projectId,
            item.type,
            item.text,
            itemIndex,
          ]
        );
      }
    }

    // =====================================================
    // SOFT DELETE REMOVED PROJECTS
    // =====================================================

    await client.query(
      `
      UPDATE projects
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE NOT (id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [retainedProjectIds]
    );

    await client.query(
      `
      UPDATE project_items
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE NOT (project_id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [retainedProjectIds]
    );

    await client.query("COMMIT");

    return {
      success: true,
      projectCount: retainedProjectIds.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
