import { useEffect, useMemo, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'

/** Texture pixels per world unit. */
const RESOLUTION = 512
const MAX_DIMENSION = 2048

type TextTextureOptions = {
  title?: string
  body: string
  /** Card size in world units, so the canvas matches the card's shape. */
  width: number
  height: number
  fill: string
  ink: string
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []

  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
  }

  return lines
}

/**
 * Renders text into a canvas and returns it as a texture, so a card can carry
 * an abstract on its back instead of artwork. Redraws once webfonts finish
 * loading, since the first paint may otherwise use a fallback face.
 */
export function useTextTexture(options: TextTextureOptions | null): Texture | null {
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    if (!options) return null
    const { title, body, width, height, fill, ink } = options

    const canvas = document.createElement('canvas')
    canvas.width = Math.min(Math.round(width * RESOLUTION), MAX_DIMENSION)
    canvas.height = Math.min(Math.round(height * RESOLUTION), MAX_DIMENSION)

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = fill
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const padding = canvas.width * 0.09
    const maxWidth = canvas.width - padding * 2
    const family = '"Hermeneus One", Georgia, serif'
    let y = padding

    if (title) {
      const titleSize = canvas.width / 17
      ctx.font = `${titleSize}px ${family}`
      ctx.fillStyle = ink
      ctx.textBaseline = 'top'

      for (const line of wrap(ctx, title, maxWidth)) {
        ctx.fillText(line, padding, y)
        y += titleSize * 1.25
      }

      // Rule under the title.
      y += titleSize * 0.35
      ctx.globalAlpha = 0.4
      ctx.fillRect(padding, y, maxWidth, Math.max(1, canvas.width / 700))
      ctx.globalAlpha = 1
      y += titleSize * 0.6
    }

    const bodySize = canvas.width / 30
    ctx.font = `${bodySize}px ${family}`
    ctx.fillStyle = ink

    const lineHeight = bodySize * 1.45
    for (const line of wrap(ctx, body, maxWidth)) {
      if (y + lineHeight > canvas.height - padding) {
        ctx.fillText('…', padding, y)
        break
      }
      ctx.fillText(line, padding, y)
      y += lineHeight
    }

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    return texture
    // fontsReady is a dependency so the text redraws in the real face once
    // the webfont has loaded.
  }, [options, fontsReady])
}
