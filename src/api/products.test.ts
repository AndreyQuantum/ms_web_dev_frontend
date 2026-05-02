import { describe, it, expect, beforeEach } from 'vitest';
import { productsApi } from '@/api/products';
import { setLatency } from '@/api/_latency';
import { products as mockProducts } from '@/mocks/products';

const NON_ARCHIVED_COUNT = mockProducts.filter((p) => !p.isArchived).length;

describe('productsApi.list', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('returns only non-archived products by default with default page=1, size=10', async () => {
    const res = await productsApi.list({});
    expect(res.page).toBe(1);
    expect(res.size).toBe(10);
    expect(res.items.length).toBeLessThanOrEqual(10);
    expect(res.total).toBe(NON_ARCHIVED_COUNT);
    for (const item of res.items) {
      expect(item.isArchived).toBe(false);
    }
  });

  it('honours an explicit page=2, size=5', async () => {
    const res = await productsApi.list({ page: 2, size: 5 });
    expect(res.page).toBe(2);
    expect(res.size).toBe(5);
    expect(res.items.length).toBeLessThanOrEqual(5);
  });

  it('paginates: page 1 and page 2 return disjoint items (with size=5)', async () => {
    const p1 = await productsApi.list({ page: 1, size: 5 });
    const p2 = await productsApi.list({ page: 2, size: 5 });
    const ids1 = new Set(p1.items.map((i) => i.id));
    for (const item of p2.items) {
      expect(ids1.has(item.id)).toBe(false);
    }
  });

  it('search: returns only items where name/description (lowercased) includes the term', async () => {
    const res = await productsApi.list({ search: 'LED' });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      const hay = `${item.name} ${item.description}`.toLowerCase();
      expect(hay.includes('led')).toBe(true);
    }
  });

  it('categoryId filter: every item has the requested categoryId', async () => {
    const res = await productsApi.list({ categoryId: 1, size: 100 });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(item.categoryId).toBe(1);
    }
  });

  it('minPrice/maxPrice filters: every item satisfies the range', async () => {
    const res = await productsApi.list({
      minPrice: 500,
      maxPrice: 1500,
      size: 100,
    });
    for (const item of res.items) {
      expect(item.price).toBeGreaterThanOrEqual(500);
      expect(item.price).toBeLessThanOrEqual(1500);
    }
  });

  it('inStockOnly: every item has inStock=true', async () => {
    const res = await productsApi.list({ inStockOnly: true, size: 100 });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(item.inStock).toBe(true);
    }
  });

  it('sort priceAsc: items are sorted non-decreasing by price', async () => {
    const res = await productsApi.list({ sort: 'priceAsc', size: 100 });
    for (let i = 1; i < res.items.length; i++) {
      expect(res.items[i].price).toBeGreaterThanOrEqual(res.items[i - 1].price);
    }
  });

  it('sort priceDesc: items are sorted non-increasing by price', async () => {
    const res = await productsApi.list({ sort: 'priceDesc', size: 100 });
    for (let i = 1; i < res.items.length; i++) {
      expect(res.items[i].price).toBeLessThanOrEqual(res.items[i - 1].price);
    }
  });

  it('bulbTypeIds: every item has bulbTypeId in the requested list', async () => {
    const res = await productsApi.list({
      bulbTypeIds: [2, 3],
      size: 100,
    });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect([2, 3]).toContain(item.bulbTypeId);
    }
  });
});

describe('productsApi.getById', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('returns the matching product for an existing id', async () => {
    const target = mockProducts.find((p) => !p.isArchived)!;
    const got = await productsApi.getById(target.id);
    expect(got.id).toBe(target.id);
    expect(got.name).toBe(target.name);
  });

  it('rejects for a missing id', async () => {
    await expect(productsApi.getById('does-not-exist')).rejects.toBeInstanceOf(
      Error,
    );
  });
});

describe('productsApi.create / update / archive', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('create returns a Product with a new id, and subsequent list() includes it', async () => {
    const created = await productsApi.create({
      name: 'Test Lamp Created',
      description: 'Created in test',
      price: 555,
      brightnessLm: 600,
      rating: 0,
      reviewsCount: 0,
      inStock: true,
      stockQty: 10,
      isArchived: false,
      categoryId: 1,
      bulbTypeId: 1,
      bulbShapeId: 1,
      socketId: 1,
      supplierId: 1,
      imageUrl: '/images/products/test.png',
      createdAt: new Date().toISOString(),
      popularity: 0,
    });

    expect(typeof created.id).toBe('string');
    expect(created.id.length).toBeGreaterThan(0);
    expect(created.name).toBe('Test Lamp Created');

    const listed = await productsApi.list({ size: 1000 });
    expect(listed.items.some((p) => p.id === created.id)).toBe(true);
  });

  it('update modifies the product; getById reflects the change', async () => {
    const target = mockProducts.find((p) => !p.isArchived)!;
    const updated = await productsApi.update(target.id, { price: 9999 });
    expect(updated.id).toBe(target.id);
    expect(updated.price).toBe(9999);

    const re = await productsApi.getById(target.id);
    expect(re.price).toBe(9999);
  });

  it('archive sets isArchived=true', async () => {
    const created = await productsApi.create({
      name: 'To be archived',
      description: 'temp',
      price: 100,
      brightnessLm: 100,
      rating: 0,
      reviewsCount: 0,
      inStock: true,
      stockQty: 1,
      isArchived: false,
      categoryId: 1,
      bulbTypeId: 1,
      bulbShapeId: 1,
      socketId: 1,
      supplierId: 1,
      imageUrl: '/images/products/temp.png',
      createdAt: new Date().toISOString(),
      popularity: 0,
    });

    await productsApi.archive(created.id);
    const re = await productsApi.getById(created.id);
    expect(re.isArchived).toBe(true);
  });
});
