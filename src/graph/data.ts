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
    body: [
      {
        type: 'text',
        text: {
          fr: 'Présentations de ma recherche en physique solaire dans des conférences internationales, en colloque comme en affiche.',
          en: 'Presentations of my solar physics research at international conferences, as talks and posters.',
        },
      },

      { type: 'rule' },
      {
        type: 'text',
        variant: 'title',
        text: { fr: 'European Space Weather Week 2025', en: 'European Space Weather Week 2025' },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Umeå, Suède — novembre 2025', en: 'Umeå, Sweden — November 2025' },
      },
      {
        type: 'text',
        text: {
          fr: 'Conférence européenne de météo spatiale, où j’ai présenté ma recherche en colloque.',
          en: 'European space weather conference, where I presented my research as a talk.',
        },
      },

      { type: 'rule' },
      {
        type: 'text',
        variant: 'title',
        text: { fr: '14e Festival de Théorie', en: '14th Festival de Théorie' },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Aix-en-Provence, France — juillet 2025', en: 'Aix-en-Provence, France — July 2025' },
      },
      {
        type: 'text',
        text: {
          fr: 'Conférence internationale de modélisation numérique, où j’ai présenté ma recherche en colloque.',
          en: 'International conference on numerical modelling, where I presented my research as a talk.',
        },
      },

      { type: 'rule' },
      { type: 'text', variant: 'title', text: { fr: 'ESPM17', en: 'ESPM17' } },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Turin, Italie — septembre 2024', en: 'Turin, Italy — September 2024' },
      },
      {
        type: 'text',
        text: {
          fr: 'Conférence européenne de physique solaire, où j’ai présenté ma recherche sous forme d’affiche.',
          en: 'European solar physics meeting, where I presented my research as a poster.',
        },
      },

      { type: 'rule' },
      { type: 'text', variant: 'title', text: { fr: 'Idéfix Days 2024', en: 'Idéfix Days 2024' } },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Grenoble, France — juillet 2024', en: 'Grenoble, France — July 2024' },
      },
      {
        type: 'text',
        text: {
          fr: 'Atelier international de modélisation numérique.',
          en: 'International workshop on numerical modelling.',
        },
      },

      { type: 'rule' },
      { type: 'text', variant: 'title', text: { fr: 'Whole Sun 2024', en: 'Whole Sun 2024' } },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Saclay, France — mars 2024', en: 'Saclay, France — March 2024' },
      },
      {
        type: 'text',
        text: {
          fr: 'Atelier international de physique solaire, où j’ai présenté ma recherche en colloque.',
          en: 'International solar physics workshop, where I presented my research as a talk.',
        },
      },

      { type: 'rule' },
      {
        type: 'text',
        variant: 'title',
        text: { fr: 'Conférence annuelle du CRAQ', en: 'CRAQ Annual Conference' },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Lac à l’Eau Claire, Québec — mai 2023 et 2024', en: 'Lac à l’Eau Claire, Quebec — May 2023 and 2024' },
      },
      {
        type: 'text',
        text: {
          fr: 'Conférence annuelle du Centre de recherche en astrophysique du Québec, où j’ai participé à l’organisation et donné des présentations orales.',
          en: 'Annual conference of the Quebec astrophysics research centre, where I helped organise and gave talks.',
        },
      },

      { type: 'rule' },
      { type: 'text', variant: 'title', text: { fr: 'Cool Stars', en: 'Cool Stars' } },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Toulouse, France — juin 2023', en: 'Toulouse, France — June 2023' },
      },
      {
        type: 'text',
        text: {
          fr: 'Conférence internationale sur les étoiles froides et de type solaire, où j’ai présenté mes résultats sous forme d’affiche.',
          en: 'International conference on cool and solar-type stars, where I presented my results as a poster.',
        },
      },
    ],
  },
  {
    id: 'recherche',
    kind: 'application',
    name: { fr: 'Recherche', en: 'Research' },
    body: [
      {
        type: 'text',
        variant: 'title',
        text: {
          fr: 'Prédiction d’éruptions solaires : des modèles d’avalanche aux simulations magnétohydrodynamiques',
          en: 'Forecasting solar flares: from avalanche models to magnetohydrodynamic simulations',
        },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: {
          fr: 'Thèse de doctorat — Université de Montréal, sous la direction de Paul Charbonneau et Antoine Strugarek',
          en: 'Ph.D. thesis — Université de Montréal, supervised by Paul Charbonneau and Antoine Strugarek',
        },
      },
      {
        type: 'text',
        text: {
          fr: 'Les éruptions solaires sont des évènements impulsifs de libération d’énergie magnétique dans l’atmosphère solaire. Elles couvrent plusieurs ordres de grandeur en énergie et présentent des distributions statistiques invariantes d’échelle, ce qui suggère des mécanismes physiques sous-jacents universels. Le cadre de la criticité auto-organisée, et particulièrement les modèles d’avalanches, a donc rapidement été employé pour les décrire — mais des questions demeurent quant à l’interprétation physique de ces modèles, à leur lien avec la magnétohydrodynamique (MHD) et à leur potentiel pour la prévision.',
          en: 'Solar flares are impulsive releases of magnetic energy in the solar atmosphere. They span several orders of magnitude in energy and follow scale-invariant statistical distributions, which suggests universal underlying mechanisms. Self-organized criticality, and avalanche models in particular, has therefore been widely used to describe them — but questions remain about the physical interpretation of these models, their connection to magnetohydrodynamics (MHD), and their forecasting potential.',
        },
      },
      {
        type: 'text',
        text: {
          fr: 'Ma thèse aborde ces trois problématiques successivement : réexaminer les fondements physiques des modèles d’avalanches, chercher des signatures de criticité dans des simulations MHD tridimensionnelles, puis exploiter ces modèles pour prévoir les éruptions par assimilation de données GOES. Ce dernier volet s’avère prometteur pour les éruptions les plus intenses, qui sont aussi les plus difficiles à prédire.',
          en: 'My thesis addresses these three questions in turn: revisiting the physical foundations of avalanche models, looking for criticality signatures in three-dimensional MHD simulations, then using those models to forecast flares by assimilating GOES observations. That last strand looks promising for the largest flares, which are also the hardest to predict.',
        },
      },

      { type: 'model', src: '/models/Model5.glb', zoom: 1.5 },
      {
        type: 'text',
        text: {
          fr: 'Boucle de champ magnétique coronale issue d’une simulation magnétohydrodynamique tridimensionnelle.',
          en: 'A coronal magnetic loop from a three-dimensional magnetohydrodynamic simulation.',
        },
      },

      { type: 'rule' },
      {
        type: 'text',
        variant: 'title',
        text: {
          fr: 'Energy Definition and Minimization in Avalanche Models for Solar Flares',
          en: 'Energy Definition and Minimization in Avalanche Models for Solar Flares',
        },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Solar Physics, 2024', en: 'Solar Physics, 2024' },
      },
      {
        type: 'text',
        text: {
          fr: 'Les modèles d’avalanches en criticité auto-organisée reproduisent les lois de puissance observées dans les éruptions solaires, mais le lien avec la magnétohydrodynamique et les observations reste difficile à établir. Cet article réexamine la définition de l’énergie dans ces modèles et montre qu’utiliser A² comme mesure conduit à des propriétés statistiques ∝ B², à condition d’ajuster les règles de stabilité pour qu’une avalanche libère toujours de l’énergie.',
          en: 'Self-organized critical avalanche models reproduce the power-law distributions observed in solar flares, yet bridging them to magnetohydrodynamics and to real observations remains difficult. This paper revisits how energy is defined in these models and shows that using A² as the energy measure yields statistical properties ∝ B², provided the stability stencils are adjusted so that an avalanche always releases energy.',
        },
      },
      {
        type: 'link',
        href: 'https://ui.adsabs.harvard.edu/link_gateway/2024SoPh..299...13L/doi:10.48550/arXiv.2401.14503',
        label: { fr: 'Lire l’article', en: 'Read the paper' },
      },

      { type: 'rule' },
      {
        type: 'text',
        variant: 'title',
        text: {
          fr: 'Avalanches in Magnetohydrodynamical Simulations',
          en: 'Avalanches in Magnetohydrodynamical Simulations',
        },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Physical Review E, 2025', en: 'Physical Review E, 2025' },
      },
      {
        type: 'text',
        text: {
          fr: 'L’invariance d’échelle caractérise de nombreux systèmes naturels, dont les éruptions solaires, où la libération d’énergie s’étend sur une vaste gamme d’échelles. En identifiant et en suivant l’évolution spatio-temporelle des régions dissipatives dans des simulations MHD à haute résolution, cet article montre que plusieurs propriétés statistiques des modèles d’avalanches émergent naturellement des simulations, et confirme la validité de l’interprétation avalanche de la dissipation d’énergie magnétique.',
          en: 'Scale invariance is a hallmark of many natural systems, including solar flares, where energy release spans a vast range of scales. By spatiotemporally tracking dissipative regions in high-resolution MHD simulations, this paper shows that several statistical properties of avalanche models emerge naturally from the simulations, confirming the validity of the avalanche interpretation of magnetic energy dissipation.',
        },
      },
      {
        type: 'link',
        href: 'https://ui.adsabs.harvard.edu/link_gateway/2025PhRvE.112f3202L/doi:10.1103/28ws-d57z',
        label: { fr: 'Lire l’article', en: 'Read the paper' },
      },
    ],
  },
  {
    id: 'enseignement',
    kind: 'application',
    name: { fr: 'Enseignement', en: 'Teaching' },
    body: [
      {
        type: 'text',
        variant: 'title',
        text: { fr: 'Auxiliaire d’enseignement', en: 'Teaching Assistant' },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: {
          fr: 'Université de Montréal — 2021 à aujourd’hui',
          en: 'Université de Montréal — 2021 to present',
        },
      },
      {
        type: 'text',
        text: {
          fr: 'Démonstrations et correction pour quatre cours de premier cycle en physique.',
          en: 'Demonstrations and grading for four undergraduate physics courses.',
        },
      },

      {
        type: 'text',
        text: {
          fr: '**Électromagnétisme (PHY1441)** — Lois de Coulomb et de Gauss. Potentiel scalaire. Conducteurs. Énergie électrique et magnétique. Dipôle. Courants et densité de courant. Lois d’Ampère et de Biot-Savart. Potentiel vecteur. Loi de Faraday.',
          en: '**Electromagnetism (PHY1441)** — Coulomb’s and Gauss’s laws. Scalar potential. Conductors. Electric and magnetic energy. Dipoles. Currents and current density. Ampère’s and Biot-Savart’s laws. Vector potential. Faraday’s law.',
        },
      },
      {
        type: 'link',
        href: 'https://admission.umontreal.ca/cours-et-horaires/cours/phy-1441/',
        label: { fr: 'PHY1441', en: 'PHY1441' },
      },
      {
        type: 'text',
        text: {
          fr: '**Introduction à la physique numérique (PHY1234)** — Programmation scientifique. Intégration numérique. Systèmes déterministes simples. Phénomènes stochastiques : modèle d’Ising, marches aléatoires, agrégation. Complexité : avalanches, fractales, chaos.',
          en: '**Introduction to Computational Physics (PHY1234)** — Scientific programming. Numerical integration. Simple deterministic systems. Stochastic phenomena: the Ising model, random walks, aggregation. Complexity: avalanches, fractals, chaos.',
        },
      },
      {
        type: 'link',
        href: 'https://admission.umontreal.ca/cours-et-horaires/cours/phy-1234/',
        label: { fr: 'PHY1234', en: 'PHY1234' },
      },
      {
        type: 'text',
        text: {
          fr: '**Ondes et vibrations (PHY1620)** — Oscillations libres, amorties et entretenues. Oscillateurs couplés et modes normaux. Ondes stationnaires. Superposition de modes et analyse de Fourier. Ondes progressives. Réflexion, transmission, interférence.',
          en: '**Waves and Vibrations (PHY1620)** — Free, damped and driven oscillations. Coupled oscillators and normal modes. Standing waves. Superposition and Fourier analysis. Travelling waves. Reflection, transmission, interference.',
        },
      },
      {
        type: 'link',
        href: 'https://admission.umontreal.ca/cours-et-horaires/cours/phy-1620/',
        label: { fr: 'PHY1620', en: 'PHY1620' },
      },
      {
        type: 'text',
        text: {
          fr: '**Mécanique classique 1 (PHY1651)** — Concepts fondamentaux de la mécanique. Lois de conservation. Rotation autour d’un axe. Forces centrales. Problème de Kepler. Diffusion et section efficace. Gravitation.',
          en: '**Classical Mechanics 1 (PHY1651)** — Fundamental concepts of mechanics. Conservation laws. Rotation about an axis. Central forces. The Kepler problem. Scattering and cross-sections. Gravitation.',
        },
      },
      {
        type: 'link',
        href: 'https://admission.umontreal.ca/cours-et-horaires/cours/phy-1651/',
        label: { fr: 'PHY1651', en: 'PHY1651' },
      },

      { type: 'rule' },
      {
        type: 'text',
        variant: 'title',
        text: {
          fr: 'Microprogramme en enseignement supérieur',
          en: 'Graduate Microprogram in Higher Education',
        },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'Université de Montréal — 2024 à 2025', en: 'Université de Montréal — 2024 to 2025' },
      },
      {
        type: 'text',
        text: {
          fr: '**Enseigner au collégial aujourd’hui (PLU6035)** — Enseignement et apprentissage en contexte collégial, planification, méthodes d’évaluation, approches d’intervention en classe, encadrement des étudiants, usages des TIC, éthique.',
          en: '**Teaching in CEGEPs Today (PLU6035)** — Teaching and learning in the CEGEP context, planning, assessment methods, classroom intervention, student supervision, educational technology, ethics.',
        },
      },
      {
        type: 'text',
        text: {
          fr: '**Évaluation en enseignement supérieur (ETA6045)** — Politiques et règlements liés à l’évaluation des apprentissages. Cycle de l’évaluation : planification, collecte, interprétation, jugement et communication, en abordant l’éthique et la différenciation.',
          en: '**Assessment in Higher Education (ETA6045)** — Policies and regulations governing the assessment of learning. The assessment cycle: planning, collection, interpretation, judgement and communication, including ethics and differentiation.',
        },
      },
      {
        type: 'text',
        text: {
          fr: '**Gestion de classe en enseignement supérieur (PPA6617)** — Approches et modèles de gestion de classe en enseignement supérieur, et résolution des problèmes liés à l’établissement et au maintien de conditions propices à l’apprentissage.',
          en: '**Classroom Management in Higher Education (PPA6617)** — Approaches and models of classroom management in higher education, and resolving the problems of establishing and maintaining conditions that support learning.',
        },
      },
      {
        type: 'link',
        href: 'https://admission.umontreal.ca/programmes/microprogramme-de-2e-cycle-en-enseignement-superieur/structure-du-programme/',
        label: { fr: 'Structure du programme', en: 'Program structure' },
      },

      { type: 'rule' },
      { type: 'text', variant: 'title', text: { fr: 'Stage d’enseignement', en: 'Teaching Placement' } },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'CEGEP Saint-Laurent — 2025', en: 'CEGEP Saint-Laurent — 2025' },
      },
      {
        type: 'text',
        text: {
          fr: 'Préparation de cours et enseignement dans la classe d’Olivier Laroche.',
          en: 'Course preparation and teaching in Olivier Laroche’s class.',
        },
      },
    ],
  },
  {
    id: 'vulgarisation',
    kind: 'application',
    name: { fr: 'Vulgarisation', en: 'Outreach' },
    body: [
      {
        type: 'text',
        variant: 'title',
        text: { fr: 'Capsules journalistiques', en: 'Media Appearances' },
      },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: '2025 à 2026', en: '2025 to 2026' },
      },
      {
        type: 'text',
        text: {
          fr: 'Interventions sur les aurores boréales, les éruptions solaires et l’éclipse totale de 2025, avec le Journal de Montréal, Radio-Canada et le 94,5.',
          en: 'Contributions on auroras, solar flares and the 2025 total eclipse, for the Journal de Montréal, Radio-Canada and 94.5 FM.',
        },
      },
      {
        type: 'link',
        href: 'https://ici.radio-canada.ca/ohdio/premiere/emissions/les-annees-lumiere/episodes/1083711/dimanche-24-aout-2025/transcription',
        label: {
          fr: 'Écouter la capsule — Les années lumière, Radio-Canada',
          en: 'Listen — Les années lumière, Radio-Canada',
        },
      },

      { type: 'rule' },
      { type: 'text', variant: 'title', text: { fr: 'Ateliers scientifiques', en: 'Science Workshops' } },
      {
        type: 'text',
        variant: 'subtitle',
        text: { fr: 'CEPSUM — étés 2023 et 2024', en: 'CEPSUM — summers 2023 and 2024' },
      },
      {
        type: 'text',
        text: {
          fr: 'Ateliers de vulgarisation scientifique auprès des jeunes du camp de jour du CEPSUM.',
          en: 'Science outreach workshops with children at the CEPSUM day camp.',
        },
      },
      {
        type: 'link',
        href: 'https://www.cepsum.umontreal.ca/regroupement-activite/camps-de-jour-cepsum',
        label: { fr: 'Camps de jour du CEPSUM', en: 'CEPSUM day camps' },
      },
    ],
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
