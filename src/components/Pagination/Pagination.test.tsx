import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Pagination } from '@/components/Pagination/Pagination';

describe('<Pagination>', () => {
  it('renders all page numbers', () => {
    render(<Pagination page={1} totalPages={3} onChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange(page+1) when "next" is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange(page-1) when "prev" is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables prev on page 1', () => {
    render(<Pagination page={1} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });

  it('disables next on the last page', () => {
    render(<Pagination page={3} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
