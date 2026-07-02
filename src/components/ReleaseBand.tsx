import { site } from '../config/site'
import useReveal from '../hooks/useReveal'
import Icon from './Icon'

function ReleaseBand() {
  const ref = useReveal()
  const rel = site.latestRelease
  const cover = site.assets.coverArt
  const out = rel.status === 'out'

  return (
    <section className="section relband" id="release">
      <div className="wrap reveal" ref={ref}>
        <div className="links-head" style={{ marginBottom: 22 }}>
          <span className="eyebrow">Latest Release</span>
        </div>
        <div className="relband__inner">
          <div className="release__cover">
            {cover ? (
              <img src={cover} alt={`${rel.title} cover art`} />
            ) : (
              <div className="ph">
                <div style={{ width: 34, height: 34 }}>
                  <Icon name="disc" />
                </div>
                Cover art
                <br />
                coming soon
              </div>
            )}
          </div>
          <div className="release__body">
            <span className="release__type">{rel.type}</span>
            <h3 className="release__title">{rel.title}</h3>
            <p className="release__date">
              {out ? (
                <>Out now</>
              ) : (
                <>
                  Coming <b>{rel.releaseDateLabel}</b> · {rel.releaseDate}
                </>
              )}
            </p>
            <div className="release__cta">
              <a className="btn btn--primary" href={rel.primaryCta.href}>
                {rel.primaryCta.label}
                <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                  <Icon name="arrow" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReleaseBand
