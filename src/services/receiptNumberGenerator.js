// Receipt Number Generator Service
import prisma from "../config/database";
import { siteSettings } from "../config/siteSettings";

/**
 * Get the next sequential number for a document type
 */
async function getNextSequentialNumber(model, numberField, prefix) {
  const lastDocument = await model.findFirst({
    orderBy: { createdAt: "desc" },
    select: { [numberField]: true },
  });

  if (!lastDocument || !lastDocument[numberField]) {
    return 1;
  }

  const lastNumber = parseInt(lastDocument[numberField].replace(prefix, ""));
  return isNaN(lastNumber) ? 1 : lastNumber + 1;
}

/**
 * Format sequential number with leading zeros
 */
function formatSequentialNumber(number, digits = 4) {
  return number.toString().padStart(digits, "0");
}

/**
 * Generate receipt number (PP-REC-0001)
 */
export async function generateReceiptNumber() {
  const prefix = siteSettings.documentPrefixes.receipt;
  const nextNumber = await getNextSequentialNumber(
    prisma.receipt,
    "receiptNumber",
    prefix,
  );
  return `${prefix}${formatSequentialNumber(nextNumber)}`;
}

/**
 * Generate invoice number (PP-INV-0001)
 */
export async function generateInvoiceNumber() {
  const prefix = siteSettings.documentPrefixes.invoice;
  const nextNumber = await getNextSequentialNumber(
    prisma.invoice,
    "invoiceNumber",
    prefix,
  );
  return `${prefix}${formatSequentialNumber(nextNumber)}`;
}

/**
 * Generate quote number (PP-QT-0001)
 */
export async function generateQuoteNumber() {
  const prefix = siteSettings.documentPrefixes.quote;

  // For quotes, we use a separate counter or timestamp-based
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `${prefix}${timestamp}-${random}`;
}

/**
 * Validate document number format
 */
export function validateDocumentNumber(number, type) {
  const prefixes = {
    receipt: siteSettings.documentPrefixes.receipt,
    invoice: siteSettings.documentPrefixes.invoice,
    quote: siteSettings.documentPrefixes.quote,
  };

  const prefix = prefixes[type];
  if (!prefix) return false;

  const regex = new RegExp(`^${prefix.replace("-", "\\-")}\\d{4}$`);
  return regex.test(number);
}

/**
 * Parse document number to get sequential number
 */
export function parseDocumentNumber(number, type) {
  const prefixes = {
    receipt: siteSettings.documentPrefixes.receipt,
    invoice: siteSettings.documentPrefixes.invoice,
    quote: siteSettings.documentPrefixes.quote,
  };

  const prefix = prefixes[type];
  if (!prefix || !number.startsWith(prefix)) return null;

  const sequentialPart = number.replace(prefix, "");
  const parsedNumber = parseInt(sequentialPart);

  return isNaN(parsedNumber) ? null : parsedNumber;
}

/**
 * Check if document number exists
 */
export async function documentNumberExists(number, type) {
  const models = {
    receipt: prisma.receipt,
    invoice: prisma.invoice,
  };

  const model = models[type];
  const field = type === "receipt" ? "receiptNumber" : "invoiceNumber";

  if (!model) return false;

  const exists = await model.findUnique({
    where: { [field]: number },
    select: { id: true },
  });

  return !!exists;
}

export default {
  generateReceiptNumber,
  generateInvoiceNumber,
  generateQuoteNumber,
  validateDocumentNumber,
  parseDocumentNumber,
  documentNumberExists,
};
