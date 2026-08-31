import type { Text } from './types'

/** Interface strings. Node content lives in ../graph/data.ts. */
export const UI = {
  subtitle: {
    fr: 'Ph.D. en astrophysique, développeur de jeux',
    en: 'Ph.D. in Astrophysics, Game Developer',
  },
  applications: { fr: 'Applications', en: 'Applications' },
  previous: { fr: 'Précédent', en: 'Previous' },
  next: { fr: 'Suivant', en: 'Next' },
  close: { fr: 'Fermer', en: 'Close' },
} satisfies Record<string, Text>
