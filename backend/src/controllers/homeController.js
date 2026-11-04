import {
  getHomeContent,
  getHomeTechnologies,
  updateHomeContent,
} from "../models/homeModel.js";

// =========================================================
// VALIDATION HELPERS
// =========================================================

const validateString = (value, field, maxLength) => {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    throw new Error(
      `${field} is required and must not exceed ${maxLength} characters.`
    );
  }

  return value.trim();
};

const validateInteger = (value, field) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }

  return value;
};

// =========================================================
// GET HOME
// =========================================================

export const getHome = async (req, res) => {
  try {
    const homeContent = await getHomeContent();
    const technologies = await getHomeTechnologies();

    if (!homeContent) {
      return res.status(404).json({
        success: false,
        message: "Home content not found.",
      });
    }

    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch home content.",
    });
  }
};

// =========================================================
// UPDATE HOME
// =========================================================

export const updateHome = async (req, res, next) => {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !body.title ||
      !body.buttons?.primary ||
      !body.buttons?.secondary ||
      !body.visual ||
      !Array.isArray(body.technologies)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Home content structure.",
      });
    }

    const data = {
      sectionNumber: validateString(
        body.sectionNumber,
        "Section number",
        20
      ),

      totalSections: validateInteger(
        body.totalSections,
        "Total sections"
      ),

      portfolioYear: validateInteger(
        body.portfolioYear,
        "Portfolio year"
      ),

      topLabel: validateString(body.topLabel, "Top label", 100),

      indexNumber: validateString(
        body.indexNumber,
        "Index number",
        20
      ),

      indexLabel: validateString(
        body.indexLabel,
        "Index label",
        100
      ),

      eyebrow: validateString(body.eyebrow, "Eyebrow", 150),

      title: {
        line1: validateString(body.title.line1, "Title line 1", 100),
        line2: validateString(body.title.line2, "Title line 2", 100),
        line3: validateString(body.title.line3, "Title line 3", 100),
      },

      description: validateString(
        body.description,
        "Description",
        10000
      ),

      buttons: {
        primary: {
          text: validateString(
            body.buttons.primary.text,
            "Primary button text",
            100
          ),
          link: validateString(
            body.buttons.primary.link,
            "Primary button link",
            255
          ),
        },

        secondary: {
          text: validateString(
            body.buttons.secondary.text,
            "Secondary button text",
            100
          ),
          link: validateString(
            body.buttons.secondary.link,
            "Secondary button link",
            255
          ),
        },
      },

      technologies: body.technologies.map((technology, index) =>
        validateString(technology, `Technology ${index + 1}`, 100)
      ),

      visual: {
        number: validateString(body.visual.number, "Visual number", 20),

        labelLine1: validateString(
          body.visual.labelLine1,
          "Visual label line 1",
          100
        ),

        labelLine2: validateString(
          body.visual.labelLine2,
          "Visual label line 2",
          100
        ),

        buildYear: validateInteger(
          body.visual.buildYear,
          "Build year"
        ),

        status: validateString(body.visual.status, "Status", 50),

        heroImage:
          body.visual.heroImage == null ||
          body.visual.heroImage === ""
            ? null
            : validateString(
                body.visual.heroImage,
                "Hero image",
                500
              ),
      },
    };

    if (data.technologies.length > 20) {
      return res.status(400).json({
        success: false,
        message: "You can add a maximum of 20 technologies.",
      });
    }

    const uniqueTechnologies = new Set(
      data.technologies.map((item) => item.toLowerCase())
    );

    if (uniqueTechnologies.size !== data.technologies.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate technologies are not allowed.",
      });
    }

    await updateHomeContent(data);

    return res.status(200).json({
      success: true,
      message: "Home content updated successfully.",
    });
  } catch (error) {
    if (!error.status) {
      error.status = 400;
    }

    next(error);
  }
};