import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchDictionaries } from '@/store/slices/productsSlice';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useCart } from '@/hooks/useCart';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { addItem } = useCart();
  const { list, listStatus, listError, dictionaries } = useAppSelector(
    (s) => s.products,
  );
  const promos = dictionaries.promos;

  useEffect(() => {
    dispatch(fetchProducts({ size: 8 }));
    dispatch(fetchDictionaries());
  }, [dispatch]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>ЛампоМаркет — освещение для дома</h1>
          <p>Большой выбор ламп и светильников по выгодным ценам.</p>
          <Link to="/catalog" className="home-hero-cta">
            Перейти в каталог
          </Link>
        </div>
      </section>

      <section className="home-promos">
        <div className="home-promos-row">
          {promos.map((p) => (
            <div key={p.id} data-testid="promo-card" className="promo-card">
              <h3>{p.name}</h3>
              <p>Скидка {p.discountPercent}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-popular">
        <h2>Популярные товары</h2>
        {listStatus === 'loading' ? (
          <div className="home-popular-loading" data-testid="home-popular-loading">
            Загрузка...
          </div>
        ) : listStatus === 'error' ? (
          <div className="home-popular-error" data-testid="home-popular-error">
            Ошибка загрузки товаров{listError ? `: ${listError}` : ''}
          </div>
        ) : (
          <div className="home-popular-grid">
            {list.map((p) => (
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
        )}
      </section>

      <section className="home-benefits">
        <div className="home-benefits-row">
          <div className="home-benefit">Доставка по всей России</div>
          <div className="home-benefit">Гарантия качества</div>
          <div className="home-benefit">Только сертифицированные товары</div>
          <div className="home-benefit">Поддержка 24/7</div>
        </div>
      </section>
    </div>
  );
}
