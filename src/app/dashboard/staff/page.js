'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  Filter,
  HelpingHand,
  Info,
  LayoutDashboard,
  MapPin,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  TicketCheck,
  Train,
  UserCheck,
  Users,
  Utensils,
  XCircle,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import OperationalDashboardShell from '@/components/layout/OperationalDashboardShell'
import LiveRoleClock from '@/components/ui/LiveRoleClock'
import TicketScanner from '@/components/staff/TicketScanner'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getJourneyStatusLabel, getNextJourneyStatuses, JOURNEY_STATUSES } from '@/lib/operations/journey-status'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'
import { getBundledStaffByEmail } from '@/lib/data/staffAccounts'

const STATUS_COLORS = {
  scheduled: ['var(--rh-info-light)', 'var(--rh-info)'],
  boarding: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  departed: ['var(--rh-primary-light)', 'var(--rh-primary)'],
  arrived: ['var(--rh-success-light)', 'var(--rh-success)'],
  delayed: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  cancelled: ['var(--rh-danger-light)', 'var(--rh-danger)'],
}

function JourneyStatus({ status }) {
  const [background, color] = STATUS_COLORS[status] || ['var(--rh-surface-2)', 'var(--rh-text-2)']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '0.25rem 0.65rem', background, color, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {getJourneyStatusLabel(status)}
    </span>
  )
}

const TABS = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'validation', label: 'Scan Tiket', icon: TicketCheck },
  { id: 'passengers', label: 'Penumpang', icon: Users },
  { id: 'journey', label: 'Perjalanan', icon: Train },
  { id: 'services', label: 'Layanan', icon: HelpingHand },
]
const GATE_TABS = TABS.filter(tab => ['overview', 'validation'].includes(tab.id))

// Staff Sidebar Navigation Groups
const getStaffMenuGroups = ({ isGate, ticketTotal, pendingServices }) => {
  if (isGate) {
    return [
      {
        groupLabel: 'Utama',
        items: [
          { id: 'overview', label: 'Dashboard Tugas', icon: LayoutDashboard },
        ],
      },
      {
        groupLabel: 'Pemeriksaan Boarding',
        items: [
          { id: 'validation', label: 'Scan & Validasi Tiket', icon: TicketCheck },
        ],
      },
      {
        groupLabel: 'Layanan & Bantuan',
        items: [
          { id: 'notifications', label: 'Pemberitahuan Tugas', icon: Bell },
        ],
      },
    ]
  }

  return [
    {
      groupLabel: 'Utama',
      items: [
        { id: 'overview', label: 'Dashboard Tugas', icon: LayoutDashboard },
      ],
    },
    {
      groupLabel: 'Validasi & Boarding',
      items: [
        { id: 'validation', label: 'Scan Tiket Penumpang', icon: TicketCheck },
      ],
    },
    {
      groupLabel: 'Operasional KA',
      items: [
        { id: 'passengers', label: 'Manifest Penumpang', icon: Users, badge: ticketTotal || 0 },
        { id: 'journey', label: 'Status Perjalanan', icon: Train },
      ],
    },
    {
      groupLabel: 'Layanan Kereta',
      items: [
        { id: 'services', label: 'Restorasi & Bantuan', icon: Utensils, badge: pendingServices || 0, badgeColor: '#ea580c' },
        { id: 'notifications', label: 'Pemberitahuan Tugas', icon: Bell },
      ],
    },
  ]
}

function StaffDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const isGate = profile?.staff_type === 'gate'
  const availableTabs = TABS
  const requestedTab = searchParams.get('tab')
  const activeTab = availableTabs.some(tab => tab.id === requestedTab) ? requestedTab : 'overview'
  const [stationName, setStationName] = useState('')
  const [journeys, setJourneys] = useState([])
  const [tickets, setTickets] = useState([])
  const [foodOrders, setFoodOrders] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // Validation form state
  const [ticketNumber, setTicketNumber] = useState('')
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const validatingRef = useRef(false)
  const [recentValidations, setRecentValidations] = useState([])

  // Journey status update state
  const [updating, setUpdating] = useState('')
  const [statusDrafts, setStatusDrafts] = useState({})
  const [statusNotes, setStatusNotes] = useState({})

  // Manifest filters
  const [passengerSearch, setPassengerSearch] = useState('')
  const [passengerScheduleFilter, setPassengerScheduleFilter] = useState('all')
  const [passengerValidatedFilter, setPassengerValidatedFilter] = useState('all')

  // Service Desk state
  const [orderFilter, setOrderFilter] = useState('all')
  const [reportFilter, setReportFilter] = useState('all')
  const [reportNoteInputs, setReportNoteInputs] = useState({})

  // Staff notifications
  const [staffNotifs, setStaffNotifs] = useState(() => [
    {
      id: 'sn-1',
      title: 'Briefing Operasional Keselamatan Perjalanan KA',
      desc: 'Pastikan seluruh pintu bordes gerbong terkunci sempurna sebelum kereta bergerak. Periksa alat pemadam api ringan (APAR) dan kotak P3K di kereta restorasi.',
      time: 'Hari Ini · 06.00 WIB',
      level: 'Penting',
    },
    {
      id: 'sn-2',
      title: 'Protokol Validasi Tiket Digital QR Code',
      desc: 'Setiap penumpang wajib menunjukkan e-boarding pass asli dari aplikasi RailHub dengan nama sesuai KTP. Tiket fisik atau screenshot tidak valid bila kode QR telah kedaluwarsa.',
      time: 'Hari Ini · 05.30 WIB',
      level: 'SOP',
    },
    {
      id: 'sn-3',
      title: 'Pemberitahuan Cuaca & Kondisi Jalur',
      desc: 'Jalur lintas utara Cirebon - Semarang dilaporkan lancar dengan kecepatan normal. Perhatikan jarak aman saat mendekati sinyal masuk stasiun.',
      time: 'Hari Ini · 05.00 WIB',
      level: 'Informasi',
    },
  ])

  function selectTab(tab) {
    router.push(`/dashboard/staff?tab=${tab}`, { scroll: false })
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fstaff')
    } else if (profile?.role && profile.role !== 'conductor' && profile.role !== 'gate' && profile.role !== 'staff' && !profile.staff_type) {
      router.replace(profile.role === 'admin' ? '/dashboard/admin' : '/dashboard/passenger')
    }
  }, [authLoading, user, profile, router])

  // Load operational data
  const loadStaffData = useCallback(async () => {
    if (!user || (profile?.role !== 'conductor' && profile?.role !== 'gate' && profile?.role !== 'staff' && !profile?.staff_type)) return
    if (!hasLoaded) setLoading(true)
    setError('')
    const supabase = createClient()

    try {
      if (isGate) {
        const { data: station } = profile?.station_id
          ? await supabase.from('stations').select('name, code').eq('id', profile.station_id).maybeSingle()
          : { data: null }
        setStationName(station ? `${station.name} (${station.code})` : user.email === 'gate.gambir@railhub.id' ? 'Stasiun Gambir (GMR)' : 'Stasiun belum ditetapkan')
        setJourneys([])
        setTickets([])
        setFoodOrders([])
        setReports([])
        setLoading(false)
        setHasLoaded(true)
        return
      }
      // 1. Fetch staff assignments
      const { data: dbAssignments, error: assignmentError } = await supabase
        .from('staff_assignments')
        .select('id, schedule_id, schedules(id, status, departure_time, arrival_time, trains(name, train_number), routes(name, distance_km))')
        .eq('staff_id', user.id)
        .order('created_at', { ascending: false })

      if (assignmentError) throw assignmentError

      let assignments = dbAssignments || []

      // If no explicit DB assignment, automatically fallback to pre-bundled train or station schedules!
      if (assignments.length === 0) {
        const bundled = getBundledStaffByEmail(user.email)
        if (bundled) {
          if (bundled.staffType === 'conductor' && bundled.trainName) {
            const { data: trainSchedules } = await supabase
              .from('schedules')
              .select('id, status, departure_time, arrival_time, trains(name, train_number), routes(name, distance_km)')
              .gte('departure_time', new Date(Date.now() - 6 * 3600 * 1000).toISOString())
              .order('departure_time', { ascending: true })
              .limit(50)

            const matched = (trainSchedules || []).filter(s =>
              s.trains?.name?.toLowerCase().includes(bundled.trainName.toLowerCase())
            )
            assignments = matched.map(s => ({
              id: `bundled-${s.id}`,
              schedule_id: s.id,
              schedules: s,
              isBundled: true,
            }))
          }
        }
      }

      const scheduleIds = (assignments || []).map(a => a.schedule_id)

      if (scheduleIds.length === 0) {
        setJourneys([])
        setTickets([])
        setFoodOrders([])
        setReports([])
        setLoading(false)
        setHasLoaded(true)
        return
      }

      // 2. Fetch parallel: tickets, updates, food orders, reports
      const [ticketRes, updateRes, foodRes, reportRes] = await Promise.all([
        supabase
          .from('tickets')
          .select('id, ticket_number, is_validated, validated_at, schedule_id, passengers(full_name, id_card_number), seats(seat_number, carriages(carriage_number, carriage_class)), schedules(departure_time, trains(name, train_number), routes(name))')
          .in('schedule_id', scheduleIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('journey_updates')
          .select('schedule_id, status, note, created_at, profiles(full_name)')
          .in('schedule_id', scheduleIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('food_orders')
          .select('id, order_code, schedule_id, status, total_amount, note, created_at, passengers(full_name), seats(seat_number), food_order_items(quantity, unit_price, food_products(name))')
          .in('schedule_id', scheduleIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('passenger_reports')
          .select('id, schedule_id, category, title, description, status, response_note, passenger_name, created_at, bookings(booking_code)')
          .in('schedule_id', scheduleIds)
          .order('created_at', { ascending: false }),
      ])

      const fetchedTickets = ticketRes.data || []
      const latestUpdates = {}
      for (const update of updateRes.data || []) {
        if (!latestUpdates[update.schedule_id]) latestUpdates[update.schedule_id] = update
      }

      setJourneys((assignments || []).map(assignment => ({
        ...assignment,
        tickets: fetchedTickets.filter(ticket => ticket.schedule_id === assignment.schedule_id),
        latestUpdate: latestUpdates[assignment.schedule_id] || null,
      })))

      setTickets(fetchedTickets)
      setFoodOrders(foodRes.data || [])
      setReports(reportRes.data || [])
    } catch (err) {
      setError(`Gagal memuat data operasional petugas: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }, [user, profile, isGate, hasLoaded])

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!active) return
      await loadStaffData()
    }
    const timer = window.setTimeout(load, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [loadStaffData, reloadKey])

  // Periodic 30s auto reload
  useEffect(() => {
    if (!user || profile?.role !== 'conductor') return
    const timer = window.setInterval(() => setReloadKey(key => key + 1), 30000)
    return () => window.clearInterval(timer)
  }, [user, profile?.role])

  // Validate ticket handler
  async function runValidation(code) {
    const value = code.trim()
    if (!value || validatingRef.current) return
    validatingRef.current = true
    setValidating(true)
    setValidation(null)
    const supabase = createClient()
    const { data, error: validationError } = await supabase.rpc('validate_assigned_ticket', {
      p_ticket_number: value.slice(0, 50),
    })
    validatingRef.current = false
    setValidating(false)
    if (validationError) {
      toast.error(`Validasi gagal: ${validationError.message}`)
      return
    }
    setValidation(data)
    if (data.success) {
      toast.success(data.message)
      setTicketNumber('')
      setRecentValidations(prev => [{
        ticket_number: data.ticket_number,
        passenger_name: data.passenger_name,
        seat_number: data.seat_number,
        validated_at: new Date().toISOString(),
        success: true,
      }, ...prev.slice(0, 9)])
      setReloadKey(key => key + 1)
    } else {
      toast.error(data.message)
    }
  }

  function validateTicket(event) {
    event.preventDefault()
    return runValidation(ticketNumber)
  }

  // Update Journey Status
  async function updateJourney(journey) {
    const scheduleId = journey.schedule_id
    const status = statusDrafts[scheduleId] || journey.schedules.status
    if (status === journey.schedules.status || updating) return
    setUpdating(scheduleId)
    const supabase = createClient()
    const { error: updateError } = await supabase.rpc('update_assigned_journey_status', {
      p_schedule_id: scheduleId,
      p_status: status,
      p_note: statusNotes[scheduleId]?.trim() || null,
    })
    setUpdating('')
    if (updateError) {
      toast.error(`Status perjalanan gagal diperbarui: ${updateError.message}`)
      return
    }
    const update = { status, note: statusNotes[scheduleId]?.trim() || null, created_at: new Date().toISOString() }
    setJourneys(current => current.map(item => item.schedule_id === scheduleId
      ? { ...item, schedules: { ...item.schedules, status }, latestUpdate: update }
      : item))
    setStatusDrafts(current => ({ ...current, [scheduleId]: status }))
    setStatusNotes(current => ({ ...current, [scheduleId]: '' }))
    toast.success('Status perjalanan diperbarui dan dapat dilihat penumpang secara langsung.')
  }

  // Update Food Order status
  async function updateOrderStatus(orderId, newStatus) {
    const supabase = createClient()
    const { error: err } = await supabase.rpc('staff_update_food_order', {
      p_order_id: orderId,
      p_status: newStatus,
    })
    if (err) {
      toast.error(`Gagal mengubah status pesanan: ${err.message}`)
      return
    }
    setFoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    toast.success(`Status pesanan diperbarui menjadi ${newStatus.replace('_', ' ')}`)
  }

  // Update Report status
  async function updateReportStatus(reportId, newStatus) {
    const supabase = createClient()
    const note = reportNoteInputs[reportId]?.trim() || null
    const { error: err } = await supabase.rpc('staff_update_passenger_report', {
      p_report_id: reportId,
      p_status: newStatus,
      p_response_note: note || '',
    })
    if (err) {
      toast.error(`Gagal memperbarui status laporan: ${err.message}`)
      return
    }
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus, response_note: note || r.response_note } : r))
    toast.success(`Laporan diperbarui menjadi: ${newStatus}`)
  }

  // Calculations
  const ticketTotal = tickets.length
  const validatedTotal = tickets.filter(t => t.is_validated).length
  const pendingOrders = foodOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length
  const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'in_progress').length
  const assistanceReports = reports.filter(r => ['assistance', 'medical', 'wheelchair', 'priority', 'facility'].includes(r.category) || !r.category?.includes('lost'))
  const lostFoundReports = reports.filter(r => ['lost_item', 'found_item', 'lost_and_found'].includes(r.category) || r.category?.includes('lost'))

  // Filtered Manifest
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const search = passengerSearch.trim().toLowerCase()
      const matchesSearch = !search || [
        t.ticket_number,
        t.passengers?.full_name,
        t.passengers?.id_card_number || t.passengers?.identity_number,
        t.seats?.seat_number,
      ].some(v => v?.toLowerCase().includes(search))

      const matchesSchedule = passengerScheduleFilter === 'all' || t.schedule_id === passengerScheduleFilter
      const matchesValidated = passengerValidatedFilter === 'all'
        ? true
        : passengerValidatedFilter === 'validated'
          ? t.is_validated
          : !t.is_validated

      return matchesSearch && matchesSchedule && matchesValidated
    })
  }, [tickets, passengerSearch, passengerScheduleFilter, passengerValidatedFilter])

  const pendingServices = pendingOrders + pendingReports
  const menuGroups = useMemo(() => getStaffMenuGroups({
    isGate,
    ticketTotal,
    pendingServices,
  }), [isGate, ticketTotal, pendingServices])

  return (
    <OperationalDashboardShell
      role={isGate ? 'gate' : 'conductor'}
      roleBadge={isGate ? 'Petugas Gerbang & Boarding' : 'Kondektur & Operasional KA'}
      subtitle={isGate ? `Lokasi tugas: ${stationName || 'Stasiun Gambir (GMR)'} · Gate In & Validasi Boarding` : (journeys[0] ? `Dinas Aktif: ${journeys[0].schedules?.trains?.name || 'Kereta Api'} · Total ${journeys.length} Perjalanan` : 'Area Penugasan Operasional Awak Kereta Api')}
      menuGroups={menuGroups}
      activeTab={activeTab}
      onSelectTab={selectTab}
      loading={loading}
      error={error}
      onRefresh={() => { setError(''); setLoading(true); setReloadKey(k => k + 1) }}
    >
          {/* ── TAB 1: OVERVIEW ──────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Perjalanan Tugas', value: journeys.length, icon: Train, color: 'var(--rh-primary)' },
                  { label: 'Manifest Penumpang', value: ticketTotal, icon: Users, color: 'var(--rh-info)' },
                  { label: 'Tiket Tervalidasi', value: `${validatedTotal} / ${ticketTotal}`, sub: ticketTotal ? `${Math.round((validatedTotal / ticketTotal) * 100)}% boarding` : '0%', icon: CheckCircle2, color: 'var(--rh-success)' },
                  { label: 'Pesanan Makanan Aktif', value: pendingOrders, icon: Utensils, color: 'var(--rh-accent)' },
                  { label: 'Laporan Bantuan / Hilang', value: pendingReports, icon: HelpingHand, color: 'var(--rh-secondary)' },
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <article key={idx} className="rh-card" style={{ padding: '1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--rh-surface)', color: item.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <small style={{ color: 'var(--rh-text-2)', display: 'block', fontSize: '0.8rem' }}>{item.label}</small>
                          <strong style={{ fontSize: '1.35rem', display: 'block', lineHeight: 1.25 }}>{item.value}</strong>
                          {item.sub && <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>{item.sub}</small>}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="rh-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(26,66,138,0.04), rgba(255,140,0,0.04))' }}>
                <h3 className="rh-h4" style={{ margin: '0 0 0.75rem' }}>Aksi Cepat Petugas</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button type="button" className="rh-btn rh-btn-primary" onClick={() => selectTab('validation')}>
                    <TicketCheck size={16} /> Buka Scanner Validasi Tiket
                  </button>
                  <button type="button" className="rh-btn rh-btn-secondary" onClick={() => selectTab('passengers')}>
                    <Users size={16} /> Buka Manifest Penumpang
                  </button>
                  <button type="button" className="rh-btn rh-btn-ghost" onClick={() => selectTab('journey')}>
                    <Train size={16} /> Update Status Perjalanan
                  </button>
                  <button type="button" className="rh-btn rh-btn-ghost" onClick={() => selectTab('orders')}>
                    <Utensils size={16} /> Cek Pesanan Makanan ({pendingOrders})
                  </button>
                </div>
              </div>

              {/* Active Assigned Journeys List */}
              <section>
                <h3 className="rh-h3" style={{ margin: '0 0 0.85rem' }}>Jadwal Penugasan Hari Ini</h3>
                {journeys.length === 0 ? (
                  <div className="rh-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--rh-text-2)' }}>
                    <Train size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>Belum ada jadwal perjalanan yang ditugaskan kepada akun Anda.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {journeys.map(j => {
                      const s = j.schedules
                      const countVal = j.tickets.filter(t => t.is_validated).length
                      return (
                        <article key={j.id} className="rh-card" style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <strong style={{ fontSize: '1.1rem' }}>{s?.trains?.name} · {s?.trains?.train_number}</strong>
                                <JourneyStatus status={s?.status} />
                              </div>
                              <span style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>{s?.routes?.name}</span>
                              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--rh-text-3)' }}>
                                <span><CalendarDays size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{formatDate(s?.departure_time)}</span>
                                <span><Clock3 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{formatTime(s?.departure_time)} WIB</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)', marginBottom: '0.5rem' }}>
                                Validasi: <strong>{countVal} / {j.tickets.length}</strong> tiket
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="button" className="rh-btn rh-btn-primary rh-btn-sm" onClick={() => { setPassengerScheduleFilter(j.schedule_id); selectTab('passengers') }}>
                                  Lihat Penumpang
                                </button>
                                <button type="button" className="rh-btn rh-btn-ghost rh-btn-sm" onClick={() => selectTab('journey')}>
                                  Ubah Status
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── TAB 2: TICKET VALIDATION ────────────────────────────────────── */}
          {activeTab === 'validation' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="rh-badge rh-badge-primary">Validasi Tiket &amp; Boarding</span>
                <h2 className="rh-h3" style={{ margin: '0.4rem 0 0.2rem' }}>Validasi Tiket Digital QR Code</h2>
                <p style={{ margin: 0, color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Arahkan kamera ke QR Code boarding pass tiket penumpang, atau masukkan kode tiket secara manual.
                </p>
              </div>

              <div className="rh-gate-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <TicketScanner onScan={runValidation} paused={validating} />

                  <form onSubmit={validateTicket} style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                    <label className="rh-input-group" style={{ flex: 1, margin: 0 }}>
                      <span className="rh-label-text">Kode Tiket Manual</span>
                      <input
                        className="rh-input rh-mono"
                        placeholder="Contoh: TKT-202611-…"
                        value={ticketNumber}
                        onChange={e => setTicketNumber(e.target.value)}
                        required
                      />
                    </label>
                    <button type="submit" className="rh-btn rh-btn-primary" disabled={validating} style={{ alignSelf: 'end', minHeight: 44 }}>
                      {validating ? <RefreshCw size={16} className="rh-spin" /> : 'Validasi'}
                    </button>
                  </form>
                </div>

                {/* Gate Result Graphic */}
                <div>
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rh-gate-result ${validation ? (validation.success ? 'rh-gate-ok' : 'rh-gate-fail') : ''}`}
                    style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: 16 }}
                  >
                    {!validation && (
                      <div style={{ color: 'var(--rh-text-2)' }}>
                        <TicketCheck size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                        <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--rh-text)' }}>
                          {validating ? 'Memeriksa tiket…' : 'Siap Memindai'}
                        </strong>
                        <span style={{ fontSize: '0.85rem' }}>Arahkan kamera ke QR Code atau ketik kode tiket.</span>
                      </div>
                    )}

                    {validation && (
                      <>
                        {validation.success ? <CheckCircle2 size={56} color="var(--rh-success)" /> : <XCircle size={56} color="var(--rh-danger)" />}
                        <strong style={{ fontSize: '1.4rem', marginTop: '0.5rem', color: validation.success ? 'var(--rh-success)' : 'var(--rh-danger)' }}>
                          {validation.success ? 'TIKET VALID · BOARDING BERHASIL' : 'AKSES DITOLAK'}
                        </strong>
                        <p style={{ margin: '0.4rem 0 0.8rem', fontSize: '0.9rem' }}>{validation.message}</p>
                        {validation.ticket_number && (
                          <div style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 10, padding: '0.75rem 1.25rem', width: '100%', maxWidth: 320, textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>Nama Penumpang:</div>
                            <strong style={{ display: 'block', fontSize: '1rem' }}>{validation.passenger_name}</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                              <span>Kursi: <b>{validation.seat_number}</b></span>
                              <span className="rh-mono" style={{ fontSize: '0.8rem' }}>{validation.ticket_number}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Recent Validations Log */}
                  {recentValidations.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Riwayat Validasi Terakhir Sesi Ini:</strong>
                      <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.4rem' }}>
                        {recentValidations.map((rv, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: 8, background: 'var(--rh-surface)', fontSize: '0.8rem' }}>
                            <span><strong>{rv.passenger_name}</strong> ({rv.seat_number})</span>
                            <span className="rh-mono" style={{ color: 'var(--rh-success)', fontWeight: 700 }}>{rv.ticket_number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── TAB 3: PASSENGER LIST (MANIFEST) ────────────────────────────── */}
          {activeTab === 'passengers' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Manifest Penumpang</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Daftar seluruh penumpang bertiket pada perjalanan kereta api yang ditugaskan kepada Anda.
                  </p>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                  Total: <strong>{filteredTickets.length}</strong> penumpang
                </span>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <label className="rh-input-group" style={{ flex: '1 1 250px', margin: 0 }}>
                  <span className="rh-label-text">Cari Penumpang / Tiket</span>
                  <span style={{ position: 'relative', display: 'block' }}>
                    <Search size={16} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'var(--rh-text-3)' }} />
                    <input
                      className="rh-input"
                      style={{ paddingLeft: 36 }}
                      placeholder="Nama, No. KTP, Kode Tiket, Kursi…"
                      value={passengerSearch}
                      onChange={e => setPassengerSearch(e.target.value)}
                    />
                  </span>
                </label>

                <label className="rh-input-group" style={{ flex: '1 1 200px', margin: 0 }}>
                  <span className="rh-label-text">Pilih Kereta</span>
                  <select
                    className="rh-input"
                    value={passengerScheduleFilter}
                    onChange={e => setPassengerScheduleFilter(e.target.value)}
                  >
                    <option value="all">Semua Kereta Tugas</option>
                    {journeys.map(j => (
                      <option key={j.schedule_id} value={j.schedule_id}>
                        {j.schedules?.trains?.name} · {j.schedules?.trains?.train_number}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rh-input-group" style={{ flex: '0 1 180px', margin: 0 }}>
                  <span className="rh-label-text">Status Boarding</span>
                  <select
                    className="rh-input"
                    value={passengerValidatedFilter}
                    onChange={e => setPassengerValidatedFilter(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="validated">Sudah Validasi</option>
                    <option value="unvalidated">Belum Validasi</option>
                  </select>
                </label>
              </div>

              {/* Manifest Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Tempat Duduk</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Nama Penumpang</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>No. Tiket</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Perjalanan</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--rh-text-2)' }}>
                          Tidak ada data penumpang yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(t => {
                        const seat = t.seats
                        const carriage = seat?.carriages
                        const passenger = t.passengers
                        const schedule = t.schedules

                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong style={{ color: 'var(--rh-primary)', fontSize: '1rem' }}>
                                {seat?.seat_number || '-'}
                              </strong>
                              <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>
                                {carriage?.carriage_class || carriage?.class || 'Eksekutif'} {carriage?.carriage_number ? `(${carriage.carriage_number})` : ''}
                              </small>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <strong>{passenger?.full_name || 'Penumpang'}</strong>
                              {(passenger?.id_card_number || passenger?.identity_number) && (
                                <small style={{ display: 'block', color: 'var(--rh-text-3)' }}>
                                  NIK: {passenger.id_card_number || passenger.identity_number}
                                </small>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span className="rh-mono" style={{ fontWeight: 700 }}>{t.ticket_number}</span>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span>{schedule?.trains?.name}</span>
                              <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{schedule?.routes?.name}</small>
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              {t.is_validated ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', borderRadius: 999, background: 'var(--rh-success-light)', color: 'var(--rh-success)', fontSize: '0.75rem', fontWeight: 700 }}>
                                  <CheckCircle2 size={12} /> Tervalidasi
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', borderRadius: 999, background: 'var(--rh-warning-light)', color: 'var(--rh-warning)', fontSize: '0.75rem', fontWeight: 700 }}>
                                  <Clock3 size={12} /> Menunggu
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              {!t.is_validated ? (
                                <button
                                  type="button"
                                  className="rh-btn rh-btn-primary rh-btn-sm"
                                  onClick={() => runValidation(t.ticket_number)}
                                  disabled={validating}
                                >
                                  Validasi Cepat
                                </button>
                              ) : (
                                <span style={{ color: 'var(--rh-text-3)', fontSize: '0.75rem' }}>
                                  {t.validated_at ? formatTime(t.validated_at) : 'OK'}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── TAB 4: JOURNEY MANAGEMENT ───────────────────────────────────── */}
          {activeTab === 'journey' && (
            <section style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="rh-card" style={{ padding: '1.25rem' }}>
                <h2 className="rh-h3" style={{ margin: 0 }}>Manajemen Status Perjalanan</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Pembaruan status di halaman ini ditampilkan pada status perjalanan penumpang dan layar informasi operasional.
                </p>
              </div>

              {journeys.length === 0 ? (
                <div className="rh-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--rh-text-2)' }}>
                  Belum ada penugasan perjalanan.
                </div>
              ) : (
                journeys.map(j => {
                  const s = j.schedules
                  const currentStatus = s?.status || 'scheduled'
                  const nextStatuses = getNextJourneyStatuses(currentStatus)
                  const draftStatus = statusDrafts[j.schedule_id] || currentStatus

                  return (
                    <article key={j.id} className="rh-card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--rh-border)', paddingBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <h3 className="rh-h3" style={{ margin: 0 }}>{s?.trains?.name} · {s?.trains?.train_number}</h3>
                            <JourneyStatus status={currentStatus} />
                          </div>
                          <span style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>{s?.routes?.name}</span>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--rh-text-3)' }}>
                            <span>Keberangkatan: {formatDate(s?.departure_time)} · {formatTime(s?.departure_time)} WIB</span>
                            <span>Estimasi Tiba: {formatTime(s?.arrival_time)} WIB</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                            Tiket Boarding: <strong>{j.tickets.filter(t => t.is_validated).length} / {j.tickets.length}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Station Progress Track Preview */}
                      <div style={{ margin: '1.25rem 0', background: 'var(--rh-surface)', padding: '1rem', borderRadius: 12 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rh-text-2)', textTransform: 'uppercase' }}>
                          Progres Rute Stasiun
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '50%', left: 10, right: 10, height: 3, background: 'var(--rh-border)', zIndex: 0 }} />
                          {['Stasiun Asal', 'Stasiun Antara', 'Pemeriksaan Sinyal', 'Stasiun Akhir'].map((stop, idx) => {
                            const reached = currentStatus === 'arrived' || (currentStatus === 'departed' && idx <= 1) || (currentStatus === 'boarding' && idx === 0)
                            return (
                              <div key={idx} style={{ position: 'relative', zIndex: 1, textAlign: 'center', background: 'var(--rh-surface)', padding: '0 6px' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: reached ? 'var(--rh-primary)' : 'var(--rh-border)', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto', fontSize: '0.75rem', fontWeight: 700 }}>
                                  {idx + 1}
                                </div>
                                <small style={{ display: 'block', fontSize: '0.72rem', marginTop: 4, color: reached ? 'var(--rh-text)' : 'var(--rh-text-3)' }}>
                                  {stop}
                                </small>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Latest Note log */}
                      {j.latestUpdate && (
                        <div style={{ background: 'rgba(26,66,138,0.05)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                          <small style={{ color: 'var(--rh-primary)', fontWeight: 700 }}>
                            Catatan Operasional Terakhir ({getJourneyStatusLabel(j.latestUpdate.status)}):
                          </small>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>{j.latestUpdate.note || 'Tidak ada catatan.'}</p>
                          <small style={{ color: 'var(--rh-text-3)', fontSize: '0.75rem' }}>
                            {formatDate(j.latestUpdate.created_at)} {formatTime(j.latestUpdate.created_at)} WIB
                          </small>
                        </div>
                      )}

                      {/* Status Update Form */}
                      <form
                        onSubmit={e => { e.preventDefault(); updateJourney(j) }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'end' }}
                      >
                        <label className="rh-input-group" style={{ margin: 0 }}>
                          <span className="rh-label-text">Pilih Status Baru</span>
                          <select
                            className="rh-input"
                            value={draftStatus}
                            onChange={e => setStatusDrafts(curr => ({ ...curr, [j.schedule_id]: e.target.value }))}
                          >
                            <option value={currentStatus}>{getJourneyStatusLabel(currentStatus)} (Saat Ini)</option>
                            {nextStatuses.map(st => (
                              <option key={st} value={st}>{getJourneyStatusLabel(st)}</option>
                            ))}
                          </select>
                        </label>

                        <label className="rh-input-group" style={{ margin: 0 }}>
                          <span className="rh-label-text">Catatan Informasi Penumpang / Stasiun (Opsional)</span>
                          <input
                            className="rh-input"
                            maxLength={500}
                            placeholder="Contoh: Berjalan tepat waktu, jalur peron aman"
                            value={statusNotes[j.schedule_id] || ''}
                            onChange={e => setStatusNotes(curr => ({ ...curr, [j.schedule_id]: e.target.value }))}
                          />
                        </label>

                        <button
                          type="submit"
                          className="rh-btn rh-btn-primary"
                          disabled={updating === j.schedule_id || draftStatus === currentStatus}
                          style={{ minHeight: 44 }}
                        >
                          {updating === j.schedule_id ? <RefreshCw size={16} className="rh-spin" /> : 'Simpan Status'}
                        </button>
                      </form>
                    </article>
                  )
                })
              )}
            </section>
          )}

          {/* ── TAB 5: ASSISTANCE REPORTS ───────────────────────────────────── */}
          {activeTab === 'services' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Laporan Bantuan Khusus Penumpang</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Permintaan bantuan kursi roda, lansia, ibu hamil, medis, atau kendala fasilitas di dalam gerbong.
                  </p>
                </div>
                <span className="rh-badge rh-badge-secondary">{assistanceReports.length} Laporan</span>
              </div>

              {assistanceReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--rh-text-2)' }}>
                  <HelpingHand size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>Tidak ada laporan bantuan yang sedang menunggu di perjalanan Anda.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {assistanceReports.map(rep => (
                    <article key={rep.id} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem', background: 'var(--rh-surface)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{rep.title || 'Laporan Bantuan'}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                            Pemohon: <b>{rep.passenger_name}</b> · Booking: <span className="rh-mono">{rep.bookings?.booking_code || '-'}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 999, fontWeight: 700, background: rep.status === 'resolved' ? 'var(--rh-success-light)' : 'var(--rh-warning-light)', color: rep.status === 'resolved' ? 'var(--rh-success)' : 'var(--rh-warning)' }}>
                          {rep.status}
                        </span>
                      </div>

                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--rh-text)' }}>
                        {rep.description}
                      </p>

                      {rep.response_note && (
                        <div style={{ background: '#fff', border: '1px solid var(--rh-border)', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                          <span style={{ color: 'var(--rh-primary)', fontWeight: 700 }}>Respon Petugas: </span>
                          {rep.response_note}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid var(--rh-border)', paddingTop: '0.75rem' }}>
                        <input
                          className="rh-input rh-input-sm"
                          style={{ flex: '1 1 200px' }}
                          placeholder="Catatan tindak lanjut…"
                          value={reportNoteInputs[rep.id] || ''}
                          onChange={e => setReportNoteInputs(curr => ({ ...curr, [rep.id]: e.target.value }))}
                        />
                        {rep.status === 'pending' && (
                          <button type="button" className="rh-btn rh-btn-primary rh-btn-sm" onClick={() => updateReportStatus(rep.id, 'in_progress')}>
                            Tindak Lanjuti
                          </button>
                        )}
                        {rep.status !== 'resolved' && (
                          <button type="button" className="rh-btn rh-btn-secondary rh-btn-sm" onClick={() => updateReportStatus(rep.id, 'resolved')}>
                            Selesaikan Bantuan
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── TAB 6: LOST & FOUND ─────────────────────────────────────────── */}
          {activeTab === 'services' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Lost & Found (Barang Hilang / Tertinggal)</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Daftar laporan barang penumpang yang tertinggal di gerbong atau stasiun untuk diidentifikasi petugas.
                  </p>
                </div>
                <span className="rh-badge rh-badge-primary">{lostFoundReports.length} Laporan</span>
              </div>

              {lostFoundReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--rh-text-2)' }}>
                  <PackageSearch size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>Belum ada laporan barang hilang di perjalanan tugas ini.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {lostFoundReports.map(rep => (
                    <article key={rep.id} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem', background: 'var(--rh-surface)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{rep.title || 'Barang Tertinggal'}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>
                            Pelapor: <b>{rep.passenger_name}</b> · Booking: <span className="rh-mono">{rep.bookings?.booking_code || '-'}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 999, fontWeight: 700, background: rep.status === 'resolved' ? 'var(--rh-success-light)' : 'var(--rh-warning-light)', color: rep.status === 'resolved' ? 'var(--rh-success)' : 'var(--rh-warning)' }}>
                          {rep.status}
                        </span>
                      </div>

                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{rep.description}</p>

                      {rep.response_note && (
                        <div style={{ background: '#fff', border: '1px solid var(--rh-border)', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                          <span style={{ color: 'var(--rh-primary)', fontWeight: 700 }}>Status Penyimpanan: </span>
                          {rep.response_note}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid var(--rh-border)', paddingTop: '0.75rem' }}>
                        <input
                          className="rh-input rh-input-sm"
                          style={{ flex: '1 1 200px' }}
                          placeholder="Lokasi penyimpanan / respons (mis. disimpan di Pos Keamanan)…"
                          value={reportNoteInputs[rep.id] || ''}
                          onChange={e => setReportNoteInputs(curr => ({ ...curr, [rep.id]: e.target.value }))}
                        />
                        {rep.status !== 'resolved' && (
                          <button type="button" className="rh-btn rh-btn-success rh-btn-sm" onClick={() => updateReportStatus(rep.id, 'resolved')}>
                            Tandai Ditemukan & Disimpan
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── TAB 7: FOOD ORDERS ─────────────────────────────────────────── */}
          {activeTab === 'services' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Pesanan Makanan di Kereta (Onboard Dining)</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Pesanan kuliner kereta dari penumpang bertiket untuk diantarkan langsung ke nomor kursi.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'pending', 'confirmed', 'preparing', 'on_the_way', 'completed'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`rh-btn rh-btn-sm ${orderFilter === st ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
                      onClick={() => setOrderFilter(st)}
                    >
                      {st === 'all' ? 'Semua' : st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {foodOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--rh-text-2)' }}>
                  <Utensils size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>Belum ada pesanan makanan pada perjalanan yang ditugaskan.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {foodOrders
                    .filter(o => orderFilter === 'all' || o.status === orderFilter)
                    .map(order => {
                      return (
                        <article key={order.id} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem', background: 'var(--rh-surface)' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--rh-primary)' }}>{order.order_code}</strong>
                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: order.status === 'completed' ? 'var(--rh-success-light)' : 'var(--rh-accent-light)', color: order.status === 'completed' ? 'var(--rh-success)' : 'var(--rh-accent-dark)' }}>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.88rem', color: 'var(--rh-text-2)' }}>
                                Penumpang: <b>{order.passengers?.full_name}</b> · Kursi: <strong style={{ color: 'var(--rh-primary)' }}>{order.seats?.seat_number || '12A'}</strong>
                              </span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ fontSize: '1.1rem', color: 'var(--rh-text)' }}>{formatIDR(order.total_amount)}</strong>
                              <small style={{ display: 'block', color: 'var(--rh-text-3)', fontSize: '0.75rem' }}>{formatTime(order.created_at)} WIB</small>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 8, padding: '0.65rem 0.9rem', marginBottom: '0.85rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rh-text-2)', marginBottom: '0.35rem' }}>Menu Dipesan:</div>
                            {order.food_order_items?.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.15rem 0' }}>
                                <span>{item.quantity}x {item.food_products?.name || 'Menu Kereta'}</span>
                                <span>{formatIDR(item.unit_price * item.quantity)}</span>
                              </div>
                            ))}
                            {order.note && (
                              <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--rh-accent-dark)', fontStyle: 'italic' }}>
                                Catatan: &quot;{order.note}&quot;
                              </small>
                            )}
                          </div>

                          {/* Progression Actions */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {order.status === 'pending' && (
                              <button type="button" className="rh-btn rh-btn-primary rh-btn-sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                                Konfirmasi Pesanan
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button type="button" className="rh-btn rh-btn-primary rh-btn-sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                Mulai Siapkan di Restorasi
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button type="button" className="rh-btn rh-btn-accent rh-btn-sm" onClick={() => updateOrderStatus(order.id, 'on_the_way')}>
                                Antar ke Kursi Penumpang
                              </button>
                            )}
                            {order.status === 'on_the_way' && (
                              <button type="button" className="rh-btn rh-btn-success rh-btn-sm" onClick={() => updateOrderStatus(order.id, 'completed')}>
                                Selesai Diterima Penumpang
                              </button>
                            )}
                          </div>
                        </article>
                      )
                    })}
                </div>
              )}
            </section>
          )}

          {/* ── TAB 8: NOTIFICATIONS ────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <section className="rh-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className="rh-h3" style={{ margin: 0 }}>Pemberitahuan Tugas & Protokol Dinas</h2>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Instruksi operasional, pengumuman keselamatan PT KAI / RailHub, dan log perubahan status dinas.
                  </p>
                </div>
                {staffNotifs.length > 0 && (
                  <button
                    type="button"
                    className="rh-btn rh-btn-ghost rh-btn-sm"
                    style={{ color: 'var(--rh-danger)' }}
                    onClick={() => {
                      setStaffNotifs([])
                      toast.success('Semua pemberitahuan telah dibersihkan.')
                    }}
                  >
                    <Trash2 size={14} /> Hapus Semua
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {staffNotifs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--rh-text-2)' }}>
                    <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem', display: 'block' }} />
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Belum ada pemberitahuan baru</strong>
                    <small>Seluruh instruksi atau pengumuman tugas telah dibersihkan.</small>
                  </div>
                ) : (
                  staffNotifs.map(notif => (
                    <article key={notif.id} style={{ position: 'relative', padding: '1rem', borderRadius: 12, border: '1px solid var(--rh-border)', background: 'var(--rh-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{notif.title}</strong>
                          <span className="rh-badge rh-badge-primary">{notif.level}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStaffNotifs(prev => prev.filter(n => n.id !== notif.id))
                            toast.success('Pemberitahuan berhasil dihapus.')
                          }}
                          title="Hapus pemberitahuan"
                          aria-label="Hapus pemberitahuan"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--rh-text-3)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--rh-danger)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--rh-text-3)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--rh-text-2)' }}>{notif.desc}</p>
                      <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--rh-text-3)', fontSize: '0.75rem' }}>{notif.time}</small>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}

    </OperationalDashboardShell>
  )
}

export default function StaffDashboard() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--rh-surface)', display: 'grid', placeItems: 'center' }}>
        <div className="rh-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="rh-spin" style={{ width: 36, height: 36, border: '3px solid var(--rh-border)', borderTopColor: 'var(--rh-primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <strong>Memuat Dashboard Petugas…</strong>
        </div>
      </div>
    }>
      <StaffDashboardContent />
    </Suspense>
  )
}
