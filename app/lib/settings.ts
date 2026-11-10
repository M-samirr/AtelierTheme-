/**
 * Readers for merchant settings (`useTheme().settings`) and home-block `data`.
 *
 * Values arrive loosely typed: a switch a store never saved is `undefined`, a
 * dropdown may be the chosen `value` string or `[{ value }]`, a multichoice list
 * may be strings or objects. Every reader returns a safe, typed value, so
 * components never branch on the raw shape.
 */

export function settingBoolean(raw: unknown, fallback: boolean): boolean {
  if (typeof raw === 'boolean') return raw;
  if (raw === 'true' || raw === 1 || raw === '1') return true;
  if (raw === 'false' || raw === 0 || raw === '0') return false;
  return fallback;
}

function optionValue(raw: unknown): string | undefined {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'value' in first) {
    const value = (first as { value?: unknown }).value;
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

export function settingChoice<const T extends readonly string[]>(
  raw: unknown,
  allowed: T,
  fallback: T[number]
): T[number] {
  const value = optionValue(raw);
  return value !== undefined && allowed.includes(value) ? (value as T[number]) : fallback;
}

export function settingList(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    const single = optionValue(raw);
    return single ? [single] : [];
  }
  return raw
    .map((item) => optionValue(item))
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
}

export function settingText(raw: unknown, fallback = ''): string {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : fallback;
}

export function settingNumber(
  raw: unknown,
  fallback: number,
  range?: { min?: number; max?: number }
): number {
  const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isFinite(value)) return fallback;
  if (range?.min !== undefined && value < range.min) return range.min;
  if (range?.max !== undefined && value > range.max) return range.max;
  return value;
}

/**
 * A multilanguage field. Home-block values arrive already in the visitor's
 * language; theme settings and the local editor can send an object keyed by language.
 */
export function settingLocalized(raw: unknown, locale: string, fallback = ''): string {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const values = raw as Record<string, unknown>;
    return settingText(values[locale] ?? values.ar ?? values.en, fallback);
  }
  return settingText(raw, fallback);
}
