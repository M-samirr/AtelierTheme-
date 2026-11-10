import { useQuery } from '@tanstack/react-query';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { cn } from '../../lib/cn';

/** Root items shown before the rest move under "More". */
const VISIBLE_ROOT_ITEMS = 7;

const childrenOf = (item: MenuItem) => item.children ?? [];

function SimplePanel({ items }: { items: MenuItem[] }) {
  return (
    <div className="at-nav__panel at-nav__panel--simple">
      <ul>
        {items.map((child, index) => (
          <li key={`${child.id}-${index}`}>
            <Link to={child.url} className="at-nav__sublink">
              {child.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MegaPanel({ item }: { item: MenuItem }) {
  const { t } = useTranslation();
  return (
    <div className="at-nav__panel at-nav__panel--mega">
      <div className="at-container at-nav__mega">
        <div className="at-nav__columns">
          {childrenOf(item).map((child, index) => (
            <div key={`${child.id}-${index}`} className="at-nav__column">
              <Link to={child.url} className="at-nav__column-title">
                {child.title}
              </Link>
              <ul>
                {childrenOf(child).map((leaf, leafIndex) => (
                  <li key={`${leaf.id}-${leafIndex}`}>
                    <Link to={leaf.url} className="at-nav__sublink">
                      {leaf.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.image && (
          <Link to={item.url} className="at-nav__feature">
            <Image src={item.image} alt="" width={320} height={400} />
            <span>
              {t('theme.nav.shop', 'Shop')} {item.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

function RootItem({ item }: { item: MenuItem }) {
  const children = childrenOf(item);
  const isMega = children.some((child) => childrenOf(child).length > 0);
  return (
    <li className={cn('at-nav__item', isMega && 'at-nav__item--mega')}>
      <Link
        to={item.url}
        className="at-nav__link"
        {...(children.length ? { 'aria-haspopup': true } : {})}
      >
        <span>{item.title}</span>
        {children.length > 0 && <i className="sicon-keyboard_arrow_down" aria-hidden="true" />}
      </Link>
      {children.length > 0 &&
        (isMega ? <MegaPanel item={item} /> : <SimplePanel items={children} />)}
    </li>
  );
}

/**
 * The header's main menu from wide screens up. Panels open on hover and on
 * keyboard focus (CSS `:focus-within`), so every link is reachable without a
 * script. An item whose children have children opens a full-width mega panel,
 * with the image the merchant attached to it in the menu builder.
 */
export function DesktopNav() {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useQuery(menu.queries.header());

  if (isLoading) {
    return (
      <nav key="loading" className="at-nav" aria-hidden="true">
        <ul className="at-nav__list">
          {[64, 88, 72, 96, 64].map((width) => (
            <li key={width} className="at-nav__item">
              <span className="at-skeleton at-nav__placeholder" style={{ width }} />
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const visible = items.slice(0, VISIBLE_ROOT_ITEMS);
  const overflow = items.slice(VISIBLE_ROOT_ITEMS);

  return (
    <nav key="ready" className="at-nav" aria-label={t('theme.nav.main', 'Main menu')}>
      <ul className="at-nav__list">
        {visible.map((item, index) => (
          <RootItem key={`${item.id}-${index}`} item={item} />
        ))}
        {overflow.length > 0 && (
          <li className="at-nav__item">
            <button type="button" className="at-nav__link" aria-haspopup="true">
              <span>{t('theme.nav.more', 'More')}</span>
              <i className="sicon-keyboard_arrow_down" aria-hidden="true" />
            </button>
            <SimplePanel items={overflow} />
          </li>
        )}
      </ul>
    </nav>
  );
}
