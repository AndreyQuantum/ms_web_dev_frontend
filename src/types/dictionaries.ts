export interface Category {
  id: number;
  name: string;
}

export interface BulbType {
  id: number;
  name: string;
}

export interface BulbShape {
  id: number;
  name: string;
}

export interface Socket {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface Promo {
  id: number;
  name: string;
  discountPercent: number;
  startsAt?: string;
  endsAt?: string;
}
