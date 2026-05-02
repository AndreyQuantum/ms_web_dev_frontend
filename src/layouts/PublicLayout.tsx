import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

export function PublicLayout() {
  const { itemCount } = useCart();

  return (
    <div className="public-layout">
      <header className="public-header" data-testid="public-header">
        <div className="public-header-inner">
          <Link to="/" className="public-logo">
            ЛампоМаркет
          </Link>
          <nav className="public-nav" aria-label="primary">
            <NavLink to="/" end>
              Главная
            </NavLink>
            <NavLink to="/catalog">Каталог</NavLink>
            <NavLink to="/about">О компании</NavLink>
          </nav>
          <div className="public-header-actions">
            <Link to="/cart" className="public-cart-link" aria-label="cart">
              <span className="public-cart-icon" aria-hidden="true">
                🛒
              </span>
              <span className="public-cart-label">Корзина</span>
              {itemCount > 0 ? (
                <span data-testid="cart-badge" className="public-cart-badge">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer data-testid="public-footer" className="public-footer">
        © 2026 ЛампоМаркет
      </footer>
    </div>
  );
}
