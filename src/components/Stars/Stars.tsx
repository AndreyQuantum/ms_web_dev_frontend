export interface StarsProps {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
}

export function Stars({ value, max = 5, onChange }: StarsProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <span className="stars" aria-label={`${value} out of ${max} stars`}>
      {stars.map(v => {
        const filled = v <= value;
        const handler = onChange ? () => onChange(v) : undefined;
        return (
          <span
            key={v}
            data-testid="star"
            data-filled={filled ? 'true' : 'false'}
            onClick={handler}
            style={onChange ? { cursor: 'pointer' } : undefined}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
