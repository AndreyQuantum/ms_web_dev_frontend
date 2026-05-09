import { describe, it, expect } from 'vitest';
import {
  fromApiCategory,
  fromApiBulbType,
  fromApiBulbShape,
  fromApiSocket,
  fromApiSupplier,
  fromApiPromo,
  toApiNamed,
  toApiPromo,
  type ApiPromo,
} from './dictionaries';

const baseNamedApi = {
  id: 1,
  name: 'Лампы',
  created_at: '2026-01-01T00:00:00Z',
};

describe('fromApiCategory', () => {
  it('maps API category to domain Category', () => {
    const result = fromApiCategory(baseNamedApi);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Лампы');
  });

  it('does not include createdAt (Category type lacks it)', () => {
    const result = fromApiCategory(baseNamedApi);
    expect('createdAt' in result).toBe(false);
  });
});

describe('fromApiBulbType', () => {
  it('maps API bulb type to domain BulbType', () => {
    const result = fromApiBulbType({ id: 2, name: 'LED', created_at: 'now' });
    expect(result).toEqual({ id: 2, name: 'LED' });
  });
});

describe('fromApiBulbShape', () => {
  it('maps API bulb shape to domain BulbShape', () => {
    const result = fromApiBulbShape({ id: 3, name: 'A60', created_at: 'now' });
    expect(result).toEqual({ id: 3, name: 'A60' });
  });
});

describe('fromApiSocket', () => {
  it('maps API socket to domain Socket', () => {
    const result = fromApiSocket({ id: 4, name: 'E27', created_at: 'now' });
    expect(result).toEqual({ id: 4, name: 'E27' });
  });
});

describe('fromApiSupplier', () => {
  it('maps API supplier to domain Supplier', () => {
    const result = fromApiSupplier({ id: 5, name: 'Acme', created_at: 'now' });
    expect(result).toEqual({ id: 5, name: 'Acme' });
  });
});

describe('fromApiPromo', () => {
  it('maps API promo with null start/end dates to undefined', () => {
    const apiPromo: ApiPromo = {
      id: 1,
      name: 'X',
      discount_percent: 10,
      starts_at: null,
      ends_at: null,
      created_at: '2026-01-01T00:00:00Z',
    };
    const result = fromApiPromo(apiPromo);
    expect(result.id).toBe(1);
    expect(result.name).toBe('X');
    expect(result.discountPercent).toBe(10);
    expect(result.startsAt).toBeUndefined();
    expect(result.endsAt).toBeUndefined();
  });

  it('preserves starts_at and ends_at when provided', () => {
    const apiPromo: ApiPromo = {
      id: 2,
      name: 'Y',
      discount_percent: 25,
      starts_at: '2026-02-01T00:00:00Z',
      ends_at: '2026-03-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    };
    const result = fromApiPromo(apiPromo);
    expect(result.startsAt).toBe('2026-02-01T00:00:00Z');
    expect(result.endsAt).toBe('2026-03-01T00:00:00Z');
  });

  it('does not include createdAt (Promo type lacks it)', () => {
    const apiPromo: ApiPromo = {
      id: 1,
      name: 'X',
      discount_percent: 10,
      starts_at: null,
      ends_at: null,
      created_at: '2026-01-01T00:00:00Z',
    };
    const result = fromApiPromo(apiPromo);
    expect('createdAt' in result).toBe(false);
  });
});

describe('toApiNamed', () => {
  it('returns an object with name only', () => {
    const result = toApiNamed({ name: 'Foo' });
    expect(result).toEqual({ name: 'Foo' });
  });
});

describe('toApiPromo', () => {
  it('maps a new promo input with only required fields', () => {
    const result = toApiPromo({ name: 'X', discountPercent: 10 });
    expect(result).toEqual({
      name: 'X',
      discount_percent: 10,
      starts_at: null,
      ends_at: null,
    });
  });

  it('maps a new promo input with optional dates', () => {
    const result = toApiPromo({
      name: 'Y',
      discountPercent: 25,
      startsAt: '2026-02-01T00:00:00Z',
      endsAt: '2026-03-01T00:00:00Z',
    });
    expect(result).toEqual({
      name: 'Y',
      discount_percent: 25,
      starts_at: '2026-02-01T00:00:00Z',
      ends_at: '2026-03-01T00:00:00Z',
    });
  });
});
