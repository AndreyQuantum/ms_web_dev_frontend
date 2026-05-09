import type {
  BulbShape,
  BulbType,
  Category,
  Promo,
  Socket,
  Supplier,
} from '@/types';

export interface ApiNamed {
  id: number;
  name: string;
  created_at: string;
  created_by?: string | null;
  edited_at?: string | null;
  edited_by?: string | null;
}

export interface ApiPromo extends ApiNamed {
  discount_percent: number;
  starts_at: string | null;
  ends_at: string | null;
}

export const fromApiCategory = (a: ApiNamed): Category => ({
  id: a.id,
  name: a.name,
});

export const fromApiBulbType = (a: ApiNamed): BulbType => ({
  id: a.id,
  name: a.name,
});

export const fromApiBulbShape = (a: ApiNamed): BulbShape => ({
  id: a.id,
  name: a.name,
});

export const fromApiSocket = (a: ApiNamed): Socket => ({
  id: a.id,
  name: a.name,
});

export const fromApiSupplier = (a: ApiNamed): Supplier => ({
  id: a.id,
  name: a.name,
});

export function fromApiPromo(a: ApiPromo): Promo {
  const promo: Promo = {
    id: a.id,
    name: a.name,
    discountPercent: a.discount_percent,
  };
  if (a.starts_at !== null) promo.startsAt = a.starts_at;
  if (a.ends_at !== null) promo.endsAt = a.ends_at;
  return promo;
}

export const toApiNamed = (p: { name: string }): { name: string } => ({
  name: p.name,
});

export interface CreatePromoInput {
  name: string;
  discountPercent: number;
  startsAt?: string;
  endsAt?: string;
}

export function toApiPromo(p: CreatePromoInput): {
  name: string;
  discount_percent: number;
  starts_at: string | null;
  ends_at: string | null;
} {
  return {
    name: p.name,
    discount_percent: p.discountPercent,
    starts_at: p.startsAt ?? null,
    ends_at: p.endsAt ?? null,
  };
}
