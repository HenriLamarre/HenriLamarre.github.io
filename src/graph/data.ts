import type { Text } from '../i18n/types'
import type { Block } from './blocks'

export type NodeKind = 'category' | 'application'

export type GraphNode = {
  /** Never translated — this is what links refer to. */
  id: string
  kind: NodeKind
  name: Text
  /**
   * Optional artwork replacing the star dot. Path under /public, .png or .svg.
   * Loaded as an image, so it keeps its own colours: it dims with the rest of
   * the graph but cannot be tinted by selection state.
   */
  icon?: string
  /** Lead paragraph shown in the window when the node is opened. */
  description?: Text
  /** The body of the window: text, images, links, video, 3D. */
  body?: Block[]
  link?: { href: string; label: Text }
}

export type GraphLink = {
  source: string
  target: string
}

export const NODES: GraphNode[] = [
  // Categories — the bright, well-connected stars.
  {
    id: 'study',
    kind: 'category',
    name: { fr: 'Études', en: 'Studies' },
    description: {
      fr: 'Math et Physique.',
      en: 'Math and Physics.',
    },
    icon: '/icons/study.png',
  },
  {
    id: 'programmation',
    kind: 'category',
    name: { fr: 'Programmation', en: 'Coding' },
    description: {
      fr: 'Python, C#, Fortran, Bash, etc.',
      en: 'Python, C#, Fortran, Bash, etc.',
    },
    icon: '/icons/programmation.png',
  },
  {
    id: 'pedagogie',
    kind: 'category',
    name: { fr: 'Pédagogie', en: 'Pedagogy' },
    description: {
      fr: 'Enseignement, vulgarisation et conférences.',
      en: 'Teaching, outreach and conferences.',
    },
    icon: '/icons/pedagogie.png',
  },
  {
    id: 'modelisation',
    kind: 'category',
    name: { fr: 'Modelisation', en: 'Modelisation' },
    description: {
      fr: 'Modélisation et simulation numérique.',
      en: 'Modeling and numerical simulation.',
    },
    icon: '/icons/modelisation.png',
  },
  {
    id: 'musique',
    kind: 'category',
    name: { fr: 'Musique', en: 'Music' },
    description: {
      fr: 'Création et production musicale.',
      en: 'Music creation and production.',
    },
    icon: '/icons/musique.png',
  },

  // Applications — smaller stars orbiting their category.
  {
    id: 'diplomes',
    kind: 'application',
    name: { fr: 'Diplômes', en: 'Degrees' },
    body: [
      {type: 'text', variant: 'title', text: {en: 'Double DEC in Music and Natural Sciences', fr: 'Double DEC en Musique et Sciences Naturelles'}},
      {type: 'text', variant: 'subtitle', text: {en: '2015-2018', fr: '2015-2018'}},
      {type: 'link', href: 'https://www.cegepsl.qc.ca/', label: {en: 'CEGEP Saint-Laurent', fr: 'CEGEP Saint-Laurent'}},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'BAC Honours Math and Physics', fr: 'BAC Honours Math et Physique'}},
      {type: 'text', variant: 'subtitle', text: {en: '2018-2021', fr: '2018-2021'}},
      {type: 'link', href: 'https://www.mcgill.ca/', label: {en: 'McGill University', fr: 'Université McGill'}},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Ph.D. in Astrophysics', fr: 'Ph.D. en Astrophysique'}},
      {type: 'text', variant: 'subtitle', text: {en: '2021-2026', fr: '2021-2026'}},
      {type: 'text', variant: 'subtitle', text: {en: 'Thesis on predicting solar flares', fr: 'Thèse sur la prédiction des éruptions solaires'}},
      {type: 'link', href: 'https://www.umontreal.ca/', label: {en: 'University of Montreal', fr: 'Université de Montréal'}},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Microprogram in indie video games', fr: 'Micropgrogramme en jeux vidéo indépendants'}},
      {type: 'text', variant: 'subtitle', text: {en: '2025-2026', fr: '2025-2026'}},
      {type: 'link', href: 'https://www.uqat.ca/etudes/creation-et-nouveaux-medias/microprogramme-1er-cycle-en-jeu-video-independant/', label: {en: 'University of Quebec in Abitibi-Témiscamingue', fr: 'Université du Québec en Abitibi-Témiscamingue'}},

    ]
  },
  {
    id: 'conferences',
    kind: 'application',
    name: { fr: 'Conférences', en: 'Conferences' },
  },
  {
    id: 'recherche',
    kind: 'application',
    name: { fr: 'Recherche', en: 'Research' },
    body: [
      {type: 'model', src: '/models/Model5.glb', zoom: 1.5},
    ]
  },
  {
    id: 'enseignement',
    kind: 'application',
    name: { fr: 'Enseignement', en: 'Teaching' },
  },
  {
    id: 'vulgarisation',
    kind: 'application',
    name: { fr: 'Vulgarisation', en: 'Outreach' },
  },
  {
    id: 'derapage',
    kind: 'application',
    name: { fr: 'Dérapage', en: 'Dérapage' },
    body: [
      {type: 'text', variant: 'title', text: {en: 'Dérapage Competition', fr: 'Concours Dérapage'}},
      {type: 'text', variant: 'subtitle', text: {en: 'DÉRAPAGE is a unique event of audiovisual exploration that annually invites people from all disciplines to create a non narrative sonorized audiovisual short piece of less than three minutes.', fr: 'L’événement DÉRAPAGE est consacré à l’expérimentation de techniques d’animation et de tournage vidéo non traditionnels, à l’exploration de systèmes de scénarisation et de structures de non narration et d’abstraction audiovisuelles : rythme et mouvement, animation abstraite, «video synthesis», design génératif.'}},
      {type: 'link', href: 'https://derapage.ca/#a-propos', label: {en: 'Learn more about DÉRAPAGE', fr: 'En savoir plus sur DÉRAPAGE'}},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Dérapage 2024', fr: 'Dérapage 2024'}},
      {type: 'text', variant: 'subtitle', text: {en: 'SOUPE AUX CHOUX', fr: 'SOUPE AUX CHOUX'}},
      {type: 'video', youtube: 'cvYGijhQTRI', caption: { en: 'Video of the 2024 DÉRAPAGE competition', fr: 'Vidéo du concours DÉRAPAGE 2024' } },
      {type: 'text', variant: 'subtitle', text: {en: 'Model generated for the video', fr: 'Modèle généré pour la vidéo'}},
      {type: 'text', text: {en: 'Procedural model generated on blender with geometry nodes', fr: 'Modèle 3D procedural généré sur blender avec des geometry nodes' }},
      {type: 'model', src: '/models/Model1.glb', zoom: 1.5},

      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Dérapage 2025', fr: 'Dérapage 2025'}},
      {type: 'text', variant: 'subtitle', text: {en: 'Spaghettification : aux origines du quotidien et de l\'infini', fr: 'Spaghettification : aux origines du quotidien et de l\'infini'}},
      {type: 'video', youtube: 'XWf_XqVtyIc', caption: { en: 'Video of the 2025 DÉRAPAGE competition', fr: 'Vidéo du concours DÉRAPAGE 2025' } },
      {type: 'text', variant: 'subtitle', text: {en: 'Model deformed procedurally for the video', fr: 'Modèle déformé procéduralement pour la vidéo'}},
      {type: 'text', text: {en: 'Procedural model generated on blender with geometry nodes', fr: 'Modèle 3D procedural généré sur blender avec des geometry nodes' }},
      {type: 'model', src: '/models/Model2.glb', zoom: 1.5}

    ]
  },
  {
    id: 'procedural',
    kind: 'application',
    name: { fr: 'Expérimentations Procédurales', en: 'Procedural experiments' },
    body: [
      {type: 'text', text: {en: 'Exploration of using mathematical functions to evolve 3D models in Blender', fr: 'Exploration de l\'utilisation de fonctions mathématiques pour faire évoluer des modèles 3D dans Blender'}},
      
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Liquid Gold', fr: 'Or Liquide'}},
      {type: 'text', text: {en: 'Procedural model of a standing wave generated on blender with geometry nodes', fr: 'Modèle 3D d\'une onde stationnaire procedural généré sur blender avec des geometry nodes' }},
      {type: 'model', src: '/models/Model6.glb', zoom: 1.5},

      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Vortex', fr: 'Vortex'}},
      {type: 'text', text: {en: 'Procedural model of a a curl-driven normal excursion generated on blender with geometry nodes', fr: 'Modèle 3D d\'une excursion menée par le rotationnel de la normale, généré sur blender avec des geometry nodes' }},
      {type: 'model', src: '/models/Model3.glb', zoom: 1.5},

    ]
  },
  {
    id: 'gamejams',
    kind: 'application',
    name: { fr: 'Compétitions de Jeux', en: 'Game Jams' },
    body: [
      {type: 'text', text: {en: 'Game Jams are events where developers create games in a short amount of time', fr: 'Les Game Jams sont des événements où les développeurs créent des jeux en un temps réduit'}},
      
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Dap Mr. P', fr: 'Dap Mr. P'}},
      {type: 'text', text: {en: 'Game Jam made for the BigMode Game Jam 2026', fr: 'Jeux de la BigMode Game Jam 2026' }},
      { type: 'itch', id: '4239580', label: { en: 'Dap Mr. P', fr: 'Dap Mr. P' } },

      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Gargantua', fr: 'Gargantua'}},
      {type: 'text', text: {en: 'Game Jam made for the Rive Game Challenge', fr: 'Jeux fait pour le Challenge de Jeux Rive' }},
      { type: 'itch', id: '4308280', label: { en: 'Gargantua', fr: 'Gargantua' } },


      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Diamond Drive', fr: 'Diamond Drive'}},
      {type: 'text', text: {en: 'Game Jam made for the BigMode Game Jam 2025', fr: 'Jeux de la BigMode Game Jam 2025' }},
      { type: 'itch', id: '3298422', label: { en: 'Diamond Drive', fr: 'Diamond Drive' } },
    ]
  },
  {
    id: 'h0l0gram',
    kind: 'application',
    name: { fr: 'H0l0gram', en: 'H0l0gram' },
    body: [
      {type: 'text', text: {en: 'H0l0gram is a musical project of Henri Lamarre, Clarence Egger and Laurier Lehoux-Blanc, born during their studies at the CEGEP of Saint-Laurent.', fr: 'H0l0gram est le projet musical de Henri Lamarre, Clarence Egger et Laurier Lehoux-Blanc, né lors de leur études au CEGEP de Saint-Laurent.'}},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'DEMO', fr: 'DEMO'}},
      { type: 'bandcamp', album: '1327541059'},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Space Diffraction', fr: 'Space Diffraction'}},
      { type: 'bandcamp', album: '438589102'},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: 'Journey', fr: 'Journey'}},
      { type: 'bandcamp', album: '2238149068'},
      {type: 'rule'},
      {type: 'text', variant: 'title', text: {en: '深夜Paragon', fr: '深夜Paragon'}},
      { type: 'bandcamp', album: '791963209'},
    ]

  },
  {
    id: 'klaxon',
    kind: 'application',
    name: { fr: 'Klaxon', en: 'Klaxon' },
  },
]

