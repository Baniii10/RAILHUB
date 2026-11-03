'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  RefreshCw,
  Search,
  TicketCheck,
  Train,
  UserRound,
  Users,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'
import { getJourneyStatusLabel } from '@/lib/operations/journey-status'

const emptyStats = { passengers: 0, bookings: 0, trains: 0, stations: 0, revenue: 0, activeSchedules: 0 }
const bookingStatusLabels = {
  pending: 'Menunggu pembayaran',
  paid: 'Terbayar',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
  refunded: 'Dikembalikan',
}
const paymentStatusLabels = {
  pending: 'Menunggu',
  confirmed: 'Terkonfirmasi',
  failed: 'Gagal',
  refunded: 'Dikembalikan',
  cancelled: 'Dibatalkan',
}

const statusColors = {
  scheduled: ['var(--rh-info-light)', 'var(--rh-info)'],
  boarding: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  departed: ['var(--rh-primary-light)', 'var(--rh-primary)'],
  arrived: ['var(--rh-success-light)', 'var(--rh-success)'],
  delayed: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  cancelled: ['var(--rh-danger-light)', 'var(--rh-danger)'],
  pending: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  paid: ['var(--rh-success-light)', 'var(--rh-success)'],
  expired: ['var(--rh-surface-2)', 'var(--rh-text-2)'],
  refunded: ['var(--rh-info-light)', 'var(--rh-info)'],
}

function isAdminPreview() {
  return new URLSearchParams(window.location.search).get('preview') === '1'
}

function jakartaDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function addDateDays(dateValue, days) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function jakartaDateStart(dateValue) {
  return new Date(`${dateValue}T00:00:00+07:00`).toISOString()
}

