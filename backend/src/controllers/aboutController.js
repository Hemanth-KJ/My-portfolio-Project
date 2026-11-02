import {
  getAboutContent,
  getAboutPhilosophy,
  getAboutPrinciples,
  getAboutStack,
} from "../models/aboutModel.js";


// ============================================================
// GET ABOUT PAGE
// ============================================================

export const getAbout = async (req, res) => {
  try {
    const aboutContent = await getAboutContent();
    const philosophy = await getAboutPhilosophy();
    const principles = await getAboutPrinciples();
    const stack = await getAboutStack();

    if (!aboutContent) {
      return res.status(404).json({
        success: false,
        message: "About content not found",
      });
    }

    if (!philosophy) {
      return res.status(404).json({
        success: false,
        message: "About philosophy not found",
      });
    }

    res.status(200).json({
      success: true,

      data: {
        section: {
          index: aboutContent.section_index,
          label: aboutContent.section_label,
        },

        intro: {
          eyebrow: aboutContent.eyebrow,

          title: {
            line1: aboutContent.title_line_1,
            line2: aboutContent.title_line_2,
            line3: aboutContent.title_line_3,
          },
        },

        profile: {
          image: aboutContent.profile_image_url,
          name: aboutContent.profile_name,
          number: aboutContent.profile_number,
          caption: aboutContent.profile_caption,
        },

        about: {
          number: aboutContent.copy_number,
          heading: aboutContent.copy_heading,
          introduction: aboutContent.introduction,
          technicalFocus: aboutContent.technical_focus,
        },

        link: {
          text: aboutContent.link_text,
          url: aboutContent.link_url,
        },

        philosophy: {
          sectionNumber: philosophy.section_number,
          sectionLabel: philosophy.section_label,
          title: philosophy.title,
          introduction: philosophy.introduction,

          principles: principles.map((principle) => ({
            number: principle.principle_number,
            title: principle.title,
            description: principle.description,
          })),
        },

        stack: stack.map((technology) => ({
          id: technology.id,
          name: technology.technology_name,
          category: technology.category,
        })),
      },
    });
  } catch (error) {
    console.error("Get about content error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch about content",
    });
  }
};