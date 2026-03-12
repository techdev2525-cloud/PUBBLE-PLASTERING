// PDF Generator Service for Invoices and Receipts
import jsPDF from "jspdf";
import { siteSettings } from "../config/siteSettings";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDocumentDate } from "../utils/dateFormatter";

const COLORS = {
  primary: [237, 118, 32], // #ED7620
  dark: [41, 37, 36], // #292524
  gray: [120, 113, 108], // #78716C
  light: [245, 245, 244], // #F5F5F4
  white: [255, 255, 255],
};

/**
 * Load the invoice header image as base64 for PDF embedding
 */
async function loadHeaderImage() {
  try {
    const response = await fetch("/images/logo/pubble-logo.jpeg");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Draw the document header with logo image or fallback
 */
function drawHeader(doc, headerImageData, docType) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  if (headerImageData) {
    // White background header area
    doc.setFillColor(...COLORS.white);
    doc.rect(0, 0, pageWidth, 45, "F");

    // Light border line under header
    doc.setDrawColor(220, 220, 220);
    doc.line(0, 45, pageWidth, 45);

    // Add the logo image on the left
    doc.addImage(headerImageData, "JPEG", margin, 5, 55, 35);

    // Document type label on the right
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(docType, pageWidth - margin, 25, { align: "right" });
  } else {
    // Fallback: orange bar header
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(siteSettings.company.name, margin, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Plastering Services", margin, 33);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(docType, pageWidth - margin, 25, { align: "right" });
  }
}

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(invoice) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Load and draw header with logo
  const headerImage = await loadHeaderImage();
  drawHeader(doc, headerImage, "INVOICE");

  // Invoice Number
  yPos = 55;
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, pageWidth - margin, yPos, {
    align: "right",
  });

  // Company Details (Left)
  yPos = 70;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("From:", margin, yPos);

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  yPos += 6;
  doc.text(siteSettings.company.name, margin, yPos);
  yPos += 5;
  doc.text(siteSettings.company.address.street, margin, yPos);
  yPos += 5;
  doc.text(
    `${siteSettings.company.address.city}, ${siteSettings.company.address.postcode}`,
    margin,
    yPos,
  );
  yPos += 5;
  doc.text(`Tel: ${siteSettings.company.phone}`, margin, yPos);
  yPos += 5;
  doc.text(`Email: ${siteSettings.company.email}`, margin, yPos);
  if (siteSettings.company.vatNumber) {
    yPos += 5;
    doc.text(`VAT No: ${siteSettings.company.vatNumber}`, margin, yPos);
  }

  // Client Details (Right)
  let rightYPos = 70;
  const rightX = pageWidth / 2 + 10;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("Bill To:", rightX, rightYPos);

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  rightYPos += 7;
  doc.text(invoice.client.name, rightX, rightYPos);
  if (invoice.client.address) {
    rightYPos += 6;
    const addrLines = doc.splitTextToSize(invoice.client.address, pageWidth / 2 - margin - 15);
    doc.text(addrLines, rightX, rightYPos);
    rightYPos += (addrLines.length - 1) * 5;
  }
  if (invoice.client.city || invoice.client.postcode) {
    rightYPos += 6;
    doc.text(
      `${invoice.client.city || ""} ${invoice.client.postcode || ""}`.trim(),
      rightX,
      rightYPos,
    );
  }
  if (invoice.client.email) {
    rightYPos += 6;
    doc.text(invoice.client.email, rightX, rightYPos);
  }
  if (invoice.client.phone) {
    rightYPos += 6;
    doc.text(invoice.client.phone, rightX, rightYPos);
  }

  // Invoice Details Box
  yPos = 115;
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 2, 2, "F");

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  const col1 = margin + 5;
  const col2 = margin + 50;
  const col3 = margin + 100;
  const col4 = pageWidth - margin - 35;

  doc.text("Invoice Date:", col1, yPos + 8);
  doc.text("Due Date:", col2, yPos + 8);
  doc.text("Project:", col3, yPos + 8);
  doc.text("Status:", col4, yPos + 8);

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.text(formatDocumentDate(invoice.issueDate), col1, yPos + 15);
  doc.text(
    invoice.dueDate ? formatDocumentDate(invoice.dueDate) : "On Receipt",
    col2,
    yPos + 15,
  );
  doc.text(invoice.project?.title || "N/A", col3, yPos + 15);
  doc.text(invoice.status, col4, yPos + 15);

  // Items Table Header
  yPos = 145;
  doc.setFillColor(...COLORS.dark);
  doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 5, yPos + 7);
  doc.text("Qty", margin + 100, yPos + 7);
  doc.text("Unit Price", margin + 120, yPos + 7);
  doc.text("Amount", pageWidth - margin - 5, yPos + 7, { align: "right" });

  // Items
  yPos += 15;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);

  invoice.items.forEach((item, index) => {
    const rowY = yPos + index * 12;

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(...COLORS.light);
      doc.rect(margin, rowY - 4, pageWidth - margin * 2, 12, "F");
    }

    doc.setFontSize(9);
    doc.text(item.description.substring(0, 50), margin + 5, rowY + 3);
    doc.text(item.quantity.toString(), margin + 100, rowY + 3);
    doc.text(formatCurrency(item.unitPrice), margin + 120, rowY + 3);
    doc.text(
      formatCurrency(item.total || item.quantity * item.unitPrice),
      pageWidth - margin - 5,
      rowY + 3,
      { align: "right" },
    );
  });

  // Totals
  yPos = yPos + invoice.items.length * 12 + 10;
  const totalsX = pageWidth - margin - 60;
  const totalsValueX = pageWidth - margin - 5;

  doc.setDrawColor(...COLORS.gray);
  doc.line(totalsX - 10, yPos - 5, pageWidth - margin, yPos - 5);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  doc.text("Subtotal:", totalsX, yPos);
  doc.setTextColor(...COLORS.dark);
  doc.text(formatCurrency(invoice.subtotal), totalsValueX, yPos, {
    align: "right",
  });

  yPos += 8;
  doc.setTextColor(...COLORS.gray);
  doc.text(`VAT (${invoice.vatRate}%):`, totalsX, yPos);
  doc.setTextColor(...COLORS.dark);
  doc.text(formatCurrency(invoice.vatAmount), totalsValueX, yPos, {
    align: "right",
  });

  yPos += 10;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(totalsX - 15, yPos - 6, 65, 12, 2, 2, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", totalsX, yPos + 2);
  doc.text(formatCurrency(invoice.total), totalsValueX, yPos + 2, {
    align: "right",
  });

  // Payment Info
  yPos += 25;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.text("Payment Details:", margin, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  yPos += 8;
  doc.text("Bank: National Westminster Bank", margin, yPos);
  yPos += 5;
  doc.text("Account Name: Pubble Plastering Ltd", margin, yPos);
  yPos += 5;
  doc.text("Sort Code: 00-00-00 | Account: 12345678", margin, yPos);

  // Notes
  if (invoice.notes) {
    yPos += 15;
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.text("Notes:", margin, yPos);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.gray);
    yPos += 6;
    const noteLines = doc.splitTextToSize(
      invoice.notes,
      pageWidth - margin * 2,
    );
    doc.text(noteLines, margin, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text("Thank you for your business!", pageWidth / 2, footerY, {
    align: "center",
  });
  doc.text(
    `${siteSettings.company.name} | ${siteSettings.seo.siteUrl}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );

  return doc;
}

/**
 * Generate Receipt PDF
 */
export async function generateReceiptPDF(receipt) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Load and draw header with logo
  const headerImage = await loadHeaderImage();
  drawHeader(doc, headerImage, "RECEIPT");

  // Receipt Number
  yPos = 55;
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(receipt.receiptNumber, pageWidth - margin, yPos, {
    align: "right",
  });

  // Company Details (Left)
  yPos = 70;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("From:", margin, yPos);

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  yPos += 6;
  doc.text(siteSettings.company.name, margin, yPos);
  yPos += 5;
  doc.text(siteSettings.company.address.street, margin, yPos);
  yPos += 5;
  doc.text(
    `${siteSettings.company.address.city}, ${siteSettings.company.address.postcode}`,
    margin,
    yPos,
  );
  yPos += 5;
  doc.text(`Tel: ${siteSettings.company.phone}`, margin, yPos);

  // Client Details (Right)
  let rightYPos = 70;
  const rightX = pageWidth / 2 + 10;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("Received From:", rightX, rightYPos);

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  rightYPos += 7;
  doc.text(receipt.client.name, rightX, rightYPos);
  if (receipt.client.address) {
    rightYPos += 6;
    const addrLines = doc.splitTextToSize(receipt.client.address, pageWidth / 2 - margin - 15);
    doc.text(addrLines, rightX, rightYPos);
    rightYPos += (addrLines.length - 1) * 5;
  }
  if (receipt.client.city || receipt.client.postcode) {
    rightYPos += 6;
    doc.text(
      `${receipt.client.city || ""} ${receipt.client.postcode || ""}`.trim(),
      rightX,
      rightYPos,
    );
  }
  if (receipt.client.email) {
    rightYPos += 6;
    doc.text(receipt.client.email, rightX, rightYPos);
  }

  // Receipt Details Box
  yPos = 110;
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 3, 3, "F");

  const detailsY = yPos + 15;
  doc.setFontSize(11);

  // Payment Date
  doc.setTextColor(...COLORS.gray);
  doc.text("Payment Date:", margin + 10, detailsY);
  doc.setTextColor(...COLORS.dark);
  doc.setFont("helvetica", "bold");
  doc.text(formatDocumentDate(receipt.paymentDate), margin + 60, detailsY);

  // Payment Method
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text("Payment Method:", margin + 10, detailsY + 10);
  doc.setTextColor(...COLORS.dark);
  doc.setFont("helvetica", "bold");
  const paymentMethodLabels = {
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash",
    CARD: "Card",
    PAYPAL: "PayPal",
  };
  doc.text(
    paymentMethodLabels[receipt.paymentMethod] || receipt.paymentMethod,
    margin + 60,
    detailsY + 10,
  );

  // Invoice Reference
  if (receipt.invoice) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.gray);
    doc.text("Invoice Reference:", margin + 10, detailsY + 20);
    doc.setTextColor(...COLORS.dark);
    doc.text(receipt.invoice.invoiceNumber, margin + 60, detailsY + 20);
  }

  // Project Reference
  if (receipt.project) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.gray);
    doc.text("Project:", margin + 10, detailsY + 30);
    doc.setTextColor(...COLORS.dark);
    doc.text(receipt.project.title || receipt.project.name || "N/A", margin + 60, detailsY + 30);
  }

  // Amount Paid - Large Display
  yPos = 175;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Received", pageWidth / 2, yPos + 12, { align: "center" });

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(receipt.amount), pageWidth / 2, yPos + 28, {
    align: "center",
  });

  // Notes
  if (receipt.notes) {
    yPos = 225;
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", margin, yPos);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.gray);
    yPos += 6;
    const noteLines = doc.splitTextToSize(
      receipt.notes,
      pageWidth - margin * 2,
    );
    doc.text(noteLines, margin, yPos);
  }

  // Signature Area
  yPos = 250;
  doc.setDrawColor(...COLORS.gray);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text("Authorized Signature", margin, yPos + 5);

  doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
  doc.text("Date", pageWidth - margin - 60, yPos + 5);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text("Thank you for your payment!", pageWidth / 2, footerY, {
    align: "center",
  });
  doc.text(
    `${siteSettings.company.name} | ${siteSettings.seo.siteUrl}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" },
  );

  return doc;
}

/**
 * Download PDF in browser
 */
export function downloadPDF(doc, filename) {
  doc.save(filename);
}

/**
 * Get PDF as blob for email attachment
 */
export function getPDFBlob(doc) {
  return doc.output("blob");
}

/**
 * Get PDF as base64 for API transfer
 */
export function getPDFBase64(doc) {
  return doc.output("datauristring");
}

export default {
  generateInvoicePDF,
  generateReceiptPDF,
  downloadPDF,
  getPDFBlob,
  getPDFBase64,
};
