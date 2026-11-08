
import pool from "../config/db.js";

// ============================================================
// GET EDUCATION PAGE CONTENT
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
// GET EDUCATION TIMELINE ITEMS
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
    ORDER BY display_order ASC, id ASC
  `);

  return result.rows;
};

// ============================================================
// UPDATE EDUCATION PAGE
// ============================================================

export const updateEducation = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update the main Education content.
    const contentResult = await client.query(
      `
      UPDATE education_content
      SET
        section_number = $1,
        section_label = $2,
        intro_eyebrow = $3,
        intro_title_line_1 = $4,
        intro_title_line_2 = $5,
        bottom_label = $6,
        bottom_description = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT id
        FROM education_content
        ORDER BY id
        LIMIT 1
      )
      RETURNING id
      `,
      [
        data.section.number,
        data.section.label,
        data.intro.eyebrow,
        data.intro.title.line1,
        data.intro.title.line2,
        data.bottom.label,
        data.bottom.description,
      ]
    );

    if (contentResult.rowCount === 0) {
      throw new Error("Education content record not found.");
    }

    // Soft-delete previous active timeline entries.
    await client.query(`
      UPDATE education_items
      SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE is_active = true
    `);

    // Insert the updated timeline entries.
    for (let index = 0; index < data.timeline.length; index++) {
      const item = data.timeline[index];

      await client.query(
        `
        INSERT INTO education_items (
          year,
          item_number,
          title,
          institution,
          description,
          status,
          display_order,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        `,
        [
          item.year,
          item.number,
          item.title,
          item.institution,
          item.description,
          item.status,
          index,
        ]
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
