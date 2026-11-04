import pool from "../config/db.js";

// =========================================================
// GET HOME CONTENT
// =========================================================

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

// =========================================================
// GET HOME TECHNOLOGIES
// =========================================================

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

// =========================================================
// UPDATE HOME CONTENT + TECHNOLOGIES
// =========================================================

export const updateHomeContent = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingHome = await client.query(`
      SELECT id
      FROM home_content
      ORDER BY id
      LIMIT 1
      FOR UPDATE
    `);

    if (existingHome.rows.length === 0) {
      const error = new Error("Home content not found.");
      error.status = 404;
      throw error;
    }

    const homeId = existingHome.rows[0].id;

    await client.query(
      `
        UPDATE home_content
        SET
          section_number = $1,
          total_sections = $2,
          portfolio_year = $3,
          top_label = $4,
          index_number = $5,
          index_label = $6,
          eyebrow = $7,
          title_line_1 = $8,
          title_line_2 = $9,
          title_line_3 = $10,
          description = $11,
          primary_button_text = $12,
          primary_button_link = $13,
          secondary_button_text = $14,
          secondary_button_link = $15,
          visual_number = $16,
          visual_label_line_1 = $17,
          visual_label_line_2 = $18,
          build_year = $19,
          status = $20,
          hero_image_url = $21,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $22
      `,
      [
        data.sectionNumber,
        data.totalSections,
        data.portfolioYear,
        data.topLabel,
        data.indexNumber,
        data.indexLabel,
        data.eyebrow,
        data.title.line1,
        data.title.line2,
        data.title.line3,
        data.description,
        data.buttons.primary.text,
        data.buttons.primary.link,
        data.buttons.secondary.text,
        data.buttons.secondary.link,
        data.visual.number,
        data.visual.labelLine1,
        data.visual.labelLine2,
        data.visual.buildYear,
        data.visual.status,
        data.visual.heroImage,
        homeId,
      ]
    );

    // Replace the existing technology list.
    await client.query(`
      DELETE FROM home_technologies
    `);

    for (let index = 0; index < data.technologies.length; index++) {
      await client.query(
        `
          INSERT INTO home_technologies (
            technology_name,
            display_order,
            is_active
          )
          VALUES ($1, $2, true)
        `,
        [data.technologies[index], index + 1]
      );
    }

    await client.query("COMMIT");

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};