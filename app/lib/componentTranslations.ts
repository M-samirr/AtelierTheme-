/**
 * Keys that `<salla-*>` web components read from `salla.lang`, which some
 * stores' translation packs lack. Theme locale files only reach React's
 * `useTranslation`, so these are copied into `salla.lang` when the pack has no
 * text of its own for them (a store's translation always wins).
 */
export const COMPONENT_TRANSLATION_KEYS = [
  'blocks.order_options.title',
  'blocks.order_options.subtitle',
  'blocks.order_options.continue',
  'blocks.order_options.total',
  'blocks.order_options.required_message',
  'common.elements.choose',
] as const;

/** `virtual:twilight/theme-translations`: `{ 'ar.trans': {...}, 'en.trans': {...} }`. */
export type ThemeTranslations = Record<string, Record<string, string>>;

export interface ComponentLang {
  get: (key: string) => string;
  add: (key: string, messages: Record<string, string>) => unknown;
}

export function fillComponentTranslations(lang: ComponentLang, theme: ThemeTranslations): void {
  for (const key of COMPONENT_TRANSLATION_KEYS) {
    if (lang.get(key) !== key) continue;

    const messages: Record<string, string> = {};
    for (const [bucket, strings] of Object.entries(theme)) {
      const value = strings?.[key];
      if (value) messages[bucket.replace(/\.trans$/, '')] = value;
    }
    if (Object.keys(messages).length) lang.add(key, messages);
  }
}
