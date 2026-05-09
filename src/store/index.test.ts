import { describe, it, expect, beforeEach } from 'vitest';
import { makeStore, store } from './index';

const STORAGE_KEY = 'lm_cart';

describe('store factory (makeStore)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports a default `store` instance with a getState method', () => {
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('exposes the four root slice keys: products, cart, orders, reviews', () => {
    const s = makeStore();
    const state = s.getState() as Record<string, unknown>;
    expect(state).toHaveProperty('products');
    expect(state).toHaveProperty('cart');
    expect(state).toHaveProperty('orders');
    expect(state).toHaveProperty('reviews');
  });

  it('hydrates the cart slice from localStorage when valid JSON is present', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items: [{ productId: 'p1', qty: 3, snapshot: { name: 'P1', price: 10 } }] }),
    );
    const s = makeStore();
    const state = s.getState() as {
      cart: { items: Array<{ productId: string; qty: number }> };
    };
    expect(state.cart.items[0].qty).toBe(3);
    expect(state.cart.items[0].productId).toBe('p1');
  });

  it('does not throw when localStorage contains invalid JSON, and falls back to default cart state', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(() => makeStore()).not.toThrow();
    const s = makeStore();
    const state = s.getState() as { cart: unknown };
    expect(state.cart).toEqual({ items: [] });
  });

  it('does not hydrate when localStorage is empty (cart is the default {items: []})', () => {
    const s = makeStore();
    const state = s.getState() as { cart: unknown };
    expect(state.cart).toEqual({ items: [] });
  });

  it('persists state.cart to localStorage on every dispatch', () => {
    const s = makeStore();
    // Any dispatch will trigger the subscribe callback.
    s.dispatch({ type: '__test__/noop' });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw).toBe(JSON.stringify((s.getState() as { cart: unknown }).cart));
  });

  it('respects an explicit `preloaded` argument over the localStorage value', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items: [{ productId: 'p1', qty: 3, snapshot: { name: 'P1', price: 10 } }] }),
    );
    const s = makeStore({
      cart: {
        items: [
          { productId: 'override', qty: 9, snapshot: { name: 'O', price: 1 } },
        ],
      },
    });
    const state = s.getState() as {
      cart: { items: Array<{ productId: string; qty: number }> };
    };
    expect(state.cart.items[0].productId).toBe('override');
    expect(state.cart.items[0].qty).toBe(9);
  });
});
