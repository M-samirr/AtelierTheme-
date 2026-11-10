import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import themeTranslations from 'virtual:twilight/theme-translations';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { BottomBar } from './BottomBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { fillComponentTranslations, type ComponentLang } from '../../lib/componentTranslations';
import { settingBoolean, settingChoice } from '../../lib/settings';

/**
 * The page frame around every route, passed to `<TwilightProvider layout>`:
 * the theme's header and footer, the mobile drawer and bottom bar, and the
 * global modals. The modals mirror the engine's `MasterLayout` and must stay:
 * without them login, offers, branch scopes and the language switcher stop
 * working.
 */
export interface ThemeLayoutProps {
  children: ReactNode;
}

const MobileNav = lazy(() => import('./MobileNav'));

const SallaLoginModal = lazy(() =>
  import('@salla.sa/twilight-components-react/login-modal').then((m) => ({
    default: m.SallaLoginModal,
  }))
);
const SallaScopes = lazy(() =>
  import('@salla.sa/twilight-components-react/scopes').then((m) => ({
    default: m.SallaScopes,
  }))
);
const SallaOfferModal = lazy(() =>
  import('@salla.sa/twilight-components-react/offer-modal').then((m) => ({
    default: m.SallaOfferModal,
  }))
);
const SallaLocalizationModal = lazy(() =>
  import('@salla.sa/twilight-components-react/localization-modal').then((m) => ({
    default: m.SallaLocalizationModal,
  }))
);

const CARD_RATIOS = ['portrait', 'square', 'contain'] as const;
const RADII = ['soft', 'sharp', 'round'] as const;

/** The store-wide modals, each mounted only when the store needs it. */
function GlobalModals() {
  const { store, currency } = useTwilight();
  const { locale } = useTranslation();
  const { isLoggedIn } = useUser();
  const showLocalization =
    !!store?.settings?.is_multilingual || !!store?.settings?.currencies_enabled;

  return (
    <>
      <Suspense fallback={null}>
        <SallaOfferModal />
      </Suspense>

      {showLocalization && (
        <Suspense fallback={null}>
          <SallaLocalizationModal
            language={locale}
            currency={currency?.code || 'SAR'}
            suppressHydrationWarning
          />
        </Suspense>
      )}

      {!isLoggedIn && (
        <Suspense fallback={null}>
          <SallaLoginModal
            isEmailAllowed={store?.settings?.auth?.email_allowed}
            isMobileAllowed={store?.settings?.auth?.mobile_allowed}
            suppressHydrationWarning
          />
        </Suspense>
      )}

      {store?.scope && (
        <Suspense fallback={null}>
          <SallaScopes
            selection={store?.scope?.display_as === 'popup' ? 'mandatory' : 'optional'}
            suppressHydrationWarning
          />
        </Suspense>
      )}
    </>
  );
}

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);
  // The drawer's code loads the first time it is asked for, then stays mounted.
  const [navRequested, setNavRequested] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const settings = useThemeSettings();
  const showBottomBar = settingBoolean(settings.mobile_bottom_bar, true);
  const cardRatio = settingChoice(settings.product_card_img_ratio, CARD_RATIOS, 'portrait');
  const radius = settingChoice(settings.corner_style, RADII, 'soft');
  const motion = settingBoolean(settings.motion_enabled, true);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Strings the `<salla-*>` components read from `salla.lang` but some store packs lack.
  useEffect(() => {
    const lang = window.salla?.lang as
      (ComponentLang & { subscribe?: (fn: () => void) => () => void }) | undefined;
    if (typeof lang?.subscribe !== 'function' || typeof lang.add !== 'function') return;
    return lang.subscribe(() => fillComponentTranslations(lang, themeTranslations));
  }, []);

  const openNav = () => {
    setNavRequested(true);
    setNavOpen(true);
  };

  return (
    <>
      <a href="#main-content" className="at-skip-link">
        {t('common.a11y.skip_to_content', 'Skip to content')}
      </a>
      <div
        className={cn(
          'app-inner flex min-h-full flex-col',
          `at-card-ratio--${cardRatio}`,
          `at-corners--${radius}`,
          !motion && 'at-no-motion'
        )}
        suppressHydrationWarning
      >
        <Header onOpenNav={openNav} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        {showBottomBar && <BottomBar navOpen={navOpen} onOpenNav={openNav} />}
      </div>
      {navRequested && (
        <Suspense fallback={null}>
          <MobileNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
        </Suspense>
      )}
      <GlobalModals />
    </>
  );
}
