import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersApi, type CreateOrderInput } from '@/api/orders';
import type { Order } from '@/types';

type Status = 'idle' | 'creating' | 'ok' | 'error';

export interface OrdersState {
  status: Status;
  error: string | null;
  lastOrder: Order | null;
}

const initialState: OrdersState = {
  status: 'idle',
  error: null,
  lastOrder: null,
};

export const createOrder = createAsyncThunk<Order, CreateOrderInput>(
  'orders/createOrder',
  async (input) => {
    return await ordersApi.create(input);
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'creating';
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'ok';
        state.lastOrder = action.payload;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Failed to create order';
      });
  },
});

export default ordersSlice.reducer;
