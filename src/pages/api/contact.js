// Contact Form API
import { sendContactEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, message, service } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required" });
    }

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (name.length > 200 || message.length > 5000) {
      return res.status(400).json({ error: "Input exceeds maximum length" });
    }
    if (phone && phone.length > 30) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Create in-app notification
    await prisma.notification
      .create({
        data: {
          type: "CONTACT_MESSAGE",
          title: `New contact message from ${name}`,
          message: message.slice(0, 100),
          link: "/admin/quote-requests",
        },
      })
      .catch(console.error);

    // Send email notification
    await sendContactEmail({
      name,
      email,
      phone,
      message,
      service,
    });

    return res.status(200).json({
      message: "Message sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res
      .status(500)
      .json({ error: "Failed to send message. Please try again." });
  }
}
