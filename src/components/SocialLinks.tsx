import { config } from '../config/links'
import LinkButton from './LinkButton'

function SocialLinks() {
  const { socialLinks } = config

  return (
    <section className="social-links">
      {socialLinks.map((link, index) => (
        <LinkButton
          key={index}
          href={link.href}
          label={link.label}
          variant="secondary"
        />
      ))}
    </section>
  )
}

export default SocialLinks
