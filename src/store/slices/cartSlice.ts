import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface CartSnapshot {
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  qty: number;
  snapshot: CartSnapshot;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{
        productId: string;
        qty: number;
        snapshot: CartSnapshot;
      }>,
    ) {
      const { productId, qty, snapshot } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.qty += qty;
        existing.snapshot = snapshot;
      } else {
        state.items.push({ productId, qty, snapshot });
      }
    },
    removeItem(state, action: PayloadAction<{ productId: string }>) {
      state.items = state.items.filter(
        (i) => i.productId !== action.payload.productId,
      );
    },
    setQty(
      state,
      action: PayloadAction<{ productId: string; qty: number }>,
    ) {
      const { productId, qty } = action.payload;
      if (qty <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
        return;
      }
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.qty = qty;
      }
    },
    clear(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, setQty, clear } = cartSlice.actions;
export default cartSlice.reducer;

// --- Selectors ---
export function selectCartItems(state: RootState): CartItem[] {
  return state.cart.items;
}

export function selectCartItemCount(state: RootState): number {
  return state.cart.items.reduce((sum, i) => sum + i.qty, 0);
}

export function selectCartSubtotal(state: RootState): number {
  return state.cart.items.reduce(
    (sum, i) => sum + i.snapshot.price * i.qty,
    0,
  );
}

export function selectCartDiscount(state: RootState): number {
  return state.cart.items.reduce((sum, i) => {
    const old = i.snapshot.oldPrice;
    if (old !== undefined && old > i.snapshot.price) {
      return sum + (old - i.snapshot.price) * i.qty;
    }
    return sum;
  }, 0);
}

export function selectCartTotal(state: RootState): number {
  return selectCartSubtotal(state);
}
