import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { LINKS, NODES, type GraphNode } from '../graph/data'

/** Star size by kind: categories are the bright ones. */
const RADIUS = { category: 7, application: 3.5 } as const
/** Space each node claims in the layout, so labels do not collide. */
const CLEARANCE = { category: 62, application: 40 } as const

/**
 * Keep-out distance from each edge. The right and top get more room because
 * labels sit above and to the right of their star.
 */
const BOUNDS = { left: 28, right: 110, top: 34, bottom: 28 }
/** Velocity kept when a star hits a wall. Below 1, so walls absorb energy. */
const RESTITUTION = 0.35

/** The open window, as a fraction of the viewport. */
const PANEL_WIDTH_RATIO = 0.75
const PANEL_HEIGHT_RATIO = 0.7
/** Clearance kept between the window's edge and any star. */
const PANEL_MARGIN = 48
/** How hard stars are pushed out of the window's footprint. Gentle, so they
 *  ease out instead of overshooting and bouncing back in. */
const PANEL_PUSH = 0.045

type SimNode = SimulationNodeDatum & GraphNode
type SimLink = SimulationLinkDatum<SimNode>

/** Link endpoints are ids before the simulation resolves them to objects. */
function endpointId(endpoint: SimLink['source']): string {
  return typeof endpoint === 'object' ? (endpoint as SimNode).id : String(endpoint)
}

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
          className="pointer-events-none absolute h-[10px] w-[10px] bg-white"
          style={{ ...position, boxShadow: '0 0 8px rgba(180, 220, 255, 0.9)' }}
        />
      ))}
    </>
  )
}

