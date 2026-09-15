import { LINKS, NODES } from './data'

/**
 * The constellation's colour system.
 *
 * Colour is the only thing that says where a star belongs, now that the nodes
 * carry no artwork. Categories are the palette: each one owns a hue.
 * Applications have no hue of their own — each takes the blend of the
 * categories it links to, so a star's colour is a readable summary of what it
 * sits between.
 */

// --- The palette ---

/**
 * When false, every star wears `STAR_COLOUR`, and categories stand apart from
 * applications by size and by applications being faded (`STAR_OPACITY`).
 * When true, each category owns a hue from `CATEGORY_COLOURS` and each
 * application takes the blend of its categories.
 */
const COLOUR_BY_CATEGORY = false

/** The one colour every star wears while `COLOUR_BY_CATEGORY` is off. */
export const STAR_COLOUR = '#fde68a'

/**
 * How opaque each kind of star is. A hovered or open application is drawn at
 * full strength.
 */
export const STAR_OPACITY = { category: 1, application: 0.45 } as const

/**
 * One colour per category id in ./data.ts. This object is the whole palette:
 * every application colour, every edge tint and every label is derived from
 * it, so swapping a hex here is all it takes to recolour the graph.
 *
 * The defaults sit on a single OKLCH ring — `oklch(0.82 0.13 h)` — at evenly
 * spaced hues, so no category outshines another. Their order is deliberate:
 * categories that share applications are neighbours on the wheel, which puts
 * each blend visibly *between* its parents rather than somewhere unrelated.
 *
 * Coral and indigo are the ring's gamut-clipped edge — they ask for more
 * chroma than sRGB has at that lightness — so reading them back gives
 * slightly less than 0.13. That is fine, and it is why the blends are
 * computed from these hexes rather than from the nominal ring: what is
 * written here is what the mixing works from.
 */
export const CATEGORY_COLOURS: Record<string, string> = {
  study: '#ffa9b2', //         coral   oklch(0.82 0.13 12)
  pedagogie: '#f6b75c', //     amber   oklch(0.82 0.13 74)
  musique: '#a3d67d', //       green   oklch(0.82 0.13 133)
  programmation: '#37dedb', // cyan    oklch(0.82 0.13 193)
  modelisation: '#9dc7fe', //  indigo  oklch(0.82 0.13 255)
}

/**
 * How a blend sits against the categories it came from: a little lighter and
 * a little less saturated, so an application reads as related to its parents
 * but subordinate to them.
 */
const BLEND = { chroma: 0.88, lightness: 0.02 }

/** For a star whose colour cannot be derived — an application with no category. */
const FALLBACK = '#8a8a99'

/** Page and window neutrals. */
export const SURFACE = {
  background: '#07070a',
  panel: '#0b0b10',
  hairline: '#1b1b22',
  textPrimary: '#e8e8ef',
  textSecondary: '#8a8a99',
} as const

/**
 * The bloom around a star, as distances in px beyond its radius. Two passes:
 * a tight bright one and a wide faint one, which together read as a glow
 * rather than as a ring.
 */
export const GLOW = {
  category: { inner: 14, outer: 38, outerOpacity: 0.35 },
  application: { inner: 9, outer: 22, outerOpacity: 0.2 },
} as const

/** Stops of the radial gradient a bloom is painted with. */
export const GLOW_STOPS = [
  { offset: '0%', opacity: 0.95 },
  { offset: '28%', opacity: 0.4 },
  { offset: '65%', opacity: 0.1 },
  { offset: '100%', opacity: 0 },
] as const

/** Edge tint strength: at rest, when it touches the open star, and when dimmed. */
export const LINK_OPACITY = { rest: 0.34, active: 0.8, dimmed: 0.08 } as const

/**
 * The open window's tones, each a lightness and a share of the star's own
 * chroma. Everything in the window takes its colour from the star that was
 * clicked; these are the steps from bright headings down to faint separators.
 * The frame, glows and window title use the star's colour itself.
 */
const PANEL_TONES = {
  /** Headings, emphasis, links: near-white, just tinted. */
  strong: { lightness: 0.96, chroma: 0.3 },
  /** Subtitles and navigation. */
  muted: { lightness: 0.8, chroma: 0.6 },
  /** Captions and secondary descriptions. */
  faint: { lightness: 0.68, chroma: 0.5 },
  /** Separators. */
  dim: { lightness: 0.52, chroma: 0.45 },
} as const

// --- OKLCH ---

type Oklch = { L: number; C: number; h: number }

const srgbToLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

const linearToSrgb = (channel: number) =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055

/** Hex to OKLCH. Accepts `#rgb` and `#rrggbb`. Hue is in degrees, unwrapped. */
function parse(hex: string): Oklch {
  const digits = hex.replace('#', '')
  const value = Number.parseInt(
    digits.length === 3 ? digits.replace(/./g, (digit) => digit + digit) : digits,
    16,
  )

  const red = srgbToLinear(((value >> 16) & 0xff) / 255)
  const green = srgbToLinear(((value >> 8) & 0xff) / 255)
  const blue = srgbToLinear((value & 0xff) / 255)

  // Linear sRGB to LMS to OKLab, with Björn Ottosson's matrices.
  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)

  const L = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short
  const a = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short
  const b = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short

  return { L, C: Math.hypot(a, b), h: (Math.atan2(b, a) * 180) / Math.PI }
}

