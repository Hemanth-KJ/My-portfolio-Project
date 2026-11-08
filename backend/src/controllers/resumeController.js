import {
  getResumeContent,
  getResumeExperience,
  getResumeEducation,
  getResumeSkills,
  getResumeProjects,
  updateResumePage,
} from "../models/resumeModel.js";


/* =========================================================
   GET RESUME PAGE
========================================================= */

export const getResumePage = async (req, res) => {
  try {
    const [
      content,
      experience,
      education,
      skills,
      projects,
    ] = await Promise.all([
      getResumeContent(),
      getResumeExperience(),
      getResumeEducation(),
      getResumeSkills(),
      getResumeProjects(),
    ]);


    /* =====================================================
       CONTENT VALIDATION
    ===================================================== */

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Resume content not found",
      });
    }


    /* =====================================================
       FORMAT EXPERIENCE
    ===================================================== */

    const formattedExperience = experience.map((item) => ({
      id: item.id,
      year: item.year,
      role: item.role,
      type: item.experience_type,
      description: item.description,
    }));


    /* =====================================================
       FORMAT EDUCATION
    ===================================================== */

    const formattedEducation = education.map((item) => ({
      id: item.id,
      year: item.year,
      degree: item.degree,
      institution: item.institution,
    }));


    /* =====================================================
       FORMAT SKILLS
    ===================================================== */

    const formattedSkills = skills.map((skill) => skill.skill_name);


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(200).json({
      success: true,

      data: {
        section: {
          number: content.section_number,
          label: content.section_label,
        },

        hero: {
          kicker: content.hero_kicker,

          name: {
            line1: content.hero_name_line_1,
            line2: content.hero_name_line_2,
          },

          description: content.hero_description,

          availability: content.availability_status,
        },

        experience: formattedExperience,

        education: formattedEducation,

        projects,

        skills: formattedSkills,

        resumePdfUrl: content.resume_pdf_url,

        cta: {
          label: content.cta_label,

          title: {
            line1: content.cta_title_line_1,
            line2: content.cta_title_line_2,
          },
        },
      },
    });

  } catch (error) {
    console.error("Get resume content error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch resume content",
    });
  }
};


/* =========================================================
   VALIDATION HELPERS
========================================================= */

const validText = (value, maxLength = Infinity) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxLength;

const validResumeUrl = (value) => {
  if (!validText(value, 500)) return false;

  // Allow relative URLs for locally hosted PDF files.
  if (
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return !value.includes("\\");
  }

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

const validId = (id) =>
  id == null ||
  (Number.isSafeInteger(id) && id > 0);

/* =========================================================
   UPDATE RESUME PAGE
========================================================= */

export const updateResumePageController = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data ||
      !data.section ||
      !data.hero ||
      !data.hero.name ||
      !data.cta ||
      !data.cta.title ||
      !Array.isArray(data.experience) ||
      !Array.isArray(data.education) ||
      !Array.isArray(data.skills)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Resume page data.",
      });
    }

    const required = [
      [data.section.number, 20],
      [data.section.label, 100],
      [data.hero.kicker, 200],
      [data.hero.name.line1, 100],
      [data.hero.name.line2, 100],
      [data.hero.description, Infinity],
      [data.hero.availability, 250],
      [data.cta.label, 200],
      [data.cta.title.line1, 100],
      [data.cta.title.line2, 100],
    ];

    if (
      required.some(
        ([value, limit]) => !validText(value, limit)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete all required Resume content fields.",
      });
    }

    if (!validResumeUrl(data.resumePdfUrl)) {
      return res.status(400).json({
        success: false,
        message:
          "Resume PDF URL must be a valid HTTP/HTTPS or relative URL (maximum 500 characters).",
      });
    }

    if (
      data.experience.length > 30 ||
      data.education.length > 30 ||
      data.skills.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume entry limit exceeded.",
      });
    }

    const experienceIds = new Set();

    for (const item of data.experience) {
      if (
        !item ||
        !validId(item.id) ||
        !validText(item.year, 50) ||
        !validText(item.role, 200) ||
        !validText(item.type, 200) ||
        !validText(item.description)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid experience entry.",
        });
      }

      if (item.id != null) {
        if (experienceIds.has(item.id)) {
          return res.status(400).json({
            success: false,
            message: "Duplicate experience ID.",
          });
        }
        experienceIds.add(item.id);
      }
    }

    const educationIds = new Set();

    for (const item of data.education) {
      if (
        !item ||
        !validId(item.id) ||
        !validText(item.year, 50) ||
        !validText(item.degree, 250) ||
        !validText(item.institution, 250)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid education entry.",
        });
      }

      if (item.id != null) {
        if (educationIds.has(item.id)) {
          return res.status(400).json({
            success: false,
            message: "Duplicate education ID.",
          });
        }
        educationIds.add(item.id);
      }
    }

    if (
      data.skills.some(
        (skill) => !validText(skill, 150)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Every skill must be a non-empty string of at most 150 characters.",
      });
    }

    const result = await updateResumePage(data);

    return res.status(200).json({
      success: true,
      message: "Resume page updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Update resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Resume page.",
    });
  }
};
