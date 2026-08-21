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
    abstract: 'Models of the reionization and reheating of the intergalactic medium (IGM) at redshifts z ≳ 6 continue to grow more sophisticated in anticipation of near-future 21-cm, cosmic microwave background, and galaxy survey measurements. However, there are many potential sources of systematic uncertainty in models that could bias and/or degrade upcoming constraints if left unaccounted for. In this work, we examine three commonly ignored sources of uncertainty in models for the mean reionization and thermal histories of the IGM: the underlying cosmology, halo mass function (HMF), and choice of stellar population synthesis (SPS) model. We find that cosmological uncertainties affect the Thomson scattering optical depth at the few per cent level and the amplitude of the global 21-cm signal at the ∼5–10 mK level. The differences brought about by choice of HMF and SPS models are more dramatic, comparable to the 1σ error bar on τe and an ∼20 mK effect on the global 21-cm signal amplitude. Finally, we jointly fit galaxy luminosity functions and global 21-cm signals for all HMF/SPS combinations and find that (i) doing so requires additional free parameters to compensate for modelling systematics and (ii) the spread in constraints on parameters of interest for different HMF and SPS choices, assuming 5 mK noise in the global signal, is comparable to those obtained when adopting the \'true\' HMF and SPS with ≳20 mK errors. Our work highlights the need for dedicated efforts to reduce modelling uncertainties in order to enable precision inference with future data sets.',
    link: { href: 'https://doi.org/10.1093/mnras/stab949', label: "Lire l'article" },
  },
  {
    kind: 'card',
    front: '/cards/recherche/card2_front.png',
    label: "Energy Definition and Minimization in Avalanche Models for Solar Flares",
    description: 'Premier article publié dans le cadre de mon doctorat à l\'Université de Montréal.',
    abstract: "Self-organized critical avalanche models are a class of cellular automata that, despite their simplicity, can be applied to the modeling of solar (and stellar) flares and generate robust power-law distributions in event size measures. However, bridging the conceptual gap to both magnetohydrodynamics and real flare observations continues to prove challenging. In this paper, we focus on a specific, key aspect of this endeavor: the definition of magnetic energy and its consequences for the model's internal dynamics and energy release statistics. We show that the dual requirement of releasing energy and restoring local stability demands that the instability criterion and boundary conditions be set in a manner internally consistent with a given energy definition; otherwise, unphysical behavior ensues, e.g., negative energy release. Working with three energy definitions previously used in the literature, we construct such internally consistent avalanche models and compare/contrast their energy release statistics. Using the same set of models, we also explore a recent proposal by Farhang et al. (2018, 2019), namely, that avalanches/flares should maximize the amount of energy released by the lattice when instabilities are triggered. This tends to produce avalanches of shorter duration but higher peak energy release, adding to a similar total energy release. For the three energy definitions we tested, these avalanche models exhibit almost identical distributions of event size measures. Our results indicate that the key to reproduce solar-like power-law slopes in these size measures is lattice configurations in which most nodes remain relatively far from the instability threshold.",
    link: { href: 'https://ui.adsabs.harvard.edu/link_gateway/2024SoPh..299...13L/doi:10.48550/arXiv.2401.14503', label: "Lire l'article" },
  },
  {
    kind: 'card',
    front: '/cards/recherche/card3_front.png',
    label: "Avalanches in Magnetohydrodynamical simulations",
    description: 'Deuxième article publié dans le cadre de mon doctorat à l\'Université de Montréal.',
    abstract: "Scale invariance is a hallmark of many natural systems, including solar flares, where energy release spans a vast range of scales. Recent computational advances, at the level of both algorithmics and hardware, have enabled high-resolution magnetohydrodynamical (MHD) simulations to span multiple scales, offering new insights into magnetic energy dissipation processes. Here, we study scale invariance of magnetic energy dissipation in two distinct MHD simulations. Current sheets are identified and analyzed over time. Results demonstrate that dissipative events exhibit scale invariance, with power-law distributions characterizing their energy dissipation and lifetimes. Remarkably, these distributions are consistent across the two simulations, despite differing numerical and physical setups, suggesting universality in the process of magnetic energy dissipation. Comparisons between the evolution of dissipation regions reveals distinct growth behaviors in high plasma-beta regions (convective zone) and low plasma-beta regions (atmosphere). The latter display spatiotemporal dynamics similar to those of avalanche models, suggesting self-organized criticality and a common universality class.",
    link: { href: 'https://ui.adsabs.harvard.edu/link_gateway/2025PhRvE.112f3202L/doi:10.1103/28ws-d57z', label: "Lire l'article" },
  },
]
