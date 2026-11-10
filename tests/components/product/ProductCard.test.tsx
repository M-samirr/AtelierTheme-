import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard, discountPercent } from '../../../app/components/product/ProductCard';

const state = vi.hoisted(() => ({
  settings: {} as Record<string, unknown>,
  inWishlist: false,
  toggle: vi.fn(),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: { to: string; children?: unknown }) => (
    <a href={to} {...rest}>
      {children as never}
    </a>
  ),
  Image: ({ src, alt, className }: { src?: string; alt: string; className?: string }) =>
    src ? <img src={src} alt={alt} className={className} /> : null,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => `SAR ${value}` }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ has: () => state.inWishlist, toggle: state.toggle }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useAsset', () => ({
  useAsset: () => ({ isPlaceholder: () => false }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useHostAttributes', () => ({
  useHostAttributes: () => () => undefined,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useNumber: () => ({ format: (value: unknown) => String(value) }),
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
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({ productStatus }: { productStatus: string }) => (
    <button data-testid="add" data-status={productStatus} />
  ),
}));

const base = {
  id: 7,
  name: 'Linen dress',
  url: 'https://store.test/dress/p7',
  type: 'product',
  status: 'sale',
  price: 200,
  sale_price: null,
  regular_price: 200,
  is_on_sale: false,
  is_out_of_stock: false,
  image: { url: 'https://cdn.test/a.jpg', alt: 'Dress' },
} as unknown as Product;

const product = (extra: Partial<Product>) => ({ ...base, ...extra }) as Product;

describe('ProductCard', () => {
  beforeEach(() => {
    state.settings = {};
    state.inWishlist = false;
    state.toggle.mockClear();
  });

  it('links the name to the product and shows the price', () => {
    render(<ProductCard product={base} />);
    expect(screen.getByRole('heading', { name: 'Linen dress' })).toBeTruthy();
    expect(screen.getAllByRole('link')[0].getAttribute('href')).toBe(base.url);
    expect(screen.getByText('SAR 200')).toBeTruthy();
  });

  it('shows the sale price, the old price and the percentage off', () => {
    render(<ProductCard product={product({ is_on_sale: true, sale_price: 150 })} />);
    expect(screen.getByText('SAR 150')).toBeTruthy();
    expect(screen.getByText('SAR 200')).toBeTruthy();
    expect(screen.getByText('25% off')).toBeTruthy();
  });

  it('prefers the merchant promotion title over the computed discount', () => {
    render(
      <ProductCard
        product={product({ is_on_sale: true, sale_price: 150, promotion_title: 'Eid offer' })}
      />
    );
    expect(screen.getByText('Eid offer')).toBeTruthy();
    expect(screen.queryByText('25% off')).toBeNull();
  });

  it('marks a sold-out product and offers to notify', () => {
    const { container } = render(<ProductCard product={product({ is_out_of_stock: true })} />);
    expect(screen.getByText('Sold out')).toBeTruthy();
    expect(container.querySelector('.at-card--sold-out')).not.toBeNull();
    expect(screen.getByTestId('add').dataset.status).toBe('out-and-notify');
  });

  it('keeps the product status when the merchant turned notify off', () => {
    state.settings = { notify_when_available_in_card: false };
    render(<ProductCard product={product({ is_out_of_stock: true })} />);
    expect(screen.getByTestId('add').dataset.status).toBe('sale');
  });

  it('toggles the wishlist and reports its state', () => {
    state.inWishlist = true;
    render(<ProductCard product={base} />);
    const button = screen.getByRole('button', { name: 'Add to wishlist' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(button);
    expect(state.toggle).toHaveBeenCalledWith(7);
  });

  it('shows a second image only for the second-image hover effect', () => {
    const withImages = product({
      images: [{ url: 'https://cdn.test/a.jpg' }, { url: 'https://cdn.test/b.jpg' }] as never,
    });
    const { container, unmount } = render(<ProductCard product={withImages} />);
    expect(container.querySelector('.at-card__img--second')).not.toBeNull();
    unmount();
    state.settings = { product_card_hover: 'zoom' };
    const again = render(<ProductCard product={withImages} />);
    expect(again.container.querySelector('.at-card__img--second')).toBeNull();
  });

  it('hides quick add when asked, by setting or by prop', () => {
    state.settings = { product_card_quick_add: false };
    const { unmount } = render(<ProductCard product={base} />);
    expect(screen.queryByTestId('add')).toBeNull();
    unmount();
    state.settings = {};
    render(<ProductCard product={base} withoutAddButton />);
    expect(screen.queryByTestId('add')).toBeNull();
  });

  it('computes a discount only when it is honest', () => {
    expect(discountPercent(product({ is_on_sale: true, sale_price: 75, regular_price: 100 }))).toBe(
      25
    );
    expect(discountPercent(product({ is_on_sale: false, sale_price: 75 }))).toBeNull();
    expect(
      discountPercent(product({ is_on_sale: true, sale_price: 120, regular_price: 100 }))
    ).toBeNull();
  });
});
