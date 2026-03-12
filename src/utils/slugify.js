import slugifyLib from "slugify";

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - Text to slugify
 * @param {object} options - Slugify options
 * @returns {string} URL-friendly slug
 */
export function slugify(text, options = {}) {
  if (!text) return "";

  const defaultOptions = {
    lower: true,
    strict: true,
    trim: true,
    locale: "en",
    ...options,
  };

  return slugifyLib(text, defaultOptions);
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {string[]} existingSlugs - Array of existing slugs
 * @returns {string} Unique slug
 */
export function generateUniqueSlug(baseSlug, existingSlugs = []) {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

/**
 * Extract slug from URL path
 * @param {string} path - URL path
 * @returns {string} Extracted slug
 */
export function extractSlugFromPath(path) {
  if (!path) return "";

  // Remove leading/trailing slashes and get last segment
  const segments = path.replace(/^\/|\/$/g, "").split("/");
  return segments[segments.length - 1] || "";
}

/**
 * Convert slug back to readable title (best effort)
 * @param {string} slug - Slug to convert
 * @returns {string} Human-readable title
 */
export function slugToTitle(slug) {
  if (!slug) return "";

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Validate if a string is a valid slug
 * @param {string} slug - Slug to validate
 * @returns {boolean} Whether the slug is valid
 */
export function isValidSlug(slug) {
  if (!slug) return false;

  // Slug should only contain lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

export default slugify;
