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
