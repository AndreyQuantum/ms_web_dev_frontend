import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addItem as addItemAction,
  removeItem as removeItemAction,
  setQty as setQtyAction,
  clear as clearAction,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartDiscount,
  selectCartTotal,
} from '@/store/slices/cartSlice';
import type { CartItem as SliceCartItem } from '@/store/slices/cartSlice';

export interface CartItemSnapshot {
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
}

// Re-export the slice CartItem shape so consumers can keep using `CartItem`
export type CartItem = SliceCartItem;

export interface CartContextValue {
  items: SliceCartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  addItem: (
    productId: string,
    qty?: number,
    snapshot?: CartItemSnapshot,
  ) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  getProduct: (productId: string) => CartItemSnapshot | undefined;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const discount = useAppSelector(selectCartDiscount);
  const total = useAppSelector(selectCartTotal);

  const addItem = useCallback(
    (productId: string, qty: number = 1, snapshot?: CartItemSnapshot) => {
      if (!snapshot) {
        console.warn(
          '[useCart] addItem called without snapshot — totals will be 0 for this line',
        );
      }
      dispatch(
        addItemAction({
          productId,
          qty,
          snapshot: snapshot ?? { name: '', price: 0 },
        }),
      );
    },
    [dispatch],
  );

  const removeItem = useCallback(
    (productId: string) => {
      dispatch(removeItemAction({ productId }));
    },
    [dispatch],
  );

  const setQtyCb = useCallback(
    (productId: string, qty: number) => {
      dispatch(setQtyAction({ productId, qty }));
    },
    [dispatch],
  );

  const clear = useCallback(() => {
    dispatch(clearAction());
  }, [dispatch]);

  const getProduct = useCallback(
    (productId: string): CartItemSnapshot | undefined => {
      const line = items.find((it) => it.productId === productId);
      return line?.snapshot;
    },
    [items],
  );

  return {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    addItem,
    removeItem,
    setQty: setQtyCb,
    clear,
    getProduct,
  };
}

// No-op CartProvider preserved for back-compat with any leftover imports.
// The real state now lives in the Redux store wired up via <Provider> in main.tsx.
export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
