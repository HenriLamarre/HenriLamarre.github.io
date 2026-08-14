import { useEffect } from 'react'

/**
 * Keeps a Rive drawing surface sharp when the device pixel ratio changes —
 * e.g. dragging the window between monitors with different DPR/scaling.
 *
 * Rive resizes its surface on window `resize` events, but a pure DPR change
 * (same logical size, different pixel density) doesn't always fire one. We
 * also watch a `matchMedia` resolution query and re-sync on change.
 */
export function useDprResize(rive: { resizeDrawingSurfaceToCanvas: () => void } | null) {
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
    rive.resizeDrawingSurfaceToCanvas() // initial sync

    return () => {
      window.removeEventListener('resize', onChange)
      mql?.removeEventListener('change', onChange)
    }
  }, [rive])
}
