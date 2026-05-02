/**
 * Tests for AdminLoginPage (T13).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
  },
  login: vi.fn(),
}));

import { authApi } from '@/api/auth';
import { AdminLoginPage } from '@/pages/AdminLoginPage/AdminLoginPage';
import { AuthProvider } from '@/hooks/useAuth';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminLoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login + password inputs and a "Войти" button', () => {
    renderLogin();

    expect(screen.getByLabelText(/логин/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
  });

  it('does NOT call authApi.login when submitted with empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /Войти/i }));

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('calls authApi.login with admin/admin and persists a non-empty token', async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      token: 'mock-token',
      user: { login: 'admin', role: 'admin' },
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/логин/i), 'admin');
    await user.type(screen.getByLabelText(/пароль/i), 'admin');
    await user.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        login: 'admin',
        password: 'admin',
      });
    });

    await waitFor(() => {
      const stored = localStorage.getItem('lm_admin_token');
      expect(stored).toBeTruthy();
      expect(stored?.length).toBeGreaterThan(0);
    });
  });
});
