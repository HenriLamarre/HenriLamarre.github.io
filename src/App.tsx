import Starfield from './components/Starfield'

export default function App() {
  return (
    <div className="relative min-h-dvh bg-void text-star">
      <Starfield className="fixed inset-0 h-full w-full" />
      <main className="relative mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">Henri Lamarre</h1>
        {/* Sections go here, one brick at a time. */}
      </main>
    </div>
  )
}
