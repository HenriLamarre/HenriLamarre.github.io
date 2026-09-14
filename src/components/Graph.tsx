import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type ForceCollide,
  type ForceLink,
  type ForceManyBody,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { LINKS, NODES, type GraphNode, type NodeKind } from '../graph/data'
import {
  GLOW,
  GLOW_STOPS,
  LINK_OPACITY,
  NODE_COLOURS,
  SURFACE,
  linkColour,
  nodeColour,
  panelColours,
} from '../graph/palette'
import { useLocale } from '../i18n/locale'
import { UI } from '../i18n/ui'
import BlockList from './blocks/BlockList'

/** Star size by kind: categories are the bright ones. */
const RADIUS = { category: 8.5, application: 5 } as const
/** Gap between a star's edge and its label, clear of the tight bloom. */
const LABEL_GAP = { category: 13, application: 8 } as const
/** Labels carry the star's colour; an application's sits a little back. */
const LABEL_OPACITY = { category: 1, application: 0.85 } as const
/** Space each node claims in the layout, so labels do not collide. */
const CLEARANCE = { category: 62, application: 40 } as const

/**
 * A phone cannot hold the desktop spacing: fifteen stars asking for up to
 * 124px each, in the ~240px a phone leaves between the walls, never settle.
 * The collide and wall forces fight for as long as the layout is warm — which
 * is the whole time a star is being dragged — and that shows up as jitter.
 *
 * So everything that claims space scales with the viewport width: full size
 * from `LAYOUT_FULL_WIDTH` up, down to `LAYOUT_SCALE_MIN` on a phone.
 */
const LAYOUT_FULL_WIDTH = 1100
const LAYOUT_SCALE_MIN = 0.45

function layoutScale(width: number) {
  return Math.min(1, Math.max(LAYOUT_SCALE_MIN, width / LAYOUT_FULL_WIDTH))
}

/**
 * Keep-out distance from each edge. The right and top get more room because
 * labels sit above and to the right of their star.
 */
const BOUNDS = { left: 28, right: 110, top: 34, bottom: 28 }
/** Velocity kept when a star hits a wall. Below 1, so walls absorb energy. */
const RESTITUTION = 0.35

/** Below this width, windows take a much larger share of the screen. */
const MOBILE_BREAKPOINT = 768

/** An application's window fills most of the screen; it holds real content. */
const PANEL_LARGE_RATIO = { width: 0.75, height: 0.7 }
const PANEL_LARGE_RATIO_MOBILE = { width: 0.92, height: 0.85 }
/** A category's window is just a menu, so on desktop it stays small. */
const PANEL_MIN = { width: 300, height: 220 }
const PANEL_MAX = { width: 440, height: 400 }
const PANEL_RATIO = { width: 0.3, height: 0.46 }
const PANEL_RATIO_MOBILE = { width: 0.88, height: 0.5 }
/**
 * Where the window sits: centred in the viewport. Anchoring it to its star
 * created a feedback loop — the window moved the stars, which moved the star
 * holding the window, which moved the window. The forces and the DOM both use
 * this, so what pushes the stars is exactly what is drawn.
 */
function panelRect(viewport: { width: number; height: number }, kind: NodeKind) {
  const mobile = viewport.width < MOBILE_BREAKPOINT

  // On a phone there is no room to spare, so both kinds take far more of the
  // screen and the desktop caps on the menu no longer apply.
  const large = mobile ? PANEL_LARGE_RATIO_MOBILE : PANEL_LARGE_RATIO
  const menu = mobile ? PANEL_RATIO_MOBILE : PANEL_RATIO

  const width =
    kind === 'application'
      ? viewport.width * large.width
      : mobile
        ? viewport.width * menu.width
        : Math.min(PANEL_MAX.width, Math.max(PANEL_MIN.width, viewport.width * menu.width))

  const height =
    kind === 'application'
      ? viewport.height * large.height
      : mobile
        ? viewport.height * menu.height
        : Math.min(PANEL_MAX.height, Math.max(PANEL_MIN.height, viewport.height * menu.height))

  return {
    width,
    height,
    left: (viewport.width - width) / 2,
    top: (viewport.height - height) / 2,
  }
}
/** Clearance kept between the window's edge and any star. */
const PANEL_MARGIN = 48
/** How hard stars are pushed out of the window's footprint. Gentle, so they
 *  ease out instead of overshooting and bouncing back in. */
