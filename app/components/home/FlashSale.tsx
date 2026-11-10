import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button, Container } from '../ui';
import { ProductRow, ShelfSkeleton } from '../common';
import { parseEndDate, useCountdown } from '../../hooks/useCountdown';
import { blockLimit, linkUrl, pickValue, productSource } from '../../lib/blockData';
import { settingBoolean, settingText } from '../../lib/settings';
import type { HomeBlockProps } from './types';

/**
 * Discounted products against a countdown. The end time is the one the merchant
 * typed, or else the soonest discount end among the products. Once it passes,
 * the block hides unless the merchant chose to keep it.
 */
export function FlashSale({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const { format } = useNumber();
  const limit = blockLimit(data.limit, 8);
  const source = productSource(pickValue(data.source) || 'offers', data);

  const query = useQuery({
    ...productApi.queries.list({
      source: source?.source ?? 'offers',
      sourceValue: source?.sourceValue,
      perPage: limit,
    }),
    enabled: source !== null,
  });
  const products = (query.data?.items ?? []).slice(0, limit);

  const soonest = products
    .map((item) => parseEndDate(item.discount_ends))
    .filter((time): time is number => time !== null && time > Date.now())
    .sort((a, b) => a - b)[0];
  const target = parseEndDate(data.ends_at) ?? soonest ?? null;
  const { ready, expired, parts } = useCountdown(target);
  const viewAll = linkUrl(data.url);

  if (source === null) return null;
  if (expired && settingBoolean(data.hide_when_expired, true)) return null;
  if (!query.isLoading && !products.length) return null;

  const units = [
    { value: parts.days, label: t('theme.block.days', 'Days') },
    { value: parts.hours, label: t('theme.block.hours', 'Hours') },
    { value: parts.minutes, label: t('theme.block.minutes', 'Minutes') },
    { value: parts.seconds, label: t('theme.block.seconds', 'Seconds') },
  ];

  return (
    <div className="at-flash">
      <Container>
        <div className="at-flash__head">
          <div>
            <h2 className="at-flash__title">{settingText(data.title)}</h2>
            {settingText(data.subtitle) && (
              <p className="at-flash__sub">{data.subtitle as string}</p>
            )}
          </div>
          {target !== null && !expired && (
            <div className="at-flash__clock" role="timer">
              {units.map((unit) => (
                <div key={unit.label} className="at-flash__unit">
                  <b>{ready ? format(String(unit.value).padStart(2, '0')) : '--'}</b>
                  <span>{unit.label}</span>
                </div>
              ))}
            </div>
          )}
          {viewAll && (
            <Button href={viewAll} variant="secondary">
              {t('theme.actions.view_all', 'View all')}
            </Button>
          )}
        </div>
        {query.isLoading ? (
          <ShelfSkeleton display="rail" />
        ) : (
          <ProductRow
            products={products}
            display="rail"
            priority={Boolean(data.priority)}
            label={settingText(data.title)}
          />
        )}
      </Container>
    </div>
  );
}
