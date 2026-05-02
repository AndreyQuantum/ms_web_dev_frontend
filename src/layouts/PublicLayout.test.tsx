/**
 * Tests for `<PublicLayout>` (T6).
 *
 * Mounted inside `<MemoryRouter>` + `<CartProvider>` via `createMemoryRouter`,
 * with a stub child route to verify <Outlet /> renders.
 *
 * Contract under test:
 *   - Header has links to `/` (text "Главная"), `/catalog` ("Каталог"),
 *     `/about` ("О компании").
 *   - A cart link to `/cart` exists.
 *   - When `useCart().itemCount > 0` (achieved by pre-seeding localStorage
 *     `lm_cart` with `{items:[{productId:'p-001',qty:3}]}`), the cart badge
 *     shows the count.
 *   - When itemCount is 0, the badge is NOT in the document.
 *   - Footer is present (data-testid="public-footer").
 *   - The <Outlet /> child renders.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { PublicLayout } from '@/layouts/PublicLayout';
import { CartProvider } from '@/hooks/useCart';

const ChildStub = () => <div data-testid="child-stub">child</div>;

function buildRouter() {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <PublicLayout />,
        children: [{ index: true, element: <ChildStub /> }],
      },
    ],
    { initialEntries: ['/'] }
  );
}

const renderLayout = () =>
  render(
    <CartProvider>
      <RouterProvider router={buildRouter()} />
    </CartProvider>
  );

describe('<PublicLayout>', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders header nav links (/, /catalog, /about) and cart link to /cart', () => {
    renderLayout();

    const home = screen.getByRole('link', { name: /Главная/i });
    expect(home).toHaveAttribute('href', '/');

    const catalog = screen.getByRole('link', { name: /Каталог/i });
    expect(catalog).toHaveAttribute('href', '/catalog');

    const about = screen.getByRole('link', { name: /О компании/i });
    expect(about).toHaveAttribute('href', '/about');

    // Cart link — match by href to be agnostic to icon/text content.
    const cartLink = screen
      .getAllByRole('link')
      .find((a) => (a as HTMLAnchorElement).getAttribute('href') === '/cart');
    expect(cartLink).toBeTruthy();
  });

  it('shows cart badge with the count when itemCount > 0 (seeded via localStorage)', () => {
    localStorage.setItem(
      'lm_cart',
      JSON.stringify({ items: [{ productId: 'p-001', qty: 3 }] })
    );
    renderLayout();

    const badge = screen.getByTestId('cart-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain('3');
  });

  it('does not render cart badge when itemCount is 0', () => {
    renderLayout();
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderLayout();
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });

  it('renders the <Outlet /> child route content', () => {
    renderLayout();
    expect(screen.getByTestId('child-stub')).toBeInTheDocument();
  });
});
