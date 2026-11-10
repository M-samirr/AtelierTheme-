import { useState } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { Button, Container, SectionHeading } from '../ui';
import { ProductCard } from '../product';
import { ProductRow, ProductShelf, Rail, YoutubeFrame } from '../common';
import { blockLimit, items, linkUrl, pickIds, youtubeId } from '../../lib/blockData';
import { cn } from '../../lib/cn';
import { settingText } from '../../lib/settings';
import type { HomeBlockProps } from './types';

/*
 * The blocks Salla ships (`component-*` features), redrawn in the theme's style
 * under the engine's keys, so a merchant's existing sections keep working and
 * look like the rest of the theme. Field shapes come from the engine's own
 * components; see docs "Built-in home blocks".
 */

type ImageField = string | { url?: string; alt?: string; small_url?: string } | undefined;

const imageUrl = (image: ImageField) => (typeof image === 'string' ? image : image?.url);

export function FixedBanner({ data }: HomeBlockProps) {
  const image = data.image as ImageField;
  const url = linkUrl(data.url);
  const src = imageUrl(image);
  if (!src) return null;
  const alt = (typeof image === 'object' && image?.alt) || settingText(data.title);
  const picture = (
    <Image
      src={src}
      mobileSrc={(typeof image === 'object' && image?.small_url) || undefined}
      alt={alt}
      width={1280}
      srcSetWidths={[640, 1080, 1280, 1920]}
      sizes="100vw"
      objectFit="contain"
      priority={Boolean(data.priority)}
    />
  );
  return (
    <Container className="at-banner">
      {url ? (
        <Link to={url} aria-label={alt || undefined}>
          {picture}
        </Link>
      ) : (
        picture
      )}
    </Container>
  );
}

interface PhotoItem {
  id?: string | number;
  image?: ImageField;
  url?: unknown;
  text?: string;
}

