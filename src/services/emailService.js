// Email Service for sending notifications and documents
import nodemailer from "nodemailer";
import { siteSettings } from "../config/siteSettings";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email with optional attachments
 */
export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${siteSettings.company.name}" <${process.env.SMTP_FROM || siteSettings.company.email}>`,
    to,
    subject,
    html,
    text,
    attachments,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send receipt email to client
 */
export async function sendReceiptEmail(receipt, pdfBuffer) {
  const subject = `Payment Receipt ${receipt.receiptNumber} - ${siteSettings.company.name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ED7620; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 24px; color: #ED7620; font-weight: bold; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background: #ED7620; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteSettings.company.name}</h1>
          <p>Payment Receipt</p>
        </div>
        <div class="content">
          <p>Dear ${receipt.client.name},</p>
          
          <p>Thank you for your payment. Please find your receipt attached to this email.</p>
          
          <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
          <p><strong>Payment Date:</strong> ${new Date(receipt.paymentDate).toLocaleDateString("en-GB")}</p>
          <p><strong>Amount Received:</strong> <span class="amount">£${receipt.amount.toFixed(2)}</span></p>
          
          ${receipt.project ? `<p><strong>Project:</strong> ${receipt.project.title}</p>` : ""}
          
          <p>If you have any questions regarding this payment, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>${siteSettings.company.name}</p>
        </div>
        <div class="footer">
          <p>${siteSettings.company.address.street}, ${siteSettings.company.address.city}, ${siteSettings.company.address.postcode}</p>
          <p>Tel: ${siteSettings.company.phone} | Email: ${siteSettings.company.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Receipt - ${siteSettings.company.name}

Dear ${receipt.client.name},

Thank you for your payment. Please find your receipt attached to this email.

Receipt Number: ${receipt.receiptNumber}
Payment Date: ${new Date(receipt.paymentDate).toLocaleDateString("en-GB")}
Amount Received: £${receipt.amount.toFixed(2)}
${receipt.project ? `Project: ${receipt.project.title}` : ""}

If you have any questions regarding this payment, please don't hesitate to contact us.

Best regards,
${siteSettings.company.name}

${siteSettings.company.address.street}, ${siteSettings.company.address.city}, ${siteSettings.company.address.postcode}
Tel: ${siteSettings.company.phone} | Email: ${siteSettings.company.email}
  `;

  return sendEmail({
    to: receipt.client.email,
    subject,
    html,
    text,
    attachments: pdfBuffer
      ? [
          {
            filename: `${receipt.receiptNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : [],
  });
}

/**
 * Send invoice email to client
 */
export async function sendInvoiceEmail(invoice, pdfBuffer) {
  const subject = `Invoice ${invoice.invoiceNumber} - ${siteSettings.company.name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ED7620; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 24px; color: #ED7620; font-weight: bold; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteSettings.company.name}</h1>
          <p>Invoice</p>
        </div>
        <div class="content">
          <p>Dear ${invoice.client.name},</p>
          
          <p>Please find attached your invoice for plastering services.</p>
          
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date Issued:</strong> ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}</p>
          ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}</p>` : ""}
          
          <p><strong>Total Amount Due:</strong> <span class="amount">£${invoice.total.toFixed(2)}</span></p>
          
          <h3>Payment Details</h3>
          <p>Bank: National Westminster Bank<br>
          Account Name: Pubble Plastering Ltd<br>
          Sort Code: 00-00-00<br>
          Account Number: 12345678<br>
          Reference: ${invoice.invoiceNumber}</p>
          
          <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>${siteSettings.company.name}</p>
        </div>
        <div class="footer">
          <p>${siteSettings.company.address.street}, ${siteSettings.company.address.city}, ${siteSettings.company.address.postcode}</p>
          <p>Tel: ${siteSettings.company.phone} | Email: ${siteSettings.company.email}</p>
          ${siteSettings.company.vatNumber ? `<p>VAT No: ${siteSettings.company.vatNumber}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Invoice - ${siteSettings.company.name}

Dear ${invoice.client.name},

Please find attached your invoice for plastering services.

Invoice Number: ${invoice.invoiceNumber}
Date Issued: ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}
${invoice.dueDate ? `Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}` : ""}

Total Amount Due: £${invoice.total.toFixed(2)}

Payment Details:
Bank: National Westminster Bank
Account Name: Pubble Plastering Ltd
Sort Code: 00-00-00
Account Number: 12345678
Reference: ${invoice.invoiceNumber}

If you have any questions regarding this invoice, please don't hesitate to contact us.

Best regards,
${siteSettings.company.name}
  `;

  return sendEmail({
    to: invoice.client.email,
    subject,
    html,
    text,
    attachments: pdfBuffer
      ? [
          {
            filename: `${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : [],
  });
}

/**
 * Send quote request notification to admin
 */
export async function sendQuoteNotification(quote) {
  const subject = `New Quote Request from ${quote.name}`;

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
        .button { display: inline-block; padding: 10px 20px; background: #ED7620; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Quote Request</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span> ${quote.name}
          </div>
          <div class="field">
            <span class="label">Email:</span> ${quote.email}
          </div>
          ${quote.phone ? `<div class="field"><span class="label">Phone:</span> ${quote.phone}</div>` : ""}
          ${quote.service ? `<div class="field"><span class="label">Service:</span> ${quote.service}</div>` : ""}
          <div class="field">
            <span class="label">Message:</span><br>
            ${quote.message}
          </div>
          ${quote.images ? `<div class="field"><span class="label">Photos Attached:</span> Yes</div>` : ""}
          
          <a href="${siteSettings.seo.siteUrl}/admin/quote-requests" class="button">View in Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: siteSettings.company.email,
    subject,
    html,
    text: `New Quote Request\n\nName: ${quote.name}\nEmail: ${quote.email}\nPhone: ${quote.phone || "N/A"}\nService: ${quote.service || "N/A"}\n\nMessage:\n${quote.message}`,
  });
}

/**
 * Send quote confirmation to customer
 */
export async function sendQuoteConfirmation(quote) {
  const subject = `Quote Request Received - ${siteSettings.company.name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ED7620; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteSettings.company.name}</h1>
        </div>
        <div class="content">
          <p>Dear ${quote.name},</p>
          
          <p>Thank you for your quote request! We have received your enquiry and one of our team members will be in touch shortly.</p>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>We'll review your requirements</li>
            <li>A member of our team will contact you within 24 hours</li>
            <li>We'll arrange a site visit if needed</li>
            <li>You'll receive a detailed, no-obligation quote</li>
          </ul>
          
          <p>If you have any urgent questions, please call us on <strong>${siteSettings.company.phone}</strong></p>
          
          <p>Best regards,<br>The ${siteSettings.company.name} Team</p>
        </div>
        <div class="footer">
          <p>${siteSettings.company.address.street}, ${siteSettings.company.address.city}, ${siteSettings.company.address.postcode}</p>
          <p>Tel: ${siteSettings.company.phone} | Email: ${siteSettings.company.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: quote.email,
    subject,
    html,
    text: `Thank you for your quote request!\n\nDear ${quote.name},\n\nWe have received your enquiry and one of our team members will be in touch shortly.\n\nBest regards,\nThe ${siteSettings.company.name} Team`,
  });
}

export default {
  sendEmail,
  sendReceiptEmail,
  sendInvoiceEmail,
  sendQuoteNotification,
  sendQuoteConfirmation,
};
