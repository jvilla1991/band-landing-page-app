import { site } from '../config/site'
import useReveal from '../hooks/useReveal'
import Icon from './Icon'

function AboutEPK() {
  const ref = useReveal()
  const about = site.about

  return (
    <section className="section" id="about">
      <div className="wrap reveal" ref={ref}>
        <span className="eyebrow">About · EPK</span>
        <h2 className="section-title">{about.genre}</h2>
        <div className="about__grid">
          <div>
            <div className="photo">
              {site.assets.pressPhoto ? (
                <img src={site.assets.pressPhoto} alt={`${site.artistName} press photo`} />
              ) : (
                <div className="ph">
                  <div style={{ width: 30, height: 30 }}>
                    <Icon name="image" />
                  </div>
                  Press photo
                  <br />
                  coming soon
                </div>
              )}
            </div>
          </div>
          <div className="bio">
            <p className="lead">{about.lead}</p>
            {about.body.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <div className="quotes">
              {site.press.map((q) => (
                <blockquote className="quote" key={q.quote}>
                  <p>“{q.quote}”</p>
                  <cite>{q.source}</cite>
                </blockquote>
              ))}
            </div>

            <div className="epk">
              <div className="epk__tx">
                <h4>{site.pressKit.label}</h4>
                <p>{site.pressKit.note}</p>
              </div>
              <a className="btn" href={site.pressKit.href} aria-label="Download press kit">
                Download
                <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                  <Icon name="download" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutEPK
