import type { Order } from '@/types';

export const orders: Order[] = [
  {
    id: 'o-001',
    customer: {
      email: 'ivanov@example.com',
      phone: '+79161234567',
      comment: 'Позвонить за час до доставки',
    },
    deliveryMethod: 'courier',
    items: [
      { productId: 'p-001', name: 'LED Лампа E27 10W 800лм', price: 199, qty: 4 },
      { productId: 'p-008', name: 'LED Лампа E27 15W 1500лм', price: 399, qty: 2 },
    ],
    subtotal: 1594,
    discount: 0,
    total: 1594,
    status: 'new',
    createdAt: '2026-04-30T09:15:00.000Z',
  },
  {
    id: 'o-002',
    customer: {
      email: 'petrova@example.com',
      phone: '+79169876543',
    },
    deliveryMethod: 'pickup',
    items: [
      { productId: 'p-003', name: 'Филаментная A60 E27 8W', price: 349, qty: 6 },
    ],
    subtotal: 2094,
    discount: 200,
    total: 1894,
    status: 'processing',
    createdAt: '2026-04-25T14:32:00.000Z',
  },
  {
    id: 'o-003',
    customer: {
      email: 'sidorov@example.com',
      phone: '+79101112233',
      comment: 'Доставка в офис, 3 этаж',
    },
    deliveryMethod: 'transport',
    items: [
      { productId: 'p-007', name: 'Люминесцентная T8 G13 18W', price: 189, qty: 20 },
      { productId: 'p-017', name: 'Люминесцентная T8 G13 36W', price: 269, qty: 10 },
    ],
    subtotal: 6470,
    discount: 500,
    total: 5970,
    status: 'shipped',
    createdAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'o-004',
    customer: {
      email: 'kuznetsova@example.com',
      phone: '+79263334455',
    },
    deliveryMethod: 'courier',
    items: [
      { productId: 'p-019', name: 'LED Лампа E27 12W RGB', price: 1299, qty: 2 },
    ],
    subtotal: 2598,
    discount: 0,
    total: 2598,
    status: 'delivered',
    createdAt: '2026-04-10T16:45:00.000Z',
  },
  {
    id: 'o-005',
    customer: {
      email: 'morozov@example.com',
      phone: '+79114445566',
      comment: 'Срочная отмена',
    },
    deliveryMethod: 'pickup',
    items: [
      { productId: 'p-005', name: 'Точечная GU10 5W LED', price: 229, qty: 8 },
    ],
    subtotal: 1832,
    discount: 0,
    total: 1832,
    status: 'cancelled',
    createdAt: '2026-04-05T11:20:00.000Z',
  },
  {
    id: 'o-006',
    customer: {
      email: 'fedorov@example.com',
      phone: '+79525556677',
    },
    deliveryMethod: 'courier',
    items: [
      { productId: 'p-022', name: 'LED Лампа E27 9W теплый свет', price: 179, qty: 12 },
      { productId: 'p-023', name: 'LED Лампа E27 9W холодный свет', price: 179, qty: 6 },
    ],
    subtotal: 3222,
    discount: 222,
    total: 3000,
    status: 'delivered',
    createdAt: '2026-04-12T13:05:00.000Z',
  },
];
