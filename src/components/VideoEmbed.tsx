import { useState } from 'react'
import { site } from '../config/site'
import useReveal from '../hooks/useReveal'
import Icon from './Icon'

/**
 * Featured video under the hero. Click-to-play facade: only a thumbnail loads
 * up front — YouTube's player (and its cookies/JS) is fetched when someone
 * actually presses play, via the no-cookie embed host.
 */
function VideoEmbed() {
  const ref = useReveal()
  const video = site.video
  const [playing, setPlaying] = useState(false)

  if (!video.youtubeId) return null

  return (
    <section className="section videosec" id="watch">
      <div className="wrap reveal" ref={ref}>
        <span className="eyebrow">Watch</span>
        <h2 className="section-title">{video.title}</h2>
        <div className="ytframe">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="ytframe__poster"
              aria-label={`Play video: ${video.title}`}
              onClick={() => setPlaying(true)}
            >
              <img
                src={`https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                alt=""
                loading="lazy"
                onError={(e) => {
                  /* maxresdefault doesn't exist for every video — drop to hqdefault once */
                  const img = e.currentTarget
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1'
                    img.src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
                  }
                }}
              />
              <span className="ytframe__play" aria-hidden="true">
                <Icon name="play" />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default VideoEmbed
