/**
 * Tests for `<Stars>` (T6).
 *
 * Contract under test:
 *   - With `value={3}` exactly 3 elements have `data-filled="true"`.
 *   - With `onChange` provided, clicking the 5th star calls `onChange(5)`.
 *   - Without `onChange`, clicking does nothing (read-only) and no star is
 *     focusable as a button (i.e. no buttons rendered, or rendering remains
 *     non-interactive). We at least assert that no `onChange` is invoked.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Stars } from '@/components/Stars/Stars';

describe('<Stars>', () => {
  it('renders exactly value filled stars', () => {
    render(<Stars value={3} />);
    const filled = screen.getAllByTestId('star').filter(
      el => el.getAttribute('data-filled') === 'true'
    );
    expect(filled).toHaveLength(3);
  });

  it('calls onChange(5) when the 5th star is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stars value={3} onChange={onChange} />);
    const stars = screen.getAllByTestId('star');
    expect(stars).toHaveLength(5);
    await user.click(stars[4]);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('does nothing on click when read-only (no onChange)', async () => {
    const user = userEvent.setup();
    render(<Stars value={3} />);
    const stars = screen.getAllByTestId('star');
    // Clicking should not throw or change anything; we re-check that the
    // filled count is still 3 after a click.
    await user.click(stars[4]);
    const filled = screen
      .getAllByTestId('star')
      .filter(el => el.getAttribute('data-filled') === 'true');
    expect(filled).toHaveLength(3);
  });
});
