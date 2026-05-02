export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  brightnessLm: number;
  power?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQty: number;
  isArchived: boolean;
  availableFrom?: string;
  categoryId: number;
  bulbTypeId: number;
  bulbShapeId: number;
  socketId: number;
  supplierId: number;
  promoId?: number;
  imageUrl: string;
  thumbnails?: string[];
  createdAt: string;
  popularity: number;
  isNew?: boolean;
}

export interface ProductFilter {
  search?: string;
  categoryId?: number;
  bulbTypeIds?: number[];
  shapeIds?: number[];
  socketIds?: number[];
  minBrightness?: number;
  maxBrightness?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  supplierId?: number;
  sort?: 'priceAsc' | 'priceDesc' | 'popular' | 'new';
  page?: number;
  size?: number;
}

export interface ProductListResponse {
  items: Product[];
  page: number;
  size: number;
  total: number;
}
