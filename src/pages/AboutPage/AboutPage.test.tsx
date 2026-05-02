/**
 * Tests for AboutPage (T10).
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AboutPage } from '@/pages/AboutPage/AboutPage';

describe('AboutPage', () => {
  it('renders the "О компании" heading and 3 delivery cards', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /О компании/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('delivery-card')).toHaveLength(3);
  });

  it('shows a tel: link and a mailto: link', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole('link');
    expect(links.some(a => a.getAttribute('href')?.startsWith('tel:'))).toBe(true);
    expect(links.some(a => a.getAttribute('href')?.startsWith('mailto:'))).toBe(true);
  });

  it('renders exactly one map placeholder', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    const placeholders = screen.getAllByTestId('map-placeholder');
    expect(placeholders).toHaveLength(1);
  });
});
