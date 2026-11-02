import {
  getResumeContent,
  getResumeExperience,
  getResumeEducation,
  getResumeSkills,
  getResumeProjects,
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