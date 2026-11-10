/** Longest the app waits for a main image that never finishes downloading. */
const HERO_WAIT_MS = 2500;
/** How long after the download the paint may take to be reported. */
const HERO_PAINT_GRACE_MS = 300;

function largestImage(images: HTMLImageElement[]): HTMLImageElement {
  const area = (image: HTMLImageElement) => {
    const { width, height } = image.getBoundingClientRect();
    return width * height;
  };
  return images.reduce((largest, image) => (area(image) > area(largest) ? image : largest));
}

/**
 * Resolves once the first screen's main image is on the screen. The engine's bootClient only
 * waits for the download, and the paint can land a few frames later, so the app's scripts would
 * start competing with it. Pages without critical CSS and browsers without the API do not wait.
 */
export function whenHeroPainted(): Promise<void> {
  // This runs before React exists, so there are no refs to read these from.
  /* eslint-disable no-restricted-properties */
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"]')
  );
  const critical = document.querySelector('style[data-href]');
  /* eslint-enable no-restricted-properties */
  const supported = PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint');
  if (!images.length || !supported || !critical) {
    return Promise.resolve();
  }

  const hero = largestImage(images);
  return new Promise((resolve) => {
    let grace = 0;
    const done = () => {
      observer.disconnect();
      window.clearTimeout(limit);
      window.clearTimeout(grace);
      resolve();
    };
    const observer = new PerformanceObserver((list) => {
      if (list.getEntries().some((entry) => (entry as LargestContentfulPaint).element === hero)) {
        done();
      }
    });
    const limit = window.setTimeout(done, HERO_WAIT_MS);
    // Another element can be the largest paint, or the tab can be hidden: neither reports the hero.
    const startGrace = () => {
      grace = window.setTimeout(done, HERO_PAINT_GRACE_MS);
    };
    if (hero.complete) {
      startGrace();
    } else {
      hero.addEventListener('load', startGrace, { once: true });
      hero.addEventListener('error', startGrace, { once: true });
    }
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  });
}
