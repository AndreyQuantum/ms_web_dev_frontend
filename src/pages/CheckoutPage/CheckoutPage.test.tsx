import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/orders', () => ({
  ordersApi: {
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
  },
}));

import { ordersApi } from '@/api/orders';
import { CheckoutPage } from '@/pages/CheckoutPage/CheckoutPage';
import { CartProvider } from '@/hooks/useCart';

function seedCart() {
  localStorage.setItem(
    'lm_cart',
    JSON.stringify({
      items: [
        { productId: 'p-001', qty: 2 },
        { productId: 'p-002', qty: 1 },
      ],
    }),
  );
}

const fakeLookup = (id: string) => {
  if (id === 'p-001') return { price: 100, name: 'Lamp 1' };
  if (id === 'p-002') return { price: 50, name: 'Lamp 2' };
  return undefined;
};

function renderCheckout() {
  return render(
    <MemoryRouter>
      <CartProvider getProduct={fakeLookup}>
        <CheckoutPage />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders both email and phone inputs', () => {
    seedCart();
    renderCheckout();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/телефон/i)).toBeInTheDocument();
  });

  it('does NOT call ordersApi.create when submitted with empty email', async () => {
    seedCart();
    (ordersApi.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const user = userEvent.setup();

    renderCheckout();

    const submit = screen.getByRole('button', { name: /Оформить заказ/i });
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
    expect(ordersApi.create).not.toHaveBeenCalled();
  });

  it('calls ordersApi.create once with valid email/phone and a non-empty cart', async () => {
    seedCart();
    (ordersApi.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ord-1',
      status: 'new',
    });
    const user = userEvent.setup();

    renderCheckout();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/телефон/i), '+71234567890');

    const submit = screen.getByRole('button', { name: /Оформить заказ/i });
    await user.click(submit);

    await waitFor(() => {
      expect(ordersApi.create).toHaveBeenCalledTimes(1);
    });
  });
});
