import { memo, useCallback } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useAsset } from '@salla.sa/twilight-theme-engine/hooks/useAsset';
import { useHostAttributes } from '@salla.sa/twilight-theme-engine/hooks/useHostAttributes';
import { useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ProductCardProps } from '@salla.sa/twilight-theme-engine/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { settingBoolean, settingChoice } from '../../lib/settings';

const IMAGE_WIDTHS = [240, 360, 480, 720] as const;
const IMAGE_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';
const WIDE_IMAGE_SIZES = '(min-width: 1024px) 50vw, 100vw';
const HOVER_EFFECTS = ['second-image', 'zoom', 'none'] as const;

/** The percentage off, when the card can show an honest one. */
export function discountPercent(product: Product): number | null {
  if (!product.is_on_sale || !product.sale_price || !product.regular_price) return null;
  const off = Math.round((1 - product.sale_price / product.regular_price) * 100);
  return off > 0 && off < 100 ? off : null;
}

function Badges({ product, withQuantity }: { product: Product; withQuantity: boolean }) {
  const { t } = useTranslation();
  const { format } = useNumber();
  const preorder = product.preorder?.label;
  const off = discountPercent(product);

  if (product.is_out_of_stock) {
    return (
      <div className="at-card__badges">
        <span className="at-badge at-badge--muted">{t('theme.product.sold_out', 'Sold out')}</span>
      </div>
    );
  }
  return (
    <div className="at-card__badges">
      {typeof preorder === 'string' && preorder && (
        <span className="at-badge at-badge--info">{preorder}</span>
      )}
      {product.promotion_title && <span className="at-badge">{product.promotion_title}</span>}
      {!product.promotion_title && off !== null && (
        <span className="at-badge at-badge--sale">
          {t('theme.product.percent_off', {
            defaultValue: '{{percent}}% off',
            percent: format(off),
          })}
        </span>
      )}
      {withQuantity && !!product.quantity && (
        <span className="at-badge at-badge--muted">
          {t('theme.product.remaining', {
            defaultValue: '{{count}} left',
            count: format(product.quantity),
          })}
        </span>
      )}
    </div>
  );
}

function Price({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  if (product.donation?.can_donate) return null;
  if (product.is_on_sale && product.sale_price) {
    return (
      <p className="at-price">
        <b className="at-price__now at-price__now--sale">{format(product.sale_price)}</b>
        {product.regular_price && <s className="at-price__was">{format(product.regular_price)}</s>}
      </p>
    );
  }
  if (product.starting_price) {
    return (
      <p className="at-price">
        <span className="at-price__from">{t('theme.product.from', 'From')}</span>
        <b className="at-price__now">{format(product.starting_price)}</b>
      </p>
    );
  }
  return (
    <p className="at-price">
      <b className="at-price__now">{format(product.price)}</b>
    </p>
  );
}

/**
 * The theme's product card, registered as `product:card` so every list in the
 * engine draws it too. Covers what the engine's card does: all five layouts,
 * sale and sold-out states, wishlist, and add-to-cart through Salla's own
 * button, which also handles options, pre-order and "notify me".
 */
export const ProductCard = memo(function ProductCard({
  product,
  layout = 'vertical',
  className,
  withShadow = false,
  withQuantity = false,
  withoutAddButton = false,
  imagePriority = false,
  sizes,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { isPlaceholder } = useAsset();
  const wishlist = useWishlist();
  const addButtonRef = useHostAttributes({ fill: 'solid', width: 'wide' });
  const settings = useThemeSettings();

  const productId = Number(product.id);
  const inWishlist = wishlist.has(productId);
  const toggleWishlist = useCallback(() => wishlist.toggle(productId), [wishlist, productId]);

  const hover = settingChoice(settings.product_card_hover, HOVER_EFFECTS, 'second-image');
  const quickAdd = settingBoolean(settings.product_card_quick_add, true);
  const showRating = settingBoolean(settings.product_card_show_rating, true);
  const notifyInCard = settingBoolean(settings.notify_when_available_in_card, true);

  const secondImage = product.images?.find(
    (image) => image.url && image.url !== product.image?.url
  );
  const isWide = layout === 'fullImage' || layout === 'minimal';
  const addStatus =
    notifyInCard &&
    product.is_out_of_stock &&
    product.type !== 'donating' &&
    product.type !== 'financial_support'
      ? 'out-and-notify'
      : product.status;

  return (
    <article
      id={`product-card-${product.id}`}
      data-product-id={product.id}
      className={cn(
        's-product-card-entry at-card',
        `at-card--${layout}`,
        `at-card--hover-${hover}`,
        withShadow && 'at-card--shadow',
        product.is_out_of_stock && 'at-card--sold-out',
        className
      )}
    >
      <div className="at-card__media">
        <Link to={product.url} className="at-card__image" aria-label={product.name}>
          <Image
            className={cn('at-card__img', isPlaceholder(product.image?.url) && 'is-placeholder')}
            src={product.image?.url}
            alt={product.image?.alt ?? product.name}
            noWrapper
            width={480}
            height={640}
            srcSetWidths={IMAGE_WIDTHS}
            sizes={sizes ?? (isWide ? WIDE_IMAGE_SIZES : IMAGE_SIZES)}
            priority={imagePriority}
          />
          {hover === 'second-image' && secondImage?.url && (
            <Image
              className="at-card__img at-card__img--second"
              src={secondImage.url}
              alt=""
              noWrapper
              width={480}
              height={640}
              srcSetWidths={IMAGE_WIDTHS}
              sizes={sizes ?? IMAGE_SIZES}
            />
          )}
        </Link>
        <Badges product={product} withQuantity={withQuantity} />
        <button
          type="button"
          className={cn('at-card__wish', inWishlist && 'is-active')}
          aria-label={t('theme.product.wishlist', 'Add to wishlist')}
          aria-pressed={inWishlist}
          onClick={toggleWishlist}
        >
          <i className={inWishlist ? 'sicon-heart-check' : 'sicon-heart'} aria-hidden="true" />
        </button>
      </div>

      <div className="at-card__body">
        {product.category?.name && layout !== 'minimal' && (
          <p className="at-card__eyebrow">{product.category.name}</p>
        )}
        <h3 className="at-card__title">
          <Link to={product.url}>{product.name}</Link>
        </h3>
        {product.subtitle && layout !== 'minimal' && (
          <p className="at-card__subtitle">{product.subtitle}</p>
        )}
        <div className="at-card__meta">
          <Price product={product} />
          {showRating && !!product.rating?.stars && (
            <span className="at-card__rating">
              <i className="sicon-star2" aria-hidden="true" />
              {product.rating.stars}
            </span>
          )}
        </div>
        {quickAdd && !withoutAddButton && layout !== 'minimal' && (
          <div className="at-card__add">
            <SallaAddProductButton
              ref={addButtonRef}
              fill="solid"
              width="wide"
              productId={product.id}
              productStatus={addStatus}
              productType={product.type}
              hasPreOrder={product.has_preorder_campaign}
            />
          </div>
        )}
      </div>
    </article>
  );
});
