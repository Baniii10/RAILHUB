'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Edit2,
  Grid,
  Info,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TicketCheck,
  Train,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  Utensils,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import OperationalDashboardShell from '@/components/layout/OperationalDashboardShell'
import LiveRoleClock from '@/components/ui/LiveRoleClock'
import { useAuth } from '@/contexts/AuthContext'
import { useConfirm } from '@/contexts/ConfirmDialogContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'
import { getJourneyStatusLabel, JOURNEY_STATUSES } from '@/lib/operations/journey-status'

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

function StatusBadge({ status, label }) {
  const [background, color] = statusColors[status] || ['var(--rh-surface-2)', 'var(--rh-text-2)']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '0.2rem 0.6rem', background, color, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label || getJourneyStatusLabel(status)}
    </span>
  )
}

// Admin Sidebar Navigation Groups
const getAdminMenuGroups = ({ stats, unassignedCount }) => [
  {
    groupLabel: 'Utama',
    items: [
      { id: 'overview', label: 'Dashboard Utama', icon: LayoutDashboard },
    ],
  },
  {
    groupLabel: 'Operasional KA',
    items: [
      { id: 'schedules', label: 'Jadwal & Perjalanan', icon: CalendarDays },
      { id: 'trains', label: 'Armada Kereta', icon: Train },
      { id: 'routes', label: 'Rute & Koridor', icon: Navigation },
      { id: 'stations', label: 'Stasiun & Wilayah', icon: MapPin },
      { id: 'seats', label: 'Formasi Kursi', icon: Grid },
      { id: 'fares', label: 'Tarif & Tiket', icon: CircleDollarSign },
    ],
  },
  {
    groupLabel: 'Pemesanan',
    items: [
      { id: 'bookings', label: 'Data Pemesanan', icon: TicketCheck, badge: stats?.bookings || 0 },
      { id: 'users', label: 'Akun Pengguna', icon: Users },
    ],
  },
  {
    groupLabel: 'Staf & Laporan',
    items: [
      { id: 'staff', label: 'Petugas & Kondektur', icon: ShieldCheck, badge: unassignedCount || 0, badgeColor: '#f59e0b' },
      { id: 'reports', label: 'Laporan Masalah', icon: ClipboardList },
      { id: 'content', label: 'Pengumuman Sistem', icon: Megaphone },
    ],
  },
]

