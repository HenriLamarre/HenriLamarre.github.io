# 3D models

Drop `.glb` files here. They are served from the site root, so a file at
`public/models/modelisation.glb` is fetched as `/models/modelisation.glb`.

The Modélisation scene loads `/models/modelisation.glb`. Until that file
exists, it falls back to placeholder geometry.

## Format

- **glTF 2.0 binary (`.glb`)** — one file with meshes, materials and textures
  embedded. In Blender: File → Export → glTF 2.0, format "glTF Binary (.glb)".
- Prefer `.glb` over `.gltf` + separate textures: one request, no path issues.
- Keep textures at 1–2K and power-of-two sized.
- Compress with Draco or meshopt if the file is more than a few MB — every
  version is committed to the repo and served from GitHub Pages.

## Scale and orientation

The camera sits at `[0, 0, 4]` looking at the origin, so a model roughly
2 units tall fills the frame. glTF is Y-up; Blender exports handle this, but
check the model isn't lying on its side.
