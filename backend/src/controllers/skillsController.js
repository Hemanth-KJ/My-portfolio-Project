import {
  getSkillsContent,
  getSkillCategories,
  getSkills,
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

    res.status(200).json({
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

    res.status(500).json({
      success: false,
      message: "Failed to fetch skills content",
    });
  }
};