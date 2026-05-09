import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/orders', () => ({
  ordersApi: {
    create: vi.fn(),
  },
}));

import { configureStore } from '@reduxjs/toolkit';
import ordersReducer, { createOrder } from './ordersSlice';
import { ordersApi } from '@/api/orders';
import type { Order } from '@/types';

function makeTestStore() {
  return configureStore({ reducer: { orders: ordersReducer } });
}

const fakeOrder: Order = {
  id: 'o1',
  customer: { email: 'a@b.c', phone: '111' },
  deliveryMethod: 'pickup',
  items: [{ productId: 'p1', name: 'P1', price: 10, qty: 2 }],
  subtotal: 20,
  discount: 0,
  total: 20,
  status: 'new',
  createdAt: '2024-01-01T00:00:00Z',
};

const fakeInput = {
  email: 'a@b.c',
  phone: '111',
  deliveryMethod: 'pickup' as const,
  items: [{ productId: 'p1', name: 'P1', price: 10, qty: 2 }],
};

describe('ordersSlice initial state', () => {
  it('is idle with no error / no order', () => {
    const store = makeTestStore();
    const state = store.getState().orders;
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.lastOrder).toBeNull();
  });
});

describe('createOrder thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fulfilled: status=ok and lastOrder=payload', async () => {
    (ordersApi.create as ReturnType<typeof vi.fn>).mockResolvedValue(fakeOrder);
    const store = makeTestStore();
    await store.dispatch(createOrder(fakeInput));
    const s = store.getState().orders;
    expect(s.status).toBe('ok');
    expect(s.lastOrder).toEqual(fakeOrder);
    expect(s.error).toBeNull();
  });

  it('rejected: status=error and error=msg', async () => {
    (ordersApi.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('orderfail'),
    );
    const store = makeTestStore();
    await store.dispatch(createOrder(fakeInput));
    const s = store.getState().orders;
    expect(s.status).toBe('error');
    expect(s.error).toBe('orderfail');
  });
});
