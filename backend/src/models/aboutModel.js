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



export const updateAboutContent = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const contentResult = await client.query(
      `
      UPDATE about_content SET
        section_index = $1,
        section_label = $2,
        eyebrow = $3,
        title_line_1 = $4,
        title_line_2 = $5,
        title_line_3 = $6,
        profile_image_url = $7,
        profile_name = $8,
        profile_number = $9,
        profile_caption = $10,
        copy_number = $11,
        copy_heading = $12,
        introduction = $13,
        technical_focus = $14,
        link_text = $15,
        link_url = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT id FROM about_content ORDER BY id LIMIT 1
      )
      RETURNING id
      `,
      [
        data.section.index,
        data.section.label,
        data.intro.eyebrow,
        data.intro.title.line1,
        data.intro.title.line2,
        data.intro.title.line3,
        data.profile.image || null,
        data.profile.name,
        data.profile.number,
        data.profile.caption,
        data.about.number,
        data.about.heading,
        data.about.introduction,
        data.about.technicalFocus,
        data.link.text,
        data.link.url,
      ]
    );

    if (contentResult.rowCount === 0) {
      throw new Error("About content record not found.");
    }

    const philosophyResult = await client.query(
      `
      UPDATE about_philosophy SET
        section_number = $1,
        section_label = $2,
        title = $3,
        introduction = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT id FROM about_philosophy ORDER BY id LIMIT 1
      )
      RETURNING id
      `,
      [
        data.philosophy.sectionNumber,
        data.philosophy.sectionLabel,
        data.philosophy.title,
        data.philosophy.introduction,
      ]
    );

    if (philosophyResult.rowCount === 0) {
      throw new Error("About philosophy record not found.");
    }

    // Deactivate existing principles instead of deleting their history.
    await client.query(`
      UPDATE about_principles
      SET is_active = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE is_active = true
    `);

    for (let index = 0; index < data.philosophy.principles.length; index++) {
      const principle = data.philosophy.principles[index];

      await client.query(
        `
        INSERT INTO about_principles (
          principle_number,
          title,
          description,
          display_order,
          is_active
        )
        VALUES ($1, $2, $3, $4, true)
        `,
        [
          principle.number,
          principle.title,
          principle.description,
          index,
        ]
      );
    }

    // Deactivate existing stack entries instead of deleting their history.
    await client.query(`
      UPDATE about_stack
      SET is_active = false
      WHERE is_active = true
    `);

    for (let index = 0; index < data.stack.length; index++) {
      const technology = data.stack[index];

      await client.query(
        `
        INSERT INTO about_stack (
          technology_name,
          category,
          display_order,
          is_active
        )
        VALUES ($1, $2, $3, true)
        `,
        [
          technology.name,
          technology.category || null,
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
