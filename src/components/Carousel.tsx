import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import {
  Box3,
  Group,
  SRGBColorSpace,
  Vector3,
  MeshStandardMaterial,
  type Object3D,
  type Texture,
} from 'three'
import type { CarouselItem } from '../content/types'

/** How far the ring sits from its centre, in world units. */
const RADIUS = 3.2
/**
 * Tilt of the ring's plane, in radians. Without it every item sits on the
 * same horizontal line; tilting lifts the ones behind so they read as a ring
 * rather than a row.
 */
const TILT = 0.22
/** Vertical offset of the ring, raised to clear the text along the bottom. */
const LIFT = 0.55
const FRONT_SCALE = 1.35
const BACK_SCALE = 0.6
/** Horizontal pixels of drag needed to advance one item. */
const SWIPE_THRESHOLD = 60

/**
 * Longest side of a card, in world units — the same envelope models are
 * normalised to, so cards and models sit at a consistent size in the ring.
 * The other side follows the image's own aspect ratio.
 */
const CARD_SIZE = 2
const CARD_DEPTH = 0.04
/** Used only if an image's dimensions can't be read. */
const FALLBACK_ASPECT = 2.5 / 3.5

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

/**
 * A two-sided card. BoxGeometry groups run +X, -X, +Y, -Y, +Z, -Z, so the
 * front image goes on material 4 and the back on material 5.
 */
function Card({ front, back, plainBack }: { front: string; back?: string; plainBack: string }) {
  const urls = back ? [front, back] : [front]
  const loaded = useTexture(urls)
  const textures = (Array.isArray(loaded) ? loaded : [loaded]) as Texture[]

  // Take the card's proportions from the front image itself.
  const { width, height } = useMemo(() => {
    const image = textures[0]?.image as { width?: number; height?: number } | undefined
    const aspect =
      image?.width && image?.height ? image.width / image.height : FALLBACK_ASPECT

    return aspect >= 1
      ? { width: CARD_SIZE, height: CARD_SIZE / aspect }
      : { width: CARD_SIZE * aspect, height: CARD_SIZE }
  }, [textures])

  const materials = useMemo(() => {
    for (const texture of textures) texture.colorSpace = SRGBColorSpace

    const edge = new MeshStandardMaterial({ color: plainBack, roughness: 0.8 })
    const frontFace = new MeshStandardMaterial({ map: textures[0], roughness: 0.6 })
    const backFace = textures[1]
      ? new MeshStandardMaterial({ map: textures[1], roughness: 0.6 })
      : new MeshStandardMaterial({ color: plainBack, roughness: 0.7 })

    return [edge, edge, edge, edge, frontFace, backFace]
  }, [textures, plainBack])

  return (
    <mesh material={materials}>
      <boxGeometry args={[width, height, CARD_DEPTH]} />
    </mesh>
  )
}

function ModelObject({ url }: { url: string }) {
  const object = useNormalisedModel(url)
  return <primitive object={object} />
}

type SlotProps = {
  item: CarouselItem
  angle: number
  isFront: boolean
  spinRef: React.RefObject<number>
  plainBack: string
  onGrab: () => void
}

function Slot({ item, angle, isFront, spinRef, plainBack, onGrab }: SlotProps) {
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    // Ease scale so the front item grows as it arrives.
    const target = isFront ? FRONT_SCALE : BACK_SCALE
    group.scale.lerp(new Vector3(target, target, target), 1 - Math.exp(-8 * delta))

    // Only the front item responds to drag-to-rotate.
    group.rotation.y = isFront ? spinRef.current : 0
  })

  return (
    <group position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]}>
      <group ref={groupRef} onPointerDown={isFront ? onGrab : undefined}>
        {item.kind === 'model' ? (
          <ModelObject url={item.url} />
        ) : (
          <Card front={item.front} back={item.back} plainBack={plainBack} />
        )}
      </group>
    </group>
  )
}

type CarouselProps = {
  items: CarouselItem[]
  index: number
  onIndexChange: (index: number) => void
  /** Colour used for card edges and for backs with no artwork. */
  plainBack: string
}

export default function Carousel({ items, index, onIndexChange, plainBack }: CarouselProps) {
  const ringRef = useRef<Group>(null)
  const spinRef = useRef(0)
  const grabbedItem = useRef(false)
  const drag = useRef({ active: false, startX: 0, lastX: 0 })
  const { gl } = useThree()

  const step = (Math.PI * 2) / Math.max(items.length, 1)

  // Reset the front item's own rotation when a different one comes forward.
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
      // Dragging the item spins it; dragging anywhere else is a swipe.
      if (grabbedItem.current) spinRef.current += dx * 0.01
    }

    const onPointerUp = (event: PointerEvent) => {
      const wasOnItem = grabbedItem.current
      grabbedItem.current = false
      if (!drag.current.active) return
      drag.current.active = false

      if (wasOnItem || items.length < 2) return

      const travelled = event.clientX - drag.current.startX
      if (Math.abs(travelled) < SWIPE_THRESHOLD) return
      const direction = travelled < 0 ? 1 : -1
      onIndexChange((index + direction + items.length) % items.length)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (items.length < 2) return
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % items.length)
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length)
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
  }, [gl, index, items.length, onIndexChange])

  // Spin the ring so the selected item faces the camera, taking the short way.
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
    <group rotation={[TILT, 0, 0]} position={[0, LIFT, -RADIUS]}>
      <group ref={ringRef}>
        {items.map((item, i) => (
          <Slot
            key={item.kind === 'model' ? item.url : item.front}
            item={item}
            angle={i * step}
            isFront={i === index}
            spinRef={spinRef}
            plainBack={plainBack}
            onGrab={() => {
              grabbedItem.current = true
            }}
          />
        ))}
      </group>
    </group>
  )
}
