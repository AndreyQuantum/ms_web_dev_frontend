/**
 * Tests for `<ProductCard>` (T6).
 *
 * Contract under test:
 *   - Renders the product's `name` and `price`.
 *   - Out-of-stock product (inStock=false): the CTA is disabled and a badge
 *     containing "Нет в наличии" is rendered.
 *   - Clicking the CTA calls `onAddToCart`. The argument may be the product
 *     object OR the product id; this test is permissive — it accepts either.
 *     (Doc note: the developer should pick one and stay consistent.)
 *   - Renders the rating using `<Stars value={product.rating}>` — at least
 *     `Math.floor(product.rating)` stars must have data-filled="true".
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { Product } from '@/types/product';

const baseProduct: Product = {
  id: 'p-001',
  name: 'LED Лампа E27 10W 800лм',
  description: 'desc',
  price: 199,
  brightnessLm: 800,
  rating: 4,
  reviewsCount: 10,
  inStock: true,
  stockQty: 100,
  isArchived: false,
  categoryId: 1,
  bulbTypeId: 1,
  bulbShapeId: 1,
  socketId: 1,
  supplierId: 1,
  imageUrl: '/images/products/p-001.png',
  createdAt: '2026-04-15T12:00:00.000Z',
  popularity: 1,
};

const renderCard = (product: Product, onAddToCart = vi.fn()) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} onAddToCart={onAddToCart} />
    </MemoryRouter>
  );

describe('<ProductCard>', () => {
  it("renders the product's name and price", () => {
    renderCard(baseProduct);
    expect(screen.getByText(baseProduct.name)).toBeInTheDocument();
    // The numeric value of the price should be in the document somewhere.
    expect(
      screen.getByText((content) => content.includes('199'))
    ).toBeInTheDocument();
  });

  it('disables CTA and shows "Нет в наличии" when out of stock', () => {
    renderCard({ ...baseProduct, inStock: false, stockQty: 0 });
    const cta = screen.getByRole('button', { name: /В корзину|Купить|Добавить/i });
    expect(cta).toBeDisabled();
    expect(screen.getByText('Нет в наличии')).toBeInTheDocument();
  });

  it('calls onAddToCart when CTA is clicked (with product or product.id)', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    renderCard(baseProduct, onAddToCart);
    await user.click(
      screen.getByRole('button', { name: /В корзину|Купить|Добавить/i })
    );
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    const arg = onAddToCart.mock.calls[0][0];
    const passedFullProduct =
      arg && typeof arg === 'object' && arg.id === baseProduct.id;
    const passedId = arg === baseProduct.id;
    expect(passedFullProduct || passedId).toBe(true);
  });

  it('renders rating via <Stars value={product.rating}>', () => {
    renderCard({ ...baseProduct, rating: 3 });
    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(5);
    const filled = stars.filter(
      (s) => s.getAttribute('data-filled') === 'true'
    );
    expect(filled.length).toBeGreaterThanOrEqual(3);
  });
});
