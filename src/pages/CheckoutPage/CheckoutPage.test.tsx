import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { makeStore } from '@/store';
import { CheckoutPage } from '@/pages/CheckoutPage/CheckoutPage';
import type { CartItem } from '@/store/slices/cartSlice';

interface PreloadedCartShape {
  cart?: { items: CartItem[] };
}

function renderCheckout(preloadedState?: PreloadedCartShape, route = '/checkout') {
  const store = makeStore(preloadedState as never);
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <CheckoutPage />
      </MemoryRouter>
    </Provider>,
  );
  return { ...utils, store };
}

const preloadedCart: PreloadedCartShape = {
  cart: {
    items: [
      { productId: 'p1', qty: 1, snapshot: { name: 'X', price: 10 } },
    ],
  },
};

// Wider mock-like type to bridge the vitest spyOn fetch overload signature.
type FetchSpy = {
  mockRestore: () => void;
  mock: { calls: unknown[][] };
};
let fetchSpy: FetchSpy | null = null;

function setupFetchOnce(body: unknown, status = 200): FetchSpy {
  const responseInit = { status, headers: { 'Content-Type': 'application/json' } };
  const response =
    typeof body === 'string'
      ? new Response(body, responseInit)
      : new Response(JSON.stringify(body), responseInit);
  fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(response) as unknown as FetchSpy;
  return fetchSpy;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  if (fetchSpy) {
    fetchSpy.mockRestore();
    fetchSpy = null;
  }
  vi.restoreAllMocks();
});

describe('CheckoutPage', () => {
  it('renders email and phone inputs and a submit button when cart has items', () => {
    renderCheckout(preloadedCart);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/телеф|phone/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /оформить|submit/i }),
    ).toBeInTheDocument();
  });

  it('successful submit calls POST /orders and clears cart', async () => {
    const spy = setupFetchOnce({
      id: 'o1',
      client_email: 'a@b.co',
      client_phone: '+71234567890',
      comment: null,
      status: 'NEW',
      items: [],
      created_at: '2026-05-09T00:00:00Z',
    }, 201);

    const { store } = renderCheckout(preloadedCart);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'a@b.co' },
    });
    fireEvent.change(screen.getByLabelText(/телеф|phone/i), {
      target: { value: '+71234567890' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /оформить|submit/i }),
    );

    await waitFor(() =>
      expect(store.getState().cart.items).toEqual([]),
    );

    const calls = (spy as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const lastCall = calls[calls.length - 1];
    expect(String(lastCall[0])).toContain('/orders');
    const init = lastCall[1] as RequestInit;
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty('client_email', 'a@b.co');
    expect(body).toHaveProperty('client_phone', '+71234567890');
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items[0]).toMatchObject({ product_id: 'p1', quantity: 1 });
  });

  it('failed submit shows error and keeps cart', async () => {
    setupFetchOnce('{"detail":"boom"}', 500);

    const { store } = renderCheckout(preloadedCart);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'a@b.co' },
    });
    fireEvent.change(screen.getByLabelText(/телеф|phone/i), {
      target: { value: '+71234567890' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /оформить|submit/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/ошиб/i)).toBeInTheDocument(),
    );
    expect(store.getState().cart.items.length).toBe(1);
    // form fields preserved (not navigated away)
    expect(
      (screen.getByLabelText(/email/i) as HTMLInputElement).value,
    ).toBe('a@b.co');
  });

  it('disables submit button while order is being created', async () => {
    // Make the fetch hang so status remains "creating".
    let resolveResponse: (r: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(pending as unknown as Promise<Response>) as unknown as FetchSpy;

    renderCheckout(preloadedCart);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'a@b.co' },
    });
    fireEvent.change(screen.getByLabelText(/телеф|phone/i), {
      target: { value: '+71234567890' },
    });
    const submit = screen.getByRole('button', {
      name: /оформить|submit/i,
    }) as HTMLButtonElement;
    fireEvent.click(submit);

    await waitFor(() => expect(submit.disabled).toBe(true));

    // Cleanup: resolve the pending fetch so no dangling promise remains.
    resolveResponse(
      new Response(
        JSON.stringify({
          id: 'o1',
          client_email: 'a@b',
          client_phone: '+7',
          comment: null,
          status: 'NEW',
          items: [],
          created_at: '2026-05-09T00:00:00Z',
        }),
        { status: 201 },
      ),
    );
  });
});
