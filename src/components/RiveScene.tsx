import { useRive } from '@rive-app/react-canvas'

type RiveSceneProps = {
  /** Path under /public, e.g. "/rive/hero.riv" */
  src: string
  artboard?: string
  stateMachines?: string | string[]
  className?: string
}

/**
 * Thin wrapper around a Rive artboard.
 * Drop .riv files in public/rive/ and reference them by path.
 */
export default function RiveScene({
  src,
  artboard,
  stateMachines,
  className,
}: RiveSceneProps) {
  const { RiveComponent } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay: true,
  })

  return <RiveComponent className={className} />
}
