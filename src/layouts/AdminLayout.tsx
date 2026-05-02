import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button/Button';

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside
        data-testid="admin-sidebar"
        className="admin-sidebar"
        style={{ background: 'var(--lm-color-sidebar)', color: '#fff' }}
      >
        <div className="admin-sidebar-brand">ЛампоМаркет — Админка</div>
        <nav className="admin-nav" aria-label="admin">
          <NavLink to="/admin" end>
            Дашборд
          </NavLink>
          <NavLink to="/admin/products">Товары</NavLink>
          <NavLink to="/admin/import">Импорт</NavLink>
          <NavLink to="/admin/dictionaries">Справочники</NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <Button variant="ghost" onClick={logout}>
            Выход
          </Button>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-topbar" data-testid="admin-topbar">
          <div className="admin-topbar-spacer" />
          <div className="admin-topbar-user">
            <div className="admin-avatar" aria-hidden="true">
              {user?.login?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="admin-topbar-email">{user?.login ?? ''}</span>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
