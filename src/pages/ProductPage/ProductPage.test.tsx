import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { Product, Review } from '@/types';

vi.mock('@/api/products', () => ({
  productsApi: {
    getById: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock('@/api/reviews', () => ({
  reviewsApi: {
    listByProduct: vi.fn(),
    create: vi.fn(),
  },
}));

import { productsApi } from '@/api/products';
import { reviewsApi } from '@/api/reviews';
import { ProductPage } from '@/pages/ProductPage/ProductPage';
import { CartProvider, useCart } from '@/hooks/useCart';

const sampleProduct: Product = {
  id: 'p-001',
  name: 'LED Лампа E27 10W',
  description: 'Описание лампы.',
  price: 199,
  brightnessLm: 800,
  rating: 4.6,
  reviewsCount: 12,
  inStock: true,
  stockQty: 100,
  isArchived: false,
  categoryId: 1,
  bulbTypeId: 1,
  bulbShapeId: 1,
  socketId: 1,
  supplierId: 1,
  imageUrl: '/img.png',
  createdAt: '2026-04-01T00:00:00.000Z',
  popularity: 80,
};

const sampleReviews: Review[] = [
  { id: 'r1', productId: 'p-001', author: 'A', rating: 5, text: 'Great', createdAt: '2026-04-01T00:00:00.000Z' },
  { id: 'r2', productId: 'p-001', author: 'B', rating: 4, text: 'Nice', createdAt: '2026-04-02T00:00:00.000Z' },
];

function buildRouter(initialPath: string = '/product/p-001') {
  return createMemoryRouter(
    [
      {
        path: '/product/:id',
        element: (
          <CartProvider>
            <ProductPage />
            <CartSpy />
          </CartProvider>
        ),
      },
    ],
    { initialEntries: [initialPath] },
  );
}

function CartSpy() {
  const { items } = useCart();
  return (
    <div data-testid="cart-spy">
      {items.map(i => `${i.productId}:${i.qty}`).join(',')}
    </div>
  );
}

describe('ProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (reviewsApi.listByProduct as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('shows the product name in a heading', async () => {
    (productsApi.getById as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProduct);

    render(<RouterProvider router={buildRouter()} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /LED Лампа E27 10W/ }),
      ).toBeInTheDocument();
    });
  });

  it('clicking "+" twice and "В корзину" adds the product with qty=3', async () => {
    (productsApi.getById as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProduct);
    const user = userEvent.setup();

    render(<RouterProvider router={buildRouter()} />);

    await screen.findByRole('heading', { name: /LED Лампа E27 10W/ });

    const plus = await screen.findByRole('button', { name: /^\+$/ });
    await user.click(plus);
    await user.click(plus);

    const addBtn = screen.getByRole('button', { name: /В корзину/ });
    await user.click(addBtn);

    await waitFor(() => {
      expect(screen.getByTestId('cart-spy').textContent).toBe('p-001:3');
    });
  });

  it('shows "Товар не найден" when productsApi.getById rejects', async () => {
    (productsApi.getById as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Not found'),
    );

    render(<RouterProvider router={buildRouter()} />);

    await waitFor(() => {
      expect(screen.getByText(/Товар не найден/i)).toBeInTheDocument();
    });
  });

  it('clicking the "Отзывы" tab shows the reviews list (2 items)', async () => {
    (productsApi.getById as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProduct);
    (reviewsApi.listByProduct as ReturnType<typeof vi.fn>).mockResolvedValue(sampleReviews);
    const user = userEvent.setup();

    render(<RouterProvider router={buildRouter()} />);

    await screen.findByRole('heading', { name: /LED Лампа E27 10W/ });

    const reviewsTab = await screen.findByRole('tab', { name: /Отзывы/ });
    await user.click(reviewsTab);

    await waitFor(() => {
      expect(screen.getByText(/Great/)).toBeInTheDocument();
      expect(screen.getByText(/Nice/)).toBeInTheDocument();
    });
  });
});
