import { config } from '../config/links'
import LinkButton from './LinkButton'

function Profile() {
  const { artistName, primaryCTA, website, assets } = config

  return (
    <section className="profile">
      <div className="logo-container">
        <img
          src={assets.logo}
          alt={`${artistName} logo`}
          className="logo-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM4ODg4ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
      </div>
      <LinkButton
        href={primaryCTA.href}
        label={primaryCTA.label}
        variant="primary"
      />
      <div className="website-button-wrapper">
        <LinkButton
          href={website.href}
          label={website.label}
          variant="secondary"
          disabled={website.disabled}
        >
          <span className="link-button-main">{website.label}</span>
          <span className="link-button-subtext">Coming Soon</span>
        </LinkButton>
      </div>
    </section>
  )
}

export default Profile
