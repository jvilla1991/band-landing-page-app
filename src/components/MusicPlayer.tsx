import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { MusicTrack } from '../config/links'

interface MusicPlayerProps {
  title: string
  tracks: MusicTrack[]
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function MusicPlayer({ title, tracks }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const hasTracks = tracks.length > 0
  const currentTrack = useMemo(
    () => (hasTracks ? tracks[currentTrackIndex] : null),
    [hasTracks, tracks, currentTrackIndex],
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false)
        setErrorMessage('Unable to play this track. Check the audio file path.')
      })
      return
    }

    audio.pause()
  }, [isPlaying, currentTrackIndex])

  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
    setErrorMessage('')
  }, [currentTrackIndex])

  const handlePlayPause = () => {
    if (!hasTracks) {
      return
    }

    setIsPlaying((prev) => !prev)
  }

  const goToNextTrack = () => {
    if (!hasTracks) {
      return
    }

    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
    setIsPlaying(true)
  }

  const goToPreviousTrack = () => {
    if (!hasTracks) {
      return
    }

    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    setIsPlaying(true)
  }

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    const nextTime = Number(event.target.value)
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handleTrackEnd = () => {
    goToNextTrack()
  }

  const handleTrackSelect = (trackIndex: number) => {
    setCurrentTrackIndex(trackIndex)
    setIsPlaying(true)
  }

  return (
    <section className="music-player" aria-label="Music player">
      <p className="music-player-title">{title}</p>
      <p className="music-player-track-name">
        {currentTrack ? currentTrack.title : 'No tracks available'}
      </p>

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={handleTrackEnd}
        onError={() => {
          setIsPlaying(false)
          setErrorMessage('Unable to load this track. Check the audio file path.')
        }}
      />

      <div className="music-player-controls">
        <button
          type="button"
          className="music-player-button"
          onClick={goToPreviousTrack}
          disabled={!hasTracks}
        >
          Prev
        </button>
        <button
          type="button"
          className="music-player-button music-player-button--primary"
          onClick={handlePlayPause}
          disabled={!hasTracks}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="music-player-button"
          onClick={goToNextTrack}
          disabled={!hasTracks}
        >
          Next
        </button>
      </div>

      <div className="music-player-progress">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={!hasTracks || duration === 0}
          aria-label="Seek track position"
        />
        <div className="music-player-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {hasTracks ? (
        <ol className="music-player-playlist" aria-label="Playlist">
          {tracks.map((track, index) => {
            const isActive = index === currentTrackIndex
            return (
              <li key={track.src} className="music-player-playlist-item">
                <button
                  type="button"
                  className={`music-player-playlist-button${isActive ? ' music-player-playlist-button--active' : ''}`}
                  onClick={() => handleTrackSelect(index)}
                >
                  <span className="music-player-playlist-index">{index + 1}.</span>
                  <span className="music-player-playlist-title">{track.title}</span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : null}

      {errorMessage ? <p className="music-player-error">{errorMessage}</p> : null}
    </section>
  )
}

export default MusicPlayer
