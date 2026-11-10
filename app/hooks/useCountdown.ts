import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Countdown {
  /** False on the server and until the first tick, so markup hydrates cleanly. */
  ready: boolean;
  expired: boolean;
  parts: CountdownParts;
}

const ZERO: CountdownParts = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export function partsUntil(target: number, now: number): CountdownParts {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

/** A timestamp from `2026-12-31 23:59` or an ISO date; null when it cannot be read. */
export function parseEndDate(raw: unknown): number | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const time = Date.parse(raw.trim().replace(' ', 'T'));
  return Number.isNaN(time) ? null : time;
}

/** Ticks once a second until `target`; does nothing when there is no target. */
export function useCountdown(target: number | null): Countdown {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (target === null || now === null) return { ready: false, expired: false, parts: ZERO };
  return { ready: true, expired: now >= target, parts: partsUntil(target, now) };
}
