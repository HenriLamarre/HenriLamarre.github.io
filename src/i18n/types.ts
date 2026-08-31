export type Locale = 'fr' | 'en'

/**
 * A translatable string. English is the source of truth — write it first and
 * leave `fr` out; `npm run i18n:check` lists what still needs translating, and
 * the site falls back to English until it is filled in.
 */
export type Text = { en: string; fr?: string }
