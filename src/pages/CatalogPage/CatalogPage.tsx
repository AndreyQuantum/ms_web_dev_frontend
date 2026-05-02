import { useEffect, useState, useMemo } from 'react';
import { productsApi } from '@/api/products';
import { dictionariesApi } from '@/api/dictionaries';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Pagination } from '@/components/Pagination/Pagination';
import { Chip } from '@/components/Chip/Chip';
import { useCart } from '@/hooks/useCart';
import type {
  Product,
  ProductFilter,
  Category,
  BulbType,
  BulbShape,
  Socket,
  Supplier,
} from '@/types';

type SortKey = NonNullable<ProductFilter['sort']>;

export function CatalogPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(12);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<SortKey | undefined>(undefined);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [bulbTypeIds, setBulbTypeIds] = useState<number[]>([]);
  const [shapeIds, setShapeIds] = useState<number[]>([]);
  const [socketIds, setSocketIds] = useState<number[]>([]);
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minBrightness, setMinBrightness] = useState<number | undefined>(undefined);
  const [maxBrightness, setMaxBrightness] = useState<number | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [bulbTypes, setBulbTypes] = useState<BulbType[]>([]);
  const [shapes, setShapes] = useState<BulbShape[]>([]);
  const [sockets, setSockets] = useState<Socket[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const { addItem } = useCart();

  useEffect(() => {
    dictionariesApi.listCategories().then(setCategories).catch(() => {});
    dictionariesApi.listBulbTypes().then(setBulbTypes).catch(() => {});
    dictionariesApi.listShapes().then(setShapes).catch(() => {});
    dictionariesApi.listSockets().then(setSockets).catch(() => {});
    dictionariesApi.listSuppliers().then(setSuppliers).catch(() => {});
  }, []);

  const params: ProductFilter = useMemo(
    () => ({
      page,
      size,
      search: search || undefined,
      sort,
      categoryId,
      bulbTypeIds: bulbTypeIds.length ? bulbTypeIds : undefined,
      shapeIds: shapeIds.length ? shapeIds : undefined,
      socketIds: socketIds.length ? socketIds : undefined,
      supplierId,
      minPrice,
      maxPrice,
      minBrightness,
      maxBrightness,
      inStockOnly: inStockOnly || undefined,
    }),
    [
      page,
      size,
      search,
      sort,
      categoryId,
      bulbTypeIds,
      shapeIds,
      socketIds,
      supplierId,
      minPrice,
      maxPrice,
      minBrightness,
      maxBrightness,
      inStockOnly,
    ],
  );

  useEffect(() => {
    productsApi
      .list(params)
      .then(res => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      });
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const toggleArr = (arr: number[], v: number): number[] =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <div className="catalog-page">
      <aside className="catalog-sidebar">
        <h3>Фильтры</h3>

        <div className="filter-block">
          <label>
            Категория
            <select
              value={categoryId ?? ''}
              onChange={e =>
                setCategoryId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">Все</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-block">
          <h4>Тип лампы</h4>
          {bulbTypes.map(b => (
            <label key={b.id}>
              <input
                type="checkbox"
                checked={bulbTypeIds.includes(b.id)}
                onChange={() => setBulbTypeIds(arr => toggleArr(arr, b.id))}
              />
              {b.name}
            </label>
          ))}
        </div>

        <div className="filter-block">
          <h4>Форма</h4>
          {shapes.map(s => (
            <label key={s.id}>
              <input
                type="checkbox"
                checked={shapeIds.includes(s.id)}
                onChange={() => setShapeIds(arr => toggleArr(arr, s.id))}
              />
              {s.name}
            </label>
          ))}
        </div>

        <div className="filter-block">
          <h4>Цоколь</h4>
          <div className="filter-chips">
            {sockets.map(s => (
              <Chip
                key={s.id}
                selected={socketIds.includes(s.id)}
                onToggle={() => setSocketIds(arr => toggleArr(arr, s.id))}
              >
                {s.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="filter-block">
          <h4>Яркость, лм</h4>
          <input
            type="number"
            placeholder="от"
            value={minBrightness ?? ''}
            onChange={e =>
              setMinBrightness(e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <input
            type="number"
            placeholder="до"
            value={maxBrightness ?? ''}
            onChange={e =>
              setMaxBrightness(e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>

        <div className="filter-block">
          <h4>Цена, ₽</h4>
          <input
            type="number"
            placeholder="от"
            value={minPrice ?? ''}
            onChange={e =>
              setMinPrice(e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <input
            type="number"
            placeholder="до"
            value={maxPrice ?? ''}
            onChange={e =>
              setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>

        <div className="filter-block">
          <label>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
            />
            Только в наличии
          </label>
        </div>

        <div className="filter-block">
          <label>
            Поставщик
            <select
              value={supplierId ?? ''}
              onChange={e =>
                setSupplierId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">Все</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      <section className="catalog-main">
        <div className="catalog-toolbar">
          <form onSubmit={handleSearchSubmit} className="catalog-search-form">
            <input
              type="search"
              aria-label="search"
              placeholder="Поиск"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit">Искать</button>
          </form>

          <div className="catalog-sort">
            <button type="button" onClick={() => setSort('popular')}>
              По популярности
            </button>
            <button type="button" onClick={() => setSort('priceAsc')}>
              Цена ↑
            </button>
            <button type="button" onClick={() => setSort('priceDesc')}>
              Цена ↓
            </button>
            <button type="button" onClick={() => setSort('new')}>
              Новинки
            </button>
          </div>

          <div className="catalog-view-toggle">
            <button type="button" onClick={() => setView('grid')} aria-pressed={view === 'grid'}>
              ▦
            </button>
            <button type="button" onClick={() => setView('list')} aria-pressed={view === 'list'}>
              ☰
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="catalog-empty">Ничего не найдено</div>
        ) : (
          <>
            <div className={view === 'grid' ? 'catalog-grid' : 'catalog-list'}>
              {items.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={() => addItem(p.id, 1)}
                />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
