import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Selection } from './RiveScene'

const VIEWS: Record<Selection, { label: string; background: string; color: string }> = {
  jeux: { label: 'Jeux', background: '#141026', color: '#8b7bd8' },
  modelisation: { label: 'Modélisation', background: '#0d1a1e', color: '#4fb3a5' },
  enseignement: { label: 'Enseignement', background: '#1e1508', color: '#ffd841' },
  sun: { label: 'Recherche', background: '#20120a', color: '#ff9a3c' },
}

/** Placeholder geometry — swap for a useGLTF model once there is a .glb. */
function Placeholder({ color }: { color: string }) {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <icosahedronGeometry args={[1.3, 0]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  )
}

type DetailViewProps = {
  selection: Selection
  onBack: () => void
}

export default function DetailView({ selection, onBack }: DetailViewProps) {
  const view = VIEWS[selection]

  return (
    <div
      className="fixed inset-0 z-20 animate-[fade-in_250ms_ease-out]"
      style={{ background: view.background }}
    >
      <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 4]} intensity={1.4} />
        <Suspense fallback={null}>
          <Placeholder color={view.color} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} enableDamping />
      </Canvas>

      <h2
        className="pointer-events-none absolute top-10 left-10 font-display text-4xl tracking-tight"
        style={{ color: view.color }}
      >
        {view.label}
      </h2>

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-10 left-10 rounded-full border border-white/25 px-6 py-2 font-display text-lg text-star transition hover:border-white/60 hover:bg-white/10"
      >
        ← Retour
      </button>
    </div>
  )
}
