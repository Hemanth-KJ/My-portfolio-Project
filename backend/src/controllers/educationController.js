import {
  getEducationContent,
  getEducationItems,
} from "../models/educationModel.js";


// ============================================================
// GET EDUCATION PAGE
// ============================================================

export const getEducation = async (req, res) => {
  try {

    const educationContent = await getEducationContent();
    const educationItems = await getEducationItems();


    // --------------------------------------------------------
    // CHECK PAGE CONTENT
    // --------------------------------------------------------

    if (!educationContent) {
      return res.status(404).json({
        success: false,
        message: "Education content not found",
      });
    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    res.status(200).json({
      success: true,

      data: {

        // ====================================================
        // SECTION
        // ====================================================

        section: {
          number: educationContent.section_number,
          label: educationContent.section_label,
        },


        // ====================================================
        // INTRO
        // ====================================================

        intro: {
          eyebrow: educationContent.intro_eyebrow,

          title: {
            line1: educationContent.intro_title_line_1,
            line2: educationContent.intro_title_line_2,
          },
        },


        // ====================================================
        // TIMELINE
        // ====================================================

        timeline: educationItems.map((item) => ({
          id: item.id,
          year: item.year,
          number: item.item_number,
          title: item.title,
          institution: item.institution,
          description: item.description,
          status: item.status,
        })),


        // ====================================================
        // BOTTOM
        // ====================================================

        bottom: {
          label: educationContent.bottom_label,
          description: educationContent.bottom_description,
        },

      },
    });

  } catch (error) {

    console.error(
      "Get education content error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch education content",
    });

  }
};