function StatusBadge({ status, label }) {
  const [background, color] = statusColors[status] || ['var(--rh-surface-2)', 'var(--rh-text-2)']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '0.25rem 0.65rem', background, color, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label || getJourneyStatusLabel(status)}
    </span>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState(emptyStats)
  const [schedules, setSchedules] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState({})
  const [assignments, setAssignments] = useState([])
  const [recentAssignments, setRecentAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingTrainFilter, setBookingTrainFilter] = useState('all')
  const [bookingDateFrom, setBookingDateFrom] = useState('')
  const [bookingDateTo, setBookingDateTo] = useState('')
  const [bookingDateSort, setBookingDateSort] = useState('ascending')
  const [appliedScheduleDates, setAppliedScheduleDates] = useState({ from: '', to: '' })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const from = jakartaDateInputValue()
      const to = addDateDays(from, 6)
      setAppliedScheduleDates({ from, to })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const isPreview = isAdminPreview()
    if (isPreview) {
      const timer = window.setTimeout(() => setPreviewMode(true), 0)
      return () => window.clearTimeout(timer)
    }
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fadmin')
    } else if (profile?.role && profile.role !== 'admin') {
      router.replace(profile.role === 'conductor' ? '/dashboard/staff' : '/dashboard/passenger')
    }
  }, [authLoading, user, profile, router])

  const loadAdminData = useCallback(async () => {
    if (!appliedScheduleDates.from || !appliedScheduleDates.to) return
    setError('')
    if (isAdminPreview()) {
      const sampleSchedule = {
        id: 'preview-schedule-1',
        status: 'scheduled',
        departure_time: '2026-11-05T00:30:00.000Z',
        arrival_time: '2026-11-05T03:30:00.000Z',
        trains: { name: 'Argo Parahyangan', train_number: 'KA 34' },
        routes: { name: 'Gambir – Bandung' },
      }
      const sampleDepartureDate = jakartaDateInputValue(new Date(sampleSchedule.departure_time))
      const sampleScheduleMatchesDates = sampleDepartureDate >= appliedScheduleDates.from
        && sampleDepartureDate <= appliedScheduleDates.to
      setStats({ passengers: 128, bookings: 86, trains: 12, stations: 10, revenue: 28450000, activeSchedules: 24 })
      setSchedules(sampleScheduleMatchesDates ? [sampleSchedule] : [])
      setBookings([{
        id: 'preview-booking-1',
        booking_code: 'RH-DEMO-001',
        total_amount: 425000,
        status: 'paid',
        created_at: '2026-11-01T04:30:00.000Z',
        schedules: sampleSchedule,
      }])
      setPayments({ 'preview-booking-1': { status: 'confirmed', method: 'simulation' } })
      setAssignments(sampleScheduleMatchesDates ? [{
        schedule_id: sampleSchedule.id,
      }] : [])
      setRecentAssignments(sampleScheduleMatchesDates ? [{
        id: 'preview-assignment-1',
        schedule_id: sampleSchedule.id,
        profiles: { full_name: 'Contoh Petugas', email: 'petugas@example.test' },
        schedules: sampleSchedule,
      }] : [])
      setLoading(false)
      return
    }
    if (!user || profile?.role !== 'admin') return
    const supabase = createClient()

    const results = await Promise.all([
      supabase.from('schedules')
        .select('id, status, departure_time, arrival_time, trains(name, train_number), routes(name)')
        .gte('departure_time', jakartaDateStart(appliedScheduleDates.from))
        .lt('departure_time', jakartaDateStart(addDateDays(appliedScheduleDates.to, 1)))
        .order('departure_time')
        .limit(1000),
      supabase.from('staff_assignments').select('schedule_id').limit(1000),
      supabase.from('staff_assignments')
        .select('id, staff_id, schedule_id, profiles!staff_assignments_staff_id_fkey(full_name, email), schedules(departure_time, trains(name, train_number), routes(name))')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.rpc('get_admin_dashboard_stats'),
      supabase.from('bookings').select('id, booking_code, total_amount, status, created_at, schedules(departure_time, trains(name, train_number), routes(name))').order('created_at', { ascending: false }).limit(100),
    ])

    const failure = results.find(result => result.error)
    if (failure) {
      setError(`Data admin tidak dapat dimuat: ${failure.error.message}`)
      setLoading(false)
      return
    }

    const [scheduleResult, assignmentResult, recentAssignmentResult, statsResult, bookingResult] = results
    const bookingIds = (bookingResult.data || []).map(booking => booking.id)
    let paymentRows = []
    if (bookingIds.length > 0) {
      const { data, error: paymentError } = await supabase.from('payments').select('booking_id, status, method').in('booking_id', bookingIds)
      if (paymentError) {
        setError(`Status pembayaran tidak dapat dimuat: ${paymentError.message}`)
        setLoading(false)
        return
      }
      paymentRows = data || []
    }

    setSchedules(scheduleResult.data || [])
    setBookings(bookingResult.data || [])
    setPayments(Object.fromEntries(paymentRows.map(payment => [payment.booking_id, payment])))
    setAssignments(assignmentResult.data || [])
    setRecentAssignments(recentAssignmentResult.data || [])
    setStats({
      passengers: Number(statsResult.data?.passengers || 0),
      bookings: Number(statsResult.data?.bookings || 0),
      trains: Number(statsResult.data?.trains || 0),
      stations: Number(statsResult.data?.stations || 0),
      revenue: Number(statsResult.data?.revenue || 0),
      activeSchedules: Number(statsResult.data?.active_schedules || 0),
    })
    setLoading(false)
  }, [user, profile?.role, appliedScheduleDates])

  useEffect(() => {
    const timer = window.setTimeout(() => loadAdminData(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAdminData, reloadKey])

  const assignmentCounts = useMemo(() => assignments.reduce((counts, assignment) => {
    counts[assignment.schedule_id] = (counts[assignment.schedule_id] || 0) + 1
    return counts
  }, {}), [assignments])
  const unassignedSchedules = schedules.filter(schedule => schedule.status !== 'cancelled' && !assignmentCounts[schedule.id]).length
  const delayedSchedules = schedules.filter(schedule => schedule.status === 'delayed').length
  const filteredBookings = bookings.filter(booking => {
    const search = bookingSearch.trim().toLocaleLowerCase('id-ID')
    const departureDate = booking.schedules?.departure_time
      ? jakartaDateInputValue(new Date(booking.schedules.departure_time))
      : ''
    const trainKey = booking.schedules?.trains
      ? `${booking.schedules.trains.name || ''}::${booking.schedules.trains.train_number || ''}`
      : ''
    const matchesSearch = !search || [
      booking.booking_code,
      booking.schedules?.trains?.name,
      booking.schedules?.trains?.train_number,
      booking.schedules?.routes?.name,
    ].some(value => value?.toLocaleLowerCase('id-ID').includes(search))
    const matchesTrain = bookingTrainFilter === 'all' || trainKey === bookingTrainFilter
    const matchesDate = (!bookingDateFrom || departureDate >= bookingDateFrom)
      && (!bookingDateTo || departureDate <= bookingDateTo)
    return matchesSearch
      && matchesTrain
      && matchesDate
      && (bookingStatusFilter === 'all' || booking.status === bookingStatusFilter)
  }).sort((first, second) => {
    const firstDeparture = first.schedules?.departure_time || ''
    const secondDeparture = second.schedules?.departure_time || ''
    return bookingDateSort === 'ascending'
      ? firstDeparture.localeCompare(secondDeparture)
      : secondDeparture.localeCompare(firstDeparture)
  })
  const bookingTrains = [...new Map(bookings
    .filter(booking => booking.schedules?.trains)
    .map(booking => {
      const train = booking.schedules.trains
      return [`${train.name || ''}::${train.train_number || ''}`, train]
    })).entries()]
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          {previewMode && (
            <div role="status" className="rh-card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', borderColor: 'var(--rh-primary)', color: 'var(--rh-text-2)' }}>
              <strong>Mode preview</strong> — data contoh saja. Perubahan dan tindakan admin dinonaktifkan.
            </div>
          )}

          <section id="overview" style={{ scrollMarginTop: 96 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="rh-badge rh-badge-primary">Pusat kontrol RailHub</span>
                <h1 className="rh-h2" style={{ marginTop: '0.6rem' }}>Dashboard operasional</h1>
                <p style={{ color: 'var(--rh-text-2)', marginTop: '0.35rem' }}>Pantau perjalanan, petugas, dan layanan penumpang dalam satu tempat.</p>
              </div>
              <button type="button" className="rh-btn rh-btn-ghost" onClick={() => { setError(''); setLoading(true); setReloadKey(key => key + 1) }} disabled={loading || previewMode}>
                <RefreshCw size={16} /> Muat ulang
              </button>
            </div>

            <nav aria-label="Navigasi dashboard admin" className="rh-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.5rem', marginBottom: '1rem' }}>
              {[
                ['#overview', 'Ringkasan', LayoutDashboard],
                ['/dashboard/admin/journeys', 'Perjalanan mendatang', Train],
                ['/dashboard/admin/staff', 'Pengelolaan petugas', Users],
                ['/dashboard/orders', 'Pesanan makanan', ClipboardList],
                ['#bookings', 'Booking', TicketCheck],
                ['/dashboard/reports', 'Laporan', ClipboardList],
              ].map(([href, label, Icon]) => (
                <a key={href} href={href} className="rh-btn rh-btn-ghost rh-btn-sm">
                  <Icon size={15} />{label}
                </a>
              ))}
            </nav>
          </section>

          {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)', marginTop: '1rem' }}>{error}</div>}
          {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem', marginTop: '1rem' }}>Memuat data operasional...</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '0.9rem', margin: '1rem 0' }}>
            {[
              { label: 'Jadwal aktif', value: stats.activeSchedules, icon: Train, color: 'var(--rh-primary)' },
              { label: 'Belum ditugaskan*', value: unassignedSchedules, icon: UserRound, color: 'var(--rh-warning)' },
              { label: 'Tertunda*', value: delayedSchedules, icon: Clock3, color: 'var(--rh-danger)' },
              { label: 'Booking', value: stats.bookings, icon: ClipboardList, color: 'var(--rh-info)' },
              { label: 'Penumpang', value: stats.passengers, icon: Users, color: 'var(--rh-success)' },
              { label: 'Pembayaran simulasi*', value: formatIDR(stats.revenue), icon: CircleDollarSign, color: 'var(--rh-accent-dark)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <article key={label} className="rh-card">
                <div className="rh-card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.15rem' }}>
                  <div style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 13, background: 'var(--rh-surface)', color, flexShrink: 0 }}><Icon size={19} /></div>
                  <div><small style={{ color: 'var(--rh-text-2)' }}>{label}</small><strong style={{ display: 'block', fontSize: '1.2rem', lineHeight: 1.35 }}>{value}</strong></div>
                </div>
              </article>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', margin: '0 0 1.4rem' }}>
            Pembayaran terkonfirmasi adalah catatan simulasi, bukan pendapatan transaksi sungguhan. Perhatian operasional dihitung dari jadwal 7 hari ke depan.
          </p>

          {(unassignedSchedules > 0 || delayedSchedules > 0) && (
            <section aria-label="Perhatian operasional" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {unassignedSchedules > 0 && (
                <a href="/dashboard/admin/staff" className="rh-card" style={{ padding: '1rem 1.15rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderLeft: '4px solid var(--rh-warning)' }}>
                  <AlertCircle size={19} color="var(--rh-warning)" />
                  <span><strong>{unassignedSchedules} perjalanan belum memiliki petugas</strong><small style={{ display: 'block', color: 'var(--rh-text-2)' }}>Buka pengelolaan petugas untuk menindaklanjuti.</small></span>
                </a>
              )}
              {delayedSchedules > 0 && (
                <a href="/dashboard/admin/journeys" className="rh-card" style={{ padding: '1rem 1.15rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderLeft: '4px solid var(--rh-danger)' }}>
                  <Clock3 size={19} color="var(--rh-danger)" />
                  <span><strong>{delayedSchedules} perjalanan berstatus tertunda</strong><small style={{ display: 'block', color: 'var(--rh-text-2)' }}>Buka halaman perjalanan mendatang.</small></span>
                </a>
              )}
            </section>
          )}

          <section className="rh-card" style={{ marginBottom: '1.5rem' }}>
            <div className="rh-card-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <h2 className="rh-h4"><Users size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Penugasan petugas</h2>
                <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Ringkasan lima penugasan terbaru.</p>
              </div>
              <a href="/dashboard/admin/staff" className="rh-btn rh-btn-primary rh-btn-sm">Kelola semua petugas</a>
            </div>
            <div className="rh-card-body">
              {recentAssignments.length === 0 && !loading ? (
                <p style={{ color: 'var(--rh-text-2)' }}>Belum ada penugasan petugas.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  {recentAssignments.map(assignment => (
                    <article key={assignment.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '0.85rem 1rem' }}>
                      <div style={{ flex: '1 1 210px' }}>
                        <strong style={{ display: 'block' }}>{assignment.profiles?.full_name || 'Petugas'}</strong>
                        <small style={{ color: 'var(--rh-text-2)' }}>{assignment.profiles?.email}</small>
                      </div>
                      <div style={{ flex: '2 1 270px' }}>
                        <strong style={{ display: 'block' }}>{assignment.schedules?.trains?.name || 'Kereta'} · {assignment.schedules?.routes?.name || 'Rute tidak tersedia'}</strong>
                        <small style={{ color: 'var(--rh-text-2)' }}>{assignment.schedules?.departure_time ? `${formatDate(assignment.schedules.departure_time)} · ${formatTime(assignment.schedules.departure_time)}` : ''}</small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="bookings" className="rh-card" style={{ marginBottom: '1.5rem', scrollMarginTop: 96 }}>
            <div className="rh-card-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h2 className="rh-h4"><TicketCheck size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Booking & pembayaran</h2>
                <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Pemantauan baca-saja untuk booking terbaru dan status pembayarannya.</p>
              </div>
              <strong style={{ color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>Maksimal 100 booking terbaru</strong>
            </div>
            <div className="rh-card-body" style={{ paddingTop: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <label className="rh-input-group" style={{ flex: '1 1 250px' }}>
                  <span className="rh-label-text">Cari booking, kereta, atau rute</span>
                  <span style={{ position: 'relative', display: 'block' }}>
                    <Search size={16} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'var(--rh-text-3)' }} />
                    <input className="rh-input" style={{ paddingLeft: 36 }} value={bookingSearch} onChange={event => setBookingSearch(event.target.value)} placeholder="Kode booking, nama kereta, atau rute" />
                  </span>
                </label>
                <label className="rh-input-group" style={{ flex: '1 1 210px' }}>
                  <span className="rh-label-text">Kereta</span>
                  <select className="rh-input" value={bookingTrainFilter} onChange={event => setBookingTrainFilter(event.target.value)}>
                    <option value="all">Semua kereta</option>
                    {bookingTrains.map(([key, train]) => (
                      <option key={key} value={key}>{train.name || 'Kereta'} · {train.train_number || '—'}</option>
                    ))}
                  </select>
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 165px' }}>
                  <span className="rh-label-text">Berangkat dari</span>
                  <input className="rh-input" type="date" value={bookingDateFrom} max={bookingDateTo || undefined} onChange={event => setBookingDateFrom(event.target.value)} />
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 165px' }}>
                  <span className="rh-label-text">Sampai tanggal</span>
                  <input className="rh-input" type="date" value={bookingDateTo} min={bookingDateFrom || undefined} onChange={event => setBookingDateTo(event.target.value)} />
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 190px' }}>
                  <span className="rh-label-text">Urutkan tanggal</span>
                  <select className="rh-input" value={bookingDateSort} onChange={event => setBookingDateSort(event.target.value)}>
                    <option value="ascending">Keberangkatan terdekat</option>
                    <option value="descending">Keberangkatan terjauh</option>
                  </select>
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 220px' }}>
                  <span className="rh-label-text">Status booking</span>
                  <select className="rh-input" value={bookingStatusFilter} onChange={event => setBookingStatusFilter(event.target.value)}>
                    <option value="all">Semua status</option>
                    {Object.entries(bookingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
              <div aria-live="polite" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>
                <span>{filteredBookings.length} dari {bookings.length} booking terbaru</span>
                {(bookingTrainFilter !== 'all' || bookingDateFrom || bookingDateTo || bookingStatusFilter !== 'all' || bookingSearch || bookingDateSort !== 'ascending') && (
                  <button
                    className="rh-btn rh-btn-ghost rh-btn-sm"
                    type="button"
                    onClick={() => {
                      setBookingSearch('')
                      setBookingStatusFilter('all')
                      setBookingTrainFilter('all')
                      setBookingDateFrom('')
                      setBookingDateTo('')
                      setBookingDateSort('ascending')
                    }}
                  >
                    Hapus filter
                  </button>
                )}
              </div>
              {filteredBookings.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--rh-text-2)' }}>
                  <TicketCheck size={24} style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>{bookings.length ? 'Tidak ada booking yang cocok dengan filter.' : 'Belum ada data booking.'}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', textAlign: 'left' }}>
                    <caption style={{ textAlign: 'left', padding: '0 0 0.65rem', color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>Booking terbaru dan ringkasan pembayaran</caption>
                    <thead>
                      <tr style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {['Kode dan perjalanan', 'Waktu berangkat', 'Status booking', 'Pembayaran', 'Total'].map(label => <th key={label} scope="col" style={{ padding: '0.75rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>{label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(booking => {
                        const payment = payments[booking.id]
                        const methodLabels = {
                          simulation: 'Simulasi',
                          bank_transfer: 'Transfer bank',
                          e_wallet: 'E-wallet',
                          virtual_account: 'Virtual account',
                          qr_payment: 'QR payment',
                        }
                        return (
                          <tr key={booking.id}>
                            <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                              <strong className="rh-mono" style={{ display: 'block' }}>{booking.booking_code}</strong>
                              <small style={{ color: 'var(--rh-text-2)' }}>{booking.schedules?.trains?.name || 'Kereta'} · {booking.schedules?.routes?.name || 'Rute tidak tersedia'}</small>
                            </td>
                            <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)', whiteSpace: 'nowrap' }}>
                              {booking.schedules?.departure_time ? `${formatDate(booking.schedules.departure_time)} · ${formatTime(booking.schedules.departure_time)}` : '—'}
                            </td>
                            <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                              <StatusBadge status={booking.status} label={bookingStatusLabels[booking.status] || booking.status} />
                            </td>
                            <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                              {payment ? (
                                <>
                                  <strong style={{ display: 'block', fontSize: '0.88rem' }}>{methodLabels[payment.method] || payment.method}</strong>
                                  <small style={{ color: 'var(--rh-text-2)' }}>{paymentStatusLabels[payment.status] || payment.status}</small>
                                </>
                              ) : <small style={{ color: 'var(--rh-text-2)' }}>Belum ada pembayaran</small>}
                            </td>
                            <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)', whiteSpace: 'nowrap', fontWeight: 700 }}>{formatIDR(Number(booking.total_amount) || 0)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <small style={{ display: 'block', marginTop: '0.75rem', color: 'var(--rh-text-2)' }}>Nilai dan status pembayaran mengikuti data simulasi RailHub, bukan transaksi keuangan sungguhan.</small>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
