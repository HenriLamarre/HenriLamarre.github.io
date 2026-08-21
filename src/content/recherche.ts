import type { CarouselItem } from './types'

/**
 * One card per article. Images go in /public/cards/recherche/.
 * `back` is optional — omit it for a plain back in the scene's colour.
 */
export const RECHERCHE: CarouselItem[] = [
  {
    kind: 'card',
    front: '/cards/recherche/card1_front.jpeg',
    label: "Systematic uncertainties in models of the cosmic dawn",
    description: 'Recherche effectuée dans le groupe d\'Adrian Liu à l\'Université McGill dans le cadre de stage durant mon baccalauréat.',
    abstract: 'Models of the reionization and reheating of the intergalactic medium (IGM) at redshifts z ≳ 6 continue to grow more sophisticated in anticipation of near-future 21-cm, cosmic microwave background, and galaxy survey measurements. However, there are many potential sources of systematic uncertainty in models that could bias and/or degrade upcoming constraints if left unaccounted for. (...)',
    link: { href: 'https://doi.org/10.1093/mnras/stab949', label: "Lire l'article" },
  },
  {
    kind: 'card',
    front: '/cards/recherche/card2_front.png',
    label: "Energy Definition and Minimization in Avalanche Models for Solar Flares",
    description: 'Premier article publié dans le cadre de mon doctorat à l\'Université de Montréal.',
    abstract: "Self-organized critical avalanche models are a class of cellular automata that, despite their simplicity, can be applied to the modeling of solar (and stellar) flares and generate robust power-law distributions in event size measures. However, bridging the conceptual gap to both magnetohydrodynamics and real flare observations continues to prove challenging. (...)",
    link: { href: 'https://ui.adsabs.harvard.edu/link_gateway/2024SoPh..299...13L/doi:10.48550/arXiv.2401.14503', label: "Lire l'article" },
  },
  {
    kind: 'card',
    front: '/cards/recherche/card3_front.png',
    label: "Avalanches in Magnetohydrodynamical simulations",
    description: 'Deuxième article publié dans le cadre de mon doctorat à l\'Université de Montréal.',
    abstract: "Scale invariance is a hallmark of many natural systems, including solar flares, where energy release spans a vast range of scales. Recent computational advances, at the level of both algorithmics and hardware, have enabled high-resolution magnetohydrodynamical (MHD) simulations to span multiple scales, offering new insights into magnetic energy dissipation processes. (...)",
    link: { href: 'https://ui.adsabs.harvard.edu/link_gateway/2025PhRvE.112f3202L/doi:10.1103/28ws-d57z', label: "Lire l'article" },
  },
]
