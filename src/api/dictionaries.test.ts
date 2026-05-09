import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dictionariesApi } from './dictionaries';
import {
  mockFetchOnce,
  getFetchMock,
  resetFetchMock,
} from '@/test/fetchMock';
import type { ApiNamed, ApiPromo } from './mappers/dictionaries';

beforeEach(() => resetFetchMock());
afterEach(() => resetFetchMock());

const named = (overrides: Partial<ApiNamed> = {}): ApiNamed => ({
  id: 1,
  name: 'X',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const promo = (overrides: Partial<ApiPromo> = {}): ApiPromo => ({
  id: 1,
  name: 'Promo',
  created_at: '2024-01-01T00:00:00Z',
  discount_percent: 10,
  starts_at: null,
  ends_at: null,
  ...overrides,
});

describe('dictionariesApi.listCategories', () => {
  it('GETs /categories and returns mapped categories', async () => {
    mockFetchOnce([named({ id: 1, name: 'Cat A' }), named({ id: 2, name: 'Cat B' })]);
    const res = await dictionariesApi.listCategories();
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit | undefined];
    expect(url).toMatch(/\/categories$/);
    expect(init?.method).toBeUndefined();
    expect(res).toHaveLength(2);
    expect(res[0]).toEqual({ id: 1, name: 'Cat A' });
    expect(res[1]).toEqual({ id: 2, name: 'Cat B' });
  });
});

describe('dictionariesApi.createCategory', () => {
  it('POSTs {name} to /categories and returns the created entry', async () => {
    mockFetchOnce(named({ id: 5, name: 'New' }));
    const created = await dictionariesApi.createCategory({ name: 'New' });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/categories');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'New' });
    expect(created).toEqual({ id: 5, name: 'New' });
  });
});

describe('dictionariesApi.deleteCategory', () => {
  it('DELETEs /categories/{id}', async () => {
    mockFetchOnce(null, 204);
    await dictionariesApi.deleteCategory(42);
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/categories/42');
    expect(init.method).toBe('DELETE');
  });
});

describe('dictionariesApi.listBulbTypes', () => {
  it('GETs /bulb-types and returns mapped bulb types', async () => {
    mockFetchOnce([named({ id: 3, name: 'LED' })]);
    const res = await dictionariesApi.listBulbTypes();
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toMatch(/\/bulb-types$/);
    expect(res).toEqual([{ id: 3, name: 'LED' }]);
  });
});

describe('dictionariesApi.createBulbType', () => {
  it('POSTs {name} to /bulb-types', async () => {
    mockFetchOnce(named({ id: 9, name: 'Halogen' }));
    const created = await dictionariesApi.createBulbType({ name: 'Halogen' });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/bulb-types');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Halogen' });
    expect(created).toEqual({ id: 9, name: 'Halogen' });
  });
});

describe('dictionariesApi.deleteBulbType', () => {
  it('DELETEs /bulb-types/{id}', async () => {
    mockFetchOnce(null, 204);
    await dictionariesApi.deleteBulbType(11);
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/bulb-types/11');
    expect(init.method).toBe('DELETE');
  });
});

describe('dictionariesApi.listShapes', () => {
  it('GETs /bulb-shapes and returns mapped shapes', async () => {
    mockFetchOnce([named({ id: 1, name: 'A60' })]);
    const res = await dictionariesApi.listShapes();
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toMatch(/\/bulb-shapes$/);
    expect(res).toEqual([{ id: 1, name: 'A60' }]);
  });
});

describe('dictionariesApi.createShape', () => {
  it('POSTs {name} to /bulb-shapes', async () => {
    mockFetchOnce(named({ id: 2, name: 'G45' }));
    const created = await dictionariesApi.createShape({ name: 'G45' });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/bulb-shapes');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'G45' });
    expect(created).toEqual({ id: 2, name: 'G45' });
  });
});

describe('dictionariesApi.deleteShape', () => {
  it('DELETEs /bulb-shapes/{id}', async () => {
    mockFetchOnce(null, 204);
    await dictionariesApi.deleteShape(3);
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/bulb-shapes/3');
    expect(init.method).toBe('DELETE');
  });
});

