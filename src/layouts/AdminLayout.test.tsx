import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'lm_admin_token';

const ChildStub = () => <div data-testid="admin-child-stub">child</div>;

const RoleProbe = () => {
  const { role } = useAuth();
  return <div data-testid="role-probe">{role ?? 'null'}</div>;
};

function buildRouter() {
  return createMemoryRouter(
    [
      {
        path: '/admin',
        element: (
          <>
            <AdminLayout />
            <RoleProbe />
          </>
        ),
        children: [{ index: true, element: <ChildStub /> }],
      },
      { path: '/admin/login', element: <div>LOGIN</div> },
    ],
    { initialEntries: ['/admin'] }
  );
}

function seedAdmin() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: 't',
      user: { login: 'admin', role: 'admin' },
    })
  );
}

const renderLayout = () =>
  render(
    <AuthProvider>
      <RouterProvider router={buildRouter()} />
    </AuthProvider>
  );

describe('<AdminLayout>', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders sidebar nav links (Дашборд / Товары / Импорт / Справочники)', () => {
    seedAdmin();
    renderLayout();

    const dash = screen.getByRole('link', { name: /Дашборд/i });
    expect(dash).toHaveAttribute('href', '/admin');

    const products = screen.getByRole('link', { name: /Товары/i });
    expect(products).toHaveAttribute('href', '/admin/products');

    const importLink = screen.getByRole('link', { name: /Импорт/i });
    expect(importLink).toHaveAttribute('href', '/admin/import');

    const dictionaries = screen.getByRole('link', { name: /Справочники/i });
    expect(dictionaries).toHaveAttribute('href', '/admin/dictionaries');
  });

  it('clicking the logout button clears auth (role becomes null)', async () => {
    const user = userEvent.setup();
    seedAdmin();
    renderLayout();

    expect(screen.getByTestId('role-probe').textContent).toBe('admin');

    const logoutBtn = screen.getByRole('button', { name: /Выход|Выйти/i });
    await user.click(logoutBtn);

    expect(screen.getByTestId('role-probe').textContent).toBe('null');
  });

  it('renders the admin sidebar element (data-testid="admin-sidebar")', () => {
    seedAdmin();
    renderLayout();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
  });

  it('renders the <Outlet /> child content', () => {
    seedAdmin();
    renderLayout();
    expect(screen.getByTestId('admin-child-stub')).toBeInTheDocument();
  });
});
