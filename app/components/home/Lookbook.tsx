import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Container, SectionHeading } from '../ui';
import { ProductCard } from '../product';
import { items, pickIds } from '../../lib/blockData';
import { cn } from '../../lib/cn';
import { settingChoice, settingNumber, settingText } from '../../lib/settings';
import type { HomeBlockProps } from './types';

interface Hotspot {
  product?: unknown;
  x?: unknown;
  y?: unknown;
}

const SIDES = ['start', 'end'] as const;

/** A styled photo with numbered points; each point leads to the product worn in it. */
export function Lookbook({ data }: HomeBlockProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const spots = items<Hotspot>(data.hotspots)
    .map((spot) => ({
      id: pickIds(spot.product)[0],
      x: settingNumber(spot.x, 50, { min: 0, max: 100 }),
      y: settingNumber(spot.y, 50, { min: 0, max: 100 }),
    }))
    .filter((spot) => spot.id);
  const ids = spots.map((spot) => spot.id);
  const image = settingText(data.image);
  const side = settingChoice(data.image_side, SIDES, 'start');

  const { data: result } = useQuery({
    ...productApi.queries.list({ source: 'selected', sourceValue: ids, perPage: ids.length }),
    enabled: ids.length > 0,
  });

  if (!image) return null;

  const products = result?.items ?? [];
  const current = products.find((item) => Number(item.id) === spots[active]?.id);

  return (
    <Container>
      <SectionHeading title={settingText(data.title)} subtitle={settingText(data.subtitle)} />
      <div className={cn('at-lookbook', `at-lookbook--${side}`)}>
        <div className="at-lookbook__stage">
          <Image
            src={image}
            alt={settingText(data.image_alt)}
            width={800}
            srcSetWidths={[480, 800, 1200]}
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          {spots.map((spot, index) => (
            <button
              key={spot.id}
              type="button"
              className={cn('at-lookbook__spot', index === active && 'is-active')}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              aria-label={t('theme.block.view_product', {
                defaultValue: 'View product {{n}}',
                n: index + 1,
              })}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <span aria-hidden="true">{index + 1}</span>
            </button>
          ))}
        </div>
        <div className="at-lookbook__detail" aria-live="polite">
          {current ? (
            <ProductCard key={current.id} product={current} />
          ) : (
            ids.length > 0 && <span className="at-skeleton at-lookbook__placeholder" />
          )}
        </div>
      </div>
    </Container>
  );
}
