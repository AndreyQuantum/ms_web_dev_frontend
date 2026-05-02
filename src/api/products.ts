import { delay } from './_latency';
import { products as mockProducts } from '@/mocks/products';
import type { Product, ProductFilter, ProductListResponse } from '@/types';

let store: Product[] = mockProducts.map((p) => ({ ...p }));

export interface ProductListParams extends ProductFilter {
  includeArchived?: boolean;
}

function applyFilters(items: Product[], params: ProductListParams): Product[] {
  let result = items;

  if (!params.includeArchived) {
    result = result.filter((p) => !p.isArchived);
  }

  if (params.search) {
    const term = params.search.toLowerCase();
    result = result.filter((p) => {
      const hay = `${p.name} ${p.description}`.toLowerCase();
      return hay.includes(term);
    });
  }

  if (params.categoryId !== undefined) {
    result = result.filter((p) => p.categoryId === params.categoryId);
  }

  if (params.bulbTypeIds && params.bulbTypeIds.length > 0) {
    result = result.filter((p) => params.bulbTypeIds!.includes(p.bulbTypeId));
  }

  if (params.shapeIds && params.shapeIds.length > 0) {
    result = result.filter((p) => params.shapeIds!.includes(p.bulbShapeId));
  }

  if (params.socketIds && params.socketIds.length > 0) {
    result = result.filter((p) => params.socketIds!.includes(p.socketId));
  }

  if (params.minBrightness !== undefined) {
    result = result.filter((p) => p.brightnessLm >= params.minBrightness!);
  }

  if (params.maxBrightness !== undefined) {
    result = result.filter((p) => p.brightnessLm <= params.maxBrightness!);
  }

  if (params.minPrice !== undefined) {
    result = result.filter((p) => p.price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= params.maxPrice!);
  }

  if (params.inStockOnly) {
    result = result.filter((p) => p.inStock === true);
  }

  if (params.supplierId !== undefined) {
    result = result.filter((p) => p.supplierId === params.supplierId);
  }

  return result;
}

function applySort(items: Product[], sort?: ProductFilter['sort']): Product[] {
  if (!sort) return items;
  const sorted = [...items];
  switch (sort) {
    case 'priceAsc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      sorted.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'new':
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }
  return sorted;
}

function genId(): string {
  return (
    'p-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 7)
  );
}

export const productsApi = {
  async list(params: ProductListParams = {}): Promise<ProductListResponse> {
    await delay();
    const filtered = applyFilters(store, params);
    const sorted = applySort(filtered, params.sort);
    const page = params.page ?? 1;
    const size = params.size ?? 10;
    const total = sorted.length;
    const start = (page - 1) * size;
    const items = sorted.slice(start, start + size);
    return { items, page, size, total };
  },

  async getById(id: string): Promise<Product> {
    await delay();
    const found = store.find((p) => p.id === id);
    if (!found) {
      throw new Error(`Product not found: ${id}`);
    }
    return { ...found };
  },

  async create(input: Omit<Product, 'id'>): Promise<Product> {
    await delay();
    const product: Product = { ...input, id: genId() };
    store.push(product);
    return { ...product };
  },

  async update(id: string, patch: Partial<Product>): Promise<Product> {
    await delay();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Product not found: ${id}`);
    }
    const next = { ...store[idx], ...patch, id: store[idx].id };
    store[idx] = next;
    return { ...next };
  },

  async archive(id: string): Promise<Product> {
    await delay();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Product not found: ${id}`);
    }
    store[idx] = { ...store[idx], isArchived: true };
    return { ...store[idx] };
  },
};

export function __resetForTests(): void {
  store = mockProducts.map((p) => ({ ...p }));
}
