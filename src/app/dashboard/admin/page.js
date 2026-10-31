'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, CalendarDays, CircleDollarSign, ClipboardList, RefreshCw, Train, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'

const emptyStats = { passengers: 0, bookings: 0, trains: 0, stations: 0, revenue: 0, activeSchedules: 0 }

function isAdminPreview() {
  return new URLSearchParams(window.location.search).get('preview') === '1'
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState(emptyStats)
  const [schedules, setSchedules] = useState([])
  const [staff, setStaff] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)

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
    if (isAdminPreview()) {
      setStats({ passengers: 128, bookings: 86, trains: 12, stations: 10, revenue: 28450000, activeSchedules: 24 })
      setStaff([
        { id: 'preview-staff-1', full_name: 'Contoh Petugas', email: 'petugas@example.test' },
      ])
      setSchedules([
        {
          id: 'preview-schedule-1',
          departure_time: '2026-11-05T00:30:00.000Z',
          trains: { name: 'Argo Parahyangan', train_number: 'KA 34' },
          routes: { name: 'Gambir – Bandung' },
        },
      ])
      setAssignments([
        {
          id: 'preview-assignment-1',
          profiles: { full_name: 'Contoh Petugas', email: 'petugas@example.test' },
          schedules: {
            departure_time: '2026-11-05T00:30:00.000Z',
            trains: { name: 'Argo Parahyangan', train_number: 'KA 34' },
            routes: { name: 'Gambir – Bandung' },
          },
        },
      ])
      setLoading(false)
      return
    }
    if (!user || profile?.role !== 'admin') return
    const supabase = createClient()

    const results = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role').eq('role', 'conductor').order('full_name'),
      supabase.from('schedules').select('id, status, departure_time, arrival_time, trains(name, train_number), routes(name)').gte('departure_time', new Date().toISOString()).neq('status', 'cancelled').order('departure_time').limit(100),
      supabase.from('staff_assignments').select('id, staff_id, schedule_id, profiles!staff_assignments_staff_id_fkey(full_name, email), schedules(departure_time, trains(name, train_number), routes(name))').order('created_at', { ascending: false }).limit(100),
      supabase.rpc('get_admin_dashboard_stats'),
    ])

    const failure = results.find(result => result.error)
    if (failure) {
      setError(`Data admin tidak dapat dimuat: ${failure.error.message}`)
      setLoading(false)
      return
    }

    const [staffResult, scheduleResult, assignmentResult, statsResult] = results
    setStaff(staffResult.data || [])
    setSchedules(scheduleResult.data || [])
    setAssignments(assignmentResult.data || [])
    setStats({
      passengers: Number(statsResult.data?.passengers || 0),
      bookings: Number(statsResult.data?.bookings || 0),
      trains: Number(statsResult.data?.trains || 0),
      stations: Number(statsResult.data?.stations || 0),
      revenue: Number(statsResult.data?.revenue || 0),
      activeSchedules: Number(statsResult.data?.active_schedules || 0),
    })
    setSelectedStaff(current => current || staffResult.data?.[0]?.id || '')
    setSelectedSchedule(current => current || scheduleResult.data?.[0]?.id || '')
    setLoading(false)
  }, [user, profile?.role])

  useEffect(() => {
    const timer = window.setTimeout(() => loadAdminData(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAdminData, reloadKey])

  async function assignStaff(event) {
    event.preventDefault()
    if (isAdminPreview() || !selectedStaff || !selectedSchedule || submitting) return
    setSubmitting(true)
    const supabase = createClient()
    const { error: assignmentError } = await supabase.rpc('admin_assign_staff', {
      p_staff_id: selectedStaff,
      p_schedule_id: selectedSchedule,
    })
    setSubmitting(false)
    if (assignmentError) {
      toast.error(`Penugasan gagal: ${assignmentError.message}`)
      return
    }
    toast.success('Petugas berhasil ditugaskan.')
    setReloadKey(key => key + 1)
  }

  async function removeAssignment(assignmentId) {
    if (isAdminPreview()) return
    if (!window.confirm('Hapus penugasan petugas ini?')) return
    const supabase = createClient()
    const { error: removeError } = await supabase.rpc('admin_remove_staff_assignment', {
      p_assignment_id: assignmentId,
    })
    if (removeError) {
      toast.error(`Penugasan tidak dapat dihapus: ${removeError.message}`)
      return
    }
    toast.success('Penugasan dihapus.')
    setAssignments(current => current.filter(assignment => assignment.id !== assignmentId))
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2.5rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          {previewMode && (
            <div role="status" className="rh-card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', borderColor: 'var(--rh-primary)', color: 'var(--rh-text-2)' }}>
              <strong>Mode preview</strong> — data contoh saja. Perubahan dan tindakan admin dinonaktifkan.
            </div>
          )}
          <span className="rh-badge rh-badge-primary">Administrasi</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h1 className="rh-h2" style={{ marginTop: '0.5rem' }}>Dashboard admin</h1>
              <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Statistik operasional dan penugasan petugas dari database.</p>
            </div>
            <button type="button" className="rh-btn rh-btn-ghost" onClick={() => { setError(''); setLoading(true); setReloadKey(key => key + 1) }} disabled={loading || previewMode}>
              <RefreshCw size={16} /> Muat ulang
            </button>
          </div>

          {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)', marginTop: '1rem' }}>{error}</div>}
          {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem', marginTop: '1rem' }}>Memuat statistik...</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', margin: '1.25rem 0 1.75rem' }}>
            {[
              { label: 'Penumpang', value: stats.passengers, icon: Users },
              { label: 'Total booking', value: stats.bookings, icon: ClipboardList },
              { label: 'Kereta', value: stats.trains, icon: Train },
              { label: 'Stasiun', value: stats.stations, icon: BarChart3 },
              { label: 'Jadwal aktif', value: stats.activeSchedules, icon: CalendarDays },
              { label: 'Pembayaran terkonfirmasi', value: formatIDR(stats.revenue), icon: CircleDollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <article key={label} className="rh-card">
                <div className="rh-card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="rh-logo-mark"><Icon size={18} /></div>
                  <div><small style={{ color: 'var(--rh-text-2)' }}>{label}</small><strong style={{ display: 'block', fontSize: '1.25rem' }}>{value}</strong></div>
                </div>
              </article>
            ))}
          </div>

          <section id="staff-assignments" className="rh-card" style={{ marginBottom: '1.5rem', scrollMarginTop: 96 }}>
            <div className="rh-card-header">
              <h2 className="rh-h4">Tugaskan petugas ke perjalanan</h2>
              <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Daftar ini menentukan perjalanan yang dapat diakses akun petugas tersebut.</p>
            </div>
            <div className="rh-card-body">
              {staff.length === 0 || schedules.length === 0 ? (
                <p style={{ color: 'var(--rh-text-2)' }}>
                  {staff.length === 0 ? 'Belum ada profil ber-role conductor. Buat/promosikan akun petugas secara aman terlebih dahulu.' : 'Tidak ada jadwal mendatang yang dapat ditugaskan.'}
                </p>
              ) : (
                <form onSubmit={assignStaff} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.75rem' }}>
                  <label className="rh-input-group" style={{ flex: '1 1 240px' }}>
                    <span className="rh-label-text">Petugas</span>
                    <select className="rh-input" value={selectedStaff} onChange={event => setSelectedStaff(event.target.value)} required>
                      {staff.map(person => <option key={person.id} value={person.id}>{person.full_name} · {person.email}</option>)}
                    </select>
                  </label>
                  <label className="rh-input-group" style={{ flex: '2 1 340px' }}>
                    <span className="rh-label-text">Perjalanan</span>
                    <select className="rh-input" value={selectedSchedule} onChange={event => setSelectedSchedule(event.target.value)} required>
                      {schedules.map(schedule => <option key={schedule.id} value={schedule.id}>
                        {schedule.trains?.name} · {schedule.routes?.name} · {formatDate(schedule.departure_time)} {formatTime(schedule.departure_time)}
                      </option>)}
                    </select>
                  </label>
                  <button className="rh-btn rh-btn-primary" type="submit" disabled={submitting || previewMode}>
                    {submitting && <RefreshCw size={15} className="rh-spin" />}
                    {submitting ? 'Menyimpan...' : 'Tugaskan'}
                  </button>
                </form>
              )}
            </div>
          </section>

          <section id="active-assignments" style={{ scrollMarginTop: 96 }}>
            <h2 className="rh-h3" style={{ marginBottom: '0.75rem' }}>Penugasan aktif</h2>
            {assignments.length === 0 && !loading && <div className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-text-2)' }}>Belum ada penugasan petugas.</div>}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {assignments.map(assignment => (
                <article key={assignment.id} className="rh-card">
                  <div className="rh-card-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: '1 1 270px' }}>
                      <strong style={{ display: 'block' }}>{assignment.profiles?.full_name || 'Petugas'}</strong>
                      <small style={{ color: 'var(--rh-text-2)' }}>{assignment.profiles?.email}</small>
                    </div>
                    <div style={{ flex: '2 1 330px' }}>
                      <strong style={{ display: 'block' }}>{assignment.schedules?.trains?.name} · {assignment.schedules?.routes?.name}</strong>
                      <small style={{ color: 'var(--rh-text-2)' }}>{assignment.schedules?.departure_time ? `${formatDate(assignment.schedules.departure_time)} · ${formatTime(assignment.schedules.departure_time)}` : ''}</small>
                    </div>
                    <button className="rh-btn rh-btn-ghost rh-btn-sm" type="button" onClick={() => removeAssignment(assignment.id)} disabled={previewMode}>Hapus penugasan</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
