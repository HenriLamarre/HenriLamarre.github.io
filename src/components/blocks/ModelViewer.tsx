import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import {
  AdditiveBlending,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Vector3,
  type Matrix4,
  type Mesh,
} from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Faces meeting at a sharper angle than this produce a drawn edge. */
const EDGE_THRESHOLD = 24
/** Dense meshes keep only their strongest creases, or the result is noise. */
const DENSE_TRIANGLES = 120_000
const DENSE_EDGE_THRESHOLD = 48

const LINE_COLOUR = '#ffd873'
const RIM_COLOUR = '#ffc247'
const FILL_COLOUR = '#0a0803'

/**
 * Edges describe creases, so a smooth tube draws nothing and vanishes into
 * the dark body. This lights the silhouette instead: facing away from the
 * camera glows, facing it stays dark. `abs` on the dot product means a flipped
 * normal glows just the same, so inverted winding cannot leave holes.
 */
const RIM_SHADER = {
  vertex: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-viewPosition.xyz);
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 base;
    uniform vec3 rim;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float facing = abs(dot(normalize(vNormal), normalize(vView)));
      float edge = pow(1.0 - facing, 2.2);
      gl_FragColor = vec4(mix(base, rim, edge), 1.0);
    }
  `,
}

type Piece = { fill: BufferGeometry; edges: EdgesGeometry }

/**
 * Rebuilds a geometry as plain float positions in world space.
 *
 * These models are meshopt-compressed, so their positions arrive as
 * normalised integers in an interleaved buffer. Calling applyMatrix4 on that
 * writes floats back into an integer array, which snaps every vertex to the
 * integer grid — that is what turned a branching model into a cubic lattice.
 * Reading through `fromBufferAttribute` decodes normalisation and
 * interleaving properly, and the result is float, so the transform is safe.
 *
 * Positions are all we need: the fill is unlit and edges only use geometry.
 * Dropping the other attributes also lets welding merge purely by position.
 */
function worldPositions(source: BufferGeometry, matrix: Matrix4): BufferGeometry {
  const position = source.attributes.position
  const array = new Float32Array(position.count * 3)
  const vertex = new Vector3()

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i).applyMatrix4(matrix)
    array[i * 3] = vertex.x
    array[i * 3 + 1] = vertex.y
    array[i * 3 + 2] = vertex.z
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(array, 3))
  if (source.index) geometry.setIndex(Array.from(source.index.array))
  return geometry
}

/**
 * Turns a model into a wireframe reading of itself: bright edges over a dark,
 * nearly opaque body that hides the edges behind it.
 *
 * Edges come from EdgesGeometry rather than a wireframe material, so only
 * silhouette and crease lines are drawn instead of every triangle. They blend
 * additively, so crossings brighten and it glows without a post-processing
 * pass — cheaper than rendering the textured original.
 */
function useHologram(src: string) {
  const { scene } = useGLTF(src)

  return useMemo(() => {
    const pieces: Piece[] = []
    const bounds = new Box3()

    scene.updateWorldMatrix(true, true)
    scene.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh || !mesh.geometry) return

      // Decode to float world-space positions before touching the data.
      const fill = worldPositions(mesh.geometry, mesh.matrixWorld)

      const triangles = (fill.index?.count ?? fill.attributes.position.count) / 3
      const threshold = triangles > DENSE_TRIANGLES ? DENSE_EDGE_THRESHOLD : EDGE_THRESHOLD

      // Exports split vertices at UV seams and hard edges. Left as-is,
      // EdgesGeometry sees no adjacent faces to compare and turns every
      // triangle border into an edge. Welding only affects the edge copy.
      let welded = fill
      try {
        welded = mergeVertices(fill)
      } catch {
        // Some layouts cannot be merged; unwelded edges are noisier but render.
      }

      // Normals were dropped with the other attributes, and the rim shader
      // needs them. Computing from the welded copy also repairs whatever the
      // export shipped.
      welded.computeVertexNormals()

      pieces.push({ fill: welded, edges: new EdgesGeometry(welded, threshold) })

      fill.computeBoundingBox()
      if (fill.boundingBox) bounds.union(fill.boundingBox)
    })

    // Centre on the origin and scale the longest side to 2 units.
    const size = bounds.getSize(new Vector3())
    const centre = bounds.getCenter(new Vector3())
    const scale = 2 / (Math.max(size.x, size.y, size.z) || 1)

    return { pieces, centre, scale }
  }, [scene])
}

function Hologram({ src }: { src: string }) {
  const { pieces, centre, scale } = useHologram(src)

  return (
    <group scale={scale} position={centre.clone().multiplyScalar(-scale).toArray()}>
      {pieces.map((piece, i) => (
        <group key={i}>
          {/* Fully opaque on purpose: a transparent fill lands in the
              transparent queue, which is sorted per object and gives wrong
              occlusion between pieces. polygonOffset pushes it back a hair so
              the edges sitting exactly on its surface do not z-fight. */}
          <mesh geometry={piece.fill}>
            <shaderMaterial
              vertexShader={RIM_SHADER.vertex}
              fragmentShader={RIM_SHADER.fragment}
              uniforms={{
                base: { value: new Color(FILL_COLOUR) },
                rim: { value: new Color(RIM_COLOUR) },
              }}
              side={DoubleSide}
              polygonOffset
              polygonOffsetFactor={2}
              polygonOffsetUnits={2}
            />
          </mesh>
          <lineSegments geometry={piece.edges}>
            {/* Lower than it looks: additive blending stacks, and the dense
                clustered areas would otherwise burn out to flat white. */}
            <lineBasicMaterial
              color={LINE_COLOUR}
              transparent
              opacity={0.45}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

/** The model with its own materials, for comparison against the hologram. */
function Shaded({ src }: { src: string }) {
  const { scene } = useGLTF(src)

  const { object, centre, scale } = useMemo(() => {
    const clone = scene.clone(true)
    const box = new Box3().setFromObject(clone)
    const size = box.getSize(new Vector3())

    return {
      object: clone,
      centre: box.getCenter(new Vector3()),
      scale: 2 / (Math.max(size.x, size.y, size.z) || 1),
    }
  }, [scene])

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} />
      <group scale={scale} position={centre.clone().multiplyScalar(-scale).toArray()}>
        <primitive object={object} />
      </group>
    </>
  )
}

export default function ModelViewer({
  src,
  render = 'hologram',
}: {
  src: string
  render?: 'hologram' | 'shaded'
}) {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        {render === 'shaded' ? <Shaded src={src} /> : <Hologram src={src} />}
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  )
}
