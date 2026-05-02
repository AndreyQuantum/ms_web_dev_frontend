import type { Promo } from '@/types';

export const promos: Promo[] = [
  {
    id: 1,
    name: 'Весенняя распродажа -20%',
    discountPercent: 20,
    startsAt: '2026-03-01T00:00:00.000Z',
    endsAt: '2026-05-31T23:59:59.000Z',
  },
  {
    id: 2,
    name: 'Чёрная пятница -30%',
    discountPercent: 30,
    startsAt: '2026-11-20T00:00:00.000Z',
    endsAt: '2026-11-30T23:59:59.000Z',
  },
];
