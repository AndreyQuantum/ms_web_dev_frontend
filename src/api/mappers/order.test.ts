import { describe, it, expect } from 'vitest';
import {
  toApiOrder,
  fromApiOrder,
  statusToApi,
  statusFromApi,
  type ApiOrderRead,
  type CreateOrderInput,
} from '@/api/mappers/order';

describe('statusToApi / statusFromApi', () => {
  it('maps frontend "new" to backend "NEW"', () => {
    expect(statusToApi('new')).toBe('NEW');
  });

  it('maps frontend "processing" to backend "IN_PROGRESS"', () => {
    expect(statusToApi('processing')).toBe('IN_PROGRESS');
  });

  it('maps frontend "shipped" to backend "IN_PROGRESS" (lossy)', () => {
    expect(statusToApi('shipped')).toBe('IN_PROGRESS');
  });

  it('maps frontend "delivered" to backend "DELIVERED"', () => {
    expect(statusToApi('delivered')).toBe('DELIVERED');
  });

  it('maps frontend "cancelled" to backend "CANCELLED"', () => {
    expect(statusToApi('cancelled')).toBe('CANCELLED');
  });

  it('maps backend "NEW" to frontend "new"', () => {
    expect(statusFromApi('NEW')).toBe('new');
  });

  it('maps backend "IN_PROGRESS" to frontend "processing"', () => {
    expect(statusFromApi('IN_PROGRESS')).toBe('processing');
  });

  it('maps backend "DELIVERED" to frontend "delivered"', () => {
    expect(statusFromApi('DELIVERED')).toBe('delivered');
  });

  it('maps backend "CANCELLED" to frontend "cancelled"', () => {
    expect(statusFromApi('CANCELLED')).toBe('cancelled');
  });
});

describe('toApiOrder — comment folding', () => {
  it('folds delivery method and comment with two newlines when comment is non-empty', () => {
    const input: CreateOrderInput = {
      email: 'x@example.com',
      phone: '+79991234567',
      deliveryMethod: 'курьер',
      comment: 'позвонить',
      items: [{ productId: 'p1', qty: 1, price: 10 }],
    };
    const body = toApiOrder(input);
    expect(body.comment).toBe('Доставка: курьер\n\nпозвонить');
  });

  it('emits delivery-only comment with no trailing whitespace when comment is empty string', () => {
    const input: CreateOrderInput = {
      email: 'x@example.com',
      phone: '+79991234567',
      deliveryMethod: 'самовывоз',
      comment: '',
      items: [{ productId: 'p1', qty: 1, price: 10 }],
    };
    const body = toApiOrder(input);
    expect(body.comment).toBe('Доставка: самовывоз');
  });

  it('emits delivery-only comment when comment is undefined', () => {
    const input: CreateOrderInput = {
      email: 'x@example.com',
      phone: '+79991234567',
      deliveryMethod: 'pickup',
      items: [{ productId: 'p1', qty: 1, price: 10 }],
    };
    const body = toApiOrder(input);
    expect(body.comment).toBe('Доставка: pickup');
  });

  it('trims whitespace-only comment and treats it as empty', () => {
    const input: CreateOrderInput = {
      email: 'x@example.com',
      phone: '+79991234567',
      deliveryMethod: 'courier',
      comment: '   ',
      items: [{ productId: 'p1', qty: 1, price: 10 }],
    };
    const body = toApiOrder(input);
    expect(body.comment).toBe('Доставка: courier');
  });
});

describe('toApiOrder — payload shape', () => {
  it('maps email and phone to client_email/client_phone', () => {
    const input: CreateOrderInput = {
      email: 'qa@example.com',
      phone: '+79990001122',
      deliveryMethod: 'pickup',
      items: [{ productId: 'p1', qty: 2, price: 100 }],
    };
    const body = toApiOrder(input);
    expect(body.client_email).toBe('qa@example.com');
    expect(body.client_phone).toBe('+79990001122');
  });

  it('maps items: productId -> product_id, qty -> quantity', () => {
    const input: CreateOrderInput = {
      email: 'a@b.c',
      phone: '+1',
      deliveryMethod: 'courier',
      items: [
        { productId: 'p1', qty: 2, price: 10 },
        { productId: 'p2', qty: 5, price: 4 },
      ],
    };
    const body = toApiOrder(input);
    expect(body.items).toEqual([
      { product_id: 'p1', quantity: 2 },
      { product_id: 'p2', quantity: 5 },
    ]);
  });
});

