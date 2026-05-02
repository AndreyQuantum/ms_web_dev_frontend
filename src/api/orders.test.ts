import { describe, it, expect, beforeEach } from 'vitest';
import { ordersApi } from '@/api/orders';
import { setLatency } from '@/api/_latency';
import type { Customer, DeliveryMethod, OrderItem } from '@/types';

const sampleCustomer: Customer = {
  email: 'qa@example.com',
  phone: '+79991234567',
  comment: 'Test order',
};

const sampleItems: OrderItem[] = [
  { productId: 'p-001', name: 'LED Лампа E27 10W 800лм', price: 199, qty: 2 },
  { productId: 'p-008', name: 'LED Лампа E27 15W 1500лм', price: 399, qty: 1 },
];

const samplePayload = {
  customer: sampleCustomer,
  deliveryMethod: 'courier' as DeliveryMethod,
  items: sampleItems,
};

describe('ordersApi.create', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('returns an Order with status="new", non-empty id, and items echoed', async () => {
    const order = await ordersApi.create(samplePayload);
    expect(order.status).toBe('new');
    expect(typeof order.id).toBe('string');
    expect(order.id.length).toBeGreaterThan(0);
    expect(order.items.length).toBe(sampleItems.length);
    for (let i = 0; i < sampleItems.length; i++) {
      expect(order.items[i].productId).toBe(sampleItems[i].productId);
      expect(order.items[i].qty).toBe(sampleItems[i].qty);
      expect(order.items[i].price).toBe(sampleItems[i].price);
    }
  });

  it('computes subtotal/discount/total (subtotal = sum(price*qty), total > 0)', async () => {
    const order = await ordersApi.create(samplePayload);

    const expectedSubtotal = sampleItems.reduce(
      (acc, it) => acc + it.price * it.qty,
      0,
    );
    expect(order.subtotal).toBe(expectedSubtotal);
    expect(typeof order.discount).toBe('number');
    expect(order.discount).toBeGreaterThanOrEqual(0);
    expect(order.total).toBe(order.subtotal - order.discount);
    expect(order.total).toBeGreaterThan(0);
  });
});

describe('ordersApi.list / getById', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('list returns an array including a just-created order', async () => {
    const created = await ordersApi.create(samplePayload);
    const all = await ordersApi.list();
    expect(Array.isArray(all)).toBe(true);
    expect(all.some((o) => o.id === created.id)).toBe(true);
  });

  it('getById returns the matching order for an existing id', async () => {
    const created = await ordersApi.create(samplePayload);
    const got = await ordersApi.getById(created.id);
    expect(got.id).toBe(created.id);
    expect(got.customer.email).toBe(sampleCustomer.email);
  });

  it('getById rejects for a missing id', async () => {
    await expect(ordersApi.getById('o-does-not-exist')).rejects.toBeInstanceOf(
      Error,
    );
  });
});
