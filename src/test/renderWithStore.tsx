import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, type RenderResult } from '@testing-library/react';
import { makeStore as makeAppStore, type RootState } from '@/store';

export type { RootState };

/**
 * Build a store suitable for component tests, backed by the real application
 * reducers from `@/store`. Accepts an optional preloaded state slice so tests
 * can seed e.g. cart contents without dispatching actions first.
 */
export function makeTestStore(preloadedState?: Partial<RootState>) {
  return makeAppStore(preloadedState);
}

// Public alias matching the brief's `makeStore` name.
export const makeStore = makeTestStore;

export interface RenderWithProvidersOptions {
  preloadedState?: Partial<RootState>;
  /** Initial pathname for the wrapping MemoryRouter. Defaults to "/". */
  route?: string;
  /** Optional pre-built store. If omitted, one is created from `preloadedState`. */
  store?: ReturnType<typeof makeStore>;
}

/**
 * Render a React element wrapped in the application's providers (Redux + Router).
 *
 * Two modes:
 *   1. Pass `preloadedState` to have a fresh store created for the test.
 *   2. Pass `store` to reuse a pre-built store (e.g. one shared across renders).
 *
 * Returns the standard `@testing-library/react` RenderResult plus the `store`
 * that backed the render, so tests can dispatch / inspect state.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderResult & { store: ReturnType<typeof makeStore> } {
  const { preloadedState, route, store = makeStore(preloadedState) } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route ?? '/']}>{children}</MemoryRouter>
      </Provider>
    );
  }

  const renderResult = render(ui, { wrapper: Wrapper });
  return { ...renderResult, store };
}
