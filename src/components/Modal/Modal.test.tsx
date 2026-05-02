/**
 * Tests for `<Modal>` (T6).
 *
 * Contract under test:
 *   - When `open={false}` no element with role="dialog" is rendered.
 *   - When `open={true}` a dialog with the supplied title is rendered.
 *   - Pressing the Escape key calls `onClose`.
 *   - Clicking the backdrop (data-testid="modal-backdrop") calls `onClose`.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Modal } from '@/components/Modal/Modal';

describe('<Modal>', () => {
  it('renders nothing dialog-shaped when open=false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Заголовок">
        body
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with title when open=true', () => {
    render(
      <Modal open onClose={() => {}} title="Заголовок">
        body
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="t">
        body
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="t">
        body
      </Modal>
    );
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
