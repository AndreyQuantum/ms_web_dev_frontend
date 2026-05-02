import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '@/components/Input/Input';

describe('<Input>', () => {
  it('renders with the given placeholder', () => {
    render(<Input placeholder="Поиск" />);
    expect(screen.getByPlaceholderText('Поиск')).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="Поиск" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('Поиск'), 'abc');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows the error message when `error` is provided', () => {
    render(<Input placeholder="Email" error="Введите email" />);
    expect(screen.getByText('Введите email')).toBeInTheDocument();
  });

  it('associates the label with the input via htmlFor/id', () => {
    render(<Input label="Имя" placeholder="Иван" />);
    const input = screen.getByPlaceholderText('Иван') as HTMLInputElement;
    const label = screen.getByText('Имя') as HTMLLabelElement;
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
  });
});
