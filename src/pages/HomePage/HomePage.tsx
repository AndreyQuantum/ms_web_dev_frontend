import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { dictionariesApi } from '@/api/dictionaries';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useCart } from '@/hooks/useCart';
import type { Product, Promo } from '@/types';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    productsApi
      .list({ sort: 'popular', size: 8, page: 1 })
      .then(res => setProducts(res.items))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    dictionariesApi
      .listPromos()
      .then(res => setPromos(res))
      .catch(() => setPromos([]));
  }, []);

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
          {promos.map(p => (
            <div key={p.id} data-testid="promo-card" className="promo-card">
              <h3>{p.name}</h3>
              <p>Скидка {p.discountPercent}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-popular">
        <h2>Популярные товары</h2>
        <div className="home-popular-grid">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={() => addItem(p.id, 1)}
            />
          ))}
        </div>
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
