import { site } from '../config/site'
import { useOpenModal } from '../context/ModalContext'
import Icon from './Icon'

function Footer() {
  const openModal = useOpenModal()
  const year = new Date().getFullYear()

  return (
    <footer className="ftr">
      <div className="wrap ftr__in">
        <div className="ftr__top">
          <div className="ftr__brand">
            <img src={site.assets.iconMark} alt="" />
            <span className="nm">{site.artistName}</span>
          </div>
          <div className="ftr__join">
            <button className="btn btn--primary" type="button" onClick={openModal}>
              Join the mailing list
              <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                <Icon name="arrow" />
              </span>
            </button>
          </div>
        </div>
        <div className="ftr__bottom">
          <span className="ftr__cp">
            © {year} {site.artistName} — All rights reserved
          </span>
          <button
            className="totop"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
            <span className="up" style={{ width: 14, height: 14, display: 'inline-block' }}>
              <Icon name="arrowUp" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
