import { config } from '../config/links'
import SocialIcon from './SocialIcon'

function Footer() {
  const { socialLinks } = config

  const shouldUseWhiteOnHover = (platform: string): boolean => {
    return platform === 'Twitter' || platform === 'X' || platform === 'TikTok'
  }

  return (
    <footer className="footer">
      <div className="footer-socials">
        {socialLinks.map((link, index) => {
          const useWhiteOnHover = shouldUseWhiteOnHover(link.label)
          return (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`footer-social-link${useWhiteOnHover ? ' white-icon' : ''}`}
              aria-label={link.status || link.label}
              title={link.status || link.label}
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