export function PhotosSlider({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const list = items<PhotoItem>(data.items).filter((item) => imageUrl(item.image));
  if (!list.length) return null;
  return (
    <Container>
      <Rail density="wide" className="at-photos">
        {list.map((item, index) => {
          const url = linkUrl(item.url);
          const picture = (
            <Image
              src={imageUrl(item.image)}
              alt=""
              width={1080}
              srcSetWidths={[640, 1080, 1600]}
              sizes="100vw"
              priority={Boolean(data.priority) && index === 0}
            />
          );
          return url ? (
            <Link
              key={item.id ?? index}
              to={url}
              aria-label={
                settingText(item.text) ||
                t('theme.block.open_photo', { defaultValue: 'Open photo {{n}}', n: index + 1 })
              }
            >
              {picture}
            </Link>
          ) : (
            <div key={item.id ?? index}>{picture}</div>
          );
        })}
      </Rail>
    </Container>
  );
}

export function SquarePhotos({ data }: HomeBlockProps) {
  const list = items<PhotoItem>(data.items).filter((item) => imageUrl(item.image));
  if (!list.length) return null;
  return (
    <Container>
      <SectionHeading title={settingText(data.title)} />
      <div className="at-mosaic" data-count={Math.min(list.length, 5)}>
        {list.map((item, index) => (
          <Link key={item.id ?? index} to={linkUrl(item.url) || '#'} className="at-mosaic__item">
            <Image
              src={imageUrl(item.image)}
              alt=""
              width={640}
              srcSetWidths={[320, 640, 960]}
              sizes="(min-width: 768px) 33vw, 50vw"
            />
            {item.text && <span>{item.text}</span>}
          </Link>
        ))}
      </div>
    </Container>
  );
}

export function ParallaxBackground({ data }: HomeBlockProps) {
  const src = imageUrl(data.image as ImageField);
  const url = linkUrl(data.url);
  const linkText = settingText(data.link_text);
  if (!src) return null;
  return (
    <div className="at-parallax" style={{ backgroundImage: `url(${src})` }}>
      <div className="at-parallax__copy">
        {settingText(data.title) && <h2>{data.title as string}</h2>}
        {url && linkText && <Button href={url}>{linkText}</Button>}
      </div>
    </div>
  );
}

export function Youtube({ data }: HomeBlockProps) {
  const id = youtubeId(data.youtube_id);
  if (!id) return null;
  return (
    <Container size="narrow">
      <YoutubeFrame id={id} />
    </Container>
  );
}

interface Feature {
  icon?: string;
  title?: string;
  description?: string;
}

export function StoreFeatures({ data }: HomeBlockProps) {
  const list = items<Feature>(data.features);
  if (!list.length) return null;
  return (
    <Container>
      <ul className="at-features">
        {list.map((feature, index) => (
          <li key={`${feature.title}-${index}`}>
            {feature.icon && <i className={feature.icon} aria-hidden="true" />}
            <div>
              <h2>{feature.title}</h2>
              {feature.description && <p>{feature.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}

interface SourceField {
  source?: ProductsListSource;
  source_value?: unknown;
}

function shelfSource(raw: unknown) {
  const field = (raw ?? {}) as SourceField;
  if (!field.source) return null;
  const ids = pickIds(field.source_value);
  return { source: field.source, sourceValue: ids.length ? ids : undefined };
}

function PlatformShelf({ data, display }: HomeBlockProps & { display: 'grid' | 'rail' }) {
  const { t } = useTranslation();
  const url = linkUrl(data.display_all_url);
  return (
    <Container>
      <SectionHeading
        title={settingText(data.title)}
        action={url ? { label: t('theme.actions.view_all', 'View all'), href: url } : undefined}
      />
      <ProductShelf
        source={shelfSource(data.products)}
        limit={blockLimit(data.limit, 8)}
        display={display}
        priority={Boolean(data.priority)}
        label={settingText(data.title)}
      />
    </Container>
  );
}

export function FixedProducts({ data }: HomeBlockProps) {
  return <PlatformShelf data={data} display="grid" />;
}

export function ProductsSlider({ data }: HomeBlockProps) {
  return <PlatformShelf data={data} display="rail" />;
}

/** What a home page with no blocks shows. */
export function LatestProducts({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  return (
    <Container>
      <SectionHeading title={t('theme.block.latest', 'New arrivals')} />
      <ProductShelf
        source={{ source: 'latest' }}
        limit={12}
        display="grid"
        priority={Boolean(data.priority)}
      />
    </Container>
  );
}

interface FeaturedSection {
  id?: string;
  title?: string;
  name?: string;
  products?: Product[];
  featured_product?: Product;
}

const usable = (products: Product[] | undefined) =>
  (products ?? []).filter((item) => item && item.name);

/** Groups of products in tabs, for all three of Salla's featured-products styles. */
export function FeaturedProducts({ data }: HomeBlockProps) {
  const sections = items<FeaturedSection>(data.items);
  const [active, setActive] = useState(0);
  const main = (data.main_product ?? {}) as { title?: string; product?: Product };
  if (!sections.length) return null;

  const current = sections[Math.min(active, sections.length - 1)];
  const big = main.product ?? current.featured_product;
  const products = usable(current.products);
  const heading = settingText(main.title) || settingText(data.title);

  return (
    <Container>
      <SectionHeading title={heading} />
      {sections.length > 1 && (
        <div className="at-tabs">
          {sections.map((section, index) => (
            <button
              key={section.id ?? index}
              type="button"
              className={cn('at-tabs__tab', index === active && 'is-active')}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              {section.title || section.name}
            </button>
          ))}
        </div>
      )}
      {big?.name ? (
        <div className="at-featured">
          <ProductCard product={big} layout="fullImage" />
          <div className="at-grid at-grid--two">
            {products.slice(0, 4).map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <ProductRow
          products={products.slice(0, 8)}
          display={data.is_slider ? 'rail' : 'grid'}
          priority={Boolean(data.priority)}
        />
      )}
    </Container>
  );
}
