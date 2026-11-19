
import "dotenv/config";

const RESEND_API_URL = "https://api.resend.com/emails";

export const sendContactEmail = async ({
  name,
  email,
  message,
}) => {
  const {
    RESEND_API_KEY,
    CONTACT_RECEIVER_EMAIL,
  } = process.env;

  if (!RESEND_API_KEY || !CONTACT_RECEIVER_EMAIL) {
    throw new Error(
      "Resend email environment variables are missing"
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",

        to: [CONTACT_RECEIVER_EMAIL],

        reply_to: email,

        subject: `New Portfolio Message from ${name}`,

        text: [
          "You received a new portfolio contact message.",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          "",
          "Message:",
          message,
        ].join("\n"),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.text();

      console.error(
        "Resend API error:",
        response.status,
        error.slice(0, 500)
      );

      throw new Error(
        `Resend email request failed: ${response.status}`
      );
    }

    const result = await response.json();

    console.log("Resend accepted email:", result.id);

    return result.id;
  } finally {
    clearTimeout(timeout);
  }
};