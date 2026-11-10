import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Container, SectionHeading } from '../ui';
import { ProductShelf } from '../common';
import { blockLimit, items, linkUrl, pickValue, productSource } from '../../lib/blockData';
import { cn } from '../../lib/cn';
import { settingChoice, settingText } from '../../lib/settings';
import type { HomeBlockProps } from './types';

interface Tab {
  [key: string]: unknown;
  label?: string;
  source?: unknown;
  category?: unknown;
  products?: unknown;
  tag?: unknown;
  url?: unknown;
}

const DISPLAYS = ['grid', 'rail'] as const;

/**
 * Product collections behind tabs. Only the open tab loads its products. Arrow
 * keys move between tabs, following the ARIA tabs pattern.
 */
export function CollectionTabs({ data }: HomeBlockProps) {
  const { t, isRTL } = useTranslation();
  const baseId = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs = items<Tab>(data.tabs).filter((tab) => settingText(tab.label));
  const display = settingChoice(data.display, DISPLAYS, 'grid');
  const limit = blockLimit(data.limit, 8);

  if (!tabs.length) return null;

  const current = tabs[Math.min(active, tabs.length - 1)];
  const viewAll = linkUrl(current.url);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const back = isRTL ? 'ArrowRight' : 'ArrowLeft';
    if (event.key !== forward && event.key !== back) return;
    event.preventDefault();
    const next = (active + (event.key === forward ? 1 : -1) + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <Container>
      <SectionHeading
        title={settingText(data.title)}
        subtitle={settingText(data.subtitle)}
        action={
          viewAll ? { label: t('theme.actions.view_all', 'View all'), href: viewAll } : undefined
        }
      />
      {tabs.length > 1 && (
        // Arrow keys are handled on the list so each tab need not repeat it.
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus
        <div className="at-tabs" role="tablist" onKeyDown={onKeyDown}>
          {tabs.map((tab, index) => (
            <button
              key={`${tab.label}-${index}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              className={cn('at-tabs__tab', index === active && 'is-active')}
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div
        id={`${baseId}-panel`}
        role={tabs.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={tabs.length > 1 ? `${baseId}-tab-${active}` : undefined}
      >
        <ProductShelf
          key={active}
          source={productSource(pickValue(current.source), current)}
          limit={limit}
          display={display}
          priority={Boolean(data.priority)}
          label={current.label}
        />
      </div>
    </Container>
  );
}
