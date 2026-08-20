export type ModelEntry = {
  /** Path under /public, e.g. "/models/Model1.glb" */
  url: string
  label: string
  /** One or two sentences shown under the label. */
  description?: string
  /** Optional link out — a repo, a paper, a project page. */
  link?: { href: string; label: string }
}

/** Add entries here to put more models in the carousel. */
export const MODELS: ModelEntry[] = [
  {
    url: '/models/Model1.glb',
    label: 'La Soupe aux Choux',
    description: 'Modèle procédural généré sur Blender dans le cadre de la compétition Dérapage 2025.',
    link: { href: 'https://www.youtube.com/watch?v=cvYGijhQTRI', label: 'Vidéo  ' },
  },
  {
    url: '/models/Model2.glb',
    label: 'Spaghettification : aux origines du quotidien et de l\'infini',
    description: 'Un des modèles générés sur Blender pour la compétition Dérapage 2026.',
    link: { href: 'https://www.youtube.com/watch?v=XWf_XqVtyIc', label: 'Vidéo  ' },
  },
  {
    url: '/models/Model3.glb',
    label: 'Typhon',
    description: 'Expérimentation procédurale de géometry nodes dans Blender.',
  },
  {
    url: '/models/Model4.glb',
    label: 'Ore',
    description: 'Prototype de tuiles et de ressource dans un projet de jeu vidéo.',
  },
]
