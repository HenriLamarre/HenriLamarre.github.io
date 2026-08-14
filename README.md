# henrilamarre.github.io

Personal CV site. React 19 + TypeScript + Vite + Tailwind 4, with [Rive](https://rive.app) for animation.

Live at <https://henrilamarre.github.io>.

## Development

```bash
npm install
npm run dev
```

Other scripts: `npm run build` (typecheck + production build to `dist/`), `npm run preview`, `npm run lint`.

## Rive assets

Put `.riv` files in `public/rive/` and mount them with `src/components/RiveScene.tsx`:

```tsx
<RiveScene src="/rive/hero.riv" stateMachines="State Machine 1" className="h-64 w-full" />
```

## Deployment

Every push to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`.

One-time setup on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
