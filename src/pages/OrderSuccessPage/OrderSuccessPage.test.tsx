import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { makeStore } from '@/store';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage/OrderSuccessPage';
import type { Order } from '@/types';

const orderShape = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  customer: { email: 'a@b', phone: '+7', comment: '' },
  deliveryMethod: 'courier',
  items: [],
  subtotal: 42,
  discount: 0,
  total: 42,
  status: 'new',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

interface RenderOptions {
  preloadedOrders?: {
    status: 'idle' | 'creating' | 'ok' | 'error';
    error: string | null;
    lastOrder: Order | null;
  };
  route?: string;
}

function renderPage(opts: RenderOptions = {}) {
  const preloaded = opts.preloadedOrders
    ? { orders: opts.preloadedOrders }
    : undefined;
  const store = makeStore(preloaded as never);
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[opts.route ?? '/order-success']}>
        <OrderSuccessPage />
      </MemoryRouter>
    </Provider>,
  );
  return { ...utils, store };
}

beforeEach(() => {
  localStorage.clear();
});

describe('OrderSuccessPage', () => {
  it('renders order id and total when lastOrder is set in Redux', () => {
    renderPage({
      preloadedOrders: {
        status: 'ok',
        error: null,
        lastOrder: orderShape(),
      },
    });

    expect(screen.getByText(/o1/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('renders fallback message and link to "/" when lastOrder is null', () => {
    renderPage({
      preloadedOrders: {
        status: 'idle',
        error: null,
        lastOrder: null,
      },
    });

    expect(screen.getByText(/не найден|пуст/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /каталог|главн/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('shows a "Back to catalog" link pointing to "/" when lastOrder is set', () => {
    renderPage({
      preloadedOrders: {
        status: 'ok',
        error: null,
        lastOrder: orderShape({ id: 'order-xyz', total: 999 }),
      },
    });

    expect(screen.getByText(/order-xyz/)).toBeInTheDocument();
    expect(screen.getByText(/999/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /каталог|главн/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
