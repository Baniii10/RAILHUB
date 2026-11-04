'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  CreditCard,
  FileCheck,
  HelpCircle,
  Layers,
  MapPin,
  PlusCircle,
  QrCode,
  Radio,
  RefreshCw,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Ticket,
  Train,
  UserCheck,
  UserRound,
  Users,
  Utensils,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import EBoardingPass from '@/components/booking/EBoardingPass'
import PassengerServices from '@/components/services/PassengerServices'
import LiveJourneyMapTracker from '@/components/journey/LiveJourneyMapTracker'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'

const TABS = [
  { id: 'overview', label: 'Perjalanan', icon: Compass },
  { id: 'tickets', label: 'Tiket', icon: Ticket },
  { id: 'services', label: 'Layanan', icon: Utensils },
  { id: 'account', label: 'Akun', icon: UserRound },
]

const TAB_ALIASES = { journey: 'overview', book: 'overview', onboard: 'services', reports: 'services' }

function PassengerDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const requestedTab = TAB_ALIASES[searchParams.get('tab')] || searchParams.get('tab')
  const activeTab = TABS.some(tab => tab.id === requestedTab) ? requestedTab : 'overview'
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState({})
  const [ticketCounts, setTicketCounts] = useState({})
  const [ticketDetails, setTicketDetails] = useState([])
  const [qrCodes, setQrCodes] = useState({})
  const [selectedTicketForQR, setSelectedTicketForQR] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Scheduled departure countdown
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isDeparted: false })

  // Progress estimate derived from schedule times
  const [journeyProgress, setJourneyProgress] = useState(0)

  // Profile real settings
  const [fullNameInput, setFullNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [cityInput, setCityInput] = useState('Jakarta')
  const [savingProfile, setSavingProfile] = useState(false)

  function selectTab(tab) {
    router.push(`/dashboard/passenger?tab=${TAB_ALIASES[tab] || tab}`, { scroll: false })
  }

  // Auth gate
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fpassenger')
      return
    }
    if (profile?.role && profile.role !== 'passenger') {
      const target = profile.role === 'admin'
        ? '/dashboard/admin'
        : profile.role === 'conductor' ? '/dashboard/staff' : '/'
      router.replace(target)
    }
    if (profile) {
      const timer = window.setTimeout(() => {
        setFullNameInput(profile.full_name || '')
        setPhoneInput(profile.phone_number || '')
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [authLoading, user, profile, router])

  // Load Bookings & Tickets
  useEffect(() => {
    if (!user) return
    let active = true
    const supabase = createClient()

    async function loadDashboardData() {
      const { data: bookingRows, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id, booking_code, schedule_id, total_amount, status, expires_at, created_at,
          schedules(
            id, status, departure_time, arrival_time,
            trains(name, train_number),
            routes(name, origin_station_id, destination_station_id)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return
      if (bookingError) {
        setError(`Riwayat booking tidak dapat dimuat: ${bookingError.message}`)
        setLoading(false)
        return
      }

      const ids = (bookingRows || []).map(b => b.id)
      if (ids.length === 0) {
        setBookings([])
        setPayments({})
        setTicketCounts({})
        setLoading(false)
        return
      }

      const [paymentResult, ticketResult] = await Promise.all([
        supabase.from('payments').select('booking_id, status, method, confirmed_at').in('booking_id', ids),
        supabase.from('tickets').select(`
          id, booking_id, schedule_id, ticket_number, is_validated,
          passengers(full_name, id_card_number),
          seats(seat_number, carriages(carriage_number, carriage_class))
        `).in('booking_id', ids),
      ])

      if (!active) return
      if (paymentResult.error) {
        console.warn('Payment query warning:', paymentResult.error)
      }
      if (ticketResult.error) {
        console.warn('Ticket query warning:', ticketResult.error)
      }

      let allBookings = bookingRows || []
      let loadedTickets = ticketResult.data || []
      let loadedPayments = Object.fromEntries((paymentResult.data || []).map(p => [p.booking_id, p]))

      // Merge simulated bookings from localStorage so demo tickets always show up
      try {
        const simStore = JSON.parse(localStorage.getItem('railhub_simulated_bookings') || '{}')
        const simList = Object.values(simStore)
        if (simList.length > 0) {
          const existingIds = new Set(allBookings.map(b => b.id))
          const newSims = simList.filter(s => !existingIds.has(s.id))
          allBookings = [...allBookings, ...newSims]
          newSims.forEach(sim => {
            if (sim.payment) loadedPayments[sim.id] = sim.payment
            if (sim.tickets && Array.isArray(sim.tickets)) {
              sim.tickets.forEach(st => {
                if (!loadedTickets.some(lt => lt.ticket_number === st.ticket_number)) {
                  loadedTickets.push({ ...st, booking_id: sim.id })
                }
              })
            }
          })
        }
      } catch (e) {
        console.warn('Sim load error in dashboard:', e)
      }

      setBookings(allBookings)
      setPayments(loadedPayments)
      setTicketDetails(loadedTickets)

      setTicketCounts(loadedTickets.reduce((acc, t) => {
        acc[t.booking_id] = (acc[t.booking_id] || 0) + 1
        return acc
      }, {}))

      // Generate QR codes for all tickets
      const qrEntries = await Promise.all(
        (ticketResult.data || []).map(async t => {
          try {
            const url = await QRCode.toDataURL(t.ticket_number, { width: 300, margin: 1, color: { dark: '#1A428A', light: '#FFFFFF' } })
            return [t.ticket_number, url]
          } catch {
            return [t.ticket_number, '']
          }
        })
      )
      if (active) {
        setQrCodes(Object.fromEntries(qrEntries))
      }

      setLoading(false)
    }

    loadDashboardData()
    return () => { active = false }
  }, [user])

  // Active paid booking for scheduled journey status and countdown
  const activePaidBooking = useMemo(() => {
    return bookings.find(b => b.status === 'paid') || bookings[0] || null
  }, [bookings])
  const activeTicket = useMemo(
    () => ticketDetails.find(ticket => ticket.booking_id === activePaidBooking?.id) || null,
    [activePaidBooking?.id, ticketDetails]
  )

  // Calculate live countdown to departure
  useEffect(() => {
    if (!activePaidBooking?.schedules?.departure_time) return

    function updateTimer() {
      const depTime = new Date(activePaidBooking.schedules.departure_time).getTime()
      const arrivalTime = activePaidBooking.schedules.arrival_time
        ? new Date(activePaidBooking.schedules.arrival_time).getTime()
        : depTime
      const now = Date.now()
      const diff = depTime - now

      const progress = arrivalTime > depTime
        ? Math.min(100, Math.max(0, Math.round(((now - depTime) / (arrivalTime - depTime)) * 100)))
        : 0
      setJourneyProgress(progress)

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0, isDeparted: true })
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCountdown({ hours, minutes, seconds, isDeparted: false })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [activePaidBooking])

  // Share Journey handler
  function handleShareJourney() {
    const trainName = activePaidBooking?.schedules?.trains?.name || 'KA Argo Bromo Anggrek'
    const route = activePaidBooking?.schedules?.routes?.name || 'Gambir — Surabaya'
    const shareText = `Perjalanan saya dengan ${trainName} (${route}) di RAILHUB. Lihat jadwal dan estimasi progres di: https://railhub.id/dashboard/passenger?tab=journey`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
      toast.success('Link & info perjalanan disalin ke clipboard! Bagikan ke keluarga atau rekan.')
    } else {
      toast.success('Info perjalanan siap dibagikan!')
    }
  }

  // Profile Save handler
  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullNameInput.trim(),
        phone_number: phoneInput.trim(),
      })
      .eq('id', user.id)

    setSavingProfile(false)
    if (updateError) {
      toast.error(`Gagal menyimpan profil: ${updateError.message}`)
    } else {
      toast.success('Pengaturan profil berhasil diperbarui!')
    }
  }

  // Active tickets list
  const paidTickets = ticketDetails.filter(t => {
    const booking = bookings.find(b => b.id === t.booking_id)
    return booking?.status === 'paid'
  })

  return (
    <>
      <Navbar />
      <main className="passenger-dashboard" style={{ background: 'var(--rh-surface)', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── TOP HEADER / GREETING BAR ── */}
        <section style={{
          background: 'var(--rh-primary)',
          color: 'white',
          padding: '2.5rem 0 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="rh-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="rh-badge" style={{ background: 'rgba(255,255,255,0.14)', color: 'var(--rh-accent)' }}>
                    <Train size={13} aria-hidden="true" /> Ruang Perjalanan
                  </span>
                </div>
                <h1 className="rh-h2" style={{ color: 'white', margin: 0 }}>
                  Halo, {profile?.full_name || 'Penumpang RailHub'}
                </h1>
                <p style={{ margin: '0.35rem 0 0', color: 'rgba(255,255,255,0.82)', fontSize: '0.92rem' }}>
                  Tiket, status perjalanan, dan layanan kereta dalam satu tempat.
                </p>
              </div>

            </div>

            <nav className="passenger-mobile-tabs rh-show-mobile-only" aria-label="Menu penumpang">
              {TABS.map(tab => {
                const TabIcon = tab.icon
                return (
                  <button key={tab.id} type="button" className={activeTab === tab.id ? 'is-active' : ''} onClick={() => selectTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined}>
                    <TabIcon size={17} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* ── DESKTOP DASHBOARD NAVIGATION ── */}
            <nav className="passenger-tabs-nav" aria-label="Menu Dashboard Penumpang">
              {TABS.map(tab => {
                const TabIcon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectTab(tab.id)}
                    className="rh-btn rh-btn-sm passenger-tab-btn"
                    style={{
                      background: isActive ? 'white' : 'rgba(255,255,255,0.12)',
                      color: isActive ? 'var(--rh-primary)' : 'white',
                      fontWeight: isActive ? 800 : 600,
                      borderRadius: 12,
                      padding: '0.6rem 1rem',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.18)',
                      transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                    }}
                  >
                    <TabIcon size={16} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </section>

        {/* ── TAB CONTENT ── */}
        <div className="rh-container" style={{ marginTop: '2rem' }}>
          {error && (
            <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)', marginBottom: '1.5rem', borderLeft: '4px solid var(--rh-danger)' }}>
              <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> {error}
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 1: OVERVIEW (PELACAKAN PERJALANAN AKTIF)
              ════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: '1.75rem' }}>
              {/* Interactive Transit Progress Map & Draggable Bottom Sheet */}
              <LiveJourneyMapTracker
                booking={activePaidBooking}
                ticket={activeTicket}
                countdown={countdown}
                journeyProgress={journeyProgress}
                onSelectTab={selectTab}
              />

              {/* Recent Bookings Overview Table */}
              <section className="rh-card">
                <div className="rh-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="rh-h4" style={{ margin: 0 }}>Riwayat Booking Terbaru</h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>Daftar pemesanan tiket Anda di RAILHUB</p>
                  </div>
                  <button type="button" onClick={() => selectTab('tickets')} className="rh-btn rh-btn-ghost rh-btn-sm">
                    Lihat Semua Tiket <ArrowRight size={14} />
                  </button>
                </div>
                <div className="rh-card-body">
                  {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--rh-text-2)' }}>
                      <Train size={32} style={{ marginBottom: 8, color: 'var(--rh-primary)' }} />
                      <p>Belum ada tiket atau perjalanan yang dipesan.</p>
                      <button type="button" onClick={() => router.push('/trains')} className="rh-btn rh-btn-primary rh-btn-sm" style={{ marginTop: '0.5rem' }}>
                        Cari & Pesan Tiket
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                      {bookings.slice(0, 3).map(booking => (
                        <div key={booking.id} style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          borderRadius: 12,
                          background: 'var(--rh-surface)',
                          border: '1px solid var(--rh-border)',
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="rh-mono" style={{ fontWeight: 800 }}>{booking.booking_code}</span>
                              <span className={`rh-badge ${booking.status === 'paid' ? 'rh-badge-success' : booking.status === 'pending' ? 'rh-badge-warning' : 'rh-badge-muted'}`}>
                                {booking.status === 'paid' ? 'Terbayar' : booking.status === 'pending' ? 'Menunggu Pembayaran' : booking.status}
                              </span>
                            </div>
                            <strong style={{ display: 'block', fontSize: '1rem', marginTop: 4 }}>
                              {booking.schedules?.trains?.name || 'Kereta Antarkota'} · {booking.schedules?.routes?.name || 'Rute'}
                            </strong>
                            <small style={{ color: 'var(--rh-text-2)' }}>
                              {booking.schedules?.departure_time ? `${formatDate(booking.schedules.departure_time)} · ${formatTime(booking.schedules.departure_time)}` : ''}
                            </small>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--rh-primary)', display: 'block' }}>{formatIDR(booking.total_amount)}</strong>
                            <Link href={`/booking/payment/${booking.id}`} className="rh-btn rh-btn-ghost rh-btn-sm" style={{ marginTop: 4 }}>
                              {booking.status === 'paid' ? 'Buka E-Ticket' : 'Bayar Sekarang'} <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 2: MY TICKETS (TIKET SAYA & QR CODE)
              ════════════════════════════════════════════════ */}
          {activeTab === 'tickets' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Tiket Digital & E-Boarding Pass</h2>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                    Tunjukkan kode QR tiket digital kepada petugas kondektur saat proses boarding dan pemeriksaan di atas kereta.
                  </p>
                </div>
                <button type="button" onClick={() => router.push('/trains')} className="rh-btn rh-btn-primary rh-btn-sm">
                  <Train size={15} /> Pesan Tiket Baru
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="rh-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--rh-text-2)' }}>
                  <Ticket size={40} style={{ color: 'var(--rh-primary)', marginBottom: 12 }} />
                  <h3>Belum Ada Tiket</h3>
                  <p>Anda belum memiliki tiket aktif. Cari jadwal dan pilih kursi sekarang.</p>
                  <button type="button" onClick={() => router.push('/trains')} className="rh-btn rh-btn-primary" style={{ marginTop: '0.75rem' }}>
                    Cari Tiket Kereta
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {bookings.map(booking => {
                    const isPaid = booking.status === 'paid'
                    const relatedTickets = ticketDetails.filter(t => t.booking_id === booking.id)

                    return (
                      <article key={booking.id} className="rh-card" style={{ overflow: 'hidden' }}>
                        <div style={{
                          background: 'var(--rh-primary)',
                          color: 'white',
                          padding: '1.25rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)' }}>
                              Kode Booking
                            </span>
                            <strong className="rh-mono" style={{ display: 'block', fontSize: '1.25rem', color: 'white' }}>
                              {booking.booking_code}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className={`rh-badge ${isPaid ? 'rh-badge-success' : booking.status === 'pending' ? 'rh-badge-warning' : 'rh-badge-muted'}`}>
                              {isPaid ? 'Tiket Terbit (Aktif)' : booking.status === 'pending' ? 'Menunggu Pembayaran' : booking.status}
                            </span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--rh-accent)' }}>
                              {formatIDR(booking.total_amount)}
                            </span>
                          </div>
                        </div>

                        <div className="rh-card-body" style={{ display: 'grid', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '1.15rem' }}>{booking.schedules?.trains?.name || 'KA Antarkota'}</strong>
                              <span style={{ display: 'block', color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>
                                {booking.schedules?.trains?.train_number || 'KA'} · {booking.schedules?.routes?.name || 'Rute'}
                              </span>
                              <small style={{ color: 'var(--rh-text-3)', display: 'block', marginTop: 4 }}>
                                Keberangkatan: {booking.schedules?.departure_time ? `${formatDate(booking.schedules.departure_time)} · ${formatTime(booking.schedules.departure_time)} WIB` : '—'}
                              </small>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <Link href={`/booking/payment/${booking.id}`} className="rh-btn rh-btn-primary rh-btn-sm">
                                {isPaid ? 'Kelola / Reschedule' : 'Lanjutkan Bayar'}
                              </Link>
                              <button
                                type="button"
                                onClick={() => selectTab('overview')}
                                className="rh-btn rh-btn-ghost rh-btn-sm"
                              >
                                <Radio size={14} /> Tracking Kereta
                              </button>
                            </div>
                          </div>

                          {/* Individual Passenger Digital Tickets */}
                          {relatedTickets.length > 0 && (
                            <div style={{ borderTop: '1px dashed var(--rh-border)', paddingTop: '1rem' }}>
                              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>
                                Tiket Digital Penumpang ({relatedTickets.length} orang):
                              </strong>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.85rem' }}>
                                {relatedTickets.map((t, idx) => {
                                  const qrImage = qrCodes[t.ticket_number]
                                  return (
                                    <div key={t.id || t.ticket_number} style={{
                                      padding: '1rem',
                                      borderRadius: 14,
                                      border: '1.5px solid var(--rh-border)',
                                      background: 'var(--rh-surface)',
                                      display: 'flex',
                                      gap: '0.85rem',
                                      alignItems: 'center',
                                    }}>
                                      {/* QR Code thumbnail */}
                                      {qrImage ? (
                                        <div
                                          onClick={() => setSelectedTicketForQR({ ...t, qrImage, booking })}
                                          style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}
                                          title="Klik untuk memperbesar QR"
                                        >
                                          <Image src={qrImage} alt="QR Tiket" width={72} height={72} style={{ borderRadius: 8, border: '1px solid #CBD5E1' }} unoptimized />
                                          <small style={{ fontSize: '0.65rem', color: 'var(--rh-primary)', display: 'block', marginTop: 2, fontWeight: 700 }}>Perbesar</small>
                                        </div>
                                      ) : (
                                        <div style={{ width: 72, height: 72, background: 'white', borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                          <QrCode size={28} color="var(--rh-primary)" />
                                        </div>
                                      )}

                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <span className="rh-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-text-3)' }}>
                                          {t.ticket_number}
                                        </span>
                                        <strong style={{ display: 'block', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {t.passengers?.full_name || `Penumpang ${idx + 1}`}
                                        </strong>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                                          <span className="rh-badge rh-badge-primary" style={{ fontSize: '0.7rem' }}>
                                            Gerbong {t.seats?.carriages?.carriage_number || '1'}
                                          </span>
                                          <span className="rh-badge rh-badge-primary" style={{ fontSize: '0.7rem' }}>
                                            Kursi {t.seats?.seat_number || '—'}
                                          </span>
                                        </div>
                                        <small style={{ display: 'block', color: t.is_validated ? 'var(--rh-success)' : 'var(--rh-text-2)', fontSize: '0.72rem', marginTop: 4 }}>
                                          {t.is_validated ? '✓ Sudah Divalidasi Petugas' : '• Belum Boarding'}
                                        </small>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {/* QR Modal when enlarged */}
              {selectedTicketForQR && (
                <div className="rh-boarding-pass-overlay" role="dialog" aria-modal="true" aria-label="E-boarding pass" onClick={() => setSelectedTicketForQR(null)}>
                  <div className="rh-boarding-pass-dialog" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicketForQR(null)}
                      className="rh-boarding-pass-close"
                      aria-label="Tutup e-boarding pass"
                    >
                      <X size={20} />
                    </button>
                    <EBoardingPass
                      booking={selectedTicketForQR.booking}
                      ticket={selectedTicketForQR}
                      qrImage={selectedTicketForQR.qrImage}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && activePaidBooking && (
            <div id="trip-status" style={{ display: 'grid', gap: '1.25rem', scrollMarginTop: 112 }}>
                  <div className="passenger-journey-heading">
                    <div>
                      <span className="rh-badge rh-badge-primary">Status perjalanan</span>
                      <h2 className="rh-h3" style={{ margin: '0.35rem 0 0' }}>
                        {activePaidBooking.schedules?.trains?.name || 'Kereta Anda'}
                        {activePaidBooking.schedules?.trains?.train_number ? ` (${activePaidBooking.schedules.trains.train_number})` : ''}
                      </h2>
                      <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)' }}>
                        {activePaidBooking.schedules?.routes?.name || 'Rute belum tersedia'} · {activePaidBooking.booking_code}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={handleShareJourney} className="rh-btn rh-btn-ghost rh-btn-sm">
                        <Share2 size={15} aria-hidden="true" /> Bagikan
                      </button>
                      <button type="button" onClick={() => selectTab('services')} className="rh-btn rh-btn-primary rh-btn-sm">
                        <Utensils size={15} aria-hidden="true" /> Layanan kereta
                      </button>
                    </div>
                  </div>

                  <section className="rh-card passenger-route-map" aria-label="Estimasi progres perjalanan">
                    <div className="passenger-route-map-head">
                      <div>
                        <small>Berangkat</small>
                        <strong>{activePaidBooking.schedules?.departure_time ? formatTime(activePaidBooking.schedules.departure_time) : '—'}</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <small>Estimasi tiba</small>
                        <strong>{activePaidBooking.schedules?.arrival_time ? formatTime(activePaidBooking.schedules.arrival_time) : '—'}</strong>
                      </div>
                    </div>
                    <div className="passenger-route-map-track" aria-hidden="true">
                      <span className="passenger-route-map-progress" style={{ width: `${journeyProgress}%` }} />
                      <span className="passenger-route-map-train" style={{ left: `${journeyProgress}%` }}>
                        <Train size={18} />
                      </span>
                    </div>
                    <div className="passenger-route-map-labels">
                      {(activePaidBooking.schedules?.routes?.name || 'Stasiun asal — Stasiun tujuan')
                        .split(/\s(?:->|—|–|-|→)\s/)
                        .slice(0, 2)
                        .map((station, index) => <strong key={station} style={{ textAlign: index ? 'right' : 'left' }}>{station}</strong>)}
                    </div>
                    <div className="passenger-route-map-note">
                      <Clock3 size={15} aria-hidden="true" />
                      <span>
                        {countdown.isDeparted
                          ? `Estimasi progres ${journeyProgress}% berdasarkan waktu jadwal.`
                          : `Berangkat dalam ${countdown.hours}j ${countdown.minutes}m.`}
                        {' '}Posisi ini bukan pelacakan GPS.
                      </span>
                    </div>
                  </section>
            </div>
          )}

          {activeTab === 'services' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Layanan Perjalanan</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Pesan makanan atau laporkan kendala perjalanan dari satu tempat.
                </p>
              </div>
              {user && <PassengerServices userId={user.id} bookingId={activePaidBooking?.id} />}
            </div>
          )}


          {activeTab === 'account' && (
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: 800 }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Pengaturan Akun</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Perbarui nama dan nomor telepon yang digunakan untuk layanan perjalanan Anda.
                </p>
              </div>

              <section className="rh-card">
                <div className="rh-card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                  <span className="rh-icon-wrap"><ShieldCheck size={20} aria-hidden="true" /></span>
                  <div>
                    <h3 className="rh-h4" style={{ margin: 0 }}>Verifikasi Identitas</h3>
                    <p style={{ margin: '0.35rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                      Verifikasi dokumen belum tersedia. RAILHUB tidak meminta unggahan KTP sampai penyimpanan terenkripsi dan proses verifikasi resmi siap digunakan.
                    </p>
                  </div>
                </div>
              </section>

              {/* Profile Real Settings */}
              <section className="rh-card">
                <div className="rh-card-header">
                  <h3 className="rh-h4" style={{ margin: 0 }}>Pengaturan Profil Pengguna</h3>
                </div>
                <div className="rh-card-body">
                  <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <label className="rh-input-group">
                        <span className="rh-label-text">Nama Lengkap</span>
                        <input
                          type="text"
                          value={fullNameInput}
                          onChange={e => setFullNameInput(e.target.value)}
                          className="rh-input"
                          required
                        />
                      </label>

                      <label className="rh-input-group">
                        <span className="rh-label-text">Nomor Telepon</span>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={e => setPhoneInput(e.target.value)}
                          className="rh-input"
                          placeholder="0812xxxxxxxx"
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <label className="rh-input-group">
                        <span className="rh-label-text">Email Terdaftar</span>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="rh-input"
                          disabled
                          style={{ background: 'var(--rh-surface-2)', cursor: 'not-allowed' }}
                        />
                      </label>

                      <label className="rh-input-group">
                        <span className="rh-label-text">Kota Domisili</span>
                        <input
                          type="text"
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          className="rh-input"
                        />
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="submit" disabled={savingProfile} className="rh-btn rh-btn-primary">
                        {savingProfile ? 'Menyimpan…' : 'Perbarui Pengaturan'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Security & Privacy Settings Card */}
              <section className="rh-card">
                <div className="rh-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="var(--rh-primary)" />
                    <h3 className="rh-h4" style={{ margin: 0 }}>Keamanan Akun & Kebijakan Privasi</h3>
                  </div>
                  <span className="rh-badge rh-badge-success" style={{ fontSize: '0.78rem' }}>
                    <ShieldCheck size={13} /> Sesi Terautentikasi
                  </span>
                </div>
                <div className="rh-card-body" style={{ display: 'grid', gap: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--rh-text-2)', lineHeight: 1.6 }}>
                    Akses data akun mengikuti sesi login dan kebijakan akses berbasis kepemilikan. Jangan membagikan kode tiket atau detail identitas kepada pihak lain.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ padding: '0.85rem', borderRadius: 10, background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--rh-navy)', marginBottom: '0.2rem' }}>
                        <ShieldCheck size={15} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />Keamanan Sesi & Kata Sandi
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--rh-text-2)' }}>
                        Login dan pemulihan sesi ditangani melalui Supabase Auth.
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem', borderRadius: 10, background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--rh-navy)', marginBottom: '0.2rem' }}>
                        <FileCheck size={15} aria-hidden="true" style={{ verticalAlign: -3, marginRight: 6 }} />Privasi Data
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--rh-text-2)' }}>
                        RAILHUB tidak menerima unggahan dokumen identitas dari halaman akun ini.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--rh-border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-3)' }}>
                      Pelajari selengkapnya mengenai regulasi dan arsitektur keamanan:
                    </span>
                    <Link href="/about" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ fontWeight: 700, color: 'var(--rh-primary)' }}>
                      Baca Kebijakan Privasi Lengkap →
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function PassengerDashboard() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--rh-surface)', display: 'grid', placeItems: 'center' }}>
        <div className="rh-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="rh-spin" style={{ width: 36, height: 36, border: '3px solid var(--rh-border)', borderTopColor: 'var(--rh-primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <strong>Memuat Dashboard Penumpang…</strong>
        </div>
      </div>
    }>
      <PassengerDashboardContent />
    </Suspense>
  )
}
