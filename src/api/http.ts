const PRODUCTS = (import.meta.env?.VITE_PRODUCTS_API_URL ?? '/api/products') as string;
const ORDERS = (import.meta.env?.VITE_ORDERS_API_URL ?? '/api/orders') as string;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (
    init.body !== undefined &&
    init.body !== null &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, body, `HTTP ${res.status} ${path}`);
  }
  return body as T;
}

export const productsHttp = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>(PRODUCTS, path, init);

export const ordersHttp = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>(ORDERS, path, init);
