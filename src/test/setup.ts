import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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
