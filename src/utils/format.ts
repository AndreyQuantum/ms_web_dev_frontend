/**
 * Formatting helpers.
 */

/**
 * Format a numeric price as a Russian-style price string with the ruble sign.
 *
 * Examples:
 *   formatPrice(1234)   -> "1 234 ₽"
 *   formatPrice(199)    -> "199 ₽"
 *   formatPrice(123456) -> "123 456 ₽"
 */
export function formatPrice(n: number): string {
  const rounded = Math.round(n);
  // Use a non-breaking space for thousands separator, regular space before sign.
  const withSeparators = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSeparators} ₽`;
}
