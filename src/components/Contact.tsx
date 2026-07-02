import { site } from '../config/site'
import useReveal from '../hooks/useReveal'
import Icon from './Icon'

function Contact() {
  const ref = useReveal()
  const c = site.contact

  return (
    <section className="section" id="contact">
      <div className="wrap reveal" ref={ref}>
        <span className="eyebrow">Contact</span>
        <h2 className="section-title">Get in touch</h2>
        <p className="section-lead">No forms, no funnel — just a direct line.</p>

        <div className="contact__grid">
          <div className="ccard">
            <span className="ccard__k">Booking &amp; Press</span>
            <div className="ccard__v">
              <a href={`mailto:${c.bookingEmail}`}>{c.bookingEmail}</a>
            </div>
            <span className="ccard__sub">{c.bookingNote}</span>
            <a
              className="btn btn--primary"
              href={`mailto:${c.bookingEmail}?subject=${site.artistName}%20booking`}
              style={{ marginTop: 8, alignSelf: 'flex-start' }}
            >
              Email for booking
              <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                <Icon name="mail" />
              </span>
            </a>
          </div>

          <div className="ccard">
            <span className="ccard__k">Say hello</span>
            <div className="ccard__v">
              <a href={`mailto:${c.generalEmail}`}>{c.generalEmail}</a>
            </div>
            <span className="ccard__sub">{c.generalNote}</span>
            <a
              className="btn"
              href={`mailto:${c.generalEmail}`}
              style={{ marginTop: 8, alignSelf: 'flex-start' }}
            >
              Say hello
              <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                <Icon name="mail" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
