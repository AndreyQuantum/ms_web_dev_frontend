import type { DeliveryMethod, Order, OrderStatus } from '@/types';

export type ApiOrderStatus = 'NEW' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';

export interface ApiOrderItemCreate {
  product_id: string;
  quantity: number;
}

export interface ApiOrderItemRead extends ApiOrderItemCreate {
  id: string;
  current_price: string;
  created_at: string;
}

export interface ApiOrderCreate {
  client_email: string;
  client_phone: string;
  comment?: string | null;
  items: ApiOrderItemCreate[];
}

export interface ApiOrderRead {
  id: string;
  client_email: string;
  client_phone: string;
  comment: string | null;
  status: ApiOrderStatus;
  items: ApiOrderItemRead[];
  created_at: string;
}

const FE_TO_API: Record<OrderStatus, ApiOrderStatus> = {
  new: 'NEW',
  processing: 'IN_PROGRESS',
  // lossy: backend has no separate "shipped" state, collapse into IN_PROGRESS
  shipped: 'IN_PROGRESS',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

const API_TO_FE: Record<ApiOrderStatus, OrderStatus> = {
  NEW: 'new',
  IN_PROGRESS: 'processing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export function statusToApi(s: OrderStatus): ApiOrderStatus {
  return FE_TO_API[s];
}

export function statusFromApi(s: ApiOrderStatus): OrderStatus {
  return API_TO_FE[s];
}

export interface CreateOrderInput {
  email: string;
  phone: string;
  // Use a wider type than DeliveryMethod so callers can pass localized labels
  // (e.g. 'курьер', 'самовывоз'); we just embed it in the comment.
  deliveryMethod: DeliveryMethod | string;
  comment?: string;
  items: Array<{
    productId: string;
    qty: number;
    price?: number;
    name?: string;
  }>;
}

function buildComment(
  deliveryMethod: DeliveryMethod | string,
  comment?: string,
): string {
  const head = `Доставка: ${deliveryMethod}`;
  const body = (comment ?? '').trim();
  return body ? `${head}\n\n${body}` : head;
}

export function toApiOrder(input: CreateOrderInput): ApiOrderCreate {
  return {
    client_email: input.email,
    client_phone: input.phone,
    comment: buildComment(input.deliveryMethod, input.comment),
    items: input.items.map((i) => ({
      product_id: i.productId,
      quantity: i.qty,
    })),
  };
}

export function fromApiOrder(
  a: ApiOrderRead,
  fallbackItems?: CreateOrderInput['items'],
): Order {
  const items: Order['items'] =
    a.items && a.items.length
      ? a.items.map((i) => ({
          productId: i.product_id,
          qty: i.quantity,
          price: Number(i.current_price),
          name: '',
        }))
      : (fallbackItems ?? []).map((i) => ({
          productId: i.productId,
          qty: i.qty,
          price: i.price ?? 0,
          name: i.name ?? '',
        }));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = 0;
  const total = subtotal - discount;

  return {
    id: a.id,
    customer: {
      email: a.client_email,
      phone: a.client_phone,
      ...(a.comment !== null && a.comment !== undefined
        ? { comment: a.comment }
        : {}),
    },
    // Backend doesn't round-trip a structured delivery method; default to
    // 'pickup' so we satisfy the strict union. The original delivery label
    // (if any) was folded into the order comment by `toApiOrder`.
    deliveryMethod: 'pickup' as DeliveryMethod,
    status: statusFromApi(a.status),
    items,
    subtotal,
    discount,
    total,
    createdAt: a.created_at,
  };
}