const PANEL_PUSH = 0.045
/** The category menu is small and transient, so it barely disturbs the sky. */
const CATEGORY_MARGIN = 14
const CATEGORY_PUSH = 0.018
/** Clearance around the title block. */
const TITLE_MARGIN = 26
/** Quiet period after the last resize event before the layout resumes. */
const RESIZE_SETTLE_MS = 200

/**
 * The cursor drags stars along very slightly, as if it were magnetic. Kept
 * weak and short-range on purpose: any stronger and the stars slide away from
 * under the pointer, which makes them hard to click.
 */
const POINTER_RADIUS = 110
const POINTER_STRENGTH = 0.12
/** Ceiling on one frame of cursor travel, so a flick cannot fling anything. */
const POINTER_MAX_STEP = 18
/** How quickly the cursor's momentum fades once it stops moving. */
const POINTER_DECAY = 0.6
/** Keeps the layout ticking briefly after the cursor stops. */
const POINTER_IDLE_MS = 220

type SimNode = SimulationNodeDatum & GraphNode
type SimLink = SimulationLinkDatum<SimNode>

/** Link endpoints are ids before the simulation resolves them to objects. */
function endpointId(endpoint: SimLink['source']): string {
  return typeof endpoint === 'object' ? (endpoint as SimNode).id : String(endpoint)
}

/** Gradient id for a colour's bloom, shared by every star wearing it. */
function glowId(colour: string): string {
  return `glow-${colour.replace('#', '')}`
}

/**
 * The distinct colours in play. Far fewer than there are stars — siblings of
 * the same categories come out identical — so the gradients are declared per
 * colour and reused.
 */
const GLOW_COLOURS = [...new Set(Object.values(NODE_COLOURS))]

/** The small filled blocks that sit on each corner of a HUD frame. */
function CornerMarks() {
  const positions = [
    { top: -5, left: -5 },
    { top: -5, right: -5 },
    { bottom: -5, left: -5 },
    { bottom: -5, right: -5 },
  ]

  return (
    <>
      {positions.map((position, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-[10px] w-[10px] bg-(--accent-strong)"
          style={{
            ...position,
            boxShadow: '0 0 8px color-mix(in srgb, var(--accent) 90%, transparent)',
          }}
        />
      ))}
    </>
  )
}

