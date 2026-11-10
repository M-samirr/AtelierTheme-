import { useQuery } from '@tanstack/react-query';
import { blog } from '@salla.sa/twilight-theme-engine/api/blog';
import { brand as brandApi } from '@salla.sa/twilight-theme-engine/api/brands';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useDate } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button, Container, SectionHeading } from '../ui';
import { Rail, YoutubeFrame } from '../common';
import { blockLimit, items, linkUrl, pickIds, youtubeId } from '../../lib/blockData';
import { cn } from '../../lib/cn';
import { settingBoolean, settingChoice, settingNumber, settingText } from '../../lib/settings';
import { paragraphs, plainText } from '../../lib/text';
import type { HomeBlockProps } from './types';

/** The image repeats the title's link, so it stays out of the tab order. */
const HIDDEN_LINK = { tabIndex: -1, 'aria-hidden': true } as object;

const TONES = ['plain', 'tinted', 'brand'] as const;
const SIDES = ['start', 'end'] as const;

/** A photo beside a short story and one button. */
export function StoryBand({ data }: HomeBlockProps) {
  const image = settingText(data.image);
  const tone = settingChoice(data.tone, TONES, 'tinted');
  const side = settingChoice(data.image_side, SIDES, 'start');
  const url = linkUrl(data.cta_url);
  const label = settingText(data.cta_label);
  return (
    <div className={cn('at-story', `at-tone--${tone}`, `at-story--${side}`)}>
      {image && (
        <div className="at-story__media">
          <Image
            src={image}
            alt={settingText(data.image_alt)}
            width={800}
            srcSetWidths={[480, 800, 1200]}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={Boolean(data.priority)}
          />
        </div>
      )}
      <div className="at-story__copy">
        {settingText(data.kicker) && <p className="at-eyebrow">{data.kicker as string}</p>}
        <h2 className="at-story__title">{settingText(data.title)}</h2>
        {paragraphs(settingText(data.body)).map((line) => (
          <p key={line} className="at-story__text">
            {line}
          </p>
        ))}
        {label && url && (
          <Button href={url} variant={tone === 'brand' ? 'secondary' : 'primary'}>
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}

interface Benefit {
  icon?: string;
  title?: string;
  text?: string;
}

/** Icon, title and text in a row: scent notes, skincare benefits, store promises. */
export function Benefits({ data }: HomeBlockProps) {
  const list = items<Benefit>(data.items).filter((item) => settingText(item.title));
  const columns = settingNumber(data.columns, 3, { min: 2, max: 4 });
  const tone = settingChoice(data.tone, TONES, 'plain');
  if (!list.length) return null;
  return (
    <div className={cn('at-band', `at-tone--${tone}`)}>
      <Container>
        <SectionHeading
          title={settingText(data.title)}
          subtitle={settingText(data.subtitle)}
          align="center"
        />
        <ul className="at-benefits" style={{ '--columns': columns } as React.CSSProperties}>
          {list.map((item, index) => (
            <li key={`${item.title}-${index}`} className="at-benefits__item">
              {item.icon && <i className={item.icon} aria-hidden="true" />}
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

interface GalleryItem {
  image?: string;
  alt?: string;
  url?: unknown;
}

/** Photos from customers or social media, each optionally linking to a product. */
export function UgcGallery({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const list = items<GalleryItem>(data.items).filter((item) => item.image);
  const handleUrl = linkUrl(data.handle_url);
  const handle = settingText(data.handle);
  if (!list.length) return null;
  return (
    <Container>
      <SectionHeading
        title={settingText(data.title)}
        subtitle={settingText(data.subtitle)}
        action={handle && handleUrl ? { label: handle, href: handleUrl } : undefined}
      />
      <div className="at-ugc">
        {list.map((item, index) => {
          const url = linkUrl(item.url);
          const picture = (
            <Image
              src={item.image}
              alt={item.alt ?? ''}
              width={480}
              srcSetWidths={[320, 480, 640]}
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          );
          return url ? (
            <Link
              key={`${item.image}-${index}`}
              to={url}
              className="at-ugc__item"
              aria-label={item.alt || t('theme.block.view_item', 'View')}
            >
              {picture}
            </Link>
          ) : (
            <div key={`${item.image}-${index}`} className="at-ugc__item">
              {picture}
            </div>
          );
        })}
      </div>
    </Container>
  );
}

interface FaqItem {
  question?: string;
  answer?: string;
}

/** Questions and answers on native disclosure elements, so they work before any script. */
export function Faq({ data }: HomeBlockProps) {
  const list = items<FaqItem>(data.items).filter((item) => settingText(item.question));
  const openFirst = settingBoolean(data.open_first, true);
  if (!list.length) return null;
  return (
    <Container size="narrow">
      <SectionHeading
        title={settingText(data.title)}
        subtitle={settingText(data.subtitle)}
        align="center"
      />
      <div className="at-faq">
        {list.map((item, index) => (
          <details key={`${item.question}-${index}`} open={openFirst && index === 0}>
            <summary>
              <span>{item.question}</span>
              <i className="sicon-keyboard_arrow_down" aria-hidden="true" />
            </summary>
            {paragraphs(item.answer).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </details>
        ))}
      </div>
    </Container>
  );
}

interface Review {
  name?: string;
  avatar?: string;
  meta?: string;
  stars?: unknown;
  text?: string;
}

/** Reviews the merchant writes in, as a scrolling row. */
export function TestimonialsBand({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const list = items<Review>(data.items).filter((item) => settingText(item.text));
  if (!list.length) return null;
  return (
    <div className="at-band at-tone--tinted">
      <Container>
        <SectionHeading title={settingText(data.title)} subtitle={settingText(data.subtitle)} />
        <Rail density="wide" label={settingText(data.title)}>
          {list.map((item, index) => {
            const stars = settingNumber(item.stars, 5, { min: 0, max: 5 });
            return (
              <figure key={`${item.name}-${index}`} className="at-review">
                <div
                  className="at-review__stars"
                  role="img"
                  aria-label={t('theme.block.rated', {
                    defaultValue: 'Rated {{n}} out of 5',
                    n: stars,
                  })}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className={star <= stars ? 'sicon-star2' : 'sicon-star-o'} />
                  ))}
                </div>
                <blockquote>{item.text}</blockquote>
                <figcaption>
                  {item.avatar && (
                    <Image src={item.avatar} alt="" width={44} height={44} objectFit="cover" />
                  )}
                  <span>
                    <b>{item.name}</b>
                    {item.meta && <small>{item.meta}</small>}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </Rail>
      </Container>
    </div>
  );
}

interface BrandEntry {
  id?: number | string;
  name?: string;
  logo?: string;
  url?: string;
}

/** A row of brand logos. Falls back to the brand list when a pick holds only ids. */
export function BrandStrip({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const saved = items<BrandEntry>(data.brands);
  const hasFullEntries = saved.some((entry) => entry && typeof entry === 'object' && entry.logo);
  const { data: fetched } = useQuery({ ...brandApi.queries.list(), enabled: !hasFullEntries });
  const ids = new Set(pickIds(data.brands));
  const list: BrandEntry[] = hasFullEntries
    ? saved
    : (fetched?.items ?? []).filter((entry) => !ids.size || ids.has(Number(entry.id)));
  const muted = settingBoolean(data.muted, true);
  if (!list.length) return null;
  return (
    <Container>
      <SectionHeading
        title={settingText(data.title)}
        action={
          settingBoolean(data.show_all, true)
            ? { label: t('theme.actions.view_all', 'View all'), href: '/brands' }
            : undefined
        }
      />
      <Rail
        label={settingText(data.title)}
        className={cn('at-brands', muted && 'at-brands--muted')}
      >
        {list.map((entry) => (
          <Link key={entry.id} to={entry.url ?? '/brands'} className="at-brands__item">
            <Image
              src={entry.logo}
              alt={entry.name ?? ''}
              width={200}
              height={100}
              objectFit="contain"
            />
          </Link>
        ))}
      </Rail>
    </Container>
  );
}

/** The newest articles: one list request, with the image, summary, author and date of each. */
export function BlogTeaser({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const { format } = useDate();
  const limit = blockLimit(data.limit, 3);
  const { data: result, isLoading } = useQuery(blog.queries.articles({}));
  const articles = (result?.data ?? []).slice(0, limit);

  if (!isLoading && !articles.length) return null;

  return (
    <Container>
      <SectionHeading
        title={settingText(data.title, t('theme.block.blog', 'From the journal'))}
        subtitle={settingText(data.subtitle)}
        action={{ label: t('theme.actions.view_all', 'View all'), href: '/blog' }}
      />
      <div className="at-articles">
        {isLoading
          ? Array.from({ length: limit }, (_, index) => (
              <span key={index} className="at-skeleton at-articles__placeholder" />
            ))
          : articles.map((article) => {
              const created = article.created_at;
              const date =
                typeof created === 'string' && Number.isNaN(Date.parse(created))
                  ? created
                  : created && format(created);
              const summary =
                article.promotion_title?.trim() || plainText(article.description).slice(0, 140);
              return (
                <article key={article.id} className="at-article">
                  <Link to={article.url} className="at-article__media" {...HIDDEN_LINK}>
                    <Image
                      src={article.image}
                      alt=""
                      width={480}
                      srcSetWidths={[320, 480, 720]}
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </Link>
                  <p className="at-article__meta">
                    {article.author?.name}
                    {article.author?.name && date ? ' · ' : ''}
                    {date}
                  </p>
                  <h3 className="at-article__title">
                    <Link to={article.url}>{article.name}</Link>
                  </h3>
                  {summary && <p className="at-article__summary">{summary}</p>}
                </article>
              );
            })}
      </div>
    </Container>
  );
}

/** A YouTube video that loads only when played, under an optional heading. */
export function VideoFeature({ data }: HomeBlockProps) {
  const id = youtubeId(data.video);
  if (!id) return null;
  return (
    <Container size="narrow">
      <SectionHeading
        title={settingText(data.title)}
        subtitle={settingText(data.subtitle)}
        align="center"
      />
      <YoutubeFrame
        id={id}
        poster={settingText(data.poster) || undefined}
        title={settingText(data.title)}
      />
    </Container>
  );
}
