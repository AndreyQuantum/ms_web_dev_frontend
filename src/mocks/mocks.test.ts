import { describe, it, expect } from 'vitest';
import { products } from '@/mocks/products';
import {
  categories,
  bulbTypes,
  bulbShapes,
  sockets,
  suppliers,
  promos,
} from '@/mocks';
import { orders } from '@/mocks/orders';
import { reviews } from '@/mocks/reviews';
import type { OrderStatus, Product } from '@/types';

describe('mocks: products', () => {
  it('contains at least 30 products', () => {
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(30);
  });

  it('has unique product ids', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(products.length);
  });

  it('each product has a non-empty name and price > 0', () => {
    for (const p of products) {
      expect(typeof p.name).toBe('string');
      expect(p.name.trim().length).toBeGreaterThan(0);
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it('every product references existing dictionary entries', () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    const bulbTypeIds = new Set(bulbTypes.map((b) => b.id));
    const bulbShapeIds = new Set(bulbShapes.map((s) => s.id));
    const socketIds = new Set(sockets.map((s) => s.id));
    const supplierIds = new Set(suppliers.map((s) => s.id));

    for (const p of products) {
      expect(categoryIds.has(p.categoryId)).toBe(true);
      expect(bulbTypeIds.has(p.bulbTypeId)).toBe(true);
      expect(bulbShapeIds.has(p.bulbShapeId)).toBe(true);
      expect(socketIds.has(p.socketId)).toBe(true);
      expect(supplierIds.has(p.supplierId)).toBe(true);
    }
  });

  it('every product has boolean inStock and non-negative stockQty', () => {
    for (const p of products) {
      expect(typeof p.inStock).toBe('boolean');
      expect(typeof p.stockQty).toBe('number');
      expect(p.stockQty).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('mocks: orders', () => {
  it('seed contains at least 3 distinct OrderStatus values', () => {
    const statusSet = new Set<OrderStatus>(orders.map((o) => o.status));
    expect(statusSet.size).toBeGreaterThanOrEqual(3);
  });
});

describe('mocks: reviews', () => {
  it('every review.productId references an existing product', () => {
    const productIds = new Set(products.map((p) => p.id));
    expect(reviews.length).toBeGreaterThan(0);
    for (const r of reviews) {
      expect(productIds.has(r.productId)).toBe(true);
    }
  });
});

describe('mocks: dictionaries', () => {
  it('dictionaries are non-empty (categories >= 3, bulbTypes >= 4, sockets >= 4)', () => {
    expect(categories.length).toBeGreaterThanOrEqual(3);
    expect(bulbTypes.length).toBeGreaterThanOrEqual(4);
    expect(sockets.length).toBeGreaterThanOrEqual(4);
    expect(bulbShapes.length).toBeGreaterThan(0);
    expect(suppliers.length).toBeGreaterThan(0);
    expect(promos.length).toBeGreaterThan(0);
  });
});

describe('types: Product compiles', () => {
  it('assigns the first product to a Product variable', () => {
    const _t: Product = products[0];
    expect(_t).toBeDefined();
  });
});
