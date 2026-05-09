import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsApi, type ProductListParams } from '@/api/products';
import { dictionariesApi } from '@/api/dictionaries';
import type {
  Product,
  Category,
  BulbType,
  BulbShape,
  Socket,
  Supplier,
  Promo,
  ProductListResponse,
} from '@/types';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export interface ProductsDictionaries {
  categories: Category[];
  bulbTypes: BulbType[];
  shapes: BulbShape[];
  sockets: Socket[];
  suppliers: Supplier[];
  promos: Promo[];
}

export interface ProductsState {
  list: Product[];
  total: number;
  page: number;
  size: number;
  listStatus: Status;
  listError: string | null;
  currentById: Record<string, Product>;
  currentStatus: Status;
  currentError: string | null;
  dictionaries: ProductsDictionaries;
  dictionariesStatus: Status;
  dictionariesError: string | null;
}

const initialState: ProductsState = {
  list: [],
  total: 0,
  page: 1,
  size: 10,
  listStatus: 'idle',
  listError: null,
  currentById: {},
  currentStatus: 'idle',
  currentError: null,
  dictionaries: {
    categories: [],
    bulbTypes: [],
    shapes: [],
    sockets: [],
    suppliers: [],
    promos: [],
  },
  dictionariesStatus: 'idle',
  dictionariesError: null,
};

export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  ProductListParams
>('products/fetchProducts', async (params) => {
  return await productsApi.list(params);
});

export const fetchProductById = createAsyncThunk<Product, string>(
  'products/fetchProductById',
  async (id) => {
    return await productsApi.getById(id);
  },
);

export const fetchDictionaries = createAsyncThunk<ProductsDictionaries>(
  'products/fetchDictionaries',
  async () => {
    const [categories, bulbTypes, shapes, sockets, suppliers, promos] =
      await Promise.all([
        dictionariesApi.listCategories(),
        dictionariesApi.listBulbTypes(),
        dictionariesApi.listShapes(),
        dictionariesApi.listSockets(),
        dictionariesApi.listSuppliers(),
        dictionariesApi.listPromos(),
      ]);
    return { categories, bulbTypes, shapes, sockets, suppliers, promos };
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'ok';
        state.list = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.listError = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'error';
        state.listError = action.error.message ?? 'Failed to fetch products';
      })
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentStatus = 'ok';
        state.currentById[action.payload.id] = action.payload;
        state.currentError = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentStatus = 'error';
        state.currentError = action.error.message ?? 'Failed to fetch product';
      })
      // fetchDictionaries
      .addCase(fetchDictionaries.pending, (state) => {
        state.dictionariesStatus = 'loading';
        state.dictionariesError = null;
      })
      .addCase(fetchDictionaries.fulfilled, (state, action) => {
        state.dictionariesStatus = 'ok';
        state.dictionaries = action.payload;
        state.dictionariesError = null;
      })
      .addCase(fetchDictionaries.rejected, (state, action) => {
        state.dictionariesStatus = 'error';
        state.dictionariesError =
          action.error.message ?? 'Failed to fetch dictionaries';
      });
  },
});

export default productsSlice.reducer;
