import {
  getContactContent,
  getContactLinks,
  createContactMessage,
  updateContactPage,
} from "../models/contactModel.js";

// =========================================================
// GET CONTACT PAGE
// =========================================================

export const getContactPage = async (req, res) => {
  try {
    const [content, links] = await Promise.all([
      getContactContent(),
      getContactLinks(),
    ]);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Contact content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        section: {
          number: content.section_number,
          label: content.section_label,
        },

        availability: content.availability_status,

        hero: {
          kicker: content.hero_kicker,
          title: {
            line1: content.hero_title_line_1,
            line2: content.hero_title_line_2,
          },
          description: content.hero_description,
          email: content.primary_email,
        },

        info: {
          sectionNumber: content.info_section_number,
          title: content.info_section_title,
          description: content.info_description,
        },

        form: {
          sectionNumber: content.form_section_number,
          title: content.form_section_title,
        },

        links: links.map((link) => ({
          id: link.id,
          label: link.link_label,
          url: link.link_url,
        })),

        footer: {
          number: content.footer_number,
          label: content.footer_label,
          message: content.footer_message,
          logo: content.footer_logo,
          copy: content.footer_copy,
          role: content.footer_role,
        },
      },
    });
  } catch (error) {
    console.error("Get contact page error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load contact page",
    });
  }
};

// =========================================================
// SUBMIT CONTACT MESSAGE
// =========================================================

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // -----------------------------------------------------
    // EMAIL VALIDATION
    // -----------------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // -----------------------------------------------------
    // SAVE MESSAGE
    // -----------------------------------------------------

    const contactMessage = await createContactMessage(
      cleanName,
      cleanEmail,
      cleanMessage
    );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.status(201).json({
      success: true,
      message: "Message received successfully",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Submit contact message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};


/* =========================================================
   VALIDATION HELPERS
========================================================= */

const validText = (value, maxLength = Infinity) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
};

const validEmail = (value) => {
  return (
    validText(value, 255) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
};

const validLinkUrl = (value) => {
  if (!validText(value, 500)) {
    return false;
  }

  if (
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

/* =========================================================
   UPDATE CONTACT PAGE
========================================================= */

export const updateContactPageController = async (
  req,
  res
) => {
  try {
    const data = req.body;

    if (
      !data ||
      !data.section ||
      !data.hero ||
      !data.hero.title ||
      !data.info ||
      !data.form ||
      !data.footer ||
      !Array.isArray(data.links)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Contact page data.",
      });
    }

    /* =====================================================
       REQUIRED CONTENT FIELDS
    ===================================================== */

    const requiredFields = [
      [data.section.number, 20],
      [data.section.label, 100],
      [data.availability, 150],
      [data.hero.kicker, 250],
      [data.hero.title.line1, 100],
      [data.hero.title.line2, 100],
      [data.hero.description, Infinity],
      [data.info.sectionNumber, 20],
      [data.info.title, 150],
      [data.info.description, Infinity],
      [data.form.sectionNumber, 20],
      [data.form.title, 150],
      [data.footer.number, 20],
      [data.footer.label, 100],
      [data.footer.message, 150],
      [data.footer.logo, 50],
      [data.footer.copy, 150],
      [data.footer.role, 100],
    ];

    if (
      requiredFields.some(
        ([value, limit]) =>
          !validText(value, limit)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete all required Contact fields within their length limits.",
      });
    }

    /* =====================================================
       EMAIL
    ===================================================== */

    if (!validEmail(data.hero.email)) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid primary email address.",
      });
    }

    /* =====================================================
       LINKS
    ===================================================== */

    if (data.links.length > 30) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum 30 contact links allowed.",
      });
    }

    const existingIds = new Set();

    for (const link of data.links) {
      if (
        !link ||
        !validText(link.label, 100) ||
        !validLinkUrl(link.url)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Every contact link requires a label and valid HTTP/HTTPS, mailto or tel URL (maximum 500 characters).",
        });
      }

      if (link.id != null) {
        if (
          !Number.isSafeInteger(link.id) ||
          link.id <= 0 ||
          existingIds.has(link.id)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid or duplicate contact link ID.",
          });
        }

        existingIds.add(link.id);
      }
    }

    /* =====================================================
       UPDATE DATABASE
    ===================================================== */

    const result = await updateContactPage(data);

    return res.status(200).json({
      success: true,
      message:
        "Contact page updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Update Contact page error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update Contact page.",
    });
  }
};
