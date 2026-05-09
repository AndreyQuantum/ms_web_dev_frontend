import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { makeStore } from '@/store';
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage';

// --- helpers --------------------------------------------------------------

function makeApiProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    title: 'Lamp 1',
    description: '',
    price: '10.00',
    quantity: 5,
    brightness_lm: 800,
    is_archived: false,
    available_from: null,
    category_id: 1,
    bulb_type_id: 1,
    bulb_shape_id: 1,
    socket_id: 1,
    supplier_id: 1,
    promo_id: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function productsResponseBody(
  items: ReturnType<typeof makeApiProduct>[],
  page = 1,
  size = 12,
  total?: number,
) {
  return {
    data: items,
    meta: { total: total ?? items.length, page, size },
  };
}

// vitest's default `ReturnType<typeof vi.spyOn>` has an unknown signature
// shape; the actual fetch spy carries the real fetch overload signature.
// Use a wider mock-like type so we can assign without TS complaining.
type FetchSpy = {
  mockRestore: () => void;
  mock: { calls: unknown[][] };
};
let fetchSpy: FetchSpy | null = null;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (body == null ? '' : JSON.stringify(body)),
    headers: new Headers(),
  } as unknown as Response;
}

interface RouteMap {
  productsList?: unknown;
  productsListImpl?: (url: string) => unknown;
  categories?: unknown;
  bulbTypes?: unknown;
  bulbShapes?: unknown;
  sockets?: unknown;
  suppliers?: unknown;
  promos?: unknown;
}

function setupRoutedFetch(routes: RouteMap): FetchSpy {
  fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input: RequestInfo | URL) => {
      const url = String(
        typeof input === 'string' || input instanceof URL ? input : input.url,
      );
      // IMPORTANT: dictionary endpoints (e.g. /api/products/categories) ALSO contain
      // the substring "/products". Match the more-specific dict paths first.
      if (url.includes('/categories'))
        return Promise.resolve(jsonResponse(routes.categories ?? []));
      if (url.includes('/bulb-types'))
        return Promise.resolve(jsonResponse(routes.bulbTypes ?? []));
      if (url.includes('/bulb-shapes'))
        return Promise.resolve(jsonResponse(routes.bulbShapes ?? []));
      if (url.includes('/sockets'))
        return Promise.resolve(jsonResponse(routes.sockets ?? []));
      if (url.includes('/suppliers'))
        return Promise.resolve(jsonResponse(routes.suppliers ?? []));
      if (url.includes('/promos'))
        return Promise.resolve(jsonResponse(routes.promos ?? []));
      // Anything else under /products goes to the products list.
      if (url.includes('/products')) {
        const body = routes.productsListImpl
          ? routes.productsListImpl(url)
          : (routes.productsList ?? productsResponseBody([]));
        return Promise.resolve(jsonResponse(body));
      }
      return Promise.resolve(jsonResponse({}, 404));
    }) as unknown as FetchSpy;
  return fetchSpy;
}

function getFetchMock(): FetchSpy {
  if (!fetchSpy) {
    throw new Error('fetch spy not initialised — call setupRoutedFetch first');
  }
  return fetchSpy;
}

function renderCatalog() {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </Provider>,
  );
  return { ...utils, store };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  if (fetchSpy) {
    fetchSpy.mockRestore();
    fetchSpy = null;
  }
});

// --- tests ----------------------------------------------------------------

describe('CatalogPage', () => {
  it('on mount fetches /products with page=1 and dispatches all dictionary fetches', async () => {
    const spy = setupRoutedFetch({
      productsList: productsResponseBody([
        makeApiProduct({ id: 'u1', title: 'Alpha' }),
      ]),
    });

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    const calledUrls = spy.mock.calls.map((c) => String(c[0]));
    // The products list call should include page=1.
    expect(
      calledUrls.some(
        (u) =>
          u.includes('/products') &&
          !u.includes('/categories') &&
          !u.includes('/bulb-types') &&
          !u.includes('/bulb-shapes') &&
          !u.includes('/sockets') &&
          !u.includes('/suppliers') &&
          !u.includes('/promos') &&
          u.includes('page=1'),
      ),
    ).toBe(true);
    expect(calledUrls.some((u) => u.includes('/categories'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/bulb-types'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/bulb-shapes'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/sockets'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/suppliers'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/promos'))).toBe(true);
  });

  it('changing the category filter re-fetches /products with category_id=2 in URL', async () => {
    const spy = setupRoutedFetch({
      productsList: productsResponseBody([
        makeApiProduct({ id: 'u1', title: 'Alpha' }),
      ]),
      categories: [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' },
      ],
    });

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    // Wait for the dictionaries fetch to populate the <select> with category options.
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Two' })).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox', { name: /Категория/i });
    fireEvent.change(select, { target: { value: '2' } });

    await waitFor(() => {
      const productCalls = spy.mock.calls
        .map((c) => String(c[0]))
        .filter(
          (u) =>
            u.includes('/products') &&
            !u.includes('/categories') &&
            !u.includes('/bulb-types') &&
            !u.includes('/bulb-shapes') &&
            !u.includes('/sockets') &&
            !u.includes('/suppliers') &&
            !u.includes('/promos'),
        );
      expect(productCalls.some((u) => u.includes('category_id=2'))).toBe(true);
    });
  });

  it('typing "alp" in search filters loaded items client-side WITHOUT a new fetch', async () => {
    setupRoutedFetch({
      productsList: productsResponseBody([
        makeApiProduct({ id: 'u1', title: 'Alpha' }),
        makeApiProduct({ id: 'u2', title: 'Beta' }),
        makeApiProduct({ id: 'u3', title: 'Gamma' }),
      ]),
    });

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    const fetchCallsBefore = getFetchMock().mock.calls.length;

    const input = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(input, { target: { value: 'alp' } });

    await waitFor(() => {
      expect(screen.queryByText('Beta')).not.toBeInTheDocument();
      expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    expect(getFetchMock().mock.calls.length).toBe(fetchCallsBefore);
  });

  it('clicking next page re-fetches /products with page=2', async () => {
    // Server returns 24 items total so totalPages = ceil(24 / 12) = 2.
    const items = Array.from({ length: 12 }, (_, i) =>
      makeApiProduct({ id: `u${i + 1}`, title: `Lamp ${i + 1}` }),
    );

    const spy = setupRoutedFetch({
      productsListImpl: (url) => ({
        data: items,
        meta: { total: 24, page: url.includes('page=2') ? 2 : 1, size: 12 },
      }),
    });

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Lamp 1')).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      const productCalls = spy.mock.calls
        .map((c) => String(c[0]))
        .filter(
          (u) =>
            u.includes('/products') &&
            !u.includes('/categories') &&
            !u.includes('/bulb-types') &&
            !u.includes('/bulb-shapes') &&
            !u.includes('/sockets') &&
            !u.includes('/suppliers') &&
            !u.includes('/promos'),
        );
      expect(productCalls.some((u) => u.includes('page=2'))).toBe(true);
    });
  });

  it('shows "Ничего не найдено" when /products returns 0 items', async () => {
    setupRoutedFetch({
      productsList: productsResponseBody([], 1, 12, 0),
    });

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText(/Ничего не найдено/i)).toBeInTheDocument();
    });
  });
});
