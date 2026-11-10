import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollectionTabs } from '../../../app/components/home/CollectionTabs';
import { EditorialHero } from '../../../app/components/home/EditorialHero';
import { FlashSale } from '../../../app/components/home/FlashSale';
import {
  Benefits,
  Faq,
  TestimonialsBand,
  VideoFeature,
} from '../../../app/components/home/ContentBlocks';

const state = vi.hoisted(() => ({
  queryResult: { isLoading: false, isError: false, data: { items: [] as unknown[] } },
  shelfCalls: [] as unknown[],
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => state.queryResult,
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { queries: { list: (params: unknown) => ({ queryKey: [params] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/blog', () => ({ blog: { queries: {} } }));
vi.mock('@salla.sa/twilight-theme-engine/api/brands', () => ({
  brand: { queries: { list: () => ({}) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, href, children }: { to?: string; href?: string; children?: unknown }) => (
    <a href={to ?? href}>{children as never}</a>
  ),
  Image: ({ src, alt }: { src?: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useNumber: () => ({ format: (value: unknown) => String(value) }),
  useDate: () => ({ format: (value: unknown) => String(value) }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    isRTL: false,
    t: (_key: string, options?: string | { defaultValue: string; [key: string]: unknown }) => {
      if (typeof options === 'string') return options;
      return Object.entries(options ?? {}).reduce(
        (text, [key, value]) => text.replace(`{{${key}}}`, String(value)),
        options?.defaultValue ?? _key
      );
    },
  }),
}));
vi.mock('../../../app/components/common', async () => ({
  YoutubeFrame: (
    await vi.importActual<{ YoutubeFrame: unknown }>('../../../app/components/common/YoutubeFrame')
  ).YoutubeFrame,
  ProductShelf: (props: { source: unknown; label?: string }) => {
    state.shelfCalls.push(props.source);
    return <div data-testid="shelf">{props.label}</div>;
  },
  ProductRow: ({ products }: { products: unknown[] }) => (
    <div data-testid="row">{products.length}</div>
  ),
  ShelfSkeleton: () => <div data-testid="skeleton" />,
  Rail: ({ children }: { children?: unknown }) => <div>{children as never}</div>,
}));
vi.mock('../../../app/components/product', () => ({ ProductCard: () => <div /> }));

describe('EditorialHero', () => {
  const slides = [
    {
      'slides.image': 'a.jpg',
      'slides.headline': 'First',
      'slides.cta_label': 'Shop',
      'slides.cta_url': '/shop',
    },
    { image: 'b.jpg', headline: 'Second' },
    { headline: 'No image is skipped' },
  ];

  it('accepts collection keys with or without the field prefix and skips imageless slides', () => {
    render(<EditorialHero data={{ slides, autoplay: false }} />);
    expect(screen.getByRole('heading', { name: 'First', hidden: true })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Second', hidden: true })).toBeTruthy();
    expect(screen.queryByText('No image is skipped')).toBeNull();
    expect(screen.getByRole('link', { name: 'Shop' }).getAttribute('href')).toBe('/shop');
  });

  it('moves between slides with the dots', () => {
    const { container } = render(<EditorialHero data={{ slides, autoplay: false }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }));
    const active = container.querySelector('.at-hero__slide.is-active');
    expect(active?.textContent).toContain('Second');
  });

  it('renders nothing without a usable slide', () => {
    const { container } = render(<EditorialHero data={{ slides: [{ headline: 'x' }] }} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('CollectionTabs', () => {
  const tabs = [
    { label: 'New', source: 'latest' },
    { label: 'Sale', source: [{ value: 'sales' }] },
    { label: 'Picked', source: 'selected', products: [{ id: 5 }, 9] },
  ];

  beforeEach(() => {
    state.shelfCalls = [];
  });

  it('loads only the open tab and switches on click', () => {
    render(<CollectionTabs data={{ title: 'Shop', tabs }} />);
    expect(state.shelfCalls).toEqual([{ source: 'latest' }]);
    fireEvent.click(screen.getByRole('tab', { name: 'Picked' }));
    expect(state.shelfCalls.at(-1)).toEqual({ source: 'selected', sourceValue: [5, 9] });
    expect(screen.getByRole('tab', { name: 'Picked' }).getAttribute('aria-selected')).toBe('true');
  });

  it('moves with the arrow keys and wraps around', () => {
    render(<CollectionTabs data={{ tabs }} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Picked' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'New' }).getAttribute('aria-selected')).toBe('true');
  });

  it('shows no tab list for a single tab', () => {
    render(<CollectionTabs data={{ tabs: tabs.slice(0, 1) }} />);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByTestId('shelf')).toBeTruthy();
  });
});

describe('FlashSale', () => {
  beforeEach(() => {
    state.queryResult = { isLoading: false, isError: false, data: { items: [{ id: 1 }] } };
  });

  it('hides once the end time has passed, unless the merchant keeps it', async () => {
    const data = { title: 'Ends soon', ends_at: '2020-01-01 10:00' };
    const { container, unmount } = render(<FlashSale data={data} />);
    expect(container.firstChild).toBeNull();
    unmount();
    render(<FlashSale data={{ ...data, hide_when_expired: false }} />);
    expect(screen.getByRole('heading', { name: 'Ends soon' })).toBeTruthy();
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('shows the clock for a future end time', () => {
    render(<FlashSale data={{ title: 'Ends soon', ends_at: '2999-01-01 10:00' }} />);
    expect(screen.getByRole('timer').textContent).toContain('Days');
  });

  it('renders nothing when there are no products', () => {
    state.queryResult = { isLoading: false, isError: false, data: { items: [] } };
    const { container } = render(<FlashSale data={{ title: 'x', ends_at: '2999-01-01' }} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('content blocks', () => {
  it('Faq opens the first question by default and renders text as text', () => {
    const { container } = render(
      <Faq
        data={{
          title: 'FAQ',
          items: [
            { question: 'Q1', answer: 'Line one\nLine two' },
            { question: 'Q2', answer: '<b>raw</b>' },
          ],
        }}
      />
    );
    const details = container.querySelectorAll('details');
    expect(details[0].open).toBe(true);
    expect(details[1].open).toBe(false);
    expect(container.querySelectorAll('details')[0].querySelectorAll('p').length).toBe(2);
    expect(container.querySelector('details b')).toBeNull();
    expect(screen.getByText('<b>raw</b>')).toBeTruthy();
  });

  it('Benefits drops untitled items and renders nothing when none remain', () => {
    const { container } = render(<Benefits data={{ items: [{ text: 'no title' }] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('TestimonialsBand names the rating for screen readers', () => {
    render(<TestimonialsBand data={{ items: [{ name: 'Noura', stars: 4, text: 'Lovely' }] }} />);
    expect(screen.getByRole('img', { name: 'Rated 4 out of 5' })).toBeTruthy();
  });

  it('VideoFeature loads the player only when played', () => {
    const { container } = render(
      <VideoFeature data={{ title: 'Story', video: 'https://youtu.be/aqz-KE-bpKQ' }} />
    );
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Story' }));
    expect(container.querySelector('iframe')?.getAttribute('src')).toContain('aqz-KE-bpKQ');
  });

  it('VideoFeature renders nothing for a link it cannot read', () => {
    const { container } = render(<VideoFeature data={{ video: 'not a link!' }} />);
    expect(container.firstChild).toBeNull();
  });
});
