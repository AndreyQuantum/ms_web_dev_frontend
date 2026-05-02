import { Link } from 'react-router-dom';
import type { Product } from '@/types/product';
import { Button } from '@/components/Button/Button';
import { Stars } from '@/components/Stars/Stars';
import { formatPrice } from '@/utils/format';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (p: Product) => void;
  onWishlist?: (p: Product) => void;
}

export function ProductCard({ product, onAddToCart, onWishlist }: ProductCardProps) {
  const handleAdd = () => {
    if (onAddToCart) onAddToCart(product);
  };

  const handleWishlist = () => {
    if (onWishlist) onWishlist(product);
  };

  const hasOldPrice = product.oldPrice && product.oldPrice > product.price;

  return (
    <article className="product-card" data-testid="product-card" data-product-id={product.id}>
      <Link to={`/product/${product.id}`} className="product-card-image-link">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
        ) : (
          <div className="product-card-image product-card-image-placeholder" aria-hidden="true" />
        )}
      </Link>

      <div className="product-card-badges">
        {product.isNew ? <span className="badge badge-new">Новинка</span> : null}
        {hasOldPrice ? <span className="badge badge-sale">Скидка</span> : null}
        {!product.inStock ? (
          <span className="badge badge-oos">Нет в наличии</span>
        ) : null}
      </div>

      <Link to={`/product/${product.id}`} className="product-card-name">
        <h3>{product.name}</h3>
      </Link>

      <div className="product-card-rating">
        <Stars value={product.rating} />
        <span className="product-card-reviews">({product.reviewsCount})</span>
      </div>

      <div className="product-card-price">
        <span className="product-card-price-current">{formatPrice(product.price)}</span>
        {hasOldPrice ? (
          <span className="product-card-price-old">{formatPrice(product.oldPrice!)}</span>
        ) : null}
      </div>

      <div className="product-card-actions">
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={!product.inStock}
        >
          В корзину
        </Button>
        {onWishlist ? (
          <Button variant="ghost" onClick={handleWishlist} aria-label="wishlist">
            ♡
          </Button>
        ) : null}
      </div>
    </article>
  );
}
