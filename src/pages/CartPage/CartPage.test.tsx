import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/hooks/useCart';
import { CartPage } from '@/pages/CartPage/CartPage';

const fakeLookup = (id: string) => {
  if (id === 'p-001') return { price: 100, name: 'Lamp 1', imageUrl: '/x.png' };
  if (id === 'p-002') return { price: 50, name: 'Lamp 2', imageUrl: '/y.png' };
  return undefined;
};

function renderCart() {
  return render(
    <MemoryRouter>
      <CartProvider getProduct={fakeLookup}>
        <CartPage />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows "Корзина пуста" when the cart is empty', () => {
    renderCart();
    expect(screen.getByText(/Корзина пуста/i)).toBeInTheDocument();
  });

  it('renders 2 rows for 2 seeded items and shows formatted subtotal containing "250"', () => {
    localStorage.setItem(
      'lm_cart',
      JSON.stringify({
        items: [
          { productId: 'p-001', qty: 2 },
          { productId: 'p-002', qty: 1 },
        ],
      }),
    );

    renderCart();

    const rows = screen.getAllByTestId('cart-row');
    expect(rows).toHaveLength(2);
    expect(screen.getByTestId('cart-subtotal').textContent).toMatch(/250/);
  });

  it('clicking "remove" on a row reduces the rendered row count', async () => {
    localStorage.setItem(
      'lm_cart',
      JSON.stringify({
        items: [
          { productId: 'p-001', qty: 2 },
          { productId: 'p-002', qty: 1 },
        ],
      }),
    );

    const user = userEvent.setup();
    renderCart();

    expect(screen.getAllByTestId('cart-row')).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', { name: /Удалить/i });
    await user.click(removeButtons[0]);

    expect(screen.getAllByTestId('cart-row')).toHaveLength(1);
  });
});
