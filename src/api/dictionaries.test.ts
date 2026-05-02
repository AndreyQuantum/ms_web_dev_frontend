import { describe, it, expect, beforeEach } from 'vitest';
import { dictionariesApi } from '@/api/dictionaries';
import { setLatency } from '@/api/_latency';

describe('dictionariesApi list endpoints', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('listCategories returns a non-empty array', async () => {
    const res = await dictionariesApi.listCategories();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('listBulbTypes returns a non-empty array', async () => {
    const res = await dictionariesApi.listBulbTypes();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('listShapes returns a non-empty array', async () => {
    const res = await dictionariesApi.listShapes();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('listSockets returns a non-empty array', async () => {
    const res = await dictionariesApi.listSockets();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('listSuppliers returns a non-empty array', async () => {
    const res = await dictionariesApi.listSuppliers();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('listPromos returns a non-empty array', async () => {
    const res = await dictionariesApi.listPromos();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });
});

describe('dictionariesApi categories CRUD', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('createCategory returns a new entry with auto-incremented id; subsequent listCategories includes it', async () => {
    const before = await dictionariesApi.listCategories();
    const maxIdBefore = Math.max(0, ...before.map((c) => c.id));

    const created = await dictionariesApi.createCategory({ name: 'Тестовая' });
    expect(typeof created.id).toBe('number');
    expect(created.id).toBeGreaterThan(maxIdBefore);
    expect(created.name).toBe('Тестовая');

    const after = await dictionariesApi.listCategories();
    expect(after.some((c) => c.id === created.id && c.name === 'Тестовая')).toBe(
      true,
    );
  });

  it('deleteCategory removes the entry; subsequent listCategories does not include it', async () => {
    const created = await dictionariesApi.createCategory({
      name: 'Для удаления',
    });
    await dictionariesApi.deleteCategory(created.id);
    const after = await dictionariesApi.listCategories();
    expect(after.some((c) => c.id === created.id)).toBe(false);
  });
});

describe('dictionariesApi sockets CRUD (consistency)', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('createSocket returns a new entry with auto-incremented id; subsequent listSockets includes it', async () => {
    const before = await dictionariesApi.listSockets();
    const maxIdBefore = Math.max(0, ...before.map((s) => s.id));

    const created = await dictionariesApi.createSocket({ name: 'E40' });
    expect(typeof created.id).toBe('number');
    expect(created.id).toBeGreaterThan(maxIdBefore);
    expect(created.name).toBe('E40');

    const after = await dictionariesApi.listSockets();
    expect(after.some((s) => s.id === created.id && s.name === 'E40')).toBe(true);
  });

  it('deleteSocket removes the entry; subsequent listSockets does not include it', async () => {
    const created = await dictionariesApi.createSocket({ name: 'TempSocket' });
    await dictionariesApi.deleteSocket(created.id);
    const after = await dictionariesApi.listSockets();
    expect(after.some((s) => s.id === created.id)).toBe(false);
  });
});
