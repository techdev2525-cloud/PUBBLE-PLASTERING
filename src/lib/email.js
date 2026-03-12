// Email library - re-exports from email service
import { siteSettings } from "@/config/siteSettings";

export {
  sendEmail,
  sendReceiptEmail,
  sendInvoiceEmail,
  sendQuoteNotification,
  sendQuoteConfirmation,
} from "@/services/emailService";

import { sendEmail } from "@/services/emailService";

/**
 * Send contact form email notification
 */
export async function sendContactEmail({
  name,
  email,
  phone,
  message,
  service,
}) {
  const subject = `New Contact Message from ${name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ED7620; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Message</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span> ${name}
          </div>
          <div class="field">
            <span class="label">Email:</span> ${email}
          </div>
          ${phone ? `<div class="field"><span class="label">Phone:</span> ${phone}</div>` : ""}
          ${service ? `<div class="field"><span class="label">Service:</span> ${service}</div>` : ""}
          <div class="field">
            <span class="label">Message:</span><br>
            ${message}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: siteSettings.company.email,
    subject,
    html,
    text: `New Contact Message\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nService: ${service || "N/A"}\n\nMessage:\n${message}`,
  });
}