function AdminDashboardContent() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { confirm } = useConfirm()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // Data states
  const [stats, setStats] = useState(emptyStats)
  const [stations, setStations] = useState([])
  const [trains, setTrains] = useState([])
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [fares, setFares] = useState([])
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState({})
  const [usersList, setUsersList] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [assignments, setAssignments] = useState([])

  // Search & filter states
  const [stationSearch, setStationSearch] = useState('')
  const [stationProvinceFilter, setStationProvinceFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  // Staff assignment form
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [assigning, setAssigning] = useState(false)

  // New Station form
  const [newStationCode, setNewStationCode] = useState('')
  const [newStationName, setNewStationName] = useState('')
  const [newStationCity, setNewStationCity] = useState('')
  const [newStationProvince, setNewStationProvince] = useState('Jawa Barat')
  const [addingStation, setAddingStation] = useState(false)

  // Seat preview carriage
  const [selectedCarriageIdx, setSelectedCarriageIdx] = useState(1)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fadmin')
    } else if (profile?.role && profile.role !== 'admin') {
      router.replace((profile.role === 'conductor' || profile.role === 'gate' || profile.role === 'staff' || profile.staff_type) ? '/dashboard/staff' : '/dashboard/passenger')
    }
  }, [authLoading, user, profile, router])

  // Load All Admin Data
  const loadAdminData = useCallback(async () => {
    if (!user || profile?.role !== 'admin') return
    setLoading(true)
    setError('')
    const supabase = createClient()

    try {
      const [
        statsRes,
        stationsRes,
        trainsRes,
        routesRes,
        schedulesRes,
        faresRes,
        bookingsRes,
        profilesRes,
        assignmentsRes,
      ] = await Promise.all([
        supabase.rpc('get_admin_dashboard_stats'),
        supabase.from('stations').select('id, code, name, city, province').order('name'),
        supabase.from('trains').select('id, name, train_number, service_class').order('name'),
        supabase.from('routes').select('id, name, distance_km').order('name'),
        supabase.from('schedules').select('id, status, departure_time, arrival_time, trains(name, train_number), routes(name)').order('departure_time', { ascending: false }).limit(100),
        supabase.from('fares').select('id, schedule_id, carriage_class, price, currency, schedules(routes(name))').order('price'),
        supabase.from('bookings').select('id, booking_code, user_id, total_amount, status, created_at, schedules(departure_time, trains(name, train_number), routes(name))').order('created_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('id, full_name, email, role, phone_number, created_at').order('created_at', { ascending: false }),
        supabase.from('staff_assignments').select('id, staff_id, schedule_id, profiles!staff_assignments_staff_id_fkey(full_name, email), schedules(departure_time, trains(name, train_number), routes(name))').order('created_at', { ascending: false }),
      ])

      const failedResult = [statsRes, stationsRes, trainsRes, routesRes, schedulesRes, faresRes, bookingsRes, profilesRes, assignmentsRes]
        .find(result => result.error)
      if (failedResult) throw failedResult.error

      // Fallback or real stats
      if (statsRes.data) {
        setStats({
          passengers: Number(statsRes.data?.passengers || 0),
          bookings: Number(statsRes.data?.bookings || 0),
          trains: Number(statsRes.data?.trains || 0),
          stations: Number(statsRes.data?.stations || 0),
          revenue: Number(statsRes.data?.revenue || 0),
          activeSchedules: Number(statsRes.data?.active_schedules || 0),
        })
      }

      setStations(stationsRes.data || [])
      setTrains(trainsRes.data || [])
      setRoutes(routesRes.data || [])
      setSchedules(schedulesRes.data || [])
      setFares(faresRes.data || [])
      setAssignments(assignmentsRes.data || [])

      const allProfiles = profilesRes.data || []
      const profilesById = new Map(allProfiles.map(person => [person.id, person]))
      setBookings((bookingsRes.data || []).map(booking => ({
        ...booking,
        profiles: profilesById.get(booking.user_id) || null,
      })))
      setUsersList(allProfiles)
      setStaffUsers(allProfiles.filter(p => p.role === 'conductor'))

      // Load payments
      const bIds = (bookingsRes.data || []).map(b => b.id)
      if (bIds.length > 0) {
        const { data: pData } = await supabase.from('payments').select('booking_id, status, method, amount').in('booking_id', bIds)
        if (pData) {
          setPayments(Object.fromEntries(pData.map(p => [p.booking_id, p])))
        }
      }
    } catch (err) {
      setError(`Gagal memuat data kontrol admin: ${err.message || 'Kesalahan sistem'}`)
    } finally {
      setLoading(false)
    }
  }, [user, profile?.role])

  useEffect(() => {
    const timer = window.setTimeout(loadAdminData, 0)
    return () => window.clearTimeout(timer)
  }, [loadAdminData, reloadKey])

  // Handle Role Change
  async function handleRoleChange(userId, newRole) {
    const supabase = createClient()
    const { error: err } = await supabase.rpc('admin_set_user_role', {
      p_user_id: userId,
      p_role: newRole,
    })
    if (err) {
      toast.error(`Gagal mengubah role: ${err.message}`)
      return
    }
    toast.success(`Role pengguna berhasil diubah menjadi ${newRole}`)
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  // Handle Assign Staff
  async function handleAssignStaff(e) {
    e.preventDefault()
    if (!selectedStaffId || !selectedScheduleId) {
      toast.error('Pilih petugas dan jadwal yang akan ditugaskan.')
      return
    }
    setAssigning(true)
    const supabase = createClient()
    const { error: err } = await supabase.rpc('admin_assign_staff', {
      p_staff_id: selectedStaffId,
      p_schedule_id: selectedScheduleId,
    })
    setAssigning(false)
    if (err) {
      toast.error(`Gagal menugaskan petugas: ${err.message}`)
      return
    }
    toast.success('Petugas berhasil ditugaskan pada perjalanan KA!')
    setSelectedStaffId('')
    setSelectedScheduleId('')
    setReloadKey(k => k + 1)
  }

  // Handle Remove Staff Assignment
  async function handleRemoveAssignment(assignmentId) {
    const ok = await confirm({
      title: 'Hapus Penugasan Petugas',
      message: 'Apakah Anda yakin ingin menghapus penugasan petugas ini dari jadwal perjalanan?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    })
    if (!ok) return
    const supabase = createClient()
    const { error: err } = await supabase.rpc('admin_remove_staff_assignment', {
      p_assignment_id: assignmentId,
    })
    if (err) {
      toast.error(`Gagal menghapus penugasan: ${err.message}`)
      return
    }
    toast.success('Penugasan berhasil dihapus.')
    setAssignments(prev => prev.filter(a => a.id !== assignmentId))
  }

  // Handle Add Station
  async function handleAddStation(e) {
    e.preventDefault()
    if (!newStationCode || !newStationName || !newStationCity) {
      toast.error('Lengkapi kode, nama, dan kota stasiun.')
      return
    }
    setAddingStation(true)
    const supabase = createClient()
    const { data, error: err } = await supabase.from('stations').insert({
      code: newStationCode.trim().toUpperCase(),
      name: newStationName.trim(),
      city: newStationCity.trim().toUpperCase(),
      province: newStationProvince,
    }).select()

    setAddingStation(false)
    if (err) {
      toast.error(`Gagal menambahkan stasiun: ${err.message}`)
      return
    }
    toast.success(`Stasiun ${newStationName} (${newStationCode}) berhasil didaftarkan!`)
    setNewStationCode('')
    setNewStationName('')
    setNewStationCity('')
    if (data && data[0]) {
      setStations(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  // Filtered stations
  const filteredStations = useMemo(() => {
    return stations.filter(st => {
      const q = stationSearch.trim().toLowerCase()
      const matchesSearch = !q || [st.code, st.name, st.city, st.province].some(v => v?.toLowerCase().includes(q))
      const matchesProv = stationProvinceFilter === 'all' || st.province === stationProvinceFilter
      return matchesSearch && matchesProv
    })
  }, [stations, stationSearch, stationProvinceFilter])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const q = bookingSearch.trim().toLowerCase()
      const matchesSearch = !q || [
        b.booking_code,
        b.schedules?.trains?.name,
        b.schedules?.routes?.name,
        b.profiles?.full_name,
      ].some(v => v?.toLowerCase().includes(q))
      const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, bookingSearch, bookingStatusFilter])

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const q = userSearch.trim().toLowerCase()
      return !q || [u.full_name, u.email, u.role, u.phone_number].some(v => v?.toLowerCase().includes(q))
    })
  }, [usersList, userSearch])

  // Assignment counts
  const assignmentCounts = useMemo(() => {
    const map = {}
    for (const a of assignments) {
      map[a.schedule_id] = (map[a.schedule_id] || 0) + 1
    }
    return map
  }, [assignments])

  const unassignedCount = schedules.filter(s => s.status !== 'cancelled' && !assignmentCounts[s.id]).length

  const menuGroups = getAdminMenuGroups({ stats, unassignedCount })

  return (
    <OperationalDashboardShell
      role="admin"
      roleBadge="Administrator Sistem"
      subtitle="Pusat Kendali Seluruh Jaringan Kereta Api Pulau Jawa"
      menuGroups={menuGroups}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      loading={loading}
      error={error}
      onRefresh={() => { setError(''); setLoading(true); setReloadKey(k => k + 1) }}
    >

          {/* ── TAB 1: OVERVIEW ──────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Jadwal Aktif', value: stats.activeSchedules, icon: Train, color: 'var(--rh-primary)' },
                  { label: 'Belum Ditugaskan', value: unassignedCount, icon: AlertCircle, color: 'var(--rh-warning)' },
                  { label: 'Total Booking', value: stats.bookings, icon: TicketCheck, color: 'var(--rh-info)' },
                  { label: 'Total Penumpang', value: stats.passengers, icon: Users, color: 'var(--rh-success)' },
                  { label: 'Total Stasiun', value: stats.stations || stations.length, icon: MapPin, color: 'var(--rh-secondary)' },
                  { label: 'Pendapatan Simulasi', value: formatIDR(stats.revenue), icon: CircleDollarSign, color: 'var(--rh-accent-dark)' },
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <article key={idx} className="rh-card" style={{ padding: '1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--rh-surface)', color: item.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <small style={{ color: 'var(--rh-text-2)', display: 'block', fontSize: '0.78rem' }}>{item.label}</small>
                          <strong style={{ fontSize: '1.25rem', display: 'block', lineHeight: 1.25 }}>{item.value}</strong>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Operational Attention Alerts */}
              {unassignedCount > 0 && (
                <div className="rh-card" style={{ padding: '1.15rem 1.25rem', marginBottom: '1.5rem', borderLeft: '5px solid var(--rh-warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'rgba(255,140,0,0.04)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <AlertCircle size={22} color="var(--rh-warning)" />
                    <div>
                      <strong>Perhatian Operasional: Ada {unassignedCount} Perjalanan KA Belum Memiliki Petugas Kondektur</strong>
                      <p style={{ margin: '0.15rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>
                        Tugaskan petugas sebelum jadwal keberangkatan dimulai agar validasi boarding penumpang dapat berjalan.
                      </p>
                    </div>
                  </div>
                  <button type="button" className="rh-btn rh-btn-primary rh-btn-sm" onClick={() => setActiveTab('staff')}>
                    Tugaskan Sekarang
                  </button>
                </div>
              )}

              {/* 5 Recent Staff Assignments */}
              <section className="rh-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="rh-h4" style={{ margin: 0 }}>Penugasan Petugas Terbaru</h3>
                  <button type="button" className="rh-btn rh-btn-ghost rh-btn-sm" onClick={() => setActiveTab('staff')}>
                    Kelola Semua <ChevronRight size={14} />
                  </button>
                </div>

                {assignments.length === 0 ? (
                  <p style={{ color: 'var(--rh-text-2)', margin: 0 }}>Belum ada data penugasan petugas.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    {assignments.slice(0, 5).map(a => (
                      <div key={a.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--rh-border)', background: 'var(--rh-surface)' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{a.profiles?.full_name || 'Petugas Kondektur'}</strong>
                          <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{a.profiles?.email}</small>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: 'var(--rh-primary)' }}>{a.schedules?.trains?.name}</strong>
                          <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>
                            {a.schedules?.routes?.name} · {a.schedules?.departure_time ? formatTime(a.schedules.departure_time) : ''} WIB
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── TAB 2: STATION MANAGEMENT ────────────────────────────────────── */}
          {activeTab === 'stations' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Katalog &amp; Manajemen Stasiun Kereta Api</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Daftar 50+ stasiun resmi di Pulau Jawa (DKI Jakarta, Jawa Barat, Jawa Tengah, Jawa Timur, DIY, Banten).
                  </p>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                  Total Terdaftar: <strong>{filteredStations.length}</strong> Stasiun
                </span>
              </div>

              {/* Add Station Form */}
              <form onSubmit={handleAddStation} style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Tambah Stasiun Baru
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Kode Singkatan (3 Huruf)</span>
                    <input className="rh-input rh-mono" maxLength={6} placeholder="Contoh: KYA" value={newStationCode} onChange={e => setNewStationCode(e.target.value)} required />
                  </label>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Nama Stasiun</span>
                    <input className="rh-input" placeholder="Contoh: Kroya" value={newStationName} onChange={e => setNewStationName(e.target.value)} required />
                  </label>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Kota / Kabupaten</span>
                    <input className="rh-input" placeholder="Contoh: CILACAP" value={newStationCity} onChange={e => setNewStationCity(e.target.value)} required />
                  </label>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Provinsi</span>
                    <select className="rh-input" value={newStationProvince} onChange={e => setNewStationProvince(e.target.value)}>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="DI Yogyakarta">DI Yogyakarta</option>
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="Banten">Banten</option>
                    </select>
                  </label>
                  <button type="submit" className="rh-btn rh-btn-primary" disabled={addingStation} style={{ minHeight: 44 }}>
                    {addingStation ? <RefreshCw size={16} className="rh-spin" /> : 'Daftarkan Stasiun'}
                  </button>
                </div>
              </form>

              {/* Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <label className="rh-input-group" style={{ flex: '1 1 250px', margin: 0 }}>
                  <span className="rh-label-text">Cari Stasiun</span>
                  <input className="rh-input" placeholder="Nama, kode (GMR, BD, YK…), kota…" value={stationSearch} onChange={e => setStationSearch(e.target.value)} />
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 200px', margin: 0 }}>
                  <span className="rh-label-text">Filter Provinsi</span>
                  <select className="rh-input" value={stationProvinceFilter} onChange={e => setStationProvinceFilter(e.target.value)}>
                    <option value="all">Semua Provinsi</option>
                    <option value="DKI Jakarta">DKI Jakarta</option>
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="Jawa Tengah">Jawa Tengah</option>
                    <option value="DI Yogyakarta">DI Yogyakarta</option>
                    <option value="Jawa Timur">Jawa Timur</option>
                    <option value="Banten">Banten</option>
                  </select>
                </label>
              </div>

              {/* Stations Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kode</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Nama Stasiun</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kota / Kabupaten</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Provinsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.map(st => (
                      <tr key={st.id || st.code} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span className="rh-mono" style={{ fontWeight: 700, color: 'var(--rh-primary)' }}>{st.code}</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem' }}><strong>{st.name}</strong></td>
                        <td style={{ padding: '0.65rem 0.5rem', color: 'var(--rh-text-2)' }}>{st.city}</td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span className="rh-badge rh-badge-primary">{st.province}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 3: TRAIN MANAGEMENT ──────────────────────────────────────── */}
          {activeTab === 'trains' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Armada Kereta Api (Fleet Management)</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Daftar rangkaian kereta api aktif, kelas layanan, dan nomor KA resmi.
                  </p>
                </div>
                <span className="rh-badge rh-badge-primary">{trains.length} Rangkaian KA</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {trains.map(tr => (
                  <article key={tr.id} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: 'var(--rh-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--rh-primary)' }}>{tr.name}</strong>
                      <span className="rh-badge rh-badge-secondary">{tr.train_number || 'KA Utama'}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--rh-text-2)', marginBottom: '0.75rem' }}>
                      Tipe Layanan: <strong>{tr.service_class || 'Antar Kota'}</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#fff', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--rh-border)', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: 'var(--rh-text-3)' }}>Komposisi Gerbong:</span>
                        <strong style={{ display: 'block' }}>8 - 10 Gerbong</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--rh-text-3)' }}>Kapasitas / Gerbong:</span>
                        <strong style={{ display: 'block' }}>40 Kursi (1A-10D)</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── TAB 4: SEAT MANAGEMENT ───────────────────────────────────────── */}
          {activeTab === 'seats' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Layout &amp; Manajemen Kursi Gerbong</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Standar konfigurasi 40 kursi per gerbong (Row 1–10, Kolom A–B | C–D).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(cNum => (
                    <button
                      key={cNum}
                      type="button"
                      className={`rh-btn rh-btn-sm ${selectedCarriageIdx === cNum ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
                      onClick={() => setSelectedCarriageIdx(cNum)}
                    >
                      Gerbong {cNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--rh-surface)', border: '2px solid var(--rh-primary)' }} />
                  Tersedia (Ready)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--rh-primary)' }} />
                  Terpesona / Terisi
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--rh-accent)' }} />
                  Kursi Petugas / Khusus
                </span>
              </div>

              {/* Visual Seat Map (40 Seats) */}
              <div style={{ maxWidth: 520, margin: '0 auto', background: 'var(--rh-surface)', border: '2px solid var(--rh-border)', borderRadius: 16, padding: '1.5rem 1rem' }}>
                <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px dashed var(--rh-border)', marginBottom: '1rem' }}>
                  <small style={{ color: 'var(--rh-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                    ARAH LAJU KERETA API (KABIN MASINIS)
                  </small>
                </div>

                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
                    <div key={row} style={{ display: 'grid', gridTemplateColumns: '40px 40px 30px 40px 40px', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                      {['A', 'B'].map(col => {
                        const seatCode = `${row}${col}`
                        const isBooked = (row * 3 + col.charCodeAt(0)) % 4 === 0
                        return (
                          <div
                            key={col}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              background: isBooked ? 'var(--rh-primary)' : '#fff',
                              color: isBooked ? '#fff' : 'var(--rh-primary)',
                              border: '1.5px solid var(--rh-primary)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                          >
                            {seatCode}
                          </div>
                        )
                      })}

                      {/* Aisle */}
                      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--rh-text-3)' }}>
                        {row}
                      </div>

                      {['C', 'D'].map(col => {
                        const seatCode = `${row}${col}`
                        const isBooked = (row * 2 + col.charCodeAt(0)) % 3 === 0
                        return (
                          <div
                            key={col}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              background: isBooked ? 'var(--rh-primary)' : '#fff',
                              color: isBooked ? '#fff' : 'var(--rh-primary)',
                              border: '1.5px solid var(--rh-primary)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                          >
                            {seatCode}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--rh-border)', marginTop: '1rem', color: 'var(--rh-text-3)', fontSize: '0.8rem' }}>
                  Pintu Keluar Gerbong &amp; Toilet / Bordes
                </div>
              </div>
            </section>
          )}

          {/* ── TAB 5: ROUTE MANAGEMENT ──────────────────────────────────────── */}
          {activeTab === 'routes' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Rute Perjalanan Kereta Api</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Daftar trayek rute utama, estimasi jarak (KM), dan durasi tempuh antar stasiun.
                  </p>
                </div>
                <span className="rh-badge rh-badge-primary">{routes.length} Rute Aktif</span>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {routes.map(r => (
                  <article key={r.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 10, border: '1px solid var(--rh-border)', background: 'var(--rh-surface)' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--rh-primary)' }}>{r.name}</strong>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--rh-text-2)' }}>
                        <span>Jarak: <strong>{r.distance_km || 450} KM</strong></span>
                        <span>Estimasi: <strong>{Math.floor((r.estimated_duration_minutes || 360) / 60)} Jam {(r.estimated_duration_minutes || 360) % 60} Menit</strong></span>
                      </div>
                    </div>
                    <span className="rh-badge rh-badge-secondary">Operasional Aktif</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── TAB 6: SCHEDULE MANAGEMENT ───────────────────────────────────── */}
          {activeTab === 'schedules' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Jadwal Keberangkatan Kereta Api</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Pemantauan dan pengelolaan jadwal aktif seluruh perjalanan kereta api.
                  </p>
                </div>
                <span className="rh-badge rh-badge-primary">{schedules.length} Jadwal Terjadwal</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kereta Api</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Rute</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Waktu Berangkat</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Waktu Tiba</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(sch => (
                      <tr key={sch.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <strong>{sch.trains?.name}</strong>
                          <small style={{ display: 'block', color: 'var(--rh-text-3)' }}>{sch.trains?.train_number}</small>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{sch.routes?.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                          {formatDate(sch.departure_time)} {formatTime(sch.departure_time)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                          {formatTime(sch.arrival_time)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <StatusBadge status={sch.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 7: FARE MANAGEMENT ───────────────────────────────────────── */}
          {activeTab === 'fares' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Tarif &amp; Harga Tiket Kelas Layanan</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Matriks harga tiket resmi berdasarkan rute dan kelas kereta (Ekonomi, Bisnis, Eksekutif, Luxury).
                  </p>
                </div>
                <span className="rh-badge rh-badge-primary">{fares.length} Tarif Terdaftar</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Rute Perjalanan</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kelas Layanan</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Tarif Dasar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fares.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}><strong>{f.schedules?.routes?.name || 'Rute KA'}</strong></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span className="rh-badge rh-badge-primary">{f.carriage_class}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--rh-primary)' }}>
                          {formatIDR(f.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 8: BOOKING MANAGEMENT ────────────────────────────────────── */}
          {activeTab === 'bookings' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Pemesanan &amp; Transaksi Tiket</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Tinjau riwayat 100 pemesanan terbaru, status pembayaran simulasi, dan detail tiket.
                  </p>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                  Total: <strong>{filteredBookings.length}</strong> booking
                </span>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <label className="rh-input-group" style={{ flex: '1 1 250px', margin: 0 }}>
                  <span className="rh-label-text">Cari Kode Booking / Nama / Rute</span>
                  <input className="rh-input" placeholder="Kode booking, nama…" value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} />
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 200px', margin: 0 }}>
                  <span className="rh-label-text">Status Booking</span>
                  <select className="rh-input" value={bookingStatusFilter} onChange={e => setBookingStatusFilter(e.target.value)}>
                    <option value="all">Semua Status</option>
                    {Object.entries(bookingStatusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kode &amp; Pemesan</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kereta &amp; Rute</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Waktu Berangkat</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Booking &amp; Pembayaran</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <strong className="rh-mono" style={{ color: 'var(--rh-primary)' }}>{b.booking_code}</strong>
                          <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{b.profiles?.full_name || 'Penumpang'}</small>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span>{b.schedules?.trains?.name}</span>
                          <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{b.schedules?.routes?.name}</small>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                          {formatDate(b.schedules?.departure_time)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <StatusBadge status={b.status} label={bookingStatusLabels[b.status]} />
                          {payments[b.id] && (
                            <small style={{ display: 'block', marginTop: 5, color: 'var(--rh-text-2)' }}>
                              Pembayaran: {paymentStatusLabels[payments[b.id].status] || payments[b.id].status}
                              {payments[b.id].method ? ` · ${payments[b.id].method.replaceAll('_', ' ')}` : ''}
                            </small>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                          {formatIDR(b.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 9: USER MANAGEMENT ───────────────────────────────────────── */}
          {activeTab === 'users' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Pengguna &amp; Hak Akses (Role Management)</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Daftar akun terdaftar dan pengaturan hak akses role: Penumpang (passenger), Petugas Kondektur (conductor), dan Administrator (admin).
                  </p>
                </div>
                <input
                  className="rh-input"
                  style={{ maxWidth: 260 }}
                  placeholder="Cari nama / email…"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Nama Lengkap</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Email Akun</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Role Saat Ini</th>
                      <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Ubah Hak Akses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <strong>{u.full_name || 'Pengguna'}</strong>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--rh-text-2)' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span className={`rh-badge ${u.role === 'admin' ? 'rh-badge-secondary' : u.role === 'conductor' ? 'rh-badge-primary' : ''}`}>
                            {u.role === 'admin' ? 'Administrator' : u.role === 'conductor' ? 'Petugas Kondektur' : 'Penumpang'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <select
                            className="rh-input rh-input-sm"
                            style={{ maxWidth: 170 }}
                            value={u.role}
                            disabled={u.id === user?.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                          >
                            <option value="passenger">Penumpang</option>
                            <option value="conductor">Petugas Kondektur</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 10: STAFF ASSIGNMENT ─────────────────────────────────────── */}
          {activeTab === 'staff' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 className="rh-h3" style={{ margin: 0 }}>Penugasan Petugas Kereta Api (Staff Assignment)</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Tugaskan kondektur/petugas operasional pada jadwal keberangkatan kereta api.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem', padding: '0.85rem 1.25rem', background: 'var(--rh-primary-light)', borderRadius: 10, border: '1px solid rgba(0, 102, 204, 0.2)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--rh-primary)' }}>
                  💡 <strong>Info:</strong> Untuk mencari jadwal dengan filter tanggal lengkap atau promosikan akun petugas baru, Anda dapat membuka halaman khusus <strong>Pengelolaan Petugas</strong>.
                </span>
                <a href="/dashboard/admin/staff" className="rh-btn rh-btn-sm rh-btn-primary">
                  Buka Halaman Pengelolaan Petugas →
                </a>
              </div>

              {/* Assignment Form */}
              <form onSubmit={handleAssignStaff} style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  Formulir Penugasan Baru
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Pilih Petugas Kondektur</span>
                    <select className="rh-input" value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} required>
                      <option value="">-- Pilih Petugas Aktif --</option>
                      {staffUsers.map(stf => (
                        <option key={stf.id} value={stf.id}>
                          {stf.full_name} ({stf.email})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Pilih Jadwal Keberangkatan KA</span>
                    <select className="rh-input" value={selectedScheduleId} onChange={e => setSelectedScheduleId(e.target.value)} required>
                      <option value="">-- Pilih Jadwal Perjalanan --</option>
                      {schedules.map(sch => (
                        <option key={sch.id} value={sch.id}>
                          {sch.trains?.name} · {sch.routes?.name} ({formatDate(sch.departure_time)} {formatTime(sch.departure_time)})
                        </option>
                      ))}
                    </select>
                  </label>

                  <button type="submit" className="rh-btn rh-btn-primary" disabled={assigning} style={{ minHeight: 44 }}>
                    {assigning ? <RefreshCw size={16} className="rh-spin" /> : 'Tugaskan Petugas'}
                  </button>
                </div>
              </form>

              {/* Active Assignments Table */}
              <h3 className="rh-h4" style={{ margin: '0 0 0.75rem' }}>Daftar Penugasan Aktif</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Nama Petugas</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Kereta Api</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Rute</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Waktu Berangkat</th>
                      <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <strong>{a.profiles?.full_name || 'Petugas'}</strong>
                          <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{a.profiles?.email}</small>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><strong>{a.schedules?.trains?.name}</strong></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{a.schedules?.routes?.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                          {formatDate(a.schedules?.departure_time)} {formatTime(a.schedules?.departure_time)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="rh-btn rh-btn-ghost rh-btn-sm"
                            style={{ color: 'var(--rh-danger)' }}
                            onClick={() => handleRemoveAssignment(a.id)}
                          >
                            <Trash2 size={15} /> Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 11: REPORTS & ANALYTICS ──────────────────────────────────── */}
          {activeTab === 'reports' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 className="rh-h3" style={{ margin: 0 }}>Laporan Transaksi &amp; Analitik Operasional</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Statistik performa penjualan tiket, rata-rata okupansi penumpang, dan rute paling diminati.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: 'var(--rh-surface)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Tingkat Okupansi Kursi Rata-rata</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--rh-success)', margin: '0.25rem 0' }}>82.4%</strong>
                  <small style={{ color: 'var(--rh-text-3)' }}>Berdasarkan kapasitas 40 kursi / gerbong</small>
                </div>

                <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: 'var(--rh-surface)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Ketepatan Waktu Kereta (OTP)</span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--rh-primary)', margin: '0.25rem 0' }}>96.8%</strong>
                  <small style={{ color: 'var(--rh-text-3)' }}>On-time departure &amp; arrival rate</small>
                </div>

                <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: 'var(--rh-surface)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Rute Terpopuler Bulan Ini</span>
                  <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--rh-text)', margin: '0.4rem 0' }}>Gambir – Yogyakarta</strong>
                  <small style={{ color: 'var(--rh-text-3)' }}>Penyumbang 34% total pemesanan</small>
                </div>
              </div>

              <h3 className="rh-h4" style={{ margin: '0 0 0.75rem' }}>Rute dengan Permintaan Tertinggi</h3>
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {[
                  { route: 'Gambir (Jakarta) → Yogyakarta (Tugu)', share: 34, pax: 1420 },
                  { route: 'Gambir (Jakarta) → Bandung (Hall)', share: 28, pax: 1150 },
                  { route: 'Pasar Senen → Semarang Tawang', share: 21, pax: 890 },
                  { route: 'Bandung → Surabaya Gubeng', share: 17, pax: 710 },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid var(--rh-border)', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      <strong>{item.route}</strong>
                      <span><strong>{item.pax}</strong> penumpang ({item.share}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'var(--rh-surface)' }}>
                      <div style={{ width: `${item.share}%`, height: '100%', borderRadius: 999, background: 'var(--rh-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── TAB 12: CONTENT MANAGEMENT ───────────────────────────────────── */}
          {activeTab === 'content' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 className="rh-h3" style={{ margin: 0 }}>Manajemen Konten, Promo &amp; Informasi</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Kelola banner promosi rasio 8:3 beranda, pengumuman layanan, dan pusat bantuan FAQ.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  {
                    title: 'Banner Promo 1 (Rasio 8:3) · Diskon 25% Jelajah Jawa',
                    desc: 'Banner utama beranda menampilkan foto pramugari/crew ramah dan headline to-the-point.',
                    status: 'Aktif Tayang',
                  },
                  {
                    title: 'Banner Promo 2 (Rasio 8:3) · Kereta Suite Class Compartment',
                    desc: 'Promosi pengalaman kemewahan kelas privat Luxury & Suite Compartment lintas malam.',
                    status: 'Aktif Tayang',
                  },
                  {
                    title: 'Banner Promo 3 (Rasio 8:3) · Liburan Akhir Pekan Hemat',
                    desc: 'Diskon perjalanan untuk rute Jakarta - Bandung dan Yogyakarta.',
                    status: 'Aktif Tayang',
                  },
                ].map((banner, idx) => (
                  <article key={idx} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem', background: 'var(--rh-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem' }}>{banner.title}</strong>
                      <span className="rh-badge rh-badge-primary">{banner.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--rh-text-2)' }}>{banner.desc}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

    </OperationalDashboardShell>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--rh-surface)', display: 'grid', placeItems: 'center' }}>
        <div className="rh-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="rh-spin" style={{ width: 36, height: 36, border: '3px solid var(--rh-border)', borderTopColor: 'var(--rh-primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <strong>Memuat Pusat Kontrol Admin…</strong>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
