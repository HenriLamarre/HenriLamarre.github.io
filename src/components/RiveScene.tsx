import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2'

/**
 * The MainVM scene, filling the viewport.
 *
 * Deliberately minimal: create the instance, size the drawing surface on load
 * and on resize, clean up on unmount. Nothing else.
 */
export default function RiveScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rive = new Rive({
      src: '/rive/mainhub.riv',
      canvas,
      artboard: 'MainVM',
      stateMachines: 'State Machine 1',
      autoplay: true,
      autoBind: true,
      layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
      onLoad: () => rive.resizeDrawingSurfaceToCanvas(),
    })

    const onResize = () => rive.resizeDrawingSurfaceToCanvas()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      rive.cleanup()
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
}
