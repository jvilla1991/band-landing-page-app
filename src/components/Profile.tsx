import { config } from '../config/links'
import MusicPlayer from './MusicPlayer'

function Profile() {
  const { artistName, music, assets } = config

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
      <MusicPlayer title={music.title} tracks={music.tracks} />
    </section>
  )
}

export default Profile
