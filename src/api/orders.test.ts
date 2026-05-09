import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ordersApi } from './orders';
import { mockFetchOnce, getFetchMock, resetFetchMock } from '@/test/fetchMock';

beforeEach(() => resetFetchMock());
afterEach(() => resetFetchMock());

describe('ordersApi.create', () => {
  it('POSTs with client_email/client_phone/folded comment/items mapped', async () => {
    const apiOrder = {
      id: 'o1',
      client_email: 'a@b',
      client_phone: '+7',
      comment: 'Доставка: курьер\n\nnote',
      status: 'NEW',
      items: [
        {
          id: 'i1',
          product_id: 'p1',
          quantity: 2,
          current_price: '9.99',
          created_at: '…',
        },
      ],
      created_at: '2026-01-01T00:00:00Z',
    };
    mockFetchOnce(apiOrder);
    const result = await ordersApi.create({
      email: 'a@b',
      phone: '+7',
      deliveryMethod: 'курьер',
      comment: 'note',
      items: [{ productId: 'p1', qty: 2, price: 9.99, name: 'X' }],
    });
    const calls = getFetchMock().mock.calls as unknown as Array<
      [string, RequestInit]
    >;
    const [url, init] = calls[0];
    expect(url).toContain('/orders');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body.client_email).toBe('a@b');
    expect(body.client_phone).toBe('+7');
    expect(body.comment).toBe('Доставка: курьер\n\nnote');
    expect(body.items).toEqual([{ product_id: 'p1', quantity: 2 }]);
    expect(result.status).toBe('new');
  });
});

describe('ordersApi.patchStatus', () => {
  it('PATCH /orders/{id} maps shipped → IN_PROGRESS', async () => {
    mockFetchOnce({
      id: 'o1',
      client_email: '',
      client_phone: '',
      comment: null,
      status: 'IN_PROGRESS',
      items: [],
      created_at: '…',
    });
    await ordersApi.patchStatus('o1', 'shipped');
    const calls = getFetchMock().mock.calls as unknown as Array<
      [string, RequestInit]
    >;
    const [url, init] = calls[0];
    expect(url).toContain('/orders/o1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual({ status: 'IN_PROGRESS' });
  });

  it('maps delivered → DELIVERED', async () => {
    mockFetchOnce({
      id: 'o1',
      client_email: '',
      client_phone: '',
      comment: null,
      status: 'DELIVERED',
      items: [],
      created_at: '…',
    });
    await ordersApi.patchStatus('o1', 'delivered');
    const calls = getFetchMock().mock.calls as unknown as Array<
      [string, RequestInit]
    >;
    const init = calls[0][1];
    expect(JSON.parse(init.body as string)).toEqual({ status: 'DELIVERED' });
  });
});

describe('ordersApi.list', () => {
  it('GETs /orders?page=&size=&status=', async () => {
    mockFetchOnce([]);
    await ordersApi.list({ page: 2, size: 20, status: 'new' });
    const calls = getFetchMock().mock.calls as unknown as Array<
      [string, RequestInit]
    >;
    const url = calls[0][0];
    expect(url).toContain('page=2');
    expect(url).toContain('size=20');
    expect(url).toContain('status=NEW');
  });
});

describe('ordersApi.getById', () => {
  it('GETs /orders/{id} and returns mapped order', async () => {
    mockFetchOnce({
      id: 'o1',
      client_email: 'a@b',
      client_phone: '+7',
      comment: null,
      status: 'IN_PROGRESS',
      items: [],
      created_at: '…',
    });
    const o = await ordersApi.getById('o1');
    expect(o.status).toBe('processing');
    expect(o.id).toBe('o1');
  });
});
