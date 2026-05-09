import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById } from '@/store/slices/productsSlice';
import { fetchReviews, createReview } from '@/store/slices/reviewsSlice';
import { Stars } from '@/components/Stars/Stars';
import { Button } from '@/components/Button/Button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/format';

type Tab = 'specs' | 'description' | 'reviews';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const dispatch = useAppDispatch();

  const product = useAppSelector((s) =>
    id ? s.products.currentById[id] : undefined,
  );
  const productStatus = useAppSelector((s) => s.products.currentStatus);
  const productError = useAppSelector((s) => s.products.currentError);

  const reviewBucket = useAppSelector((s) =>
    id ? s.reviews.byProductId[id] : undefined,
  );
  const reviews = reviewBucket?.items ?? [];
  const reviewsStatus = reviewBucket?.status ?? 'idle';

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<Tab>('specs');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (id && tab === 'reviews' && reviewsStatus === 'idle') {
      dispatch(fetchReviews(id));
    }
  }, [dispatch, id, tab, reviewsStatus]);

  if (productStatus === 'error' || productError) {
    return <div className="product-page-error">Товар не найден</div>;
  }

  if (!product || productStatus === 'loading' || productStatus === 'idle') {
    return <div className="product-page-loading">Загрузка...</div>;
  }

  const thumbs =
    product.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails
      : [product.imageUrl];
  const mainSrc = thumbs[activeImage] ?? product.imageUrl;

  const handleAdd = () => {
    addItem(product.id, qty, {
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      imageUrl: product.imageUrl,
    });
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !reviewText.trim()) return;
    setReviewSubmitError(null);
    try {
      await dispatch(
        createReview({
          productId: id,
          rating: reviewRating,
          text: reviewText,
        }),
      ).unwrap();
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      setReviewSubmitError(
        err instanceof Error ? err.message : 'Не удалось отправить отзыв',
      );
    }
  };

  return (
    <div className="product-page">
      <div className="product-main">
        <div className="product-gallery">
          <div className="product-gallery-main-wrap">
            <img
              className="product-gallery-main"
              src={mainSrc}
              alt={product.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
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
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              -
            </button>
            <span data-testid="product-qty">{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)}>
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
                {reviews.map((r) => (
                  <li key={r.id} className="product-review">
                    <strong>{r.author}</strong>
                    <Stars value={r.rating} />
                    <p>{r.text}</p>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmitReview} className="review-form">
                <label>
                  Оценка
                  <Stars value={reviewRating} onChange={setReviewRating} />
                </label>
                <label>
                  Текст
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </label>
                <Button type="submit">Отправить отзыв</Button>
                {reviewSubmitError ? (
                  <div role="alert" className="review-form-error">
                    {reviewSubmitError}
                  </div>
                ) : null}
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
