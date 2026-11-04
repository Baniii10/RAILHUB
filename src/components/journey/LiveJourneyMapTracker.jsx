'use client'

import Link from 'next/link'
import { CheckCircle2, Clock3, MapPin, QrCode, Radio, Train, Utensils } from 'lucide-react'
import { formatTime } from '@/lib/utils/formatters'

function parseRoute(name = '') {
  const [origin, destination] = name.replace(/\s*\(simulasi\)\s*/i, '').split(/\s+[—–-]\s+/)
  return [origin || 'Stasiun keberangkatan', destination || 'Stasiun tujuan']
}

function buildStops(booking) {
  const schedule = booking?.schedules
  const routeStops = schedule?.routes?.route_stops || []
  const departure = new Date(schedule?.departure_time || '2026-01-01T00:00:00+07:00')
  if (routeStops.length) return [...routeStops].sort((a, b) => a.stop_order - b.stop_order).map((stop, index, all) => ({
    id: stop.id || `${stop.stop_order}-${stop.stations?.code}`,
    name: stop.stations?.name || 'Stasiun',
    code: stop.stations?.code || '',
    time: formatTime(new Date(departure.getTime() + (stop.offset_minutes || 0) * 60000).toISOString()),
    progress: all.length === 1 ? 100 : Math.round(index * 100 / (all.length - 1)),
  }))

  const [origin, destination] = parseRoute(schedule?.routes?.name)
  return [
    { id: 'origin', name: origin, time: formatTime(schedule?.departure_time), progress: 0 },
    { id: 'destination', name: destination, time: formatTime(schedule?.arrival_time), progress: 100 },
  ]
}

export default function LiveJourneyMapTracker({ booking, ticket, countdown, journeyProgress = 0, onSelectTab }) {
  const progress = Math.min(100, Math.max(0, booking ? journeyProgress : 42))
  const stops = buildStops(booking)
  const nextStop = stops.find(stop => stop.progress > progress) || stops.at(-1)

  return <section className="rh-card journey-tracker" aria-labelledby="journey-tracker-title">
    <div className="journey-tracker-media">
      <video autoPlay muted loop playsInline preload="metadata" aria-label="Animasi kereta RAILHUB sedang berjalan">
        <source src="/videos/train-journey.mp4" type="video/mp4" />
      </video>
      <div className="journey-tracker-media-copy">
        <span><Radio size={14} /> Live perjalanan</span>
        <h2 id="journey-tracker-title">{booking?.schedules?.trains?.name || 'RAILHUB Express'}</h2>
        <p>{booking?.schedules?.routes?.name || 'Gambir — Bandung'}</p>
      </div>
    </div>

    <div className="journey-tracker-body">
      <div className="journey-tracker-summary">
        <div><small>Posisi perjalanan</small><strong>{Math.round(progress)}%</strong></div>
        <div><small>Berikutnya</small><strong>{nextStop?.name}</strong></div>
        <div><small>Estimasi</small><strong>{countdown || nextStop?.time || 'Sesuai jadwal'}</strong></div>
      </div>
      <div className="journey-progress" role="progressbar" aria-label="Progres perjalanan" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${progress}%` }} /></div>
      <ol className="journey-stops" aria-label="Semua pemberhentian">
        {stops.map(stop => {
          const passed = progress >= stop.progress
          const current = nextStop?.id === stop.id
          return <li key={stop.id} className={passed ? 'is-passed' : current ? 'is-current' : ''}>
            <span className="journey-stop-marker">{passed ? <CheckCircle2 size={18} /> : <MapPin size={18} />}</span>
            <div><strong>{stop.name}</strong>{stop.code && <small>{stop.code}</small>}</div>
            <time><Clock3 size={14} /> {stop.time || '—'} WIB</time>
          </li>
        })}
      </ol>
      <div className="journey-actions">
        <button type="button" className="rh-btn rh-btn-primary" onClick={() => onSelectTab?.('services')}><Utensils size={16} /> Pesan makanan</button>
        <button type="button" className="rh-btn rh-btn-ghost" onClick={() => onSelectTab?.('tickets')}><QrCode size={16} /> Tiket digital</button>
        {booking?.id && <Link href={`/booking/payment/${booking.id}`} className="rh-btn rh-btn-ghost"><Train size={16} /> Detail perjalanan</Link>}
      </div>
      {ticket && <p className="journey-seat">Kursi <strong>{ticket.seats?.seat_number || '—'}</strong> · Gerbong <strong>{ticket.seats?.carriages?.carriage_number || '—'}</strong></p>}
    </div>
  </section>
}
