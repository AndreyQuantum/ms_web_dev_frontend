import type { ReactNode } from 'react';

export interface ChipProps {
  selected?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

export function Chip({ selected = false, onToggle, children }: ChipProps) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={selected ? 'true' : 'false'}
      data-selected={selected ? 'true' : 'false'}
      onClick={onToggle}
    >
      {children}
    </button>
  );
}
