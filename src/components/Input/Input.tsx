import { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="input-wrapper">
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} {...rest} />
      {error ? (
        <span role="alert" data-testid="input-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
