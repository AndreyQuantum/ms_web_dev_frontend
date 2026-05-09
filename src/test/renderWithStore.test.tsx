import { describe, it, expect, beforeEach } from 'vitest';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { renderWithProviders, type RootState } from './renderWithStore';

function CartItemsProbe() {
  const items = useSelector((state: RootState) => state.cart.items);
  return <div data-testid="value">{String(items.length)}</div>;
}

function UseLocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

describe('renderWithProviders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes preloaded state to useSelector via the Redux Provider', () => {
    const { getByTestId, store } = renderWithProviders(<CartItemsProbe />, {
      preloadedState: {
        cart: {
          items: [
            {
              productId: 'a',
              qty: 1,
              snapshot: { name: 'A', price: 1 },
            },
          ],
        },
      },
    });

    expect(getByTestId('value').textContent).toBe('1');
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
  });

  it('mounts a MemoryRouter at the requested initial route', () => {
    const { getByTestId } = renderWithProviders(<UseLocationProbe />, {
      route: '/cart',
    });

    expect(getByTestId('pathname').textContent).toBe('/cart');
  });

  it('defaults to "/" when no route is supplied', () => {
    const { getByTestId } = renderWithProviders(<UseLocationProbe />);
    expect(getByTestId('pathname').textContent).toBe('/');
  });

  it('returns the store it built so tests can dispatch / read state', () => {
    const { store } = renderWithProviders(<CartItemsProbe />, {
      preloadedState: {
        cart: {
          items: [
            {
              productId: 'b',
              qty: 5,
              snapshot: { name: 'B', price: 2 },
            },
          ],
        },
      },
    });
    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().cart.items[0].productId).toBe('b');
  });
});
