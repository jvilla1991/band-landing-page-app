import { useEffect, useState } from 'react'
import { Show, fetchShows } from '../config/siteFlags'
import { useOpenModal } from '../context/ModalContext'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/* "2026-08-14" -> parts for the date block. Parsed by hand: new Date(iso)
   treats a bare date as UTC midnight, which shifts it a day in US timezones. */
function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { day: String(d).padStart(2, '0'), month: MONTHS[(m ?? 1) - 1] ?? '', year: String(y) }
}

function ShowRow({ show }: { show: Show }) {
  const { day, month, year } = dateParts(show.showDate)
  const cancelled = show.status === 'CANCELLED'
  const soldOut = show.status === 'SOLD_OUT'
  return (
    <li className={'showrow' + (cancelled ? ' cancelled' : '')}>
      <div className="showrow__date" aria-hidden="true">
        <span className="d">{day}</span>
        <span className="m">
          {month} {year}
        </span>
      </div>
      <div className="showrow__what">
        <b>{show.venue}</b>
        <span className="showrow__city">{show.city}</span>
        {show.note && <span className="showrow__note">{show.note}</span>}
      </div>
      <div className="showrow__cta">
        {cancelled ? (
          <span className="showrow__badge">Cancelled</span>
        ) : soldOut ? (
          <span className="showrow__badge sold">Sold out</span>
        ) : show.ticketUrl ? (
          <a className="btn btn--primary" href={show.ticketUrl} target="_blank" rel="noopener noreferrer">
            Tickets
          </a>
        ) : (
          <span className="showrow__badge">Details soon</span>
        )}
      </div>
    </li>
  )
}

function LivePage() {
  const openModal = useOpenModal()
  const [shows, setShows] = useState<Show[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchShows()
      .then(setShows)
      .catch(() => setFailed(true))
  }, [])

  return (
    <main className="livepage">
      <section className="live__hero">
        <div className="wrap">
          <div className="live__eyebrow">Live</div>
          <h1 className="live__title">Shows</h1>
        </div>
      </section>
      <section className="wrap live__body">
        {failed ? (
          <p className="live__empty">Couldn&apos;t load shows right now — try again in a minute.</p>
        ) : shows === null ? (
          <p className="live__empty">Loading…</p>
        ) : shows.length === 0 ? (
          <div className="live__none">
            <p className="live__empty">No shows announced yet.</p>
            <p className="live__sub">Mailing list hears about dates first.</p>
            <button className="btn btn--primary" type="button" onClick={openModal}>
              Join the mailing list
            </button>
          </div>
        ) : (
          <ul className="live__list">
            {shows.map((s) => (
              <ShowRow key={s.id} show={s} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default LivePage
