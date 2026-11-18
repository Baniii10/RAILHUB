'use client'

import Link from 'next/link'
import { ArrowRight, Headphones, MapPin, Plug, QrCode, TicketCheck, Train, UtensilsCrossed, Wifi, Wind } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import LiveJourneyAnimatedHUD from './LiveJourneyAnimatedHUD'
import JourneyPromoBanner from './JourneyPromoBanner'

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

export default function LiveJourneyMapTracker({ booking, ticket, countdown, journeyProgress = 0, onSelectTab, otherBookings = [] }) {
  if (!booking) {
    return <section className="rh-card journey-tracker" aria-labelledby="journey-empty-title">
      <div className="journey-tracker-body" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <Train size={38} style={{ margin: '0 auto 0.75rem', color: 'var(--rh-primary)' }} />
        <h2 id="journey-empty-title" className="rh-h3">Belum ada perjalanan aktif</h2>
        <p style={{ color: 'var(--rh-text-2)' }}>Perjalanan akan tampil setelah tiket dibayar dan jadwalnya masih aktif.</p>
        <Link href="/trains" className="rh-btn rh-btn-primary">Cari jadwal kereta</Link>
        {onSelectTab && (
          <div style={{ marginTop: '0.85rem' }}>
            <button
              type="button"
              onClick={() => onSelectTab('tickets')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: 'var(--rh-text-3)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                cursor: 'pointer',
              }}
            >
              Riwayat pembelian
            </button>
          </div>
        )}
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
    <div className="rh-live-tracker-wrapper rh-live-tracker-split">
      {/* ── LEFT: LIVE JOURNEY ANIMATED HUD (REMOTION STATION & TRAIN) ── */}
      <div className="rh-live-tracker-hud-col">
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
      </div>

      {/* ── RIGHT: PASSENGER QUICK ACTIONS (2x2 GRID, 4 POLISHED TILES) ── */}
      <div className="rh-card rh-live-tracker-actions-col" style={{ padding: '1.1rem 1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <strong style={{ fontSize: '0.95rem', color: 'var(--rh-navy)', fontWeight: 800 }}>Layanan Cepat</strong>
          {ticket && (
            <div style={{ padding: '0.22rem 0.6rem', background: '#eff6ff', borderRadius: 999, border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--rh-primary)', fontWeight: 700 }}>
                Kursi {ticket.seats?.seat_number || '-'} · G{ticket.seats?.carriages?.carriage_number || '-'}
              </span>
            </div>
          )}
        </div>

        <div className="rh-quick-actions-grid-2x2">
          <button
            type="button"
            className="rh-action-tile-v2"
            onClick={() => onSelectTab?.('services')}
            title="Pesan Makanan"
          >
            <div className="rh-action-tile-v2-icon is-amber">
              <UtensilsCrossed size={20} strokeWidth={2.2} />
            </div>
            <div className="rh-action-tile-v2-text">
              <strong>Pesan Makanan</strong>
              <span>Restorasi kereta</span>
            </div>
          </button>

          <button
            type="button"
            className="rh-action-tile-v2"
            onClick={() => onSelectTab?.('tickets')}
            title="E-Boarding Pass"
          >
            <div className="rh-action-tile-v2-icon is-emerald">
              <QrCode size={20} strokeWidth={2.2} />
            </div>
            <div className="rh-action-tile-v2-text">
              <strong>E-Boarding Pass</strong>
              <span>QR gate masuk</span>
            </div>
          </button>

          {booking?.id ? (
            <Link
              href={`/booking/payment/${booking?.id}`}
              className="rh-action-tile-v2"
              title="Detail Pesanan"
            >
              <div className="rh-action-tile-v2-icon is-blue">
                <TicketCheck size={20} strokeWidth={2.2} />
              </div>
              <div className="rh-action-tile-v2-text">
                <strong>Detail Pesanan</strong>
                <span>Info & kursi</span>
              </div>
            </Link>
          ) : (
            <button
              type="button"
              className="rh-action-tile-v2"
              onClick={() => onSelectTab?.('tickets')}
              title="Detail Pesanan"
            >
              <div className="rh-action-tile-v2-icon is-blue">
                <TicketCheck size={20} strokeWidth={2.2} />
              </div>
              <div className="rh-action-tile-v2-text">
                <strong>Detail Pesanan</strong>
                <span>Info & kursi</span>
              </div>
            </button>
          )}

          <button
            type="button"
            className="rh-action-tile-v2"
            onClick={() => onSelectTab?.('reports')}
            title="Bantuan & Laporan Perjalanan"
          >
            <div className="rh-action-tile-v2-icon is-violet">
              <Headphones size={20} strokeWidth={2.2} />
            </div>
            <div className="rh-action-tile-v2-text">
              <strong>Bantuan</strong>
              <span>Laporan perjalanan</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── MINIMALIST JOURNEY DETAILS (Tanpa box bertumpuk, hairline dividers) ── */}
      <div className="rh-journey-minimal-details">
        {/* 1. Info Peron & Boarding Strip */}
        <div className="rh-journey-strip-row">
          <div className="rh-journey-strip-items">
            <span>
              <small>Peron</small>
              <strong>Peron {((ticket?.seats?.carriages?.carriage_number || 1) % 4) + 1}</strong>
            </span>
            <span>
              <small>Kursi</small>
              <strong>{ticket?.seats?.seat_number || '-'} · G{ticket?.seats?.carriages?.carriage_number || '-'}</strong>
            </span>
            <span>
              <small>Booking</small>
              <strong className="rh-mono">{booking.booking_code || booking.id?.slice(0, 8).toUpperCase()}</strong>
            </span>
            <span>
              <small>E-Boarding</small>
              <strong>{isDeparted || (depTime > 0 && depTime - now <= 2 * 3600000) ? 'Aktif' : 'Buka 2j sblm'}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab?.('tickets')}
            className="rh-journey-inline-link"
          >
            Buka QR <ArrowRight size={13} />
          </button>
        </div>

        {/* 2. Rute Perhentian + 3. Fasilitas & Restorasi (2-col clean hairline) */}
        <div className="rh-journey-minimal-cols">
          {/* Vertical Station Stops */}
          <div className="rh-journey-minimal-block">
            <div className="rh-journey-block-title">
              <MapPin size={14} /> Perhentian Rute
            </div>
            <ul className="rh-journey-stops-list">
              {stops.map((stop, idx) => {
                const isDone = isCompleted || (isDeparted && idx === 0)
                const isActive = (!isDeparted && idx === 0) || (isDeparted && !isCompleted && idx === 1)
                return (
                  <li key={stop.id || idx} className={isActive ? 'is-active' : isDone ? 'is-done' : ''}>
                    <span className="rh-stop-dot" aria-hidden="true" />
                    <span className="rh-stop-name">{stop.name}</span>
                    {stop.code && <span className="rh-stop-code">{stop.code}</span>}
                    <span className="rh-stop-time">{stop.arr || stop.dep || stop.time}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Fasilitas Kelas + Restorasi Shortcut + Perjalanan Lain */}
          <div className="rh-journey-minimal-block">
            <div className="rh-journey-block-title">
              <Train size={14} /> Fasilitas · {ticket?.seats?.carriages?.carriage_class || 'Eksekutif'}
            </div>
            <div className="rh-journey-facility-chips">
              <span><Wifi size={13} /> WiFi Kabin</span>
              <span><Plug size={13} /> Stopkontak</span>
              <span><Wind size={13} /> AC</span>
            </div>

            <div className="rh-journey-inline-promo">
              <div>
                <strong>Restorasi On-Board</strong>
                <span>Kopi, Nasi Goreng, Snack · antar ke kursi</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab?.('services')}
                className="rh-journey-inline-link"
              >
                Pesan <ArrowRight size={13} />
              </button>
            </div>

            {otherBookings.length > 0 && (
              <div className="rh-journey-other-list">
                <div className="rh-journey-block-title" style={{ marginBottom: '0.4rem' }}>
                  Perjalanan Lainnya
                </div>
                {otherBookings.map((ob) => (
                  <Link key={ob.id} href={`/booking/payment/${ob.id}`} className="rh-journey-other-item">
                    <span>
                      <strong>{ob.schedules?.trains?.name || 'Kereta'}</strong>
                      <small>{ob.schedules?.routes?.name || ''} · {formatDate(ob.schedules?.departure_time, { day: 'numeric', month: 'short' })}</small>
                    </span>
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Promo Banner 8:2 (3 Slide, 2s auto-loop, blurred left/right peek, touch swipe) */}
        <JourneyPromoBanner onSelectTab={onSelectTab} />
      </div>
    </div>
  )
}
