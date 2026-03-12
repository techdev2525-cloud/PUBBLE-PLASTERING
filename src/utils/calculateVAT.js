import { siteSettings } from "../config/siteSettings";

const DEFAULT_VAT_RATE = siteSettings.vat.rate; // 20%

/**
 * Calculate VAT amount from a net amount
 * @param {number} netAmount - Amount before VAT
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {number} VAT amount
 */
export function calculateVAT(netAmount, vatRate = DEFAULT_VAT_RATE) {
  if (typeof netAmount !== "number" || isNaN(netAmount)) return 0;
  return (netAmount * vatRate) / 100;
}

/**
 * Calculate gross amount (net + VAT)
 * @param {number} netAmount - Amount before VAT
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {number} Gross amount including VAT
 */
export function calculateGross(netAmount, vatRate = DEFAULT_VAT_RATE) {
  if (typeof netAmount !== "number" || isNaN(netAmount)) return 0;
  return netAmount + calculateVAT(netAmount, vatRate);
}

/**
 * Calculate net amount from gross (reverse VAT calculation)
 * @param {number} grossAmount - Amount including VAT
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {number} Net amount before VAT
 */
export function calculateNet(grossAmount, vatRate = DEFAULT_VAT_RATE) {
  if (typeof grossAmount !== "number" || isNaN(grossAmount)) return 0;
  return grossAmount / (1 + vatRate / 100);
}

/**
 * Extract VAT from gross amount
 * @param {number} grossAmount - Amount including VAT
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {number} VAT amount contained in gross
 */
export function extractVAT(grossAmount, vatRate = DEFAULT_VAT_RATE) {
  if (typeof grossAmount !== "number" || isNaN(grossAmount)) return 0;
  const netAmount = calculateNet(grossAmount, vatRate);
  return grossAmount - netAmount;
}

/**
 * Get complete VAT breakdown
 * @param {number} netAmount - Amount before VAT
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {object} Object containing net, vat, gross amounts
 */
export function getVATBreakdown(netAmount, vatRate = DEFAULT_VAT_RATE) {
  const vat = calculateVAT(netAmount, vatRate);
  const gross = netAmount + vat;

  return {
    net: netAmount,
    vatRate: vatRate,
    vat: vat,
    gross: gross,
  };
}

/**
 * Format VAT breakdown for display
 * @param {number} netAmount - Amount before VAT
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {object} Object with formatted currency strings
 */
export function formatVATBreakdown(netAmount, vatRate = DEFAULT_VAT_RATE) {
  const breakdown = getVATBreakdown(netAmount, vatRate);

  const formatGBP = (amount) => {
    return `£${amount.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return {
    net: formatGBP(breakdown.net),
    vatRate: `${breakdown.vatRate}%`,
    vat: formatGBP(breakdown.vat),
    gross: formatGBP(breakdown.gross),
  };
}

/**
 * Calculate line item with quantity
 * @param {number} unitPrice - Price per unit
 * @param {number} quantity - Number of units
 * @param {number} vatRate - VAT rate as percentage (default: 20)
 * @returns {object} Line item breakdown
 */
export function calculateLineItem(
  unitPrice,
  quantity,
  vatRate = DEFAULT_VAT_RATE,
) {
  const lineTotal = unitPrice * quantity;
  return {
    unitPrice,
    quantity,
    lineTotal,
    ...getVATBreakdown(lineTotal, vatRate),
  };
}

export default calculateVAT;
