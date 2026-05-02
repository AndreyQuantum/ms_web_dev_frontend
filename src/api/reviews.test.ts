import { describe, it, expect, beforeEach } from 'vitest';
import { reviewsApi } from '@/api/reviews';
import { setLatency } from '@/api/_latency';

describe('reviewsApi.listByProduct', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('returns reviews where productId matches', async () => {
    const res = await reviewsApi.listByProduct('p-001');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      expect(r.productId).toBe('p-001');
    }
  });

  it('returns an empty array for products with no reviews', async () => {
    const res = await reviewsApi.listByProduct('p-does-not-exist');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(0);
  });
});

describe('reviewsApi.create', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('returns a Review with id; subsequent listByProduct includes it', async () => {
    const created = await reviewsApi.create({
      productId: 'p-001',
      author: 'QA Tester',
      rating: 5,
      text: 'Отличный товар, для теста.',
    });

    expect(typeof created.id).toBe('string');
    expect(created.id.length).toBeGreaterThan(0);
    expect(created.productId).toBe('p-001');
    expect(created.author).toBe('QA Tester');
    expect(created.rating).toBe(5);
    expect(created.text).toBe('Отличный товар, для теста.');

    const list = await reviewsApi.listByProduct('p-001');
    expect(list.some((r) => r.id === created.id)).toBe(true);
  });
});
