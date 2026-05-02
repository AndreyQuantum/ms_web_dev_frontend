import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { reviewsApi } from '@/api/reviews';
import { Stars } from '@/components/Stars/Stars';
import { Button } from '@/components/Button/Button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/format';
import type { Product, Review } from '@/types';

type Tab = 'specs' | 'description' | 'reviews';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<Tab>('specs');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate async fetch: reset error and load product when `id` changes
    setError(null);
    productsApi
      .getById(id)
      .then(p => setProduct(p))
      .catch(() => setError('Товар не найден'));
  }, [id]);

  useEffect(() => {
    if (tab !== 'reviews' || !id) return;
    reviewsApi
      .listByProduct(id)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [tab, id]);

  if (error) {
    return <div className="product-page-error">Товар не найден</div>;
  }

  if (!product) {
    return <div className="product-page-loading">Загрузка...</div>;
  }

  const thumbs = product.thumbnails && product.thumbnails.length > 0
    ? product.thumbnails
    : [product.imageUrl];
  const mainSrc = thumbs[activeImage] ?? product.imageUrl;

  const handleAdd = () => {
    addItem(product.id, qty);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewAuthor.trim() || !reviewText.trim()) return;
    const created = await reviewsApi.create({
      productId: id,
      author: reviewAuthor,
      rating: reviewRating,
      text: reviewText,
    });
    setReviews(prev => [...prev, created]);
    setReviewAuthor('');
    setReviewText('');
    setReviewRating(5);
  };

  return (
    <div className="product-page">
      <div className="product-main">
        <div className="product-gallery">
          <img
            className="product-gallery-main"
            src={mainSrc}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="product-gallery-thumbs">
            {thumbs.map((src, i) => (
              <button
                key={i}
                type="button"
                className="product-gallery-thumb"
                onClick={() => setActiveImage(i)}
                aria-label={`thumbnail-${i}`}
              >
                <img
                  src={src}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="product-rating">
            <Stars value={product.rating} />
            <span>({product.reviewsCount})</span>
          </div>
          <div className="product-price">{formatPrice(product.price)}</div>

          <div className="product-qty">
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>
              -
            </button>
            <span data-testid="product-qty">{qty}</span>
            <button type="button" onClick={() => setQty(q => q + 1)}>
              +
            </button>
          </div>

          <Button onClick={handleAdd} disabled={!product.inStock}>
            В корзину
          </Button>
        </div>
      </div>

      <div className="product-tabs">
        <div role="tablist">
          <button
            role="tab"
            type="button"
            aria-selected={tab === 'specs'}
            onClick={() => setTab('specs')}
          >
            Характеристики
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={tab === 'description'}
            onClick={() => setTab('description')}
          >
            Описание
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={tab === 'reviews'}
            onClick={() => setTab('reviews')}
          >
            Отзывы
          </button>
        </div>

        <div className="product-tab-panel">
          {tab === 'specs' ? (
            <ul className="product-specs">
              <li>Яркость: {product.brightnessLm} лм</li>
              {product.power !== undefined ? <li>Мощность: {product.power} Вт</li> : null}
              <li>В наличии: {product.stockQty} шт</li>
            </ul>
          ) : null}
          {tab === 'description' ? <p>{product.description}</p> : null}
          {tab === 'reviews' ? (
            <div className="product-reviews">
              <ul>
                {reviews.map(r => (
                  <li key={r.id} className="product-review">
                    <strong>{r.author}</strong>
                    <Stars value={r.rating} />
                    <p>{r.text}</p>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmitReview} className="review-form">
                <label>
                  Имя
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={e => setReviewAuthor(e.target.value)}
                  />
                </label>
                <label>
                  Оценка
                  <Stars value={reviewRating} onChange={setReviewRating} />
                </label>
                <label>
                  Текст
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />
                </label>
                <Button type="submit">Отправить отзыв</Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