describe('dictionariesApi.listSockets', () => {
  it('GETs /sockets and returns mapped sockets', async () => {
    mockFetchOnce([named({ id: 1, name: 'E27' })]);
    const res = await dictionariesApi.listSockets();
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toMatch(/\/sockets$/);
    expect(res).toEqual([{ id: 1, name: 'E27' }]);
  });
});

describe('dictionariesApi.createSocket', () => {
  it('POSTs {name} to /sockets', async () => {
    mockFetchOnce(named({ id: 8, name: 'E40' }));
    const created = await dictionariesApi.createSocket({ name: 'E40' });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/sockets');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'E40' });
    expect(created).toEqual({ id: 8, name: 'E40' });
  });
});

describe('dictionariesApi.deleteSocket', () => {
  it('DELETEs /sockets/7', async () => {
    mockFetchOnce(null, 204);
    await dictionariesApi.deleteSocket(7);
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/sockets/7');
    expect(init.method).toBe('DELETE');
  });
});

describe('dictionariesApi.listSuppliers', () => {
  it('GETs /suppliers and returns mapped suppliers', async () => {
    mockFetchOnce([named({ id: 1, name: 'Acme' })]);
    const res = await dictionariesApi.listSuppliers();
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toMatch(/\/suppliers$/);
    expect(res).toEqual([{ id: 1, name: 'Acme' }]);
  });
});

describe('dictionariesApi.createSupplier', () => {
  it('POSTs {name} to /suppliers', async () => {
    mockFetchOnce(named({ id: 12, name: 'Globex' }));
    const created = await dictionariesApi.createSupplier({ name: 'Globex' });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/suppliers');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Globex' });
    expect(created).toEqual({ id: 12, name: 'Globex' });
  });
});

describe('dictionariesApi.deleteSupplier', () => {
  it('DELETEs /suppliers/{id}', async () => {
    mockFetchOnce(null, 204);
    await dictionariesApi.deleteSupplier(99);
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/suppliers/99');
    expect(init.method).toBe('DELETE');
  });
});

describe('dictionariesApi.listPromos', () => {
  it('GETs /promos and returns mapped promos', async () => {
    mockFetchOnce([
      promo({
        id: 1,
        name: 'Spring',
        discount_percent: 15,
        starts_at: '2024-03-01',
        ends_at: '2024-04-01',
      }),
    ]);
    const res = await dictionariesApi.listPromos();
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toMatch(/\/promos$/);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({
      id: 1,
      name: 'Spring',
      discountPercent: 15,
      startsAt: '2024-03-01',
      endsAt: '2024-04-01',
    });
  });
});

describe('dictionariesApi.createPromo', () => {
  it('POSTs mapped body to /promos and returns mapped promo', async () => {
    mockFetchOnce(
      promo({ id: 7, name: 'X', discount_percent: 10, starts_at: null, ends_at: null }),
    );
    const created = await dictionariesApi.createPromo({ name: 'X', discountPercent: 10 });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/promos');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'X',
      discount_percent: 10,
      starts_at: null,
      ends_at: null,
    });
    expect(created).toEqual({ id: 7, name: 'X', discountPercent: 10 });
  });

  it('forwards startsAt/endsAt when provided', async () => {
    mockFetchOnce(
      promo({
        id: 8,
        name: 'Y',
        discount_percent: 25,
        starts_at: '2025-01-01',
        ends_at: '2025-01-31',
      }),
    );
    await dictionariesApi.createPromo({
      name: 'Y',
      discountPercent: 25,
      startsAt: '2025-01-01',
      endsAt: '2025-01-31',
    });
    const init = getFetchMock().mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Y',
      discount_percent: 25,
      starts_at: '2025-01-01',
      ends_at: '2025-01-31',
    });
  });
});

describe('dictionariesApi.deletePromo', () => {
  it('DELETEs /promos/{id}', async () => {
    mockFetchOnce(null, 204);
    await dictionariesApi.deletePromo(123);
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/promos/123');
    expect(init.method).toBe('DELETE');
  });
});
