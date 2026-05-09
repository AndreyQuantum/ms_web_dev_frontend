import { describe, it, expect } from 'vitest';
import cartReducer, {
  addItem,
  removeItem,
  setQty,
  clear,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartDiscount,
  selectCartTotal,
} from './cartSlice';
import type { RootState } from '../index';

const initial = { items: [] };

function buildState(items: Array<{
  productId: string;
  qty: number;
  snapshot: { name: string; price: number; oldPrice?: number; imageUrl?: string };
}>): RootState {
  // We only need the cart slice for selector tests
  return { cart: { items } } as unknown as RootState;
}

describe('cartSlice reducers', () => {
  it('addItem: appends a new line to an empty cart', () => {
    const next = cartReducer(
      initial,
      addItem({
        productId: 'a',
        qty: 2,
        snapshot: { name: 'A', price: 10 },
      }),
    );
    expect(next.items.length).toBe(1);
    expect(next.items[0].productId).toBe('a');
    expect(next.items[0].qty).toBe(2);
    expect(next.items[0].snapshot.price).toBe(10);
  });

  it('addItem: existing line — adds qty AND updates snapshot to latest', () => {
    const start = {
      items: [
        { productId: 'a', qty: 2, snapshot: { name: 'A', price: 10 } },
      ],
    };
    const next = cartReducer(
      start,
      addItem({
        productId: 'a',
        qty: 3,
        snapshot: { name: 'A2', price: 11 },
      }),
    );
    expect(next.items.length).toBe(1);
    expect(next.items[0].qty).toBe(5);
    expect(next.items[0].snapshot.name).toBe('A2');
    expect(next.items[0].snapshot.price).toBe(11);
  });

  it('removeItem: removes a line by productId', () => {
    const start = {
      items: [
        { productId: 'a', qty: 1, snapshot: { name: 'A', price: 10 } },
        { productId: 'b', qty: 2, snapshot: { name: 'B', price: 5 } },
      ],
    };
    const next = cartReducer(start, removeItem({ productId: 'a' }));
    expect(next.items.length).toBe(1);
    expect(next.items[0].productId).toBe('b');
  });

  it('setQty: with qty>0 updates qty', () => {
    const start = {
      items: [
        { productId: 'a', qty: 5, snapshot: { name: 'A', price: 10 } },
      ],
    };
    const next = cartReducer(start, setQty({ productId: 'a', qty: 7 }));
    expect(next.items[0].qty).toBe(7);
  });

  it('setQty: with qty<=0 removes the line', () => {
    const start = {
      items: [
        { productId: 'a', qty: 5, snapshot: { name: 'A', price: 10 } },
      ],
    };
    const next = cartReducer(start, setQty({ productId: 'a', qty: 0 }));
    expect(next.items.length).toBe(0);
  });

  it('clear: empties the cart', () => {
    const start = {
      items: [
        { productId: 'a', qty: 1, snapshot: { name: 'A', price: 10 } },
      ],
    };
    const next = cartReducer(start, clear());
    expect(next.items).toEqual([]);
  });
});

describe('cartSlice selectors', () => {
  const state = buildState([
    { productId: 'a', qty: 2, snapshot: { name: 'A', price: 10, oldPrice: 15 } },
    { productId: 'b', qty: 3, snapshot: { name: 'B', price: 5 } },
  ]);

  it('selectCartItems returns items', () => {
    expect(selectCartItems(state).length).toBe(2);
  });

  it('selectCartItemCount returns sum of qty', () => {
    expect(selectCartItemCount(state)).toBe(5);
  });

  it('selectCartSubtotal sums price*qty', () => {
    // 10*2 + 5*3 = 20 + 15 = 35
    expect(selectCartSubtotal(state)).toBe(35);
  });

  it('selectCartDiscount sums (oldPrice-price)*qty when oldPrice>price', () => {
    // (15-10)*2 = 10; b has no oldPrice -> 0
    expect(selectCartDiscount(state)).toBe(10);
  });

  it('selectCartTotal equals subtotal (informational discount)', () => {
    expect(selectCartTotal(state)).toBe(35);
  });
});
