// Mock API latency control. The default ~20ms delay simulates a real network
// hop in dev/preview, while tests call setLatency(0) to fall through to the
// microtask path (no real timers involved).

export let LATENCY = 20;

export function setLatency(ms: number): void {
  LATENCY = ms;
}

export function delay(ms?: number): Promise<void> {
  const wait = ms ?? LATENCY;
  if (wait <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, wait);
  });
}
