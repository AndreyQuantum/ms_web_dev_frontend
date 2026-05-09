import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithStore';
import { CartPage } from './CartPage';

const preloadedCart = {
  cart: {
    items: [
      {
        productId: 'a',
        qty: 2,
        snapshot: { name: 'X', price: 10, imageUrl: '/p.png' },
      },
    ],
  },
};

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when cart has no items', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: { cart: { items: [] } },
    });
    expect(screen.getByText(/корзина пуста|пусто/i)).toBeInTheDocument();
  });

  it('shows lines from preloaded cart state with correct total', () => {
    renderWithProviders(<CartPage />, { preloadedState: preloadedCart });
    expect(screen.getByText('X')).toBeInTheDocument();
    // total = 2 * 10 = 20
    expect(screen.getByTestId('cart-total').textContent).toMatch(/20/);
  });

  it('plus button increments qty and updates total', async () => {
    renderWithProviders(<CartPage />, { preloadedState: preloadedCart });
    const plus = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(plus);
    // Now qty=3, total=30
    const total = await screen.findByTestId('cart-total');
    expect(total.textContent).toMatch(/30/);
  });

  it('remove button removes the line', async () => {
    renderWithProviders(<CartPage />, { preloadedState: preloadedCart });
    const remove = screen.getByRole('button', { name: /удал/i });
    fireEvent.click(remove);
    // Goes to empty state
    expect(await screen.findByText(/пуст/i)).toBeInTheDocument();
  });
});
