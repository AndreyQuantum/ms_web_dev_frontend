import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/products', () => ({
  productsApi: {
    list: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock('@/api/dictionaries', () => ({
  dictionariesApi: {
    listCategories: vi.fn(),
    listBulbTypes: vi.fn(),
    listShapes: vi.fn(),
    listSockets: vi.fn(),
    listSuppliers: vi.fn(),
    listPromos: vi.fn(),
  },
}));

import { configureStore } from '@reduxjs/toolkit';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  fetchDictionaries,
} from './productsSlice';
import { productsApi } from '@/api/products';
import { dictionariesApi } from '@/api/dictionaries';
import type { Product } from '@/types';

function makeTestStore() {
  return configureStore({ reducer: { products: productsReducer } });
}

const fakeProduct: Product = {
  id: 'p1',
  name: 'Test',
  description: 'd',
  price: 100,
  brightnessLm: 500,
  rating: 0,
  reviewsCount: 0,
  inStock: true,
  stockQty: 1,
  isArchived: false,
  categoryId: 1,
  bulbTypeId: 1,
  bulbShapeId: 1,
  socketId: 1,
  supplierId: 1,
  imageUrl: '/x.png',
  createdAt: '2024-01-01',
  popularity: 0,
};

describe('productsSlice initial state', () => {
  it('has expected fields', () => {
    const store = makeTestStore();
    const state = store.getState().products;
    expect(state.list).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.listStatus).toBe('idle');
    expect(state.currentStatus).toBe('idle');
    expect(state.dictionariesStatus).toBe('idle');
    expect(state.dictionaries.categories).toEqual([]);
  });
});

describe('fetchProducts thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fulfilled: stores list, total, page, size and sets listStatus=ok', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [fakeProduct],
      page: 1,
      size: 10,
      total: 1,
    });
    const store = makeTestStore();
    await store.dispatch(fetchProducts({}));
    const s = store.getState().products;
    expect(s.listStatus).toBe('ok');
    expect(s.list.length).toBe(1);
    expect(s.total).toBe(1);
    expect(s.page).toBe(1);
    expect(s.size).toBe(10);
    expect(s.listError).toBeNull();
  });

  it('rejected: sets listStatus=error and listError to message', async () => {
    (productsApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('boom'),
    );
    const store = makeTestStore();
    await store.dispatch(fetchProducts({}));
    const s = store.getState().products;
    expect(s.listStatus).toBe('error');
    expect(s.listError).toBe('boom');
  });
});

describe('fetchProductById thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fulfilled: stores in currentById and sets currentStatus=ok', async () => {
    (productsApi.getById as ReturnType<typeof vi.fn>).mockResolvedValue(
      fakeProduct,
    );
    const store = makeTestStore();
    await store.dispatch(fetchProductById('p1'));
    const s = store.getState().products;
    expect(s.currentStatus).toBe('ok');
    expect(s.currentById['p1']).toEqual(fakeProduct);
  });

  it('rejected: sets currentStatus=error', async () => {
    (productsApi.getById as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('nope'),
    );
    const store = makeTestStore();
    await store.dispatch(fetchProductById('p1'));
    const s = store.getState().products;
    expect(s.currentStatus).toBe('error');
    expect(s.currentError).toBe('nope');
  });
});

describe('fetchDictionaries thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fulfilled: stores all six dictionaries', async () => {
    (dictionariesApi.listCategories as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'cat' },
    ]);
    (dictionariesApi.listBulbTypes as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'bt' },
    ]);
    (dictionariesApi.listShapes as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'sh' },
    ]);
    (dictionariesApi.listSockets as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'so' },
    ]);
    (dictionariesApi.listSuppliers as ReturnType<typeof vi.fn>).mockResolvedValue(
      [{ id: 1, name: 'sup' }],
    );
    (dictionariesApi.listPromos as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'pr', discountPercent: 10 },
    ]);

    const store = makeTestStore();
    await store.dispatch(fetchDictionaries());
    const s = store.getState().products;
    expect(s.dictionariesStatus).toBe('ok');
    expect(s.dictionaries.categories.length).toBe(1);
    expect(s.dictionaries.bulbTypes.length).toBe(1);
    expect(s.dictionaries.shapes.length).toBe(1);
    expect(s.dictionaries.sockets.length).toBe(1);
    expect(s.dictionaries.suppliers.length).toBe(1);
    expect(s.dictionaries.promos.length).toBe(1);
  });

  it('rejected: sets dictionariesStatus=error', async () => {
    (dictionariesApi.listCategories as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('dictfail'),
    );
    (dictionariesApi.listBulbTypes as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (dictionariesApi.listShapes as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (dictionariesApi.listSockets as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (dictionariesApi.listSuppliers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (dictionariesApi.listPromos as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const store = makeTestStore();
    await store.dispatch(fetchDictionaries());
    const s = store.getState().products;
    expect(s.dictionariesStatus).toBe('error');
  });
});
