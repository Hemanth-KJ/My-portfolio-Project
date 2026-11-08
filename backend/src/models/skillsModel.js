
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
    ORDER BY display_order ASC, id ASC
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
    ORDER BY category_id, display_order ASC, id ASC
  `);

  return result.rows;
};

export const updateSkillsPage = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const contentResult = await client.query(
      `
      UPDATE skills_content
      SET
        section_number = $1,
        section_label = $2,
        header_right = $3,
        intro_kicker = $4,
        intro_title_line_1 = $5,
        intro_title_line_2 = $6,
        intro_description = $7,
        footer_core_areas = $8,
        footer_technologies = $9,
        footer_mindset = $10,
        footer_statement_1 = $11,
        footer_statement_2 = $12,
        footer_statement_3 = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (
        SELECT id
        FROM skills_content
        ORDER BY id
        LIMIT 1
      )
      RETURNING id
      `,
      [
        data.section.number,
        data.section.label,
        data.section.headerRight,
        data.intro.kicker,
        data.intro.title.line1,
        data.intro.title.line2,
        data.intro.description,
        data.footer.coreAreas,
        data.footer.technologies,
        data.footer.mindset,
        ...data.footer.statement,
      ]
    );

    if (contentResult.rowCount === 0) {
      throw new Error("Skills page content does not exist.");
    }

    // Preserve existing IDs where possible.
    const existingCategories = await client.query(
      "SELECT id FROM skill_categories FOR UPDATE"
    );

    const existingCategoryIds = new Set(
      existingCategories.rows.map((row) => row.id)
    );

    const retainedCategoryIds = [];
    const retainedSkillIds = [];

    for (const [categoryIndex, category] of data.categories.entries()) {
      let categoryId;

      if (category.id != null) {
        if (!existingCategoryIds.has(category.id)) {
          throw new Error("Invalid skill category ID.");
        }

        categoryId = category.id;

        await client.query(
          `
          UPDATE skill_categories
          SET
            category_number = $1,
            category_name = $2,
            display_order = $3,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          `,
          [
            category.number,
            category.name,
            categoryIndex,
            categoryId,
          ]
        );
      } else {
        const insertedCategory = await client.query(
          `
          INSERT INTO skill_categories (
            category_number,
            category_name,
            display_order,
            is_active
          )
          VALUES ($1, $2, $3, TRUE)
          RETURNING id
          `,
          [category.number, category.name, categoryIndex]
        );

        categoryId = insertedCategory.rows[0].id;
      }

      retainedCategoryIds.push(categoryId);

      const existingSkills = await client.query(
        "SELECT id FROM skills WHERE category_id = $1 FOR UPDATE",
        [categoryId]
      );

      const existingSkillIds = new Set(
        existingSkills.rows.map((row) => row.id)
      );

      for (const [skillIndex, skill] of category.skills.entries()) {
        if (skill.id != null) {
          if (!existingSkillIds.has(skill.id)) {
            throw new Error("Invalid skill ID for its category.");
          }

          await client.query(
            `
            UPDATE skills
            SET
              skill_name = $1,
              short_code = $2,
              description = $3,
              display_order = $4,
              is_active = TRUE,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            `,
            [
              skill.name,
              skill.short,
              skill.description,
              skillIndex,
              skill.id,
            ]
          );

          retainedSkillIds.push(skill.id);
        } else {
          const insertedSkill = await client.query(
            `
            INSERT INTO skills (
              category_id,
              skill_name,
              short_code,
              description,
              display_order,
              is_active
            )
            VALUES ($1, $2, $3, $4, $5, TRUE)
            RETURNING id
            `,
            [
              categoryId,
              skill.name,
              skill.short,
              skill.description,
              skillIndex,
            ]
          );

          retainedSkillIds.push(insertedSkill.rows[0].id);
        }
      }
    }

    // Soft-delete skills removed from the editor.
    await client.query(
      `
      UPDATE skills
      SET is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
      WHERE NOT (id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [retainedSkillIds]
    );

    // Soft-delete categories removed from the editor.
    await client.query(
      `
      UPDATE skill_categories
      SET is_active = FALSE,
          updated_at = CURRENT_TIMESTAMP
      WHERE NOT (id = ANY($1::integer[]))
        AND is_active = TRUE
      `,
      [retainedCategoryIds]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
