import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithStore';
import { makeStore } from '@/store';
import { ProductPage } from '@/pages/ProductPage/ProductPage';

const apiProduct = {
  id: 'u1',
  title: 'Lamp',
  description: 'D',
  price: '12.00',
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
};

const apiReviews = [
  {
    id: 'r1',
    product_id: 'u1',
    text: 'good',
    rating: 5,
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'r2',
    product_id: 'u1',
    text: 'meh',
    rating: 3,
    created_at: '2026-01-03T00:00:00Z',
  },
];

interface MockCall {
  url: string;
  init?: RequestInit;
}

// Wider mock-like type to bridge the vitest spyOn fetch overload signature.
type FetchSpy = {
  mockRestore: () => void;
  mock: { calls: unknown[][] };
};

let calls: MockCall[];
let fetchSpy: FetchSpy;

function buildResponse(body: unknown, status = 200): Response {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers(),
  };
  return response as unknown as Response;
}

function installRouter(handler: (url: string, init?: RequestInit) => Response) {
  fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      calls.push({ url, init });
      return handler(url, init);
    }) as unknown as FetchSpy;
}

function defaultHandler(url: string): Response {
  if (url.includes('/products/u1')) return buildResponse(apiProduct);
  if (url.includes('/reviews?product_id=u1')) return buildResponse(apiReviews);
  if (url.endsWith('/reviews') || url.match(/\/reviews$/)) {
    // POST /reviews
    return buildResponse({
      id: 'r-new',
      product_id: 'u1',
      text: 'good',
      rating: 5,
      created_at: '2026-01-04T00:00:00Z',
    });
  }
  return buildResponse({}, 404);
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>,
    {
      route: '/product/u1',
      store: makeStore() as unknown as ReturnType<
        typeof import('@/test/renderWithStore').makeStore
      >,
    },
  );
}

describe('ProductPage (Redux thunks)', () => {
  beforeEach(() => {
    calls = [];
    installRouter(defaultHandler);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('fetches the product on mount (GET /products/u1)', async () => {
    renderPage();

    await waitFor(() => {
      expect(
        calls.some((c) => /\/products\/u1$/.test(c.url)),
      ).toBe(true);
    });
  });

  it('renders product name and details', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: /Lamp/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Яркость:\s*800/)).toBeInTheDocument();
  });

  it('Reviews tab fetches reviews and renders 2 anonymous items', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: /Lamp/ });

    const reviewsTab = await screen.findByRole('tab', { name: /Отзывы/ });
    await user.click(reviewsTab);

    await waitFor(() => {
      expect(
        calls.some((c) => /\/reviews\?product_id=u1/.test(c.url)),
      ).toBe(true);
    });

    expect(await screen.findByText(/good/)).toBeInTheDocument();
    expect(screen.getByText(/meh/)).toBeInTheDocument();

    const anon = screen.getAllByText('Аноним');
    expect(anon).toHaveLength(2);
  });

  it('review form has NO author input', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: /Lamp/ });

    const reviewsTab = await screen.findByRole('tab', { name: /Отзывы/ });
    await user.click(reviewsTab);

    await screen.findByText(/good/);

    expect(screen.queryByLabelText(/имя|author/i)).toBeNull();
  });

  it('submitting valid review POSTs /reviews without author key', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: /Lamp/ });

    const reviewsTab = await screen.findByRole('tab', { name: /Отзывы/ });
    await user.click(reviewsTab);

    await screen.findByText(/good/);

    const textarea = screen.getByLabelText(/Текст/);
    await user.type(textarea, 'good');

    const submit = screen.getByRole('button', { name: /Отправить отзыв/ });
    await user.click(submit);

    await waitFor(() => {
      expect(
        calls.some(
          (c) => /\/reviews$/.test(c.url) && c.init?.method === 'POST',
        ),
      ).toBe(true);
    });

    const postCall = calls.find(
      (c) => /\/reviews$/.test(c.url) && c.init?.method === 'POST',
    )!;
    const body = JSON.parse(String(postCall.init!.body));
    expect(body).not.toHaveProperty('author');
    expect(body.product_id).toBe('u1');
    expect(body.text).toBe('good');
    expect(body.rating).toBe(5);
  });
});