/** OKLCH back to hex, clamped into sRGB. */
function format({ L, C, h }: Oklch): string {
  const radians = (h * Math.PI) / 180
  const a = C * Math.cos(radians)
  const b = C * Math.sin(radians)

  const long = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const medium = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const short = (L - 0.0894841775 * a - 1.291485548 * b) ** 3

  const channels = [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ]

  return `#${channels
    .map((channel) => {
      const byte = Math.round(Math.min(1, Math.max(0, linearToSrgb(channel))) * 255)
      return byte.toString(16).padStart(2, '0')
    })
    .join('')}`
}

/**
 * Mixes colours the way an application mixes its categories, then steps the
 * result down by `BLEND` so it cannot be mistaken for a category itself.
 *
 * Lightness and chroma are plain averages, but hue is a *circular* mean — the
 * average of the hue directions rather than of the numbers, so 350° and 10°
 * meet at 0° instead of at 180°. Averaging OKLab's a and b directly would
 * agree with this for neighbouring hues, but opposing ones would cancel and
 * the blend of two complements would come out grey. Mixing the hue and
 * keeping the chroma leaves every blend as vivid as its parents, which is
 * what makes it legible against a near-black sky.
 *
 * Takes any number of colours, since an application can belong to more than
 * two categories.
 */
export function blend(colours: string[]): string {
  if (colours.length === 0) return FALLBACK

  const parts = colours.map(parse)
  let x = 0
  let y = 0
  let lightness = 0
  let chroma = 0

  for (const part of parts) {
    const radians = (part.h * Math.PI) / 180
    x += Math.cos(radians)
    y += Math.sin(radians)
    lightness += part.L
    chroma += part.C
  }

  return format({
    L: lightness / parts.length + BLEND.lightness,
    C: (chroma / parts.length) * BLEND.chroma,
    // Hues that cancel exactly leave no direction to take. Falling back to the
    // first parent is arbitrary, but it is stable and it is never grey.
    h: Math.hypot(x, y) < 1e-6 ? parts[0].h : (Math.atan2(y, x) * 180) / Math.PI,
  })
}

export type PanelTones = { accent: string } & Record<keyof typeof PANEL_TONES, string>

/** The window's palette, derived from the colour of the star that opened it. */
export function panelTones(colour: string): PanelTones {
  const { C, h } = parse(colour)
  const tone = ({ lightness, chroma }: { lightness: number; chroma: number }) =>
    format({ L: lightness, C: C * chroma, h })

  return {
    accent: colour,
    strong: tone(PANEL_TONES.strong),
    muted: tone(PANEL_TONES.muted),
    faint: tone(PANEL_TONES.faint),
    dim: tone(PANEL_TONES.dim),
  }
}

/**
 * The same tones as CSS custom properties. Set on the window, so everything
 * inside it — blocks, inline markup, the scrollbar — picks them up without
 * being handed a colour.
 */
export function panelColours(colour: string): Record<`--${string}`, string> {
  const tones = panelTones(colour)
  return {
    '--accent': tones.accent,
    '--accent-strong': tones.strong,
    '--accent-muted': tones.muted,
    '--accent-faint': tones.faint,
    '--accent-dim': tones.dim,
  }
}

// --- Resolving the graph ---

const CATEGORY_IDS = new Set(
  NODES.filter((node) => node.kind === 'category').map((node) => node.id),
)

/** The categories a node hangs off — the colours it is mixed from. */
function categoriesOf(id: string): string[] {
  const found: string[] = []

  for (const link of LINKS) {
    if (link.source === id && CATEGORY_IDS.has(link.target)) found.push(link.target)
    else if (link.target === id && CATEGORY_IDS.has(link.source)) found.push(link.source)
  }

  return found
}

/** Every star's colour, resolved once at load: the graph never changes shape. */
export const NODE_COLOURS: Record<string, string> = Object.fromEntries(
  NODES.map((node) => {
    if (!COLOUR_BY_CATEGORY) return [node.id, STAR_COLOUR]

    if (node.kind === 'category') {
      return [node.id, CATEGORY_COLOURS[node.id] ?? FALLBACK]
    }

    const parents = categoriesOf(node.id)
      .map((id) => CATEGORY_COLOURS[id])
      .filter((colour): colour is string => Boolean(colour))

    return [node.id, blend(parents)]
  }),
)

export function nodeColour(id: string): string {
  return NODE_COLOURS[id] ?? FALLBACK
}

const linkColours = new Map<string, string>()

/**
 * An edge takes the colour of its subordinate end: a category-to-application
 * line is tinted with the application's blend, so it reads as the child
 * reaching back to a parent. Between two categories neither end is
 * subordinate, so the line takes their blend instead.
 */
export function linkColour(source: string, target: string): string {
  if (!COLOUR_BY_CATEGORY) return STAR_COLOUR

  const key = `${source} ${target}`
  const cached = linkColours.get(key)
  if (cached) return cached

  const sourceIsCategory = CATEGORY_IDS.has(source)
  const targetIsCategory = CATEGORY_IDS.has(target)

  const colour =
    sourceIsCategory === targetIsCategory
      ? blend([nodeColour(source), nodeColour(target)])
      : nodeColour(sourceIsCategory ? target : source)

  linkColours.set(key, colour)
  return colour
}
