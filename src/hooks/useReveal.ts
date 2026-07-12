import { useEffect, useRef } from 'react'

/** Adds the "in" class when the element scrolls into view (reveal-on-scroll). */
function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        }),
      { threshold: 0.16 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}

export default useReveal
