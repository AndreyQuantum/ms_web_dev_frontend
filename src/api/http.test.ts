import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ordersHttp, productsHttp } from './http';

const fetchMock = vi.spyOn(globalThis, 'fetch');

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

function mockOnce(body: unknown, status = 200): void {
  const text = body == null ? '' : JSON.stringify(body);
  fetchMock.mockResolvedValueOnce(new Response(text, { status }));
}

describe('http wrapper', () => {
  it('returns parsed JSON on 200 and uses correct URL for productsHttp', async () => {
    mockOnce({ a: 1 }, 200);

    const result = await productsHttp<{ a: number }>('/x');

    expect(result).toEqual({ a: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url.endsWith('/x')).toBe(true);
  });

  it('throws ApiError with status and parsed body on 404 from ordersHttp', async () => {
    mockOnce({ detail: 'nope' }, 404);

    let caught: unknown = null;
    try {
      await ordersHttp('/y');
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ApiError);
    const err = caught as ApiError;
    expect(err.status).toBe(404);
    expect((err.body as { detail: string }).detail).toBe('nope');
  });

  it('preserves caller-provided headers and does not add Content-Type when there is no body', async () => {
    mockOnce({ ok: true }, 200);

    await productsHttp('/h', { headers: { 'X-Trace': 't' } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get('X-Trace')).toBe('t');
    expect(headers.get('Content-Type')).toBeNull();
  });

  it('defaults Content-Type to application/json when a body is present', async () => {
    mockOnce({ ok: true }, 200);

    await productsHttp('/p', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('does not override caller-provided Content-Type when a body is present', async () => {
    mockOnce({ ok: true }, 200);

    await productsHttp('/p', {
      method: 'POST',
      body: 'raw',
      headers: { 'Content-Type': 'text/plain' },
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get('Content-Type')).toBe('text/plain');
  });

  it('resolves to null on 204 No-Content (no JSON parse error)', async () => {
    // jsdom's Response refuses bodies on 204; build a minimal Response-like.
    const fake204 = {
      ok: true,
      status: 204,
      text: async () => '',
    } as unknown as Response;
    fetchMock.mockResolvedValueOnce(fake204);

    const result = await productsHttp('/empty');

    expect(result).toBeNull();
  });

  it('uses correct base URL for ordersHttp', async () => {
    mockOnce({ ok: true }, 200);

    await ordersHttp('/z');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url.endsWith('/z')).toBe(true);
  });

  it('ApiError has name "ApiError" and a descriptive message', async () => {
    mockOnce({ err: 'bad' }, 500);

    try {
      await productsHttp('/boom');
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.name).toBe('ApiError');
      expect(err.message).toContain('500');
      expect(err.message).toContain('/boom');
    }
  });

  it('falls back to raw text body when response is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('plain text error', { status: 500 }),
    );

    try {
      await productsHttp('/plain');
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).body).toBe('plain text error');
    }
  });
});
