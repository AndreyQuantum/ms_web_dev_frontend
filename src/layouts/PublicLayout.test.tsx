import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { PublicLayout } from '@/layouts/PublicLayout';
import { renderWithProviders, type RootState } from '@/test/renderWithStore';

const ChildStub = () => <div data-testid="child-stub">child</div>;

function renderLayout(preloadedState?: Partial<RootState>) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<ChildStub />} />
      </Route>
    </Routes>,
    { preloadedState, route: '/' },
  );
}

describe('<PublicLayout>', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders header nav links (/, /catalog, /about) and cart link to /cart', () => {
    renderLayout({ cart: { items: [] } });

    const home = screen.getByRole('link', { name: /Главная/i });
    expect(home).toHaveAttribute('href', '/');

    const catalog = screen.getByRole('link', { name: /Каталог/i });
    expect(catalog).toHaveAttribute('href', '/catalog');

    const about = screen.getByRole('link', { name: /О компании/i });
    expect(about).toHaveAttribute('href', '/about');

    const cartLink = screen
      .getAllByRole('link')
      .find((a) => (a as HTMLAnchorElement).getAttribute('href') === '/cart');
    expect(cartLink).toBeTruthy();
  });

  it('shows cart badge with total qty from preloaded state', () => {
    renderLayout({
      cart: {
        items: [
          { productId: 'a', qty: 2, snapshot: { name: 'X', price: 1 } },
          { productId: 'b', qty: 1, snapshot: { name: 'Y', price: 1 } },
        ],
      },
    });

    const badge = screen.getByTestId('cart-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain('3');
  });

  it('does not render cart badge when itemCount is 0', () => {
    renderLayout({ cart: { items: [] } });
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderLayout({ cart: { items: [] } });
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });

  it('renders the <Outlet /> child route content', () => {
    renderLayout({ cart: { items: [] } });
    expect(screen.getByTestId('child-stub')).toBeInTheDocument();
  });
});
