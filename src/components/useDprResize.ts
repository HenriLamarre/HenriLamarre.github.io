import { useEffect, type RefObject } from 'react'
import { type Rive } from '@rive-app/webgl2'

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
  rive: Rive | null,
  canvasRef?: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    if (!rive) return

    let mql: MediaQueryList | null = null

    // Under Fit.Layout this also resizes the artboard itself to the surface —
    // do not set artboardWidth/Height alongside it, or the artboard is sized
    // twice and its centre drifts off the viewport centre.
    const sync = () => rive.resizeDrawingSurfaceToCanvas()

    const onChange = () => {
      sync()
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
    const observer = canvas ? new ResizeObserver(sync) : null
    if (canvas && observer) observer.observe(canvas)

    sync() // initial sync

    return () => {
      window.removeEventListener('resize', onChange)
      mql?.removeEventListener('change', onChange)
      observer?.disconnect()
    }
  }, [rive, canvasRef])
}
