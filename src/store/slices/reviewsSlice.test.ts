import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/reviews', () => ({
  reviewsApi: {
    listByProduct: vi.fn(),
    create: vi.fn(),
  },
}));

import { configureStore } from '@reduxjs/toolkit';
import reviewsReducer, { fetchReviews, createReview } from './reviewsSlice';
import { reviewsApi } from '@/api/reviews';
import type { Review } from '@/types';

function makeTestStore() {
  return configureStore({ reducer: { reviews: reviewsReducer } });
}

const r = (id: string, productId: string): Review => ({
  id,
  productId,
  author: 'a',
  rating: 5,
  text: 't',
  createdAt: '2024-01-01',
});

describe('reviewsSlice initial state', () => {
  it('starts with empty byProductId map', () => {
    const store = makeTestStore();
    expect(store.getState().reviews.byProductId).toEqual({});
  });
});

describe('fetchReviews thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pending: bucket goes to loading status', async () => {
    let resolve: (v: Review[]) => void = () => {};
    (reviewsApi.listByProduct as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise<Review[]>((res) => {
        resolve = res;
      }),
    );
    const store = makeTestStore();
    const promise = store.dispatch(fetchReviews('p1'));
    // microtask so pending action dispatches
    expect(store.getState().reviews.byProductId['p1'].status).toBe('loading');
    resolve([]);
    await promise;
  });

  it('fulfilled: writes 3 items to the right bucket and sets status=ok', async () => {
    (reviewsApi.listByProduct as ReturnType<typeof vi.fn>).mockResolvedValue([
      r('r1', 'p1'),
      r('r2', 'p1'),
      r('r3', 'p1'),
    ]);
    const store = makeTestStore();
    await store.dispatch(fetchReviews('p1'));
    const bucket = store.getState().reviews.byProductId['p1'];
    expect(bucket.status).toBe('ok');
    expect(bucket.items.length).toBe(3);
    expect(bucket.error).toBeNull();
  });

  it('rejected: status=error', async () => {
    (reviewsApi.listByProduct as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('fail'),
    );
    const store = makeTestStore();
    await store.dispatch(fetchReviews('p2'));
    const bucket = store.getState().reviews.byProductId['p2'];
    expect(bucket.status).toBe('error');
    expect(bucket.error).toBe('fail');
  });
});

describe('createReview thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fulfilled: appends new review to byProductId[productId].items', async () => {
    // Pre-populate via fetch
    (reviewsApi.listByProduct as ReturnType<typeof vi.fn>).mockResolvedValue([
      r('r1', 'p1'),
      r('r2', 'p1'),
      r('r3', 'p1'),
    ]);
    const store = makeTestStore();
    await store.dispatch(fetchReviews('p1'));
    expect(store.getState().reviews.byProductId['p1'].items.length).toBe(3);

    (reviewsApi.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      r('r4', 'p1'),
    );
    await store.dispatch(
      createReview({ productId: 'p1', author: 'x', rating: 4, text: 'good' }),
    );
    const bucket = store.getState().reviews.byProductId['p1'];
    expect(bucket.items.length).toBe(4);
    expect(bucket.items[3].id).toBe('r4');
  });

  it('fulfilled: when bucket does not exist yet, creates it', async () => {
    (reviewsApi.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      r('r1', 'pNew'),
    );
    const store = makeTestStore();
    await store.dispatch(
      createReview({ productId: 'pNew', author: 'x', rating: 5, text: 't' }),
    );
    const bucket = store.getState().reviews.byProductId['pNew'];
    expect(bucket).toBeDefined();
    expect(bucket.items.length).toBe(1);
  });
});
