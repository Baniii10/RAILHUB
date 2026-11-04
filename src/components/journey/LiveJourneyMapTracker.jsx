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
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatTime, formatIDR } from '@/lib/utils/formatters'

// Generate authentic transit stops between origin and destination
function generateTransitStops(originName, destName, depTimeStr, arrTimeStr) {
  const dep = depTimeStr ? new Date(depTimeStr) : new Date()
  const arr = arrTimeStr ? new Date(arrTimeStr) : new Date(dep.getTime() + 3.5 * 3600 * 1000)
  const totalDuration = Math.max(arr.getTime() - dep.getTime(), 3600 * 1000)

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
  stops.push({
    id: 'origin',
    name: originName || 'Stasiun Keberangkatan',
    time: formatTime(dep.toISOString()),
    type: 'origin',
    pct: 0,
  })

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
  recentBookings = [],
  onSelectTab,
}) {
  // Sheet state: 'peek' | 'half' | 'full'
  const [sheetState, setSheetState] = useState('peek')
  const [mapZoom, setMapZoom] = useState(1)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  // DOM Refs for physics
  const sheetRef = useRef(null)
  const contentRef = useRef(null)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const startTranslateY = useRef(0)
  const lastTouchY = useRef(0)
  const lastTouchTime = useRef(0)
  const velocityY = useRef(0)
  const isContentDrag = useRef(false)

  // Derive train & route details
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

  const progress = isDemo ? 42 : Math.min(100, Math.max(0, journeyProgress))
  const transitStops = useMemo(() => {
    return generateTransitStops(originStation, destStation, departureTime, arrivalTime)
  }, [originStation, destStation, departureTime, arrivalTime])

  // Compute snap points dynamically based on viewport height
  const getSnapPoints = useCallback(() => {
    if (typeof window === 'undefined') return { full: 0, half: 340, peek: 560 }
    const vh = window.innerHeight
    // Sheet height is 92vh
    const sheetH = vh * 0.92
    const peekVisibleH = 230 // pixels visible in collapsed peek
    const halfVisibleH = Math.min(sheetH * 0.58, vh * 0.52)

    return {
      full: 0, // translateY = 0 (top of sheet at 8vh)
      half: Math.round(sheetH - halfVisibleH),
      peek: Math.round(sheetH - peekVisibleH),
    }
  }, [])

  // Set initial sheet position on mount
  useEffect(() => {
    const snaps = getSnapPoints()
    currentTranslateY.current = snaps.peek
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translate3d(0, ${snaps.peek}px, 0)`
    }
  }, [getSnapPoints])

  // Generate QR for active ticket
  useEffect(() => {
    QRCode.toDataURL(ticketNumber, {
      width: 240,
      margin: 1,
      color: { dark: '#152857', light: '#FFFFFF' },
    }).then(setQrCodeUrl).catch(() => {})
  }, [ticketNumber])

  // Smooth Snap Function (Grab Physics)
  const snapTo = useCallback((targetState, animate = true) => {
    const snaps = getSnapPoints()
    let targetY = snaps.peek
    if (targetState === 'full') targetY = snaps.full
    else if (targetState === 'half') targetY = snaps.half

    currentTranslateY.current = targetY
    setSheetState(targetState)

    if (sheetRef.current) {
      if (animate) {
        // Grab-style responsive spring curve
        sheetRef.current.style.transition = 'transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1)'
      } else {
        sheetRef.current.style.transition = 'none'
      }
      sheetRef.current.style.transform = `translate3d(0, ${targetY}px, 0)`
    }

    // Micro-haptic tactile feedback (vibration click on native mobile)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12) } catch {}
    }
  }, [getSnapPoints])

  // Drag Gesture Engine (120Hz GPU driven, zero-layout reflows)
  const onDragStart = useCallback((clientY, fromContent = false) => {
    isDragging.current = true
    isContentDrag.current = fromContent
    dragStartY.current = clientY
    startTranslateY.current = currentTranslateY.current
    lastTouchY.current = clientY
    lastTouchTime.current = performance.now()
    velocityY.current = 0

    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
    }
  }, [])

  const onDragMove = useCallback((clientY) => {
    if (!isDragging.current || !sheetRef.current) return

    const deltaY = clientY - dragStartY.current
    let targetY = startTranslateY.current + deltaY

    const snaps = getSnapPoints()

    // Grab-style rubber-band resistance when pulling beyond limits
    if (targetY < snaps.full) {
      // Over-drag at top: elastic logarithmic resistance
      const over = snaps.full - targetY
      targetY = snaps.full - Math.sqrt(Math.max(0, over)) * 4
    } else if (targetY > snaps.peek) {
      // Over-drag at bottom: elastic resistance
      const over = targetY - snaps.peek
      targetY = snaps.peek + Math.sqrt(Math.max(0, over)) * 4
    }

    // Velocity tracker
    const now = performance.now()
    const dt = now - lastTouchTime.current
    if (dt > 12) {
      velocityY.current = (clientY - lastTouchY.current) / dt
      lastTouchY.current = clientY
      lastTouchTime.current = now
    }

    currentTranslateY.current = targetY
    sheetRef.current.style.transform = `translate3d(0, ${targetY}px, 0)`
  }, [getSnapPoints])

  const onDragEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    const snaps = getSnapPoints()
    const currentY = currentTranslateY.current
    const v = velocityY.current // Positive: dragged down, Negative: dragged up

    // High velocity FLICK gesture (Grab app flick physics)
    if (v < -0.45) {
      // Fast flick UP -> snap higher
      if (currentY > snaps.half + 40) {
        snapTo('half')
      } else {
        snapTo('full')
      }
      return
    } else if (v > 0.45) {
      // Fast flick DOWN -> snap lower
      if (currentY < snaps.half - 40) {
        snapTo('half')
      } else {
        snapTo('peek')
      }
      return
    }

    // Gentle release: snap to nearest snap point
    const distToFull = Math.abs(currentY - snaps.full)
    const distToHalf = Math.abs(currentY - snaps.half)
    const distToPeek = Math.abs(currentY - snaps.peek)

    const minDist = Math.min(distToFull, distToHalf, distToPeek)
    if (minDist === distToFull) {
      snapTo('full')
    } else if (minDist === distToHalf) {
      snapTo('half')
    } else {
      snapTo('peek')
    }
  }, [getSnapPoints, snapTo])

  // Touch event listeners for handle
  const handleTouchStart = e => onDragStart(e.touches[0].clientY, false)
  const handleTouchMove = e => onDragMove(e.touches[0].clientY)
  const handleTouchEnd = () => onDragEnd()

  // Mouse event listeners for desktop preview
  const handleMouseDown = e => {
    onDragStart(e.clientY, false)
    const onMouseMove = ev => onDragMove(ev.clientY)
    const onMouseUp = () => {
      onDragEnd()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Handle tap toggle (click handle)
  function handleHandleClick() {
    if (sheetState === 'peek') {
      snapTo('half')
    } else if (sheetState === 'half') {
      snapTo('full')
    } else {
      snapTo('peek')
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

  // Calculate train position along SVG path
  const trainX = 60 + (progress / 100) * 380
  const trainY = 240 - Math.sin((progress / 100) * Math.PI * 0.85) * 110 - (progress / 100) * 50

  return (
    <div
      className="rh-live-tracker-viewport"
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '100dvh',
        overflow: 'hidden',
        background: '#0a1024',
        userSelect: 'none',
      }}
    >
      {/* ══════════════════════════════════════════════════════
          1. TOP / BACKGROUND: INTERACTIVE VECTOR TRANSIT MAP
          ══════════════════════════════════════════════════════ */}
      <div className="rh-tracker-map-canvas" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Subtle grid pattern background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            opacity: 0.9,
          }}
        />

        {/* Map Vector SVG Viewport */}
        <svg
          viewBox="0 0 500 320"
          preserveAspectRatio="xMidYMid slice"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${mapZoom})`,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <defs>
            <linearGradient id="railGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Geographical terrain contours */}
          <path d="M 0,160 Q 150,110 300,190 T 500,130" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="60" />
          <path d="M 0,220 Q 200,260 400,180 T 500,240" fill="none" stroke="rgba(37,99,235,0.04)" strokeWidth="80" />

          {/* Branch Rail lines */}
          <path d="M 60,240 Q 140,220 200,280" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" strokeDasharray="4 4" />
          <path d="M 320,135 Q 380,180 440,210" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" strokeDasharray="4 4" />

          {/* MAIN ACTIVE RAILWAY ROUTE */}
          <path
            d="M 60,240 C 140,240 180,130 260,130 C 340,130 380,90 440,80"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Active travelled track */}
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

          {/* Stations Nodes along the line */}
          {/* Origin */}
          <g transform="translate(60, 240)">
            <circle r="9" fill="#10b981" />
            <circle r="4" fill="#ffffff" />
            <text x="-4" y="22" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">
              {originStation.split(' ')[0] || 'Asal'}
            </text>
          </g>

          {/* Mid Transit 1 */}
          <g transform="translate(190, 160)">
            <circle r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-12" fill="rgba(255,255,255,0.8)" fontSize="8.5" fontWeight="600" textAnchor="middle">
              {transitStops[1]?.name?.split(' ')[0] || 'Transit 1'}
            </text>
          </g>

          {/* Mid Transit 2 */}
          <g transform="translate(320, 118)">
            <circle r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="18" fill="rgba(255,255,255,0.8)" fontSize="8.5" fontWeight="600" textAnchor="middle">
              {transitStops[2]?.name?.split(' ')[0] || 'Transit 2'}
            </text>
          </g>

          {/* Destination Pin Marker */}
          <g transform="translate(440, 80)">
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

          {/* LIVE MOVING TRAIN MARKER */}
          <g transform={`translate(${trainX}, ${trainY})`} style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <circle r="22" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" style={{ transformOrigin: 'center' }} />
            <circle r="14" fill="rgba(16, 185, 129, 0.35)" />
            <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            <circle r="3.5" fill="#ffffff" />
          </g>
        </svg>

        {/* ── TOP FLOATING BAR (Grab / Tokopedia Style Header) ── */}
        <header
          style={{
            position: 'absolute',
            top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            left: '0.75rem',
            right: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 30,
          }}
        >
          {/* Back button to Home */}
          <Link
            href="/"
            className="rh-btn rh-btn-ghost"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              color: '#0f172a',
              flexShrink: 0,
            }}
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft size={19} />
          </Link>

          {/* Center Info Pill */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(12px)',
              borderRadius: 999,
              padding: '0.5rem 0.9rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 999,
                  background: '#ecfdf5',
                  color: '#059669',
                  flexShrink: 0,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="animate-pulse" />
                LIVE
              </span>
              <span
                style={{
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {progress < 100 ? (
                  <>Tiba dlm <strong style={{ color: '#2563eb' }}>{Math.max(15, Math.round((100 - progress) * 1.8))} mnt</strong></>
                ) : (
                  <span style={{ color: '#059669' }}>Tiba di Tujuan</span>
                )}
              </span>
            </div>

            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.04em', flexShrink: 0, paddingLeft: 4 }}>
              RAILHUB
            </span>
          </div>

          {/* Quick tab button */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('tickets')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.98)',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#1e3a8a',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <QrCode size={14} /> Tiket
          </button>
        </header>

        {/* Floating Recenter Map Button */}
        <button
          type="button"
          onClick={() => setMapZoom(z => (z === 1 ? 1.25 : 1))}
          title="Fokuskan posisi kereta"
          aria-label="Fokuskan posisi kereta"
          style={{
            position: 'absolute',
            bottom: '260px',
            right: '1rem',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.98)',
            border: 'none',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            color: '#1e293b',
            zIndex: 10,
          }}
        >
          <Crosshair size={21} color={mapZoom > 1 ? '#2563eb' : '#64748b'} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. GRAB-STYLE BUTTERY-SMOOTH DRAGGABLE BOTTOM SHEET
             (Driven by GPU translateY, Velocity Flick, Haptics)
          ══════════════════════════════════════════════════════ */}
      <section
        ref={sheetRef}
        aria-label="Rincian Perjalanan Lengkap"
        className="rh-grab-bottom-sheet"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '92dvh',
          background: '#ffffff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.32)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 25,
          willChange: 'transform',
          transform: 'translate3d(0, 560px, 0)',
        }}
      >
        {/* GRAB DRAG HANDLE HEADER (Primary touch area) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={handleHandleClick}
          style={{
            padding: '0.75rem 1rem 0.5rem',
            cursor: 'grab',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            touchAction: 'none',
            flexShrink: 0,
          }}
        >
          {/* Thick Rounded Pill Handle Bar */}
          <div
            style={{
              width: 52,
              height: 5.5,
              borderRadius: 999,
              background: '#cbd5e1',
              marginBottom: 6,
              transition: 'background-color 0.2s',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748b',
            }}
          >
            {sheetState === 'full' ? (
              <><ChevronDown size={14} /> Geser ke bawah untuk melihat peta</>
            ) : sheetState === 'half' ? (
              <><ChevronUp size={14} /> Tarik penuh atau geser ke bawah</>
            ) : (
              <><ChevronUp size={14} /> Tarik untuk rincian perjalanan lengkap</>
            )}
          </div>
        </div>

        {/* ── SHEET HEADER PEEK: TRAIN & ROUTE SUMMARY (Always visible) ── */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{
            padding: '0.45rem 1.25rem 0.85rem',
            borderBottom: '1px solid #f1f5f9',
            flexShrink: 0,
            cursor: 'grab',
          }}
        >
          {/* Train identity row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Train size={24} strokeWidth={2.4} />
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
            <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>↑ Asal</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {originStation}
              </strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>↓ Tujuan</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {destStation}
              </strong>
            </div>
          </div>
        </div>

        {/* ── EXPANDED FULL DETAILS (Scrollable when sheet pulled up) ── */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.25rem calc(2.5rem + env(safe-area-inset-bottom, 0px))',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
          }}
        >
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: isPassed ? '#10b981' : isCurrentNext ? '#3b82f6' : '#cbd5e1',
                          border: '3px solid #ffffff',
                          boxShadow: '0 0 0 1px #cbd5e1',
                          flexShrink: 0,
                        }}
                      />
                      {index < transitStops.length - 1 && (
                        <div
                          style={{
                            width: 2,
                            height: 36,
                            background: isPassed ? '#10b981' : '#e2e8f0',
                            margin: '2px 0',
                          }}
                        />
                      )}
                    </div>

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

          {/* Section: Other Bookings List (Accessible inside sheet) */}
          {recentBookings.length > 1 && (
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Pemesanan Tiket Lainnya</strong>
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Semua Tiket →
                </button>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {recentBookings.filter(b => b.id !== booking?.id).slice(0, 2).map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div>
                      <span className="rh-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{b.booking_code}</span>
                      <strong style={{ display: 'block', fontSize: '0.82rem', color: '#1e293b' }}>{b.schedules?.trains?.name || 'KA Antarkota'}</strong>
                    </div>
                    <Link href={`/booking/payment/${b.id}`} className="rh-btn rh-btn-ghost rh-btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      Buka E-Ticket
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

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
