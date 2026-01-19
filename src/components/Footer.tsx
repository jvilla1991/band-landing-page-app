import { config } from '../config/links'
import SocialIcon from './SocialIcon'

function Footer() {
  const { socialLinks } = config

  const getBrandColor = (platform: string): string => {
    const colorMap: Record<string, string> = {
      Instagram: '#E4405F',
      Twitter: '#ffffff',
      X: '#ffffff',
      YouTube: '#FF0000',
      TikTok: '#ffffff',
      Facebook: '#1877F2',
      Discord: '#5865F2',
      Spotify: '#1DB954',
      SoundCloud: '#FF5500',
    }
    return colorMap[platform] || '#ffffff'
  }

  const shouldUseWhiteOnHover = (platform: string): boolean => {
    return platform === 'Twitter' || platform === 'X' || platform === 'TikTok'
  }

  return (
    <footer className="footer">
      <div className="footer-socials">
        {socialLinks.map((link, index) => {
          const brandColor = getBrandColor(link.label)
          const useWhiteOnHover = shouldUseWhiteOnHover(link.label)
          return (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`footer-social-link ${useWhiteOnHover ? 'white-icon' : ''}`}
              aria-label={link.status || link.label}
              title={link.status || link.label}
              style={{ '--brand-color': brandColor } as React.CSSProperties}
            >
              <SocialIcon platform={link.label} />
            </a>
          )
        })}
      </div>
    </footer>
  )
}

export default Footer
