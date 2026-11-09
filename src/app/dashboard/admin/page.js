'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  Edit2,
  Eye,
  FileText,
  Filter,
  Grid,
  Info,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Navigation,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Train,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  Utensils,
  X,
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
import { isRealUserAccount, getAccountTypeInfo } from '@/lib/utils/account-detector'

const bookingStatusLabels = {
  pending: 'Menunggu pembayaran',
  paid: 'Terbayar',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
  refunded: 'Dikembalikan',
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

function getTripOperationalCategory(schedule, nowTime = new Date()) {
  const status = schedule.status
  const depTime = new Date(schedule.departure_time)
  const arrTime = new Date(schedule.arrival_time)

  if (status === 'cancelled') return 'cancelled'
  if (status === 'arrived' || arrTime < nowTime) {
    return 'sudah_jalan'
  }
  if (status === 'departed' || status === 'boarding' || (depTime <= nowTime && arrTime >= nowTime)) {
    return 'sedang_jalan'
  }
  return 'belum_jalan'
}

// Sidebar Navigation Groups
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
      { id: 'journeys', label: 'Perjalanan & Jadwal KA', icon: CalendarDays },
      { id: 'trains', label: 'Armada & Spesifikasi', icon: Train },
      { id: 'routes', label: 'Jalur & Rute Koridor', icon: Navigation },
      { id: 'stations', label: 'Stasiun & Wilayah', icon: MapPin },
      { id: 'seats', label: 'Formasi Kursi Gerbong', icon: Grid },
    ],
  },
  {
    groupLabel: 'Staf & Petugas',
    items: [
      { id: 'staff', label: 'Petugas & Akun (jxx)', icon: ShieldCheck, badge: unassignedCount || 0, badgeColor: '#f59e0b' },
      { id: 'users', label: 'Pengguna & Penumpang', icon: Users },
    ],
  },
  {
    groupLabel: 'Bisnis & Keuangan',
    items: [
      { id: 'finance', label: 'Laporan Keuangan', icon: CircleDollarSign },
      { id: 'bookings', label: 'Semua Pemesanan', icon: TicketCheck, badge: stats?.bookings || 0 },
      { id: 'reports', label: 'Layanan & Bantuan', icon: ClipboardList },
      { id: 'content', label: 'Pengumuman Sistem', icon: Megaphone },
    ],
  },
]

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const { confirm } = useConfirm()

  const tabQuery = searchParams.get('tab')
  const initialTab = tabQuery || 'overview'

  const [activeTab, setActiveTabState] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sync tab with URL
  const setActiveTab = useCallback((newTab) => {
    setActiveTabState(newTab)
    const url = newTab === 'overview' ? '/dashboard/admin' : `/dashboard/admin?tab=${newTab}`
    window.history.replaceState(null, '', url)
  }, [])

  useEffect(() => {
    if (tabQuery && tabQuery !== activeTab) {
      setActiveTabState(tabQuery)
    }
  }, [tabQuery, activeTab])

  // Core Data States
  const [stats, setStats] = useState({
    passengers: 0,
    bookings: 0,
    trains: 0,
    stations: 0,
    revenue: 0,
    activeSchedules: 0,
    sedangJalan: 0,
    sudahJalan: 0,
    belumJalan: 0,
  })
  const [stations, setStations] = useState([])
  const [trains, setTrains] = useState([])
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [fares, setFares] = useState([])
  const [bookings, setBookings] = useState([])
  const [usersList, setUsersList] = useState([])
  const [assignments, setAssignments] = useState([])
  const [staffUsers, setStaffUsers] = useState([])

  // Journeys Filter States
  const [journeyStatusFilter, setJourneyStatusFilter] = useState('all') // 'all' | 'sedang_jalan' | 'belum_jalan' | 'sudah_jalan'
  const [journeyDateFrom, setJourneyDateFrom] = useState('')
  const [journeyDateTo, setJourneyDateTo] = useState('')
  const [journeySearch, setJourneySearch] = useState('')
  const [onlyRealAccountsFilter, setOnlyRealAccountsFilter] = useState(false)
  const [selectedCarriageIdx, setSelectedCarriageIdx] = useState(1)

  // Manifest Modal State
  const [manifestModalOpen, setManifestModalOpen] = useState(false)
  const [manifestLoading, setManifestLoading] = useState(false)
  const [selectedScheduleForManifest, setSelectedScheduleForManifest] = useState(null)
  const [manifestData, setManifestData] = useState(null)

  // Quick Staff Creation State
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [creatingStaff, setCreatingStaff] = useState(false)
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffPassword, setNewStaffPassword] = useState('petugas123')
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffType, setNewStaffType] = useState('conductor') // 'conductor' | 'gate'
  const [newStaffStationId, setNewStaffStationId] = useState('')
  const [newStaffScheduleId, setNewStaffScheduleId] = useState('')
  const [createdStaffCredential, setCreatedStaffCredential] = useState(null)

  // Add Train Modal State
  const [trainModalOpen, setTrainModalOpen] = useState(false)
  const [addingTrain, setAddingTrain] = useState(false)
  const [newTrainName, setNewTrainName] = useState('')
  const [newTrainNumber, setNewTrainNumber] = useState('')
  const [newTrainClass, setNewTrainClass] = useState('Eksekutif & Luxury')
  const [newTrainLoco, setNewTrainLoco] = useState('CC 206 GE (General Electric)')
  const [newTrainFormation, setNewTrainFormation] = useState('8 Gerbong Eksekutif + 1 Kereta Makan + 1 Kereta Pembangkit')
  const [newTrainRules, setNewTrainRules] = useState('Kecepatan maks 120 km/jam. Toleransi bagasi 20kg per penumpang. Larangan merokok di seluruh gerbong.')

  // Add Route Modal State
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [addingRoute, setAddingRoute] = useState(false)
  const [newRouteName, setNewRouteName] = useState('')
  const [newRouteOriginId, setNewRouteOriginId] = useState('')
  const [newRouteDestId, setNewRouteDestId] = useState('')
  const [newRouteDistance, setNewRouteDistance] = useState(450)
  const [newRouteDuration, setNewRouteDuration] = useState(360)

  // Add Station State
  const [addingStation, setAddingStation] = useState(false)
  const [newStationCode, setNewStationCode] = useState('')
  const [newStationName, setNewStationName] = useState('')
  const [newStationCity, setNewStationCity] = useState('')
  const [newStationProvince, setNewStationProvince] = useState('DKI Jakarta')
  const [stationSearch, setStationSearch] = useState('')
  const [stationProvinceFilter, setStationProvinceFilter] = useState('all')

  // Staff Assignment State
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Financial Report State
  const [financialData, setFinancialData] = useState({
    ticketRevenue: 0,
    foodRevenue: 0,
    refundDeductions: 0,
    netRevenue: 0,
    totalBookings: 0,
    transactions: [],
  })
  const [financialLoading, setFinancialLoading] = useState(false)
  const [financialCategoryFilter, setFinancialCategoryFilter] = useState('all')

  // Search in Bookings and Users
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')

  // Initialize Dates: default to today until 25 December 2026
  useEffect(() => {
    const today = jakartaDateInputValue()
    setJourneyDateFrom(today)
    // Full operational range through 25 December 2026
    setJourneyDateTo('2026-12-25')
  }, [])

  // Auto-generate next suggested staff email (e.g. j01@gmail.com, j02@gmail.com)
  const suggestNextStaffEmail = useCallback(() => {
    const existing = usersList
      .map(u => u.email?.toLowerCase() || '')
      .filter(e => /^j\d+@gmail\.com$/.test(e))
    let highest = 0
    for (const e of existing) {
      const num = parseInt(e.replace('j', '').replace('@gmail.com', ''), 10)
      if (num > highest) highest = num
    }
    const nextNum = String(highest + 1).padStart(2, '0')
    const email = `j${nextNum}@gmail.com`
    setNewStaffEmail(email)
    setNewStaffName(`Petugas Operasional J${nextNum}`)
    setNewStaffPassword('petugas123')
  }, [usersList])

  // Authentication gate
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fadmin')
    } else if (!authLoading && profile?.role && profile.role !== 'admin') {
      router.replace(
        profile.role === 'conductor' || profile.role === 'gate' || profile.role === 'staff'
          ? '/dashboard/staff'
          : '/dashboard/passenger'
      )
    }
  }, [authLoading, profile?.role, router, user])

  // Main Data Loading
  const loadAdminData = useCallback(async () => {
    if (!user || profile?.role !== 'admin') return
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Fetch base resources in parallel
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
        supabase.from('trains').select('id, name, train_number, operator, service_class, description').order('name'),
        supabase.from('routes').select('id, name, distance_km, origin_station_id, destination_station_id').order('name'),
        supabase
          .from('schedules')
          .select('id, status, departure_time, arrival_time, note, trains(id, name, train_number, service_class), routes(id, name, distance_km)')
          .order('departure_time', { ascending: false })
          .limit(500),
        supabase.from('fares').select('id, schedule_id, carriage_class, price, currency, schedules(routes(name))').order('price'),
        supabase
          .from('bookings')
          .select('id, booking_code, user_id, total_amount, status, created_at, schedules(id, departure_time, trains(name, train_number), routes(name))')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('profiles').select('id, full_name, email, role, staff_type, station_id, phone_number, created_at').order('created_at', { ascending: false }),
        supabase
          .from('staff_assignments')
          .select('id, staff_id, schedule_id, profiles!staff_assignments_staff_id_fkey(id, full_name, email, role), schedules(departure_time, trains(name, train_number), routes(name))')
          .order('created_at', { ascending: false }),
      ])

      const failedResult = [stationsRes, trainsRes, routesRes, schedulesRes, faresRes, bookingsRes, profilesRes, assignmentsRes].find(
        r => r.error
      )
      if (failedResult) throw failedResult.error

      const allProfiles = profilesRes.data || []
      const profilesById = new Map(allProfiles.map(p => [p.id, p]))

      // Map bookings with user profile
      const mappedBookings = (bookingsRes.data || []).map(b => ({
        ...b,
        profiles: profilesById.get(b.user_id) || null,
        isRealAccount: isRealUserAccount(profilesById.get(b.user_id)?.email),
      }))

      // Map assignments
      const mappedAssignments = assignmentsRes.data || []

      // Create lookup sets for schedules with real passenger bookings or real staff
      const scheduleWithRealBookings = new Set()
      const scheduleBookingPaxCount = new Map()

      for (const b of mappedBookings) {
        if (b.schedules?.id) {
          const sId = b.schedules.id
          scheduleBookingPaxCount.set(sId, (scheduleBookingPaxCount.get(sId) || 0) + 1)
          if (b.isRealAccount) {
            scheduleWithRealBookings.add(sId)
          }
        }
      }

      const scheduleWithRealStaff = new Set()
      const scheduleAssignmentsMap = new Map()

      for (const a of mappedAssignments) {
        if (a.schedule_id) {
          const sId = a.schedule_id
          const list = scheduleAssignmentsMap.get(sId) || []
          list.push(a)
          scheduleAssignmentsMap.set(sId, list)
          if (isRealUserAccount(a.profiles?.email)) {
            scheduleWithRealStaff.add(sId)
          }
        }
      }

      // Categorize operational schedules
      const now = new Date()
      let sedangCount = 0
      let sudahCount = 0
      let belumCount = 0

      const processedSchedules = (schedulesRes.data || []).map(sch => {
        const category = getTripOperationalCategory(sch, now)
        if (category === 'sedang_jalan') sedangCount++
        else if (category === 'sudah_jalan') sudahCount++
        else if (category === 'belum_jalan') belumCount++

        const hasRealPassenger = scheduleWithRealBookings.has(sch.id)
        const hasRealStaff = scheduleWithRealStaff.has(sch.id)
        const hasRealAccount = hasRealPassenger || hasRealStaff

        return {
          ...sch,
          tripCategory: category,
          paxCount: scheduleBookingPaxCount.get(sch.id) || 0,
          assignedStaff: scheduleAssignmentsMap.get(sch.id) || [],
          hasRealPassenger,
          hasRealStaff,
          hasRealAccount,
        }
      })

      // Set State
      setStations(stationsRes.data || [])
      setTrains(trainsRes.data || [])
      setRoutes(routesRes.data || [])
      setSchedules(processedSchedules)
      setFares(faresRes.data || [])
      setBookings(mappedBookings)
      setUsersList(allProfiles)
      setAssignments(mappedAssignments)
      setStaffUsers(allProfiles.filter(p => p.role === 'conductor' || p.staff_type))

      // Stats
      setStats({
        passengers: Number(statsRes.data?.passengers || allProfiles.filter(p => p.role === 'passenger').length),
        bookings: Number(statsRes.data?.bookings || mappedBookings.length),
        trains: Number(statsRes.data?.trains || trainsRes.data?.length),
        stations: Number(statsRes.data?.stations || stationsRes.data?.length),
        revenue: Number(statsRes.data?.revenue || 0),
        activeSchedules: Number(statsRes.data?.active_schedules || processedSchedules.length),
        sedangJalan: sedangCount,
        sudahJalan: sudahCount,
        belumJalan: belumCount,
      })
    } catch (err) {
      setError(`Gagal memuat data kontrol admin: ${err.message || 'Kesalahan sistem'}`)
    } finally {
      setLoading(false)
    }
  }, [user, profile?.role])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  // Load Financial Data
  const loadFinancialData = useCallback(async () => {
    setFinancialLoading(true)
    try {
      const res = await fetch('/api/admin/financial-report')
      const json = await res.json()
      if (json.success) {
        setFinancialData({
          ticketRevenue: json.summary.ticketRevenue,
          foodRevenue: json.summary.foodRevenue,
          refundDeductions: json.summary.refundDeductions,
          netRevenue: json.summary.netRevenue,
          totalBookings: json.summary.totalBookings,
          transactions: json.transactions || [],
        })
      }
    } catch (err) {
      console.warn('Gagal memuat laporan keuangan:', err?.message)
    } finally {
      setFinancialLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'finance' || activeTab === 'overview') {
      loadFinancialData()
    }
  }, [activeTab, loadFinancialData])

  // Filtered Journeys
  const filteredJourneys = useMemo(() => {
    const q = journeySearch.trim().toLowerCase()
    const fromTime = journeyDateFrom ? new Date(`${journeyDateFrom}T00:00:00+07:00`).getTime() : 0
    const toTime = journeyDateTo ? new Date(`${journeyDateTo}T23:59:59+07:00`).getTime() : Infinity

    return schedules.filter(sch => {
      // 1. Status Filter
      if (journeyStatusFilter !== 'all' && sch.tripCategory !== journeyStatusFilter) {
        return false
      }

      // 2. Date Range
      const depTime = new Date(sch.departure_time).getTime()
      if (depTime < fromTime || depTime > toTime) {
        return false
      }

      // 3. Search Query
      if (q) {
        const matches = [
          sch.trains?.name,
          sch.trains?.train_number,
          sch.routes?.name,
          sch.status,
          getJourneyStatusLabel(sch.status),
        ].some(val => val?.toLowerCase().includes(q))
        if (!matches) return false
      }

      // 4. Real Account Only Filter
      if (onlyRealAccountsFilter && !sch.hasRealAccount) {
        return false
      }

      return true
    })
  }, [schedules, journeyStatusFilter, journeyDateFrom, journeyDateTo, journeySearch, onlyRealAccountsFilter])

  // Open Manifest Modal
  const openManifestModal = async (schedule) => {
    setSelectedScheduleForManifest(schedule)
    setManifestModalOpen(true)
    setManifestLoading(true)
    setManifestData(null)

    try {
      const res = await fetch(`/api/admin/journey-manifest?scheduleId=${schedule.id}`)
      const data = await res.json()
      if (data.success) {
        setManifestData(data)
      } else {
        toast.error(data.error || 'Gagal memuat rincian manifest.')
      }
    } catch (err) {
      toast.error(`Error memuat manifest: ${err.message}`)
    } finally {
      setManifestLoading(false)
    }
  }

  // Handle Journey Status Change
  const handleUpdateJourneyStatus = async (scheduleId, newStatus) => {
    const confirmed = await confirm({
      title: 'Ubah Status Perjalanan KA',
      message: `Ubah status perjalanan menjadi "${getJourneyStatusLabel(newStatus)}"? Pembaruan akan terlihat real-time di sistem dan aplikasi penumpang.`,
      confirmText: 'Ya, Ubah Status',
      cancelText: 'Batal',
    })
    if (!confirmed) return

    const supabase = createClient()
    const { error: err } = await supabase.rpc('update_assigned_journey_status', {
      p_schedule_id: scheduleId,
      p_status: newStatus,
      p_note: `Diperbarui oleh Administrator pada ${new Date().toLocaleTimeString('id-ID')}`,
    })

    if (err) {
      toast.error(`Gagal mengubah status: ${err.message}`)
      return
    }

    toast.success(`Status perjalanan berhasil diperbarui menjadi ${getJourneyStatusLabel(newStatus)}!`)
    loadAdminData()
  }

  // Handle Quick Create Staff (jxx@gmail.com)
  const handleCreateQuickStaff = async (e) => {
    e.preventDefault()
    if (!newStaffEmail || !newStaffPassword) {
      toast.error('Email dan kata sandi wajib diisi.')
      return
    }

    setCreatingStaff(true)
    try {
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newStaffEmail,
          password: newStaffPassword,
          fullName: newStaffName,
          staffType: newStaffType,
          stationId: newStaffType === 'gate' ? newStaffStationId : null,
          scheduleId: newStaffType === 'conductor' ? newStaffScheduleId : null,
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Gagal membuat akun petugas.')
        return
      }

      toast.success(`Akun petugas ${newStaffEmail} berhasil dibuat & diaktifkan!`)
      setCreatedStaffCredential({
        email: newStaffEmail,
        password: newStaffPassword,
        name: newStaffName,
        type: newStaffType === 'gate' ? 'Petugas Gerbang (Gate)' : 'Kondektur Kereta',
      })
      loadAdminData()
    } catch (err) {
      toast.error(`Kesalahan sistem: ${err.message}`)
    } finally {
      setCreatingStaff(false)
    }
  }

  // Handle Add Train Fleet
  const handleAddTrain = async (e) => {
    e.preventDefault()
    if (!newTrainName.trim()) {
      toast.error('Nama kereta wajib diisi.')
      return
    }

    setAddingTrain(true)
    try {
      const supabase = createClient()
      const specsDescription = `Lokomotif: ${newTrainLoco} | Formasi: ${newTrainFormation} | Aturan: ${newTrainRules}`

      const { data: trainData, error: trainErr } = await supabase
        .from('trains')
        .insert({
          name: newTrainName.trim(),
          train_number: newTrainNumber.trim() || `KA ${Math.floor(Math.random() * 200 + 1)}`,
          operator: 'PT Kereta Api Indonesia (Persero)',
          service_class: newTrainClass,
          description: specsDescription,
        })
        .select()
        .single()

      if (trainErr) throw trainErr

      // Auto-generate standard 4 carriages (80 seats)
      if (trainData?.id) {
        const carriageRows = [1, 2, 3, 4].map(num => ({
          train_id: trainData.id,
          carriage_number: num,
          carriage_class: newTrainClass.includes('Luxury') && num === 1 ? 'Luxury' : 'Eksekutif',
          seat_capacity: 20,
          seat_layout: '2-2',
        }))

        const { data: createdCarriages } = await supabase.from('carriages').insert(carriageRows).select('id')

        if (createdCarriages && createdCarriages.length > 0) {
          const seatRows = []
          for (const c of createdCarriages) {
            for (let row = 1; row <= 5; row++) {
              for (const col of ['A', 'B', 'C', 'D']) {
                seatRows.push({
                  carriage_id: c.id,
                  seat_number: `${row}${col}`,
                })
              }
            }
          }
          await supabase.from('seats').insert(seatRows)
        }
      }

      toast.success(`Armada ${newTrainName} beserta gerbong & formasi kursi berhasil didaftarkan!`)
      setTrainModalOpen(false)
      setNewTrainName('')
      setNewTrainNumber('')
      loadAdminData()
    } catch (err) {
      toast.error(`Gagal menambahkan armada: ${err.message}`)
    } finally {
      setAddingTrain(false)
    }
  }

  // Handle Add Route
  const handleAddRoute = async (e) => {
    e.preventDefault()
    if (!newRouteName.trim() || !newRouteOriginId || !newRouteDestId) {
      toast.error('Nama rute, stasiun asal, dan stasiun tujuan wajib diisi.')
      return
    }

    if (newRouteOriginId === newRouteDestId) {
      toast.error('Stasiun asal dan stasiun tujuan tidak boleh sama.')
      return
    }

    setAddingRoute(true)
    try {
      const supabase = createClient()
      const { error: routeErr } = await supabase.from('routes').insert({
        name: newRouteName.trim(),
        origin_station_id: newRouteOriginId,
        destination_station_id: newRouteDestId,
        distance_km: Number(newRouteDistance) || 450,
      })

      if (routeErr) throw routeErr

      toast.success(`Jalur & rute ${newRouteName} berhasil didaftarkan!`)
      setRouteModalOpen(false)
      setNewRouteName('')
      loadAdminData()
    } catch (err) {
      toast.error(`Gagal menambahkan jalur: ${err.message}`)
    } finally {
      setAddingRoute(false)
    }
  }

  // Handle Add Station
  const handleAddStation = async (e) => {
    e.preventDefault()
    if (!newStationCode.trim() || !newStationName.trim()) {
      toast.error('Kode stasiun dan nama stasiun wajib diisi.')
      return
    }
    setAddingStation(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('stations').insert({
        code: newStationCode.trim().toUpperCase(),
        name: newStationName.trim(),
        city: newStationCity.trim().toUpperCase() || 'KOTA',
        province: newStationProvince,
      })

      if (err) throw err

      toast.success(`Stasiun ${newStationName} (${newStationCode}) berhasil didaftarkan!`)
      setNewStationCode('')
      setNewStationName('')
      setNewStationCity('')
      loadAdminData()
    } catch (err) {
      toast.error(`Gagal menambahkan stasiun: ${err.message}`)
    } finally {
      setAddingStation(false)
    }
  }

  // Handle Staff Assignment
  const handleAssignStaff = async (e) => {
    e.preventDefault()
    if (!selectedStaffId || !selectedScheduleId) {
      toast.error('Pilih petugas dan jadwal keberangkatan KA.')
      return
    }
    setAssigning(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.rpc('admin_assign_staff', {
        p_staff_id: selectedStaffId,
        p_schedule_id: selectedScheduleId,
      })

      if (err) throw err

      toast.success('Petugas berhasil ditugaskan pada perjalanan kereta!')
      setSelectedStaffId('')
      setSelectedScheduleId('')
      loadAdminData()
    } catch (err) {
      toast.error(`Gagal menugaskan petugas: ${err.message}`)
    } finally {
      setAssigning(false)
    }
  }

  // Handle Remove Staff Assignment
  const handleRemoveAssignment = async (assignmentId) => {
    const confirmed = await confirm({
      title: 'Hapus Penugasan Petugas',
      message: 'Apakah Anda yakin ingin membatalkan penugasan petugas pada jadwal kereta ini?',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Kembali',
    })
    if (!confirmed) return

    try {
      const supabase = createClient()
      const { error: err } = await supabase.rpc('admin_remove_staff_assignment', {
        p_assignment_id: assignmentId,
      })
      if (err) throw err
      toast.success('Penugasan berhasil dihapus.')
      loadAdminData()
    } catch (err) {
      toast.error(`Gagal menghapus penugasan: ${err.message}`)
    }
  }

  // Export Financial CSV
  const handleExportFinancialCSV = () => {
    if (!financialData.transactions.length) {
      toast.error('Tidak ada data transaksi keuangan untuk diekspor.')
      return
    }

    const headers = ['Tanggal', 'Kategori', 'Kode Referensi', 'Keterangan', 'Metode Pembayaran', 'Jumlah (IDR)', 'Status']
    const rows = financialData.transactions.map(t => [
      `"${new Date(t.date).toLocaleString('id-ID')}"`,
      `"${t.typeLabel}"`,
      `"${t.code}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.method}"`,
      t.amount,
      `"${t.statusLabel}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `laporan_keuangan_railhub_${jakartaDateInputValue()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Laporan keuangan berhasil diunduh sebagai CSV!')
  }

  // Copy helper
  const copyToClipboard = (text, label = 'Teks') => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} berhasil disalin ke clipboard!`)
  }

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const q = bookingSearch.trim().toLowerCase()
      const matchesSearch = !q || [
        b.booking_code,
        b.schedules?.trains?.name,
        b.schedules?.routes?.name,
        b.profiles?.full_name,
        b.profiles?.email,
      ].some(v => v?.toLowerCase().includes(q))
      const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, bookingSearch, bookingStatusFilter])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const q = userSearch.trim().toLowerCase()
      return !q || [u.full_name, u.email, u.role, u.phone_number].some(v => v?.toLowerCase().includes(q))
    })
  }, [usersList, userSearch])

  // Filtered Stations
  const filteredStations = useMemo(() => {
    return stations.filter(st => {
      const q = stationSearch.trim().toLowerCase()
      const matchesSearch = !q || [st.code, st.name, st.city, st.province].some(v => v?.toLowerCase().includes(q))
      const matchesProv = stationProvinceFilter === 'all' || st.province === stationProvinceFilter
      return matchesSearch && matchesProv
    })
  }, [stations, stationSearch, stationProvinceFilter])

  const unassignedCount = schedules.filter(s => s.status !== 'cancelled' && !s.assignedStaff?.length).length
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
      onRefresh={loadAdminData}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: '3rem' }}>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: DASHBOARD UTAMA (OVERVIEW)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div>
            {/* Top KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={15} color="#10b981" /> KA Sedang Jalan
                </span>
                <strong style={{ display: 'block', fontSize: '1.75rem', color: '#10b981', margin: '0.35rem 0' }}>
                  {stats.sedangJalan}
                </strong>
                <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Aktif di jalur / boarding</small>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock3 size={15} color="var(--rh-primary)" /> KA Belum Jalan
                </span>
                <strong style={{ display: 'block', fontSize: '1.75rem', color: 'var(--rh-primary)', margin: '0.35rem 0' }}>
                  {stats.belumJalan}
                </strong>
                <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Terjadwal s/d 25 Des 2026</small>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color="#64748b" /> KA Sudah Jalan
                </span>
                <strong style={{ display: 'block', fontSize: '1.75rem', color: '#64748b', margin: '0.35rem 0' }}>
                  {stats.sudahJalan}
                </strong>
                <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Tiba di tujuan</small>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CircleDollarSign size={15} color="#059669" /> Pendapatan Bersih
                </span>
                <strong style={{ display: 'block', fontSize: '1.5rem', color: '#059669', margin: '0.35rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formatIDR(financialData.netRevenue || stats.revenue || 0)}
                </strong>
                <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Tiket + kuliner - refund</small>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Train size={15} color="var(--rh-primary)" /> Total Armada KA
                </span>
                <strong style={{ display: 'block', fontSize: '1.75rem', color: 'var(--rh-text)', margin: '0.35rem 0' }}>
                  {stats.trains}
                </strong>
                <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Lokomotif &amp; rangkaian aktif</small>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.15rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="var(--rh-primary)" /> Stasiun Jaringan
                </span>
                <strong style={{ display: 'block', fontSize: '1.75rem', color: 'var(--rh-text)', margin: '0.35rem 0' }}>
                  {stats.stations}
                </strong>
                <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Lintas Utara, Selatan, &amp; Timur</small>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('journeys')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.15rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ display: 'block', color: 'var(--rh-primary)', fontSize: '0.9rem' }}>Monitoring Perjalanan</strong>
                  <small style={{ color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>Lihat status sedang/belum/sudah jalan</small>
                </div>
                <ChevronRight size={18} color="var(--rh-primary)" />
              </button>

              <button
                type="button"
                onClick={() => {
                  suggestNextStaffEmail()
                  setStaffModalOpen(true)
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.15rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ display: 'block', color: '#166534', fontSize: '0.9rem' }}>⚡ Buat Akun Petugas Cepat</strong>
                  <small style={{ color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>Generate instan jxx@gmail.com</small>
                </div>
                <Sparkles size={18} color="#166534" />
              </button>

              <button
                type="button"
                onClick={() => setTrainModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.15rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ display: 'block', color: '#6b21a8', fontSize: '0.9rem' }}>+ Tambah Armada KA</strong>
                  <small style={{ color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>Spesifikasi lokomotif &amp; aturan</small>
                </div>
                <Plus size={18} color="#6b21a8" />
              </button>

              <button
                type="button"
                onClick={() => setRouteModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.15rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ display: 'block', color: '#92400e', fontSize: '0.9rem' }}>+ Tambah Rute / Jalur</strong>
                  <small style={{ color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>Daftarkan koridor baru</small>
                </div>
                <Navigation size={18} color="#92400e" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.15rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ display: 'block', color: '#065f46', fontSize: '0.9rem' }}>Laporan Keuangan</strong>
                  <small style={{ color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>Tiket, restoran onboard, &amp; refund</small>
                </div>
                <CircleDollarSign size={18} color="#065f46" />
              </button>
            </div>

            {/* Quick Live Preview: Kereta yang Sedang Berjalan & Berisi Akun Asli */}
            <div className="rh-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 className="rh-h4" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={18} color="#10b981" /> Perjalanan Kereta Api Prioritas &amp; Aktif
                  </h3>
                  <small style={{ color: 'var(--rh-text-2)' }}>Sorotan jadwal perjalanan yang sedang berjalan atau memiliki penumpang akun asli</small>
                </div>
                <button type="button" className="rh-btn rh-btn-sm rh-btn-ghost" onClick={() => setActiveTab('journeys')}>
                  Buka Semua ({schedules.length}) <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {schedules
                  .filter(s => s.tripCategory === 'sedang_jalan' || s.hasRealAccount)
                  .slice(0, 5)
                  .map(sch => (
                    <div
                      key={sch.id}
                      className={sch.hasRealAccount ? 'rh-journey-real-highlight' : ''}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 10,
                        border: '1px solid var(--rh-border)',
                        background: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: sch.tripCategory === 'sedang_jalan' ? '#ecfdf5' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Train size={20} color={sch.tripCategory === 'sedang_jalan' ? '#10b981' : 'var(--rh-primary)'} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong style={{ fontSize: '0.95rem' }}>{sch.trains?.name}</strong>
                            <span className="rh-badge rh-badge-secondary" style={{ fontSize: '0.72rem' }}>{sch.trains?.train_number}</span>
                            {sch.hasRealAccount && (
                              <span className="rh-badge-real-account">★ Ada Akun Asli</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)' }}>
                            {sch.routes?.name} · {formatDate(sch.departure_time)} ({formatTime(sch.departure_time)} WIB)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--rh-text-2)' }}>
                          <strong>{sch.paxCount}</strong> Kursi Terisi
                        </span>
                        <StatusBadge status={sch.status} />
                        <button
                          type="button"
                          className="rh-btn rh-btn-sm rh-btn-primary"
                          onClick={() => openManifestModal(sch)}
                        >
                          <Eye size={13} style={{ marginRight: 4 }} /> Manifest
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: PERJALANAN KERETA (JOURNEYS / SCHEDULES)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'journeys' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarDays size={22} color="var(--rh-primary)" /> Pusat Jadwal &amp; Manifest Perjalanan Kereta
                </h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Pantau seluruh kereta api yang sudah jalan, sedang jalan, dan belum jalan sampai 25 Desember 2026.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="rh-badge rh-badge-primary">
                  {filteredJourneys.length} Perjalanan Ditampilkan
                </span>
                <button
                  type="button"
                  className="rh-btn rh-btn-sm rh-btn-ghost"
                  onClick={loadAdminData}
                  title="Segarkan data jadwal"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>

            {/* Filter Operational Status Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--rh-border)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setJourneyStatusFilter('all')}
                className={`rh-btn rh-btn-sm ${journeyStatusFilter === 'all' ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
              >
                Semua Perjalanan ({schedules.length})
              </button>

              <button
                type="button"
                onClick={() => setJourneyStatusFilter('sedang_jalan')}
                className={`rh-btn rh-btn-sm ${journeyStatusFilter === 'sedang_jalan' ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
                style={journeyStatusFilter === 'sedang_jalan' ? { background: '#10b981', borderColor: '#10b981' } : {}}
              >
                <Activity size={14} style={{ marginRight: 4 }} />
                Sedang Jalan ({schedules.filter(s => s.tripCategory === 'sedang_jalan').length})
              </button>

              <button
                type="button"
                onClick={() => setJourneyStatusFilter('belum_jalan')}
                className={`rh-btn rh-btn-sm ${journeyStatusFilter === 'belum_jalan' ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
              >
                <Clock3 size={14} style={{ marginRight: 4 }} />
                Belum Jalan ({schedules.filter(s => s.tripCategory === 'belum_jalan').length})
              </button>

              <button
                type="button"
                onClick={() => setJourneyStatusFilter('sudah_jalan')}
                className={`rh-btn rh-btn-sm ${journeyStatusFilter === 'sudah_jalan' ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
              >
                <CheckCircle2 size={14} style={{ marginRight: 4 }} />
                Sudah Jalan ({schedules.filter(s => s.tripCategory === 'sudah_jalan').length})
              </button>

              <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer', background: onlyRealAccountsFilter ? '#ecfdf5' : '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid ' + (onlyRealAccountsFilter ? '#6ee7b7' : 'var(--rh-border)') }}>
                <input
                  type="checkbox"
                  checked={onlyRealAccountsFilter}
                  onChange={e => setOnlyRealAccountsFilter(e.target.checked)}
                />
                <span style={{ fontWeight: 600, color: onlyRealAccountsFilter ? '#065f46' : 'var(--rh-text-2)' }}>
                  ★ Hanya yang Berisi Akun Asli
                </span>
              </label>
            </div>

            {/* Date Filters & Presets */}
            <div style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rh-text-2)' }}>Pintasan Rentang:</span>
                  <button
                    type="button"
                    className="rh-btn rh-btn-xs rh-btn-ghost"
                    onClick={() => {
                      const today = jakartaDateInputValue()
                      setJourneyDateFrom(today)
                      setJourneyDateTo(today)
                    }}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    className="rh-btn rh-btn-xs rh-btn-ghost"
                    onClick={() => {
                      const today = jakartaDateInputValue()
                      setJourneyDateFrom(today)
                      setJourneyDateTo(addDateDays(today, 6))
                    }}
                  >
                    7 Hari Ini
                  </button>
                  <button
                    type="button"
                    className="rh-btn rh-btn-xs rh-btn-ghost"
                    onClick={() => {
                      setJourneyDateFrom('2026-12-01')
                      setJourneyDateTo('2026-12-31')
                    }}
                  >
                    Desember 2026
                  </button>
                  <button
                    type="button"
                    className="rh-btn rh-btn-xs rh-btn-primary"
                    style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                    onClick={() => {
                      setJourneyDateFrom('2026-12-25')
                      setJourneyDateTo('2026-12-25')
                    }}
                  >
                    🎄 25 Des 2026 (Natal &amp; Libur)
                  </button>
                  <button
                    type="button"
                    className="rh-btn rh-btn-xs rh-btn-secondary"
                    onClick={() => {
                      setJourneyDateFrom('2026-01-01')
                      setJourneyDateTo('2026-12-31')
                    }}
                  >
                    Sepanjang 2026 (Full)
                  </button>
                </div>

                {/* Date Inputs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--rh-text-2)' }}>Dari:</span>
                    <input
                      type="date"
                      className="rh-input"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', height: 32 }}
                      value={journeyDateFrom}
                      onChange={e => setJourneyDateFrom(e.target.value)}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--rh-text-2)' }}>Sampai:</span>
                    <input
                      type="date"
                      className="rh-input"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', height: 32 }}
                      value={journeyDateTo}
                      onChange={e => setJourneyDateTo(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)' }} />
                  <input
                    type="text"
                    className="rh-input"
                    placeholder="Cari nama kereta (e.g. Argo Bromo), nomor KA (e.g. KA 1), atau kota relasi..."
                    value={journeySearch}
                    onChange={e => setJourneySearch(e.target.value)}
                    style={{ paddingLeft: '2rem', height: 36, fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Legend / Banner Akun Asli vs Dummy */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '0.65rem 1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--rh-text)' }}>Indikator Visual:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981', display: 'inline-block' }} />
                  <strong style={{ color: '#065f46' }}>Garis Hijau Bercahaya:</strong> Terdeteksi Penumpang/Petugas Akun Asli
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#cbd5e1', display: 'inline-block' }} />
                  <span style={{ color: 'var(--rh-text-2)' }}>Border Netral: Akun Dummy / Belum Terisi</span>
                </span>
              </div>
              <span style={{ color: 'var(--rh-text-3)', fontSize: '0.75rem' }}>Klik Manifest untuk melihat identitas penumpang</span>
            </div>

            {/* Journeys List Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 850, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Kereta Api &amp; Nomor</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Rute &amp; Koridor</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Waktu Keberangkatan</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Waktu Tiba</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status Operasional</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Petugas KA</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Okupansi</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJourneys.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--rh-text-3)' }}>
                        Tidak ada jadwal perjalanan kereta api yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredJourneys.map(sch => {
                      const isRealTrip = sch.hasRealAccount

                      return (
                        <tr
                          key={sch.id}
                          className={isRealTrip ? 'rh-journey-real-highlight' : ''}
                          style={{
                            borderBottom: '1px solid var(--rh-border)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ color: 'var(--rh-primary)' }}>{sch.trains?.name}</strong>
                              {isRealTrip && (
                                <span className="rh-badge-real-account" title="Ada penumpang atau petugas akun asli pada jadwal ini">
                                  ★ Akun Asli
                                </span>
                              )}
                            </div>
                            <small style={{ display: 'block', color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>
                              {sch.trains?.train_number} · {sch.trains?.service_class || 'Eksekutif'}
                            </small>
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{sch.routes?.name}</span>
                            <small style={{ display: 'block', color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>
                              {sch.routes?.distance_km ? `${sch.routes.distance_km} KM` : 'Jawa Lintas Utama'}
                            </small>
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                            <strong>{formatTime(sch.departure_time)} WIB</strong>
                            <small style={{ display: 'block', color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>
                              {formatDate(sch.departure_time)}
                            </small>
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                            <span>{formatTime(sch.arrival_time)} WIB</span>
                            <small style={{ display: 'block', color: 'var(--rh-text-3)', fontSize: '0.75rem' }}>
                              {formatDate(sch.arrival_time)}
                            </small>
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <StatusBadge status={sch.status} />
                            {sch.tripCategory === 'sedang_jalan' && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
                                Sedang Berjalan
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            {sch.assignedStaff?.length > 0 ? (
                              <div>
                                {sch.assignedStaff.map(st => {
                                  const isStaffReal = isRealUserAccount(st.profiles?.email)
                                  return (
                                    <div key={st.id} style={{ fontSize: '0.8rem' }}>
                                      <span>{st.profiles?.full_name || 'Petugas'}</span>
                                      {isStaffReal && (
                                        <span className="rh-badge-real-account" style={{ marginLeft: 4, fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                                          Staff Asli
                                        </span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <small style={{ color: '#d97706', fontWeight: 600 }}>Belum Ada Petugas</small>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 700, color: sch.paxCount > 0 ? 'var(--rh-primary)' : 'var(--rh-text-3)' }}>
                              {sch.paxCount} Penumpang
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                type="button"
                                className="rh-btn rh-btn-primary rh-btn-xs"
                                onClick={() => openManifestModal(sch)}
                                title="Lihat daftar nama penumpang, gerbong, kursi, dan status akun"
                              >
                                <Eye size={13} style={{ marginRight: 3 }} /> Manifest
                              </button>

                              <select
                                className="rh-input"
                                style={{ height: 28, fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                                value={sch.status}
                                onChange={e => handleUpdateJourneyStatus(sch.id, e.target.value)}
                              >
                                <option value="scheduled">Terjadwal</option>
                                <option value="boarding">Boarding</option>
                                <option value="departed">Berangkat</option>
                                <option value="arrived">Tiba</option>
                                <option value="delayed">Terlambat</option>
                                <option value="cancelled">Dibatalkan</option>
                              </select>
                            </div>
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

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: MANAJEMEN ARMADA & SPESIFIKASI (TRAINS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'trains' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Train size={22} color="var(--rh-primary)" /> Manajemen Armada Kereta Api (Fleet &amp; Rules)
                </h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Spesifikasi tipe lokomotif, susunan gerbong, kapasitas, aturan operasional, serta pendaftaran armada baru.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="rh-badge rh-badge-primary">{trains.length} Armada Aktif</span>
                <button
                  type="button"
                  className="rh-btn rh-btn-primary rh-btn-sm"
                  onClick={() => setTrainModalOpen(true)}
                >
                  <Plus size={15} style={{ marginRight: 4 }} /> Tambah Armada &amp; Aturan
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {trains.map(tr => (
                <article
                  key={tr.id}
                  style={{
                    border: '1px solid var(--rh-border)',
                    borderRadius: 12,
                    padding: '1.25rem',
                    background: 'var(--rh-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--rh-primary)' }}>{tr.name}</strong>
                        <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{tr.operator || 'PT Kereta Api Indonesia'}</small>
                      </div>
                      <span className="rh-badge rh-badge-secondary" style={{ fontWeight: 700 }}>
                        {tr.train_number || 'KA Utama'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                      <span className="rh-badge rh-badge-primary" style={{ fontSize: '0.75rem' }}>
                        {tr.service_class || 'Eksekutif & Bisnis'}
                      </span>
                    </div>

                    {/* Specs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#fff', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--rh-border)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ color: 'var(--rh-text-3)', display: 'block' }}>Tipe Lokomotif:</span>
                        <strong>{tr.description?.includes('Lokomotif:') ? tr.description.split('|')[0].replace('Lokomotif:', '').trim() : 'CC 206 General Electric'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--rh-text-3)', display: 'block' }}>Kapasitas Rangkaian:</span>
                        <strong>320 - 400 Penumpang</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <span style={{ color: 'var(--rh-text-3)', display: 'block' }}>Komposisi Gerbong:</span>
                        <strong>{tr.description?.includes('Formasi:') ? tr.description.split('|')[1].replace('Formasi:', '').trim() : '8 Gerbong Eksekutif (K1) + 1 Restorasi + 1 Power'}</strong>
                      </div>
                    </div>

                    {/* Operational Rules */}
                    <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.75rem', color: 'var(--rh-text-2)' }}>
                      <strong style={{ display: 'block', color: 'var(--rh-text)', marginBottom: 2 }}>Aturan &amp; Regulasi Operasional:</strong>
                      <p style={{ margin: 0, lineHeight: 1.4 }}>
                        {tr.description?.includes('Aturan:') ? tr.description.split('|')[2].replace('Aturan:', '').trim() : 'Maksimal 120 km/jam lintas utara/selatan. Toleransi bagasi kabin 20 kg. Wajib kondektur dan 2 polsuska.'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: MANAJEMEN JALUR & RUTE (ROUTES)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'routes' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={22} color="var(--rh-primary)" /> Manajemen Jalur &amp; Koridor Rel
                </h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Daftar jalur kereta api aktif, stasiun singgah simpul, estimasi jarak KM, dan pendaftaran rute baru.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="rh-badge rh-badge-primary">{routes.length} Koridor Aktif</span>
                <button
                  type="button"
                  className="rh-btn rh-btn-primary rh-btn-sm"
                  onClick={() => setRouteModalOpen(true)}
                >
                  <Plus size={15} style={{ marginRight: 4 }} /> Tambah Jalur / Rute Baru
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {routes.map(r => (
                <article
                  key={r.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderRadius: 10,
                    border: '1px solid var(--rh-border)',
                    background: 'var(--rh-surface)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--rh-primary)' }}>{r.name}</strong>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--rh-text-2)' }}>
                      <span>Jarak Tempuh: <strong>{r.distance_km || 450} KM</strong></span>
                      <span>Relasi: <strong>Jalur Utama Lintas Jawa</strong></span>
                    </div>
                  </div>
                  <span className="rh-badge rh-badge-secondary">Operasional Jalur Aktif</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: MANAJEMEN PETUGAS & AKUN CEPAT (STAFF)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'staff' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={22} color="var(--rh-primary)" /> Pengelolaan Petugas &amp; Akun Cepat (`jxx@gmail.com`)
                </h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Buat akun dummy petugas instan (kondektur / gate staff), penugasan pada perjalanan KA, dan monitoring.
                </p>
              </div>

              <button
                type="button"
                className="rh-btn rh-btn-primary rh-btn-sm"
                onClick={() => {
                  suggestNextStaffEmail()
                  setStaffModalOpen(true)
                }}
              >
                <Sparkles size={15} style={{ marginRight: 4 }} /> Buat Akun Petugas Cepat (`jxx@gmail.com`)
              </button>
            </div>

            {/* Credential Notification Banner if newly created */}
            {createdStaffCredential && (
              <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <strong style={{ color: '#065f46', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} /> Akun Petugas Baru Berhasil Diaktifkan!
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: 4 }}>
                    Email: <code>{createdStaffCredential.email}</code> | Kata Sandi: <code>{createdStaffCredential.password}</code> | Tipe: {createdStaffCredential.type}
                  </div>
                </div>
                <button
                  type="button"
                  className="rh-btn rh-btn-sm rh-btn-primary"
                  onClick={() => copyToClipboard(`Email: ${createdStaffCredential.email}\nPassword: ${createdStaffCredential.password}`, 'Kredensial Petugas')}
                >
                  <Copy size={13} style={{ marginRight: 4 }} /> Salin Kredensial
                </button>
              </div>
            )}

            {/* Assignment Form */}
            <form onSubmit={handleAssignStaff} style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Formulir Penugasan Petugas ke Perjalanan Kereta
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Pilih Petugas Operasional</span>
                  <select className="rh-input" value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} required>
                    <option value="">-- Pilih Petugas --</option>
                    {staffUsers.map(stf => (
                      <option key={stf.id} value={stf.id}>
                        {stf.full_name} ({stf.email}) · {stf.staff_type === 'gate' ? 'Petugas Gerbang' : 'Kondektur KA'}
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
            <h3 className="rh-h4" style={{ margin: '0 0 0.75rem' }}>Daftar Penugasan Petugas Aktif ({assignments.length})</h3>
            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Petugas</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Tipe Akun</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kereta Api</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Rute</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Waktu Berangkat</th>
                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--rh-text-3)' }}>
                        Belum ada penugasan aktif.
                      </td>
                    </tr>
                  ) : (
                    assignments.map(a => {
                      const isReal = isRealUserAccount(a.profiles?.email)
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <strong>{a.profiles?.full_name || 'Petugas'}</strong>
                            <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{a.profiles?.email}</small>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            {isReal ? (
                              <span className="rh-badge-real-account">Akun Asli</span>
                            ) : (
                              <span className="rh-badge-dummy-account">Dummy (jxx)</span>
                            )}
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
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* List All Staff Members */}
            <h3 className="rh-h4" style={{ margin: '0 0 0.75rem' }}>Daftar Seluruh Akun Petugas ({staffUsers.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {staffUsers.map(stf => {
                const isReal = isRealUserAccount(stf.email)
                const isGate = stf.staff_type === 'gate'
                return (
                  <div key={stf.id} style={{ padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid var(--rh-border)', background: isReal ? '#ecfdf5' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.92rem' }}>{stf.full_name}</strong>
                      {isReal ? (
                        <span className="rh-badge-real-account" style={{ fontSize: '0.7rem' }}>Petugas Asli</span>
                      ) : (
                        <span className="rh-badge-dummy-account" style={{ fontSize: '0.7rem' }}>Dummy (jxx)</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', marginBottom: 6 }}>
                      <code>{stf.email}</code>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isGate ? '#b45309' : '#1d4ed8', fontWeight: 600 }}>
                      {isGate ? '🏢 Petugas Gerbang Stasiun (Gate)' : '🚆 Petugas Kondektur KA'}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 6: LAPORAN KEUANGAN & OPERASIONAL (FINANCE)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'finance' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CircleDollarSign size={22} color="#059669" /> Laporan Keuangan &amp; Arus Kas Operasional
                </h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Rekapitulasi pendapatan tiket perjalanan, penjualan restorasi kuliner di atas KA, pengembalian dana pembatalan (refund), dan ekspor CSV.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="rh-btn rh-btn-sm rh-btn-secondary"
                  onClick={handleExportFinancialCSV}
                >
                  <Download size={14} style={{ marginRight: 4 }} /> Unduh CSV
                </button>
                <button
                  type="button"
                  className="rh-btn rh-btn-sm rh-btn-ghost"
                  onClick={() => window.print()}
                >
                  <Printer size={14} style={{ marginRight: 4 }} /> Cetak Laporan
                </button>
                <button
                  type="button"
                  className="rh-btn rh-btn-sm rh-btn-primary"
                  onClick={loadFinancialData}
                  disabled={financialLoading}
                >
                  <RefreshCw size={14} className={financialLoading ? 'rh-spin' : ''} style={{ marginRight: 4 }} /> Segarkan
                </button>
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: '#fff' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Pendapatan Tiket (Gross)</span>
                <strong style={{ display: 'block', fontSize: '1.6rem', color: 'var(--rh-primary)', margin: '0.25rem 0' }}>
                  {formatIDR(financialData.ticketRevenue)}
                </strong>
                <small style={{ color: 'var(--rh-text-3)' }}>Dari seluruh pemesanan tiket terkonfirmasi</small>
              </div>

              <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: '#fff' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Penjualan Kuliner Restorasi KA</span>
                <strong style={{ display: 'block', fontSize: '1.6rem', color: '#059669', margin: '0.25rem 0' }}>
                  {formatIDR(financialData.foodRevenue)}
                </strong>
                <small style={{ color: 'var(--rh-text-3)' }}>Onboard dining &amp; snack express</small>
              </div>

              <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: '#fff' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Refund &amp; Pembatalan Tiket</span>
                <strong style={{ display: 'block', fontSize: '1.6rem', color: '#dc2626', margin: '0.25rem 0' }}>
                  - {formatIDR(financialData.refundDeductions)}
                </strong>
                <small style={{ color: 'var(--rh-text-3)' }}>Pengembalian dana pembatalan penumpang</small>
              </div>

              <div style={{ border: '2px solid #10b981', borderRadius: 12, padding: '1.25rem', background: '#ecfdf5' }}>
                <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 700 }}>Pendapatan Bersih (Net Revenue)</span>
                <strong style={{ display: 'block', fontSize: '1.8rem', color: '#065f46', margin: '0.25rem 0' }}>
                  {formatIDR(financialData.netRevenue)}
                </strong>
                <small style={{ color: '#047857' }}>Total bersih kas operasional RAILHUB</small>
              </div>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['all', 'ticket', 'food', 'refund'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`rh-btn rh-btn-sm ${financialCategoryFilter === cat ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
                  onClick={() => setFinancialCategoryFilter(cat)}
                >
                  {cat === 'all' && 'Semua Transaksi'}
                  {cat === 'ticket' && 'Hanya Tiket Kereta'}
                  {cat === 'food' && 'Hanya Restorasi Onboard'}
                  {cat === 'refund' && 'Hanya Refund Pembatalan'}
                </button>
              ))}
            </div>

            {/* Transactions Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Tanggal &amp; Waktu</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kategori</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kode Referensi</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Keterangan / Rute</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Metode</th>
                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Jumlah (IDR)</th>
                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.transactions
                    .filter(t => financialCategoryFilter === 'all' || t.type === financialCategoryFilter)
                    .map(tx => (
                      <tr key={tx.id + tx.date} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                          {formatDate(tx.date)} {formatTime(tx.date)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span className={`rh-badge ${tx.type === 'ticket' ? 'rh-badge-primary' : tx.type === 'food' ? 'rh-badge-success' : 'rh-badge-danger'}`}>
                            {tx.typeLabel}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <code>{tx.code}</code>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{tx.description}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{tx.method}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: tx.type === 'refund' ? '#dc2626' : '#059669' }}>
                          {tx.type === 'refund' ? '-' : '+'} {formatIDR(tx.amount)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <StatusBadge status={tx.status} label={tx.statusLabel} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 7: MANAJEMEN STASIUN (STATIONS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'stations' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Stasiun Kereta Api ({stations.length})</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Daftar simpul stasiun aktif di Pulau Jawa beserta form pendaftaran stasiun baru.
                </p>
              </div>
            </div>

            {/* Add Station Form */}
            <form onSubmit={handleAddStation} style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Daftarkan Stasiun Baru</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Kode Singkatan</span>
                  <input type="text" className="rh-input" placeholder="e.g. GMR, BD" maxLength={6} value={newStationCode} onChange={e => setNewStationCode(e.target.value)} required />
                </label>
                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Nama Stasiun</span>
                  <input type="text" className="rh-input" placeholder="e.g. Gambir" value={newStationName} onChange={e => setNewStationName(e.target.value)} required />
                </label>
                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Kota / Kabupaten</span>
                  <input type="text" className="rh-input" placeholder="e.g. JAKARTA PUSAT" value={newStationCity} onChange={e => setNewStationCity(e.target.value)} required />
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
                  {addingStation ? <RefreshCw size={16} className="rh-spin" /> : 'Tambah Stasiun'}
                </button>
              </div>
            </form>

            {/* Stations Filter & Table */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="rh-input"
                placeholder="Cari stasiun atau kota..."
                value={stationSearch}
                onChange={e => setStationSearch(e.target.value)}
                style={{ maxWidth: 300 }}
              />
              <select className="rh-input" style={{ maxWidth: 200 }} value={stationProvinceFilter} onChange={e => setStationProvinceFilter(e.target.value)}>
                <option value="all">Semua Provinsi</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="DI Yogyakarta">DI Yogyakarta</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Banten">Banten</option>
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kode</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Nama Stasiun</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kota</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Provinsi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.map(st => (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                      <td style={{ padding: '0.65rem 0.5rem' }}><strong style={{ color: 'var(--rh-primary)' }}>{st.code}</strong></td>
                      <td style={{ padding: '0.65rem 0.5rem' }}><strong>{st.name}</strong></td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>{st.city}</td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>{st.province}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 8: FORMASI KURSI (SEATS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'seats' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Layout Formasi Kursi Kereta Api</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Konfigurasi standar formasi kursi per gerbong (Row 1–10, Kolom A–B | C–D).
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

            <div style={{ maxWidth: 420, margin: '0 auto', background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700, color: 'var(--rh-primary)' }}>
                ▲ ARAH LAJU KERETA API ▲
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rowNum => (
                  <div key={rowNum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-primary)' }}>
                        {rowNum}A
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-primary)' }}>
                        {rowNum}B
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--rh-text-3)', width: 24, textAlign: 'center' }}>{rowNum}</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-primary)' }}>
                        {rowNum}C
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-primary)' }}>
                        {rowNum}D
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 9: DATA PEMESANAN (BOOKINGS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Data Pemesanan Tiket ({bookings.length})</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Monitoring status pembayaran dan rincian transaksi tiket seluruh penumpang.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="rh-input"
                  placeholder="Cari kode booking, nama, email..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  style={{ maxWidth: 280 }}
                />
                <select className="rh-input" style={{ maxWidth: 180 }} value={bookingStatusFilter} onChange={e => setBookingStatusFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="paid">Terbayar</option>
                  <option value="pending">Menunggu</option>
                  <option value="cancelled">Dibatalkan</option>
                  <option value="refunded">Dikembalikan</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kode Booking</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Pemesan</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Tipe Akun</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Kereta Api &amp; Rute</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Tanggal Berangkat</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Total Tagihan</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <code style={{ fontWeight: 700, color: 'var(--rh-primary)' }}>{b.booking_code}</code>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <strong>{b.profiles?.full_name || 'Penumpang'}</strong>
                        <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{b.profiles?.email}</small>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {b.isRealAccount ? (
                          <span className="rh-badge-real-account">Akun Asli</span>
                        ) : (
                          <span className="rh-badge-dummy-account">Dummy</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <strong>{b.schedules?.trains?.name}</strong>
                        <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{b.schedules?.routes?.name}</small>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>
                        {formatDate(b.schedules?.departure_time)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>
                        {formatIDR(b.total_amount)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <StatusBadge status={b.status} label={bookingStatusLabels[b.status]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 10: AKUN PENGGUNA (USERS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Data Akun Pengguna ({usersList.length})</h2>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                  Daftar seluruh profil penumpang, staf operasional, kondektur, dan administrator.
                </p>
              </div>
              <input
                type="text"
                className="rh-input"
                placeholder="Cari nama, email, nomor HP..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ maxWidth: 300 }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--rh-border)', color: 'var(--rh-text-2)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Nama Pengguna</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Email Akun</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Klasifikasi Akun</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Peran Sistem</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Telepon</th>
                    <th style={{ padding: '0.65rem 0.5rem' }}>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const isReal = isRealUserAccount(u.email)
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}><strong>{u.full_name || 'Pengguna'}</strong></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><code>{u.email}</code></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          {isReal ? (
                            <span className="rh-badge-real-account">✓ Akun Asli</span>
                          ) : (
                            <span className="rh-badge-dummy-account">Dummy / Demo</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span className={`rh-badge ${u.role === 'admin' ? 'rh-badge-danger' : u.role === 'conductor' || u.staff_type ? 'rh-badge-warning' : 'rh-badge-primary'}`}>
                            {u.role === 'admin' ? 'Administrator' : u.staff_type === 'gate' ? 'Petugas Gerbang' : u.role === 'conductor' ? 'Kondektur KA' : 'Penumpang'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{u.phone_number || '-'}</td>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{formatDate(u.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 11: LAYANAN LAPORAN (REPORTS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 className="rh-h3" style={{ margin: 0 }}>Layanan Bantuan &amp; Analitik Masalah Penumpang</h2>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                Pemantauan laporan keluhan, kehilangan barang di atas kereta api, dan tingkat kepuasan pelanggan.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: '#fff' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Tingkat Kepuasan Layanan (CSAT)</span>
                <strong style={{ display: 'block', fontSize: '1.8rem', color: '#10b981', margin: '0.25rem 0' }}>94.6%</strong>
                <small style={{ color: 'var(--rh-text-3)' }}>Berdasarkan ulasan e-tiket penumpang</small>
              </div>
              <div style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1.25rem', background: '#fff' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>Ketepatan Waktu Kereta (OTP)</span>
                <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--rh-primary)', margin: '0.25rem 0' }}>96.8%</strong>
                <small style={{ color: 'var(--rh-text-3)' }}>On-time departure &amp; arrival rate</small>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 12: PENGUMUMAN SISTEM (CONTENT)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'content' && (
          <section className="rh-card" style={{ padding: '1.5rem' }}>
            <h2 className="rh-h3" style={{ margin: 0 }}>Pengumuman Resmi &amp; Siaran Operasional</h2>
            <p style={{ margin: '0.2rem 0 1rem', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
              Papan siaran pemberitahuan resmi untuk ditampilkan pada aplikasi penumpang dan tiket.
            </p>
            <div style={{ padding: '1rem', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: 'var(--rh-primary)' }}>
              <strong>📢 Siaran Aktif:</strong> Jadwal operasional penuh Natal &amp; Libur Akhir Tahun 2026 s/d 25 Desember 2026 telah dibuka secara resmi di seluruh koridor Pulau Jawa.
            </div>
          </section>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: MANIFEST PENUMPANG LENGKAP
      ══════════════════════════════════════════════════════════════════════════ */}
      {manifestModalOpen && selectedScheduleForManifest && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 className="rh-h3" style={{ margin: 0 }}>Manifest Penumpang &amp; Penugasan Petugas</h3>
                  {manifestData?.summary?.hasRealAccountInvolvement && (
                    <span className="rh-badge-real-account">★ Ada Akun Asli Terdeteksi</span>
                  )}
                </div>
                <small style={{ color: 'var(--rh-text-2)' }}>
                  {selectedScheduleForManifest.trains?.name} ({selectedScheduleForManifest.trains?.train_number}) · {selectedScheduleForManifest.routes?.name} · {formatDate(selectedScheduleForManifest.departure_time)} {formatTime(selectedScheduleForManifest.departure_time)} WIB
                </small>
              </div>
              <button
                type="button"
                onClick={() => setManifestModalOpen(false)}
                style={{ border: 'none', background: '#f1f5f9', color: '#64748b', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {manifestLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--rh-text-2)' }}>
                  <RefreshCw size={24} className="rh-spin" style={{ margin: '0 auto 0.75rem' }} />
                  <p>Memuat manifest penumpang dan status kursi...</p>
                </div>
              ) : manifestData ? (
                <div>
                  {/* Summary Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)' }}>Total Penumpang</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--rh-primary)' }}>
                        {manifestData.summary?.totalPassengers || 0} Orang
                      </strong>
                    </div>

                    <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: 10, border: '1px solid #6ee7b7' }}>
                      <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 700 }}>Akun Asli (Non-Dummy)</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: '#047857' }}>
                        {manifestData.summary?.realAccountPassengers || 0} Orang
                      </strong>
                    </div>

                    <div style={{ background: '#f1f5f9', padding: '0.85rem', borderRadius: 10, border: '1px solid #cbd5e1' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--rh-text-2)' }}>Akun Simulasi / Dummy</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: '#475569' }}>
                        {manifestData.summary?.dummyAccountPassengers || 0} Orang
                      </strong>
                    </div>

                    <div style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--rh-primary)' }}>Kapasitas Rangkaian</span>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--rh-primary)' }}>
                        {manifestData.schedule?.capacity || 320} Kursi
                      </strong>
                    </div>
                  </div>

                  {/* Staff Assignment on this trip */}
                  <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Petugas Kondektur Terjadwal:</strong>
                    {manifestData.staffList?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {manifestData.staffList.map(st => (
                          <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', background: '#fff', padding: '0.35rem 0.65rem', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                            <ShieldCheck size={14} color="var(--rh-primary)" />
                            <strong>{st.fullName}</strong>
                            <small style={{ color: 'var(--rh-text-2)' }}>({st.email})</small>
                            {st.isRealStaff ? (
                              <span className="rh-badge-real-account" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>Petugas Asli</span>
                            ) : (
                              <span className="rh-badge-dummy-account" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>Petugas Dummy</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#d97706', fontSize: '0.82rem' }}>Belum ada kondektur yang ditugaskan pada perjalanan ini.</span>
                    )}
                  </div>

                  {/* Passenger Manifest Table */}
                  <h4 className="rh-h4" style={{ margin: '0 0 0.65rem' }}>Daftar Tiket &amp; Penumpang Terdaftar</h4>
                  {manifestData.manifest?.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', color: 'var(--rh-text-2)' }}>
                      Belum ada kursi yang terpesan pada jadwal perjalanan ini. Kapasitas 100% tersedia.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--rh-text-2)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '0.5rem' }}>No</th>
                            <th style={{ padding: '0.5rem' }}>Nama Penumpang</th>
                            <th style={{ padding: '0.5rem' }}>Gerbong &amp; Kursi</th>
                            <th style={{ padding: '0.5rem' }}>Kode Booking</th>
                            <th style={{ padding: '0.5rem' }}>Tipe Akun</th>
                            <th style={{ padding: '0.5rem' }}>Email Akun Pemesan</th>
                            <th style={{ padding: '0.5rem' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {manifestData.manifest.map((p, idx) => (
                            <tr
                              key={p.id}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                background: p.isRealAccount ? '#ecfdf5' : 'transparent',
                              }}
                            >
                              <td style={{ padding: '0.65rem 0.5rem' }}>{idx + 1}</td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <strong>{p.passengerName}</strong>
                                <small style={{ display: 'block', color: 'var(--rh-text-3)', fontSize: '0.72rem' }}>NIK: {p.idCardNumber}</small>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', whiteSpace: 'nowrap' }}>
                                <strong>Gerbong {p.carriageNumber}</strong> ({p.carriageClass}) · Kursi <strong>{p.seatNumber}</strong>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <code>{p.bookingCode}</code>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                {p.isRealAccount ? (
                                  <span className="rh-badge-real-account">✓ Akun Asli (Non-Dummy)</span>
                                ) : (
                                  <span className="rh-badge-dummy-account">Akun Simulasi</span>
                                )}
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span>{p.bookerName}</span>
                                <small style={{ display: 'block', color: 'var(--rh-text-2)', fontSize: '0.72rem' }}>{p.bookerEmail}</small>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <StatusBadge status={p.bookingStatus} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="rh-btn rh-btn-secondary rh-btn-sm"
                onClick={() => setManifestModalOpen(false)}
              >
                Tutup Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: BUAT AKUN PETUGAS CEPAT (jxx@gmail.com)
      ══════════════════════════════════════════════════════════════════════════ */}
      {staffModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="rh-h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={18} color="#166534" /> Buat Akun Petugas Cepat (`jxx@gmail.com`)
                </h3>
                <small style={{ color: 'var(--rh-text-2)' }}>Format akun dummy cepat untuk testing kondektur / gate staff</small>
              </div>
              <button
                type="button"
                onClick={() => setStaffModalOpen(false)}
                style={{ border: 'none', background: '#f1f5f9', color: '#64748b', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickStaff} style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Alamat Email Petugas</span>
                  <input
                    type="email"
                    className="rh-input"
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    placeholder="e.g. j01@gmail.com"
                    required
                  />
                  <small style={{ color: 'var(--rh-text-3)', fontSize: '0.74rem' }}>Otomatis disarankan format urut jxx@gmail.com</small>
                </label>

                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Kata Sandi (Gampang Diingat)</span>
                  <input
                    type="text"
                    className="rh-input"
                    value={newStaffPassword}
                    onChange={e => setNewStaffPassword(e.target.value)}
                    placeholder="e.g. petugas123"
                    required
                  />
                </label>

                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Nama Lengkap Petugas</span>
                  <input
                    type="text"
                    className="rh-input"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    placeholder="e.g. Petugas Operasional J01"
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Posisi / Role</span>
                    <select
                      className="rh-input"
                      value={newStaffType}
                      onChange={e => setNewStaffType(e.target.value)}
                    >
                      <option value="conductor">Kondektur Kereta (Conductor)</option>
                      <option value="gate">Petugas Gerbang (Gate Staff)</option>
                    </select>
                  </label>

                  {newStaffType === 'gate' ? (
                    <label className="rh-input-group" style={{ margin: 0 }}>
                      <span className="rh-label-text">Stasiun Penugasan</span>
                      <select
                        className="rh-input"
                        value={newStaffStationId}
                        onChange={e => setNewStaffStationId(e.target.value)}
                        required
                      >
                        <option value="">-- Pilih Stasiun --</option>
                        {stations.map(st => (
                          <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label className="rh-input-group" style={{ margin: 0 }}>
                      <span className="rh-label-text">Tugaskan ke Jadwal KA (Opsional)</span>
                      <select
                        className="rh-input"
                        value={newStaffScheduleId}
                        onChange={e => setNewStaffScheduleId(e.target.value)}
                      >
                        <option value="">-- Tanpa Penugasan Awal --</option>
                        {schedules.slice(0, 50).map(sch => (
                          <option key={sch.id} value={sch.id}>
                            {sch.trains?.name} · {sch.routes?.name} ({formatDate(sch.departure_time)})
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="rh-btn rh-btn-secondary"
                  onClick={() => setStaffModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rh-btn rh-btn-primary"
                  disabled={creatingStaff}
                >
                  {creatingStaff ? <RefreshCw size={16} className="rh-spin" /> : 'Buat Akun & Aktifkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: TAMBAH ARMADA KERETA & ATURAN
      ══════════════════════════════════════════════════════════════════════════ */}
      {trainModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="rh-h3" style={{ margin: 0 }}>Tambah Rangkaian Armada &amp; Aturan Kereta</h3>
                <small style={{ color: 'var(--rh-text-2)' }}>Daftarkan lokomotif, kapasitas gerbong, dan aturan operasional</small>
              </div>
              <button
                type="button"
                onClick={() => setTrainModalOpen(false)}
                style={{ border: 'none', background: '#f1f5f9', color: '#64748b', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTrain} style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Nama Kereta Api</span>
                    <input
                      type="text"
                      className="rh-input"
                      placeholder="e.g. Argo Sindoro"
                      value={newTrainName}
                      onChange={e => setNewTrainName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Nomor KA</span>
                    <input
                      type="text"
                      className="rh-input"
                      placeholder="e.g. KA 11"
                      value={newTrainNumber}
                      onChange={e => setNewTrainNumber(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Tipe Layanan</span>
                    <select
                      className="rh-input"
                      value={newTrainClass}
                      onChange={e => setNewTrainClass(e.target.value)}
                    >
                      <option value="Eksekutif & Luxury">Eksekutif &amp; Luxury</option>
                      <option value="Eksekutif New Generation">Eksekutif New Generation</option>
                      <option value="Eksekutif & Panoramic">Eksekutif &amp; Panoramic</option>
                      <option value="Ekonomi Premium">Ekonomi Premium</option>
                      <option value="Campuran (Eko/Bis/Eks)">Campuran (Eko/Bis/Eks)</option>
                    </select>
                  </label>

                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Tipe Lokomotif</span>
                    <select
                      className="rh-input"
                      value={newTrainLoco}
                      onChange={e => setNewTrainLoco(e.target.value)}
                    >
                      <option value="CC 206 GE (General Electric)">CC 206 GE (General Electric)</option>
                      <option value="CC 203 GE">CC 203 GE</option>
                      <option value="CC 201 GE">CC 201 GE</option>
                      <option value="EMU Listrik Cepat">EMU Listrik Cepat</option>
                      <option value="KRD Diesel Elektrik">KRD Diesel Elektrik</option>
                    </select>
                  </label>
                </div>

                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Susunan Rangkaian Gerbong</span>
                  <input
                    type="text"
                    className="rh-input"
                    value={newTrainFormation}
                    onChange={e => setNewTrainFormation(e.target.value)}
                    placeholder="e.g. 8 Gerbong Eksekutif + 1 Kereta Makan + 1 Kereta Pembangkit"
                    required
                  />
                </label>

                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Aturan Operasional (Operational Rules)</span>
                  <textarea
                    className="rh-input"
                    rows={3}
                    value={newTrainRules}
                    onChange={e => setNewTrainRules(e.target.value)}
                    placeholder="Aturan kecepatan, batas bagasi, larangan merokok, dll..."
                    required
                  />
                </label>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="rh-btn rh-btn-secondary"
                  onClick={() => setTrainModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rh-btn rh-btn-primary"
                  disabled={addingTrain}
                >
                  {addingTrain ? <RefreshCw size={16} className="rh-spin" /> : 'Simpan Armada & Susun Gerbong'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: TAMBAH JALUR / RUTE BARU
      ══════════════════════════════════════════════════════════════════════════ */}
      {routeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="rh-h3" style={{ margin: 0 }}>Tambah Jalur &amp; Rute Baru</h3>
                <small style={{ color: 'var(--rh-text-2)' }}>Daftarkan koridor perjalanan antar stasiun simpul</small>
              </div>
              <button
                type="button"
                onClick={() => setRouteModalOpen(false)}
                style={{ border: 'none', background: '#f1f5f9', color: '#64748b', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRoute} style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <label className="rh-input-group" style={{ margin: 0 }}>
                  <span className="rh-label-text">Nama Koridor / Rute</span>
                  <input
                    type="text"
                    className="rh-input"
                    placeholder="e.g. Gambir - Malang via Surabaya"
                    value={newRouteName}
                    onChange={e => setNewRouteName(e.target.value)}
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Stasiun Asal</span>
                    <select
                      className="rh-input"
                      value={newRouteOriginId}
                      onChange={e => setNewRouteOriginId(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Asal --</option>
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                      ))}
                    </select>
                  </label>

                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Stasiun Tujuan</span>
                    <select
                      className="rh-input"
                      value={newRouteDestId}
                      onChange={e => setNewRouteDestId(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Tujuan --</option>
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Jarak Tempuh (KM)</span>
                    <input
                      type="number"
                      className="rh-input"
                      value={newRouteDistance}
                      onChange={e => setNewRouteDistance(e.target.value)}
                      min={10}
                      max={2000}
                      required
                    />
                  </label>

                  <label className="rh-input-group" style={{ margin: 0 }}>
                    <span className="rh-label-text">Estimasi Durasi (Menit)</span>
                    <input
                      type="number"
                      className="rh-input"
                      value={newRouteDuration}
                      onChange={e => setNewRouteDuration(e.target.value)}
                      min={30}
                      max={1440}
                      required
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="rh-btn rh-btn-secondary"
                  onClick={() => setRouteModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rh-btn rh-btn-primary"
                  disabled={addingRoute}
                >
                  {addingRoute ? <RefreshCw size={16} className="rh-spin" /> : 'Daftarkan Jalur Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </OperationalDashboardShell>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Memuat Pusat Kendali Admin...</div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
