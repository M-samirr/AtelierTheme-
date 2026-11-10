import { lazy, Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useIsClient } from '@salla.sa/twilight-theme-engine/hooks';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { MadeWithSalla } from '@salla.sa/twilight-theme-engine/layout';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { SallaAppsIcons } from '@salla.sa/twilight-components-react/apps-icons';
import { SallaPayments } from '@salla.sa/twilight-components-react/payments';
import { SallaSocial } from '@salla.sa/twilight-components-react/social';
import { SallaTrustBadges } from '@salla.sa/twilight-components-react/trust-badges';
import { useThemeSettings } from '../../hooks/useThemeSettings';
import { cn } from '../../lib/cn';
import { settingBoolean, settingChoice, settingLocalized } from '../../lib/settings';
import { plainText } from '../../lib/text';

const ImageModal = lazy(() =>
  import('@salla.sa/twilight-theme-engine/modal').then((m) => ({ default: m.ImageModal }))
);

/** Salla's platform badges, shared by every store. */
const TAX_ICON_URL = 'https://cdn.salla.network/images/tax.png?v=2.0.5';
const SBC_ICON_URL = 'https://cdn.salla.network/images/sbc.png?v=2.0.5';

const LAYOUTS = ['columns', 'centered'] as const;

function FooterMenu() {
  const { t } = useTranslation();
  const { data: items = [] } = useQuery({ queryKey: ['menu', 'footer'], queryFn: menu.footer });
  if (!items.length) return null;
  return (
    <nav className="at-footer__column" aria-label={t('theme.footer.links', 'Important links')}>
      <h2 className="at-footer__heading">{t('theme.footer.links', 'Important links')}</h2>
      <ul className="at-footer__links">
        {items.map((item, index) => (
          <li key={`${item.id}-${index}`}>
            <Link to={item.url}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterContacts() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const contacts = store?.contacts;
  const phone = contacts?.mobile || contacts?.phone;
  const rows = [
    phone && { icon: 'sicon-phone', label: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    contacts?.email && {
      icon: 'sicon-mail',
      label: contacts.email,
      href: `mailto:${contacts.email}`,
    },
    contacts?.whatsapp && {
      icon: 'sicon-whatsapp',
      label: t('theme.footer.whatsapp', 'WhatsApp'),
      href: contacts.whatsapp.startsWith('http')
        ? contacts.whatsapp
        : `https://wa.me/${contacts.whatsapp.replace(/\D/g, '')}`,
    },
  ].filter((row): row is { icon: string; label: string; href: string } => Boolean(row));

  if (!rows.length) return null;
  return (
    <div className="at-footer__column">
      <h2 className="at-footer__heading">{t('theme.footer.contact', 'Contact us')}</h2>
      <ul className="at-footer__links">
        {rows.map((row) => (
          <li key={row.href}>
            <a href={row.href} dir="auto">
              <i className={row.icon} aria-hidden="true" />
              <span>{row.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaxBadge() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const tax = store?.settings?.tax;
  if (!tax?.number) return null;
  const label = t('theme.footer.tax_certificate', 'Tax certificate');
  return (
    <div className="at-footer__badge">
      {tax.certificate ? (
        <button
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <img src={TAX_ICON_URL} alt="" width={40} height={50} loading="lazy" decoding="async" />
        </button>
      ) : (
        <img src={TAX_ICON_URL} alt="" width={40} height={50} loading="lazy" decoding="async" />
      )}
      <div>
        <small>{t('theme.footer.tax_number', 'Tax number')}</small>
        <b dir="ltr">{tax.number}</b>
      </div>
      {tax.certificate && open && (
        <Suspense fallback={null}>
          <ImageModal
            isOpen
            onClose={() => setOpen(false)}
            src={tax.certificate}
            alt={label}
            title={label}
          />
        </Suspense>
      )}
    </div>
  );
}

function SbcBadge() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const id = store?.settings?.certificate?.id;
  if (!id) return null;
  return (
    <a
      className="at-footer__badge"
      href={`https://eauthenticate.saudibusiness.gov.sa/certificate-details/${encodeURIComponent(id)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={SBC_ICON_URL} alt="" width={56} height={40} loading="lazy" decoding="async" />
      <div>
        <small>{t('theme.footer.trusted_by', 'Trusted by')}</small>
        <b>{t('theme.footer.business_platform', 'Business Platform')}</b>
      </div>
    </a>
  );
}

/**
 * The store footer: brand and social, the footer menu, contacts, trust badges
 * and payment methods. Web components fill their own markup before React
 * hydrates, so they mount after hydration to keep the server and client equal.
 */
export function Footer() {
  const { store } = useTwilight();
  const { t, locale } = useTranslation();
  const isClient = useIsClient();
  const settings = useThemeSettings();
  const layout = settingChoice(settings.footer_layout, LAYOUTS, 'columns');
  const dark = settingBoolean(settings.footer_is_dark, false);
  const showPayments = settingBoolean(settings.footer_show_payments, true);
  const tagline =
    settingLocalized(settings.footer_tagline, locale) || plainText(store?.description);
  const hasApps = !!store?.apps?.appstore || !!store?.apps?.googleplay;
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn('at-footer', `at-footer--${layout}`, dark && 'at-footer--dark')}
      suppressHydrationWarning
    >
      <HookSlot name="footer:start" />

      <div className="at-container at-footer__main">
        <div className="at-footer__brand">
          <Link to="/" className="at-footer__logo" aria-label={store?.name}>
            {store?.logo ? (
              <Image src={store.logo} alt="" width={150} height={48} objectFit="contain" />
            ) : (
              <span>{store?.name}</span>
            )}
          </Link>
          {tagline && <p className="at-footer__tagline">{tagline}</p>}
          <div className="at-footer__social">{isClient && <SallaSocial />}</div>
        </div>

        <FooterMenu />
        <FooterContacts />

        {hasApps && (
          <div className="at-footer__column">
            {isClient && (
              <SallaAppsIcons
                apps={store.apps}
                appsTitle={t('theme.footer.apps', 'Get our apps')}
              />
            )}
          </div>
        )}
      </div>

      <div className="at-container at-footer__trust">
        <TaxBadge />
        <SbcBadge />
        {isClient && <SallaTrustBadges {...(dark ? { dark: true } : {})} />}
      </div>

      <div className="at-footer__bottom">
        <div className="at-container at-footer__bottom-row">
          <span className="at-footer__copyright">
            <HookSlot
              name="copyright"
              context={{ storeName: store?.name }}
              fallback={
                <>
                  © {year} <Link to="/">{store?.name}</Link>.{' '}
                  {t('theme.footer.rights', 'All rights reserved.')}
                  <MadeWithSalla className="ms-2" />
                </>
              }
            />
          </span>
          {showPayments && isClient && <SallaPayments />}
        </div>
      </div>

      <HookSlot name="footer:end" />
    </footer>
  );
}
