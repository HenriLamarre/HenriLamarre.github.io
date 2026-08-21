import type { Selection } from '../components/RiveScene'
import type { CarouselItem } from './types'
import { MODELISATION } from './modelisation'
import { RECHERCHE } from './recherche'
import { JEUX } from './jeux'
import { ENSEIGNEMENT } from './enseignement'

/** Everything a scene shows in its carousel, keyed by the planet clicked. */
export const CONTENT: Record<Selection, CarouselItem[]> = {
  modelisation: MODELISATION,
  sun: RECHERCHE,
  jeux: JEUX,
  enseignement: ENSEIGNEMENT,
}

export type { CarouselItem, CardItem, ModelItem } from './types'
