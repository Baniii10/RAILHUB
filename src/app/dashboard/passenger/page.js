'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  CreditCard,
  FileCheck,
  HelpCircle,
  History,
  KeyRound,
  Layers,
  MapPin,
  PlusCircle,
  QrCode,
  Radio,
  RefreshCw,
  Share2,
  Shield,
  ShieldCheck,
  Star,
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
import { PassengerTrackingSkeleton, DashboardShellSkeleton } from '@/components/ui/RailLoader'

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
  const [currentTime, setCurrentTime] = useState(0)

  // Progress estimate derived from schedule times
  const [journeyProgress, setJourneyProgress] = useState(0)

  // Profile real settings
  const [fullNameInput, setFullNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)

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
        : (profile.role === 'conductor' || profile.role === 'gate' || profile.role === 'staff' || profile.staff_type) ? '/dashboard/staff' : '/'
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
            routes(name, origin_station_id, destination_station_id, route_stops(id, stop_order, offset_minutes, stations(name, code)))
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
        setTicketDetails([])
        setQrCodes({})
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

      const allBookings = bookingRows || []
      const loadedTickets = ticketResult.data || []
      const loadedPayments = Object.fromEntries((paymentResult.data || []).map(p => [p.booking_id, p]))

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

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now())
    updateTime()
    const timer = window.setInterval(updateTime, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // Active paid booking for scheduled journey status and countdown
  const activePaidBooking = useMemo(() => {
    if (!currentTime) return null
    return bookings
      .filter(booking => {
        if (booking.status !== 'paid' || !booking.schedules?.departure_time) return false
        const endTime = Date.parse(booking.schedules.arrival_time || booking.schedules.departure_time)
        return Number.isFinite(endTime) && endTime >= currentTime
      })
      .sort((a, b) => Date.parse(a.schedules.departure_time) - Date.parse(b.schedules.departure_time))[0] || null
  }, [bookings, currentTime])
  const activeTicket = useMemo(
    () => ticketDetails.find(ticket => ticket.booking_id === activePaidBooking?.id) || null,
    [activePaidBooking?.id, ticketDetails]
  )
  const profileName = profile?.full_name || user?.user_metadata?.full_name || 'Penumpang RAILHUB'
  const profileInitials = profileName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()

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
    if (!activePaidBooking) {
      toast.error('Belum ada perjalanan aktif untuk dibagikan.')
      return
    }
    const trainName = activePaidBooking.schedules?.trains?.name || 'Kereta'
    const route = activePaidBooking.schedules?.routes?.name || 'Rute belum tersedia'
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
      <main className={`passenger-dashboard ${activeTab === 'overview' ? 'is-tracking-tab' : ''}`} style={{ background: 'var(--rh-surface)', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── DESKTOP DASHBOARD NAVIGATION BAR ── */}
        <section className={`passenger-header-banner rh-hide-mobile rh-hide-on-mobile-tracking ${activeTab === 'account' ? 'passenger-account-hide' : ''}`} style={{
          background: 'var(--rh-primary)',
          color: 'white',
          padding: '1rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="rh-container">
            {/* ── DESKTOP DASHBOARD NAVIGATION ── */}
            <nav className="passenger-tabs-nav" style={{ marginTop: 0 }} aria-label="Menu Dashboard Penumpang">
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
        <div className={activeTab === 'overview' ? 'passenger-main-container' : 'rh-container'} style={{ marginTop: activeTab === 'overview' ? 0 : '2rem' }}>
          {error && (
            <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)', marginBottom: '1.5rem', borderLeft: '4px solid var(--rh-danger)' }}>
              <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '1rem 0' }}>
              {activeTab === 'overview' ? (
                <PassengerTrackingSkeleton />
              ) : (
                <DashboardShellSkeleton role="passenger" />
              )}
            </div>
          ) : (
            <>
              {/* ════════════════════════════════════════════════
                  TAB 1: OVERVIEW (PELACAKAN PERJALANAN AKTIF)
                  ════════════════════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gap: '1.75rem' }}>
                  {/* Interactive Transit Progress Map & Live HUD (Focus Tracking Only) */}
                  <LiveJourneyMapTracker
                    booking={activePaidBooking}
                    ticket={activeTicket}
                    countdown={countdown}
                    journeyProgress={journeyProgress}
                    onSelectTab={selectTab}
                  />
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
                    const depTime = new Date(booking.schedules?.departure_time || 0).getTime()
                    const arrTime = new Date(booking.schedules?.arrival_time || 0).getTime()
                    const tripEndTime = arrTime > depTime ? arrTime : (depTime > 0 ? depTime + 4 * 60 * 60 * 1000 : 0)

                    const isExpired = booking.status === 'cancelled' || booking.status === 'expired' || (booking.status === 'pending' && booking.expires_at && new Date(booking.expires_at).getTime() < currentTime)
                    const isCompleted = isPaid && currentTime >= tripEndTime
                    const isDeparted = isPaid && !isCompleted && currentTime >= depTime
                    const canBoard = isPaid && !isCompleted && !isDeparted && currentTime >= (depTime - 2 * 60 * 60 * 1000)
                    const canReschedule = isPaid && !isDeparted && !isCompleted && depTime > (currentTime + 2 * 60 * 60 * 1000)

                    let statusType = 'waiting'
                    let statusBadgeClass = 'status-waiting'
                    let statusLabel = 'Belum Jalan'

                    if (isExpired) {
                      statusType = 'expired'
                      statusBadgeClass = 'status-expired'
                      statusLabel = 'Hangus'
                    } else if (booking.status === 'pending') {
                      statusType = 'pending'
                      statusBadgeClass = 'status-pending'
                      statusLabel = 'Menunggu Pembayaran'
                    } else if (isCompleted) {
                      statusType = 'completed'
                      statusBadgeClass = 'status-completed'
                      statusLabel = 'Selesai'
                    } else if (isDeparted) {
                      statusType = 'ready'
                      statusBadgeClass = 'status-ready'
                      statusLabel = 'Dalam Perjalanan'
                    } else if (canBoard) {
                      statusType = 'ready'
                      statusBadgeClass = 'status-ready'
                      statusLabel = 'Siap Boarding'
                    } else {
                      statusType = 'waiting'
                      statusBadgeClass = 'status-waiting'
                      statusLabel = 'Belum Jalan'
                    }

                    const routeName = booking.schedules?.routes?.name || 'Rute Kereta'
                    const trainName = booking.schedules?.trains?.name || 'Kereta Antarkota'
                    const trainNumber = booking.schedules?.trains?.train_number || ''

                    return (
                      <article key={booking.id} className={`rh-ticket-voucher is-${statusType}`}>
                        {/* Notches for authentic ticket perforation shape */}
                        <div className="rh-ticket-notch-left" aria-hidden="true" />
                        <div className="rh-ticket-notch-right" aria-hidden="true" />

                        {/* Ticket Stub Top Header */}
                        <div className="rh-ticket-stub-top">
                          <div>
                            <span className="rh-ticket-label">TIKET PERJALANAN KERETA</span>
                            <strong className="rh-ticket-train-title">
                              {trainName} {trainNumber ? `(${trainNumber})` : ''}
                            </strong>
                            <span className="rh-ticket-route-text">{routeName}</span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span className={`rh-ticket-badge ${statusBadgeClass}`}>
                              {statusLabel}
                            </span>
                            <strong className="rh-ticket-fare">
                              {formatIDR(booking.total_amount)}
                            </strong>
                          </div>
                        </div>

                        {/* Dashed Perforation Line */}
                        <div className="rh-ticket-perforation" aria-hidden="true" />

                        {/* Ticket Body: Passenger details & Seat info (Minimalist, Zero Icons) */}
                        <div className="rh-ticket-body">
                          {relatedTickets.length > 0 ? (
                            relatedTickets.map((t, idx) => (
                              <div key={t.id || t.ticket_number} className="rh-ticket-passenger-row">
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <span className="rh-ticket-label">PENUMPANG {idx + 1}</span>
                                  <strong className="rh-ticket-passenger-name">
                                    {t.passengers?.full_name || `Penumpang ${idx + 1}`}
                                  </strong>
                                  <span className="rh-ticket-code">
                                    {t.ticket_number}
                                  </span>
                                </div>
                                <div className="rh-ticket-seat-box">
                                  <span className="rh-ticket-label">TEMPAT DUDUK</span>
                                  <strong className="rh-ticket-seat-value">
                                    Gerbong {t.seats?.carriages?.carriage_number || '1'} · Kursi {t.seats?.seat_number || '-'}
                                  </strong>
                                  <span className="rh-ticket-class-name">
                                    {t.seats?.carriages?.carriage_class || 'Eksekutif'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rh-ticket-passenger-row">
                              <div>
                                <span className="rh-ticket-label">PENUMPANG</span>
                                <strong className="rh-ticket-passenger-name">1 Orang</strong>
                              </div>
                            </div>
                          )}

                          {/* Departure Date & Booking Code */}
                          <div className="rh-ticket-meta-row">
                            <div>
                              <span className="rh-ticket-label">JADWAL KEBERANGKATAN</span>
                              <span className="rh-ticket-meta-value">
                                {booking.schedules?.departure_time
                                  ? `${formatDate(booking.schedules.departure_time)} · ${formatTime(booking.schedules.departure_time)} WIB`
                                  : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="rh-ticket-label">KODE BOOKING</span>
                              <span className="rh-ticket-code-booking">{booking.booking_code}</span>
                            </div>
                          </div>

                          {/* Minimalist Action Buttons (NO ICONS, clean text buttons) */}
                          <div className="rh-ticket-actions">
                            {isPaid && canBoard && relatedTickets[0] && (
                              <button
                                type="button"
                                onClick={() => setSelectedTicketForQR({
                                  ...relatedTickets[0],
                                  qrImage: qrCodes[relatedTickets[0]?.ticket_number],
                                  booking
                                })}
                                className="rh-btn rh-btn-primary rh-btn-sm"
                              >
                                Buka E-Boarding Pass
                              </button>
                            )}

                            {booking.status === 'pending' && !isExpired && (
                              <Link href={`/booking/payment/${booking.id}`} className="rh-btn rh-btn-primary rh-btn-sm">
                                Lanjutkan Bayar
                              </Link>
                            )}

                            {canReschedule && (
                              <Link href={`/booking/payment/${booking.id}`} className="rh-btn rh-btn-sm" style={{ border: '1px solid rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderRadius: 8 }}>
                                Reschedule / Batal
                              </Link>
                            )}

                            {!isCompleted && !isExpired && isPaid && (
                              <button
                                type="button"
                                onClick={() => selectTab('overview')}
                                className="rh-btn rh-btn-sm"
                                style={{ border: '1px solid rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', borderRadius: 8 }}
                              >
                                Tracking Kereta
                              </button>
                            )}
                          </div>
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
            <div className="passenger-profile-page">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <button type="button" className="rh-back-btn" onClick={() => selectTab('overview')} aria-label="Kembali ke perjalanan" title="Kembali ke perjalanan">
                  <ArrowLeft size={18} />
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--rh-charcoal)' }}>Kembali</span>
              </div>
              <section className="passenger-profile-hero">
                <div className="passenger-profile-sky" aria-hidden="true"><Train size={88} /></div>
                <div className="passenger-profile-card">
                  <div className="passenger-profile-identity">
                    <span className="passenger-profile-avatar">{profileInitials}</span>
                    <div><h2>{profileName}</h2><p><Star size={17} /> Penumpang RAILHUB</p><small>{user?.email}</small></div>
                  </div>
                  <div className="passenger-profile-actions">
                    <button type="button" onClick={() => setShowEditProfile(value => !value)}><UserRound size={20} /> Lihat profil</button>
                  </div>
                </div>
              </section>

              {showEditProfile && <section id="edit-profile" className="rh-card passenger-profile-form">
                <h3 className="rh-h4">Data profil</h3>
                <form onSubmit={handleSaveProfile}>
                  <label className="rh-input-group"><span className="rh-label-text">Nama lengkap</span><input type="text" value={fullNameInput} onChange={event => setFullNameInput(event.target.value)} className="rh-input" required /></label>
                  <label className="rh-input-group"><span className="rh-label-text">Nomor telepon</span><input type="tel" value={phoneInput} onChange={event => setPhoneInput(event.target.value)} className="rh-input" placeholder="0812xxxxxxxx" /></label>
                  <label className="rh-input-group"><span className="rh-label-text">Email terdaftar</span><input type="email" value={user?.email || ''} className="rh-input" disabled /></label>
                  <button type="submit" disabled={savingProfile} className="rh-btn rh-btn-primary">{savingProfile ? 'Menyimpan…' : 'Simpan profil'}</button>
                </form>
              </section>}

              <nav className="passenger-profile-menu" aria-label="Menu akun">
                <button type="button" onClick={() => selectTab('tickets')}><span><QrCode size={20} /> QR tiket digital</span><ChevronRight size={21} /></button>
                <button type="button" onClick={() => setShowEditProfile(true)}><span><KeyRound size={20} /> Ubah data akun</span><ChevronRight size={21} /></button>
                <button type="button" onClick={() => selectTab('tickets')}><span><History size={20} /> Riwayat tiket</span><ChevronRight size={21} /></button>
                <Link href="/about"><span><ShieldCheck size={20} /> Keamanan &amp; privasi</span><ChevronRight size={21} /></Link>
                <button type="button" onClick={() => selectTab('tickets')}><span><Users size={20} /> Daftar penumpang</span><ChevronRight size={21} /></button>
              </nav>
            </div>
          )}
            </>
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
