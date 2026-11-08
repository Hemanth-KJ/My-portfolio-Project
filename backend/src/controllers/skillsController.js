
import {
  getSkillsContent,
  getSkillCategories,
  getSkills,
  updateSkillsPage as updateSkillsPageModel,
} from "../models/skillsModel.js";

export const getSkillsPage = async (req, res) => {
  try {
    const content = await getSkillsContent();
    const categories = await getSkillCategories();
    const skills = await getSkills();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Skills content not found",
      });
    }

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      number: category.category_number,
      name: category.category_name,

      skills: skills
        .filter((skill) => skill.category_id === category.id)
        .map((skill) => ({
          id: skill.id,
          name: skill.skill_name,
          short: skill.short_code,
          description: skill.description,
        })),
    }));

    return res.status(200).json({
      success: true,
      data: {
        section: {
          number: content.section_number,
          label: content.section_label,
          headerRight: content.header_right,
        },

        intro: {
          kicker: content.intro_kicker,
          title: {
            line1: content.intro_title_line_1,
            line2: content.intro_title_line_2,
          },
          description: content.intro_description,
        },

        categories: formattedCategories,

        footer: {
          coreAreas: content.footer_core_areas,
          technologies: content.footer_technologies,
          mindset: content.footer_mindset,

          statement: [
            content.footer_statement_1,
            content.footer_statement_2,
            content.footer_statement_3,
          ],
        },
      },
    });
  } catch (error) {
    console.error("Get skills content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills content",
    });
  }
};

const isString = (value, maxLength) =>
  typeof value === "string" && value.length <= maxLength;

const validId = (value) =>
  value == null ||
  (Number.isInteger(value) && value > 0);

export const updateSkillsPage = async (req, res) => {
  try {
    const { section, intro, categories, footer } = req.body || {};

    if (
      !section ||
      !intro ||
      !intro.title ||
      !Array.isArray(categories) ||
      !footer ||
      !Array.isArray(footer.statement) ||
      footer.statement.length !== 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Skills page data.",
      });
    }

    const fields = [
      [section.number, 20],
      [section.label, 100],
      [section.headerRight, 100],
      [intro.kicker, 200],
      [intro.title.line1, 150],
      [intro.title.line2, 150],
      [intro.description, 10000],
      [footer.coreAreas, 20],
      [footer.technologies, 20],
      [footer.mindset, 20],
      ...footer.statement.map((value) => [value, 50]),
    ];

    if (fields.some(([value, limit]) => !isString(value, limit))) {
      return res.status(400).json({
        success: false,
        message: "One or more Skills page fields are invalid.",
      });
    }

    if (categories.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Maximum 30 skill categories allowed.",
      });
    }

    const categoryIds = new Set();
    const skillIds = new Set();

    for (const category of categories) {
      if (
        !category ||
        !validId(category.id) ||
        !isString(category.number, 20) ||
        !isString(category.name, 100) ||
        !Array.isArray(category.skills) ||
        category.skills.length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid skill category.",
        });
      }

      if (category.id != null) {
        if (categoryIds.has(category.id)) {
          return res.status(400).json({
            success: false,
            message: "Duplicate category ID.",
          });
        }

        categoryIds.add(category.id);
      }

      for (const skill of category.skills) {
        if (
          !skill ||
          !validId(skill.id) ||
          !isString(skill.name, 100) ||
          !isString(skill.short, 20) ||
          !isString(skill.description, 10000)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid skill entry.",
          });
        }

        if (skill.id != null) {
          if (skillIds.has(skill.id)) {
            return res.status(400).json({
              success: false,
              message: "Duplicate skill ID.",
            });
          }

          skillIds.add(skill.id);
        }
      }
    }

    await updateSkillsPageModel({
      section,
      intro,
      categories,
      footer,
    });

    return res.status(200).json({
      success: true,
      message: "Skills page updated successfully.",
    });
  } catch (error) {
    console.error("Update Skills page error:", error);

    if (
      error.message === "Invalid skill category ID." ||
      error.message === "Invalid skill ID for its category." ||
      error.message === "Skills page content does not exist."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update Skills page.",
    });
  }
};
