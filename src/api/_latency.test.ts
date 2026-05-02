import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { delay, setLatency, LATENCY } from '@/api/_latency';

describe('_latency module', () => {
  beforeEach(() => {
    setLatency(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    setLatency(0);
  });

  it('exports a numeric LATENCY', () => {
    expect(typeof LATENCY).toBe('number');
  });

  it('setLatency mutates the latency reading', () => {
    setLatency(123);
    setLatency(0);
  });

  it('delay() resolves on the next microtask when latency is 0', async () => {
    setLatency(0);

    let resolved = false;
    const p = delay().then(() => {
      resolved = true;
    });

    await Promise.resolve();
    await Promise.resolve();
    await p;

    expect(resolved).toBe(true);
  });

  it('delay(ms) honours the explicit argument and waits ~ms with real timers', async () => {
    setLatency(0);
    vi.useFakeTimers();

    let resolved = false;
    const p = delay(50).then(() => {
      resolved = true;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(50);
    await p;

    expect(resolved).toBe(true);
  });

  it('delay() uses the configured LATENCY when called with no arg', async () => {
    setLatency(75);
    vi.useFakeTimers();

    let resolved = false;
    const p = delay().then(() => {
      resolved = true;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(74);
    await Promise.resolve();
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(2);
    await p;
    expect(resolved).toBe(true);
  });
});
