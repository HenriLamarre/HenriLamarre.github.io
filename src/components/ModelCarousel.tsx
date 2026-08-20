import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Group, Vector3, type Object3D } from 'three'
import type { ModelEntry } from '../models'

/** How far the ring sits from its centre, in world units. */
const RADIUS = 3.2
/**
 * Tilt of the ring's plane, in radians. Without it every model sits on the
 * same horizontal line; tilting lifts the ones behind so they read as a ring
 * rather than a row.
 */
const TILT = 0.22
const FRONT_SCALE = 1.35
const BACK_SCALE = 0.6
/** Horizontal pixels of drag needed to advance one model. */
const SWIPE_THRESHOLD = 60

/**
 * Normalises a loaded model: centred on the origin and scaled so its longest
 * side is 2 units, so any .glb fills the frame regardless of export scale.
 */
function useNormalisedModel(url: string): Object3D {
  const { scene } = useGLTF(url)

  return useMemo(() => {
    const clone = scene.clone(true)
    const box = new Box3().setFromObject(clone)
    const size = box.getSize(new Vector3())
    const centre = box.getCenter(new Vector3())

    clone.position.sub(centre)

    const wrapper = new Group()
    wrapper.add(clone)
    const longest = Math.max(size.x, size.y, size.z) || 1
    wrapper.scale.setScalar(2 / longest)
    return wrapper
  }, [scene])
}

type ItemProps = {
  entry: ModelEntry
  angle: number
  isFront: boolean
  spinRef: React.RefObject<number>
  onGrab: () => void
}

function CarouselItem({ entry, angle, isFront, spinRef, onGrab }: ItemProps) {
  const object = useNormalisedModel(entry.url)
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    // Ease scale so the front model grows as it arrives.
    const target = isFront ? FRONT_SCALE : BACK_SCALE
    group.scale.lerp(new Vector3(target, target, target), 1 - Math.exp(-8 * delta))

    // Only the front model responds to drag-to-rotate.
    group.rotation.y = isFront ? spinRef.current : 0
  })

  return (
    <group position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]}>
      <group ref={groupRef} onPointerDown={isFront ? onGrab : undefined}>
        <primitive object={object} />
      </group>
    </group>
  )
}

type ModelCarouselProps = {
  models: ModelEntry[]
  index: number
  onIndexChange: (index: number) => void
}

export default function ModelCarousel({ models, index, onIndexChange }: ModelCarouselProps) {
  const ringRef = useRef<Group>(null)
  const spinRef = useRef(0)
  const grabbedModel = useRef(false)
  const drag = useRef({ active: false, startX: 0, lastX: 0 })
  const { gl } = useThree()

  const step = (Math.PI * 2) / Math.max(models.length, 1)

  // Reset the front model's own rotation when a different one comes forward.
  useEffect(() => {
    spinRef.current = 0
  }, [index])

  useEffect(() => {
    const element = gl.domElement

    const onPointerDown = (event: PointerEvent) => {
      drag.current = { active: true, startX: event.clientX, lastX: event.clientX }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.current.active) return
      const dx = event.clientX - drag.current.lastX
      drag.current.lastX = event.clientX
      // Dragging the model spins it; dragging anywhere else is a swipe.
      if (grabbedModel.current) spinRef.current += dx * 0.01
    }

    const onPointerUp = (event: PointerEvent) => {
      const wasOnModel = grabbedModel.current
      grabbedModel.current = false
      if (!drag.current.active) return
      drag.current.active = false

      if (wasOnModel || models.length < 2) return

      const travelled = event.clientX - drag.current.startX
      if (Math.abs(travelled) < SWIPE_THRESHOLD) return
      const direction = travelled < 0 ? 1 : -1
      onIndexChange((index + direction + models.length) % models.length)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (models.length < 2) return
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % models.length)
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + models.length) % models.length)
    }

    element.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [gl, index, models.length, onIndexChange])

  // Spin the ring so the selected model faces the camera, taking the short way.
  useFrame((_, delta) => {
    const ring = ringRef.current
    if (!ring) return

    const target = -index * step
    let difference = target - ring.rotation.y
    difference = ((difference + Math.PI) % (Math.PI * 2)) - Math.PI
    ring.rotation.y += difference * (1 - Math.exp(-6 * delta))
  })

  return (
    // Outer group holds the tilt; the inner one spins, so the tilt stays put
    // instead of wobbling as the ring turns.
    <group rotation={[TILT, 0, 0]} position={[0, -0.35, -RADIUS]}>
      <group ref={ringRef}>
        {models.map((entry, i) => (
          <CarouselItem
            key={entry.url}
            entry={entry}
            angle={i * step}
            isFront={i === index}
            spinRef={spinRef}
            onGrab={() => {
              grabbedModel.current = true
            }}
          />
        ))}
      </group>
    </group>
  )
}
