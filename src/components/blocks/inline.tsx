import { Fragment, type ReactNode } from 'react'

/**
 * A deliberately small subset of markdown: **bold**, *italic*, `code` and
 * [label](https://…). A parser library would be far more than this needs.
 */
const PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

export function inlineMarkup(source: string): ReactNode {
  const parts = source.split(PATTERN).filter(Boolean)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-[#fff6dc]">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-white/10 px-1 text-[#fff6dc]">
          {part.slice(1, -1)}
        </code>
      )
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-white/40 text-[#fff6dc] hover:border-white"
        >
          {link[1]}
        </a>
      )
    }

    return <Fragment key={i}>{part}</Fragment>
  })
}
