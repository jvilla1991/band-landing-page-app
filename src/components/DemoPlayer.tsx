import { useRef, useState } from 'react'
import type { Track } from '../config/site'
import Icon from './Icon'

function fmt(t: number): string {
  if (!Number.isFinite(t) || t < 0) return '–:––'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function DemoPlayer({ tracks }: { tracks: Track[] }) {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState(0)
  const [durations, setDurations] = useState<Record<number, number>>({})

  const toggle = (i: number) => {
    const audio = audioRefs.current[i]
    if (!audio) return
    if (active === i) {
      audio.pause()
      setActive(-1)
      return
    }
    // pause whichever track is currently playing
    audioRefs.current.forEach((a, j) => {
      if (a && j !== i) a.pause()
    })
    setPos(audio.currentTime)
    setActive(i)
    void audio.play().catch(() => setActive(-1))
  }

  return (
    <div className="player">
      {tracks.map((t, i) => {
        const playing = active === i
        const dur = durations[i] ?? 0
        const pct = playing && dur > 0 ? (pos / dur) * 100 : 0
        return (
          <div key={t.title} className={'track' + (playing ? ' playing' : '')}>
            <audio
              ref={(el) => {
                audioRefs.current[i] = el
              }}
              src={t.src}
              preload="metadata"
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration
                setDurations((prev) => ({ ...prev, [i]: d }))
              }}
              onTimeUpdate={(e) => {
                if (active === i) setPos(e.currentTarget.currentTime)
              }}
              onEnded={() => {
                setActive(-1)
                setPos(0)
              }}
            />
            <button
              className="track__btn"
              onClick={() => toggle(i)}
              aria-label={(playing ? 'Pause ' : 'Play ') + t.title}
            >
              <span style={{ width: 20, height: 20 }}>
                <Icon name={playing ? 'pause' : 'play'} />
              </span>
            </button>
            <div className="track__main">
              <div className="track__name">
                <b>{t.title}</b>
              </div>
              <div className="track__sub">{t.note}</div>
              <div className="track__bar">
                <div className="track__fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="track__time">{playing ? fmt(pos) : fmt(dur)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default DemoPlayer
