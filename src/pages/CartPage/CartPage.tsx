import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/Button/Button';
import { formatPrice } from '@/utils/format';

export function CartPage() {
  const { items, subtotal, discount, total, removeItem, setQty, getProduct } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page cart-page-empty">
        <h1>Корзина</h1>
        <p>Корзина пуста</p>
        <Link to="/catalog">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>

      <div className="cart-layout">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Кол-во</th>
              <th>Сумма</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const p = getProduct(item.productId);
              const price = p?.price ?? 0;
              const lineTotal = price * item.qty;
              return (
                <tr key={item.productId} data-testid="cart-row" className="cart-row">
                  <td className="cart-cell-product">
                    {p?.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name ?? item.productId} className="cart-thumb" />
                    ) : null}
                    <span>{p?.name ?? item.productId}</span>
                  </td>
                  <td className="cart-cell-qty">
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, Math.max(1, item.qty - 1))}
                      aria-label="decrement"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty + 1)}
                      aria-label="increment"
                    >
                      +
                    </button>
                  </td>
                  <td className="cart-cell-total">{formatPrice(lineTotal)}</td>
                  <td className="cart-cell-actions">
                    <Button
                      variant="ghost"
                      onClick={() => removeItem(item.productId)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <aside className="cart-summary">
          <h2>Итого</h2>
          <div className="cart-summary-row">
            <span>Сумма:</span>
            <span data-testid="cart-subtotal">{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Скидка:</span>
            <span data-testid="cart-discount">{formatPrice(discount)}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>К оплате:</span>
            <span data-testid="cart-total">{formatPrice(total)}</span>
          </div>
          <Link to="/checkout">
            <Button>Оформить заказ</Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
