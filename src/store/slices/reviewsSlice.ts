import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsApi, type CreateReviewInput } from '@/api/reviews';
import type { Review } from '@/types';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export interface ReviewsBucket {
  items: Review[];
  status: Status;
  error: string | null;
}

export interface ReviewsState {
  byProductId: Record<string, ReviewsBucket>;
}

const initialState: ReviewsState = {
  byProductId: {},
};

function ensureBucket(
  state: ReviewsState,
  productId: string,
): ReviewsBucket {
  if (!state.byProductId[productId]) {
    state.byProductId[productId] = {
      items: [],
      status: 'idle',
      error: null,
    };
  }
  return state.byProductId[productId];
}

export const fetchReviews = createAsyncThunk<Review[], string>(
  'reviews/fetchReviews',
  async (productId) => {
    return await reviewsApi.listByProduct(productId);
  },
);

export const createReview = createAsyncThunk<Review, CreateReviewInput>(
  'reviews/createReview',
  async (input) => {
    return await reviewsApi.create(input);
  },
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state, action) => {
        const productId = action.meta.arg;
        const bucket = ensureBucket(state, productId);
        bucket.status = 'loading';
        bucket.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        const productId = action.meta.arg;
        const bucket = ensureBucket(state, productId);
        bucket.status = 'ok';
        bucket.items = action.payload;
        bucket.error = null;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        const productId = action.meta.arg;
        const bucket = ensureBucket(state, productId);
        bucket.status = 'error';
        bucket.error = action.error.message ?? 'Failed to fetch reviews';
      })
      .addCase(createReview.fulfilled, (state, action) => {
        const productId = action.payload.productId;
        const bucket = ensureBucket(state, productId);
        bucket.items.push(action.payload);
      });
  },
});

export default reviewsSlice.reducer;
