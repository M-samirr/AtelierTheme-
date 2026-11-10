import { useEffect, useState } from 'react';
import { whenSallaReady } from '@salla.sa/twilight-theme-engine/utils';

interface CartSummary {
  count?: number | string | null;
}

interface CartSdk {
  storage?: { get?: (key: string, fallback?: unknown) => unknown };
  event?: {
    on?: (event: string, listener: (summary?: CartSummary) => void) => void;
    off?: (event: string, listener: (summary?: CartSummary) => void) => void;
  };
}

function toCount(value: unknown): number {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

/**
 * The live number of items in the cart. Starts at 0 so the server and the first
 * browser render agree, then follows the SDK's stored summary and its updates.
 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let sdk: CartSdk | undefined;
    let active = true;
    const onUpdated = (summary?: CartSummary) => setCount(toCount(summary?.count));

    whenSallaReady((salla) => {
      if (!active) return;
      sdk = salla as unknown as CartSdk;
      setCount(toCount(sdk.storage?.get?.('cart.summary.count', 0)));
      sdk.event?.on?.('cart::updated', onUpdated);
    });

    return () => {
      active = false;
      sdk?.event?.off?.('cart::updated', onUpdated);
    };
  }, []);

  return count;
}
