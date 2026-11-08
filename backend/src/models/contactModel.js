import pool from "../config/db.js";

// =========================================================
// GET CONTACT CONTENT
// =========================================================

export const getContactContent = async () => {
  const result = await pool.query(`
    SELECT *
    FROM contact_content
    ORDER BY id
    LIMIT 1
  `);

  return result.rows[0];
};

// =========================================================
// GET CONTACT LINKS
// =========================================================

export const getContactLinks = async () => {
  const result = await pool.query(`
    SELECT
      id,
      link_label,
      link_url,
      display_order
    FROM contact_links
    WHERE is_active = TRUE
    ORDER BY display_order ASC
  `);

  return result.rows;
};

// =========================================================
// CREATE CONTACT MESSAGE
// =========================================================

export const createContactMessage = async (name, email, message) => {
  const result = await pool.query(
    `
      INSERT INTO contact_messages (
        name,
        email,
        message
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        email,
        message,
        status,
        created_at
    `,
    [name, email, message]
  );

  return result.rows[0];
};


/* =========================================================
   UPDATE CONTACT PAGE
========================================================= */

export const updateContactPage = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* =====================================================
       LOCK CONTACT CONTENT
    ===================================================== */

    const contentResult = await client.query(`
      SELECT id
      FROM contact_content
      ORDER BY id
      LIMIT 1
      FOR UPDATE
    `);

    if (!contentResult.rows.length) {
      throw new Error("Contact content not found");
    }

    const contentId = contentResult.rows[0].id;

    /* =====================================================
       UPDATE CONTENT
    ===================================================== */

    await client.query(
      `
      UPDATE contact_content
      SET
        section_number = $1,
        section_label = $2,
        availability_status = $3,
        hero_kicker = $4,
        hero_title_line_1 = $5,
        hero_title_line_2 = $6,
        hero_description = $7,
        primary_email = $8,
        info_section_number = $9,
        info_section_title = $10,
        info_description = $11,
        form_section_number = $12,
        form_section_title = $13,
        footer_number = $14,
        footer_label = $15,
        footer_message = $16,
        footer_logo = $17,
        footer_copy = $18,
        footer_role = $19,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
      `,
      [
        data.section.number,
        data.section.label,
        data.availability,
        data.hero.kicker,
        data.hero.title.line1,
        data.hero.title.line2,
        data.hero.description,
        data.hero.email,
        data.info.sectionNumber,
        data.info.title,
        data.info.description,
        data.form.sectionNumber,
        data.form.title,
        data.footer.number,
        data.footer.label,
        data.footer.message,
        data.footer.logo,
        data.footer.copy,
        data.footer.role,
        contentId,
      ]
    );

    /* =====================================================
       LOCK LINKS
    ===================================================== */

    await client.query(`
      SELECT id
      FROM contact_links
      ORDER BY id
      FOR UPDATE
    `);

    const retainedIds = [];

    /* =====================================================
       ADD / UPDATE LINKS
    ===================================================== */

    for (const [index, link] of data.links.entries()) {
      let id;

      if (link.id != null) {
        const result = await client.query(
          `
          UPDATE contact_links
          SET
            link_label = $1,
            link_url = $2,
            display_order = $3,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING id
          `,
          [
            link.label,
            link.url,
            index,
            link.id,
          ]
        );

        if (!result.rowCount) {
          throw new Error(
            `Contact link ID ${link.id} not found`
          );
        }

        id = result.rows[0].id;
      } else {
        const result = await client.query(
          `
          INSERT INTO contact_links (
            link_label,
            link_url,
            display_order,
            is_active
          )
          VALUES ($1, $2, $3, TRUE)
          RETURNING id
          `,
          [
            link.label,
            link.url,
            index,
          ]
        );

        id = result.rows[0].id;
      }

      retainedIds.push(id);
    }

    /* =====================================================
       SOFT DELETE REMOVED LINKS
    ===================================================== */

    await client.query(
      `
      UPDATE contact_links
      SET
        is_active = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE NOT (id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [retainedIds]
    );

    await client.query("COMMIT");

    return {
      linksCount: retainedIds.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
