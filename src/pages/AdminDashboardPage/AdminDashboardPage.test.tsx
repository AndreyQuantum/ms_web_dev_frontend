/**
 * Tests for AdminDashboardPage (T14).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Order } from '@/types';

vi.mock('@/api/orders', () => ({
  ordersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/api/products', () => ({
  productsApi: {
    list: vi.fn().mockResolvedValue({ items: [], page: 1, size: 10, total: 0 }),
    getById: vi.fn(),
  },
}));

import { ordersApi } from '@/api/orders';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage/AdminDashboardPage';
import { AuthProvider } from '@/hooks/useAuth';

function seedAdmin() {
  localStorage.setItem(
    'lm_admin_token',
    JSON.stringify({
      token: 't',
      user: { login: 'admin', role: 'admin' },
    }),
  );
}

const mockOrders: Order[] = Array.from({ length: 6 }, (_, i) => ({
  id: `ord-${i}`,
  customer: { email: `c${i}@x.com`, phone: '123' },
  deliveryMethod: 'pickup',
  items: [
    { productId: `p-${(i % 3) + 1}`, name: `Lamp ${(i % 3) + 1}`, price: 100, qty: i + 1 },
    { productId: `p-${(i % 5) + 1}`, name: `Lamp ${(i % 5) + 1}`, price: 50, qty: 1 },
  ],
  subtotal: 100,
  discount: 0,
  total: 100 * (i + 1),
  status: 'new',
  createdAt: new Date(2026, 4, 1 + i).toISOString(),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminDashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    seedAdmin();
    (ordersApi.list as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrders);
  });

  it('renders 4 KPI cards', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getAllByTestId('kpi-card')).toHaveLength(4);
    });
  });

  it('renders 7 sales bars in the chart', async () => {
    const { container } = renderDashboard();
    await waitFor(() => {
      const bars = container.querySelectorAll('[data-testid="sales-bar"]');
      expect(bars.length).toBe(7);
    });
  });

  it('renders 5 top-product entries', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getAllByTestId('top-product')).toHaveLength(5);
    });
  });
});
