import RiveScene from './components/RiveScene'
import Starfield from './components/Starfield'

export default function App() {
  return (
    <div className="relative min-h-dvh bg-void text-star">
      <Starfield className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      {/* Fills the viewport; Fit.Contain centres the artboard within it. */}
      <RiveScene
        src="/rive/mainhub.riv"
        artboard="SunArtboard"
        stateMachines="SunStateMachine"
        className="fixed inset-0 h-full w-full"
      />
      <main className="pointer-events-none relative z-10 mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">Henri Lamarre</h1>
        {/* Sections go here, one brick at a time. */}
      </main>
    </div>
  )
}
