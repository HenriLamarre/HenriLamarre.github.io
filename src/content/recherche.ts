import type { CarouselItem } from './types'

/**
 * One card per article. Images go in /public/cards/recherche/.
 * `back` is optional — omit it for a plain back in the scene's colour.
 */
export const RECHERCHE: CarouselItem[] = [
  {
    kind: 'card',
    front: '/cards/recherche/card1_front.jpeg',
    back: '/cards/recherche/card1_front.jpeg',
    label: "Systematic uncertainties in models of the cosmic dawn",
    description: 'Recherche effectuée dans le groupe d\'Adrian Liu à l\'Université McGill dans le cadre de stage durant mon baccalauréat.',
    link: { href: 'https://doi.org/10.1093/mnras/stab949', label: "Lire l'article" },
  },
]
