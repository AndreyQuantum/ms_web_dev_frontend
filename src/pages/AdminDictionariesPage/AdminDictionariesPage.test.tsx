import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/dictionaries', () => ({
  dictionariesApi: {
    listCategories: vi.fn().mockResolvedValue([]),
    listBulbTypes: vi.fn().mockResolvedValue([]),
    listShapes: vi.fn().mockResolvedValue([]),
    listSockets: vi.fn().mockResolvedValue([]),
    listSuppliers: vi.fn().mockResolvedValue([]),
    listPromos: vi.fn().mockResolvedValue([]),
    createCategory: vi.fn(),
    createBulbType: vi.fn(),
    createShape: vi.fn(),
    createSocket: vi.fn().mockResolvedValue({ id: 99, name: 'E40' }),
    createSupplier: vi.fn(),
    createPromo: vi.fn(),
    deleteCategory: vi.fn(),
    deleteBulbType: vi.fn(),
    deleteShape: vi.fn(),
    deleteSocket: vi.fn(),
    deleteSupplier: vi.fn(),
    deletePromo: vi.fn(),
  },
}));

import { dictionariesApi } from '@/api/dictionaries';
import { AdminDictionariesPage } from '@/pages/AdminDictionariesPage/AdminDictionariesPage';
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

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminDictionariesPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminDictionariesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    seedAdmin();
  });

  it('renders 6 tab triggers with the expected labels', async () => {
    renderPage();

    expect(await screen.findByRole('tab', { name: /Типы ламп/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Формы/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Цоколи/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Категории/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Поставщики/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Промо/ })).toBeInTheDocument();

    expect(screen.getAllByRole('tab')).toHaveLength(6);
  });

  it('switching to "Цоколи" and submitting "E40" calls dictionariesApi.createSocket', async () => {
    const user = userEvent.setup();
    renderPage();

    const socketsTab = await screen.findByRole('tab', { name: /Цоколи/ });
    await user.click(socketsTab);

    const input = await screen.findByLabelText(/название/i);
    await user.clear(input);
    await user.type(input, 'E40');

    const submit = screen.getByRole('button', { name: /Добавить|Сохранить|Создать/i });
    await user.click(submit);

    await waitFor(() => {
      expect(dictionariesApi.createSocket).toHaveBeenCalledTimes(1);
    });
    expect(dictionariesApi.createSocket).toHaveBeenCalledWith({ name: 'E40' });
  });
});
