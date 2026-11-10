import type { AnyHomeComponent } from '@salla.sa/twilight-theme-engine/home';
import { EditorialHero } from './EditorialHero';
import { Lookbook } from './Lookbook';
import { CollectionTabs } from './CollectionTabs';
import { FlashSale } from './FlashSale';
import {
  Benefits,
  BlogTeaser,
  BrandStrip,
  Faq,
  StoryBand,
  TestimonialsBand,
  UgcGallery,
  VideoFeature,
} from './ContentBlocks';
import {
  FeaturedProducts,
  FixedBanner,
  FixedProducts,
  LatestProducts,
  ParallaxBackground,
  PhotosSlider,
  ProductsSlider,
  SquarePhotos,
  StoreFeatures,
  Youtube,
} from './PlatformBlocks';

/** Each key is a block's `path` in twilight.json without `home.`. */
export const themeHomeBlocks: Record<string, AnyHomeComponent> = {
  'editorial-hero': EditorialHero,
  lookbook: Lookbook,
  'collection-tabs': CollectionTabs,
  'flash-sale': FlashSale,
  'story-band': StoryBand,
  benefits: Benefits,
  'ugc-gallery': UgcGallery,
  faq: Faq,
  'testimonials-band': TestimonialsBand,
  'brand-strip': BrandStrip,
  'blog-teaser': BlogTeaser,
  'video-feature': VideoFeature,
};

/** Salla's built-in blocks, redrawn in the theme's style under the engine's keys. */
export const platformHomeBlocks: Record<string, AnyHomeComponent> = {
  'fixed-banner': FixedBanner,
  'photos-slider': PhotosSlider,
  'square-photos': SquarePhotos,
  'parallax-background': ParallaxBackground,
  youtube: Youtube,
  'store-features': StoreFeatures,
  'fixed-products': FixedProducts,
  'products-slider': ProductsSlider,
  'latest-products': LatestProducts,
  // The renderer tries `key:view_style` first, so each style needs its own entry.
  'featured-products': FeaturedProducts,
  'featured-products:style1': FeaturedProducts,
  'featured-products:style2': FeaturedProducts,
  'featured-products:style3': FeaturedProducts,
};

/** Paths drawn on a full-width band; the rest sit on the page's vertical rhythm. */
const FLUSH_BLOCKS = new Set([
  'editorial-hero',
  'story-band',
  'flash-sale',
  'benefits',
  'testimonials-band',
  'parallax-background',
]);

const RESERVED_HEIGHT: Record<string, string> = {
  'editorial-hero': 'clamp(420px, 70vh, 720px)',
  lookbook: '640px',
  'collection-tabs': '620px',
  'flash-sale': '560px',
  'story-band': '520px',
  benefits: '280px',
  'ugc-gallery': '480px',
  faq: '420px',
  'testimonials-band': '360px',
  'brand-strip': '200px',
  'blog-teaser': '460px',
  'video-feature': '480px',
  'fixed-banner': '280px',
  'photos-slider': '320px',
  'square-photos': '420px',
  'parallax-background': '420px',
  youtube: '420px',
  'store-features': '160px',
  'fixed-products': '620px',
  'products-slider': '520px',
  'latest-products': '620px',
  'featured-products': '620px',
  testimonial: '340px',
};

/** The wrapper each block gets before it mounts: reserved height and spacing class. */
export const homeBlockConfig = Object.fromEntries(
  Object.entries(RESERVED_HEIGHT).map(([path, height]) => [
    path,
    {
      height,
      placeholder: <span className="at-skeleton at-block__placeholder" style={{ height }} />,
      className: `at-block at-block--${path}${FLUSH_BLOCKS.has(path) ? ' at-block--flush' : ''}`,
    },
  ])
);
