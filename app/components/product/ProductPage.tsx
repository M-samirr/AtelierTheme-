import { Suspense } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { Breadcrumb, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { AddToCartForm } from '@salla.sa/twilight-theme-engine/product';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaQuickOrder } from '@salla.sa/twilight-components-react/quick-order';
import { ProductGallery } from './ProductGallery';
import { ProductInfo, TrustRow } from './ProductInfo';
import { ProductSummary } from './ProductSummary';
import { ProductShelf } from '../common';
import { Container, SectionHeading } from '../ui';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { settingBoolean } from '../../lib/settings';

const RELATED_LIMIT = 8;
/** These widgets show nothing until loaded, so they start well before they are reached. */
const WIDGET_MARGIN = '400px';

/**
 * Forked from the engine's ProductPage (see FORKS.md). Same data, same hook slots, the engine's
 * add-to-cart form untouched so options, live price, sold-out state and quick buy keep working;
 * the theme's gallery, summary and information panels. The engine's store testimonials band is
 * left out: product reviews are on the page already. The Suspense boundaries let React hydrate
 * the page in pieces instead of in one long task.
 */
export function ProductPage({ product: initialProduct, page }: ProductPageProps) {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const settings = useThemeSettings();
  const { product } = useProduct(initialProduct);
  const { commentsKey } = useComments();

  const sticky = settingBoolean(settings.sticky_add_to_cart, true);
  const showBreadcrumbs = settingBoolean(settings.product_show_breadcrumbs, true);
  const showRelated = settingBoolean(settings.product_show_related, true);
  const relatedTitle = t('pages.products.similar_products', 'Similar products');

  return (
    <div className={cn('at-pdp', sticky && 'at-pdp--sticky')}>
      <Container>
        {showBreadcrumbs && <Breadcrumb page={page} />}
        <HookSlot name="product:start" />

        <div className="at-pdp__main" id={`product-${product.id}`}>
          <Suspense fallback={null}>
            <ProductGallery product={product} />
          </Suspense>

          <div className="at-pdp__buy">
            <HookSlot name="product:details.start" />
            <Suspense fallback={null}>
              <ProductSummary product={product} />
            </Suspense>
            <HookSlot name="product:details.end" />

            <HookSlot name="product:single.form.start" />
            <Suspense fallback={null}>
              <AddToCartForm product={product} stickyAddToCart={sticky} />
            </Suspense>
            <HookSlot name="product:single.form.end" />
            <HookSlot name="product:single.description.end" context={{ product }} />

            <TrustRow />
            <RenderWhenVisible estimatedHeight="1px" rootMargin={WIDGET_MARGIN}>
              <SallaQuickOrder className="at-pdp__quick-order" />
            </RenderWhenVisible>
          </div>
        </div>

        <Suspense fallback={null}>
          <ProductInfo product={product} />
        </Suspense>
        <RenderWhenVisible estimatedHeight="1px" rootMargin={WIDGET_MARGIN}>
          <SallaOffer />
        </RenderWhenVisible>
      </Container>

      {store.settings?.rating?.show_on_product && (
        <RenderWhenVisible estimatedHeight="320px">
          <Container className="at-pdp__section">
            <SallaComments
              key={commentsKey}
              itemId={Number(product.id)}
              type={'product' as never}
            />
          </Container>
        </RenderWhenVisible>
      )}

      <HookSlot name="product:related.start" />
      {showRelated && (
        <RenderWhenVisible estimatedHeight="420px">
          <Container className="at-pdp__section">
            <SectionHeading title={relatedTitle} />
            <ProductShelf
              source={{ source: 'related', sourceValue: Number(product.id) }}
              limit={RELATED_LIMIT}
              display="rail"
              label={relatedTitle}
            />
          </Container>
        </RenderWhenVisible>
      )}
      <HookSlot name="product:related.end" />

      <HookSlot name="product:end" />
    </div>
  );
}

/** Holds the page's shape while the route loads, so the first paint does not jump. */
export function ProductPageSkeleton() {
  return (
    <Container>
      <div className="at-pdp__main at-pdp__main--skeleton" aria-hidden="true">
        <span className="at-skeleton at-pdp-skeleton__media" />
        <div className="at-pdp__buy">
          <span className="at-skeleton at-pdp-skeleton__title" />
          <span className="at-skeleton at-pdp-skeleton__line" />
          <span className="at-skeleton at-pdp-skeleton__price" />
          <span className="at-skeleton at-pdp-skeleton__button" />
        </div>
      </div>
    </Container>
  );
}
