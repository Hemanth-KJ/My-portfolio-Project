import {
  getContactContent,
  getContactLinks,
  createContactMessage,
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