import { lazy, Suspense } from 'react';
import { Scripts, Outlet } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
  ThemeHeadContent,
  ThemeStylesheet,
} from '@salla.sa/twilight-theme-engine/tanstack';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { ThemeLayout } from '../components/layout/ThemeLayout';
import { HOME_ROUTE_ID, PRODUCT_ROUTE_ID } from '../lib/routeIds';
import appCssUrl from '../styles/app.css?url';
import homeCriticalCss from '../styles/critical.scss?inline';
import productCriticalCss from '../styles/critical-product.scss?inline';

// Dev only: the local twilight.json settings panel and the router devtools.
// Both sit behind `import.meta.env.DEV` so production builds drop them.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;
const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      }))
    )
  : null;

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

// Critical CSS ships with the server render only. The client keeps the keys
// (empty strings) so hydration finds the same <style> the server inlined.
const CRITICAL_CSS = {
  [HOME_ROUTE_ID]: import.meta.env.SSR ? homeCriticalCss : '',
  [PRODUCT_ROUTE_ID]: import.meta.env.SSR ? productCriticalCss : '',
};

function RootComponent() {
  const ctx = getTwilightContext();
  return (
    <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ThemeStylesheet href={appCssUrl} critical={CRITICAL_CSS} />
        <ThemeHeadContent />
      </head>
      <body suppressHydrationWarning>
        <TwilightProvider
          translations={themeTranslations}
          layout={ThemeLayout}
          toastMobilePosition="top-center"
        >
          <Outlet />
        </TwilightProvider>
        {RouterDevtools && (
          <Suspense fallback={null}>
            <RouterDevtools position="bottom-right" />
          </Suspense>
        )}
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
