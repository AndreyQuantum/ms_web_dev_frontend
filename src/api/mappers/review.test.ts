import { describe, it, expect } from 'vitest';
import {
  toApiReview,
  fromApiReview,
  type ApiReviewRead,
  type CreateReviewInput,
} from '@/api/mappers/review';

describe('toApiReview', () => {
  it('maps productId -> product_id and includes only product_id, text, rating', () => {
    const input: CreateReviewInput = {
      productId: 'p',
      rating: 5,
      text: 'good',
      author: 'Bob',
    };

    const body = toApiReview(input);

    expect(body).toEqual({
      product_id: 'p',
      text: 'good',
      rating: 5,
    });
  });

  it('does not include author or author_name in the body', () => {
    const input: CreateReviewInput = {
      productId: 'p',
      rating: 5,
      text: 'good',
      author: 'Bob',
    };

    const body = toApiReview(input);
    const keys = Object.keys(body);

    expect(keys.sort()).toEqual(['product_id', 'rating', 'text']);
    expect(keys).not.toContain('author');
    expect(keys).not.toContain('author_name');
    expect((body as unknown as Record<string, unknown>).author).toBeUndefined();
    expect((body as unknown as Record<string, unknown>).author_name).toBeUndefined();
  });

  it('omits the author field even when not provided in the input', () => {
    const input: CreateReviewInput = {
      productId: 'p2',
      rating: 3,
      text: 'meh',
    };

    const body = toApiReview(input);

    expect(body).toEqual({
      product_id: 'p2',
      text: 'meh',
      rating: 3,
    });
    expect(Object.keys(body)).not.toContain('author');
  });
});

describe('fromApiReview', () => {
  it('maps API review snake_case to frontend Review with default author "Аноним"', () => {
    const apiReview: ApiReviewRead = {
      id: 'r1',
      product_id: 'p1',
      rating: 4,
      text: 'ok',
      created_at: '2026-01-01T00:00:00Z',
    };

    const result = fromApiReview(apiReview);

    expect(result).toEqual({
      id: 'r1',
      productId: 'p1',
      rating: 4,
      text: 'ok',
      author: 'Аноним',
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  it('always sets author to "Аноним" even when created_by is present on the API payload', () => {
    const apiReview: ApiReviewRead = {
      id: 'r2',
      product_id: 'p2',
      rating: 5,
      text: 'great',
      created_at: '2026-02-02T12:34:56Z',
      created_by: 'user-42',
    };

    const result = fromApiReview(apiReview);

    expect(result.author).toBe('Аноним');
    expect(result.id).toBe('r2');
    expect(result.productId).toBe('p2');
    expect(result.rating).toBe(5);
    expect(result.text).toBe('great');
    expect(result.createdAt).toBe('2026-02-02T12:34:56Z');
  });

  it('uses "Аноним" when created_by is null', () => {
    const apiReview: ApiReviewRead = {
      id: 'r3',
      product_id: 'p3',
      rating: 1,
      text: 'bad',
      created_at: '2026-03-03T00:00:00Z',
      created_by: null,
    };

    const result = fromApiReview(apiReview);

    expect(result.author).toBe('Аноним');
  });
});
