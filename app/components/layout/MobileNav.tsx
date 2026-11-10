import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Drawer } from '@salla.sa/twilight-theme-engine/drawer';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Level {
  title: string;
  items: MenuItem[];
  parentUrl: string;
}

/** The slide-in menu below wide screens. Items with children open a level of their own. */
export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { t, languageName } = useTranslation();
  const { store } = useTwilight();
  const { data: rootItems = [], isLoading } = useQuery(menu.queries.header());
  const [stack, setStack] = useState<Level[]>([]);
  const level = stack[stack.length - 1];
  const items = level?.items ?? rootItems;
  const canLocalize = !!store?.settings?.is_multilingual || !!store?.settings?.currencies_enabled;

  const close = () => {
    setStack([]);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={close} size="md" className="at-drawer">
      <div className="at-drawer__head">
        {level ? (
          <button
            type="button"
            className="at-icon-btn"
            aria-label={t('theme.actions.back', 'Back')}
            onClick={() => setStack((current) => current.slice(0, -1))}
          >
            <i className="sicon-keyboard_arrow_right at-flip-ltr" aria-hidden="true" />
          </button>
        ) : (
          <span className="at-icon-btn" aria-hidden="true" />
        )}
        <span className="at-drawer__title">{level?.title ?? t('theme.nav.menu', 'Menu')}</span>
        <button
          type="button"
          className="at-icon-btn"
          aria-label={t('theme.actions.close', 'Close')}
          onClick={close}
        >
          <i className="sicon-cancel" aria-hidden="true" />
        </button>
      </div>

      <nav className="at-drawer__body" aria-label={t('theme.nav.main', 'Main menu')}>
        {isLoading ? (
          <div className="at-drawer__loading">
            {[1, 2, 3, 4, 5].map((row) => (
              <span key={row} className="at-skeleton" />
            ))}
          </div>
        ) : (
          <ul className="at-drawer__list">
            {level && (
              <li>
                <Link to={level.parentUrl} className="at-drawer__link" onClick={close}>
                  <strong>
                    {t('theme.nav.view_all', 'View all')} {level.title}
                  </strong>
                </Link>
              </li>
            )}
            {items.map((item, index) => (
              <li key={`${item.id}-${index}`}>
                {item.children?.length ? (
                  <button
                    type="button"
                    className="at-drawer__link"
                    onClick={() =>
                      setStack((current) => [
                        ...current,
                        { title: item.title, items: item.children ?? [], parentUrl: item.url },
                      ])
                    }
                  >
                    <span>{item.title}</span>
                    <i className="sicon-keyboard_arrow_left at-flip-ltr" aria-hidden="true" />
                  </button>
                ) : (
                  <Link to={item.url} className="at-drawer__link" onClick={close}>
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>

      {canLocalize && (
        <div className="at-drawer__foot">
          <button
            type="button"
            className="at-drawer__link"
            onClick={() => {
              close();
              window.salla?.event.dispatch('localization::open');
            }}
          >
            <span>
              <i className="sicon-world" aria-hidden="true" /> {languageName}
            </span>
          </button>
        </div>
      )}
    </Drawer>
  );
}
