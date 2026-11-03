'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  Coins,
  Compass,
  Copy,
  CreditCard,
  FileCheck,
  HelpCircle,
  IdCard,
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
  Wallet,
  Wifi,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import PassengerServices from '@/components/services/PassengerServices'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'

const TABS = [
  { id: 'overview', label: 'Ringkasan', icon: Compass },
  { id: 'tickets', label: 'Tiket Saya', icon: Ticket },
  { id: 'journey', label: 'Tracking Kereta', icon: Radio },
  { id: 'book', label: 'Pesan Tiket', icon: Train },
  { id: 'onboard', label: 'Layanan Restorasi', icon: Utensils },
  { id: 'reports', label: 'Laporan & Kehilangan', icon: AlertCircle },
  { id: 'rewards', label: 'Poin & Pencapaian', icon: Award },
  { id: 'account', label: 'Akun & KTP', icon: UserRound },
]

function PassengerDashboardContent() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState({})
  const [ticketCounts, setTicketCounts] = useState({})
  const [ticketDetails, setTicketDetails] = useState([])
  const [qrCodes, setQrCodes] = useState({})
  const [selectedTicketForQR, setSelectedTicketForQR] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Live countdown state
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isDeparted: false })

  // Journey simulation progress state
  const [journeyProgress, setJourneyProgress] = useState(38) // percentage (e.g. 38% completed)
  const [journeyStage, setJourneyStage] = useState('on_the_way') // 'boarding', 'on_the_way', 'arrived'

  // Profile real settings
  const [fullNameInput, setFullNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [cityInput, setCityInput] = useState('Jakarta')
  const [savingProfile, setSavingProfile] = useState(false)

  // KTP Verification dummy state
  const [ktpNumber, setKtpNumber] = useState('3171024508960002')
  const [ktpName, setKtpName] = useState('')
  const [ktpAddress, setKtpAddress] = useState('Jl. Merdeka No. 14, Jakarta Pusat')
  const [ktpVerified, setKtpVerified] = useState(true)
  const [ktpImageUploaded, setKtpImageUploaded] = useState(true)
  const [verifyingKTP, setVerifyingKTP] = useState(false)

  // Sync tab with URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab')
      if (tabParam && TABS.some(t => t.id === tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])

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
      setFullNameInput(profile.full_name || '')
      setPhoneInput(profile.phone_number || '')
      setKtpName(profile.full_name || 'Bagas Permana Putra')
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
          passengers(full_name, identity_number),
          seats(seat_number, carriages(carriage_number, carriage_class))
        `).in('booking_id', ids),
      ])

      if (!active) return
      if (paymentResult.error || ticketResult.error) {
        setError(`Ringkasan tiket tidak dapat dimuat: ${paymentResult.error?.message || ticketResult.error?.message}`)
        setLoading(false)
        return
      }

      setBookings(bookingRows || [])
      setPayments(Object.fromEntries((paymentResult.data || []).map(p => [p.booking_id, p])))
      setTicketDetails(ticketResult.data || [])

      setTicketCounts((ticketResult.data || []).reduce((acc, t) => {
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

  // Active paid booking for Live Tracking & Countdown
  const activePaidBooking = useMemo(() => {
    return bookings.find(b => b.status === 'paid') || bookings[0] || null
  }, [bookings])

  // Calculate live countdown to departure
  useEffect(() => {
    if (!activePaidBooking?.schedules?.departure_time) return

    function updateTimer() {
      const depTime = new Date(activePaidBooking.schedules.departure_time).getTime()
      const now = Date.now()
      const diff = depTime - now

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

  // Stop stations timeline mockup for current train
  const stopsTimetable = useMemo(() => {
    const dep = activePaidBooking?.schedules?.departure_time
      ? new Date(activePaidBooking.schedules.departure_time)
      : new Date()
    const depHour = dep.getHours()
    const depMin = dep.getMinutes()

    const pad = (n) => String(n).padStart(2, '0')
    const timeAt = (addMinutes) => {
      const d = new Date(dep.getTime() + addMinutes * 60000)
      return `${pad(d.getHours())}:${pad(d.getMinutes())} WIB`
    }

    return [
      { name: 'Gambir (GMR)', arrival: '—', stop: 'Stasiun Awal', departure: timeAt(0), platform: 'Peron 3 Jalur 2', status: 'passed' },
      { name: 'Cirebon (CN)', arrival: timeAt(145), stop: '4 Menit', departure: timeAt(149), platform: 'Peron 1 Jalur 3', status: journeyProgress > 30 ? 'current' : 'upcoming' },
      { name: 'Semarang Tawang (SMT)', arrival: timeAt(310), stop: '5 Menit', departure: timeAt(315), platform: 'Peron 2 Jalur 1', status: 'upcoming' },
      { name: 'Surabaya Pasarturi (SBI)', arrival: timeAt(490), stop: 'Stasiun Akhir', departure: '—', platform: 'Peron 4 Jalur 1', status: 'upcoming' },
    ]
  }, [activePaidBooking, journeyProgress])

  // Share Journey handler
  function handleShareJourney() {
    const trainName = activePaidBooking?.schedules?.trains?.name || 'KA Argo Bromo Anggrek'
    const route = activePaidBooking?.schedules?.routes?.name || 'Gambir — Surabaya'
    const shareText = `Lacak perjalanan saya dengan ${trainName} (${route}) di RAILHUB. Cek posisi real-time, jadwal stasiun, dan kedatangan peron di: https://railhub.id/dashboard/passenger?tab=journey`

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

  // KTP Verification handler
  function handleVerifyKTP(e) {
    e.preventDefault()
    if (ktpNumber.length !== 16) {
      toast.error('Nomor NIK harus 16 digit angka.')
      return
    }
    setVerifyingKTP(true)
    setTimeout(() => {
      setVerifyingKTP(false)
      setKtpVerified(true)
      toast.success('Verifikasi KTP Berhasil! Status akun Anda sekarang Terverifikasi KTP (Akun Terpercaya).')
    }, 1000)
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
          background: 'linear-gradient(135deg, #0F2552 0%, #16346F 50%, #1A428A 100%)',
          color: 'white',
          padding: '2.5rem 0 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="rh-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="rh-badge" style={{ background: 'rgba(255,255,255,0.14)', color: 'var(--rh-accent)' }}>
                    <Train size={13} /> Dashboard Penumpang RAILHUB
                  </span>
                  {ktpVerified && (
                    <span className="rh-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                      <CheckCircle2 size={12} /> Terverifikasi KTP
                    </span>
                  )}
                </div>
                <h1 className="rh-h2" style={{ color: 'white', margin: 0 }}>
                  Halo, {profile?.full_name || 'Penumpang RailHub'}
                </h1>
                <p style={{ margin: '0.35rem 0 0', color: 'rgba(255,255,255,0.82)', fontSize: '0.92rem' }}>
                  Kelola tiket digital QR, pantau live tracking kereta ala aplikasi modern, pesan makanan restorasi, dan nikmati reward perjalanan Anda.
                </p>
              </div>

              {/* Wallet quick balance */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 16,
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}>
                <div>
                  <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Saldo RailPay</small>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'white' }}>Rp 350.000</strong>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
                <div>
                  <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>RailPoints</small>
                  <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--rh-accent)' }}>1.250 Poin</strong>
                </div>
              </div>
            </div>

            {/* ── 8 MENU TABS NAVIGATION ── */}
            <nav style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1.75rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
            }} aria-label="Menu Dashboard Penumpang">
              {TABS.map(tab => {
                const TabIcon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="rh-btn rh-btn-sm"
                    style={{
                      background: isActive ? 'white' : 'rgba(255,255,255,0.12)',
                      color: isActive ? 'var(--rh-primary)' : 'white',
                      fontWeight: isActive ? 800 : 600,
                      borderRadius: 12,
                      padding: '0.6rem 1rem',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.18)',
                      transition: 'all 0.2s',
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
              TAB 1: OVERVIEW
              ════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: '1.75rem' }}>
              {/* Highlight Card: Upcoming Active Journey & Live Countdown */}
              {activePaidBooking && (
                <section className="rh-card" style={{
                  background: 'linear-gradient(135deg, #1A428A 0%, #16346F 100%)',
                  color: 'white',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.18)', padding: '0.3rem 0.8rem', borderRadius: 999,
                        fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--rh-accent)'
                      }}>
                        Perjalanan Aktif Terdekat
                      </span>
                      <span className="rh-mono" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                        Kode Booking: <strong>{activePaidBooking.booking_code}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'white' }}>
                          {activePaidBooking.schedules?.trains?.name || 'KA Argo Bromo Anggrek'}
                        </h2>
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                          {activePaidBooking.schedules?.trains?.train_number || 'KA 1'} · {activePaidBooking.schedules?.routes?.name || 'Gambir — Surabaya'}
                        </span>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                          <div>
                            <small style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Nomor Peron</small>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--rh-accent)' }}>Peron 3 Jalur 2</strong>
                          </div>
                          <div>
                            <small style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Gerbong & Kursi</small>
                            <strong style={{ fontSize: '1.1rem', color: 'white' }}>Eksekutif 1 · 12A</strong>
                          </div>
                          <div>
                            <small style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Keberangkatan</small>
                            <strong style={{ fontSize: '1.1rem', color: 'white' }}>
                              {activePaidBooking.schedules?.departure_time ? formatTime(activePaidBooking.schedules.departure_time) : '08:00 WIB'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Live Automatic Departure Countdown */}
                      <div style={{
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: 16,
                        padding: '1.25rem',
                        border: '1px solid rgba(255,255,255,0.15)',
                        textAlign: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--rh-accent)', fontWeight: 800, marginBottom: '0.5rem' }}>
                          <Clock3 size={16} /> HITUNG MUNDUR KEBERANGKATAN
                        </div>
                        {countdown.isDeparted ? (
                          <div style={{ padding: '0.5rem 0' }}>
                            <span className="rh-badge rh-badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                              Kereta Telah Berangkat / Sedang Berjalan
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                            <div>
                              <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{String(countdown.hours).padStart(2, '0')}</div>
                              <small style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>JAM</small>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>:</div>
                            <div>
                              <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{String(countdown.minutes).padStart(2, '0')}</div>
                              <small style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>MENIT</small>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>:</div>
                            <div>
                              <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--rh-accent)' }}>{String(countdown.seconds).padStart(2, '0')}</div>
                              <small style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>DETIK</small>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setActiveTab('journey')}
                            className="rh-btn rh-btn-sm"
                            style={{ background: 'var(--rh-accent)', color: '#0F2552', fontWeight: 800 }}
                          >
                            <Radio size={14} /> Live Tracking Kereta
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('tickets')}
                            className="rh-btn rh-btn-sm"
                            style={{ background: 'white', color: 'var(--rh-primary)', fontWeight: 800 }}
                          >
                            <QrCode size={14} /> QR E-Boarding Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('onboard')}
                            className="rh-btn rh-btn-sm"
                            style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                          >
                            <Utensils size={14} /> Pesan Makan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Quick Actions Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('journey')}
                  className="rh-card rh-card-interactive"
                  style={{ padding: '1.25rem', textAlign: 'left', border: '1px solid var(--rh-border)', cursor: 'pointer', background: 'white' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--rh-primary-light)', color: 'var(--rh-primary)', display: 'grid', placeItems: 'center', marginBottom: '0.75rem' }}>
                    <Radio size={20} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.98rem' }}>Live Tracking Kereta</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>Lihat posisi stasiun & animasi perjalanan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="rh-card rh-card-interactive"
                  style={{ padding: '1.25rem', textAlign: 'left', border: '1px solid var(--rh-border)', cursor: 'pointer', background: 'white' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,140,0,0.14)', color: 'var(--rh-accent-dark)', display: 'grid', placeItems: 'center', marginBottom: '0.75rem' }}>
                    <Ticket size={20} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.98rem' }}>E-Boarding Pass QR</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>Tiket digital siap scan kondektur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('onboard')}
                  className="rh-card rh-card-interactive"
                  style={{ padding: '1.25rem', textAlign: 'left', border: '1px solid var(--rh-border)', cursor: 'pointer', background: 'white' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168,50,50,0.14)', color: 'var(--rh-secondary)', display: 'grid', placeItems: 'center', marginBottom: '0.75rem' }}>
                    <Utensils size={20} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.98rem' }}>Pesan Makanan Onboard</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>Kuliner hangat diantar ke kursi Anda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="rh-card rh-card-interactive"
                  style={{ padding: '1.25rem', textAlign: 'left', border: '1px solid var(--rh-border)', cursor: 'pointer', background: 'white' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.14)', color: '#10B981', display: 'grid', placeItems: 'center', marginBottom: '0.75rem' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.98rem' }}>Verifikasi KTP</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>Cek status akun dan validasi identitas</span>
                </button>
              </div>

              {/* Recent Bookings Overview Table */}
              <section className="rh-card">
                <div className="rh-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="rh-h4" style={{ margin: 0 }}>Riwayat Booking Terbaru</h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>Daftar pemesanan tiket Anda di RAILHUB</p>
                  </div>
                  <button type="button" onClick={() => setActiveTab('tickets')} className="rh-btn rh-btn-ghost rh-btn-sm">
                    Lihat Semua Tiket <ArrowRight size={14} />
                  </button>
                </div>
                <div className="rh-card-body">
                  {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--rh-text-2)' }}>
                      <Train size={32} style={{ marginBottom: 8, color: 'var(--rh-primary)' }} />
                      <p>Belum ada tiket atau perjalanan yang dipesan.</p>
                      <button type="button" onClick={() => setActiveTab('book')} className="rh-btn rh-btn-primary rh-btn-sm" style={{ marginTop: '0.5rem' }}>
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
                <button type="button" onClick={() => setActiveTab('book')} className="rh-btn rh-btn-primary rh-btn-sm">
                  <Train size={15} /> Pesan Tiket Baru
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="rh-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--rh-text-2)' }}>
                  <Ticket size={40} style={{ color: 'var(--rh-primary)', marginBottom: 12 }} />
                  <h3>Belum Ada Tiket</h3>
                  <p>Anda belum memiliki tiket aktif. Cari jadwal dan pilih kursi sekarang.</p>
                  <button type="button" onClick={() => setActiveTab('book')} className="rh-btn rh-btn-primary" style={{ marginTop: '0.75rem' }}>
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
                          background: isPaid ? 'linear-gradient(135deg, #1A428A 0%, #12306A 100%)' : 'var(--rh-navy)',
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
                                onClick={() => setActiveTab('journey')}
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
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
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
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 1000,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                  display: 'grid', placeItems: 'center', padding: '1rem',
                }} onClick={() => setSelectedTicketForQR(null)}>
                  <div className="rh-card" style={{ maxWidth: 360, width: '100%', padding: '1.75rem', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicketForQR(null)}
                      style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                    <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.75rem' }}>E-Boarding Pass QR</span>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem' }}>{selectedTicketForQR.passengers?.full_name}</h3>
                    <p style={{ margin: 0, color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>
                      Kursi {selectedTicketForQR.seats?.seat_number} · Gerbong {selectedTicketForQR.seats?.carriages?.carriage_number}
                    </p>
                    <div style={{ margin: '1.25rem auto', display: 'inline-block', padding: 8, background: 'white', borderRadius: 12, border: '1px solid var(--rh-border)', boxShadow: 'var(--shadow-md)' }}>
                      <Image src={selectedTicketForQR.qrImage} alt="QR Tiket" width={220} height={220} unoptimized />
                    </div>
                    <span className="rh-mono" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--rh-primary)' }}>
                      {selectedTicketForQR.ticket_number}
                    </span>
                    <small style={{ display: 'block', color: 'var(--rh-text-3)', marginTop: 6, fontSize: '0.75rem' }}>
                      Tunjukkan layar ini ke kondektur untuk scan gerbang boarding
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 3: MY JOURNEY (LIVE TRACKING ALA GRAB)
              ════════════════════════════════════════════════ */}
          {activeTab === 'journey' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 2 }}>
                    <span className="rh-badge" style={{ background: '#FF8C00', color: '#0F2552', fontWeight: 800 }}>
                      <Radio size={13} className="animate-pulse" /> LIVE TRACKING
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)', fontWeight: 600 }}>
                      Tracking Perjalanan Kereta Api
                    </span>
                  </div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>
                    {activePaidBooking?.schedules?.trains?.name || 'KA Argo Bromo Anggrek'} ({activePaidBooking?.schedules?.trains?.train_number || 'KA 1'})
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleShareJourney}
                    className="rh-btn rh-btn-sm"
                    style={{ background: 'var(--rh-accent)', color: '#0F2552', fontWeight: 800 }}
                  >
                    <Share2 size={15} /> Bagikan Perjalanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('onboard')}
                    className="rh-btn rh-btn-primary rh-btn-sm"
                  >
                    <Utensils size={15} /> Beli Makan di Kereta
                  </button>
                </div>
              </div>

              {/* Grab-like Interactive Journey Simulator Card */}
              <section className="rh-card" style={{
                background: 'linear-gradient(135deg, #0F2552 0%, #16346F 60%, #1A428A 100%)',
                color: 'white',
                borderRadius: 22,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                padding: 'clamp(1.25rem, 3vw, 2rem)',
              }}>
                {/* Info Bar at top */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Lokasi Peron</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--rh-accent)' }}>Peron 3 Jalur 2</strong>
                    <small style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>Stasiun Gambir</small>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Gerbong Penumpang</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: 'white' }}>Eksekutif 1</strong>
                    <small style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>Kabin Depan</small>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Nomor Kursi</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: 'white' }}>Kursi 12A & 12B</strong>
                    <small style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>Sisi Jendela</small>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Kecepatan Tempuh</span>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: '#10B981' }}>115 km/jam</strong>
                    <small style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>Lintas Pantura</small>
                  </div>
                </div>

                {/* Animated Track & Moving Train Visual (ala Grab / Transportation App) */}
                <div style={{ margin: '2rem 0 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={16} style={{ color: 'var(--rh-accent)' }} /> Progres Lintasan Kereta
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--rh-accent)', fontFamily: 'var(--font-mono)' }}>
                      {journeyProgress}% Menuju Stasiun Tujuan
                    </span>
                  </div>

                  {/* Railway track rail */}
                  <div style={{
                    position: 'relative',
                    height: 12,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 999,
                    overflow: 'visible',
                  }}>
                    {/* Fill */}
                    <div style={{
                      height: '100%',
                      width: `${journeyProgress}%`,
                      background: 'linear-gradient(90deg, #FF8C00, #F59E0B)',
                      borderRadius: 999,
                      transition: 'width 0.4s ease',
                    }} />

                    {/* Animated moving train icon */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${journeyProgress}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'white',
                      color: 'var(--rh-primary)',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 0 16px rgba(255, 140, 0, 0.8)',
                      transition: 'left 0.4s ease',
                      zIndex: 2,
                    }}>
                      <Train size={20} />
                    </div>
                  </div>

                  {/* Track end labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.85rem', fontSize: '0.85rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ display: 'block' }}>Gambir (GMR)</strong>
                      <small style={{ color: 'rgba(255,255,255,0.7)' }}>Berangkat 08:00 WIB</small>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--rh-accent)', fontSize: '0.8rem' }}>
                      <span>Sedang Berjalan di Antara Cirebon — Semarang</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block' }}>Surabaya Pasarturi (SBI)</strong>
                      <small style={{ color: 'rgba(255,255,255,0.7)' }}>Estimasi Tiba 16:15 WIB</small>
                    </div>
                  </div>

                  {/* Interactive simulation controls (to demonstrate the moving train feature requested!) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    <small style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', marginRight: '0.25rem' }}>Simulasi Posisi:</small>
                    <button
                      type="button"
                      onClick={() => { setJourneyProgress(10); setJourneyStage('boarding'); toast.success('Status: Kereta di stasiun awal (Boarding)') }}
                      className="rh-btn rh-btn-sm"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: journeyProgress === 10 ? 'var(--rh-accent)' : 'rgba(255,255,255,0.15)', color: journeyProgress === 10 ? '#0F2552' : 'white' }}
                    >
                      Stasiun Gambir (10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setJourneyProgress(45); setJourneyStage('on_the_way'); toast.success('Status: Kereta melaju kencang di jalur Pantura') }}
                      className="rh-btn rh-btn-sm"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: journeyProgress === 45 ? 'var(--rh-accent)' : 'rgba(255,255,255,0.15)', color: journeyProgress === 45 ? '#0F2552' : 'white' }}
                    >
                      Lintas Cirebon (45%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setJourneyProgress(75); setJourneyStage('on_the_way'); toast.success('Status: Kereta mendekati Semarang') }}
                      className="rh-btn rh-btn-sm"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: journeyProgress === 75 ? 'var(--rh-accent)' : 'rgba(255,255,255,0.15)', color: journeyProgress === 75 ? '#0F2552' : 'white' }}
                    >
                      Semarang Tawang (75%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setJourneyProgress(100); setJourneyStage('arrived'); toast.success('Status: Kereta tiba di stasiun akhir Surabaya') }}
                      className="rh-btn rh-btn-sm"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: journeyProgress === 100 ? 'var(--rh-accent)' : 'rgba(255,255,255,0.15)', color: journeyProgress === 100 ? '#0F2552' : 'white' }}
                    >
                      Tiba di Tujuan (100%)
                    </button>
                  </div>
                </div>
              </section>

              {/* Station Stops Timetable (Jam stop, jam datang, jam sampai, nomor peron) */}
              <section className="rh-card">
                <div className="rh-card-header">
                  <h3 className="rh-h4" style={{ margin: 0 }}>Jadwal Perhentian Stasiun & Informasi Peron</h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>
                    Informasi waktu kedatangan, durasi berhenti, dan nomor peron kereta di setiap stasiun lintasan.
                  </p>
                </div>
                <div className="rh-card-body">
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {stopsTimetable.map((stop, index) => {
                      const isPassed = stop.status === 'passed'
                      const isCurrent = stop.status === 'current'
                      return (
                        <div key={stop.name} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          borderRadius: 14,
                          background: isCurrent ? 'var(--rh-primary-light)' : 'white',
                          border: isCurrent ? '2px solid var(--rh-primary)' : '1px solid var(--rh-border)',
                          position: 'relative',
                        }}>
                          {/* Dot indicator */}
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: isPassed ? 'var(--rh-success)' : isCurrent ? 'var(--rh-primary)' : 'var(--rh-surface-2)',
                            color: isPassed || isCurrent ? 'white' : 'var(--rh-text-3)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            flexShrink: 0,
                          }}>
                            {isPassed ? '✓' : index + 1}
                          </div>

                          {/* Station details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--rh-text)' }}>{stop.name}</strong>
                              {isCurrent && (
                                <span className="rh-badge rh-badge-primary" style={{ fontSize: '0.7rem' }}>
                                  Stasiun Berikutnya
                                </span>
                              )}
                              {isPassed && (
                                <span className="rh-badge rh-badge-success" style={{ fontSize: '0.7rem' }}>
                                  Sudah Dilintasi
                                </span>
                              )}
                            </div>
                            <span style={{ display: 'block', color: 'var(--rh-primary)', fontWeight: 700, fontSize: '0.85rem', marginTop: 2 }}>
                              <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                              {stop.platform}
                            </span>
                          </div>

                          {/* Times */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                              Datang: <strong style={{ color: 'var(--rh-text)' }}>{stop.arrival}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                              Berangkat: <strong style={{ color: 'var(--rh-text)' }}>{stop.departure}</strong>
                            </div>
                            <small style={{ fontSize: '0.72rem', color: 'var(--rh-text-3)' }}>Berhenti {stop.stop}</small>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* Cabin & Facility Info on this Train */}
              <section className="rh-card">
                <div className="rh-card-header">
                  <h3 className="rh-h4" style={{ margin: 0 }}>Fasilitas Rangkaian Kereta Anda</h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>
                    Kenyamanan kabin kelas Eksekutif & Restorasi KA Argo Bromo Anggrek
                  </p>
                </div>
                <div className="rh-card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    {[
                      { icon: Wifi, title: 'WiFi Onboard Gratis', desc: 'Koneksi internet stabil sepanjang lintasan' },
                      { icon: Utensils, title: 'Bistro & Kereta Makan', desc: 'Pesan makanan dari tempat duduk Anda' },
                      { icon: Sparkles, title: 'Captain Seat Ergonomis', desc: 'Reclining 140° dengan leg-rest luas' },
                      { icon: Coffee, title: 'Stopkontak Tiap Baris', desc: 'Port pengisian daya laptop & HP' },
                    ].map(f => {
                      const IconComponent = f.icon
                      return (
                        <div key={f.title} style={{ padding: '1rem', borderRadius: 12, background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }}>
                          <IconComponent size={20} style={{ color: 'var(--rh-primary)', marginBottom: '0.5rem' }} />
                          <strong style={{ display: 'block', fontSize: '0.92rem' }}>{f.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>{f.desc}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 4: BOOK TICKET
              ════════════════════════════════════════════════ */}
          {activeTab === 'book' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Pencarian Jadwal & Pemesanan Tiket</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Pilih stasiun asal, tujuan, tanggal keberangkatan, dan jumlah penumpang (hingga 6 orang sekaligus).
                </p>
              </div>

              <div className="rh-search-card" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--rh-border)' }}>
                <SearchWidget />
              </div>

              {/* Popular quick routes */}
              <div className="rh-card" style={{ padding: '1.5rem' }}>
                <h3 className="rh-h4" style={{ marginBottom: '1rem' }}>Rute Favorit Penumpang</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {[
                    { from: 'GMR', to: 'SGU', name: 'Gambir → Surabaya', price: 'Rp 350.000' },
                    { from: 'GMR', to: 'YK', name: 'Gambir → Yogyakarta', price: 'Rp 250.000' },
                    { from: 'GMR', to: 'BD', name: 'Gambir → Bandung', price: 'Rp 150.000' },
                    { from: 'BD', to: 'SLO', name: 'Bandung → Solo', price: 'Rp 195.000' },
                  ].map(r => (
                    <Link
                      key={r.name}
                      href={`/trains?from=${r.from}&to=${r.to}&date=${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}&pax=1`}
                      className="rh-card rh-card-interactive"
                      style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--rh-text)' }}>{r.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--rh-primary)', fontWeight: 700 }}>{r.price}</span>
                      </div>
                      <ChevronRight size={16} color="var(--rh-text-3)" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 5: ONBOARD SERVICES (RESTORASI MAKANAN & BANTUAN)
              ════════════════════════════════════════════════ */}
          {activeTab === 'onboard' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Layanan Restorasi & Makanan di Kereta</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Pesan makanan hangat dan minuman khas kereta api. Petugas pramugari akan mengantarkan pesanan langsung ke nomor kursi Anda.
                </p>
              </div>

              {user && (
                <PassengerServices
                  userId={user.id}
                  bookingId={activePaidBooking?.id}
                  showReports={false}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 6: MY REPORTS (LAPORAN KEHILANGAN & KENDALA)
              ════════════════════════════════════════════════ */}
          {activeTab === 'reports' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Pusat Bantuan & Laporan Barang Hilang (Lost & Found)</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Laporkan barang tertinggal di gerbong kereta atau kendala layanan perjalanan. Petugas kondektur dan customer service akan menindaklanjuti.
                </p>
              </div>

              {user && (
                <PassengerServices
                  userId={user.id}
                  bookingId={activePaidBooking?.id}
                  showReports={true}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 7: REWARDS & PENCAPAIAN
              ════════════════════════════════════════════════ */}
          {activeTab === 'rewards' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>RailPoints & Pencapaian Penumpang</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Kumpulkan poin dari setiap pemesanan tiket kereta dan buka lencana petualangan se-Pulau Jawa.
                </p>
              </div>

              {/* Points Card */}
              <div className="rh-card" style={{
                background: 'linear-gradient(135deg, #1A428A 0%, #12306A 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: 20,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--rh-accent)' }}>
                    Total Akumulasi Poin
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', margin: '0.25rem 0' }}>
                    1.250 <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>RailPoints</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                    Tingkat Keanggotaan: <strong style={{ color: '#FFD700' }}>Gold Tier (Prioritas Boarding)</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => toast.success('Kupon diskon 10% F&B Kereta berhasil ditukarkan dengan 100 Poin!')} className="rh-btn rh-btn-sm" style={{ background: 'var(--rh-accent)', color: '#0F2552', fontWeight: 800 }}>
                    <Sparkles size={14} /> Tukar Kupon Diskon F&B
                  </button>
                </div>
              </div>

              {/* Achievement Badges */}
              <section className="rh-card">
                <div className="rh-card-header">
                  <h3 className="rh-h4" style={{ margin: 0 }}>Lencana Pencapaian Perjalanan</h3>
                </div>
                <div className="rh-card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {[
                      { title: 'Penjelajah Jawa', desc: 'Melakukan perjalanan ke lebih dari 3 kota di Pulau Jawa', unlocked: true, icon: Compass },
                      { title: 'Sahabat Eksekutif', desc: 'Merasakan kenyamanan kursi kelas Eksekutif', unlocked: true, icon: Award },
                      { title: 'Kolektor Peron', desc: 'Melakukan boarding di 5 stasiun utama', unlocked: true, icon: MapPin },
                      { title: 'Pecinta Kuliner Kereta', desc: 'Memesan menu restorasi di atas kereta api', unlocked: true, icon: Utensils },
                    ].map(b => {
                      const BadgeIcon = b.icon
                      return (
                        <div key={b.title} style={{
                          padding: '1.25rem',
                          borderRadius: 14,
                          border: '1.5px solid var(--rh-border)',
                          background: b.unlocked ? 'white' : 'var(--rh-surface-2)',
                          display: 'flex',
                          gap: '0.85rem',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: b.unlocked ? 'linear-gradient(135deg, var(--rh-primary), #12306A)' : '#94A3B8',
                            color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0
                          }}>
                            <BadgeIcon size={22} />
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{b.title}</strong>
                            <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem' }}>{b.desc}</small>
                            <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--rh-success)', marginTop: 4 }}>
                              ✓ Terbuka
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              TAB 8: MY ACCOUNT & KTP VERIFICATION
              ════════════════════════════════════════════════ */}
          {activeTab === 'account' && (
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: 800 }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Pengaturan Akun & Verifikasi KTP</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
                  Perbarui profil Anda dan selesaikan verifikasi identitas KTP untuk keamanan akun dan e-boarding pass.
                </p>
              </div>

              {/* KTP Verification Card */}
              <section className="rh-card" style={{ border: ktpVerified ? '1.5px solid #10B981' : '1px solid var(--rh-border)' }}>
                <div className="rh-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IdCard size={20} color="var(--rh-primary)" />
                    <h3 className="rh-h4" style={{ margin: 0 }}>Verifikasi Identitas KTP (Simulasi)</h3>
                  </div>
                  {ktpVerified ? (
                    <span className="rh-badge rh-badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      <CheckCircle2 size={14} /> Terverifikasi KTP
                    </span>
                  ) : (
                    <span className="rh-badge rh-badge-warning">Belum Terverifikasi</span>
                  )}
                </div>
                <div className="rh-card-body">
                  <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--rh-text-2)' }}>
                    Verifikasi KTP memastikan nama pada tiket digital sesuai dengan identitas resmi penumpang kereta api.
                  </p>

                  <form onSubmit={handleVerifyKTP} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <label className="rh-input-group">
                        <span className="rh-label-text">Nomor Induk Kependudukan (NIK 16 Digit)</span>
                        <input
                          type="text"
                          maxLength={16}
                          value={ktpNumber}
                          onChange={e => setKtpNumber(e.target.value.replace(/\D/g, ''))}
                          className="rh-input rh-mono"
                          placeholder="Contoh: 3171024508960002"
                          required
                        />
                      </label>
                      <label className="rh-input-group">
                        <span className="rh-label-text">Nama Sesuai KTP</span>
                        <input
                          type="text"
                          value={ktpName}
                          onChange={e => setKtpName(e.target.value)}
                          className="rh-input"
                          placeholder="Nama lengkap sesuai e-KTP"
                          required
                        />
                      </label>
                    </div>

                    <label className="rh-input-group">
                      <span className="rh-label-text">Alamat Domisili KTP</span>
                      <input
                        type="text"
                        value={ktpAddress}
                        onChange={e => setKtpAddress(e.target.value)}
                        className="rh-input"
                        placeholder="Alamat kota/provinsi"
                        required
                      />
                    </label>

                    {/* Dummy KTP Photo Upload Preview */}
                    <div style={{
                      padding: '1.25rem',
                      borderRadius: 14,
                      border: '2px dashed var(--rh-border)',
                      background: 'var(--rh-surface)',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        maxWidth: 260,
                        margin: '0 auto 0.75rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #1A428A, #2A5CB5)',
                        color: 'white',
                        borderRadius: 10,
                        boxShadow: 'var(--shadow-md)',
                        textAlign: 'left',
                      }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFD700' }}>
                          REPUBLIK INDONESIA · KTP ELEKTRONIK
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, margin: '6px 0 2px' }}>
                          NIK: {ktpNumber || '3171xxxxxxxxxxxx'}
                        </div>
                        <div style={{ fontSize: '0.75rem' }}>Nama: {ktpName || 'Penumpang'}</div>
                        <div style={{ fontSize: '0.65rem', color: '#E2E8F0' }}>Status: Berlaku Seumur Hidup</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'block' }}>
                        {ktpImageUploaded ? '✓ Foto Dokumen KTP Terlampir (Simulasi)' : 'Unggah foto kartu KTP'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="submit" disabled={verifyingKTP} className="rh-btn rh-btn-primary">
                        {verifyingKTP ? 'Memverifikasi...' : 'Simpan & Verifikasi KTP'}
                      </button>
                    </div>
                  </form>
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
                        {savingProfile ? 'Menyimpan...' : 'Perbarui Pengaturan'}
                      </button>
                    </div>
                  </form>
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
          <strong>Memuat Dashboard Penumpang...</strong>
        </div>
      </div>
    }>
      <PassengerDashboardContent />
    </Suspense>
  )
}
