import type { Text } from '../i18n/types'

/**
 * A node's window is a sequence of these. Add as many as the entry needs —
 * the window scrolls.
 *
 * Text supports a little inline markup: **bold**, *italic*, `code` and
 * [label](https://…).
 */
export type Block =
  /** A heading, a subheading, or a paragraph. */
  | { type: 'text'; variant?: 'title' | 'subtitle' | 'body'; text: Text }
  /** Path under /public, e.g. "/content/derapage.webp". */
  | { type: 'image'; src: string; alt?: Text; caption?: Text }
  /** A link out, on its own line. */
  | { type: 'link'; href: string; label: Text }
  /** Either a YouTube id or a file under /public. */
  | { type: 'video'; youtube?: string; src?: string; caption?: Text }
  /**
   * A .glb under /public, shown in an orbitable viewer.
   *
   * `zoom` scales the model in frame: 1 fits its longest side, above that
   * fills more of the view. `render` picks the model's own materials with a
   * glowing rim (default) or a wireframe reading of it.
   */
  | { type: 'model'; src: string; zoom?: number; render?: 'shaded' | 'hologram' }
  /** A full-width rule, for separating sections. */
  | { type: 'rule' }

/** Every translatable string a block carries, for the i18n checker. */
export function blockTexts(block: Block): Array<[string, Text | undefined]> {
  switch (block.type) {
    case 'text':
      return [['text', block.text]]
    case 'image':
      return [
        ['alt', block.alt],
        ['caption', block.caption],
      ]
    case 'link':
      return [['label', block.label]]
    case 'video':
      return [['caption', block.caption]]
    case 'model':
    case 'rule':
      return []
  }
}
