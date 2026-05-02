/**
 * Tests for `<RequireAdmin>` (T5).
 *
 * Persistence contract (must match `useAuth` from T5):
 *   localStorage key: 'lm_admin_token'
 *   value: JSON.stringify({
 *     token: string,
 *     user: { login: string, role: 'admin' }
 *   })
 *
 * Behaviour under test:
 *   - When unauthenticated, `<RequireAdmin>` renders <Navigate to="/admin/login" replace />.
 *   - When authenticated as role 'admin', it renders its children.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/hooks/useAuth';
import { RequireAdmin } from '@/components/RequireAdmin';

const STORAGE_KEY = 'lm_admin_token';

function buildRouter(initialEntry: string) {
  return createMemoryRouter(
    [
      {
        path: '/admin',
        element: (
          <RequireAdmin>
            <div>SECRET</div>
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/login',
        element: <div>LOGIN</div>,
      },
    ],
    { initialEntries: [initialEntry] }
  );
}

describe('<RequireAdmin>', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users from /admin to /admin/login', () => {
    const router = buildRouter('/admin');

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    );

    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });

  it('renders children when localStorage holds a valid admin session', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: 't',
        user: { login: 'admin', role: 'admin' },
      })
    );

    const router = buildRouter('/admin');

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    );

    expect(screen.getByText('SECRET')).toBeInTheDocument();
    expect(screen.queryByText('LOGIN')).not.toBeInTheDocument();
  });
});
