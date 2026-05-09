import { ordersHttp } from './http';
import {
  toApiOrder,
  fromApiOrder,
  statusToApi,
  type ApiOrderRead,
  type CreateOrderInput,
} from './mappers/order';
import type { Order, OrderStatus } from '@/types';

export type { CreateOrderInput } from './mappers/order';

export interface OrderListParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export const ordersApi = {
  async create(input: CreateOrderInput): Promise<Order> {
    const body = toApiOrder(input);
    const r = await ordersHttp<ApiOrderRead>(`/orders`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return fromApiOrder(r, input.items);
  },

  async list(params: OrderListParams = {}): Promise<Order[]> {
    const u = new URLSearchParams();
    if (params.page !== undefined) u.set('page', String(params.page));
    if (params.size !== undefined) u.set('size', String(params.size));
    if (params.status !== undefined) u.set('status', statusToApi(params.status));
    const q = u.toString();
    const r = await ordersHttp<ApiOrderRead[]>(
      `/orders${q ? '?' + q : ''}`,
    );
    return r.map((o) => fromApiOrder(o));
  },

  async getById(id: string): Promise<Order> {
    const r = await ordersHttp<ApiOrderRead>(
      `/orders/${encodeURIComponent(id)}`,
    );
    return fromApiOrder(r);
  },

  async patchStatus(id: string, status: OrderStatus): Promise<Order> {
    const r = await ordersHttp<ApiOrderRead>(
      `/orders/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: statusToApi(status) }),
      },
    );
    return fromApiOrder(r);
  },
};
