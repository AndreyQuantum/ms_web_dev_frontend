import { delay } from './_latency';
import { orders as mockOrders } from '@/mocks';
import type {
  Customer,
  DeliveryMethod,
  Order,
  OrderItem,
  OrderStatus,
} from '@/types';

let store: Order[] = mockOrders.map((o) => ({ ...o, items: [...o.items] }));

export interface OrderListParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export interface CreateOrderInput {
  customer: Customer;
  deliveryMethod: DeliveryMethod;
  items: OrderItem[];
}

function genId(): string {
  return (
    'ord-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
  );
}

export const ordersApi = {
  async list(params: OrderListParams = {}): Promise<Order[]> {
    await delay();
    let result = store.slice();
    if (params.status) {
      result = result.filter((o) => o.status === params.status);
    }
    if (params.page !== undefined && params.size !== undefined) {
      const start = (params.page - 1) * params.size;
      result = result.slice(start, start + params.size);
    }
    return result.map((o) => ({ ...o, items: [...o.items] }));
  },

  async getById(id: string): Promise<Order> {
    await delay();
    const found = store.find((o) => o.id === id);
    if (!found) {
      throw new Error(`Order not found: ${id}`);
    }
    return { ...found, items: [...found.items] };
  },

  async create(input: CreateOrderInput): Promise<Order> {
    await delay();
    const subtotal = input.items.reduce(
      (acc, it) => acc + it.price * it.qty,
      0,
    );
    const discount = 0;
    const total = subtotal - discount;
    const order: Order = {
      id: genId(),
      customer: { ...input.customer },
      deliveryMethod: input.deliveryMethod,
      items: input.items.map((it) => ({ ...it })),
      subtotal,
      discount,
      total,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    store.push(order);
    return { ...order, items: [...order.items] };
  },
};

export function __resetForTests(): void {
  store = mockOrders.map((o) => ({ ...o, items: [...o.items] }));
}
