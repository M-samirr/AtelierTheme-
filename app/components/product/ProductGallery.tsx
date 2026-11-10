import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { ImageModal } from '@salla.sa/twilight-theme-engine/modal';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { isNativeApp } from '@salla.sa/twilight-theme-engine/native-app';
import type { Product, ProductImage } from '@salla.sa/twilight-theme-engine/types';
import { onSallaEvent } from '@salla.sa/twilight-theme-engine/utils';
import { YoutubeFrame } from '../common';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import {
  galleryItems,
  indexFromScroll,
  slideForOption,
  type GalleryItem,
  type OptionDetail,
} from '../../lib/productMedia';
import { settingChoice } from '../../lib/settings';

const STAGE_WIDTHS = [480, 720, 960, 1200] as const;
const STAGE_SIZES = '(min-width: 1024px) 50vw, 100vw';
const THUMB_WIDTHS = [96, 192] as const;
const LAYOUTS = ['thumbs', 'grid'] as const;
const FITS = ['cover', 'contain'] as const;

function Slide({
  item,
  product,
  index,
  onZoom,
}: {
  item: GalleryItem;
  product: Product;
  index: number;
  onZoom: (image: ProductImage) => void;
}) {
  const { t } = useTranslation();
  const alt = item.image.alt || product.name;

  if (item.kind === 'model') {
    return (
      <model-viewer
        className="at-gallery__model"
        loading="lazy"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        poster={item.image.url || undefined}
        src={item.image.three_d_image_url}
        shadow-intensity="1"
        alt={alt}
      />
    );
  }
  if (item.kind === 'youtube' && item.videoId) {
    return <YoutubeFrame id={item.videoId} poster={item.image.url || undefined} title={alt} />;
  }
  if (item.kind === 'video') {
    return (
      // Salla's product media has no captions field, so there is no track to give it.
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        className="at-gallery__video"
        src={item.image.video_url}
        poster={item.image.url || undefined}
        controls
        playsInline
        preload="none"
        aria-label={alt}
      />
    );
  }
  return (
    <button
      type="button"
      className="at-gallery__zoom"
      onClick={() => onZoom(item.image)}
      aria-label={t('theme.pdp.zoom', { defaultValue: 'Enlarge image {{n}}', n: index + 1 })}
    >
      <Image
        className="at-gallery__img"
        src={item.image.url}
        alt={alt}
        noWrapper
        width={960}
        height={1200}
        srcSetWidths={STAGE_WIDTHS}
        sizes={STAGE_SIZES}
        priority={index === 0}
      />
    </button>
  );
}

/**
 * The product's images, videos and 3D models on a scroll-snap track, so the first image is plain
 * server-rendered markup and needs no slider script. Follows `product-options::change`, so picking
 * a colour or thumbnail option shows its image.
 */
export function ProductGallery({ product }: { product: Product }) {
  const { t } = useTranslation();
  const settings = useThemeSettings();
  const layout = settingChoice(settings.product_gallery_style, LAYOUTS, 'thumbs');
  const fit = settingChoice(settings.product_gallery_fit, FITS, 'cover');

  const items = useMemo(() => galleryItems(product), [product]);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<ProductImage | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const slide = slideRefs.current[index];
    if (!track || !slide) return;
    setActive(index);
    if (track.scrollWidth - track.clientWidth > 1) {
      // Measured from the rectangles, which read the same in both directions.
      const left = slide.getBoundingClientRect().left - track.getBoundingClientRect().left;
      track.scrollBy({ left });
    } else {
      slide.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  useEffect(
    () =>
      onSallaEvent('product-options::change', (payload) => {
        const data = payload as { option?: { type?: string }; detail?: OptionDetail } | undefined;
        if (!['thumbnail', 'color'].includes(data?.option?.type ?? '')) return;
        const index = slideForOption(items, data?.detail);
        if (index >= 0) goTo(index);
      }),
    [items, goTo]
  );

  const zoom = (image: ProductImage) => {
    if (isNativeApp()) {
      const images = items.map((item) => item.image);
      if (window.salla?.mobile?.openGallery?.(images, image)) return;
    }
    setPreview(image);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.scrollWidth - track.clientWidth <= 1) return;
    setActive(indexFromScroll(track.scrollLeft, track.clientWidth, items.length));
  };

  if (!items.length) {
    return (
      <div className="at-gallery at-gallery--empty" aria-hidden="true">
        <i className="sicon-image" />
      </div>
    );
  }

  const many = items.length > 1;

  return (
    <div className={cn('at-gallery', `at-gallery--${layout}`, `at-gallery--${fit}`)}>
      <div className="at-gallery__stage">
        <div className="at-gallery__badges">
          {product.promotion_title && <span className="at-badge">{product.promotion_title}</span>}
          {product.calories && (
            <span className="at-badge at-badge--muted">
              {product.calories} {t('pages.products.calories', 'Calories')}
            </span>
          )}
        </div>

        <div ref={trackRef} className="at-gallery__track" onScroll={onScroll}>
          {items.map((item, index) => (
            <div
              key={item.key}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="at-gallery__slide"
            >
              <Slide item={item} product={product} index={index} onZoom={zoom} />
            </div>
          ))}
        </div>

        {many && layout === 'thumbs' && (
          <div className="at-gallery__arrows">
            <button
              type="button"
              className="at-icon-btn"
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
              aria-label={t('theme.pdp.previous', 'Previous image')}
            >
              <i className="sicon-keyboard_arrow_right at-flip-ltr" />
            </button>
            <button
              type="button"
              className="at-icon-btn"
              disabled={active === items.length - 1}
              onClick={() => goTo(active + 1)}
              aria-label={t('theme.pdp.next', 'Next image')}
            >
              <i className="sicon-keyboard_arrow_left at-flip-ltr" />
            </button>
          </div>
        )}
      </div>

      {many && (
        <div className="at-gallery__thumbs">
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={cn('at-gallery__thumb', index === active && 'is-active')}
              onClick={() => goTo(index)}
              aria-current={index === active ? 'true' : undefined}
              aria-label={t('theme.pdp.show_media', {
                defaultValue: 'Show item {{n}}',
                n: index + 1,
              })}
            >
              <Image
                src={item.image.url}
                alt=""
                noWrapper
                width={96}
                height={120}
                srcSetWidths={THUMB_WIDTHS}
                sizes="96px"
              />
              {item.kind !== 'image' && (
                <i className={item.kind === 'model' ? 'sicon-box' : 'sicon-play'} />
              )}
            </button>
          ))}
        </div>
      )}

      {preview && (
        <Suspense fallback={null}>
          <ImageModal
            isOpen
            onClose={() => setPreview(null)}
            src={preview.url ?? ''}
            alt={preview.alt || product.name}
          />
        </Suspense>
      )}
    </div>
  );
}
