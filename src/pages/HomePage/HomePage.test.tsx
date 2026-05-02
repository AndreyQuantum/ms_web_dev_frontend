/**
 * Tests for HomePage (T7).
 *
 * Smoke + key-behaviour layer:
 *  - heading "Популярные товары" renders
 *  - 8 product cards render when productsApi.list returns 8 items
 *  - 3 promo cards render when listPromos returns 3 promos
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Product } from '@/types';

vi.mock('@/api/products', () => ({
  productsApi: {
    list: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock('@/api/dictionaries', () => ({
  dictionariesApi: {
    listPromos: vi.fn(),
    listCategories: vi.fn().mockResolvedValue([]),
    listBulbTypes: vi.fn().mockResolvedValue([]),
    listShapes: vi.fn().mockResolvedValue([]),
    listSockets: vi.fn().mockResolvedValue([]),
    listSuppliers: vi.fn().mockResolvedValue([]),
  },
}));

import { productsApi } from '@/api/products';
import { dictionariesApi } from '@/api/dictionaries';
import { HomePage } from '@/pages/HomePage/HomePage';
import { CartProvider } from '@/hooks/useCart';

function makeProduct(i: number): Product {
  return {
    id: `p-${i}`,
    name: `Lamp ${i}`,
    description: 'desc',
    price: 100 + i,
    brightnessLm: 800,
    rating: 4.5,
    reviewsCount: 10,
    inStock: true,
    stockQty: 50,
    isArchived: false,
    categoryId: 1,
    bulbTypeId: 1,
    bulbShapeId: 1,
    socketId: 1,
    supplierId: 1,
    imageUrl: '/img.png',
    createdAt: '2026-04-01T00:00:00.000Z',
    popularity: 50,
  };
}

describe('HomePage', () => {
  it('renders the "Популярные товары" heading', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: Array.from({ length: 8 }, (_, i) => makeProduct(i + 1)),
      page: 1,
      size: 8,
      total: 8,
    });
    (dictionariesApi.listPromos as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Популярные товары/i })).toBeInTheDocument();
    });
  });

  it('renders 8 product cards when productsApi.list returns 8 items', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: Array.from({ length: 8 }, (_, i) => makeProduct(i + 1)),
      page: 1,
      size: 8,
      total: 8,
    });
    (dictionariesApi.listPromos as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(8);
    });
  });

  it('renders 3 promo cards when listPromos returns 3 promos', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      page: 1,
      size: 8,
      total: 0,
    });
    (dictionariesApi.listPromos as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Promo A', discountPercent: 10 },
      { id: 2, name: 'Promo B', discountPercent: 20 },
      { id: 3, name: 'Promo C', discountPercent: 30 },
    ]);

    render(
      <MemoryRouter>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('promo-card')).toHaveLength(3);
    });
  });
});
