/**
 * Tests for `<EmptyState>` (T6).
 *
 * Contract under test:
 *   - Renders the supplied `title` and `hint` text in the document.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EmptyState } from '@/components/EmptyState/EmptyState';

describe('<EmptyState>', () => {
  it('renders title and hint', () => {
    render(<EmptyState title="Ничего не найдено" hint="Измените фильтры" />);
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    expect(screen.getByText('Измените фильтры')).toBeInTheDocument();
  });
});
