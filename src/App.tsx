import { lazy, Suspense, useState } from 'react'
import RiveScene, { type Selection } from './components/RiveScene'
import Starfield from './components/Starfield'

// Three.js is only needed once a planet is clicked, so keep it out of the
// initial bundle.
const DetailView = lazy(() => import('./components/DetailView'))

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null)

  return (
    <div className="relative min-h-dvh bg-void text-star">
      {/* Layering is DOM order: stars behind, Rive on top. A negative z-index
          here would fall behind this wrapper's own background. */}
      <Starfield className="pointer-events-none fixed inset-0 h-full w-full" />
      <RiveScene onSelect={setSelection} paused={selection !== null} />

      {selection && (
        <Suspense fallback={null}>
          <DetailView selection={selection} onBack={() => setSelection(null)} />
        </Suspense>
      )}
    </div>
  )
}
