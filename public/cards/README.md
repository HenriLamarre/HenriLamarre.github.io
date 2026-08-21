# Card images

One folder per scene: `recherche/`, `jeux/`, `enseignement/`.

Each card has a front image and an optional back. Reference them from the
matching file in `src/content/`, e.g.

```ts
{
  kind: 'card',
  front: '/cards/recherche/mhd-coronal-loops.front.webp',
  back:  '/cards/recherche/mhd-coronal-loops.back.webp',
  label: 'MHD coronal loops',
  ...
}
```

## Naming

`<slug>.front.webp` and `<slug>.back.webp`, lowercase and hyphenated. The slug
should say what the card is, so the folder stays readable as it grows.

## Format

- **WebP**, sRGB, quality ~80.
- **1024 × 1434** — the 2.5:3.5 playing-card ratio. Other ratios are fitted to
  the card face rather than stretched, so they letterbox.
- Aim for under ~250 KB per image. Every version is committed to the repo and
  served from GitHub Pages.

Omitting `back` gives a plain back in the scene's own colour, so cards can
start one-sided and gain artwork later without a code change.
