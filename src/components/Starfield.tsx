import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  r: number
  /** Baseline opacity the twinkle oscillates around. */
  base: number
  /** Twinkle depth and speed. */
  amp: number
  speed: number
  phase: number
}

/** Stars per million device-independent pixels. */
const DENSITY = 90

function makeStars(width: number, height: number): Star[] {
  const count = Math.round((width * height * DENSITY) / 1_000_000)

  return Array.from({ length: count }, () => {
    const base = 0.25 + Math.random() * 0.5
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      // A few stars are noticeably larger than the rest.
      r: Math.random() < 0.15 ? 1.1 + Math.random() * 0.7 : 0.4 + Math.random() * 0.5,
      base,
      amp: Math.min(base, 0.35) * (0.4 + Math.random() * 0.6),
      speed: 0.4 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    }
  })
}

export default function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars: Star[] = []
    let width = 0
    let height = 0
    let frame = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      // Reset rather than accumulate the transform across resizes.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars = makeStars(width, height)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = (time: number) => {
      const t = time / 1000

      // Recover if the first sizing pass happened before layout (e.g. the tab
      // was never rendered), which leaves a zero-sized backing store.
      if (width === 0 || height === 0) resize()

      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        const alpha = reduceMotion
          ? star.base
          : star.base + star.amp * Math.sin(t * star.speed + star.phase)

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }

      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
