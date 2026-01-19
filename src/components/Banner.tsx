import { config } from '../config/links'

function Banner() {
  const { assets } = config

  return (
    <header className="banner">
      <img
        src={assets.banner}
        alt="Vxllain"
        className="banner-image"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
    </header>
  )
}

export default Banner
