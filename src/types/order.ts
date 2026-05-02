export type OrderStatus =
  | 'new'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type DeliveryMethod = 'pickup' | 'courier' | 'transport';

export interface Customer {
  email: string;
  phone: string;
  comment?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  customer: Customer;
  deliveryMethod: DeliveryMethod;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}
