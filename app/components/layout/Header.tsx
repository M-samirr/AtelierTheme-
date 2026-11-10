import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { PageAdvertisements } from '@salla.sa/twilight-theme-engine/layout';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { SallaCartSummary } from '@salla.sa/twilight-components-react/cart-summary';
import { SallaSearch } from '@salla.sa/twilight-components-react/search';
import { SallaUserMenu } from '@salla.sa/twilight-components-react/user-menu';
import { DesktopNav } from './DesktopNav';
import { useCartCount } from '../../hooks/useCartCount';
import { useIsHomeRoute } from '../../hooks/useIsHomeRoute';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { settingBoolean, settingChoice, settingLocalized, settingText } from '../../lib/settings';

const LAYOUTS = ['classic', 'centered'] as const;
const TONES = ['light', 'dark', 'brand'] as const;

export interface HeaderProps {
  onOpenNav: () => void;
}

function TopBar() {
  const { store, currency } = useTwilight();
  const { languageName, locale } = useTranslation();
  const settings = useThemeSettings();
  const message = settingLocalized(settings.announcement_text, locale);
  const messageUrl = settingText(settings.announcement_url);
  const tone = settingChoice(settings.topbar_tone, TONES, 'dark');
  const canLocalize = !!store?.settings?.is_multilingual || !!store?.settings?.currencies_enabled;
  const scope = store?.scope;

  if (!message && !canLocalize && !scope) return null;

  return (
    <div className={`at-topbar at-topbar--${tone}`}>
      <div className="at-container at-topbar__inner">
        <div className="at-topbar__side">
          {canLocalize && (
            <button
              type="button"
              className="at-topbar__btn"
              onClick={() => window.salla?.event.dispatch('localization::open')}
            >
              <span>{languageName}</span>
              <span aria-hidden="true">·</span>
              {store?.settings?.use_sar_symbol && currency?.code === 'SAR' ? (
                <i className="sicon-sar" aria-label="SAR" />
              ) : (
                <span>{currency?.symbol}</span>
              )}
            </button>
          )}
          {scope && (
            <button
              type="button"
              className="at-topbar__btn"
              onClick={() => window.salla?.event.dispatch('scopes::open', { mode: 'default' })}
            >
              <i className="sicon-location" aria-hidden="true" />
              <span>{scope.name}</span>
            </button>
          )}
        </div>
        {message &&
          (messageUrl ? (
            <Link to={messageUrl} className="at-topbar__message">
              {message}
            </Link>
          ) : (
            <p className="at-topbar__message">{message}</p>
          ))}
        <div className="at-topbar__side" aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * The store header: slots for apps, the merchant's announcement bars, an
 * optional top bar, then the masthead with the logo, the main menu and the
 * customer's actions. `layout` is `classic` (one row) or `centered` (logo in the
 * middle, menu on its own row). The `<header>` is `display: contents` so the
 * masthead sticks against the page rather than against its own parent.
 */
export function Header({ onOpenNav }: HeaderProps) {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const isHome = useIsHomeRoute();
  const cartCount = useCartCount();
  const { format: formatNumber } = useNumber();
  const settings = useThemeSettings();
  const layout = settingChoice(settings.header_layout, LAYOUTS, 'classic');
  const sticky = settingBoolean(settings.header_is_sticky, true);
  const StoreName = isHome ? 'h1' : 'span';

  return (
    <header className="at-header" suppressHydrationWarning>
      <HookSlot name="header:start" />
      <PageAdvertisements />
      <TopBar />

      <div className={cn('at-masthead', `at-masthead--${layout}`, sticky && 'at-masthead--sticky')}>
        <div className="at-container at-masthead__row">
          <div className="at-masthead__start">
            <button
              type="button"
              className="at-icon-btn at-masthead__burger"
              aria-label={t('theme.nav.open', 'Open menu')}
              onClick={onOpenNav}
            >
              <i className="sicon-menu" aria-hidden="true" />
            </button>
            {layout === 'centered' && (
              <button
                type="button"
                className="at-icon-btn at-masthead__desktop-search"
                aria-label={t('theme.actions.search', 'Search')}
                onClick={() => window.salla?.event.dispatch('search::open')}
              >
                <i className="sicon-search" aria-hidden="true" />
              </button>
            )}
          </div>

          <Link to="/" className="at-masthead__brand">
            {store?.logo && (
              <Image src={store.logo} alt="" width={140} height={48} objectFit="contain" priority />
            )}
            <StoreName className={store?.logo ? 'sr-only' : 'at-masthead__name'}>
              {store?.name}
            </StoreName>
          </Link>

          {layout === 'classic' && (
            <div className="at-masthead__nav">
              <DesktopNav />
            </div>
          )}

          <div className="at-masthead__actions">
            {layout === 'classic' && (
              <button
                type="button"
                className="at-icon-btn"
                aria-label={t('theme.actions.search', 'Search')}
                onClick={() => window.salla?.event.dispatch('search::open')}
              >
                <i className="sicon-search" aria-hidden="true" />
              </button>
            )}
            <Link
              to="/account/wishlist"
              className="at-icon-btn at-masthead__wishlist"
              aria-label={t('theme.account.wishlist', 'Wishlist')}
            >
              <i className="sicon-heart" aria-hidden="true" />
            </Link>
            <SallaUserMenu avatarOnly showHeader relativeDropdown className="at-masthead__user" />
            <span className="at-masthead__cart-wrap">
              <SallaCartSummary className="at-masthead__cart">
                <i slot="icon" className="sicon-shopping-bag" aria-hidden="true" />
              </SallaCartSummary>
              {cartCount > 0 && <b className="at-masthead__count">{formatNumber(cartCount)}</b>}
            </span>
          </div>
        </div>

        {layout === 'centered' && (
          <div className="at-masthead__second">
            <div className="at-container">
              <DesktopNav />
            </div>
          </div>
        )}
      </div>

      <div className="at-search-host">
        <SallaSearch suppressHydrationWarning />
      </div>
      <HookSlot name="header:end" />
    </header>
  );
}
