import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { useCart } from '@/hooks/useCart';
import { makeStore } from '@/store';

function makeWrapper() {
  const store = makeStore();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { Wrapper, store };
}

const snap = (overrides: Partial<{
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
}> = {}) => ({
  name: 'Test product',
  price: 100,
  ...overrides,
});

describe('useCart (Redux shim)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty items and itemCount=0 when store is fresh', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('merges repeated addItem calls for the same productId by summing qty', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 2, snap({ price: 100 }));
    });
    act(() => {
      result.current.addItem('p-001', 3, snap({ price: 100 }));
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: 'p-001', qty: 5 });
  });

  it('defaults addItem qty to 1 when omitted', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', undefined, snap());
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: 'p-001', qty: 1 });
  });

  it('removes the item when setQty is called with 0', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 2, snap());
    });
    act(() => {
      result.current.setQty('p-001', 0);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('removes the item when setQty is called with a negative number', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 4, snap());
    });
    act(() => {
      result.current.setQty('p-001', -3);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('clear() empties items and reflects empty state in localStorage', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 2, snap());
      result.current.addItem('p-002', 1, snap({ name: 'p2' }));
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.items).toEqual([]);

    const stored = localStorage.getItem('lm_cart');
    if (stored !== null) {
      expect(JSON.parse(stored)).toEqual({ items: [] });
    } else {
      expect(stored).toBeNull();
    }
  });

  it('persists items across remount: a fresh store restores from localStorage', () => {
    const first = makeWrapper();
    const firstHook = renderHook(() => useCart(), { wrapper: first.Wrapper });

    act(() => {
      firstHook.result.current.addItem('p-001', 2, snap({ price: 100 }));
      firstHook.result.current.addItem('p-002', 4, snap({ name: 'p2', price: 50 }));
    });

    firstHook.unmount();

    const second = makeWrapper();
    const secondHook = renderHook(() => useCart(), { wrapper: second.Wrapper });

    expect(secondHook.result.current.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ productId: 'p-001', qty: 2 }),
        expect.objectContaining({ productId: 'p-002', qty: 4 }),
      ]),
    );
    expect(secondHook.result.current.items).toHaveLength(2);
    expect(secondHook.result.current.itemCount).toBe(6);
  });

  it('computes subtotal/discount/total from snapshots (no oldPrice)', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 2, snap({ price: 100 }));
    });

    expect(result.current.subtotal).toBe(200);
    expect(result.current.discount).toBe(0);
    expect(result.current.total).toBe(200);
  });

  it('computes discount = (oldPrice - price) * qty when oldPrice > price', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 1, snap({ price: 100, oldPrice: 150 }));
    });

    expect(result.current.subtotal).toBe(100);
    expect(result.current.discount).toBe(50);
    expect(result.current.total).toBe(100);
  });

  it('falls back totals to 0 when addItem is called without a snapshot', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 2);
    });

    expect(result.current.subtotal).toBe(0);
    expect(result.current.discount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('initializes with empty items when localStorage value is corrupted (not JSON)', () => {
    localStorage.setItem('lm_cart', 'not json');

    expect(() => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => useCart(), { wrapper: Wrapper });
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
    }).not.toThrow();
  });

  it('removeItem(productId) cleanly removes the entry', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 2, snap());
      result.current.addItem('p-002', 3, snap({ name: 'p2' }));
    });
    act(() => {
      result.current.removeItem('p-001');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: 'p-002', qty: 3 });
  });

  it('getProduct(id) returns the snapshot of the cart line', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });

    act(() => {
      result.current.addItem('p-001', 1, snap({ name: 'A', price: 42, oldPrice: 50, imageUrl: '/a.png' }));
    });

    const product = result.current.getProduct('p-001');
    expect(product).toMatchObject({ name: 'A', price: 42, oldPrice: 50, imageUrl: '/a.png' });
  });

  it('getProduct(id) returns undefined when the productId is not in the cart', () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper });
    expect(result.current.getProduct('missing')).toBeUndefined();
  });
});
