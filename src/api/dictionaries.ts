import { delay } from './_latency';
import {
  categories as mockCategories,
  bulbTypes as mockBulbTypes,
  bulbShapes as mockBulbShapes,
  sockets as mockSockets,
  suppliers as mockSuppliers,
  promos as mockPromos,
} from '@/mocks';
import type {
  BulbShape,
  BulbType,
  Category,
  Promo,
  Socket,
  Supplier,
} from '@/types';

let categoriesStore: Category[] = mockCategories.map((c) => ({ ...c }));
let bulbTypesStore: BulbType[] = mockBulbTypes.map((c) => ({ ...c }));
let shapesStore: BulbShape[] = mockBulbShapes.map((c) => ({ ...c }));
let socketsStore: Socket[] = mockSockets.map((c) => ({ ...c }));
let suppliersStore: Supplier[] = mockSuppliers.map((c) => ({ ...c }));
let promosStore: Promo[] = mockPromos.map((c) => ({ ...c }));

function nextId(items: { id: number }[]): number {
  return items.reduce((max, it) => (it.id > max ? it.id : max), 0) + 1;
}

export const dictionariesApi = {
  async listCategories(): Promise<Category[]> {
    await delay();
    return categoriesStore.map((c) => ({ ...c }));
  },
  async createCategory({ name }: { name: string }): Promise<Category> {
    await delay();
    const created: Category = { id: nextId(categoriesStore), name };
    categoriesStore.push(created);
    return { ...created };
  },
  async deleteCategory(id: number): Promise<void> {
    await delay();
    categoriesStore = categoriesStore.filter((c) => c.id !== id);
  },

  async listBulbTypes(): Promise<BulbType[]> {
    await delay();
    return bulbTypesStore.map((c) => ({ ...c }));
  },
  async createBulbType({ name }: { name: string }): Promise<BulbType> {
    await delay();
    const created: BulbType = { id: nextId(bulbTypesStore), name };
    bulbTypesStore.push(created);
    return { ...created };
  },
  async deleteBulbType(id: number): Promise<void> {
    await delay();
    bulbTypesStore = bulbTypesStore.filter((c) => c.id !== id);
  },

  async listShapes(): Promise<BulbShape[]> {
    await delay();
    return shapesStore.map((c) => ({ ...c }));
  },
  async createShape({ name }: { name: string }): Promise<BulbShape> {
    await delay();
    const created: BulbShape = { id: nextId(shapesStore), name };
    shapesStore.push(created);
    return { ...created };
  },
  async deleteShape(id: number): Promise<void> {
    await delay();
    shapesStore = shapesStore.filter((c) => c.id !== id);
  },

  async listSockets(): Promise<Socket[]> {
    await delay();
    return socketsStore.map((c) => ({ ...c }));
  },
  async createSocket({ name }: { name: string }): Promise<Socket> {
    await delay();
    const created: Socket = { id: nextId(socketsStore), name };
    socketsStore.push(created);
    return { ...created };
  },
  async deleteSocket(id: number): Promise<void> {
    await delay();
    socketsStore = socketsStore.filter((c) => c.id !== id);
  },

  async listSuppliers(): Promise<Supplier[]> {
    await delay();
    return suppliersStore.map((c) => ({ ...c }));
  },
  async createSupplier({ name }: { name: string }): Promise<Supplier> {
    await delay();
    const created: Supplier = { id: nextId(suppliersStore), name };
    suppliersStore.push(created);
    return { ...created };
  },
  async deleteSupplier(id: number): Promise<void> {
    await delay();
    suppliersStore = suppliersStore.filter((c) => c.id !== id);
  },

  async listPromos(): Promise<Promo[]> {
    await delay();
    return promosStore.map((c) => ({ ...c }));
  },
  async createPromo(input: {
    name: string;
    discountPercent: number;
    startsAt?: string;
    endsAt?: string;
  }): Promise<Promo> {
    await delay();
    const created: Promo = { id: nextId(promosStore), ...input };
    promosStore.push(created);
    return { ...created };
  },
  async deletePromo(id: number): Promise<void> {
    await delay();
    promosStore = promosStore.filter((c) => c.id !== id);
  },
};

export function __resetForTests(): void {
  categoriesStore = mockCategories.map((c) => ({ ...c }));
  bulbTypesStore = mockBulbTypes.map((c) => ({ ...c }));
  shapesStore = mockBulbShapes.map((c) => ({ ...c }));
  socketsStore = mockSockets.map((c) => ({ ...c }));
  suppliersStore = mockSuppliers.map((c) => ({ ...c }));
  promosStore = mockPromos.map((c) => ({ ...c }));
}
