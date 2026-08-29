export type NodeKind = 'category' | 'application'

export type GraphNode = {
  id: string
  name: string
  kind: NodeKind
  /** Lead paragraph shown in the window when the node is opened. */
  description?: string
  /** Further paragraphs. The window scrolls, so add as many as needed. */
  body?: string[]
  link?: { href: string; label: string }
}

export type GraphLink = {
  source: string
  target: string
}

export const NODES: GraphNode[] = [
  // Categories — the bright, well-connected stars.
  { id: 'recherche', name: 'Recherche', kind: 'category', description: 'Physique solaire et magnétohydrodynamique. Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.Physique solaire et magnétohydrodynamique.' },
  { id: 'modelisation', name: 'Modélisation', kind: 'category', description: 'Blender, geometry nodes, rendu procédural.' },
  { id: 'jeux', name: 'Jeux', kind: 'category', description: 'Prototypes, outils et projets de jeux.' },
  { id: 'enseignement', name: 'Enseignement', kind: 'category', description: 'Cours, ateliers et vulgarisation.' },

  // Applications — smaller stars orbiting their category.
  { id: 'mhd', name: 'MHD', kind: 'application', description: 'Simulations magnétohydrodynamiques 3D.' },
  { id: 'avalanches', name: 'Avalanches', kind: 'application', description: 'Criticalité auto-organisée et éruptions solaires.' },
  { id: 'cosmic-dawn', name: 'Cosmic dawn', kind: 'application', description: 'Réionisation et signal 21 cm.' },
  { id: 'derapage', name: 'Dérapage', kind: 'application', description: "Compétition d'animation." },
  { id: 'geometry-nodes', name: 'Geometry nodes', kind: 'application', description: 'Expérimentation procédurale.' },
  { id: 'klaxon', name: 'Klaxon', kind: 'application', description: 'Projet de jeu.' },
  { id: 'ore', name: 'Ore', kind: 'application', description: 'Prototype de tuiles et de ressources.' },
  { id: 'python', name: 'Python', kind: 'application', description: 'Analyse et visualisation de données.' },
  { id: 'ateliers', name: 'Ateliers', kind: 'application', description: 'Activités de vulgarisation.' },
]

/** Applications attach to their category. */
const MEMBERSHIP: GraphLink[] = [
  { source: 'recherche', target: 'mhd' },
  { source: 'recherche', target: 'avalanches' },
  { source: 'recherche', target: 'cosmic-dawn' },
  { source: 'modelisation', target: 'derapage' },
  { source: 'modelisation', target: 'geometry-nodes' },
  { source: 'jeux', target: 'klaxon' },
  { source: 'jeux', target: 'ore' },
  { source: 'enseignement', target: 'python' },
  { source: 'enseignement', target: 'ateliers' },

  // Cross-links: an application can belong to more than one category.
  { source: 'modelisation', target: 'mhd' },
  { source: 'jeux', target: 'geometry-nodes' },
  { source: 'recherche', target: 'python' },
]

const CATEGORY_IDS = NODES.filter((node) => node.kind === 'category').map((node) => node.id)

/** Every category is linked to every other, forming the core constellation. */
const CATEGORY_LINKS: GraphLink[] = CATEGORY_IDS.flatMap((source, i) =>
  CATEGORY_IDS.slice(i + 1).map((target) => ({ source, target })),
)

export const LINKS: GraphLink[] = [...CATEGORY_LINKS, ...MEMBERSHIP]
