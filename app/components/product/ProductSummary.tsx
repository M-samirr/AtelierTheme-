import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { CurrencySymbol, Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { getActiveCurrency } from '@salla.sa/twilight-theme-engine/api/client';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { formatSallaPlural } from '@salla.sa/twilight-theme-engine/utils';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';
import { SallaInstallment } from '@salla.sa/twilight-components-react/installment';
import { useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { discountPercent } from './ProductCard';
import { cn } from '../../lib/cn';

function Price({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { format } = useNumber();
  // The API converts the amounts but still labels them in the store's own currency.
  const currency = getActiveCurrency(product.currency);
  const off = discountPercent(product);

  if (product.is_on_sale) {
    return (
      <p className="at-pdp-price">
        <b className="at-pdp-price__now is-sale">
          {product.sale_price} <CurrencySymbol currency={currency} />
        </b>
        <s className="at-pdp-price__was">
          {product.regular_price} <CurrencySymbol currency={currency} />
        </s>
        {off !== null && (
          <span className="at-badge at-badge--sale">
            {t('theme.product.percent_off', {
              defaultValue: '{{percent}}% off',
              percent: format(off),
            })}
          </span>
        )}
      </p>
    );
  }
  return (
    <p className="at-pdp-price">
      {product.starting_price && (
        <span className="at-pdp-price__from">
          {t('pages.products.starting_price', 'Starting from')}
        </span>
      )}
      <b className="at-pdp-price__now">
        {product.starting_price ?? product.price} <CurrencySymbol currency={currency} />
      </b>
    </p>
  );
}

function Stock({ product }: { product: Product }) {
  const { t } = useTranslation();
  const sold = product.sold_quantity ?? 0;
  if (sold <= 0 && !product.can_show_remained_quantity) return null;
  return (
    <ul className="at-pdp-stock">
      {sold > 0 && (
        <li>
          <i className="sicon-fire" /> {t('pages.products.sold', 'Sold')}{' '}
          {/* Salla ships `sold_times` in Laravel plural format; resolve it for the count. */}
          {formatSallaPlural(t('pages.products.sold_times'), sold)}
        </li>
      )}
      {product.can_show_remained_quantity && (
        <li>
          <i className="sicon-box-bankers" /> {t('pages.products.remained', 'Remained')}:{' '}
          {product.quantity}
        </li>
      )}
    </ul>
  );
}

/**
 * The top of the buy box. Forked from the engine's ProductDetails: the description, SKU, barcode
 * and tags move to `ProductInfo`, below the buttons, so options and add-to-cart stay near the top
 * on a phone. Every hook slot stays.
 */
export function ProductSummary({ product }: { product: Product }) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const context = { product };
  const inWishlist = wishlist.has(Number(product.id));
  const base = product.base_currency_price;

  return (
    <>
      <HookSlot name="product:single.description.start" context={context} />

      {product.brand?.name && (
        <Link className="at-pdp-brand" to={product.brand.url || '#'} title={product.brand.name}>
          {product.brand.logo ? (
            <Image src={product.brand.logo} alt={product.brand.name} width={96} height={48} />
          ) : (
            product.brand.name
          )}
        </Link>
      )}

      <h1 className="at-pdp-title">{product.name}</h1>
      {product.subtitle && <p className="at-pdp-subtitle">{product.subtitle}</p>}

      {!!product.rating && (
        <SallaRatingStars value={product.rating.stars} reviews={product.rating.count} />
      )}

      <Price product={product} />
      {product.is_taxable && (
        <small className="at-pdp-tax">{t('pages.products.tax_included', 'VAT Inclusive')}</small>
      )}

      <div className="at-pdp-actions">
        <SallaSocialShare className="at-pdp-share" aria-label={t('theme.pdp.share', 'Share')} />
        <button
          type="button"
          className={cn('at-icon-btn', inWishlist && 'is-active')}
          aria-pressed={inWishlist}
          aria-label={t('theme.product.wishlist', 'Add to wishlist')}
          onClick={() => wishlist.toggle(Number(product.id))}
        >
          <i className="sicon-heart" />
        </button>
      </div>

      <Stock product={product} />

      {product.show_availability && (
        <button
          type="button"
          className="at-pdp-row"
          onClick={() =>
            window.salla?.event?.dispatch('scopes::open', {
              mode: 'availability',
              product_id: String(product.id),
            })
          }
        >
          <span>
            <i className="sicon-location" /> {t('pages.products.availability', 'Availability')}
          </span>
          <span className="at-pdp-row__action">
            {t('pages.products.select_branch', 'Select Branch')}
            <i className="sicon-keyboard_arrow_left at-flip-ltr" />
          </span>
        </button>
      )}

      <HookSlot name="product:single.description" context={context} />

      <SallaInstallment price={String(typeof base === 'object' ? base.amount : base)} />
    </>
  );
}
