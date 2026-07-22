import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { useOpenModal } from '../context/ModalContext'
import { useFlags } from '../context/FlagsContext'
import { SiteFlags } from '../config/siteFlags'

export type Page = 'home' | 'store' | 'live' | 'yourarea' | 'admin'

const NAV: { label: string; href: string; page?: Page; flag?: keyof SiteFlags }[] = [
  { label: 'Home', href: '#top' },
  { label: 'Listen', href: '#listen' },
  { label: 'About', href: '#about' },
  { label: 'Store', href: '#/store', page: 'store', flag: 'store' },
  { label: 'Live', href: '#/live', page: 'live', flag: 'live' },
  { label: 'YourArea', href: '#/yourarea', page: 'yourarea', flag: 'yourarea' },
  { label: 'Contact', href: '#contact' },
]

function Header({ page }: { page: Page }) {
  const openModal = useOpenModal()
  const flags = useFlags()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // flag-gated tabs disappear from the nav while toggled off
  const nav = NAV.filter((n) => !n.flag || flags[n.flag])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={'hdr' + (scrolled ? ' scrolled' : '')}>
        <div className="wrap hdr__in">
          <a className="brand" href="#top" aria-label={`${site.artistName} home`}>
            <span className="brand__mark">
              <img src={site.assets.iconMark} alt="" />
            </span>
            <span className="brand__name">{site.artistName}</span>
          </a>
          <nav className="nav" aria-label="Primary">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className={n.page && n.page === page ? 'is-current' : undefined}>
                {n.label}
              </a>
            ))}
            <button className="cta" type="button" onClick={openModal}>
              Mailing List
            </button>
          </nav>
          <button
            className={'burger' + (open ? ' open' : '')}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={'msheet' + (open ? ' open' : '')}>
        {nav.map((n, i) => (
          <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
            <span className="ix">{String(i + 1).padStart(2, '0')}</span>
            {n.label}
          </a>
        ))}
        <button
          onClick={() => {
            setOpen(false)
            openModal()
          }}
        >
          <span className="ix">{String(nav.length + 1).padStart(2, '0')}</span>Mailing List
        </button>
      </div>
    </>
  )
}

export default Header
