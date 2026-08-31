# 3D models

Files here are served from the site root: `public/models/Model1.glb` is
fetched as `/models/Model1.glb`.

Reference one from a node's `body` in `src/graph/data.ts`:

```ts
{ type: 'model', src: '/models/Model1.glb', caption: { en: 'Turntable' } }
```

The viewer centres the model and scales its longest side to 2 units, so any
export frames correctly regardless of its scale. Drag to orbit.

## Format

- **glTF 2.0 binary (`.glb`)** — one file, textures embedded. In Blender:
  File → Export → glTF 2.0, format "glTF Binary".
- Compress before committing. Every version stays in git history forever:

  ```bash
  npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 2048
  ```

  Meshopt rather than Draco: the decoder ships with the app, whereas Draco
  fetches one from a Google CDN at runtime. Add `--texture-compress false` if
  the encoder rejects a texture's colourspace.
- Aim for under ~5 MB and ~500k triangles. A dense mesh that resists
  compression needs decimating in Blender first — that does more than any
  compressor can.
