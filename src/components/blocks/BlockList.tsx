import { lazy, Suspense } from 'react'
import type { Block } from '../../graph/blocks'
import { useLocale } from '../../i18n/locale'
import { inlineMarkup } from './inline'
import LazyFrame from './LazyFrame'

// Three.js is only needed by model blocks, so it stays out of the main bundle.
const ModelViewer = lazy(() => import('./ModelViewer'))

function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="mt-2 text-xs text-[#a8975f]">{children}</figcaption>
}

/** A framed box, matching the HUD look of the window itself. */
function Frame({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`border border-white/15 bg-black/30 ${className}`} style={style}>
      {children}
    </div>
  )
}

export default function BlockList({ blocks }: { blocks: Block[] }) {
  const { t } = useLocale()

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text': {
            const content = inlineMarkup(t(block.text))

            if (block.variant === 'title') {
              return (
                <h3
                  key={i}
                  className="font-pixel mt-2 text-xl tracking-[0.12em] text-[#fff6dc] uppercase"
                >
                  {content}
                </h3>
              )
            }

            if (block.variant === 'subtitle') {
              return (
                <h4
                  key={i}
                  className="font-pixel text-sm tracking-[0.16em] text-[#c9b98a] uppercase"
                >
                  {content}
                </h4>
              )
            }

            return (
              <p key={i} className="text-sm leading-relaxed text-slate-300">
                {content}
              </p>
            )
          }

          case 'image':
            return (
              <figure key={i}>
                <Frame>
                  <img
                    src={block.src}
                    alt={block.alt ? t(block.alt) : ''}
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </Frame>
                {block.caption && <Caption>{t(block.caption)}</Caption>}
              </figure>
            )

          case 'link':
            return (
              <p key={i}>
                <a
                  href={block.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-b border-white/40 text-sm text-[#fff6dc] transition hover:border-white"
                >
                  {t(block.label)} ↗
                </a>
              </p>
            )

          case 'video':
            return (
              // On a phone the width is the scarce dimension, so the video
              // fills it. On a desktop the window is wider than it is tall, so
              // height leads instead and the width follows from 16:9.
              <figure key={i} className="md:flex md:flex-col md:items-center">
                <Frame className="aspect-video w-full md:h-[38vh] md:w-auto">
                  {block.youtube ? (
                    <iframe
                      // nocookie avoids setting tracking cookies before play.
                      src={`https://www.youtube-nocookie.com/embed/${block.youtube}`}
                      title={block.caption ? t(block.caption) : 'video'}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full"
                    />
                  ) : (
                    <video src={block.src} controls className="h-full w-full" />
                  )}
                </Frame>
                {block.caption && <Caption>{t(block.caption)}</Caption>}
              </figure>
            )

          case 'embed':
            return (
              // Same sizing logic as video: width leads on a phone, height on
              // a desktop, so an embedded game is not squeezed into a strip.
              <div key={i} className="md:flex md:flex-col md:items-center">
                <Frame
                  className="w-full md:h-[46vh] md:w-auto"
                  style={{ aspectRatio: String(block.aspect ?? 16 / 9) }}
                >
                  <LazyFrame className="h-full w-full">
                    <iframe
                      src={block.src}
                      title={block.title ? t(block.title) : 'embedded content'}
                      allow="fullscreen; autoplay; gamepad; clipboard-write"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full"
                    />
                  </LazyFrame>
                </Frame>
              </div>
            )

          case 'itch': {
            // itch's widget takes its palette from the query string, so it can
            // be tuned to the page instead of arriving in its default grey.
            const colours = new URLSearchParams({
              linkback: 'true',
              bg_color: '0a0803',
              fg_color: 'f4f4f6',
              link_color: 'ffd873',
              border_color: '3a3225',
            })

            return (
              // Fixed 552x167 by design; capped so it cannot overflow a phone.
              <LazyFrame key={i} className="h-[167px] w-full max-w-[552px]">
                <iframe
                  src={`https://itch.io/embed/${block.id}?${colours}`}
                  title={block.label ? t(block.label) : 'itch.io'}
                  loading="lazy"
                  className="h-full w-full border-0"
                />
              </LazyFrame>
            )
          }

          case 'rule':
            return (
              <hr
                key={i}
                className="my-2 border-0 border-t border-white/25"
                style={{ boxShadow: '0 0 6px rgba(255, 219, 130, 0.35)' }}
              />
            )

          case 'model':
            return (
              // No frame and no ground: the canvas is transparent, so the model
              // floats in the window instead of sitting in a box. Square, and
              // sized by height on desktop, since the camera frames vertically.
              <div
                key={i}
                className="mx-auto aspect-square w-full md:h-[44vh] md:w-auto"
              >
                <Suspense fallback={null}>
                  <ModelViewer src={block.src} zoom={block.zoom} render={block.render} />
                </Suspense>
              </div>
            )
        }
      })}
    </div>
  )
}
