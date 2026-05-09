import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProducts,
  fetchDictionaries,
} from '@/store/slices/productsSlice';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Pagination } from '@/components/Pagination/Pagination';
import { Chip } from '@/components/Chip/Chip';
import { useCart } from '@/hooks/useCart';
import type { ProductFilter } from '@/types';

type SortKey = NonNullable<ProductFilter['sort']>;

export function CatalogPage() {
  const dispatch = useAppDispatch();
  const { list, total, listStatus, listError, dictionaries } = useAppSelector(
    (s) => s.products,
  );
  const { categories, bulbTypes, shapes, sockets, suppliers } = dictionaries;

  const [page, setPage] = useState(1);
  const [size] = useState(12);
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

  const { addItem } = useCart();

  // Backend-supported params only.
  useEffect(() => {
    dispatch(fetchProducts({ categoryId, page, size }));
  }, [dispatch, categoryId, page, size]);

  useEffect(() => {
    dispatch(fetchDictionaries());
  }, [dispatch]);

  // Client-side filters + sort applied on the loaded `list`.
  const filteredItems = useMemo(() => {
    let r = list;

    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (minPrice !== undefined) r = r.filter((p) => p.price >= minPrice);
    if (maxPrice !== undefined) r = r.filter((p) => p.price <= maxPrice);
    if (minBrightness !== undefined)
      r = r.filter((p) => p.brightnessLm >= minBrightness);
    if (maxBrightness !== undefined)
      r = r.filter((p) => p.brightnessLm <= maxBrightness);
    if (bulbTypeIds.length)
      r = r.filter((p) => bulbTypeIds.includes(p.bulbTypeId));
    if (shapeIds.length)
      r = r.filter((p) => shapeIds.includes(p.bulbShapeId));
    if (socketIds.length)
      r = r.filter((p) => socketIds.includes(p.socketId));
    if (supplierId !== undefined)
      r = r.filter((p) => p.supplierId === supplierId);
    if (inStockOnly) r = r.filter((p) => p.inStock);

    if (sort === 'priceAsc') r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === 'priceDesc') r = [...r].sort((a, b) => b.price - a.price);
    else if (sort === 'popular')
      r = [...r].sort((a, b) => b.popularity - a.popularity);
    else if (sort === 'new')
      r = [...r].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return r;
  }, [
    list,
    search,
    minPrice,
    maxPrice,
    minBrightness,
    maxBrightness,
    bulbTypeIds,
    shapeIds,
    socketIds,
    supplierId,
    inStockOnly,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchInput(v);
    setSearch(v);
  };

  const toggleArr = (arr: number[], v: number): number[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="catalog-page">
      <aside className="catalog-sidebar">
        <h3>Фильтры</h3>

        <div className="filter-block">
          <label>
            Категория
            <select
              value={categoryId ?? ''}
              onChange={(e) => {
                setPage(1);
                setCategoryId(
                  e.target.value ? Number(e.target.value) : undefined,
                );
              }}
            >
              <option value="">Все</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-block">
          <h4>Тип лампы</h4>
          {bulbTypes.map((b) => (
            <label key={b.id}>
              <input
                type="checkbox"
                checked={bulbTypeIds.includes(b.id)}
                onChange={() => setBulbTypeIds((arr) => toggleArr(arr, b.id))}
              />
              {b.name}
            </label>
          ))}
        </div>

        <div className="filter-block">
          <h4>Форма</h4>
          {shapes.map((s) => (
            <label key={s.id}>
              <input
                type="checkbox"
                checked={shapeIds.includes(s.id)}
                onChange={() => setShapeIds((arr) => toggleArr(arr, s.id))}
              />
              {s.name}
            </label>
          ))}
        </div>

        <div className="filter-block">
          <h4>Цоколь</h4>
          <div className="filter-chips">
            {sockets.map((s) => (
              <Chip
                key={s.id}
                selected={socketIds.includes(s.id)}
                onToggle={() => setSocketIds((arr) => toggleArr(arr, s.id))}
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
            onChange={(e) =>
              setMinBrightness(e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <input
            type="number"
            placeholder="до"
            value={maxBrightness ?? ''}
            onChange={(e) =>
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
            onChange={(e) =>
              setMinPrice(e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <input
            type="number"
            placeholder="до"
            value={maxPrice ?? ''}
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>

        <div className="filter-block">
          <label>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            Только в наличии
          </label>
        </div>

        <div className="filter-block">
          <label>
            Поставщик
            <select
              value={supplierId ?? ''}
              onChange={(e) =>
                setSupplierId(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            >
              <option value="">Все</option>
              {suppliers.map((s) => (
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
              onChange={handleSearchChange}
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
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
            >
              ▦
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
            >
              ☰
            </button>
          </div>
        </div>

        {listStatus === 'loading' ? (
          <div
            className="catalog-loading"
            data-testid="catalog-loading"
          >
            Загрузка...
          </div>
        ) : listStatus === 'error' ? (
          <div className="catalog-error" data-testid="catalog-error">
            Ошибка загрузки товаров{listError ? `: ${listError}` : ''}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="catalog-empty">Ничего не найдено</div>
        ) : (
          <>
            <div className={view === 'grid' ? 'catalog-grid' : 'catalog-list'}>
              {filteredItems.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={() =>
                    addItem(p.id, 1, {
                      name: p.name,
                      price: p.price,
                      oldPrice: p.oldPrice,
                      imageUrl: p.imageUrl,
                    })
                  }
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
