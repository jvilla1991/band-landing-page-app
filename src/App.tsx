import { useEffect, useState } from 'react'
import Header, { Page } from './components/Header'
import Footer from './components/Footer'
import SocialDock from './components/SocialDock'
import MailingListModal from './components/MailingListModal'
import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import YourAreaPage from './pages/YourAreaPage'
import { ModalContext } from './context/ModalContext'
import './styles/App.css'

const ML_SEEN_KEY = 'villxin_ml_seen'

/* Hash-based page switch ("#/store" -> store, "#/yourarea..." -> yourarea) —
   plain "#section" hashes stay on home so in-page anchors keep working. */
function getPage(): Page {
  const hash = window.location.hash
  if (hash.startsWith('#/store')) return 'store'
  if (hash.startsWith('#/yourarea')) return 'yourarea'
  return 'home'
}

function App() {
  const [page, setPage] = useState<Page>(getPage)
  const [modalOpen, setModalOpen] = useState(false)

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
    if (page === 'store') {
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

  // greet on entry (once per session)
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(ML_SEEN_KEY) === '1'
    } catch {
      /* storage unavailable */
    }
    if (!seen) {
      const id = setTimeout(() => setModalOpen(true), 1000)
      return () => clearTimeout(id)
    }
  }, [])

  return (
    <ModalContext.Provider value={openModal}>
      <Header page={page} />
      {page === 'store' ? <StorePage /> : page === 'yourarea' ? <YourAreaPage /> : <HomePage />}
      <Footer />

      <SocialDock hidden={modalOpen} />
      <MailingListModal open={modalOpen} onClose={closeModal} />
    </ModalContext.Provider>
  )
}

export default App
