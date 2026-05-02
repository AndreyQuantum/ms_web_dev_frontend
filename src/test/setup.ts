import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// --- Node 24 + jsdom 25 compatibility shim ---------------------------------
// vitest's jsdom environment installs jsdom's `AbortController`/`AbortSignal`
// on globalThis, but `globalThis.Request` is still the Node/undici built-in,
// which checks `signal instanceof <native AbortSignal>`. The mismatch causes
// `new Request(url, { signal })` to throw, breaking any client-side
// navigation triggered by react-router's data router (e.g. <Navigate>).
//
// Wrap `Request` so that incompatible signals are silently dropped — tests
// don't actually rely on the abort behaviour, only that the navigation
// completes synchronously.
const OrigRequest = globalThis.Request;
class PatchedRequest extends OrigRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    try {
      super(input, init);
    } catch (e) {
      if (
        init?.signal &&
        e instanceof TypeError &&
        /AbortSignal/.test(e.message)
      ) {
        const { signal: _drop, ...rest } = init;
        void _drop;
        super(input, rest);
        return;
      }
      throw e;
    }
  }
}
globalThis.Request = PatchedRequest;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
