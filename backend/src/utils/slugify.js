/**
 * Generates URL-friendly, sanitized slugs from string input.
 *
 * @param {string} text - Source string
 * @returns {string} URL slug
 */
export const slugify = (text = '') => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word chars
    .replace(/[\s_-]+/g, '-')     // Replace spaces, underscores with single hyphen
    .replace(/^-+|-+$/g, '');     // Trim hyphens
};

export default slugify;
