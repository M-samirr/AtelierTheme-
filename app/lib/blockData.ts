import type { ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';

/**
 * Readers for home-block `data`. The dashboard, the Store API and the local
 * editor do not always send a picker in the same shape: a scalar, `{ id }`,
 * `{ value }`, a list of those, or `{ source_value: [...] }`.
 */

function scalar(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
  if (Array.isArray(raw)) return scalar(raw[0]);
  if (typeof raw === 'object') {
    const value = raw as { value?: unknown; id_?: unknown; id?: unknown; key?: unknown };
    return scalar(value.id_ ?? value.id ?? value.value ?? value.key);
  }
  return '';
}

/** A dropdown's chosen value as a string, or `''`. */
export function pickValue(raw: unknown): string {
  return scalar(raw);
}

/** The numeric ids a product, category or brand picker holds. */
export function pickIds(raw: unknown): number[] {
  const list =
    raw && typeof raw === 'object' && !Array.isArray(raw) && 'source_value' in raw
      ? (raw as { source_value?: unknown }).source_value
      : raw;
  const items = Array.isArray(list) ? list : list === null || list === undefined ? [] : [list];
  return items.map((item) => Number(scalar(item))).filter((id) => Number.isFinite(id) && id > 0);
}

/** A link field's destination, `''` when it has none or points nowhere. */
export function linkUrl(raw: unknown): string {
  if (typeof raw === 'string') return raw === '#' ? '' : raw;
  if (Array.isArray(raw)) return linkUrl(raw[0]);
  if (raw && typeof raw === 'object') {
    const value = raw as { url?: unknown; value?: unknown };
    return linkUrl(value.url ?? value.value);
  }
  return '';
}

/**
 * A collection field as a list of items. Nested field ids are written
 * `slides.image` in twilight.json; items can arrive with or without the prefix.
 */
export function items<T>(raw: unknown): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (!item || typeof item !== 'object') return item as T;
    const entries = Object.entries(item).map(([key, value]) => [key.split('.').pop(), value]);
    return Object.fromEntries(entries) as T;
  });
}

/** How many products a block shows: a whole number from 1 to 24, or `fallback`. */
export function blockLimit(raw: unknown, fallback: number): number {
  const limit = typeof raw === 'string' ? Number(raw.trim()) : raw;
  return typeof limit === 'number' && Number.isInteger(limit) && limit > 0
    ? Math.min(limit, 24)
    : fallback;
}

export interface ProductSource {
  source: ProductsListSource;
  /** A list for picks; a single product id for `related`, as the engine sends it. */
  sourceValue?: number | number[];
}

/**
 * Turns a block's "where do the products come from" fields into a list request.
 * Null when the merchant chose a source that needs a pick and has not made one.
 */
export function productSource(kind: string, picks: Record<string, unknown>): ProductSource | null {
  const needsIds = (source: ProductsListSource, raw: unknown): ProductSource | null => {
    const sourceValue = pickIds(raw);
    return sourceValue.length ? { source, sourceValue } : null;
  };
  switch (kind) {
    case 'category':
      return needsIds('categories', picks.category);
    case 'selected':
      return needsIds('selected', picks.products);
    case 'tag':
      return needsIds('tags', picks.tag);
    case 'offers':
      return { source: 'offers' };
    case 'sales':
      return { source: 'sales' };
    case 'best_selling':
      return { source: 'best_selling' };
    case 'top_rated':
      return { source: 'top-rated' };
    default:
      return { source: 'latest' };
  }
}

/** The id in a YouTube link or a bare id, `''` when there is none. */
export function youtubeId(raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return '';
  const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
  if (match) return match[1];
  return /^[\w-]{6,}$/.test(value) ? value : '';
}
