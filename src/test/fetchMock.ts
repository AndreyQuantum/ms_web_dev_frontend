import { vi, type MockInstance } from 'vitest';

type MockEntry = { body: unknown; status?: number };

let spy: MockInstance | null = null;
const queue: MockEntry[] = [];

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

function ensureSpy(): MockInstance {
  if (spy) return spy;
  spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    const next = queue.shift();
    if (!next) {
      throw new Error('No more mocked fetch responses');
    }
    return buildResponse(next.body, next.status);
  });
  return spy;
}

/**
 * Mock the next single fetch call with the given body and (optional) status.
 */
export function mockFetchOnce(body: unknown, status = 200): void {
  ensureSpy();
  queue.push({ body, status });
}

/**
 * Mock N fetch calls in order.
 */
export function mockFetchSequence(entries: MockEntry[]): void {
  ensureSpy();
  for (const entry of entries) {
    queue.push(entry);
  }
}

/**
 * Returns the underlying spy so callers can assert on .mock.calls.
 */
export function getFetchMock(): MockInstance {
  return ensureSpy();
}

/**
 * Restore the original fetch and clear any pending mocked responses.
 */
export function resetFetchMock(): void {
  if (spy) {
    spy.mockRestore();
    spy = null;
  }
  queue.length = 0;
}
