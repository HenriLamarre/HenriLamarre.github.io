import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { Locale, Text } from './types'

export type { Locale, Text }

const STORAGE_KEY = 'locale'

type LocaleValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Pick the current language out of a bilingual string. */
  t: (text: Text) => string
}

const LocaleContext = createContext<LocaleValue | null>(null)

/** Remembered choice first, then the browser's preference, then French. */
function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    // Private browsing can throw on access; fall through to the default.
  }

  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    // Screen readers and search engines both read this.
    document.documentElement.lang = locale
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }, [locale])

  const value = useMemo<LocaleValue>(
    () => ({ locale, setLocale, t: (text: Text) => text[locale] ?? text.en }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale must be used within a LocaleProvider')
  return value
}
