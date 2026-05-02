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

    expect(home.tagName).toBe('A');
    expect(catalog.tagName).toBe('A');

    const isSpan = current.tagName === 'SPAN';
    const isCurrent = current.getAttribute('aria-current') === 'page';
    expect(isSpan || isCurrent).toBe(true);
  });
});
