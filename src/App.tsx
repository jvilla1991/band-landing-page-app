import { useEffect, useState } from 'react'
import Header, { Page } from './components/Header'
import Footer from './components/Footer'
import SocialDock from './components/SocialDock'
import MailingListModal from './components/MailingListModal'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import LivePage from './pages/LivePage'
import YourAreaPage from './pages/YourAreaPage'
import AdminPage from './pages/AdminPage'
import UnderConstructionPage from './pages/UnderConstructionPage'
import { ModalContext } from './context/ModalContext'
import { FlagsContext, useFlags } from './context/FlagsContext'
import { SiteFlags, cachedFlags, fetchFlags } from './config/siteFlags'
import './styles/App.css'

const ML_SEEN_KEY = 'villxin_ml_seen'

/* Hash-based page switch ("#/store" -> store, "#/yourarea..." -> yourarea) —
   plain "#section" hashes stay on home so in-page anchors keep working. */
function getPage(): Page {
  const hash = window.location.hash
  if (hash.startsWith('#/store')) return 'store'
  if (hash.startsWith('#/live')) return 'live'
  if (hash.startsWith('#/yourarea')) return 'yourarea'
  if (hash.startsWith('#/admin')) return 'admin'
  return 'home'
}

/* Flag-gated routing: a toggled-off page renders Under Construction instead.
   #/admin is deliberately never gated — it's how pages get turned back on. */
function CurrentPage({ page }: { page: Page }) {
  const flags = useFlags()
  switch (page) {
    case 'store':
      return flags.store ? <StorePage /> : <UnderConstructionPage title="The store" />
    case 'live':
      return flags.live ? <LivePage /> : <UnderConstructionPage title="Live" />
    case 'yourarea':
      return flags.yourarea ? <YourAreaPage /> : <UnderConstructionPage title="YourArea" />
    case 'admin':
      return <AdminPage />
    default:
      return <HomePage />
  }
}

function App() {
  const [page, setPage] = useState<Page>(getPage)
  const [modalOpen, setModalOpen] = useState(false)

  // flags render from last-known state immediately, then refresh from the API;
  // a dead API keeps the cached/default nav rather than blanking tabs
  const [flags, setFlags] = useState<SiteFlags>(cachedFlags)
  useEffect(() => {
    let cancelled = false
    fetchFlags()
      .then((fresh) => {
        if (!cancelled) setFlags(fresh)
      })
      .catch(() => {
        /* keep last-known/default flags */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const openModal = () => setModalOpen(true)
  const closeModal = () => {
    setModalOpen(false)
    try {
      sessionStorage.setItem(ML_SEEN_KEY, '1')
    } catch {
      /* storage unavailable */
    }
  }

  useEffect(() => {
    const onHashChange = () => setPage(getPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // after a page switch, land on the right spot: top of the store, or the
  // anchored section on home (the element didn't exist until this render)
  useEffect(() => {
    if (page === 'store' || page === 'live' || page === 'admin') {
      window.scrollTo(0, 0)
      return
    }
    // yourarea lands itself (top of profile/inbox, or its signup strip)
    if (page === 'yourarea') return
    const id = window.location.hash.slice(1)
    if (id && !id.startsWith('/')) {
      document.getElementById(id)?.scrollIntoView()
    }
  }, [page])

  // greet on entry (once per session; never over the admin console)
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(ML_SEEN_KEY) === '1'
    } catch {
      /* storage unavailable */
    }
    if (!seen && getPage() !== 'admin') {
      const id = setTimeout(() => setModalOpen(true), 1000)
      return () => clearTimeout(id)
    }
  }, [])

  return (
    <FlagsContext.Provider value={flags}>
      <ModalContext.Provider value={openModal}>
        <Header page={page} />
        <CurrentPage page={page} />
        <Footer />

        <SocialDock hidden={modalOpen} />
        <MailingListModal open={modalOpen} onClose={closeModal} />
      </ModalContext.Provider>
    </FlagsContext.Provider>
  )
}

export default App
