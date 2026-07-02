import { useEffect, useRef } from 'react'
import { site } from '../config/site'
import MailingListForm from './MailingListForm'

interface MailingListModalProps {
  open: boolean
  onClose: () => void
}

/* Entry modal: greets visitors on load and can be re-opened from
   nav / hero / footer via ModalContext. */
function MailingListModal({ open, onClose }: MailingListModalProps) {
  const scrimRef = useRef<HTMLDivElement>(null)

  // esc to close + focus the email field on open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const id = setTimeout(() => {
      scrimRef.current?.querySelector<HTMLInputElement>('#ml-email')?.focus()
    }, 420)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(id)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      className={'modal-scrim' + (open ? ' open' : '')}
      ref={scrimRef}
      onMouseDown={(e) => {
        if (e.target === scrimRef.current) onClose()
      }}
      aria-hidden={!open}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal__close" onClick={onClose} aria-label="Close" />
        <div className="modal__emblem">
          <img src={site.assets.emblem} alt="" />
        </div>
        <div className="modal__eyebrow">Before you go in</div>
        <h2 className="modal__title" id="modal-title">
          First to hear it
        </h2>
        <p className="modal__lead">
          {site.artistName}&apos;s debut is coming. One email when it lands — the release, the
          moment it&apos;s out. No noise, ever.
        </p>

        <MailingListForm />

        <div className="modal__later">
          <button type="button" onClick={onClose}>
            No thanks — take me in
          </button>
        </div>
      </div>
    </div>
  )
}

export default MailingListModal
