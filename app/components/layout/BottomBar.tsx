import { useRouterState } from '@tanstack/react-router';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { useCartCount } from '../../hooks/useCartCount';
import { useIsHomeRoute } from '../../hooks/useIsHomeRoute';
import { cn } from '../../lib/cn';

export interface BottomBarProps {
  navOpen: boolean;
  onOpenNav: () => void;
}

/** Thumb-reach navigation on phones and tablets: home, categories, search, cart, account. */
export function BottomBar({ navOpen, onOpenNav }: BottomBarProps) {
  const { t } = useTranslation();
  const { format } = useNumber();
  const { isLoggedIn } = useUser();
  const cartCount = useCartCount();
  const isHome = useIsHomeRoute();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onCart = /\/cart\/?$/.test(pathname);
  const onAccount = pathname.includes('/account');

  return (
    <nav className="at-bottom-bar" aria-label={t('theme.nav.quick', 'Quick navigation')}>
      <Link
        to="/"
        className={cn('at-bottom-bar__item', isHome && !navOpen && 'is-active')}
        aria-current={isHome ? 'page' : undefined}
      >
        <i className="sicon-home" aria-hidden="true" />
        <span>{t('theme.nav.home', 'Home')}</span>
      </Link>
      <button
        type="button"
        className={cn('at-bottom-bar__item', navOpen && 'is-active')}
        onClick={onOpenNav}
      >
        <i className="sicon-menu" aria-hidden="true" />
        <span>{t('theme.nav.categories', 'Categories')}</span>
      </button>
      <button
        type="button"
        className="at-bottom-bar__item"
        onClick={() => window.salla?.event.dispatch('search::open')}
      >
        <i className="sicon-search" aria-hidden="true" />
        <span>{t('theme.actions.search', 'Search')}</span>
      </button>
      <Link
        to="/cart"
        className={cn('at-bottom-bar__item', onCart && 'is-active')}
        aria-current={onCart ? 'page' : undefined}
      >
        <span className="at-bottom-bar__icon">
          <i className="sicon-shopping-bag" aria-hidden="true" />
          {cartCount > 0 && <b className="at-bottom-bar__count">{format(cartCount)}</b>}
        </span>
        <span>{t('theme.nav.cart', 'Cart')}</span>
      </Link>
      {isLoggedIn ? (
        <Link
          to="/account/profile"
          className={cn('at-bottom-bar__item', onAccount && 'is-active')}
          aria-current={onAccount ? 'page' : undefined}
        >
          <i className="sicon-user" aria-hidden="true" />
          <span>{t('theme.account.title', 'Account')}</span>
        </Link>
      ) : (
        <button
          type="button"
          className="at-bottom-bar__item"
          onClick={() => window.salla?.event.dispatch('login::open')}
        >
          <i className="sicon-user" aria-hidden="true" />
          <span>{t('theme.account.login', 'Sign in')}</span>
        </button>
      )}
    </nav>
  );
}
