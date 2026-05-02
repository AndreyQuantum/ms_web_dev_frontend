import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <span data-testid="button-spinner" aria-hidden="true">
          …
        </span>
      ) : null}
      {children}
    </button>
  );
}
