import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { PLATFORM } from '../config/platforms'
import Icon, { IconName } from './Icon'

function SocialDock({ hidden }: { hidden: boolean }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShown(true), 600)
    return () => clearTimeout(id)
  }, [])

  return (
    <nav
      className={'socialdock' + (shown ? ' in' : '') + (hidden ? ' away' : '')}
      aria-label="Social links"
    >
      <span className="socialdock__label">Follow</span>
      <span className="socialdock__row">
        {site.social.map((s) => {
          const meta = PLATFORM[s.id] ?? { label: s.id, icon: 'disc' as IconName }
          const live = Boolean(s.href && s.href.trim())
          const inner = (
            <span className="socialdock__ic">
              <Icon name={meta.icon} />
            </span>
          )
          return live ? (
            <a
              key={s.id}
              className="sdk live"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={meta.label}
            >
              {inner}
            </a>
          ) : (
            <span
              key={s.id}
              className="sdk soon"
              aria-label={`${meta.label} (coming soon)`}
              title={`${meta.label} — coming soon`}
            >
              {inner}
            </span>
          )
        })}
      </span>
    </nav>
  )
}

export default SocialDock
