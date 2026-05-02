/**
 * Tests for `<Chip>` (T6).
 *
 * Contract under test:
 *   - `selected={true}` → element has aria-pressed="true".
 *   - `selected={false}` → element has aria-pressed="false".
 *   - Click invokes `onToggle`.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Chip } from '@/components/Chip/Chip';

describe('<Chip>', () => {
  it('reflects selected=true via aria-pressed', () => {
    render(<Chip selected onToggle={() => {}}>E27</Chip>);
    expect(screen.getByRole('button', { name: 'E27' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('reflects selected=false via aria-pressed', () => {
    render(<Chip selected={false} onToggle={() => {}}>E27</Chip>);
    expect(screen.getByRole('button', { name: 'E27' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Chip selected={false} onToggle={onToggle}>E27</Chip>);
    await user.click(screen.getByRole('button', { name: 'E27' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
