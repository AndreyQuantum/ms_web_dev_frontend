import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

vi.mock('@/api/products', () => ({
  productsApi: {
    list: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock('@/api/dictionaries', () => ({
  dictionariesApi: {
    listCategories: vi.fn().mockResolvedValue([]),
    listBulbTypes: vi.fn().mockResolvedValue([]),
    listShapes: vi.fn().mockResolvedValue([]),
    listSockets: vi.fn().mockResolvedValue([]),
    listSuppliers: vi.fn().mockResolvedValue([]),
    listPromos: vi.fn().mockResolvedValue([]),
  },
}));

import { productsApi } from '@/api/products';
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage';
import { CartProvider } from '@/hooks/useCart';

const okResponse = (n: number = 0) => ({
  items: Array.from({ length: n }, (_, i) => ({
    id: `p-${i}`,
    name: `Lamp ${i}`,
    description: 'd',
    price: 100,
    brightnessLm: 800,
    rating: 4,
    reviewsCount: 1,
    inStock: true,
    stockQty: 1,
    isArchived: false,
    categoryId: 1,
    bulbTypeId: 1,
    bulbShapeId: 1,
    socketId: 1,
    supplierId: 1,
    imageUrl: '/x.png',
    createdAt: '2026-04-01T00:00:00.000Z',
    popularity: 1,
  })),
  page: 1,
  size: 12,
  total: n,
});

function buildRouter() {
  return createMemoryRouter(
    [
      {
        path: '/catalog',
        element: (
          <CartProvider>
            <CatalogPage />
          </CartProvider>
        ),
      },
    ],
    { initialEntries: ['/catalog'] },
  );
}

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls productsApi.list with { page: 1 } on mount', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue(okResponse(1));

    render(<RouterProvider router={buildRouter()} />);

    await waitFor(() => {
      expect(productsApi.list).toHaveBeenCalled();
    });

    const firstCall = (productsApi.list as ReturnType<typeof vi.fn>).mock.calls[0][0] ?? {};
    expect(firstCall.page).toBe(1);
  });

  it('typing "LED" in search and pressing Enter triggers a call with search: "LED"', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue(okResponse(1));
    const user = userEvent.setup();

    render(<RouterProvider router={buildRouter()} />);

    const input = await screen.findByRole('searchbox');
    await user.type(input, 'LED{Enter}');

    await waitFor(() => {
      const calls = (productsApi.list as ReturnType<typeof vi.fn>).mock.calls;
      expect(
        calls.some(([params]) => params?.search === 'LED'),
      ).toBe(true);
    });
  });

  it('clicking "Цена ↑" sort button triggers a call with sort: "priceAsc"', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue(okResponse(1));
    const user = userEvent.setup();

    render(<RouterProvider router={buildRouter()} />);

    const btn = await screen.findByRole('button', { name: /Цена ↑/ });
    await user.click(btn);

    await waitFor(() => {
      const calls = (productsApi.list as ReturnType<typeof vi.fn>).mock.calls;
      expect(
        calls.some(([params]) => params?.sort === 'priceAsc'),
      ).toBe(true);
    });
  });

  it('shows "Ничего не найдено" when productsApi.list returns 0 items', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue(okResponse(0));

    render(<RouterProvider router={buildRouter()} />);

    await waitFor(() => {
      expect(screen.getByText(/Ничего не найдено/i)).toBeInTheDocument();
    });
  });
});
