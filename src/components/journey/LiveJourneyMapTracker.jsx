'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import {
  Train,
  MapPin,
  Clock3,
  ChevronUp,
  ChevronDown,
  QrCode,
  Utensils,
  Share2,
  CheckCircle2,
  Radio,
  Copy,
  Crosshair,
  User,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatTime, formatIDR } from '@/lib/utils/formatters'

// Generate authentic transit stops between origin and destination
function generateTransitStops(originName, destName, depTimeStr, arrTimeStr) {
  const dep = depTimeStr ? new Date(depTimeStr) : new Date()
  const arr = arrTimeStr ? new Date(arrTimeStr) : new Date(dep.getTime() + 3.5 * 3600 * 1000)
  const totalDuration = Math.max(arr.getTime() - dep.getTime(), 3600 * 1000)

  // Default transit stations if route has known names
  const routeKey = `${originName || ''} - ${destName || ''}`.toLowerCase()
  let midNames = ['Cirebon (CN)', 'Purwokerto (PWT)', 'Kutoarjo (KTA)']

  if (routeKey.includes('bandung') || routeKey.includes('bd')) {
    midNames = ['Jatinegara (JNG)', 'Karawang (KW)', 'Purwakarta (PWK)', 'Padalarang (PDL)']
  } else if (routeKey.includes('surabaya') || routeKey.includes('sgu') || routeKey.includes('sbi')) {
    midNames = ['Cirebon (CN)', 'Semarang Tawang (SMT)', 'Bojonegoro (BJN)']
  } else if (routeKey.includes('yogyakarta') || routeKey.includes('yk') || routeKey.includes('solo')) {
    midNames = ['Cirebon (CN)', 'Purwokerto (PWT)', 'Kroya (KYA)', 'Kutoarjo (KTA)']
  }

  const stops = []
  // 1. Origin
  stops.push({
    id: 'origin',
    name: originName || 'Stasiun Keberangkatan',
    time: formatTime(dep.toISOString()),
    type: 'origin',
    pct: 0,
  })

  // 2. Intermediate stops
  midNames.forEach((name, idx) => {
    const fraction = (idx + 1) / (midNames.length + 1)
    const stopTime = new Date(dep.getTime() + totalDuration * fraction)
    stops.push({
      id: `mid-${idx}`,
      name,
      time: formatTime(stopTime.toISOString()),
      type: 'mid',
      pct: Math.round(fraction * 100),
    })
  })

  // 3. Destination
  stops.push({
    id: 'destination',
    name: destName || 'Stasiun Tujuan',
    time: formatTime(arr.toISOString()),
    type: 'destination',
    pct: 100,
  })

  return stops
}

