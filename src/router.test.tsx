import { describe, it, expect } from 'vitest';
import type { RouteObject } from 'react-router-dom';
import { routes } from '@/router';

const expectedPaths = [
  '/',
  '/catalog',
  '/product/:id',
  '/about',
  '/cart',
  '/checkout',
  '/order-success',
  '/admin/login',
  '/admin',
  '/admin/products',
  '/admin/import',
  '/admin/dictionaries',
];

function flatPaths(rs: RouteObject[], parent = ''): string[] {
  const out: string[] = [];
  for (const r of rs) {
    let here = parent;
    if (r.path) {
      const p = r.path.startsWith('/') ? r.path : `/${r.path}`;
      here = `${parent}${p}`.replace(/\/+/g, '/');
      if (here.length > 1 && here.endsWith('/')) here = here.slice(0, -1);
      out.push(here);
    }
    if (r.children) out.push(...flatPaths(r.children, here));
  }
  return out;
}

describe('router', () => {
  it('exports a routes array', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  const all = flatPaths(routes);

  for (const path of expectedPaths) {
    it(`declares the ${path} path`, () => {
      expect(all).toContain(path);
    });
  }
});
