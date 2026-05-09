import { describe, it, expect } from 'vitest';
import { fromApiProduct, toApiProduct, type ApiProduct } from './product';

const baseApi: ApiProduct = {
  id: 'u',
  title: 'T',
  description: 'D',
  price: '12.50',
  quantity: 3,
  brightness_lm: 800,
  is_archived: false,
  available_from: null,
  category_id: 1,
  bulb_type_id: 1,
  bulb_shape_id: 1,
  socket_id: 1,
  supplier_id: 1,
  promo_id: null,
};

describe('fromApiProduct', () => {
  it('maps snake_case API product to domain Product', () => {
    const result = fromApiProduct(baseApi);

    expect(result.id).toBe('u');
    expect(result.name).toBe('T');
    expect(result.description).toBe('D');
    expect(result.price).toBe(12.5);
    expect(result.brightnessLm).toBe(800);
    expect(result.inStock).toBe(true);
    expect(result.stockQty).toBe(3);
    expect(result.isArchived).toBe(false);
    expect(result.availableFrom).toBeUndefined();
    expect(result.categoryId).toBe(1);
    expect(result.bulbTypeId).toBe(1);
    expect(result.bulbShapeId).toBe(1);
    expect(result.socketId).toBe(1);
    expect(result.supplierId).toBe(1);
    expect(result.promoId).toBeUndefined();
    expect(result.imageUrl).toBe('/placeholder.png');
    expect(result.rating).toBe(0);
    expect(result.reviewsCount).toBe(0);
    expect(result.popularity).toBe(0);
  });

  it('marks product as out of stock when quantity is 0', () => {
    const result = fromApiProduct({ ...baseApi, quantity: 0 });

    expect(result.inStock).toBe(false);
    expect(result.stockQty).toBe(0);
  });

  it('preserves availableFrom when present', () => {
    const result = fromApiProduct({
      ...baseApi,
      available_from: '2026-01-01T00:00:00Z',
    });

    expect(result.availableFrom).toBe('2026-01-01T00:00:00Z');
  });

  it('preserves promoId when present', () => {
    const result = fromApiProduct({ ...baseApi, promo_id: 42 });

    expect(result.promoId).toBe(42);
  });

  it('uses created_at from API when present', () => {
    const result = fromApiProduct({
      ...baseApi,
      created_at: '2025-06-15T10:00:00Z',
    });

    expect(result.createdAt).toBe('2025-06-15T10:00:00Z');
  });

  it('falls back to epoch when created_at is missing', () => {
    const result = fromApiProduct(baseApi);

    expect(result.createdAt).toBe(new Date(0).toISOString());
  });
});

describe('toApiProduct', () => {
  it('returns only the keys provided in the partial frontend product', () => {
    const result = toApiProduct({ name: 'X', price: 9.99, stockQty: 2 });

    expect(result).toEqual({ title: 'X', price: '9.99', quantity: 2 });
    expect(Object.keys(result).sort()).toEqual(['price', 'quantity', 'title']);
  });

  it('does not include keys with undefined values', () => {
    const result = toApiProduct({ name: 'only-name' });

    expect(result).toEqual({ title: 'only-name' });
    expect('description' in result).toBe(false);
    expect('price' in result).toBe(false);
    expect('quantity' in result).toBe(false);
  });

  it('serializes price as a string', () => {
    const result = toApiProduct({ price: 100 });

    expect(result.price).toBe('100');
    expect(typeof result.price).toBe('string');
  });

  it('maps availableFrom undefined to null when key is explicitly set', () => {
    const result = toApiProduct({ availableFrom: undefined });

    // availableFrom is undefined, so the key shouldn't appear at all
    expect('available_from' in result).toBe(false);
  });

  it('maps promoId to promo_id and supports null when not set on a Product', () => {
    const withPromo = toApiProduct({ promoId: 7 });
    expect(withPromo.promo_id).toBe(7);

    const noPromo = toApiProduct({});
    expect('promo_id' in noPromo).toBe(false);
  });

  it('maps all snake_case fields when provided', () => {
    const result = toApiProduct({
      name: 'N',
      description: 'D',
      price: 1,
      stockQty: 2,
      brightnessLm: 500,
      isArchived: true,
      availableFrom: '2026-02-01T00:00:00Z',
      categoryId: 3,
      bulbTypeId: 4,
      bulbShapeId: 5,
      socketId: 6,
      supplierId: 7,
      promoId: 8,
    });

    expect(result).toEqual({
      title: 'N',
      description: 'D',
      price: '1',
      quantity: 2,
      brightness_lm: 500,
      is_archived: true,
      available_from: '2026-02-01T00:00:00Z',
      category_id: 3,
      bulb_type_id: 4,
      bulb_shape_id: 5,
      socket_id: 6,
      supplier_id: 7,
      promo_id: 8,
    });
  });
});
