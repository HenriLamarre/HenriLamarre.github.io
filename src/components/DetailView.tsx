import { Component, Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import type { Selection } from './RiveScene'

/** Drop a .glb here to replace the placeholder geometry. */
const MODEL_URL = '/models/modelisation.glb'

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

function Model() {
  const { scene } = useGLTF(MODEL_URL)
  return <primitive object={scene} />
}

function Placeholder() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <icosahedronGeometry args={[1.3, 0]} />
      <meshStandardMaterial color="#d8d8e0" flatShading />
    </mesh>
  )
}

/** Falls back to placeholder geometry when no .glb has been supplied yet. */
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <Placeholder /> : this.props.children
  }
}

type DetailViewProps = {
  selection: Selection
  background: string
  onBack: () => void
}

export default function DetailView({ selection, background, onBack }: DetailViewProps) {
  const ink = readableInk(background)

  return (
    <div
      className="fixed inset-0 z-20 animate-[fade-in_250ms_ease-out]"
      style={{ background }}
    >
      {selection === 'modelisation' && (
        <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }} dpr={[1, 2]}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 4]} intensity={1.4} />
          <Suspense fallback={null}>
            <ModelBoundary>
              <Model />
            </ModelBoundary>
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} enableDamping />
        </Canvas>
      )}

      <h2
        className="pointer-events-none absolute top-10 left-10 font-display text-4xl tracking-tight"
        style={{ color: ink }}
      >
        {LABELS[selection]}
      </h2>

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