export default function Graph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const selectedRef = useRef<string | null>(null)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [nodes, setNodes] = useState<SimNode[]>([])
  const [links, setLinks] = useState<SimLink[]>([])
  const [selected, setSelected] = useState<string | null>(null)

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
      setSize({ width: rect.width, height: rect.height })
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

  useEffect(() => {
    if (!size.width || !size.height) return

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
            return bothCategories ? 260 : 110
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
          .strength((node) => (node.kind === 'category' ? -900 : -320))
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
      .force('centre', forceCenter(size.width / 2, size.height / 2).strength(0.05))
      .force(
        'collide',
        forceCollide<SimNode>()
          .radius((node) => CLEARANCE[node.kind])
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
          } else if (x > size.width - BOUNDS.right) {
            node.x = size.width - BOUNDS.right
            node.vx = -Math.abs(node.vx ?? 0) * RESTITUTION
          }

          if (y < BOUNDS.top) {
            node.y = BOUNDS.top
            node.vy = Math.abs(node.vy ?? 0) * RESTITUTION
          } else if (y > size.height - BOUNDS.bottom) {
            node.y = size.height - BOUNDS.bottom
            node.vy = -Math.abs(node.vy ?? 0) * RESTITUTION
          }
        }
      })
      // The open window is a rectangle in the middle of the viewport. Push any
      // star inside it out by its shortest route, so the graph reorganises
      // around the window rather than behind it.
      .force('panel', () => {
        if (!selectedRef.current) return

        const panelWidth = size.width * PANEL_WIDTH_RATIO
        const panelHeight = size.height * PANEL_HEIGHT_RATIO
        const left = (size.width - panelWidth) / 2 - PANEL_MARGIN
        const right = (size.width + panelWidth) / 2 + PANEL_MARGIN
        const top = (size.height - panelHeight) / 2 - PANEL_MARGIN
        const bottom = (size.height + panelHeight) / 2 + PANEL_MARGIN

        for (const node of simNodes) {
          const x = node.x ?? 0
          const y = node.y ?? 0
          if (x < left || x > right || y < top || y > bottom) continue

          const toLeft = x - left
          const toRight = right - x
          const toTop = y - top
          const toBottom = bottom - y
          const shortest = Math.min(toLeft, toRight, toTop, toBottom)

          if (shortest === toLeft) node.vx = (node.vx ?? 0) - toLeft * PANEL_PUSH
          else if (shortest === toRight) node.vx = (node.vx ?? 0) + toRight * PANEL_PUSH
          else if (shortest === toTop) node.vy = (node.vy ?? 0) - toTop * PANEL_PUSH
          else node.vy = (node.vy ?? 0) + toBottom * PANEL_PUSH
        }
      })
      .on('tick', () => {
        setNodes([...simNodes])
        setLinks([...simLinks])
      })

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
  }, [size.width, size.height])

  // Opening the window claims the middle of the screen, so re-heat and let the
  // graph re-settle around it.
  useEffect(() => {
    selectedRef.current = selected
    simulationRef.current?.alpha(0.7).restart()
  }, [selected])

  const selectedNode = nodes.find((node) => node.id === selected) ?? null

  return (
    <div ref={containerRef} className="relative h-dvh w-full overflow-hidden bg-black">
      <svg width={size.width} height={size.height} className="absolute inset-0">
        <defs>
          {/* Soft halo, so the stars glow rather than sit flat. */}
          <radialGradient id="halo">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#cfe0ff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#cfe0ff" stopOpacity="0" />
          </radialGradient>
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

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={touchesSelected ? '#dceaff' : '#8fa8d0'}
                strokeWidth={touchesSelected ? 1.6 : 0.7}
                strokeOpacity={dimmed ? 0.08 : touchesSelected ? 0.85 : 0.28}
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

            return (
              <g
                key={node.id}
                transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                onClick={() => setSelected((current) => (current === node.id ? null : node.id))}
                className="cursor-pointer transition-opacity duration-300"
                opacity={dimmed ? 0.25 : 1}
              >
                {/* Generous invisible hit area — the stars themselves are tiny. */}
                <circle r={Math.max(18, r * 3)} fill="transparent" />
                <circle r={r * 5} fill="url(#halo)" />
                <circle
                  r={r}
                  fill="#ffffff"
                  stroke={isSelected || isNeighbour ? '#ffffff' : 'transparent'}
                  strokeOpacity={0.5}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {/* Upper right of the star, 5px clear of its edge. */}
                <text
                  x={r + 5}
                  y={-(r + 5)}
                  textAnchor="start"
                  fill={node.kind === 'category' ? '#eaf1ff' : '#9fb3d4'}
                  className={`font-pixel select-none ${
                    node.kind === 'category' ? 'text-base' : 'text-xs'
                  }`}
                  style={{ letterSpacing: node.kind === 'category' ? '0.08em' : '0.04em' }}
                >
                  {node.name}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {selectedNode && (
        <article
          className="absolute flex flex-col bg-[#01060d]/85 text-slate-100 backdrop-blur-md"
          style={{
            width: `${PANEL_WIDTH_RATIO * 100}%`,
            height: `${PANEL_HEIGHT_RATIO * 100}%`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(214, 238, 255, 0.85)',
            boxShadow:
              '0 0 10px rgba(150, 205, 255, 0.45), 0 0 34px rgba(90, 165, 255, 0.25), inset 0 0 26px rgba(120, 190, 255, 0.07)',
          }}
        >
          <CornerMarks />

          {/* Faint inner frame, as in the reference. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[6px] border border-white/12"
          />

          <header className="relative flex shrink-0 items-start justify-between gap-4 px-8 py-5">
            <h2 className="font-pixel text-2xl tracking-[0.12em] uppercase">
              {selectedNode.name}
            </h2>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="font-pixel text-xl leading-none text-slate-300 transition hover:text-white"
              aria-label="Fermer"
            >
              ×
            </button>
          </header>

          {/* Glowing rule under the header. */}
          <span
            aria-hidden
            className="mx-6 block h-px shrink-0 bg-white/60"
            style={{ boxShadow: '0 0 6px rgba(170, 215, 255, 0.8)' }}
          />

          {/* Scrolls independently, so a project can carry as much as it needs. */}
          <div className="hud-scroll relative min-h-0 flex-1 overflow-y-auto px-8 py-6">
            {selectedNode.description && (
              <p className="text-base leading-relaxed text-slate-300">
                {selectedNode.description}
              </p>
            )}

            {selectedNode.body?.map((paragraph, i) => (
              <p key={i} className="mt-4 text-sm leading-relaxed text-slate-400">
                {paragraph}
              </p>
            ))}

            {selectedNode.link && (
              <a
                href={selectedNode.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block border-b border-white/40 text-sm hover:border-white"
              >
                {selectedNode.link.label} ↗
              </a>
            )}
          </div>
        </article>
      )}
    </div>
  )
}
