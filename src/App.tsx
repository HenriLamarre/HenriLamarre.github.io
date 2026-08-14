import RiveScene from './components/RiveScene'
import Starfield from './components/Starfield'

export default function App() {
  return (
    <div className="relative min-h-dvh bg-void text-star">
      {/* Layering is DOM order: stars behind, Rive on top. A negative z-index
          here would fall behind this wrapper's own background. */}
      <Starfield className="pointer-events-none fixed inset-0 h-full w-full" />
      {/* Fills the viewport; Fit.Contain centres the artboard within it. */}
      <RiveScene
        src="/rive/mainhub.riv"
        artboard="MainVM"
        stateMachines="State Machine 1"
        className="fixed inset-0 h-full w-full"
      />
    </div>
  )
}
