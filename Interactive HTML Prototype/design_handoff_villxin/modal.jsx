/* villxin — MailingListModal (entry modal) + ModalCtx opener
   The mailing list is the primary conversion: it greets visitors on entry
   and can be re-opened from nav / hero / footer via ModalCtx. */
(function () {
  const { useEffect, useRef, createContext } = React;

  // context carries the opener so any component can summon the modal
  window.ModalCtx = createContext(() => {});

  function MailingListModal({ open, onClose, site }) {
    const inputWrapRef = useRef(null);
    const scrimRef = useRef(null);

    // esc to close + focus the email field on open
    useEffect(() => {
      if (!open) return;
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      const id = setTimeout(() => {
        scrimRef.current?.querySelector("#ml-email")?.focus();
      }, 420);
      document.body.style.overflow = "hidden";
      return () => { window.removeEventListener("keydown", onKey); clearTimeout(id); document.body.style.overflow = ""; };
    }, [open, onClose]);

    return (
      <div
        className={"modal-scrim" + (open ? " open" : "")}
        ref={scrimRef}
        onMouseDown={(e) => { if (e.target === scrimRef.current) onClose(); }}
        aria-hidden={!open}
      >
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal__close" onClick={onClose} aria-label="Close" />
          <div className="modal__emblem"><img src={site.assets.emblem} alt="" /></div>
          <h2 className="modal__title" id="modal-title">Be the first to know</h2>
          <p className="modal__lead">
            Our Debut is coming. We want you to have it before anyone else
          </p>

          <div ref={inputWrapRef}>
            {/* the one live API feature — full state machine */}
            <window.MailingListForm />
          </div>

          <p className="demohint">
            Prototype demo · <code>your@email.com</code> success · <code>dupe@x.com</code> already in · <code>fail@x.com</code> error
          </p>

          <div className="modal__later"><button type="button" onClick={onClose}>Maybe Later, let's check out the site</button></div>
        </div>
      </div>
    );
  }

  window.MailingListModal = MailingListModal;
})();