export default function LiveJourneyMapTracker({
  booking,
  ticket,
  countdown,
  journeyProgress = 35,
  onSelectTab,
}) {
  // Sheet state: 'peek' (bottom collapsed), 'half' (mid-height), 'full' (expanded all the way)
  const [sheetState, setSheetState] = useState('peek')
  const [dragProgress, setDragProgress] = useState(0) // 0 (peek) to 1 (full)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [mapZoom, setMapZoom] = useState(1)

  // Drag handling refs
  const sheetRef = useRef(null)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)
  const isDragging = useRef(false)

  // Derive train & route details from booking or fallback to demo
  const isDemo = !booking
  const trainName = booking?.schedules?.trains?.name || 'KA Argo Parahyangan'
  const trainNumber = booking?.schedules?.trains?.train_number || 'KA 34'
  const routeName = booking?.schedules?.routes?.name || 'Gambir (GMR) — Bandung (BD)'
  const [originStation, destStation] = routeName.split(/[—–-]/).map(s => s?.trim() || '')
  const departureTime = booking?.schedules?.departure_time || new Date().toISOString()
  const arrivalTime = booking?.schedules?.arrival_time || new Date(Date.now() + 3 * 3600 * 1000).toISOString()
  const carriage = ticket?.seats?.carriages?.carriage_number ? `Gerbong ${ticket.seats.carriages.carriage_number}` : 'Eksekutif 1'
  const seatNumber = ticket?.seats?.seat_number || '7A'
  const passengerName = ticket?.passengers?.full_name || 'Budi Santoso'
  const bookingCode = booking?.booking_code || 'RH-BKG84920'
  const ticketNumber = ticket?.ticket_number || `TKT-${bookingCode}-01`

  // Progress derived
  const progress = isDemo ? 42 : Math.min(100, Math.max(0, journeyProgress))
  const transitStops = useMemo(() => {
    return generateTransitStops(originStation, destStation, departureTime, arrivalTime)
  }, [originStation, destStation, departureTime, arrivalTime])

  // Generate QR for active ticket
  useEffect(() => {
    QRCode.toDataURL(ticketNumber, {
      width: 240,
      margin: 1,
      color: { dark: '#152857', light: '#FFFFFF' },
    }).then(setQrCodeUrl).catch(() => {})
  }, [ticketNumber])

  // Drag Gesture Handlers
  const handleTouchStart = useCallback(e => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY
    isDragging.current = true
    if (sheetRef.current) {
      dragStartHeight.current = sheetRef.current.offsetHeight
      sheetRef.current.style.transition = 'none'
    }
  }, [])

  const handleTouchMove = useCallback(e => {
    if (!isDragging.current || !sheetRef.current) return
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const deltaY = dragStartY.current - clientY // positive when dragging UP
    const windowH = typeof window !== 'undefined' ? window.innerHeight : 800
    const minH = 200
    const maxH = windowH * 0.92

    const newH = Math.min(maxH, Math.max(minH, dragStartHeight.current + deltaY))
    sheetRef.current.style.height = `${newH}px`
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return
    isDragging.current = false
    sheetRef.current.style.transition = 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)'

    const currentH = sheetRef.current.offsetHeight
    const windowH = typeof window !== 'undefined' ? window.innerHeight : 800

    if (currentH > windowH * 0.65) {
      setSheetState('full')
      sheetRef.current.style.height = `${windowH * 0.92}px`
    } else if (currentH > windowH * 0.35) {
      setSheetState('half')
      sheetRef.current.style.height = '55vh'
    } else {
      setSheetState('peek')
      sheetRef.current.style.height = '210px'
    }
  }, [])

  function toggleSheet() {
    if (sheetState === 'peek') {
      setSheetState('full')
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        sheetRef.current.style.height = '90vh'
      }
    } else {
      setSheetState('peek')
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        sheetRef.current.style.height = '210px'
      }
    }
  }

  function handleShare() {
    const text = `Memantau perjalanan ${trainName} (${routeName}) di RAILHUB. Estimasi progres: ${progress}%.`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success('Link pelacakan berhasil disalin!')
    } else {
      toast.success('Info perjalanan siap dibagikan!')
    }
  }

  function copyBookingCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bookingCode)
      toast.success('Kode booking disalin!')
    }
  }

  // Calculate train position along SVG path (500x320 viewport)
  // Path starts at (60, 240) and curves to (440, 80)
  const trainX = 60 + (progress / 100) * 380
  // Sine curve offset for natural railway look
  const trainY = 240 - Math.sin((progress / 100) * Math.PI * 0.85) * 110 - (progress / 100) * 50

  return (
    <div className="rh-live-tracker-viewport" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 120px)', minHeight: 620, maxHeight: 900, borderRadius: 24, overflow: 'hidden', background: '#0b1329', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* ══════════════════════════════════════════════════════
          1. TOP / BACKGROUND: INTERACTIVE VECTOR TRANSIT MAP
          ══════════════════════════════════════════════════════ */}
      <div className="rh-tracker-map-canvas" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
        }} />

        {/* Map Vector SVG Viewport */}
        <svg
          viewBox="0 0 500 320"
          preserveAspectRatio="xMidYMid slice"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${mapZoom})`,
            transition: 'transform 0.3s ease',
          }}
        >
          <defs>
            {/* Soft gradient along rail path */}
            <linearGradient id="railGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            {/* Glowing train marker filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background geographical terrain curves */}
          <path d="M 0,160 Q 150,110 300,190 T 500,130" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="60" />
          <path d="M 0,220 Q 200,260 400,180 T 500,240" fill="none" stroke="rgba(37,99,235,0.03)" strokeWidth="80" />

          {/* Secondary / Branch Rail lines */}
          <path d="M 60,240 Q 140,220 200,280" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" strokeDasharray="4 4" />
          <path d="M 320,135 Q 380,180 440,210" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" strokeDasharray="4 4" />

          {/* MAIN ACTIVE RAILWAY ROUTE (Gray Bedding + Colored Active Track) */}
          <path
            d="M 60,240 C 140,240 180,130 260,130 C 340,130 380,90 440,80"
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Active green/blue travelled track */}
          <path
            d="M 60,240 C 140,240 180,130 260,130 C 340,130 380,90 440,80"
            fill="none"
            stroke="url(#railGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="600"
            strokeDashoffset={600 - (progress / 100) * 600}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />

          {/* Transit Stations Nodes along the line */}
          {/* 1. Origin Station */}
          <g transform="translate(60, 240)">
            <circle r="9" fill="#10b981" />
            <circle r="4" fill="#ffffff" />
            <text x="-4" y="22" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">
              {originStation.split(' ')[0] || 'Asal'}
            </text>
          </g>

          {/* 2. Mid Transit Station 1 */}
          <g transform="translate(190, 160)">
            <circle r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-12" fill="rgba(255,255,255,0.8)" fontSize="8.5" fontWeight="600" textAnchor="middle">
              {transitStops[1]?.name?.split(' ')[0] || 'Transit 1'}
            </text>
          </g>

          {/* 3. Mid Transit Station 2 */}
          <g transform="translate(320, 118)">
            <circle r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="18" fill="rgba(255,255,255,0.8)" fontSize="8.5" fontWeight="600" textAnchor="middle">
              {transitStops[2]?.name?.split(' ')[0] || 'Transit 2'}
            </text>
          </g>

          {/* 4. Destination Station (Red Pin Marker like Tokopedia screenshot) */}
          <g transform="translate(440, 80)">
            {/* Destination Pin Marker */}
            <path
              d="M 0,-24 C -8,-24 -14,-18 -14,-10 C -14,-2 0,0 0,0 C 0,0 14,-2 14,-10 C 14,-18 8,-24 0,-24 Z"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <circle cx="0" cy="-12" r="4.5" fill="#ffffff" />
            <text x="0" y="18" fill="#ffffff" fontSize="10" fontWeight="800" textAnchor="middle">
              {destStation.split(' ')[0] || 'Tujuan'}
            </text>
          </g>

          {/* LIVE MOVING TRAIN MARKER (Pulsing radar ring + train badge) */}
          <g transform={`translate(${trainX}, ${trainY})`} style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {/* Animated radar ripple rings */}
            <circle r="22" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" style={{ transformOrigin: 'center' }} />
            <circle r="14" fill="rgba(16, 185, 129, 0.35)" />
            {/* Center Vehicle Hub */}
            <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            <circle r="3.5" fill="#ffffff" />
          </g>
        </svg>

        {/* ── TOP FLOATING PILL (GoSend/Tokopedia Inspired) ── */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '0.65rem 1rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: 999,
              background: '#ecfdf5',
              color: '#059669',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} className="animate-pulse" />
              LIVE GPS
            </span>
            <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 700 }}>
              {progress < 100 ? (
                <>Kereta tiba dalam <strong style={{ color: '#2563eb' }}>{Math.max(15, Math.round((100 - progress) * 1.8))} mnt</strong></>
              ) : (
                <span style={{ color: '#059669' }}>Kereta Telah Tiba di Tujuan</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.02em' }}>
              RAILHUB
            </span>
          </div>
        </div>

        {/* Floating Recenter Map Button */}
        <button
          type="button"
          onClick={() => setMapZoom(z => (z === 1 ? 1.25 : 1))}
          title="Fokuskan posisi kereta"
          aria-label="Fokuskan posisi kereta"
          style={{
            position: 'absolute',
            bottom: '230px',
            right: '1rem',
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            color: '#1e293b',
            zIndex: 10,
          }}
        >
          <Crosshair size={20} color={mapZoom > 1 ? '#2563eb' : '#64748b'} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. BOTTOM DRAGGABLE SHEET ("Diseret dari bawah")
          ══════════════════════════════════════════════════════ */}
      <section
        ref={sheetRef}
        aria-label="Rincian Perjalanan"
        className="rh-tracker-bottom-sheet"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '210px',
          background: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'height',
        }}
      >
        {/* DRAG HANDLE BAR (Touch target to pull up/down) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onClick={toggleSheet}
          style={{
            padding: '0.65rem 1rem 0.35rem',
            cursor: 'grab',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            touchAction: 'none',
          }}
        >
          {/* Pill indicator */}
          <div style={{ width: 44, height: 4.5, borderRadius: 999, background: '#cbd5e1', marginBottom: 6 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
            {sheetState === 'full' ? (
              <><ChevronDown size={14} /> Tutup rincian</>
            ) : (
              <><ChevronUp size={14} /> Tarik untuk melihat rincian lengkap</>
            )}
          </div>
        </div>

        {/* ── SHEET HEADER PEEK: TRAIN & ROUTE SUMMARY (Always visible) ── */}
        <div style={{ padding: '0.5rem 1.25rem 0.75rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          {/* Train identity row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}>
                <Train size={22} strokeWidth={2.4} />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block', lineHeight: 1.25 }}>
                  {trainName}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {trainNumber} · {carriage} · Kursi <strong>{seatNumber}</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="rh-btn rh-btn-ghost rh-btn-sm"
              style={{ borderRadius: 10, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Share2 size={15} /> Bagikan
            </button>
          </div>

          {/* Route origin -> destination pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.75rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>↑ Asal</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {originStation}
              </strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>↓ Tujuan</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {destStation}
              </strong>
            </div>
          </div>
        </div>

        {/* ── EXPANDED FULL DETAILS (Scrollable when sheet pulled up) ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* Quick Action Utility Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Link
              href="/dashboard/orders"
              className="rh-btn rh-btn-sm"
              style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', fontWeight: 700 }}
            >
              <Utensils size={15} /> Pesan Kuliner
            </Link>
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('tickets')}
              className="rh-btn rh-btn-sm"
              style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 700 }}
            >
              <QrCode size={15} /> Tiket Digital
            </button>
            <Link
              href="/dashboard/reports"
              className="rh-btn rh-btn-sm"
              style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 700 }}
            >
              <AlertCircle size={15} /> Bantuan Kru
            </Link>
          </div>

          {/* Section: Transit Stops Progress Timeline */}
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: '1.1rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                Jadwal & Stasiun Transit
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {transitStops.length} Pemberhentian
              </span>
            </div>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {transitStops.map((stop, index) => {
                const isPassed = progress >= stop.pct
                const isCurrentNext = !isPassed && (index === 0 || progress >= transitStops[index - 1]?.pct)

                return (
                  <div key={stop.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    {/* Node marker with connecting line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: isPassed ? '#10b981' : isCurrentNext ? '#3b82f6' : '#cbd5e1',
                        border: '3px solid #ffffff',
                        boxShadow: '0 0 0 1px #cbd5e1',
                        flexShrink: 0,
                      }} />
                      {index < transitStops.length - 1 && (
                        <div style={{
                          width: 2,
                          height: 36,
                          background: isPassed ? '#10b981' : '#e2e8f0',
                          margin: '2px 0',
                        }} />
                      )}
                    </div>

                    {/* Stop info */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: isPassed ? '#0f172a' : '#475569' }}>
                          {stop.name}
                        </strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {isPassed ? (
                            <span style={{ color: '#059669', fontWeight: 600 }}>Telah Terlewati</span>
                          ) : isCurrentNext ? (
                            <span style={{ color: '#2563eb', fontWeight: 700 }}>Stasiun Berikutnya ⏳</span>
                          ) : (
                            'Terjadwal'
                          )}
                        </div>
                      </div>
                      <span className="rh-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                        {stop.time} WIB
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section: Boarding Pass QR Card */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: '1.15rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  KODE BOOKING
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong className="rh-mono" style={{ fontSize: '1.25rem', color: '#1e3a8a' }}>
                    {bookingCode}
                  </strong>
                  <button
                    type="button"
                    onClick={copyBookingCode}
                    className="rh-btn rh-btn-ghost rh-btn-sm"
                    style={{ padding: '0.2rem 0.5rem', borderRadius: 6 }}
                    title="Salin kode booking"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  Penumpang: <strong>{passengerName}</strong>
                </small>
              </div>

              {qrCodeUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={qrCodeUrl}
                    alt="QR Boarding Pass"
                    style={{ width: 84, height: 84, borderRadius: 10, border: '1px solid #cbd5e1' }}
                  />
                  <small style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                    Tunjukkan ke Kondektur
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Simulated demo disclaimer if no booking exists */}
          {isDemo && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Mode Demo Interaktif. Saat Anda memiliki tiket resmi, data kereta & rute asli otomatis sinkron ke peta ini.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

