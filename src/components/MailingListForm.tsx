import { useRef, useState, FormEvent } from 'react'
import { API_BASE } from '../config/api'
import Icon from './Icon'

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

// syntactic email check (client-side gate before submit)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function subscribeRequest(email: string): Promise<number> {
  const res = await fetch(`${API_BASE}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return res.status
}

function MailingListForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [fieldErr, setFieldErr] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const busy = status === 'loading'
  const done = status === 'success' || status === 'duplicate'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const val = email.trim()
    if (!val) {
      setFieldErr('Enter your email to join.')
      inputRef.current?.focus()
      return
    }
    if (!EMAIL_RE.test(val)) {
      setFieldErr("That email doesn't look right.")
      inputRef.current?.focus()
      return
    }

    setFieldErr('')
    setStatus('loading')
    try {
      const code = await subscribeRequest(val)
      if (code >= 200 && code < 300) {
        setStatus('success')
      } else if (code === 409) {
        setStatus('duplicate')
      } else if (code === 400) {
        setStatus('idle')
        setFieldErr("That email doesn't look right.")
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setEmail('')
    setFieldErr('')
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  // success / duplicate takeover
  if (done) {
    const dup = status === 'duplicate'
    return (
      <div className={'mlresult' + (dup ? ' dup' : '')}>
        <div className="mlresult__ic">
          <div style={{ width: 26, height: 26 }}>
            <Icon name={dup ? 'info' : 'check'} />
          </div>
        </div>
        <div className="mlresult__h">{dup ? 'Already on the list' : "You're on the list"}</div>
        <p className="mlresult__p">
          {dup
            ? "This email is already subscribed — you won't miss the first release."
            : "We'll only email when there's something real: the first release, and nothing else."}
        </p>
        <button type="button" className="btn btn--ghost mlresult__redo" onClick={reset}>
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form className={'mlform' + (fieldErr ? ' invalid' : '')} onSubmit={onSubmit} noValidate>
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
            aria-invalid={Boolean(fieldErr)}
            aria-describedby="ml-msg"
            value={email}
            disabled={busy}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErr) setFieldErr('')
              if (status === 'error') setStatus('idle')
            }}
          />
        </div>
        <button type="submit" className="btn btn--primary mlform__submit" disabled={busy}>
          {busy ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <>
              Join
              <span className="arr" style={{ width: 16, height: 16, display: 'inline-block' }}>
                <Icon name="arrow" />
              </span>
            </>
          )}
        </button>
      </div>

      <div className="mlmsg" id="ml-msg" role="status" aria-live="polite">
        {fieldErr && (
          <span className="mlmsg is-field">
            <span className="dot" />
            {fieldErr}
          </span>
        )}
        {status === 'error' && !fieldErr && (
          <span className="mlmsg is-err">
            <span className="dot" />
            Something went wrong — try again.
          </span>
        )}
      </div>
    </form>
  )
}

export default MailingListForm
