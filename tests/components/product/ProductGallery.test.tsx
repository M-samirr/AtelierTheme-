import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductGallery } from '../../../app/components/product/ProductGallery';

const state = vi.hoisted(() => ({
  settings: {} as Record<string, unknown>,
  listeners: {} as Record<string, (payload: unknown) => void>,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: ({ src, alt, priority }: { src?: string; alt: string; priority?: boolean }) => (
    <img src={src} alt={alt} data-priority={priority ? 'yes' : 'no'} />
  ),
}));
vi.mock('../../../app/components/common', () => ({ YoutubeFrame: () => <div /> }));
vi.mock('@salla.sa/twilight-theme-engine/modal', () => ({
  ImageModal: ({ src }: { src: string }) => <div role="dialog">{src}</div>,
}));
vi.mock('@salla.sa/twilight-theme-engine/native-app', () => ({ isNativeApp: () => false }));
vi.mock('@salla.sa/twilight-theme-engine/utils', () => ({
  onSallaEvent: (name: string, listener: (payload: unknown) => void) => {
    state.listeners[name] = listener;
    return () => undefined;
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: string | { defaultValue: string; [key: string]: unknown }) => {
      if (typeof options === 'string') return options;
      return Object.entries(options ?? {}).reduce(
        (text, [key, value]) => text.replace(`{{${key}}}`, String(value)),
        options?.defaultValue ?? _key
      );
    },
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: state.settings } }),
}));

const product = (images: unknown[]) => ({ id: 1, name: 'Dress', images }) as unknown as Product;
const three = [
  { id: 10, url: '/a.jpg' },
  { id: 20, url: '/b.jpg' },
  { id: 30, url: '/c.jpg' },
];
const current = () =>
  screen
    .getAllByRole('button', { name: /Show item/ })
    .findIndex((thumb) => thumb.getAttribute('aria-current') === 'true');

beforeEach(() => {
  state.settings = {};
  state.listeners = {};
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ProductGallery', () => {
  it('shows every image and loads only the first eagerly', () => {
    const { container } = render(<ProductGallery product={product(three)} />);
    const slides = container.querySelectorAll('.at-gallery__slide img');
    expect(slides).toHaveLength(3);
    expect(slides[0]?.getAttribute('data-priority')).toBe('yes');
    expect(slides[1]?.getAttribute('data-priority')).toBe('no');
  });

  it('hides thumbnails and arrows for a single image', () => {
    render(<ProductGallery product={product(three.slice(0, 1))} />);
    expect(screen.queryByRole('button', { name: /Show item/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next image' })).toBeNull();
  });

  it('follows a colour or thumbnail option to its image', () => {
    render(<ProductGallery product={product(three)} />);
    act(() =>
      state.listeners['product-options::change']?.({
        option: { type: 'thumbnail' },
        detail: { option_value: 30 },
      })
    );
    expect(current()).toBe(2);
  });

  it('ignores options that are not about an image', () => {
    render(<ProductGallery product={product(three)} />);
    act(() =>
      state.listeners['product-options::change']?.({
        option: { type: 'text' },
        detail: { option_value: 30 },
      })
    );
    expect(current()).toBe(0);
  });

  it('moves with the arrows and stops at the ends', () => {
    render(<ProductGallery product={product(three)} />);
    const previous = screen.getByRole('button', { name: 'Previous image' }) as HTMLButtonElement;
    expect(previous.disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(current()).toBe(1);
    expect(previous.disabled).toBe(false);
  });

  it('enlarges an image in place', async () => {
    render(<ProductGallery product={product(three)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge image 2' }));
    expect((await screen.findByRole('dialog')).textContent).toBe('/b.jpg');
  });

  it('keeps its shape when a product has no media', () => {
    const { container } = render(<ProductGallery product={product([])} />);
    expect(container.querySelector('.at-gallery--empty')).toBeTruthy();
  });
});