export default function Graph() {
  const { locale, setLocale, t } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const selectedRef = useRef<string | null>(null)

  /** In-flight drag: which star, and how far the pointer has travelled. */
  const dragRef = useRef<{ id: string; moved: number; lastX: number; lastY: number } | null>(
    null,
  )

  /** Cursor position, and how far it moved since the last frame. */
  const pointerRef = useRef({ x: 0, y: 0, dx: 0, dy: 0, active: false })

  /** Current share of the desktop spacing, read by the force accessors. */
  const scaleRef = useRef(1)
  /** Latest size, read by the forces so they never close over a stale value. */
  const sizeRef = useRef({ width: 0, height: 0 })
  /** Chrome boxes in container coordinates, so stars can be kept out of them. */
  const titleRef = useRef<HTMLElement>(null)
  const titleBoxRef = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const localeRef = useRef<HTMLDivElement>(null)
  const localeBoxRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [nodes, setNodes] = useState<SimNode[]>([])
  const [links, setLinks] = useState<SimLink[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  /** Neighbours of the selected node, for highlighting. */
  const neighbours = useMemo(() => {
    if (!selected) return new Set<string>()
    const set = new Set<string>()
    for (const link of LINKS) {
      if (link.source === selected) set.add(link.target)
      if (link.target === selected) set.add(link.source)
    }
    return set
  }, [selected])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const measure = () => {
      const rect = element.getBoundingClientRect()
      sizeRef.current = { width: rect.width, height: rect.height }
      setSize({ width: rect.width, height: rect.height })

      const toLocal = (box: DOMRect) => ({
        x: box.left - rect.left,
        y: box.top - rect.top,
        width: box.width,
        height: box.height,
      })

      const title = titleRef.current?.getBoundingClientRect()
      if (title) titleBoxRef.current = toLocal(title)

      const language = localeRef.current?.getBoundingClientRect()
      if (language) localeBoxRef.current = toLocal(language)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const ready = size.width > 0 && size.height > 0

  // Built once. Rebuilding it on every resize was what made the layout jump.
  useEffect(() => {
    if (!ready) return

    scaleRef.current = layoutScale(sizeRef.current.width)
    const simNodes: SimNode[] = NODES.map((node) => ({ ...node }))
    const simLinks: SimLink[] = LINKS.map((link) => ({ ...link }))

    const simulation = forceSimulation(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((node) => node.id)
          // Categories sit far apart; their applications orbit close.
          .distance((link) => {
            const source = link.source as SimNode
            const target = link.target as SimNode
            const bothCategories =
              source.kind === 'category' && target.kind === 'category'
            return (bothCategories ? 260 : 110) * scaleRef.current
          })
          .strength((link) => {
            const source = link.source as SimNode
            const target = link.target as SimNode
            return source.kind === 'category' && target.kind === 'category' ? 0.12 : 0.5
          }),
      )
      .force(
        'charge',
        forceManyBody<SimNode>()
          // Squared: repulsion falls off with distance while the links pull
          // linearly, so halving every distance takes a quarter the charge to
          // hold the same shape.
          .strength(
            (node) => (node.kind === 'category' ? -900 : -320) * scaleRef.current ** 2,
          )
          // Cap the range so distant stars stop nudging each other, which is a
          // common source of low-level jitter.
          .distanceMax(520),
      )
      // Heavy damping: most of a star's velocity is bled off every tick, so it
      // glides into place instead of oscillating around it.
      .velocityDecay(0.72)
      // Cool down sooner, so the layout stops fidgeting once it is settled.
      .alphaDecay(0.035)
      .alphaMin(0.002)
      .force('centre', forceCenter(sizeRef.current.width / 2, sizeRef.current.height / 2).strength(0.05))
      .force(
        'collide',
        forceCollide<SimNode>()
          .radius((node) => CLEARANCE[node.kind] * scaleRef.current)
          // Softer separation: a hard collide fights the other forces and
          // shows up as vibration between neighbours.
          .strength(0.55)
          .iterations(2),
      )
      // Walls: clamp to the viewport and reflect, so nothing drifts off-screen.
      .force('bounds', () => {
        for (const node of simNodes) {
          const x = node.x ?? 0
          const y = node.y ?? 0

          if (x < BOUNDS.left) {
            node.x = BOUNDS.left
            node.vx = Math.abs(node.vx ?? 0) * RESTITUTION
          } else if (x > sizeRef.current.width - BOUNDS.right) {
            node.x = sizeRef.current.width - BOUNDS.right
            node.vx = -Math.abs(node.vx ?? 0) * RESTITUTION
          }

          if (y < BOUNDS.top) {
            node.y = BOUNDS.top
            node.vy = Math.abs(node.vy ?? 0) * RESTITUTION
          } else if (y > sizeRef.current.height - BOUNDS.bottom) {
            node.y = sizeRef.current.height - BOUNDS.bottom
            node.vy = -Math.abs(node.vy ?? 0) * RESTITUTION
          }
        }
      })
      // A faint magnetic wake: stars near the cursor drift with it, fading out
      // with distance. The star being dragged is left alone.
      .force('pointer', () => {
        const pointer = pointerRef.current
        if (!pointer.active) return

        for (const node of simNodes) {
          if (node.id === dragRef.current?.id) continue

          const dx = (node.x ?? 0) - pointer.x
          const dy = (node.y ?? 0) - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance > POINTER_RADIUS) continue

          const falloff = 1 - distance / POINTER_RADIUS
          node.vx = (node.vx ?? 0) + pointer.dx * falloff * POINTER_STRENGTH
          node.vy = (node.vy ?? 0) + pointer.dy * falloff * POINTER_STRENGTH
        }

        pointer.dx *= POINTER_DECAY
        pointer.dy *= POINTER_DECAY
      })
      // The page chrome holds its corners: the title top left, the language
      // switch top right. Both push stars out sideways or downwards, since
      // upwards would only pin them against the wall.
      .force('chrome', () => {
        const boxes = [
          // The title fades out while a window is open; the switch never does.
          selectedRef.current ? null : { box: titleBoxRef.current, awayFrom: 'left' },
          { box: localeBoxRef.current, awayFrom: 'right' },
        ] as const

        for (const entry of boxes) {
          if (!entry) continue
          const { box, awayFrom } = entry
          if (!box.width || !box.height) continue

          const left = box.x - TITLE_MARGIN
          const right = box.x + box.width + TITLE_MARGIN
          const top = box.y - TITLE_MARGIN
          const bottom = box.y + box.height + TITLE_MARGIN

          for (const node of simNodes) {
            const x = node.x ?? 0
            const y = node.y ?? 0
            if (x < left || x > right || y < top || y > bottom) continue

            const sideways = awayFrom === 'left' ? right - x : x - left
            const toBottom = bottom - y

            if (sideways < toBottom) {
              node.vx =
                (node.vx ?? 0) + (awayFrom === 'left' ? sideways : -sideways) * PANEL_PUSH
            } else {
              node.vy = (node.vy ?? 0) + toBottom * PANEL_PUSH
            }
          }
        }
      })
      // The open window is a rectangle carried by its star. Push any other star
      // inside it out by its shortest route, so the graph opens up around it.
      .force('panel', () => {
        const openId = selectedRef.current
        if (!openId) return

        const kind = NODES.find((node) => node.id === openId)?.kind ?? 'application'
        // The small menu barely intrudes, so it should barely push.
        const margin = kind === 'category' ? CATEGORY_MARGIN : PANEL_MARGIN
        const push = kind === 'category' ? CATEGORY_PUSH : PANEL_PUSH

        const rect = panelRect(sizeRef.current, kind)
        const left = rect.left - margin
        const right = rect.left + rect.width + margin
        const top = rect.top - margin
        const bottom = rect.top + rect.height + margin

        for (const node of simNodes) {
          const x = node.x ?? 0
          const y = node.y ?? 0
          if (x < left || x > right || y < top || y > bottom) continue

          const toLeft = x - left
          const toRight = right - x
          const toTop = y - top
          const toBottom = bottom - y
          const shortest = Math.min(toLeft, toRight, toTop, toBottom)

          if (shortest === toLeft) node.vx = (node.vx ?? 0) - toLeft * push
          else if (shortest === toRight) node.vx = (node.vx ?? 0) + toRight * push
          else if (shortest === toTop) node.vy = (node.vy ?? 0) - toTop * push
          else node.vy = (node.vy ?? 0) + toBottom * push
        }
      })
      .on('tick', () => {
        setNodes([...simNodes])
        setLinks([...simLinks])
      })

    simulationRef.current = simulation

    // The layout cools to a stop, so the wake needs a small nudge to have
    // anything to act on — but only a nudge, or the graph would reshuffle.
    const element = containerRef.current
    const clamp = (value: number) =>
      Math.max(-POINTER_MAX_STEP, Math.min(POINTER_MAX_STEP, value))

    let idleTimer: number | undefined

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      const rect = element?.getBoundingClientRect()
      if (!rect) return

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const pointer = pointerRef.current

      if (pointer.active) {
        pointer.dx += clamp(x - pointer.x)
        pointer.dy += clamp(y - pointer.y)
      }
      pointer.x = x
      pointer.y = y
      pointer.active = true

      // Hold the simulation just above its resting point while the cursor
      // moves, otherwise it settles between events and the wake never runs.
      simulation.alphaTarget(0.02).restart()
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => simulation.alphaTarget(0), POINTER_IDLE_MS)
    }

    const onPointerLeave = () => {
      pointerRef.current.active = false
      window.clearTimeout(idleTimer)
      simulation.alphaTarget(0)
    }

    element?.addEventListener('pointermove', onPointerMove)
    element?.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.clearTimeout(idleTimer)
      element?.removeEventListener('pointermove', onPointerMove)
      element?.removeEventListener('pointerleave', onPointerLeave)
      simulation.stop()
      simulationRef.current = null
    }
  }, [ready])

  // Freeze while the viewport is being resized, then resume once it settles.
  // Running the layout through a resize drag is what produced the flicker.
  useEffect(() => {
    const simulation = simulationRef.current
    if (!simulation || !ready) return

    const centre = simulation.force('centre') as ReturnType<typeof forceCenter> | null
    centre?.x(size.width / 2)?.y(size.height / 2)

    const scale = layoutScale(size.width)
    if (scale !== scaleRef.current) {
      scaleRef.current = scale
      // d3 caches what an accessor returns; setting it again re-reads it.
      const link = simulation.force('link') as ForceLink<SimNode, SimLink> | undefined
      link?.distance(link.distance())
      const charge = simulation.force('charge') as ForceManyBody<SimNode> | undefined
      charge?.strength(charge.strength())
      const collide = simulation.force('collide') as ForceCollide<SimNode> | undefined
      collide?.radius(collide.radius())
    }

    // On a phone the address bar can show or hide mid-drag, which resizes the
    // viewport. Freezing then would stop the star under the finger and jump it
    // when the layout resumed; a drag keeps the layout running anyway.
    if (dragRef.current) return

    simulation.stop()

    const timer = setTimeout(() => simulation.alpha(0.3).restart(), RESIZE_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [size.width, size.height, ready])

  // Opening the window claims the middle of the screen, so re-heat and let the
  // graph re-settle around it.
  useEffect(() => {
    selectedRef.current = selected
    simulationRef.current?.alpha(0.7).restart()
  }, [selected])

  // Escape closes the open window.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Dragging a star. A pointer that barely moves counts as a click instead, so
  // the same gesture can both open a window and reposition a node.
  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      const simulation = simulationRef.current
      const rect = containerRef.current?.getBoundingClientRect()
      if (!drag || !simulation || !rect) return

      drag.moved += Math.hypot(event.clientX - drag.lastX, event.clientY - drag.lastY)
      drag.lastX = event.clientX
      drag.lastY = event.clientY

      const node = simulation.nodes().find((candidate) => candidate.id === drag.id)
      if (!node) return

      // Pin the star to the pointer; the rest of the graph reacts around it.
      node.fx = event.clientX - rect.left
      node.fy = event.clientY - rect.top
      simulation.alphaTarget(0.25).restart()
    }

    /**
     * Ends a drag. A cancelled pointer — the browser claiming the gesture, a
     * call coming in — releases the star but never counts as a click.
     */
    const release = (cancelled: boolean) => {
      const drag = dragRef.current
      const simulation = simulationRef.current
      dragRef.current = null
      setDragging(false)
      if (!drag || !simulation) return

      const node = simulation.nodes().find((candidate) => candidate.id === drag.id)
      if (node) {
        // Release the pin so the layout takes the star back.
        node.fx = null
        node.fy = null
      }

      simulation.alphaTarget(0)

      // Treat a near-stationary press as a click.
      if (!cancelled && drag.moved < 5) {
        setSelected((current) => (current === drag.id ? null : drag.id))
      } else {
        simulation.alpha(0.3).restart()
      }
    }

    const onPointerUp = () => release(false)
    const onPointerCancel = () => release(true)

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [])

  const selectedNode = nodes.find((node) => node.id === selected) ?? null

  /** Every application, in data order — what prev/next cycles through. */
  const applications = useMemo(() => NODES.filter((node) => node.kind === 'application'), [])

  /** For an application, the categories it belongs to — its breadcrumb. */
  const parentCategories = useMemo(() => {
    const node = NODES.find((candidate) => candidate.id === selected)
    if (!node || node.kind !== 'application') return []
    return NODES.filter(
      (candidate) => candidate.kind === 'category' && neighbours.has(candidate.id),
    )
  }, [selected, neighbours])

  /** Step through the applications, wrapping at either end. */
  const cycle = (step: number) => {
    const index = applications.findIndex((node) => node.id === selected)
    if (index < 0) return
    const next = applications[(index + step + applications.length) % applications.length]
    setSelected(next.id)
  }

  /** For a category, the applications hanging off it — listed in its window. */
  const relatedApplications = useMemo(() => {
    const node = NODES.find((candidate) => candidate.id === selected)
    if (!node || node.kind !== 'category') return []
    return NODES.filter(
      (candidate) => candidate.kind === 'application' && neighbours.has(candidate.id),
    )
  }, [selected, neighbours])

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden"
      style={{ backgroundColor: SURFACE.background }}
    >
      {/* Site title, top left. Fades out while a window is open. */}
      <header
        ref={titleRef}
        className={`pointer-events-none absolute z-10 font-pixel transition-opacity duration-300 ${
          selected ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ top: '3%', left: '2.5%' }}
      >
        <h1
          className="tracking-[0.14em] text-[#fff6dc]"
          style={{
            fontSize: 'clamp(18px, 2.1vw, 34px)',
            textShadow: '0 0 12px rgba(255, 219, 130, 0.55)',
          }}
        >
          Henri Lamarre
        </h1>
        <p
          className="mt-2 font-mono tracking-wide text-[#c9b98a]"
          style={{ fontSize: 'clamp(11px, 0.95vw, 17px)' }}
        >
          {t(UI.subtitle)}
        </p>
      </header>

      {/* Language switch, top right, mirroring the title. Stays visible while
          a window is open, since that is where most of the text is. */}
      <div
        ref={localeRef}
        className="font-pixel absolute z-20 flex items-center gap-2 text-sm tracking-[0.1em]"
        style={{ top: '3%', right: '2.5%' }}
      >
        {(['fr', 'en'] as const).map((option, i) => (
          <span key={option} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#7d6f45]">/</span>}
            <button
              type="button"
              onClick={() => setLocale(option)}
              aria-current={locale === option}
              className={
                locale === option
                  ? 'text-[#fff6dc]'
                  : 'text-[#7d6f45] transition hover:text-[#c9b98a]'
              }
              style={
                locale === option
                  ? { textShadow: '0 0 10px rgba(255, 219, 130, 0.5)' }
                  : undefined
              }
            >
              {option.toUpperCase()}
            </button>
          </span>
        ))}
      </div>

      {/* A press that reaches the background — i.e. not a star, not the window
          — closes whatever is open. */}
      <svg
        width={size.width}
        height={size.height}
        className="absolute inset-0 touch-none"
        onPointerDown={() => setSelected(null)}
      >
        <defs>
          {/* One soft bloom per colour, so the stars glow rather than sit flat. */}
          {GLOW_COLOURS.map((colour) => (
            <radialGradient key={colour} id={glowId(colour)}>
              {GLOW_STOPS.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={colour}
                  stopOpacity={stop.opacity}
                />
              ))}
            </radialGradient>
          ))}
        </defs>

        <g>
          {links.map((link, i) => {
            const source = link.source as SimNode
            const target = link.target as SimNode
            if (typeof source !== 'object' || typeof target !== 'object') return null

            const touchesSelected =
              selected !== null &&
              (endpointId(link.source) === selected || endpointId(link.target) === selected)
            const dimmed = selected !== null && !touchesSelected
            const colour = linkColour(endpointId(link.source), endpointId(link.target))

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={colour}
                strokeWidth={touchesSelected ? 1.6 : 0.7}
                strokeOpacity={
                  dimmed
                    ? LINK_OPACITY.dimmed
                    : touchesSelected
                      ? LINK_OPACITY.active
                      : LINK_OPACITY.rest
                }
                className="transition-[stroke-opacity,stroke-width] duration-300"
              />
            )
          })}
        </g>

        <g>
          {nodes.map((node) => {
            const isSelected = node.id === selected
            const isNeighbour = neighbours.has(node.id)
            const dimmed = selected !== null && !isSelected && !isNeighbour
            const r = RADIUS[node.kind]
            const colour = nodeColour(node.id)
            const glow = GLOW[node.kind]

            return (
              <g
                key={node.id}
                transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                onPointerDown={(event) => {
                  event.stopPropagation()
                  dragRef.current = {
                    id: node.id,
                    moved: 0,
                    lastX: event.clientX,
                    lastY: event.clientY,
                  }
                  setDragging(true)
                }}
                className={`transition-opacity duration-300 ${
                  dragging ? 'cursor-grabbing' : 'cursor-pointer'
                }`}
                opacity={dimmed ? 0.25 : 1}
              >
                {/* Generous invisible hit area — a star is small, and the
                    bloom around it reads as part of the target. */}
                <circle r={Math.max(18, r * 3)} fill="transparent" />

                {/* The bloom: one wide faint pass, then a tight bright one. */}
                <circle
                  r={r + glow.outer}
                  fill={`url(#${glowId(colour)})`}
                  opacity={glow.outerOpacity}
                />
                <circle r={r + glow.inner} fill={`url(#${glowId(colour)})`} />

                <circle
                  r={r}
                  fill={colour}
                  stroke={isSelected || isNeighbour ? '#ffffff' : 'transparent'}
                  strokeOpacity={0.5}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {/* Upper right of the star, clear of its tight bloom. */}
                <text
                  x={r + LABEL_GAP[node.kind]}
                  y={-(r + LABEL_GAP[node.kind])}
                  textAnchor="start"
                  fill={colour}
                  fillOpacity={LABEL_OPACITY[node.kind]}
                  className={`font-pixel select-none ${
                    node.kind === 'category' ? 'text-base' : 'text-xs'
                  }`}
                  style={{ letterSpacing: node.kind === 'category' ? '0.08em' : '0.04em' }}
                >
                  {t(node.name)}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {selectedNode && (
        <article
          className="hud-panel absolute flex flex-col text-slate-100 backdrop-blur-md transition-[border-color,box-shadow] duration-300"
          style={{
            ...panelRect(size, selectedNode.kind),
            // The window wears the colour of the star that opened it. Every
            // tone inside is read from these properties.
            ...panelColours(nodeColour(selectedNode.id)),
            position: 'absolute',
            backgroundColor: `color-mix(in srgb, ${SURFACE.panel} 72%, transparent)`,
            border: '1px solid color-mix(in srgb, var(--accent-strong) 85%, transparent)',
            boxShadow: [
              '0 0 10px color-mix(in srgb, var(--accent) 45%, transparent)',
              '0 0 34px color-mix(in srgb, var(--accent) 22%, transparent)',
              'inset 0 0 26px color-mix(in srgb, var(--accent) 7%, transparent)',
            ].join(', '),
          }}
        >
          <CornerMarks />

          {/* Faint inner frame, as in the reference. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[6px] border border-(--accent)/12"
          />

          <header
            className="relative flex shrink-0 items-center justify-between gap-4 select-none"
            style={{ padding: 'clamp(14px, 1.6vw, 28px) clamp(18px, 2.2vw, 40px)' }}
          >
            <div className="min-w-0">
              {/* Categories this entry belongs to, as clickable tags. */}
              {parentCategories.length > 0 && (
                <nav className="font-pixel mb-1 flex flex-wrap items-center gap-2 text-sm tracking-[0.1em]">
                  {parentCategories.map((category, i) => (
                    <span key={category.id} className="flex items-center gap-2">
                      {i > 0 && <span className="text-(--accent-dim)">/</span>}
                      <button
                        type="button"
                        onClick={() => setSelected(category.id)}
                        className="opacity-75 transition hover:opacity-100"
                        style={{ color: nodeColour(category.id) }}
                      >
                        {t(category.name)}
                      </button>
                    </span>
                  ))}
                </nav>
              )}

              <h2
                className="font-pixel tracking-[0.12em] text-(--accent) uppercase"
                style={{ fontSize: 'clamp(18px, 1.9vw, 32px)' }}
              >
                {t(selectedNode.name)}
              </h2>
            </div>
            {/* Square target that scales with the window, so it stays in
                proportion at any viewport size. */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="relative aspect-square shrink-0 border border-(--accent)/30 text-(--accent-muted) transition hover:border-(--accent)/80 hover:bg-(--accent)/10 hover:text-(--accent-strong)"
              style={{ width: 'clamp(38px, 3.4vw, 60px)' }}
              aria-label={t(UI.close)}
            >
              {/* Two diagonals spanning the box, corner to corner. */}
              <svg
                aria-hidden
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1="100"
                  y1="0"
                  x2="0"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </button>
          </header>

          {/* Glowing rule under the header. */}
          <span
            aria-hidden
            className="mx-6 block h-px shrink-0 bg-(--accent-strong)/60"
            style={{ boxShadow: '0 0 6px color-mix(in srgb, var(--accent) 85%, transparent)' }}
          />

          {/* Scrolls independently, so a project can carry as much as it needs. */}
          <div className="hud-scroll relative min-h-0 flex-1 overflow-y-auto px-8 py-6 font-mono">
            {/* Categories are just a way in: their window is the list below. */}
            {selectedNode.kind === 'application' && (
              <>
                {selectedNode.description && (
                  <p className="text-sm leading-relaxed text-slate-300">
                    {t(selectedNode.description)}
                  </p>
                )}

                {selectedNode.body && selectedNode.body.length > 0 && (
                  <div className="mt-5">
                    <BlockList blocks={selectedNode.body} accent={nodeColour(selectedNode.id)} />
                  </div>
                )}
              </>
            )}

            {selectedNode.link && (
              <a
                href={selectedNode.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block border-b border-(--accent)/40 text-sm text-(--accent-strong) hover:border-(--accent)"
              >
                {t(selectedNode.link.label)} ↗
              </a>
            )}

            {relatedApplications.length > 0 && (
              <section>
                <ul className="mt-3 space-y-1">
                  {relatedApplications.map((application) => (
                    <li key={application.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(application.id)}
                        className="group flex w-full items-baseline gap-3 border-b border-(--accent)/15 py-2 text-left transition hover:border-(--accent)/50"
                      >
                        <span className="text-(--accent-muted) transition group-hover:text-(--accent-strong)">
                          →
                        </span>
                        <span style={{ color: nodeColour(application.id) }}>
                          {t(application.name)}
                        </span>
                        {application.description && (
                          <span className="ml-auto truncate pl-6 text-xs text-(--accent-faint)">
                            {t(application.description)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Step through entries without going back to the constellation. */}
          {selectedNode.kind === 'application' && applications.length > 1 && (
            <footer
              className="relative flex shrink-0 items-center justify-between border-t border-(--accent)/15 font-mono text-sm select-none"
              style={{ padding: 'clamp(10px, 1.1vw, 18px) clamp(18px, 2.2vw, 40px)' }}
            >
              <button
                type="button"
                onClick={() => cycle(-1)}
                className="text-(--accent-muted) transition hover:text-(--accent-strong)"
              >
                ‹ {t(UI.previous)}
              </button>
              <button
                type="button"
                onClick={() => cycle(1)}
                className="text-(--accent-muted) transition hover:text-(--accent-strong)"
              >
                {t(UI.next)} ›
              </button>
            </footer>
          )}
        </article>
      )}
    </div>
  )
}
