import {
  getAboutContent,
  getAboutPhilosophy,
  getAboutPrinciples,
  getAboutStack,
} from "../models/aboutModel.js";
import { updateAboutContent } from "../models/aboutModel.js";


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



const validateString = (value, field, maxLength = 5000) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  if (value.length > maxLength) {
    throw new Error(`${field} must not exceed ${maxLength} characters.`);
  }

  return value.trim();
};

export const updateAbout = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Invalid About content.");
    }

    const requiredObjects = [
      "section",
      "intro",
      "profile",
      "about",
      "link",
      "philosophy",
    ];

    for (const key of requiredObjects) {
      if (!data[key] || typeof data[key] !== "object" || Array.isArray(data[key])) {
        throw new Error(`Invalid ${key} information.`);
      }
    }

    if (!data.intro.title || typeof data.intro.title !== "object") {
      throw new Error("Invalid About title.");
    }

    if (!Array.isArray(data.philosophy.principles)) {
      throw new Error("Principles must be an array.");
    }

    if (!Array.isArray(data.stack)) {
      throw new Error("Technology stack must be an array.");
    }

    if (data.philosophy.principles.length > 20) {
      throw new Error("A maximum of 20 principles is allowed.");
    }

    if (data.stack.length > 30) {
      throw new Error("A maximum of 30 technologies is allowed.");
    }

    // Validate main About content.
    data.section.index = validateString(data.section.index, "Section index", 20);
    data.section.label = validateString(data.section.label, "Section label", 100);

    data.intro.eyebrow = validateString(data.intro.eyebrow, "Eyebrow", 150);
    data.intro.title.line1 = validateString(data.intro.title.line1, "Title line 1", 100);
    data.intro.title.line2 = validateString(data.intro.title.line2, "Title line 2", 100);
    data.intro.title.line3 = validateString(data.intro.title.line3, "Title line 3", 100);

    if (
      data.profile.image !== null &&
      data.profile.image !== undefined &&
      typeof data.profile.image !== "string"
    ) {
      throw new Error("Profile image must be a URL or path.");
    }

    data.profile.image = data.profile.image?.trim() || null;
    data.profile.name = validateString(data.profile.name, "Profile name", 150);
    data.profile.number = validateString(data.profile.number, "Profile number", 20);
    data.profile.caption = validateString(data.profile.caption, "Profile caption", 200);

    data.about.number = validateString(data.about.number, "Copy number", 50);
    data.about.heading = validateString(data.about.heading, "Copy heading", 200);
    data.about.introduction = validateString(data.about.introduction, "Introduction");
    data.about.technicalFocus = validateString(data.about.technicalFocus, "Technical focus");

    data.link.text = validateString(data.link.text, "Link text", 100);
    data.link.url = validateString(data.link.url, "Link URL", 255);

    // Validate philosophy.
    data.philosophy.sectionNumber = validateString(
      data.philosophy.sectionNumber,
      "Philosophy section number",
      50
    );

    data.philosophy.sectionLabel = validateString(
      data.philosophy.sectionLabel,
      "Philosophy section label",
      100
    );

    data.philosophy.title = validateString(data.philosophy.title, "Philosophy title", 150);
    data.philosophy.introduction = validateString(
      data.philosophy.introduction,
      "Philosophy introduction"
    );

    data.philosophy.principles = data.philosophy.principles.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Invalid principle at position ${index + 1}.`);
      }

      return {
        number: validateString(item.number, `Principle ${index + 1} number`, 20),
        title: validateString(item.title, `Principle ${index + 1} title`, 100),
        description: validateString(
          item.description,
          `Principle ${index + 1} description`
        ),
      };
    });

    // Validate technology stack.
    data.stack = data.stack.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Invalid technology at position ${index + 1}.`);
      }

      let category = null;

      if (item.category !== null && item.category !== undefined && item.category !== "") {
        category = validateString(
          item.category,
          `Technology ${index + 1} category`,
          100
        );
      }

      return {
        name: validateString(item.name, `Technology ${index + 1} name`, 100),
        category,
      };
    });

    await updateAboutContent(data);

    res.status(200).json({
      success: true,
      message: "About content updated successfully.",
    });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
