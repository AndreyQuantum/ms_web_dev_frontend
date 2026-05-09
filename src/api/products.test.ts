import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { productsApi } from './products';
import {
  mockFetchOnce,
  getFetchMock,
  resetFetchMock,
} from '@/test/fetchMock';
import type { ApiProduct } from './mappers/product';

beforeEach(() => resetFetchMock());
afterEach(() => resetFetchMock());

function makeApiProduct(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: 'u1',
    title: 'X',
    description: '',
    price: '9.99',
    quantity: 5,
    brightness_lm: 800,
    is_archived: false,
    available_from: null,
    category_id: 1,
    bulb_type_id: 1,
    bulb_shape_id: 1,
    socket_id: 1,
    supplier_id: 1,
    promo_id: null,
    ...overrides,
  };
}

describe('productsApi.list', () => {
  it('forwards only category_id, is_archived, page, size — drops unsupported filters', async () => {
    mockFetchOnce({ data: [], meta: { total: 0, page: 1, size: 12 } });
    await productsApi.list({
      categoryId: 3,
      isArchived: false,
      page: 1,
      size: 12,
      search: 'lamp',
      minPrice: 100,
      maxPrice: 999,
      bulbTypeIds: [1, 2],
      shapeIds: [3],
      socketIds: [4],
      supplierId: 7,
      inStockOnly: true,
      sort: 'priceAsc',
    });
    const url = (getFetchMock().mock.calls[0]?.[0] as string) ?? '';
    expect(url).toContain('category_id=3');
    expect(url).toContain('is_archived=false');
    expect(url).toContain('page=1');
    expect(url).toContain('size=12');
    expect(url).not.toContain('search');
    expect(url).not.toContain('minPrice');
    expect(url).not.toContain('min_price');
    expect(url).not.toContain('maxPrice');
    expect(url).not.toContain('bulb');
    expect(url).not.toContain('shape');
    expect(url).not.toContain('socket');
    expect(url).not.toContain('supplier');
    expect(url).not.toContain('inStock');
    expect(url).not.toContain('sort');
  });

  it('omits the query string entirely when no params are provided', async () => {
    mockFetchOnce({ data: [], meta: { total: 0, page: 1, size: 10 } });
    await productsApi.list({});
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toContain('/products');
    expect(url).not.toContain('?');
  });

  it('returns mapped products and pagination meta', async () => {
    const apiProduct = makeApiProduct({
      id: 'u1',
      title: 'X',
      price: '9.99',
      quantity: 5,
    });
    mockFetchOnce({ data: [apiProduct], meta: { total: 1, page: 1, size: 12 } });
    const result = await productsApi.list({});
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('u1');
    expect(result.items[0].name).toBe('X');
    expect(result.items[0].price).toBe(9.99);
    expect(result.items[0].imageUrl).toBe('/placeholder.png');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.size).toBe(12);
  });
});

describe('productsApi.getById', () => {
  it('GETs /products/{id} and returns mapped product', async () => {
    const apiProduct = makeApiProduct({ id: 'abc', title: 'Bulb' });
    mockFetchOnce(apiProduct);
    const got = await productsApi.getById('abc');
    const [url, init] = getFetchMock().mock.calls[0] as [
      string,
      RequestInit | undefined,
    ];
    expect(url).toContain('/products/abc');
    expect(init?.method).toBeUndefined();
    expect(got.id).toBe('abc');
    expect(got.name).toBe('Bulb');
  });

  it('url-encodes the id', async () => {
    mockFetchOnce(makeApiProduct({ id: 'a/b' }));
    await productsApi.getById('a/b');
    const url = getFetchMock().mock.calls[0]?.[0] as string;
    expect(url).toContain('/products/a%2Fb');
  });
});

describe('productsApi.create', () => {
  it('POSTs mapped body to /products and returns mapped product', async () => {
    const apiResp = makeApiProduct({
      id: 'new1',
      title: 'X',
      price: '9.99',
      quantity: 2,
    });
    mockFetchOnce(apiResp);
    const created = await productsApi.create({
      name: 'X',
      price: 9.99,
      stockQty: 2,
      categoryId: 1,
      bulbTypeId: 1,
      bulbShapeId: 1,
      socketId: 1,
      supplierId: 1,
    });
    const [url, init] = getFetchMock().mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/products');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body.title).toBe('X');
    expect(body.price).toBe('9.99');
    expect(body.quantity).toBe(2);
    expect(body.category_id).toBe(1);
    expect(body.bulb_type_id).toBe(1);
    expect(body.bulb_shape_id).toBe(1);
    expect(body.socket_id).toBe(1);
    expect(body.supplier_id).toBe(1);
    expect(created.id).toBe('new1');
    expect(created.name).toBe('X');
  });
});

describe('productsApi.update', () => {
  it('PUTs mapped patch to /products/{id} and returns mapped product', async () => {
    const apiResp = makeApiProduct({ id: 'p1', title: 'Renamed', price: '12.50' });
    mockFetchOnce(apiResp);
    const updated = await productsApi.update('p1', { name: 'Renamed', price: 12.5 });
    const [url, init] = getFetchMock().mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/products/p1');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(init.body as string);
    expect(body.title).toBe('Renamed');
    expect(body.price).toBe('12.5');
    expect(updated.id).toBe('p1');
    expect(updated.name).toBe('Renamed');
  });
});

describe('productsApi.archive', () => {
  it('PUTs is_archived=true via update path', async () => {
    const apiResp = makeApiProduct({ id: 'p2', is_archived: true });
    mockFetchOnce(apiResp);
    const archived = await productsApi.archive('p2');
    const [url, init] = getFetchMock().mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/products/p2');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(init.body as string);
    expect(body.is_archived).toBe(true);
    expect(archived.isArchived).toBe(true);
  });
});

describe('productsApi.remove', () => {
  it('DELETEs /products/{id}', async () => {
    mockFetchOnce(null, 204);
    await productsApi.remove('p3');
    const [url, init] = getFetchMock().mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/products/p3');
    expect(init.method).toBe('DELETE');
  });
});
