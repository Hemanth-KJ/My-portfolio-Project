
import {
  getEducationContent,
  getEducationItems,
  updateEducation as updateEducationModel,
} from "../models/educationModel.js";

// ============================================================
// VALIDATION HELPER
// ============================================================

const validateString = (value, field, maxLength = Infinity) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  if (value.trim().length > maxLength) {
    throw new Error(
      `${field} cannot exceed ${maxLength} characters.`
    );
  }

  return value.trim();
};

// ============================================================
// GET EDUCATION PAGE
// ============================================================

export const getEducation = async (req, res) => {
  try {
    const educationContent = await getEducationContent();
    const educationItems = await getEducationItems();

    if (!educationContent) {
      return res.status(404).json({
        success: false,
        message: "Education content not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        section: {
          number: educationContent.section_number,
          label: educationContent.section_label,
        },

        intro: {
          eyebrow: educationContent.intro_eyebrow,
          title: {
            line1: educationContent.intro_title_line_1,
            line2: educationContent.intro_title_line_2,
          },
        },

        timeline: educationItems.map((item) => ({
          id: item.id,
          year: item.year,
          number: item.item_number,
          title: item.title,
          institution: item.institution,
          description: item.description,
          status: item.status,
        })),

        bottom: {
          label: educationContent.bottom_label,
          description: educationContent.bottom_description,
        },
      },
    });
  } catch (error) {
    console.error("Get education content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch education content",
    });
  }
};

// ============================================================
// UPDATE EDUCATION PAGE
// ============================================================

export const updateEducation = async (req, res, next) => {
  try {
    const { section, intro, timeline, bottom } = req.body;

    if (!section || !intro || !intro.title || !bottom) {
      throw new Error("Invalid Education content structure.");
    }

    if (
      typeof section !== "object" ||
      typeof intro !== "object" ||
      typeof intro.title !== "object" ||
      typeof bottom !== "object"
    ) {
      throw new Error("Invalid Education content structure.");
    }

    if (!Array.isArray(timeline)) {
      throw new Error("Education timeline must be an array.");
    }

    if (timeline.length > 30) {
      throw new Error("You can add a maximum of 30 education entries.");
    }

    const data = {
      section: {
        number: validateString(section.number, "Section number", 20),
        label: validateString(section.label, "Section label", 100),
      },

      intro: {
        eyebrow: validateString(intro.eyebrow, "Intro eyebrow", 150),
        title: {
          line1: validateString(intro.title.line1, "Title line 1", 150),
          line2: validateString(intro.title.line2, "Title line 2", 150),
        },
      },

      bottom: {
        label: validateString(bottom.label, "Bottom label", 100),
        description: validateString(
          bottom.description,
          "Bottom description"
        ),
      },

      timeline: timeline.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          throw new Error(`Invalid education entry at position ${index + 1}.`);
        }

        return {
          year: validateString(item.year, "Year", 50),
          number: validateString(item.number, "Entry number", 20),
          title: validateString(item.title, "Education title", 200),
          institution: validateString(
            item.institution,
            "Institution",
            250
          ),
          description: validateString(
            item.description,
            "Description"
          ),
          status: validateString(item.status, "Status", 100),
        };
      }),
    };

    await updateEducationModel(data);

    return res.status(200).json({
      success: true,
      message: "Education content updated successfully.",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
