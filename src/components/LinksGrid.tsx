import type { LinkItem } from '../config/site'
import { PLATFORM } from '../config/platforms'
import Icon, { IconName } from './Icon'

/* placeholder-aware link tile: live href -> clickable; empty -> "soon" */
function LinkTile({ item, action }: { item: LinkItem; action: string }) {
  const meta = PLATFORM[item.id] ?? { label: item.label, icon: 'disc' as IconName }
  const live = Boolean(item.href && item.href.trim())
  const inner = (
    <>
      <span className="lnk__ic">
        <span style={{ width: '100%', height: '100%', display: 'block' }}>
          <Icon name={meta.icon} />
        </span>
      </span>
      <span className="lnk__tx">
        <b>{item.label || meta.label}</b>
        {live && <small>{action}</small>}
      </span>
      {live && (
        <span className="lnk__arr" style={{ width: 16, height: 16 }}>
          <Icon name="arrow" />
        </span>
      )}
    </>
  )
  if (live) {
    return (
      <a className="lnk live" href={item.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }
  return (
    <div className="lnk soon" aria-disabled="true" title="Coming soon">
      {inner}
    </div>
  )
}

interface LinksGridProps {
  title: string
  items: LinkItem[]
  kind: 'stream' | 'social'
  action: string
}

function LinksGrid({ title, items, kind, action }: LinksGridProps) {
  return (
    <div className="links-block">
      <div className="links-head">
        <h3>{title}</h3>
      </div>
      <div className={`lgrid lgrid--${kind}`}>
        {items.map((it) => (
          <LinkTile key={it.id} item={it} action={action} />
        ))}
      </div>
    </div>
  )
}

export default LinksGrid
