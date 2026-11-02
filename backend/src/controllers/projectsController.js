import {
  getProjectsContent,
  getProjects,
  getProjectItems,
} from "../models/projectsModel.js";


// =========================================================
// GET PROJECTS PAGE
// =========================================================

export const getProjectsPage = async (req, res) => {
  try {
    const content = await getProjectsContent();
    const projects = await getProjects();
    const items = await getProjectItems();

    // -------------------------------------------------------
    // CHECK CONTENT
    // -------------------------------------------------------

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Projects content not found",
      });
    }


    // -------------------------------------------------------
    // FORMAT PROJECTS
    // -------------------------------------------------------

    const formattedProjects = projects.map((project) => {

      const projectItems = items.filter(
        (item) => item.project_id === project.id
      );

      const technologies = projectItems
        .filter((item) => item.item_type === "TECHNOLOGY")
        .map((item) => item.item_text);

      const highlights = projectItems
        .filter((item) => item.item_type === "HIGHLIGHT")
        .map((item) => item.item_text);


      return {
        id: project.id,

        number: project.project_number,

        category: project.category,

        title: project.title,

        description: project.description,

        technologies,

        highlights,

        github: project.github_url,

        live: project.live_url,

        visualStatus: project.visual_status,

        visualYear: project.visual_year,
      };
    });


    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    res.status(200).json({
      success: true,

      data: {

        // ---------------------------------------------------
        // SECTION
        // ---------------------------------------------------

        section: {
          number: content.section_number,
          label: content.section_label,
          headerRight: content.header_right,
        },


        // ---------------------------------------------------
        // INTRO
        // ---------------------------------------------------

        intro: {
          kicker: content.intro_kicker,

          title: {
            line1: content.intro_title_line_1,
            line2: content.intro_title_line_2,
          },

          description: content.intro_description,
        },


        // ---------------------------------------------------
        // PROJECTS
        // ---------------------------------------------------

        projects: formattedProjects,


        // ---------------------------------------------------
        // BOTTOM
        // ---------------------------------------------------

        bottom: {
          projectCount: content.bottom_project_count,
          projectLabel: content.bottom_project_label,

          focusValue: content.bottom_focus_value,
          focusLabel: content.bottom_focus_label,

          architectureValue: content.bottom_architecture_value,
          architectureLabel: content.bottom_architecture_label,
        },
      },
    });

  } catch (error) {

    console.error("Get projects content error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects content",
    });
  }
};