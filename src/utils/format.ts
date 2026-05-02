export function formatPrice(n: number): string {
  const rounded = Math.round(n);
  const withSeparators = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSeparators} ₽`;
}
