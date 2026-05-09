import { productsHttp } from './http';
import {
  toApiReview,
  fromApiReview,
  type ApiReviewRead,
  type CreateReviewInput,
} from './mappers/review';
import type { Review } from '@/types';

export type { CreateReviewInput } from './mappers/review';

export const reviewsApi = {
  async listByProduct(productId: string): Promise<Review[]> {
    const u = new URLSearchParams({ product_id: productId });
    const r = await productsHttp<ApiReviewRead[]>(`/reviews?${u.toString()}`);
    return r.map(fromApiReview);
  },
  async create(input: CreateReviewInput): Promise<Review> {
    const body = toApiReview(input);
    const r = await productsHttp<ApiReviewRead>(`/reviews`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return fromApiReview(r);
  },
  async remove(id: string): Promise<void> {
    await productsHttp<void>(`/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
