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
    label: 'Model 1',
    description: 'Add a sentence or two about this model here.',
    // link: { href: 'https://github.com/HenriLamarre/…', label: 'Voir le projet' },
  },
  {
    url: '/models/Model2.glb',
    label: 'Model 2',
    description: 'And another description here.',
  },
]
