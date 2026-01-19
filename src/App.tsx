import Profile from './components/Profile'
import Banner from './components/Banner'
import Footer from './components/Footer'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <Banner />
      <main className="main-content">
        <Profile />
      </main>
      <Footer />
    </div>
  )
}

export default App
