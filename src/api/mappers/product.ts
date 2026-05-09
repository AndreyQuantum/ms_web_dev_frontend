import type { Product } from '@/types';

export interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  quantity: number;
  brightness_lm: number;
  is_archived: boolean;
  available_from: string | null;
  category_id: number;
  bulb_type_id: number;
  bulb_shape_id: number;
  socket_id: number;
  supplier_id: number;
  promo_id: number | null;
  created_at?: string;
  created_by?: string | null;
  edited_at?: string | null;
  edited_by?: string | null;
}

export function fromApiProduct(a: ApiProduct): Product {
  return {
    id: a.id,
    name: a.title,
    description: a.description ?? '',
    price: Number(a.price),
    brightnessLm: a.brightness_lm,
    rating: 0,
    reviewsCount: 0,
    popularity: 0,
    inStock: a.quantity > 0,
    stockQty: a.quantity,
    isArchived: a.is_archived,
    availableFrom: a.available_from ?? undefined,
    categoryId: a.category_id,
    bulbTypeId: a.bulb_type_id,
    bulbShapeId: a.bulb_shape_id,
    socketId: a.socket_id,
    supplierId: a.supplier_id,
    promoId: a.promo_id ?? undefined,
    imageUrl: '/placeholder.png',
    createdAt: a.created_at ?? new Date(0).toISOString(),
  };
}

export function toApiProduct(p: Partial<Product>): Partial<ApiProduct> {
  const out: Partial<ApiProduct> = {};
  if (p.name !== undefined) out.title = p.name;
  if (p.description !== undefined) out.description = p.description;
  if (p.price !== undefined) out.price = String(p.price);
  if (p.stockQty !== undefined) out.quantity = p.stockQty;
  if (p.brightnessLm !== undefined) out.brightness_lm = p.brightnessLm;
  if (p.isArchived !== undefined) out.is_archived = p.isArchived;
  if (p.availableFrom !== undefined) out.available_from = p.availableFrom ?? null;
  if (p.categoryId !== undefined) out.category_id = p.categoryId;
  if (p.bulbTypeId !== undefined) out.bulb_type_id = p.bulbTypeId;
  if (p.bulbShapeId !== undefined) out.bulb_shape_id = p.bulbShapeId;
  if (p.socketId !== undefined) out.socket_id = p.socketId;
  if (p.supplierId !== undefined) out.supplier_id = p.supplierId;
  if (p.promoId !== undefined) out.promo_id = p.promoId ?? null;
  return out;
}
