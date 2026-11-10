import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import ar from '../../locales/ar.json';
import en from '../../locales/en.json';

const read = (file: string) => readFileSync(`app/styles/${file}`, 'utf8');
const partials = ['engine-pages', 'cart', 'content-pages', 'account'];
const css = partials.map((name) => read(`04-components/_${name}.scss`)).join('\n');

describe('styles for the engine pages', () => {
  it('are part of the full stylesheet', () => {
    const app = read('app.scss');
    for (const name of partials) expect(app).toContain(`@import './04-components/${name}';`);
  });

  it.each([
    'no-content-placeholder',
    'btn--outline-primary',
    'btn--coupon',
    'blog-slider__content',
    'content-entry',
    'brands-nav',
    'brand-item',
    'profile-header',
    's-orders-filters',
    'product-entry--wishlist',
  ])('cover .%s', (selector) => {
    expect(css).toContain(selector);
  });

  it('use logical properties so both directions work', () => {
    expect(css).not.toMatch(/(?:margin|padding|border)-(?:left|right)\s*:/);
    expect(css).not.toMatch(/(?:^|\s)(?:left|right)\s*:/m);
    expect(css).not.toMatch(/text-align:\s*(?:left|right)/);
  });
});

describe('strings the store does not supply', () => {
  it.each([
    'pages.cart.apply_coupon_btn',
    'pages.thank_you.contact_us',
    'common.buttons.back',
    'pages.wishlist.share',
  ])('%s exists in both languages', (key) => {
    expect((ar as Record<string, string>)[key]).toBeTruthy();
    expect((en as Record<string, string>)[key]).toBeTruthy();
  });

  it('the Arabic coupon button is not the English fallback', () => {
    expect((ar as Record<string, string>)['pages.cart.apply_coupon_btn']).not.toBe('Apply');
  });
});
