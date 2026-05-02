import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@/components/Button/Button';

describe('<Button>', () => {
  it('renders its children', () => {
    render(<Button>Купить</Button>);
    expect(screen.getByRole('button', { name: 'Купить' })).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Disabled' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a spinner and disables the button when loading', () => {
    render(<Button loading>Загрузка</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it.each([
    ['primary'],
    ['secondary'],
    ['ghost'],
    ['danger'],
  ] as const)('renders data-variant="%s" for variant=%s', variant => {
    render(<Button variant={variant}>v</Button>);
    const btn = screen.getByRole('button', { name: 'v' });
    expect(btn).toHaveAttribute('data-variant', variant);
  });
});
