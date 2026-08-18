import { useEffect, useRef, useState } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2'
import { useDprResize } from './useDprResize'

type RiveSceneProps = {
  /** Path under /public, e.g. "/rive/mainhub.riv" */
  src: string
  artboard?: string
  stateMachines?: string
  /** Cover by default: scale the artboard to fill the viewport, cropping. */
  fit?: Fit
  className?: string
}

/**
 * A Rive artboard on its own canvas.
 *
 * Uses the Rive Renderer (webgl2) rather than the Canvas2D runtime, which
 * silently drops feathered strokes/fills and blend modes. Driven directly
 * instead of through @rive-app/react-webgl2: that wrapper ships CJS-only and
 * `require`s React, which Vite resolves to a second React instance.
 *
 * `autoBind` binds the artboard's default view model instance so the file's
 * own data bindings (colours, hover parallax, text) drive themselves.
 */
export default function RiveScene({
  src,
  artboard,
  stateMachines,
  fit = Fit.Cover,
  className,
}: RiveSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rive, setRive] = useState<Rive | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Size the backing store before constructing Rive. Otherwise the renderer
    // initialises its surface against the canvas' default 300x150 and the
    // artboard is laid out against those dimensions.
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)

    const instance = new Rive({
      src,
      canvas,
      artboard,
      stateMachines,
      autoplay: true,
      autoBind: true,
      layout: new Layout({ fit, alignment: Alignment.Center }),
      onLoad: () => {
        instance.resizeDrawingSurfaceToCanvas()
        setRive(instance)
      },
    })

    return () => {
      setRive(null)
      instance.cleanup()
    }
  }, [src, artboard, stateMachines, fit])

  useDprResize(rive, canvasRef)

  return <canvas ref={canvasRef} className={className} />
}
