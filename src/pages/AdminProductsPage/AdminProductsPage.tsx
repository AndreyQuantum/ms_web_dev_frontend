import { useEffect, useState } from 'react';
import { productsApi } from '@/api/products';
import { dictionariesApi } from '@/api/dictionaries';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { formatPrice } from '@/utils/format';
import type { Product, Category, BulbType, BulbShape, Socket, Supplier } from '@/types';

interface FormState {
  name: string;
  price: string;
  description: string;
  brightnessLm: string;
  stockQty: string;
  categoryId: string;
  bulbTypeId: string;
  bulbShapeId: string;
  socketId: string;
  supplierId: string;
  imageUrl: string;
}

const blankForm: FormState = {
  name: '',
  price: '0',
  description: '',
  brightnessLm: '0',
  stockQty: '0',
  categoryId: '',
  bulbTypeId: '',
  bulbShapeId: '',
  socketId: '',
  supplierId: '',
  imageUrl: '',
};

export function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);

  const [categories, setCategories] = useState<Category[]>([]);
  const [bulbTypes, setBulbTypes] = useState<BulbType[]>([]);
  const [shapes, setShapes] = useState<BulbShape[]>([]);
  const [sockets, setSockets] = useState<Socket[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const load = () => {
    productsApi
      .list({ search: search || undefined, page: 1, size: 50, includeArchived: true })
      .then(res => setItems(res.items))
      .catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, [search]);

  useEffect(() => {
    dictionariesApi.listCategories().then(setCategories).catch(() => {});
    dictionariesApi.listBulbTypes().then(setBulbTypes).catch(() => {});
    dictionariesApi.listShapes().then(setShapes).catch(() => {});
    dictionariesApi.listSockets().then(setSockets).catch(() => {});
    dictionariesApi.listSuppliers().then(setSuppliers).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description,
      brightnessLm: String(p.brightnessLm),
      stockQty: String(p.stockQty),
      categoryId: String(p.categoryId),
      bulbTypeId: String(p.bulbTypeId),
      bulbShapeId: String(p.bulbShapeId),
      socketId: String(p.socketId),
      supplierId: String(p.supplierId),
      imageUrl: p.imageUrl,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload: Omit<Product, 'id'> = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      brightnessLm: Number(form.brightnessLm) || 0,
      rating: 0,
      reviewsCount: 0,
      inStock: Number(form.stockQty) > 0,
      stockQty: Number(form.stockQty) || 0,
      isArchived: false,
      categoryId: Number(form.categoryId) || 0,
      bulbTypeId: Number(form.bulbTypeId) || 0,
      bulbShapeId: Number(form.bulbShapeId) || 0,
      socketId: Number(form.socketId) || 0,
      supplierId: Number(form.supplierId) || 0,
      imageUrl: form.imageUrl,
      createdAt: new Date().toISOString(),
      popularity: 0,
    };

    if (editingId) {
      await productsApi.update(editingId, payload);
    } else {
      await productsApi.create(payload);
    }
    closeModal();
    load();
  };

  const handleArchive = async (id: string) => {
    await productsApi.archive(id);
    load();
  };

  return (
    <div className="admin-products-page">
      <header className="admin-products-toolbar">
        <h1>Товары</h1>
        <input
          type="search"
          placeholder="Поиск по названию"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="search-products"
        />
        <Button onClick={openCreate}>Создать товар</Button>
      </header>

      <table className="admin-products-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Цена</th>
            <th>В наличии</th>
            <th>Статус</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} data-testid="admin-product-row">
              <td>{p.name}</td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.stockQty}</td>
              <td>{p.isArchived ? 'Архив' : 'Активен'}</td>
              <td>
                <Button variant="ghost" onClick={() => openEdit(p)}>
                  Редактировать
                </Button>
                {!p.isArchived ? (
                  <Button variant="danger" onClick={() => handleArchive(p.id)}>
                    Архив
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Редактировать товар' : 'Создать товар'}
      >
        <form onSubmit={handleSubmit} className="admin-product-form">
          <label>
            Название
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label>
            Цена
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            />
          </label>
          <label>
            Описание
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label>
            Яркость, лм
            <input
              type="number"
              value={form.brightnessLm}
              onChange={e => setForm(f => ({ ...f, brightnessLm: e.target.value }))}
            />
          </label>
          <label>
            Количество
            <input
              type="number"
              value={form.stockQty}
              onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))}
            />
          </label>
          <label>
            Категория
            <select
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">—</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Тип лампы
            <select
              value={form.bulbTypeId}
              onChange={e => setForm(f => ({ ...f, bulbTypeId: e.target.value }))}
            >
              <option value="">—</option>
              {bulbTypes.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Форма
            <select
              value={form.bulbShapeId}
              onChange={e => setForm(f => ({ ...f, bulbShapeId: e.target.value }))}
            >
              <option value="">—</option>
              {shapes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Цоколь
            <select
              value={form.socketId}
              onChange={e => setForm(f => ({ ...f, socketId: e.target.value }))}
            >
              <option value="">—</option>
              {sockets.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Поставщик
            <select
              value={form.supplierId}
              onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
            >
              <option value="">—</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Картинка (URL)
            <input
              type="text"
              value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
            />
          </label>

          <div className="admin-product-form-actions">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
