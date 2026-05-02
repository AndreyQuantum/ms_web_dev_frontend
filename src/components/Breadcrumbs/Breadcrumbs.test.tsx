/**
 * Tests for `<Breadcrumbs>` (T6).
 *
 * Contract under test:
 *   - Given a list of items with { label, to } where `to` is optional,
 *     all items except the last render as `<a>` (anchors).
 *     The last item renders either as a `<span>` OR has `aria-current="page"`.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';

describe('<Breadcrumbs>', () => {
  it('renders all but the last item as anchors; last is span or aria-current="page"', () => {
    const items = [
      { label: 'Главная', to: '/' },
      { label: 'Каталог', to: '/catalog' },
      { label: 'Лампа E27' },
    ];
    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>
    );

    const home = screen.getByText('Главная');
    const catalog = screen.getByText('Каталог');
    const current = screen.getByText('Лампа E27');

    // The first two should be anchors.
    expect(home.tagName).toBe('A');
    expect(catalog.tagName).toBe('A');

    // The last is either a SPAN, or it has aria-current="page".
    const isSpan = current.tagName === 'SPAN';
    const isCurrent = current.getAttribute('aria-current') === 'page';
    expect(isSpan || isCurrent).toBe(true);
  });
});
