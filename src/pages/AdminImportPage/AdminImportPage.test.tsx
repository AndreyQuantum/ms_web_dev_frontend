import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/products', () => ({
  productsApi: {
    list: vi.fn().mockResolvedValue({ items: [], page: 1, size: 10, total: 0 }),
    create: vi.fn(),
  },
}));

import { AdminImportPage } from '@/pages/AdminImportPage/AdminImportPage';
import { AuthProvider } from '@/hooks/useAuth';

function seedAdmin() {
  localStorage.setItem(
    'lm_admin_token',
    JSON.stringify({
      token: 't',
      user: { login: 'admin', role: 'admin' },
    }),
  );
}

describe('AdminImportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    seedAdmin();
  });

  it('renders the dropzone when authed as admin', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminImportPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('import-dropzone')).toBeInTheDocument();
  });
});
