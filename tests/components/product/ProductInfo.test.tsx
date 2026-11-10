import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductInfo, TrustRow } from '../../../app/components/product/ProductInfo';

const state = vi.hoisted(() => ({ settings: {} as Record<string, unknown> }));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children }: { to: string; children?: unknown }) => (
    <a href={to}>{children as never}</a>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    locale: 'en',
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: state.settings } }),
}));
vi.mock('@salla.sa/twilight-components-react/metadata', () => ({
  SallaMetadata: () => <div data-testid="metadata" />,
}));

const product = (extra: Partial<Product> = {}) =>
  ({ id: 1, name: 'Dress', description: '<p>Soft linen</p>', ...extra }) as Product;

beforeEach(() => {
  state.settings = {};
});

describe('ProductInfo', () => {
  it('renders nothing when the product has nothing to say', () => {
    const { container } = render(<ProductInfo product={product({ description: '' })} />);
    expect(container.firstChild).toBeNull();
  });

  it('switches tabs and keeps the other panel in the page', () => {
    render(<ProductInfo product={product({ sku: 'AB-1' })} />);
    const details = screen.getByRole('tab', { name: 'Details' });
    expect(screen.getByRole('tab', { name: 'Description' }).getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(screen.getByText('AB-1').closest('[role="tabpanel"]')?.hasAttribute('hidden')).toBe(
      true
    );

    fireEvent.click(details);
    expect(details.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('AB-1').closest('[role="tabpanel"]')?.hasAttribute('hidden')).toBe(
      false
    );
    expect(screen.getByText('Soft linen')).toBeTruthy();
  });

  it('moves between tabs with the arrow keys', () => {
    render(<ProductInfo product={product({ sku: 'AB-1' })} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Description' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Details' }).getAttribute('aria-selected')).toBe('true');
  });

  it('can be an accordion with the first section open', () => {
    state.settings = { product_info_layout: 'accordion' };
    const { container } = render(<ProductInfo product={product({ sku: 'AB-1' })} />);
    const folds = container.querySelectorAll('details');
    expect(folds).toHaveLength(2);
    expect(folds[0]?.open).toBe(true);
    expect(folds[1]?.open).toBe(false);
  });

  it('collapses a long description until asked', () => {
    render(<ProductInfo product={product({ has_read_more: true })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Read more' }));
    expect(screen.queryByRole('button', { name: 'Read more' })).toBeNull();
  });

  it('shows the extra section as text, never as HTML', () => {
    state.settings = { product_extra_title: 'Returns', product_extra_text: '<b>14 days</b>' };
    render(<ProductInfo product={product()} />);
    expect(screen.getByRole('tab', { name: 'Returns' })).toBeTruthy();
    expect(screen.getByText('<b>14 days</b>')).toBeTruthy();
  });

  it('hides tags when the merchant turns them off', () => {
    state.settings = { show_tags: false };
    render(<ProductInfo product={product({ tags: [{ name: 'Linen', url: '/t' }] } as never)} />);
    expect(screen.queryByText('Linen')).toBeNull();
  });
});

describe('TrustRow', () => {
  it('shows up to four lines and nothing when empty', () => {
    const { container, rerender } = render(<TrustRow />);
    expect(container.firstChild).toBeNull();

    state.settings = { product_trust_items: 'a\nb\nc\nd\ne' };
    rerender(<TrustRow />);
    expect(container.querySelectorAll('li')).toHaveLength(4);
  });
});
