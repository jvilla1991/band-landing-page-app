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
          <div className="modal__eyebrow">Before you go in</div>
          <h2 className="modal__title" id="modal-title">First to hear it</h2>
          <p className="modal__lead">
            villxin's debut is coming. One email when it lands — the release, the moment it's out. No noise, ever.
          </p>

          <div ref={inputWrapRef}>
            {/* the one live API feature — full state machine */}
            <window.MailingListForm />
          </div>

          <p className="demohint">
            Prototype demo · <code>you@email.com</code> success · <code>dupe@x.com</code> already in · <code>fail@x.com</code> error
          </p>

          <div className="modal__later"><button type="button" onClick={onClose}>No thanks — take me in</button></div>
        </div>
      </div>
    );
  }

  window.MailingListModal = MailingListModal;
})();
