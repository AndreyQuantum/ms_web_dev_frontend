import type { Review } from '@/types';

export interface ApiReviewRead {
  id: string;
  product_id: string;
  text: string;
  rating: number;
  created_at: string;
  created_by?: string | null;
  edited_at?: string | null;
  edited_by?: string | null;
}

export interface ApiReviewCreate {
  product_id: string;
  text: string;
  rating: number;
}

export interface CreateReviewInput {
  productId: string;
  text: string;
  rating: number;
  author?: string; // accepted but NOT sent to backend
}

export function toApiReview(input: CreateReviewInput): ApiReviewCreate {
  return {
    product_id: input.productId,
    text: input.text,
    rating: input.rating,
  };
}

export function fromApiReview(a: ApiReviewRead): Review {
  return {
    id: a.id,
    productId: a.product_id,
    author: 'Аноним',
    rating: a.rating,
    text: a.text,
    createdAt: a.created_at,
  };
}
