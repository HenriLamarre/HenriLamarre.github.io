import { useEffect, type RefObject } from 'react'
import { Fit, type Rive } from '@rive-app/webgl2'

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
 *
 * Under Fit.Layout the artboard is resized to the surface rather than scaled
 * to fit it, so its dimensions have to be pushed back in after every resync —
 * in artboard units, i.e. surface pixels divided by the pixel ratio actually
 * used and the layout scale factor.
 */
export function useDprResize(
  rive: Rive | null,
  canvasRef?: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    if (!rive) return

    let mql: MediaQueryList | null = null

    const sync = () => {
      rive.resizeDrawingSurfaceToCanvas()

      const canvas = canvasRef?.current
      if (canvas && rive.layout.fit === Fit.Layout) {
        const scale = rive.devicePixelRatioUsed * rive.layout.layoutScaleFactor
        if (scale > 0) {
          rive.artboardWidth = canvas.width / scale
          rive.artboardHeight = canvas.height / scale
        }
      }
    }

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
