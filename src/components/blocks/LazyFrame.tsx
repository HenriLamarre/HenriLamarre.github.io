import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Renders its children only once scrolled into view.
 *
 * Embeds each cost a request to a third party, and a long entry can hold
 * several. Loading them all when the window opens wastes requests on widgets
 * nobody scrolls to — and itch.io rate-limits, returning 429.
 *
 * IntersectionObserver accounts for clipping ancestors, so this works inside
 * the window's own scroll area without passing a root.
 */
export default function LazyFrame({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || visible) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true)
      },
      // Start loading slightly before it is reached, so it is ready on arrival.
      { rootMargin: '200px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div ref={ref} className={className} style={style}>
      {visible ? children : null}
    </div>
  )
}
