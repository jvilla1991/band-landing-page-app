import { site } from '../config/site'
import useReveal from '../hooks/useReveal'
import Hero from '../components/Hero'
import VideoEmbed from '../components/VideoEmbed'
import ReleaseBand from '../components/ReleaseBand'
import DemoPlayer from '../components/DemoPlayer'
import LinksGrid from '../components/LinksGrid'
import AboutEPK from '../components/AboutEPK'
import Contact from '../components/Contact'

function Listen() {
  const ref = useReveal()
  return (
    <section className="section" id="listen">
      <div className="wrap reveal" ref={ref}>
        <span className="eyebrow">Listen</span>
        <h2 className="section-title">Demos</h2>
        <DemoPlayer tracks={site.tracks} />
        <LinksGrid title="Where to listen" items={site.streaming} kind="stream" action="Listen" />
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <main>
      <Hero />
      <VideoEmbed />
      <ReleaseBand />
      <Listen />
      <AboutEPK />
      <Contact />
    </main>
  )
}

export default HomePage
