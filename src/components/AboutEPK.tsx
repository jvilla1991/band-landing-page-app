import { site } from '../config/site'
import useReveal from '../hooks/useReveal'
import Icon from './Icon'
import PhotoCarousel from './PhotoCarousel'

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
            {about.photos.length > 0 ? (
              <PhotoCarousel photos={about.photos} />
            ) : (
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
            )}
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
              <button className="btn" type="button" disabled aria-label="Press kit coming soon">
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutEPK
