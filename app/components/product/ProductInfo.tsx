import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaMetadata } from '@salla.sa/twilight-components-react/metadata';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { lazyIframes } from '../../lib/productMedia';
import { settingBoolean, settingChoice, settingLocalized } from '../../lib/settings';
import { paragraphs } from '../../lib/text';

const LAYOUTS = ['tabs', 'accordion'] as const;

interface Panel {
  id: string;
  title: string;
  body: ReactNode;
}

/**
 * The description as the merchant wrote it in Salla's product editor. This is the one place the
 * theme renders HTML: the review rule covers theme settings and blocks, and the engine renders
 * this same field the same way. Settings text never reaches here.
 */
function Description({ product }: { product: Product }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const html = useMemo(
    () => lazyIframes((product.description ?? '').replace(/&nbsp;/g, '\n')),
    [product.description]
  );
  const clamped = !!product.has_read_more && !expanded;

  return (
    <>
      <article
        className={cn('at-rich', clamped && 'at-rich--clamped')}
        // eslint-disable-next-line no-restricted-syntax -- platform product content, see above
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {clamped && (
        <button type="button" className="at-link" onClick={() => setExpanded(true)}>
          {t('pages.products.read_more', 'Read more')}
        </button>
      )}
    </>
  );
}

function Specs({ product, showTags }: { product: Product; showTags: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      {(product.sku || product.barcode) && (
        <dl className="at-pdp-specs">
          {product.sku && (
            <div>
              <dt>{t('pages.products.sku', 'SKU')}</dt>
              <dd>{product.sku}</dd>
            </div>
          )}
          {product.barcode && (
            <div>
              <dt>{t('pages.products.barcode', 'Barcode')}</dt>
              <dd>{product.barcode}</dd>
            </div>
          )}
        </dl>
      )}
      {product.has_metadata && <SallaMetadata />}
      {showTags && !!product.tags?.length && (
        <ul className="at-pdp-tags">
          {product.tags.map((tag) => (
            <li key={tag.name}>
              <Link to={tag.url}>{tag.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Tabs({ panels }: { panels: Panel[] }) {
  const { isRTL } = useTranslation();
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const forward = (event.key === 'ArrowRight') !== isRTL;
    const next = (active + (forward ? 1 : -1) + panels.length) % panels.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="at-pdp-tabs" role="tablist">
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${panel.id}`}
            aria-controls={`${baseId}-panel-${panel.id}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={onKeyDown}
          >
            {panel.title}
          </button>
        ))}
      </div>
      {/* Every panel stays in the page, so search engines read the hidden ones too. */}
      {panels.map((panel, index) => (
        <div
          key={panel.id}
          role="tabpanel"
          id={`${baseId}-panel-${panel.id}`}
          aria-labelledby={`${baseId}-tab-${panel.id}`}
          hidden={index !== active}
          className="at-pdp-panel"
        >
          {panel.body}
        </div>
      ))}
    </>
  );
}

/** Description, specifications and the merchant's own extra section, as tabs or an accordion. */
export function ProductInfo({ product }: { product: Product }) {
  const { t, locale } = useTranslation();
  const settings = useThemeSettings();
  const layout = settingChoice(settings.product_info_layout, LAYOUTS, 'tabs');
  const showTags = settingBoolean(settings.show_tags, true);

  const panels: Panel[] = [];
  if (product.description) {
    panels.push({
      id: 'description',
      title: t('theme.pdp.description', 'Description'),
      body: <Description product={product} />,
    });
  }
  if (
    product.sku ||
    product.barcode ||
    product.has_metadata ||
    (showTags && product.tags?.length)
  ) {
    panels.push({
      id: 'details',
      title: t('theme.pdp.details', 'Details'),
      body: <Specs product={product} showTags={showTags} />,
    });
  }
  const extraTitle = settingLocalized(settings.product_extra_title, locale);
  const extraText = paragraphs(settingLocalized(settings.product_extra_text, locale));
  if (extraTitle && extraText.length) {
    panels.push({
      id: 'extra',
      title: extraTitle,
      body: (
        <div className="at-rich">
          {extraText.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      ),
    });
  }

  if (!panels.length) return null;

  return (
    <section className="at-pdp-info">
      {layout === 'tabs' ? (
        <Tabs panels={panels} />
      ) : (
        panels.map((panel, index) => (
          <details key={panel.id} className="at-pdp-fold" open={index === 0}>
            <summary>
              {panel.title}
              <i className="sicon-keyboard_arrow_down" aria-hidden="true" />
            </summary>
            <div className="at-pdp-panel">{panel.body}</div>
          </details>
        ))
      )}
    </section>
  );
}

/** The merchant's short promises beside the buy button, one per line. Nothing when left empty. */
export function TrustRow() {
  const { locale } = useTranslation();
  const settings = useThemeSettings();
  const lines = paragraphs(settingLocalized(settings.product_trust_items, locale)).slice(0, 4);
  if (!lines.length) return null;
  return (
    <ul className="at-pdp-trust">
      {lines.map((line, index) => (
        <li key={index}>
          <i className="sicon-check-circle" aria-hidden="true" />
          {line}
        </li>
      ))}
    </ul>
  );
}
