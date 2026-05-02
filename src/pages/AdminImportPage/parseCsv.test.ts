/**
 * Unit tests for parseCsv util used by AdminImportPage (T16).
 */

import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/pages/AdminImportPage/parseCsv';

describe('parseCsv', () => {
  it('parses a 2-row CSV with a header into objects keyed by column name', () => {
    const out = parseCsv('name,price\nLED A60,300\nLED G45,250');
    expect(out).toEqual([
      { name: 'LED A60', price: '300' },
      { name: 'LED G45', price: '250' },
    ]);
  });

  it('returns [] for malformed input', () => {
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv('\n\n')).toEqual([]);
  });
});
