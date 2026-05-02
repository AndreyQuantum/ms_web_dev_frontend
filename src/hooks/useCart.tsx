import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartItem {
  productId: string;
  qty: number;
}

export interface ProductLookup {
  price: number;
  oldPrice?: number;
  name?: string;
  imageUrl?: string;
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  getProduct: (productId: string) => ProductLookup | undefined;
}

const STORAGE_KEY = 'lm_cart';
const CartContext = createContext<CartContextValue | null>(null);

function readPersisted(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    return Array.isArray(parsed?.items) ? parsed.items.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
}

interface ProviderProps {
  children: ReactNode;
  getProduct?: (productId: string) => ProductLookup | undefined;
}

export function CartProvider({ children, getProduct }: ProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => readPersisted());

  useEffect(() => {
    persist(items);
  }, [items]);

  const addItem = (productId: string, qty: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...prev, { productId, qty }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, qty } : i)),
    );
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    for (const item of items) {
      const p = getProduct?.(item.productId);
      if (!p) continue;
      subtotal += p.price * item.qty;
      if (p.oldPrice && p.oldPrice > p.price) {
        discount += (p.oldPrice - p.price) * item.qty;
      }
    }
    return { subtotal, discount, total: subtotal };
  }, [items, getProduct]);

  const value: CartContextValue = {
    items,
    itemCount: items.reduce((acc, i) => acc + i.qty, 0),
    addItem,
    removeItem,
    setQty,
    clear,
    getProduct: (id: string) => getProduct?.(id),
    ...totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
