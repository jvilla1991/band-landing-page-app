import { useEffect, useState } from 'react'
import type { PressPhoto } from '../config/site'
import Icon from './Icon'

/* Auto-advance is decorative — skip it entirely for reduced-motion users. */
const prefersReducedMotion =
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Band photo carousel for the About section. Same interaction model as the
 * store product cards: arrows, dots, and a slow auto-advance that pauses on
 * hover or keyboard focus so it never fights someone looking at a photo.
 */
function PhotoCarousel({ photos }: { photos: PressPhoto[] }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = photos.length
  const safeIdx = count > 0 ? Math.min(idx, count - 1) : 0

  useEffect(() => {
    if (paused || prefersReducedMotion || count < 2) return
    const timer = window.setInterval(() => setIdx((i) => (i + 1) % count), 5000)
    return () => window.clearInterval(timer)
  }, [paused, count])

  if (count === 0) return null
  const photo = photos[safeIdx]

  return (
    <div
      className="photo photo--carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <img
        src={photo.src}
        alt={count > 1 ? `${photo.alt} — photo ${safeIdx + 1} of ${count}` : photo.alt}
        style={photo.focus ? { objectPosition: photo.focus } : undefined}
        loading="lazy"
      />
      {count > 1 && (
        <>
          <button
            type="button"
            className="pcar__nav pcar__nav--prev"
            aria-label="Previous photo"
            onClick={() => setIdx((safeIdx + count - 1) % count)}
          >
            <Icon name="arrow" />
          </button>
          <button
            type="button"
            className="pcar__nav pcar__nav--next"
            aria-label="Next photo"
            onClick={() => setIdx((safeIdx + 1) % count)}
          >
            <Icon name="arrow" />
          </button>
          <div className="pcar__dots">
            {photos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                className={'pcar__dot' + (i === safeIdx ? ' sel' : '')}
                aria-label={`Photo ${i + 1}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PhotoCarousel
