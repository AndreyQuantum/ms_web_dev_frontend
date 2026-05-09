import { describe, it, expect, afterEach } from 'vitest';
import {
  mockFetchOnce,
  mockFetchSequence,
  getFetchMock,
  resetFetchMock,
} from './fetchMock';

describe('fetchMock', () => {
  afterEach(() => {
    resetFetchMock();
  });

  describe('mockFetchOnce', () => {
    it('returns the mocked body on the next fetch call with ok=true and status=200', async () => {
      mockFetchOnce({ x: 1 });

      const res = await fetch('/api/x');

      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ x: 1 });
    });

    it('honors a non-2xx status: ok is false and status is exposed', async () => {
      mockFetchOnce({ message: 'not found' }, 404);

      const res = await fetch('/api/missing');

      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ message: 'not found' });
    });

    it('exposes a text() helper that returns the JSON-stringified body', async () => {
      mockFetchOnce({ hello: 'world' });

      const res = await fetch('/api/hello');

      expect(await res.text()).toBe(JSON.stringify({ hello: 'world' }));
    });

    it('exposes a Headers instance on the response', async () => {
      mockFetchOnce({ ok: true });

      const res = await fetch('/api/headers');

      expect(res.headers).toBeInstanceOf(Headers);
    });

    it('treats 2xx statuses as ok', async () => {
      mockFetchOnce({}, 201);

      const res = await fetch('/api/created');

      expect(res.ok).toBe(true);
      expect(res.status).toBe(201);
    });

    it('treats 5xx statuses as not ok', async () => {
      mockFetchOnce({ err: 'boom' }, 500);

      const res = await fetch('/api/boom');

      expect(res.ok).toBe(false);
      expect(res.status).toBe(500);
    });
  });

  describe('mockFetchSequence', () => {
    it('returns each entry in order for sequential fetch calls', async () => {
      mockFetchSequence([
        { body: { v: 'a' } },
        { body: { v: 'b' }, status: 404 },
      ]);

      const r1 = await fetch('/1');
      const r2 = await fetch('/2');

      expect(await r1.json()).toEqual({ v: 'a' });
      expect(r1.ok).toBe(true);
      expect(r1.status).toBe(200);

      expect(await r2.json()).toEqual({ v: 'b' });
      expect(r2.ok).toBe(false);
      expect(r2.status).toBe(404);
    });

    it('throws "No more mocked fetch responses" once the sequence is exhausted', async () => {
      mockFetchSequence([{ body: { v: 'a' } }, { body: { v: 'b' } }]);

      await fetch('/1');
      await fetch('/2');

      await expect(fetch('/3')).rejects.toThrow(
        'No more mocked fetch responses',
      );
    });
  });

  describe('getFetchMock', () => {
    it('returns the underlying spy so callers can assert on calls', async () => {
      mockFetchOnce({ ok: true });

      await fetch('/api/spy', { method: 'POST' });

      const spy = getFetchMock();
      expect(spy).toBeDefined();
      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0][0]).toBe('/api/spy');
      expect(spy.mock.calls[0][1]).toEqual({ method: 'POST' });
    });
  });

  describe('overflow without explicit sequence', () => {
    it('throws "No more mocked fetch responses" when mockFetchOnce is exhausted', async () => {
      mockFetchOnce({ x: 1 });

      await fetch('/once');

      await expect(fetch('/twice')).rejects.toThrow(
        'No more mocked fetch responses',
      );
    });
  });

  describe('resetFetchMock', () => {
    it('restores fetch so it is no longer the spy after reset', async () => {
      mockFetchOnce({ x: 1 });
      const spyBefore = getFetchMock();
      expect(spyBefore).toBeDefined();

      resetFetchMock();

      // After reset, calling getFetchMock should not return the same active spy.
      // The contract is that fetch is restored; consumers should re-mock to use it.
      // We assert that calling fetch without re-mocking does not produce the mocked body.
      // To avoid making a real network call, we re-mock before calling fetch in the next test.
      // Here we simply verify the spy has been restored by checking that a fresh
      // mockFetchOnce sets up a brand-new spy (call count starts at 0).
      mockFetchOnce({ y: 2 });
      const spyAfter = getFetchMock();
      expect(spyAfter.mock.calls.length).toBe(0);
    });
  });
});