/** Applications attach to their category. */
const MEMBERSHIP: GraphLink[] = [
  { source: 'musique', target: 'h0l0gram' },
  { source: 'musique', target: 'gamejams' },
  { source: 'musique', target: 'klaxon' },
  { source: 'modelisation', target: 'procedural' },
  { source: 'modelisation', target: 'klaxon' },
  { source: 'modelisation', target: 'derapage' },
  { source: 'modelisation', target: 'gamejams' },
  { source: 'pedagogie', target: 'conferences' },
  { source: 'pedagogie', target: 'enseignement' },
  { source: 'pedagogie', target: 'vulgarisation' },
  { source: 'study', target: 'diplomes' },
  { source: 'study', target: 'recherche' },
  { source: 'study', target: 'enseignement' },
  { source: 'study', target: 'conferences' },
  { source: 'programmation', target: 'recherche' },
  { source: 'programmation', target: 'derapage' },
  { source: 'programmation', target: 'procedural' },
  { source: 'programmation', target: 'gamejams' },
  { source: 'programmation', target: 'klaxon' },

]

const CATEGORY_IDS = NODES.filter((node) => node.kind === 'category').map((node) => node.id)

/** Every category is linked to every other, forming the core constellation. */
const CATEGORY_LINKS: GraphLink[] = CATEGORY_IDS.flatMap((source, i) =>
  CATEGORY_IDS.slice(i + 1).map((target) => ({ source, target })),
)

export const LINKS: GraphLink[] = [...CATEGORY_LINKS, ...MEMBERSHIP]
