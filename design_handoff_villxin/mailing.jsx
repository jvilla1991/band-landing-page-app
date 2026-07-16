/* ============================================================
   villxin — MailingListForm
   THE ONLY COMPONENT THAT TALKS TO THE BACKEND.
   POST /api/subscribe  { email }  ->  200 Subscribed | 409 dup | 400 invalid | 5xx
   --------------------------------------------------------------
   In the real app the base URL is `import.meta.env.VITE_API_URL ?? ''`.
   This prototype has no backend, so subscribeRequest() falls back to a MOCK
   that maps the typed email to each state so you can demo the full machine:
       contains "dupe"  -> 409 duplicate
       contains "fail"  -> network/5xx error
       anything else    -> 200 success
   Swap the mock block for the real fetch (already written below) on deploy.
   ============================================================ */
(function () {
  const { useState, useRef } = React;
  const Icon = window.Icon;

  // syntactic email check (client-side gate before submit)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // In the real app: const API = import.meta.env.VITE_API_URL ?? '';
  const API = (window.__API_URL__ ?? "");

  async function subscribeRequest(email) {
    /* ---- REAL CALL (uncomment on deploy) ----
    const res = await fetch(`${API}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
    ------------------------------------------- */

    // ---- PROTOTYPE MOCK (remove on deploy) ----
    await new Promise((r) => setTimeout(r, 1100)); // simulate latency
    const e = email.toLowerCase();
    if (e.includes("fail") || e.includes("error"))
      throw new Error("network"); // simulate network/5xx
    if (e.includes("dupe") || e.includes("already"))
      return { status: 409, body: { error: "Already subscribed" } };
    return { status: 200, body: { message: "Subscribed!" } };
  }

  function MailingListForm() {
    const [email, setEmail] = useState("");
    const [state, setState] = useState("idle"); // idle | loading | success | duplicate | error
    const [fieldErr, setFieldErr] = useState("");
    const inputRef = useRef(null);

    const busy = state === "loading";
    const done = state === "success" || state === "duplicate";

    async function onSubmit(e) {
      e.preventDefault();
      const val = email.trim();
      // client-side validation (400 avoidance)
      if (!val) { setFieldErr("Enter your email to join."); inputRef.current?.focus(); return; }
      if (!EMAIL_RE.test(val)) { setFieldErr("That email doesn't look right."); inputRef.current?.focus(); return; }

      setFieldErr("");
      setState("loading");
      try {
        const { status } = await subscribeRequest(val);
        if (status === 200) setState("success");
        else if (status === 409) setState("duplicate");
        else if (status === 400) { setState("idle"); setFieldErr("That email doesn't look right."); }
        else setState("error");
      } catch {
        setState("error"); // network / 5xx
      }
    }

    function reset() {
      setState("idle"); setEmail(""); setFieldErr("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }

    // success / duplicate takeover
    if (done) {
      const dup = state === "duplicate";
      return (
        <div className={"mlresult" + (dup ? " dup" : "")}>
          <div className="mlresult__ic">
            <div style={{ width: 26, height: 26 }}>
              <Icon name={dup ? "info" : "check"} />
            </div>
          </div>
          <div className="mlresult__h">{dup ? "Already on the list" : "You're on the list"}</div>
          <p className="mlresult__p">
            {dup
              ? "This email is already subscribed — you won't miss the first release."
              : "We'll only email when there's something real: the first release, and nothing else."}
          </p>
          <button type="button" className="btn btn--ghost mlresult__redo" onClick={reset}>
            Use a different email
          </button>
        </div>
      );
    }

    return (
      <form className={"mlform" + (fieldErr ? " invalid" : "")} onSubmit={onSubmit} noValidate>
        <div className="mlform__row">
          <div className="mlfield">
            <label htmlFor="ml-email">Email address</label>
            <input
              id="ml-email"
              ref={inputRef}
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              aria-label="Email address"
              aria-invalid={!!fieldErr}
              aria-describedby="ml-msg"
              value={email}
              disabled={busy}
              onChange={(e) => { setEmail(e.target.value); if (fieldErr) setFieldErr(""); if (state === "error") setState("idle"); }}
            />
          </div>
          <button type="submit" className="btn btn--primary mlform__submit" disabled={busy}>
            {busy ? <span className="spinner" aria-hidden="true" /> : <>Join<span className="arr" style={{ width: 16, height: 16, display: "inline-block" }}><Icon name="arrow" /></span></>}
          </button>
        </div>

        <div className="mlmsg" id="ml-msg" role="status" aria-live="polite">
          {fieldErr && <span className="mlmsg is-field"><span className="dot" />{fieldErr}</span>}
          {state === "error" && !fieldErr && (
            <span className="mlmsg is-err"><span className="dot" />Something went wrong — try again.</span>
          )}
        </div>
      </form>
    );
  }

  window.MailingListForm = MailingListForm;
})();
