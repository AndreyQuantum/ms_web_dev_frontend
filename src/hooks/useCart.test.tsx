import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { CartProvider, useCart } from '@/hooks/useCart';

/**
 * Math contract for derived totals (must match implementation):
 *
 *   For each cart item with productId P and quantity Q:
 *     product = getProduct(P)               // may be undefined
 *     unitPrice = product?.price ?? 0
 *     unitOld   = product?.oldPrice ?? unitPrice
 *
 *   subtotal = Σ unitPrice * Q                 // current price × qty
 *   discount = Σ max(0, unitOld - unitPrice) * Q
 *   total    = subtotal                        // subtotal already reflects the discounted price
 *
 * If `getProduct` is not provided (or returns undefined for an id),
 * that line contributes 0 to subtotal/discount/total.
 */

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const makeWrapper =
  (getProduct: (id: string) => { price: number; oldPrice?: number } | undefined) =>
  ({ children }: { children: ReactNode }) =>
    <CartProvider getProduct={getProduct}>{children}</CartProvider>;

describe('useCart', () => {
  it('initializes with empty items and itemCount=0 when localStorage is empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('merges repeated addItem calls for the same productId by summing qty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem('p-001', 2);
    });
    act(() => {
      result.current.addItem('p-001', 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: 'p-001', qty: 5 });
  });

  it('defaults addItem qty to 1 when omitted', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem('p-001');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: 'p-001', qty: 1 });
  });

  it('removes the item when setQty is called with 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem('p-001', 2);
    });
    act(() => {
      result.current.setQty('p-001', 0);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('removes the item when setQty is called with a negative number', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem('p-001', 4);
    });
    act(() => {
      result.current.setQty('p-001', -3);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('clear() empties items and reflects empty state in localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem('p-001', 2);
      result.current.addItem('p-002', 1);
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.items).toEqual([]);

    const stored = localStorage.getItem('lm_cart');
    if (stored !== null) {
      // Empty serialized state form
      expect(JSON.parse(stored)).toEqual({ items: [] });
    } else {
      expect(stored).toBeNull();
    }
  });

  it('persists items across remount: a fresh provider restores from localStorage', () => {
    const first = renderHook(() => useCart(), { wrapper });

    act(() => {
      first.result.current.addItem('p-001', 2);
      first.result.current.addItem('p-002', 4);
    });

    first.unmount();

    const second = renderHook(() => useCart(), { wrapper });

    // Order-independent comparison
    expect(second.result.current.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ productId: 'p-001', qty: 2 }),
        expect.objectContaining({ productId: 'p-002', qty: 4 }),
      ]),
    );
    expect(second.result.current.items).toHaveLength(2);
    expect(second.result.current.itemCount).toBe(6);
  });

  it('computes subtotal/discount/total via injected getProduct (no oldPrice)', () => {
    const getProduct = (id: string) =>
      id === 'p-001' ? { price: 100 } : undefined;

    const { result } = renderHook(() => useCart(), {
      wrapper: makeWrapper(getProduct),
    });

    act(() => {
      result.current.addItem('p-001', 2);
    });

    expect(result.current.subtotal).toBe(200);
    expect(result.current.discount).toBe(0);
    expect(result.current.total).toBe(200);
  });

  it('computes discount = (oldPrice - price) * qty when oldPrice > price', () => {
    const getProduct = (id: string) =>
      id === 'p-001' ? { price: 100, oldPrice: 150 } : undefined;

    const { result } = renderHook(() => useCart(), {
      wrapper: makeWrapper(getProduct),
    });

    act(() => {
      result.current.addItem('p-001', 1);
    });

    // subtotal uses current price; discount captures savings vs oldPrice
    expect(result.current.subtotal).toBe(100);
    expect(result.current.discount).toBe(50);
    expect(result.current.total).toBe(100);
  });

  it('falls back totals to 0 when getProduct is not provided', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

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
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
    }).not.toThrow();
  });

  it('removeItem(productId) cleanly removes the entry', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem('p-001', 2);
      result.current.addItem('p-002', 3);
    });
    act(() => {
      result.current.removeItem('p-001');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: 'p-002', qty: 3 });
  });
});
