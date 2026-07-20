import { useEffect, useRef } from 'react'
import { site } from '../config/site'

function Hero() {
  const emblemRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        if (emblemRef.current) {
          emblemRef.current.style.transform = `translateY(${y * 0.12}px)`
        }
        if (innerRef.current) {
          innerRef.current.style.transform = `translateY(${y * -0.04}px)`
          innerRef.current.style.opacity = String(Math.max(0, 1 - y / 700))
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const wordmark = site.assets.wordmark

  return (
    <section className="hero" id="top">
      <div className="fog" aria-hidden="true" />
      <div className="hero__bloom" aria-hidden="true" />
      <div className="wrap hero__inner" ref={innerRef}>
        <div className="hero__emblem" ref={emblemRef}>
          <img src={site.assets.emblem} alt={`${site.artistName} emblem`} />
        </div>
        <div className="hero__kicker">
          <span className="eyebrow">Ambient · Metalcore</span>
        </div>
        <h1 className="hero__wordmark">
          {wordmark ? (
            <img src={wordmark} alt={site.artistName} />
          ) : (
            <span className="hero__wordmark--text">{site.artistName}</span>
          )}
        </h1>
      </div>
    </section>
  )
}

export default Hero
