import { site } from '../config/site'
import { useOpenModal } from '../context/ModalContext'

/* Shown when a hash route points at a page whose feature flag is off. */
function UnderConstructionPage({ title }: { title: string }) {
  const openModal = useOpenModal()
  return (
    <main className="uc">
      <div className="wrap uc__in">
        <div className="uc__emblem">
          <img src={site.assets.iconMark} alt="" />
        </div>
        <div className="uc__eyebrow">Under construction</div>
        <h1 className="uc__title">{title} is on the way</h1>
        <p className="uc__lead">
          We&apos;re still wiring this one up. Join the mailing list and you&apos;ll know the moment it opens.
        </p>
        <div className="uc__actions">
          <button className="btn btn--primary" type="button" onClick={openModal}>
            Join the mailing list
          </button>
          <a className="btn btn--ghost" href="#top">
            Back home
          </a>
        </div>
      </div>
    </main>
  )
}

export default UnderConstructionPage
