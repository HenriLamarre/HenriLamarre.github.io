import { Component, Suspense, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import Carousel from './Carousel'
import { CONTENT } from '../content'
import type { Selection } from './RiveScene'

const LABELS: Record<Selection, string> = {
  jeux: 'Jeux',
  modelisation: 'Modélisation',
  enseignement: 'Enseignement',
  sun: 'Recherche',
}

/** Black or white text, whichever reads better on the given background. */
function readableInk(background: string): string {
  const match = background.match(/\d+(\.\d+)?/g)
  if (!match || match.length < 3) return '#ffffff'
  const [r, g, b] = match.slice(0, 3).map(Number)
  // Relative luminance, sRGB coefficients.
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.55 ? '#101010' : '#f4f4f6'
}

/** Keeps a broken or missing asset from taking down the whole view. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[carousel] failed to render:', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

type DetailViewProps = {
  selection: Selection
  background: string
  onBack: () => void
}

export default function DetailView({ selection, background, onBack }: DetailViewProps) {
  const ink = readableInk(background)
  const [index, setIndex] = useState(0)

  const items = CONTENT[selection]
  const current = items[index]
  const hasItems = items.length > 0

  const step = (direction: number) =>
    setIndex((value) => (value + direction + items.length) % items.length)

  return (
    <div
      className="fixed inset-0 z-20 animate-[fade-in_250ms_ease-out]"
      style={{ background }}
    >
      {hasItems && (
        <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }} dpr={[1, 2]}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 4, 5]} intensity={1.5} />
          <directionalLight position={[-4, -2, -3]} intensity={0.4} />
          <Suspense fallback={null}>
            <SceneBoundary>
              <Carousel
                items={items}
                index={index}
                onIndexChange={setIndex}
                plainBack={ink}
                accent={background}
              />
            </SceneBoundary>
          </Suspense>
        </Canvas>
      )}

      <h2
        className="pointer-events-none absolute top-10 left-10 font-display text-4xl tracking-tight"
        style={{ color: ink }}
      >
        {LABELS[selection]}
      </h2>

      {hasItems && current && (
        <div className="pointer-events-none absolute inset-x-0 bottom-12 flex flex-col items-center gap-3 px-8">
          <p className="font-display text-2xl" style={{ color: ink }}>
            {current.label}
          </p>

          {current.description && (
            <p
              className="max-w-md text-center text-sm leading-relaxed opacity-80"
              style={{ color: ink }}
            >
              {current.description}
            </p>
          )}

          {current.link && (
            <a
              href={current.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto border-b text-sm opacity-80 transition hover:opacity-100"
              style={{ color: ink, borderColor: ink + '77' }}
            >
              {current.link.label} ↗
            </a>
          )}

          {items.length > 1 && (
            <div className="pointer-events-auto mt-1 flex items-center gap-6">
              <button
                type="button"
                aria-label="Précédent"
                onClick={() => step(-1)}
                className="font-display text-3xl leading-none opacity-70 transition hover:opacity-100"
                style={{ color: ink }}
              >
                ‹
              </button>

              <div className="flex gap-2">
                {items.map((item, i) => (
                  <button
                    key={item.kind === 'model' ? item.url : item.front}
                    type="button"
                    aria-label={item.label}
                    onClick={() => setIndex(i)}
                    className="h-2 w-2 rounded-full transition"
                    style={{ background: ink, opacity: i === index ? 1 : 0.35 }}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Suivant"
                onClick={() => step(1)}
                className="font-display text-3xl leading-none opacity-70 transition hover:opacity-100"
                style={{ color: ink }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-10 left-10 rounded-full border px-6 py-2 font-display text-lg transition hover:bg-white/10"
        style={{ color: ink, borderColor: ink + '55' }}
      >
        ← Retour
      </button>
    </div>
  )
}