describe('fromApiOrder — totals and status', () => {
  it('computes total = sum(current_price * quantity) and maps IN_PROGRESS to processing', () => {
    const apiOrder: ApiOrderRead = {
      id: 'ord-1',
      client_email: 'buyer@example.com',
      client_phone: '+79991112233',
      comment: 'Доставка: курьер\n\nпозвонить',
      status: 'IN_PROGRESS',
      items: [
        {
          id: 'i1',
          product_id: 'p1',
          current_price: '10',
          quantity: 2,
          created_at: '2026-05-09T10:00:00Z',
        },
        {
          id: 'i2',
          product_id: 'p2',
          current_price: '5',
          quantity: 1,
          created_at: '2026-05-09T10:00:00Z',
        },
      ],
      created_at: '2026-05-09T10:00:00Z',
    };
    const order = fromApiOrder(apiOrder);
    expect(order.status).toBe('processing');
    expect(order.subtotal).toBe(25);
    expect(order.total).toBe(25);
    expect(order.discount).toBe(0);
  });

  it('maps customer email and phone from client_email/client_phone', () => {
    const apiOrder: ApiOrderRead = {
      id: 'ord-2',
      client_email: 'buyer@example.com',
      client_phone: '+79991112233',
      comment: null,
      status: 'NEW',
      items: [],
      created_at: '2026-05-09T10:00:00Z',
    };
    const order = fromApiOrder(apiOrder);
    expect(order.customer.email).toBe('buyer@example.com');
    expect(order.customer.phone).toBe('+79991112233');
    expect(order.status).toBe('new');
  });

  it('preserves id and createdAt', () => {
    const apiOrder: ApiOrderRead = {
      id: 'ord-3',
      client_email: 'buyer@example.com',
      client_phone: '+79991112233',
      comment: null,
      status: 'DELIVERED',
      items: [],
      created_at: '2026-05-09T10:00:00Z',
    };
    const order = fromApiOrder(apiOrder);
    expect(order.id).toBe('ord-3');
    expect(order.createdAt).toBe('2026-05-09T10:00:00Z');
    expect(order.status).toBe('delivered');
  });

  it('maps items: product_id -> productId, quantity -> qty, current_price (string) -> price (number)', () => {
    const apiOrder: ApiOrderRead = {
      id: 'ord-4',
      client_email: 'a@b.c',
      client_phone: '+1',
      comment: null,
      status: 'NEW',
      items: [
        {
          id: 'i1',
          product_id: 'p-001',
          current_price: '199',
          quantity: 3,
          created_at: '2026-05-09T10:00:00Z',
        },
      ],
      created_at: '2026-05-09T10:00:00Z',
    };
    const order = fromApiOrder(apiOrder);
    expect(order.items.length).toBe(1);
    expect(order.items[0].productId).toBe('p-001');
    expect(order.items[0].qty).toBe(3);
    expect(order.items[0].price).toBe(199);
  });

  it('falls back to provided fallbackItems when api items are empty', () => {
    const apiOrder: ApiOrderRead = {
      id: 'ord-5',
      client_email: 'a@b.c',
      client_phone: '+1',
      comment: null,
      status: 'NEW',
      items: [],
      created_at: '2026-05-09T10:00:00Z',
    };
    const order = fromApiOrder(apiOrder, [
      { productId: 'p-001', qty: 2, price: 50, name: 'X' },
    ]);
    expect(order.items.length).toBe(1);
    expect(order.items[0].productId).toBe('p-001');
    expect(order.items[0].qty).toBe(2);
    expect(order.items[0].price).toBe(50);
    expect(order.subtotal).toBe(100);
    expect(order.total).toBe(100);
  });

  it('handles null comment gracefully (returns undefined or empty)', () => {
    const apiOrder: ApiOrderRead = {
      id: 'ord-6',
      client_email: 'a@b.c',
      client_phone: '+1',
      comment: null,
      status: 'NEW',
      items: [],
      created_at: '2026-05-09T10:00:00Z',
    };
    const order = fromApiOrder(apiOrder);
    expect(order.customer.comment ?? '').toBe('');
  });
});
