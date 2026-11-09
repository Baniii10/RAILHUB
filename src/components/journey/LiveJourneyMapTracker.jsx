'use client'

import Link from 'next/link'
import { CheckCircle2, Clock3, MapPin, QrCode, Radio, Train, Utensils } from 'lucide-react'
import { formatTime } from '@/lib/utils/formatters'
import LiveJourneyAnimatedHUD from './LiveJourneyAnimatedHUD'

function parseRoute(name = '') {
  const [origin, destination] = name.replace(/\s*\(simulasi\)\s*/i, '').split(/\s+[—–-]\s+/)
  return [origin || 'Stasiun keberangkatan', destination || 'Stasiun tujuan']
}

function buildStops(booking) {
  const schedule = booking?.schedules
  if (!schedule) return []
  const routeStops = schedule?.routes?.route_stops || []
  const departure = new Date(schedule.departure_time)
  if (routeStops.length) return [...routeStops].sort((a, b) => a.stop_order - b.stop_order).map((stop, index, all) => ({
    id: stop.id || `${stop.stop_order}-${stop.stations?.code}`,
    name: stop.stations?.name || 'Stasiun',
    code: stop.stations?.code || '',
    arr: formatTime(new Date(departure.getTime() + (stop.offset_minutes || 0) * 60000).toISOString()),
    dep: formatTime(new Date(departure.getTime() + ((stop.offset_minutes || 0) + 5) * 60000).toISOString()),
    time: formatTime(new Date(departure.getTime() + (stop.offset_minutes || 0) * 60000).toISOString()),
    progress: all.length === 1 ? 100 : Math.round(index * 100 / (all.length - 1)),
  }))

  const [origin, destination] = parseRoute(schedule?.routes?.name)
  return [
    { id: 'origin', name: origin, code: 'GMR', arr: formatTime(schedule?.departure_time), dep: formatTime(schedule?.departure_time), time: formatTime(schedule?.departure_time), progress: 0 },
    { id: 'transit-1', name: 'Stasiun Cirebon', code: 'CN', arr: '10:45', dep: '10:52', time: '10:45', progress: 40 },
    { id: 'transit-2', name: 'Stasiun Purwokerto', code: 'PWT', arr: '12:30', dep: '12:36', time: '12:30', progress: 70 },
    { id: 'destination', name: destination, code: 'YK', arr: formatTime(schedule?.arrival_time), dep: formatTime(schedule?.arrival_time), time: formatTime(schedule?.arrival_time), progress: 100 },
  ]
}

export default function LiveJourneyMapTracker({ booking, ticket, countdown, journeyProgress = 0, onSelectTab }) {
  if (!booking) {
    return <section className="rh-card journey-tracker" aria-labelledby="journey-empty-title">
      <div className="journey-tracker-body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <Train size={38} style={{ margin: '0 auto 0.75rem', color: 'var(--rh-primary)' }} />
        <h2 id="journey-empty-title" className="rh-h3">Belum ada perjalanan aktif</h2>
        <p style={{ color: 'var(--rh-text-2)' }}>Perjalanan akan tampil setelah tiket dibayar dan jadwalnya masih aktif.</p>
        <Link href="/trains" className="rh-btn rh-btn-primary">Cari jadwal kereta</Link>
      </div>
    </section>
  }

  const progress = Math.min(100, Math.max(0, journeyProgress))
  const stops = buildStops(booking)
  const nextStop = stops.find(stop => stop.progress > progress) || stops.at(-1)

  const depTime = booking?.schedules?.departure_time ? new Date(booking.schedules.departure_time).getTime() : 0
  const arrTime = booking?.schedules?.arrival_time ? new Date(booking.schedules.arrival_time).getTime() : 0
  const now = Date.now()
  const isDeparted = Boolean(countdown?.isDeparted || (depTime > 0 && now >= depTime))
  const isCompleted = Boolean(arrTime > 0 && now >= arrTime)

  const countdownLabel = isDeparted
    ? (isCompleted ? 'Perjalanan Selesai' : 'Sedang dalam perjalanan')
    : countdown && typeof countdown === 'object'
      ? `${countdown.hours || 0}j ${countdown.minutes || 0}m ${countdown.seconds || 0}d`
      : countdown || nextStop?.time || 'Sesuai jadwal'

  return (
    <div className="rh-live-tracker-wrapper" style={{ display: 'grid', gap: '1.25rem' }}>
      {/* ── UPGRADED LIVE JOURNEY ANIMATED HUD WITH REALTIME SPEEDOMETER & COUNTDOWN ── */}
      <LiveJourneyAnimatedHUD
        trainName={booking.schedules?.trains?.name || 'KA Argo Bromo Anggrek'}
        routeTitle={booking.schedules?.routes?.name || 'Gambir (GMR) — Yogyakarta (YK)'}
        stops={stops}
        countdown={countdown}
        isDeparted={isDeparted}
        isCompleted={isCompleted}
        departureTime={booking.schedules?.departure_time}
        arrivalTime={booking.schedules?.arrival_time}
      />

      {/* ── PASSENGER QUICK ACTIONS & SEAT DETAILS ── */}
      <div className="rh-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <strong style={{ fontSize: '0.92rem', color: 'var(--rh-navy)' }}>Layanan Cepat Penumpang</strong>
          {ticket && (
            <div style={{ padding: '0.25rem 0.65rem', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--rh-primary)', fontWeight: 700 }}>
                Kursi {ticket.seats?.seat_number || '-'} · Gerbong {ticket.seats?.carriages?.carriage_number || '-'}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
          <button
            type="button"
            className="rh-action-tile"
            onClick={() => onSelectTab?.('services')}
            title="Pesan Makanan"
          >
            <div className="rh-action-tile-icon" style={{ background: 'rgba(26, 66, 138, 0.08)', color: 'var(--rh-primary)' }}>
              <Utensils size={20} />
            </div>
            <span className="rh-action-tile-label">Pesan Makanan</span>
          </button>

          <button
            type="button"
            className="rh-action-tile"
            onClick={() => onSelectTab?.('tickets')}
            title="E-Boarding Pass"
          >
            <div className="rh-action-tile-icon" style={{ background: 'rgba(5, 150, 105, 0.08)', color: 'var(--rh-success)' }}>
              <QrCode size={20} />
            </div>
            <span className="rh-action-tile-label">E-Boarding Pass</span>
          </button>

          {booking?.id ? (
            <Link
              href={`/booking/payment/${booking.id}`}
              className="rh-action-tile"
              title="Detail Pesanan"
            >
              <div className="rh-action-tile-icon" style={{ background: 'rgba(234, 88, 12, 0.08)', color: 'var(--rh-orange)' }}>
                <Train size={20} />
              </div>
              <span className="rh-action-tile-label">Detail Pesanan</span>
            </Link>
          ) : (
            <button
              type="button"
              className="rh-action-tile"
              onClick={() => onSelectTab?.('tickets')}
              title="Detail Pesanan"
            >
              <div className="rh-action-tile-icon" style={{ background: 'rgba(234, 88, 12, 0.08)', color: 'var(--rh-orange)' }}>
                <Train size={20} />
              </div>
              <span className="rh-action-tile-label">Detail Pesanan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
