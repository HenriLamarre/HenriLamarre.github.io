import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { useDprResize } from './useDprResize'

type RiveSceneProps = {
  /** Path under /public, e.g. "/rive/mainhub.riv" */
  src: string
  artboard?: string
  stateMachines?: string | string[]
  fit?: Fit
  className?: string
}

/**
 * Thin wrapper around a Rive artboard.
 * Drop .riv files in public/rive/ and reference them by path.
 *
 * `autoBind` binds the artboard's default view model instance so the file's
 * own data bindings (colours, hover parallax, text) drive themselves.
 */
export default function RiveScene({
  src,
  artboard,
  stateMachines,
  fit = Fit.Contain,
  className,
}: RiveSceneProps) {
  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit, alignment: Alignment.Center }),
  })

  useDprResize(rive)

  return <RiveComponent className={className} />
}
