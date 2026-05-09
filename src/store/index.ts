import { configureStore, combineReducers } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import reviewsReducer from './slices/reviewsSlice';

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  reviews: reviewsReducer,
});

const STORAGE_KEY = 'lm_cart';

function loadCart(): unknown | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function makeStore(preloaded?: Partial<ReturnType<typeof rootReducer>>) {
  const cartPreload = loadCart();
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      ...(cartPreload ? { cart: cartPreload } : {}),
      ...preloaded,
    } as Partial<ReturnType<typeof rootReducer>>,
  });
  store.subscribe(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().cart));
    } catch {
      /* ignore quota / serialization failures */
    }
  });
  return store;
}

export const store = makeStore();
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
