import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment, EventType, type Event } from '@rive-app/webgl2'

/**
 * Orbit distances, as a fraction of the artboard's shorter side.
 *
 * Under Fit.Layout the artboard is resized to the viewport, so its dimensions
 * are the layout size in CSS pixels — the same units the file positions in.
 */
const DISTANCE_FRACTIONS: Record<string, number> = {
  Distance1: 0.9,
  Distance2: 1,
  Distance3: 1.2,
}

/** MainVM hover properties, ~100 on the selected planet and ~0 on the others. */
const PLANET_BY_PROPERTY = {
  JeuxHover: 'jeux',
  ModelisationHover: 'modelisation',
  EnseignementHover: 'enseignement',
} as const

export type Selection = (typeof PLANET_BY_PROPERTY)[keyof typeof PLANET_BY_PROPERTY] | 'sun'

type NumberProp = { value: number }
type Instance = { number: (name: string) => NumberProp | null }

type RiveSceneProps = {
  onSelect: (selection: Selection) => void
  /** Hidden behind a detail view: stop animating rather than unmounting. */
  paused?: boolean
}

export default function RiveScene({ onSelect, paused = false }: RiveSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const riveRef = useRef<Rive | null>(null)

  // Keep the latest callback without re-creating the Rive instance.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rive = new Rive({
      src: '/rive/mainhub.riv',
      canvas,
      artboard: 'MainVM',
      stateMachines: 'State Machine 1',
      autoplay: true,
      layout: new Layout({ fit: Fit.Layout, alignment: Alignment.Center }),
      onLoad: () => {
        const viewModel = rive.defaultViewModel() ?? rive.viewModelByName('MainVM')
        const instance =
          viewModel?.instanceByName('Instance') ?? viewModel?.defaultInstance()
        if (instance) rive.bindViewModelInstance(instance)

        sync()
      },
    })
    riveRef.current = rive

    /** Resize the surface, then push the derived distances into the view model. */
    const sync = () => {
      rive.resizeDrawingSurfaceToCanvas()

      const instance = rive.viewModelInstance as unknown as Instance | null
      if (!instance) return

      // Artboard units, i.e. CSS pixels under Fit.Layout.
      const basis = Math.min(rive.artboardWidth, rive.artboardHeight)
      if (!basis) return

      for (const [name, fraction] of Object.entries(DISTANCE_FRACTIONS)) {
        const prop = instance.number(name)
        if (prop) prop.value = basis * fraction
      }
    }

    /** Whichever hover property is high identifies the clicked planet. */
    const selectedPlanet = (): Selection | null => {
      const instance = rive.viewModelInstance as unknown as Instance | null
      if (!instance) return null

      let best: Selection | null = null
      let bestValue = 50 // must be closer to 100 than to 0

      for (const [property, planet] of Object.entries(PLANET_BY_PROPERTY)) {
        const value = instance.number(property)?.value ?? 0
        if (value > bestValue) {
          bestValue = value
          best = planet
        }
      }
      return best
    }

    const onRiveEvent = (event: Event) => {
      const name = (event.data as { name?: string } | undefined)?.name
      if (name === 'SunClick') {
        onSelectRef.current('sun')
        return
      }
      if (name === 'PlanetClick') {
        const planet = selectedPlanet()
        if (planet) onSelectRef.current(planet)
      }
    }

    rive.on(EventType.RiveEvent, onRiveEvent)
    window.addEventListener('resize', sync)

    return () => {
      window.removeEventListener('resize', sync)
      rive.off(EventType.RiveEvent, onRiveEvent)
      rive.cleanup()
      riveRef.current = null
    }
  }, [])

  // Pausing keeps the instance alive, so returning to the hub is instant.
  useEffect(() => {
    const rive = riveRef.current
    if (!rive) return
    if (paused) rive.pause()
    else rive.play()
  }, [paused])

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
}
