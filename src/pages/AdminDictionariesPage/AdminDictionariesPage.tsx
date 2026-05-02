import { useEffect, useState } from 'react';
import { dictionariesApi } from '@/api/dictionaries';
import { Button } from '@/components/Button/Button';
import type {
  BulbShape,
  BulbType,
  Category,
  Promo,
  Socket,
  Supplier,
} from '@/types';

type TabKey = 'bulbTypes' | 'shapes' | 'sockets' | 'categories' | 'suppliers' | 'promos';

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'bulbTypes', label: 'Типы ламп' },
  { key: 'shapes', label: 'Формы' },
  { key: 'sockets', label: 'Цоколи' },
  { key: 'categories', label: 'Категории' },
  { key: 'suppliers', label: 'Поставщики' },
  { key: 'promos', label: 'Промо' },
];

export function AdminDictionariesPage() {
  const [active, setActive] = useState<TabKey>('bulbTypes');

  const [bulbTypes, setBulbTypes] = useState<BulbType[]>([]);
  const [shapes, setShapes] = useState<BulbShape[]>([]);
  const [sockets, setSockets] = useState<Socket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  const [name, setName] = useState('');

  useEffect(() => {
    dictionariesApi.listBulbTypes().then(setBulbTypes).catch(() => {});
    dictionariesApi.listShapes().then(setShapes).catch(() => {});
    dictionariesApi.listSockets().then(setSockets).catch(() => {});
    dictionariesApi.listCategories().then(setCategories).catch(() => {});
    dictionariesApi.listSuppliers().then(setSuppliers).catch(() => {});
    dictionariesApi.listPromos().then(setPromos).catch(() => {});
  }, []);

  const reload = (tab: TabKey) => {
    if (tab === 'bulbTypes') dictionariesApi.listBulbTypes().then(setBulbTypes);
    else if (tab === 'shapes') dictionariesApi.listShapes().then(setShapes);
    else if (tab === 'sockets') dictionariesApi.listSockets().then(setSockets);
    else if (tab === 'categories') dictionariesApi.listCategories().then(setCategories);
    else if (tab === 'suppliers') dictionariesApi.listSuppliers().then(setSuppliers);
    else if (tab === 'promos') dictionariesApi.listPromos().then(setPromos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (active === 'bulbTypes') await dictionariesApi.createBulbType({ name });
    else if (active === 'shapes') await dictionariesApi.createShape({ name });
    else if (active === 'sockets') await dictionariesApi.createSocket({ name });
    else if (active === 'categories') await dictionariesApi.createCategory({ name });
    else if (active === 'suppliers') await dictionariesApi.createSupplier({ name });
    else if (active === 'promos')
      await dictionariesApi.createPromo({ name, discountPercent: 0 });
    setName('');
    reload(active);
  };

  const handleDelete = async (id: number) => {
    if (active === 'bulbTypes') await dictionariesApi.deleteBulbType(id);
    else if (active === 'shapes') await dictionariesApi.deleteShape(id);
    else if (active === 'sockets') await dictionariesApi.deleteSocket(id);
    else if (active === 'categories') await dictionariesApi.deleteCategory(id);
    else if (active === 'suppliers') await dictionariesApi.deleteSupplier(id);
    else if (active === 'promos') await dictionariesApi.deletePromo(id);
    reload(active);
  };

  const itemsForActive = (): Array<{ id: number; name: string }> => {
    switch (active) {
      case 'bulbTypes':
        return bulbTypes;
      case 'shapes':
        return shapes;
      case 'sockets':
        return sockets;
      case 'categories':
        return categories;
      case 'suppliers':
        return suppliers;
      case 'promos':
        return promos.map(p => ({ id: p.id, name: p.name }));
    }
  };

  return (
    <div className="admin-dictionaries-page">
      <h1>Справочники</h1>

      <div role="tablist" className="dict-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={active === t.key ? 'dict-tab dict-tab-active' : 'dict-tab'}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="dict-panel">
        <form onSubmit={handleSubmit} className="dict-form">
          <label>
            Название
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          <Button type="submit">Добавить</Button>
        </form>

        <ul className="dict-list">
          {itemsForActive().map(item => (
            <li key={item.id} className="dict-list-item">
              <span>{item.name}</span>
              <Button variant="ghost" onClick={() => handleDelete(item.id)}>
                Удалить
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
