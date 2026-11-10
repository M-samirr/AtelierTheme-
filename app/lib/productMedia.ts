import type { Product, ProductImage } from '@salla.sa/twilight-theme-engine/types';
import { youtubeId } from './blockData';

export type GalleryKind = 'image' | 'youtube' | 'video' | 'model';

export interface GalleryItem {
  key: string;
  kind: GalleryKind;
  image: ProductImage;
  /** The YouTube id, on `youtube` items. */
  videoId?: string;
}

function kindOf(image: ProductImage): { kind: GalleryKind; videoId?: string } | null {
  if (image.three_d_image_url) return { kind: 'model' };
  if (image.video_url) {
    const videoId = image.video_type === 'video' ? '' : youtubeId(image.video_url);
    return videoId ? { kind: 'youtube', videoId } : { kind: 'video' };
  }
  return image.url ? { kind: 'image' } : null;
}

/**
 * Everything the gallery can show, in the merchant's order. The details API sometimes sends only
 * `image`, so the main image is the fallback and a product always has its picture.
 */
export function galleryItems(product: Pick<Product, 'images' | 'image'>): GalleryItem[] {
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  return images.flatMap((image, index) => {
    const kind = kindOf(image);
    return kind ? [{ key: `${image.id ?? index}-${index}`, image, ...kind }] : [];
  });
}

export interface OptionDetail {
  option_value?: unknown;
  color?: unknown;
}

/**
 * The slide a chosen option points at, or -1. Options with their own uploaded thumbnail carry the
 * gallery image id in `color`, so both fields are tried, as Salla's own slider does.
 */
export function slideForOption(items: GalleryItem[], detail: OptionDetail | undefined): number {
  const ids = [detail?.option_value, detail?.color].filter(
    (value) => value != null && /^\d+$/.test(String(value))
  );
  for (const id of ids) {
    const index = items.findIndex((item) => String(item.image.id) === String(id));
    if (index >= 0) return index;
  }
  return -1;
}

/** The slide in view. `scrollLeft` is negative in RTL, so only its size counts. */
export function indexFromScroll(scrollLeft: number, slideWidth: number, count: number): number {
  if (slideWidth <= 0 || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(Math.abs(scrollLeft) / slideWidth)));
}

/** An `<iframe>` start tag; quoted values may hold `>`. */
const IFRAME_TAG = /<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;

/** Players embedded in a description load only when scrolled near, unless the merchant set `loading`. */
export function lazyIframes(html: string): string {
  return html.replace(IFRAME_TAG, (tag) =>
    /\sloading\s*=/i.test(tag.replace(/"[^"]*"|'[^']*'/g, '""'))
      ? tag
      : tag.replace(/^<iframe/i, '<iframe loading="lazy"')
  );
}
