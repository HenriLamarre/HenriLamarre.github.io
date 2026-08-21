/** Shared fields for anything shown in a carousel. */
type BaseItem = {
  label: string
  /** One or two sentences shown under the label. */
  description?: string
  /** Optional link out — a paper, a repo, a video, a project page. */
  link?: { href: string; label: string }
}

/** A 3D model, loaded from a .glb under /public/models. */
export type ModelItem = BaseItem & {
  kind: 'model'
  url: string
}

/**
 * A two-sided card, like a playing card. Images live under
 * /public/cards/<scene>/. The back is optional — without one the card gets a
 * plain back in the scene's own colour.
 */
export type CardItem = BaseItem & {
  kind: 'card'
  front: string
  /** Back artwork. Takes precedence over `abstract` if both are given. */
  back?: string
  /** Text printed on the back instead of artwork — an abstract, a summary. */
  abstract?: string
}

export type CarouselItem = ModelItem | CardItem
