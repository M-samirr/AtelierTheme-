import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

/** The merchant's settings, keyed by the ids in twilight.json. Read them through `lib/settings`. */
export function useThemeSettings(): Record<string, unknown> {
  const { theme } = useTwilight();
  return (theme?.settings ?? {}) as Record<string, unknown>;
}
