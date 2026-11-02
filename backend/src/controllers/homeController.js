import {
  getHomeContent,
  getHomeTechnologies,
} from "../models/homeModel.js";

export const getHome = async (req, res) => {
  try {
    const homeContent = await getHomeContent();
    const technologies = await getHomeTechnologies();

    if (!homeContent) {
      return res.status(404).json({
        success: false,
        message: "Home content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sectionNumber: homeContent.section_number,
        totalSections: homeContent.total_sections,
        portfolioYear: homeContent.portfolio_year,

        topLabel: homeContent.top_label,

        indexNumber: homeContent.index_number,
        indexLabel: homeContent.index_label,

        eyebrow: homeContent.eyebrow,

        title: {
          line1: homeContent.title_line_1,
          line2: homeContent.title_line_2,
          line3: homeContent.title_line_3,
        },

        description: homeContent.description,

        buttons: {
          primary: {
            text: homeContent.primary_button_text,
            link: homeContent.primary_button_link,
          },

          secondary: {
            text: homeContent.secondary_button_text,
            link: homeContent.secondary_button_link,
          },
        },

        technologies: technologies.map(
          (technology) => technology.technology_name
        ),

        visual: {
          number: homeContent.visual_number,
          labelLine1: homeContent.visual_label_line_1,
          labelLine2: homeContent.visual_label_line_2,
          buildYear: homeContent.build_year,
          status: homeContent.status,
          heroImage: homeContent.hero_image_url,
        },
      },
    });
  } catch (error) {
    console.error("Get home content error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch home content",
    });
  }
};