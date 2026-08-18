import { useEffect, useRef } from 'react'
import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2'

/**
 * The MainVM scene, filling the viewport.
 *
 * Binds the view model's named "Instance" rather than using `autoBind`.
 * autoBind picks the artboard's *default* instance, which is not necessarily
 * the instance the editor (and other runtimes) use — a different instance
 * means different values feeding the file's data-bound placement.
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
      layout: new Layout({ fit: Fit.Layout, alignment: Alignment.Center }),
      onLoad: () => {
        const viewModel = rive.defaultViewModel() ?? rive.viewModelByName('MainVM')
        const instance =
          viewModel?.instanceByName('Instance') ?? viewModel?.defaultInstance()
        if (instance) rive.bindViewModelInstance(instance)

        rive.resizeDrawingSurfaceToCanvas()
      },
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
