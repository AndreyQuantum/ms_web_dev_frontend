/**
 * Tests for AdminProductsPage (T15).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/products', () => ({
  productsApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
  },
}));

vi.mock('@/api/dictionaries', () => ({
  dictionariesApi: {
    listCategories: vi.fn().mockResolvedValue([{ id: 1, name: 'Cat A' }]),
    listBulbTypes: vi.fn().mockResolvedValue([{ id: 1, name: 'LED' }]),
    listShapes: vi.fn().mockResolvedValue([{ id: 1, name: 'A60' }]),
    listSockets: vi.fn().mockResolvedValue([{ id: 1, name: 'E27' }]),
    listSuppliers: vi.fn().mockResolvedValue([{ id: 1, name: 'OSRAM' }]),
    listPromos: vi.fn().mockResolvedValue([]),
  },
}));

import { productsApi } from '@/api/products';
import { AdminProductsPage } from '@/pages/AdminProductsPage/AdminProductsPage';
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

const sample = (id: string, name: string) => ({
  id,
  name,
  description: 'd',
  price: 100,
  brightnessLm: 800,
  rating: 4,
  reviewsCount: 0,
  inStock: true,
  stockQty: 10,
  isArchived: false,
  categoryId: 1,
  bulbTypeId: 1,
  bulbShapeId: 1,
  socketId: 1,
  supplierId: 1,
  imageUrl: '/x.png',
  createdAt: '2026-04-01T00:00:00.000Z',
  popularity: 0,
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminProductsPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    seedAdmin();
    (productsApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [sample('p-001', 'LED A60'), sample('p-002', 'LED G45')],
      page: 1,
      size: 10,
      total: 2,
    });
  });

  it('calls productsApi.list on mount and renders rows', async () => {
    renderPage();

    await waitFor(() => {
      expect(productsApi.list).toHaveBeenCalled();
    });

    expect(await screen.findByText(/LED A60/)).toBeInTheDocument();
    expect(await screen.findByText(/LED G45/)).toBeInTheDocument();
  });

  it('clicking "Создать товар" opens the form modal (a dialog appears)', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText(/LED A60/);

    const createBtn = screen.getByRole('button', { name: /Создать товар/i });
    await user.click(createBtn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('does NOT call productsApi.create when the form is submitted with empty name', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText(/LED A60/);

    await user.click(screen.getByRole('button', { name: /Создать товар/i }));
    const dialog = await screen.findByRole('dialog');

    // submit the form without filling `name`
    const submit = within(dialog).getByRole('button', { name: /Сохранить|Создать/i });
    await user.click(submit);

    expect(productsApi.create).not.toHaveBeenCalled();
  });
});
