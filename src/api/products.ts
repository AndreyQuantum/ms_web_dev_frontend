import { productsHttp } from './http';
import {
  fromApiProduct,
  toApiProduct,
  type ApiProduct,
} from './mappers/product';
import type { Product } from '@/types';

export interface ProductListParams {
  categoryId?: number;
  isArchived?: boolean;
  page?: number;
  size?: number;
  // Accepted (for compatibility with existing call sites) but NOT forwarded:
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minBrightness?: number;
  maxBrightness?: number;
  bulbTypeIds?: number[];
  shapeIds?: number[];
  socketIds?: number[];
  supplierId?: number;
  inStockOnly?: boolean;
  includeArchived?: boolean;
  sort?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  size: number;
}

interface ApiProductListResponse {
  data: ApiProduct[];
  meta: { total: number; page: number; size: number };
}

function buildQuery(params: ProductListParams): string {
  const u = new URLSearchParams();
  if (params.categoryId !== undefined) {
    u.set('category_id', String(params.categoryId));
  }
  if (params.isArchived !== undefined) {
    u.set('is_archived', String(params.isArchived));
  }
  if (params.page !== undefined) {
    u.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    u.set('size', String(params.size));
  }
  const q = u.toString();
  return q ? `?${q}` : '';
}

export const productsApi = {
  async list(params: ProductListParams = {}): Promise<ProductListResponse> {
    const r = await productsHttp<ApiProductListResponse>(
      `/products${buildQuery(params)}`,
    );
    return {
      items: r.data.map(fromApiProduct),
      total: r.meta.total,
      page: r.meta.page,
      size: r.meta.size,
    };
  },

  async getById(id: string): Promise<Product> {
    const r = await productsHttp<ApiProduct>(
      `/products/${encodeURIComponent(id)}`,
    );
    return fromApiProduct(r);
  },

  async create(input: Partial<Product>): Promise<Product> {
    const body = toApiProduct(input);
    const r = await productsHttp<ApiProduct>(`/products`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return fromApiProduct(r);
  },

  async update(id: string, patch: Partial<Product>): Promise<Product> {
    const body = toApiProduct(patch);
    const r = await productsHttp<ApiProduct>(
      `/products/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
    );
    return fromApiProduct(r);
  },

  async archive(id: string): Promise<Product> {
    return productsApi.update(id, { isArchived: true });
  },

  async remove(id: string): Promise<void> {
    await productsHttp<void>(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
