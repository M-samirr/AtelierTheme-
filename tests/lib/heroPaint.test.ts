import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { whenHeroPainted } from '../../app/lib/heroPaint';

let report: (element: Element) => void;

class FakeObserver {
  static supportedEntryTypes = ['largest-contentful-paint'];
  constructor(callback: (list: { getEntries: () => unknown[] }) => void) {
    report = (element) => callback({ getEntries: () => [{ element }] });
  }
  observe = vi.fn();
  disconnect = vi.fn();
}

function page({ critical = true, sizes = [100] }: { critical?: boolean; sizes?: number[] } = {}) {
  document.head.innerHTML = critical ? '<style data-href="critical"></style>' : '';
  document.body.innerHTML = sizes.map(() => '<img fetchpriority="high" />').join('');
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach((image, index) => {
    const size = sizes[index] ?? 0;
    image.getBoundingClientRect = () => ({ width: size, height: size }) as DOMRect;
    Object.defineProperty(image, 'complete', { value: false, configurable: true });
  });
  return images;
}

async function isSettled(promise: Promise<void>): Promise<boolean> {
  let settled = false;
  void promise.then(() => (settled = true));
  await vi.advanceTimersByTimeAsync(0);
  return settled;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('PerformanceObserver', FakeObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('whenHeroPainted', () => {
  it('does not wait on a page without critical CSS', async () => {
    page({ critical: false });
    expect(await isSettled(whenHeroPainted())).toBe(true);
  });

  it('does not wait in a browser without the paint API', async () => {
    page();
    vi.stubGlobal('PerformanceObserver', class {});
    expect(await isSettled(whenHeroPainted())).toBe(true);
  });

  it('waits for the largest priority image, not the logo', async () => {
    const [logo, hero] = page({ sizes: [40, 400] });
    const painted = whenHeroPainted();
    report(logo as Element);
    expect(await isSettled(painted)).toBe(false);
    report(hero as Element);
    expect(await isSettled(painted)).toBe(true);
  });

  it('moves on shortly after the download when the paint is never reported', async () => {
    const [hero] = page();
    const painted = whenHeroPainted();
    hero?.dispatchEvent(new Event('load'));
    await vi.advanceTimersByTimeAsync(299);
    expect(await isSettled(painted)).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await isSettled(painted)).toBe(true);
  });

  it('never waits past the limit for an image that does not arrive', async () => {
    page();
    const painted = whenHeroPainted();
    await vi.advanceTimersByTimeAsync(2500);
    expect(await isSettled(painted)).toBe(true);
  });
});
