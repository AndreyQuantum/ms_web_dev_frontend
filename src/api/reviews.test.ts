import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { reviewsApi } from './reviews';
import { mockFetchOnce, getFetchMock, resetFetchMock } from '@/test/fetchMock';

beforeEach(() => resetFetchMock());
afterEach(() => resetFetchMock());

describe('reviewsApi.listByProduct', () => {
  it('GETs /reviews?product_id=…', async () => {
    mockFetchOnce([]);
    await reviewsApi.listByProduct('p1');
    const url = getFetchMock().mock.calls[0][0] as string;
    expect(url).toContain('/reviews');
    expect(url).toContain('product_id=p1');
  });

  it('maps API reviews to domain (author defaults to "Аноним")', async () => {
    mockFetchOnce([
      {
        id: 'r1',
        product_id: 'p1',
        text: 'good',
        rating: 5,
        created_at: '2026-01-01T00:00:00Z',
      },
    ]);
    const result = await reviewsApi.listByProduct('p1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
    expect(result[0].productId).toBe('p1');
    expect(result[0].author).toBe('Аноним');
    expect(result[0].rating).toBe(5);
    expect(result[0].text).toBe('good');
    expect(result[0].createdAt).toBe('2026-01-01T00:00:00Z');
  });
});

describe('reviewsApi.create', () => {
  it('POSTs body without author key (even if author provided in input)', async () => {
    mockFetchOnce({
      id: 'r1',
      product_id: 'p1',
      text: 'ok',
      rating: 5,
      created_at: '2026-01-02T00:00:00Z',
    });
    await reviewsApi.create({
      productId: 'p1',
      rating: 5,
      text: 'ok',
      author: 'Bob',
    });
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/reviews');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ product_id: 'p1', rating: 5, text: 'ok' });
    expect(body).not.toHaveProperty('author');
    expect(body).not.toHaveProperty('author_name');
  });

  it('returns the mapped Review from the API response', async () => {
    mockFetchOnce({
      id: 'r1',
      product_id: 'p1',
      text: 'ok',
      rating: 4,
      created_at: '2026-01-02T00:00:00Z',
    });
    const created = await reviewsApi.create({
      productId: 'p1',
      rating: 4,
      text: 'ok',
    });
    expect(created.id).toBe('r1');
    expect(created.productId).toBe('p1');
    expect(created.rating).toBe(4);
    expect(created.text).toBe('ok');
    expect(created.author).toBe('Аноним');
  });
});

describe('reviewsApi.remove', () => {
  it('DELETEs /reviews/{id} with URI-encoded id', async () => {
    mockFetchOnce(null);
    await reviewsApi.remove('r 1/x');
    const [url, init] = getFetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/reviews/');
    expect(url).toContain(encodeURIComponent('r 1/x'));
    expect(init.method).toBe('DELETE');
  });
});
