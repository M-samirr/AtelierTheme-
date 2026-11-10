/**
 * Hook-slot registrations for the theme.
 *
 * Each later phase adds its handlers here with
 * `hookRegistry.register(HookName.X, handler, priority)` from
 * `@salla.sa/twilight-theme-engine/hooks`. Engine defaults already on
 * `body:start`, `body:end`, `cart:items.start` and `cart:submit.start` must
 * stay registered; add to those slots, never clear them.
 */
export function registerThemeHooks(): void {
  // Phase 3+: announcement bar, trust badges, toast, digital-files settings.
}
