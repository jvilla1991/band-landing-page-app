import { useEffect, useRef } from 'react'
import { site } from '../config/site'
import { useOpenModal } from '../context/ModalContext'
import Icon from './Icon'

function Hero() {
  const openModal = useOpenModal()
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

  const rel = site.latestRelease
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
        <p className="hero__tag">{site.tagline}</p>

        <div className="hero__teaser">
          <span>{rel.type}</span>
          <span className="sep" />
          <b className="em">{rel.title}</b>
          <span className="sep" />
          <span>{rel.status === 'out' ? 'Out now' : `Coming ${rel.releaseDateLabel}`}</span>
        </div>

        <div className="hero__cta">
          <button className="btn btn--primary" type="button" onClick={openModal}>
            Join the mailing list
            <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
              <Icon name="arrow" />
            </span>
          </button>
          <a className="btn" href="#listen">
            Hear the demos
          </a>
        </div>
      </div>
      <div className="scrollhint">
        <span>Scroll</span>
        <span className="ln" />
      </div>
    </section>
  )
}

export default Hero
