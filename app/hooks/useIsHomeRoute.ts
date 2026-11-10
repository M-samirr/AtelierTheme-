import { useRouterState } from '@tanstack/react-router';
import { HOME_ROUTE_ID } from '../lib/routeIds';

/**
 * Whether the current route is the home page, read from the router's matches.
 * The server and the browser agree on it under every URL prefix, unlike a
 * pathname comparison, so markup that depends on it hydrates cleanly.
 */
export function useIsHomeRoute(): boolean {
  return useRouterState({
    select: (state) => state.matches.some((match) => String(match.routeId) === HOME_ROUTE_ID),
  });
}
