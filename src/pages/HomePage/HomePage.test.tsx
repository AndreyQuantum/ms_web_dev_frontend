import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { makeStore } from '@/store';
import { HomePage } from '@/pages/HomePage/HomePage';

const apiProductListResponse = {
  data: [
    {
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
    },
    {
      id: 'u2',
      title: 'Lamp 2',
      description: '',
      price: '20.00',
      quantity: 2,
      brightness_lm: 600,
      is_archived: false,
      available_from: null,
      category_id: 1,
      bulb_type_id: 1,
      bulb_shape_id: 1,
      socket_id: 1,
      supplier_id: 1,
      promo_id: null,
      created_at: '2026-01-02T00:00:00Z',
    },
  ],
  meta: { total: 2, page: 1, size: 8 },
};

function renderHome() {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>,
  );
  return { ...utils, store };
}

// Wider mock-like type to bridge the vitest spyOn fetch overload signature.
type FetchSpy = {
  mockRestore: () => void;
  mock: { calls: unknown[][] };
};
let fetchSpy: FetchSpy | null = null;

function setupFetch(
  impl: (url: string) => Promise<Response> | Response,
): FetchSpy {
  fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input: RequestInfo | URL) => {
      const url = String(
        typeof input === 'string' || input instanceof URL ? input : input.url,
      );
      return Promise.resolve(impl(url));
    }) as unknown as FetchSpy;
  return fetchSpy;
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (body == null ? '' : JSON.stringify(body)),
    headers: new Headers(),
  } as unknown as Response;
}

beforeEach(() => {
  // Clear localStorage so cart preload doesn't pollute the products slice
  localStorage.clear();
});

afterEach(() => {
  if (fetchSpy) {
    fetchSpy.mockRestore();
    fetchSpy = null;
  }
});

describe('HomePage', () => {
  it('dispatches fetches for products and dictionary endpoints on mount', async () => {
    const spy = setupFetch((url) => {
      if (url.includes('/products')) return jsonResponse(apiProductListResponse);
      if (url.includes('/categories')) return jsonResponse([]);
      if (url.includes('/bulb-types')) return jsonResponse([]);
      if (url.includes('/bulb-shapes')) return jsonResponse([]);
      if (url.includes('/sockets')) return jsonResponse([]);
      if (url.includes('/suppliers')) return jsonResponse([]);
      if (url.includes('/promos')) return jsonResponse([]);
      return jsonResponse({}, 404);
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Lamp 1')).toBeInTheDocument();
    });

    const calledUrls = spy.mock.calls.map((c) => String(c[0]));
    expect(calledUrls.some((u) => u.includes('/products'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/categories'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/bulb-types'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/bulb-shapes'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/sockets'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/suppliers'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/promos'))).toBe(true);
  });

  it('shows a loading indicator before products resolve', async () => {
    let resolveProducts: ((res: Response) => void) = () => {};
    const productsPromise = new Promise<Response>((resolve) => {
      resolveProducts = resolve;
    });

    setupFetch((url) => {
      if (url.includes('/products')) return productsPromise;
      return jsonResponse([]);
    });

    renderHome();

    expect(screen.getByTestId('home-popular-loading')).toBeInTheDocument();
    expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

    // Resolve the pending products fetch so React/redux clean up cleanly.
    resolveProducts(jsonResponse(apiProductListResponse));
    await waitFor(() => {
      expect(screen.queryByTestId('home-popular-loading')).not.toBeInTheDocument();
    });
  });

  it('renders product names from the mocked products response on success', async () => {
    setupFetch((url) => {
      if (url.includes('/products')) return jsonResponse(apiProductListResponse);
      return jsonResponse([]);
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Lamp 1')).toBeInTheDocument();
      expect(screen.getByText('Lamp 2')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
  });

  it('renders an error message and no product cards when the products fetch rejects', async () => {
    setupFetch((url) => {
      if (url.includes('/products')) return jsonResponse({ message: 'boom' }, 500);
      return jsonResponse([]);
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/ошиб/i)).toBeInTheDocument();
    });
    expect(screen.queryAllByTestId('product-card')).toHaveLength(0);
  });
});
