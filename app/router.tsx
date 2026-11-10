import { lazy } from 'react';
import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import { registry } from '@salla.sa/twilight-theme-engine';
import {
  registerHomeComponents,
  registerHomeComponentConfig,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import { routeTree } from './routeTree.gen';
import { registerThemeHooks } from './hooks';
import { homeBlockConfig, platformHomeBlocks, themeHomeBlocks } from './components/home';
import { ProductCard } from './components/product/ProductCard';
import { ProductListSkeleton } from './components/product/ProductListSkeleton';

const ProductListPage = lazy(() =>
  import('./components/product/ProductListPage').then((m) => ({ default: m.ProductListPage }))
);

/** Theme wiring, run once per bundle (server and client) before the first render. */
registerThemeHooks();

// The engine's card only switches when the key was registered before it was overridden.
registry.register('product:card', ProductCard);
registry.override('product:card', ProductCard);

registry.register('product:list-page', ProductListPage);
registry.register('product:list-skeleton', ProductListSkeleton);

registerHomeComponents({
  ...DefaultHomeComponents,
  ...platformHomeBlocks,
  ...themeHomeBlocks,
});
registerHomeComponentConfig(homeBlockConfig);

// One router per browser session so the QueryClient cache survives navigations.
// SSR builds a fresh router per request.
let clientRouter: ReturnType<typeof createRouter> | null = null;

export function getRouter() {
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  const router = createRouter(routeTree);

  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
