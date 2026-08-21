import type { CarouselItem } from './types'

export const MODELISATION: CarouselItem[] = [
  {
    kind: 'model',
    url: '/models/Model1.glb',
    label: 'La Soupe aux Choux',
    description:
      'Modèle procédural généré sur Blender dans le cadre de la compétition Dérapage 2025.',
    link: { href: 'https://www.youtube.com/watch?v=cvYGijhQTRI', label: 'Vidéo' },
  },
  {
    kind: 'model',
    url: '/models/Model2.glb',
    label: "Spaghettification : aux origines du quotidien et de l'infini",
    description: 'Un des modèles générés sur Blender pour la compétition Dérapage 2026.',
    link: { href: 'https://www.youtube.com/watch?v=XWf_XqVtyIc', label: 'Vidéo' },
  },
  {
    kind: 'model',
    url: '/models/Model3.glb',
    label: 'Typhon',
    description: 'Expérimentation procédurale de geometry nodes dans Blender.',
  },
  {
    kind: 'model',
    url: '/models/Model4.glb',
    label: 'Ore',
    description: 'Prototype de tuiles et de ressource dans un projet de jeu vidéo.',
  },
  {
    kind: 'model',
    url: '/models/Model5.glb',
    label: 'Coronal Loop',
    description:
      'Boucle de champ magnétique coronale générée dans une simulation magnétohydrodynamique 3D.',
  },
]
