import { useEffect, type RefObject } from 'react'

type Resizable = { resizeDrawingSurfaceToCanvas: () => void }

/**
 * Keeps a Rive drawing surface matched to its canvas.
 *
 * Rive sizes its surface from the canvas' CSS box times the device pixel
 * ratio, so the surface has to be re-synced whenever either changes. A window
 * `resize` covers viewport changes; a `matchMedia` resolution query catches a
 * pure DPR change (same logical size, different density — e.g. dragging the
 * window to a monitor with different scaling); and a ResizeObserver on the
 * canvas itself catches layout changes that never touch the window, including
 * the first paint where the element may still have been zero-sized.
 */
export function useDprResize(
  rive: Resizable | null,
  canvasRef?: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    if (!rive) return

    let mql: MediaQueryList | null = null

    const onChange = () => {
      rive.resizeDrawingSurfaceToCanvas()
      subscribe() // DPR may have changed — re-bind to the new resolution query
    }

    const subscribe = () => {
      mql?.removeEventListener('change', onChange)
      mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      mql.addEventListener('change', onChange)
    }

    window.addEventListener('resize', onChange)
    subscribe()

    const canvas = canvasRef?.current
    const observer = canvas
      ? new ResizeObserver(() => rive.resizeDrawingSurfaceToCanvas())
      : null
    if (canvas && observer) observer.observe(canvas)

    rive.resizeDrawingSurfaceToCanvas() // initial sync

    return () => {
      window.removeEventListener('resize', onChange)
      mql?.removeEventListener('change', onChange)
      observer?.disconnect()
    }
  }, [rive, canvasRef])
}
