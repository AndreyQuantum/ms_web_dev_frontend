import { delay } from './_latency';
import { reviews as mockReviews } from '@/mocks';
import type { Review } from '@/types';

let store: Review[] = mockReviews.map((r) => ({ ...r }));

export interface CreateReviewInput {
  productId: string;
  author: string;
  rating: number;
  text: string;
}

function genId(): string {
  return (
    'rev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
  );
}

export const reviewsApi = {
  async listByProduct(productId: string): Promise<Review[]> {
    await delay();
    return store.filter((r) => r.productId === productId).map((r) => ({ ...r }));
  },

  async create(input: CreateReviewInput): Promise<Review> {
    await delay();
    const review: Review = {
      id: genId(),
      productId: input.productId,
      author: input.author,
      rating: input.rating,
      text: input.text,
      createdAt: new Date().toISOString(),
    };
    store.push(review);
    return { ...review };
  },
};

export function __resetForTests(): void {
  store = mockReviews.map((r) => ({ ...r }));
}
