import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInDays,
} from "date-fns";
import { enGB } from "date-fns/locale";

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'd MMMM yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = "d MMMM yyyy") {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return "";

  return format(dateObj, formatStr, { locale: enGB });
}

/**
 * Format date with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  return formatDate(date, "d MMMM yyyy, HH:mm");
}

/**
 * Format date for display in short format
 * @param {Date|string} date - Date to format
 * @returns {string} Short formatted date (e.g., "9 Mar 2026")
 */
export function formatShortDate(date) {
  return formatDate(date, "d MMM yyyy");
}

/**
 * Format date for input fields (ISO format)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO formatted date (YYYY-MM-DD)
 */
export function formatDateInput(date) {
  return formatDate(date, "yyyy-MM-dd");
}

/**
 * Get relative time from now
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(date) {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return "";

  return formatDistanceToNow(dateObj, { addSuffix: true, locale: enGB });
}

/**
 * Format date for blog articles (with relative time for recent posts)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted blog date
 */
export function formatBlogDate(date) {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return "";

  const daysDiff = differenceInDays(new Date(), dateObj);

  // Show relative time for posts less than 7 days old
  if (daysDiff < 7) {
    return getRelativeTime(dateObj);
  }

  return formatDate(dateObj);
}

/**
 * Format date for invoice/receipt headers
 * @param {Date|string} date - Date to format
 * @returns {string} Business document date format
 */
export function formatDocumentDate(date) {
  return formatDate(date, "dd/MM/yyyy");
}

/**
 * Get month and year
 * @param {Date|string} date - Date to format
 * @returns {string} Month and year (e.g., "March 2026")
 */
export function getMonthYear(date) {
  return formatDate(date, "MMMM yyyy");
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;

  const parsed = parseISO(dateString);
  return isValid(parsed) ? parsed : null;
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether the date is in the past
 */
export function isPastDate(date) {
  if (!date) return false;

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return false;

  return dateObj < new Date();
}

/**
 * Get the start and end of a month
 * @param {Date|string} date - Date within the month
 * @returns {object} Object with start and end dates
 */
export function getMonthRange(date) {
  if (!date) return null;

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return null;

  const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

  return { start, end };
}

/**
 * Calculate reading time from word count
 * @param {number} wordCount - Number of words
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {string} Reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(wordCount, wordsPerMinute = 200) {
  if (!wordCount || wordCount <= 0) return "1 min read";

  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default formatDate;
