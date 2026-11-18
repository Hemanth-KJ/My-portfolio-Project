import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendContactEmail = async ({
  name,
  email,
  message,
}) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,

    to: process.env.CONTACT_RECEIVER_EMAIL,

    replyTo: email,

    subject: "New Portfolio Contact Message",

    text: `
New message from your portfolio website.

Name: ${name}
Email: ${email}

Message:
${message}
    `,
  });
};