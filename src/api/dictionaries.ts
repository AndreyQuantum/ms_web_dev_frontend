import { productsHttp } from './http';
import {
  fromApiCategory,
  fromApiBulbType,
  fromApiBulbShape,
  fromApiSocket,
  fromApiSupplier,
  fromApiPromo,
  toApiNamed,
  toApiPromo,
  type ApiNamed,
  type ApiPromo,
  type CreatePromoInput,
} from './mappers/dictionaries';
import type {
  BulbShape,
  BulbType,
  Category,
  Promo,
  Socket,
  Supplier,
} from '@/types';

const j = (body: unknown) => ({
  method: 'POST' as const,
  body: JSON.stringify(body),
});
const del = { method: 'DELETE' as const };

export const dictionariesApi = {
  // Categories
  listCategories: async (): Promise<Category[]> =>
    (await productsHttp<ApiNamed[]>('/categories')).map(fromApiCategory),
  createCategory: async (input: { name: string }): Promise<Category> =>
    fromApiCategory(
      await productsHttp<ApiNamed>('/categories', j(toApiNamed(input))),
    ),
  deleteCategory: async (id: number): Promise<void> => {
    await productsHttp<void>(`/categories/${id}`, del);
  },

  // Bulb Types
  listBulbTypes: async (): Promise<BulbType[]> =>
    (await productsHttp<ApiNamed[]>('/bulb-types')).map(fromApiBulbType),
  createBulbType: async (input: { name: string }): Promise<BulbType> =>
    fromApiBulbType(
      await productsHttp<ApiNamed>('/bulb-types', j(toApiNamed(input))),
    ),
  deleteBulbType: async (id: number): Promise<void> => {
    await productsHttp<void>(`/bulb-types/${id}`, del);
  },

  // Bulb Shapes (frontend name: shapes)
  listShapes: async (): Promise<BulbShape[]> =>
    (await productsHttp<ApiNamed[]>('/bulb-shapes')).map(fromApiBulbShape),
  createShape: async (input: { name: string }): Promise<BulbShape> =>
    fromApiBulbShape(
      await productsHttp<ApiNamed>('/bulb-shapes', j(toApiNamed(input))),
    ),
  deleteShape: async (id: number): Promise<void> => {
    await productsHttp<void>(`/bulb-shapes/${id}`, del);
  },

  // Sockets
  listSockets: async (): Promise<Socket[]> =>
    (await productsHttp<ApiNamed[]>('/sockets')).map(fromApiSocket),
  createSocket: async (input: { name: string }): Promise<Socket> =>
    fromApiSocket(
      await productsHttp<ApiNamed>('/sockets', j(toApiNamed(input))),
    ),
  deleteSocket: async (id: number): Promise<void> => {
    await productsHttp<void>(`/sockets/${id}`, del);
  },

  // Suppliers
  listSuppliers: async (): Promise<Supplier[]> =>
    (await productsHttp<ApiNamed[]>('/suppliers')).map(fromApiSupplier),
  createSupplier: async (input: { name: string }): Promise<Supplier> =>
    fromApiSupplier(
      await productsHttp<ApiNamed>('/suppliers', j(toApiNamed(input))),
    ),
  deleteSupplier: async (id: number): Promise<void> => {
    await productsHttp<void>(`/suppliers/${id}`, del);
  },

  // Promos
  listPromos: async (): Promise<Promo[]> =>
    (await productsHttp<ApiPromo[]>('/promos')).map(fromApiPromo),
  createPromo: async (input: CreatePromoInput): Promise<Promo> =>
    fromApiPromo(
      await productsHttp<ApiPromo>('/promos', j(toApiPromo(input))),
    ),
  deletePromo: async (id: number): Promise<void> => {
    await productsHttp<void>(`/promos/${id}`, del);
  },
};
