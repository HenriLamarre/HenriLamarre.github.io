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
  Mesh,
  MeshStandardMaterial,
  ShaderMaterial,
  Vector3,
  type Material,
  type Matrix4,
} from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Faces meeting at a sharper angle than this produce a drawn edge. */
const EDGE_THRESHOLD = 24
/** Dense meshes keep only their strongest creases, or the result is noise. */
const DENSE_TRIANGLES = 120_000
const DENSE_EDGE_THRESHOLD = 48

const LINE_COLOUR = '#ffd873'
const RIM_COLOUR = '#f3eee3'
const FILL_COLOUR = '#0a0803'
/** How much of the model's own material shows through. */
const SURFACE_OPACITY = 0.3

/**
 * Lights the silhouette: surfaces turned away from the camera glow, those
 * facing it stay clear. `abs` on the dot product means a flipped normal glows
 * the same, so inverted winding cannot leave holes.
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
  /** Used as an additive overlay, so it only ever adds light. */
  overlayFragment: /* glsl */ `
    uniform vec3 rim;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float facing = abs(dot(normalize(vNormal), normalize(vView)));
      float edge = pow(1.0 - facing, 2.4);
      gl_FragColor = vec4(rim * edge, edge);
    }
  `,
  /** Used as the body of the wireframe reading. */
  bodyFragment: /* glsl */ `
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

function rimOverlayMaterial() {
  return new ShaderMaterial({
    vertexShader: RIM_SHADER.vertex,
    fragmentShader: RIM_SHADER.overlayFragment,
    uniforms: { rim: { value: new Color(RIM_COLOUR) } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  })
}

/** Centre on the origin and scale the longest side to 2 units, times `zoom`. */
function framing(bounds: Box3, zoom: number) {
  const size = bounds.getSize(new Vector3())
  const centre = bounds.getCenter(new Vector3())
  const scale = (2 / (Math.max(size.x, size.y, size.z) || 1)) * zoom
  return { centre, scale, position: centre.clone().multiplyScalar(-scale).toArray() }
}

/**
 * The model's own materials, made slightly transparent, with a glowing rim
 * added on top as a second pass.
 *
 * The rim is a separate overlay mesh rather than a modified material, so the
 * original shading is untouched and the geometry is never read on the CPU —
 * which matters, since these meshes are meshopt-quantised.
 */
function Shaded({ src, zoom }: { src: string; zoom: number }) {
  const { scene } = useGLTF(src)

  const { object, position, scale } = useMemo(() => {
    const clone = scene.clone(true)

    // Collect first, mutate after. Adding the rim meshes during the traversal
    // makes it descend into the ones just added, each of which is itself a
    // mesh — the recursion never ends and the tab locks up.
    const meshes: Mesh[] = []
    clone.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh && mesh.geometry) meshes.push(mesh)
    })

    for (const mesh of meshes) {
      // Clone the material: useGLTF caches the original across every mount.
      const source = mesh.material as Material
      const material = (Array.isArray(source) ? source[0] : source).clone() as
        MeshStandardMaterial
      material.transparent = true
      material.opacity = SURFACE_OPACITY
      material.depthWrite = true
      mesh.material = material

      const rim = new Mesh(mesh.geometry, rimOverlayMaterial())
      rim.renderOrder = 1
      mesh.add(rim)
    }

    return { object: clone, ...framing(new Box3().setFromObject(clone), zoom) }
  }, [scene, zoom])

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} />
      <group scale={scale} position={position}>
        <primitive object={object} />
      </group>
    </>
  )
}

type Piece = { fill: BufferGeometry; edges: EdgesGeometry }

/**
 * Rebuilds a geometry as plain float positions in world space.
 *
 * These models are meshopt-compressed, so positions arrive as normalised
 * integers in an interleaved buffer. applyMatrix4 on that writes floats back
 * into an integer array, snapping every vertex to the integer grid.
 * `fromBufferAttribute` decodes properly and yields floats.
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

/** Bright creases over a dark rim-lit body. */
function Hologram({ src, zoom }: { src: string; zoom: number }) {
  const { scene } = useGLTF(src)

  const { pieces, position, scale } = useMemo(() => {
    const pieces: Piece[] = []
    const bounds = new Box3()

    scene.updateWorldMatrix(true, true)
    scene.traverse((child) => {
      const mesh = child as Mesh
      if (!mesh.isMesh || !mesh.geometry) return

      const fill = worldPositions(mesh.geometry, mesh.matrixWorld)
      const triangles = (fill.index?.count ?? fill.attributes.position.count) / 3
      const threshold = triangles > DENSE_TRIANGLES ? DENSE_EDGE_THRESHOLD : EDGE_THRESHOLD

      // Exports split vertices at seams; unwelded, every triangle border reads
      // as a crease.
      let welded = fill
      try {
        welded = mergeVertices(fill)
      } catch {
        // Some layouts cannot be merged; the edges are noisier but render.
      }
      welded.computeVertexNormals()

      pieces.push({ fill: welded, edges: new EdgesGeometry(welded, threshold) })

      welded.computeBoundingBox()
      if (welded.boundingBox) bounds.union(welded.boundingBox)
    })

    return { pieces, ...framing(bounds, zoom) }
  }, [scene, zoom])

  return (
    <group scale={scale} position={position}>
      {pieces.map((piece, i) => (
        <group key={i}>
          <mesh geometry={piece.fill}>
            <shaderMaterial
              vertexShader={RIM_SHADER.vertex}
              fragmentShader={RIM_SHADER.bodyFragment}
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

export default function ModelViewer({
  src,
  zoom = 1,
  render = 'shaded',
}: {
  src: string
  zoom?: number
  render?: 'shaded' | 'hologram'
}) {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        {render === 'hologram' ? (
          <Hologram src={src} zoom={zoom} />
        ) : (
          <Shaded src={src} zoom={zoom} />
        )}
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
