import {
  getProjectsContent,
  getProjects,
  getProjectItems,
  updateProjectsPage,
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


const isText = (value, maxLength = Infinity) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxLength;

const isOptionalText = (value, maxLength) =>
  value == null ||
  (typeof value === "string" && value.length <= maxLength);

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
};

// =========================================================
// UPDATE PROJECTS PAGE
// ADMIN ONLY
// =========================================================

export const updateProjectsPageController = async (req, res) => {
  try {
    const { section, intro, projects, bottom } = req.body || {};

    // =====================================================
    // VALIDATE PAGE CONTENT
    // =====================================================

    if (
      !section ||
      !intro ||
      !intro.title ||
      !bottom ||
      !Array.isArray(projects)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Projects page data.",
      });
    }

    const requiredFields = [
      [section.number, 20],
      [section.label, 100],
      [section.headerRight, 100],
      [intro.kicker, 200],
      [intro.title.line1, 150],
      [intro.title.line2, 150],
      [intro.description, Infinity],
      [bottom.projectCount, 20],
      [bottom.projectLabel, 100],
      [bottom.focusValue, 100],
      [bottom.focusLabel, 100],
      [bottom.architectureValue, 100],
      [bottom.architectureLabel, 100],
    ];

    if (
      requiredFields.some(
        ([value, maxLength]) => !isText(value, maxLength)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All page content fields are required and must respect their length limits.",
      });
    }

    // =====================================================
    // VALIDATE PROJECTS
    // =====================================================

    if (projects.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Maximum 30 projects allowed.",
      });
    }

    const existingIds = new Set();

    for (const project of projects) {
      if (!project || typeof project !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid project entry.",
        });
      }

      if (
        !isText(project.number, 20) ||
        !isText(project.category, 150) ||
        !isText(project.title, 250) ||
        !isText(project.description) ||
        !isText(project.visualStatus, 100) ||
        !isText(project.visualYear, 20)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each project must contain valid required fields.",
        });
      }

      if (
        !isOptionalText(project.github, 500) ||
        !isOptionalText(project.live, 500) ||
        !isValidUrl(project.github) ||
        !isValidUrl(project.live)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Project links must be valid HTTP/HTTPS URLs with a maximum length of 500 characters.",
        });
      }

      if (project.id != null) {
        if (
          !Number.isSafeInteger(project.id) ||
          project.id <= 0 ||
          existingIds.has(project.id)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid or duplicate project ID.",
          });
        }

        existingIds.add(project.id);
      }

      if (
        !Array.isArray(project.technologies) ||
        !Array.isArray(project.highlights)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Technologies and highlights must be arrays.",
        });
      }

      if (
        project.technologies.length > 50 ||
        project.highlights.length > 50 ||
        project.technologies.some(
          (item) => !isText(item)
        ) ||
        project.highlights.some(
          (item) => !isText(item)
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each project supports up to 50 non-empty technologies and 50 non-empty highlights.",
        });
      }
    }

    // =====================================================
    // SAVE
    // =====================================================

    const result = await updateProjectsPage({
      section,
      intro,
      projects,
      bottom,
    });

    return res.status(200).json({
      success: true,
      message: "Projects page updated successfully.",
      projectCount: result.projectCount,
    });
  } catch (error) {
    console.error("Update projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Projects page.",
    });
  }
};
