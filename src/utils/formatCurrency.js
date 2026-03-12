/**
 * Format a number as British Pound currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the £ symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showSymbol = true) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return showSymbol ? "£0.00" : "0.00";
  }

  const formatted = amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `£${formatted}` : formatted;
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse (e.g., "£1,234.56")
 * @returns {number} Parsed number
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString === "number") return currencyString;
  if (!currencyString) return 0;

  // Remove currency symbol and commas
  const cleaned = currencyString.replace(/[£,\s]/g, "");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  return num.toLocaleString("en-GB");
}

/**
 * Calculate percentage
 * @param {number} part - The part value
 * @param {number} total - The total value
 * @returns {string} Formatted percentage string
 */
export function calculatePercentage(part, total) {
  if (!total || total === 0) return "0%";
  const percentage = (part / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Format currency for display in input fields (no symbol)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted string without symbol
 */
export function formatCurrencyInput(amount) {
  return formatCurrency(amount, false);
}

export default formatCurrency;
