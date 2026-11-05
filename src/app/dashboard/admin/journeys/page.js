'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, RefreshCw, Search, Train } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import { getJourneyStatusLabel, getNextJourneyStatuses, JOURNEY_STATUSES } from '@/lib/operations/journey-status'

const statusColors = {
  scheduled: ['var(--rh-info-light)', 'var(--rh-info)'],
  boarding: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  departed: ['var(--rh-primary-light)', 'var(--rh-primary)'],
  arrived: ['var(--rh-success-light)', 'var(--rh-success)'],
  delayed: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  cancelled: ['var(--rh-danger-light)', 'var(--rh-danger)'],
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

function splitIntoChunks(values, chunkSize = 50) {
  const chunks = []
  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize))
  }
  return chunks
}

function StatusBadge({ status }) {
  const [background, color] = statusColors[status] || ['var(--rh-surface-2)', 'var(--rh-text-2)']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '0.25rem 0.65rem', background, color, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {getJourneyStatusLabel(status)}
    </span>
  )
}

export default function AdminJourneysPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [schedules, setSchedules] = useState([])
  const [assignmentCounts, setAssignmentCounts] = useState({})
  const [scheduleDateFrom, setScheduleDateFrom] = useState('')
  const [scheduleDateTo, setScheduleDateTo] = useState('')
  const [appliedDates, setAppliedDates] = useState({ from: '', to: '' })
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all')
  const [updatingSchedule, setUpdatingSchedule] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const from = jakartaDateInputValue()
      const to = addDateDays(from, 6)
      setScheduleDateFrom(from)
      setScheduleDateTo(to)
      setAppliedDates({ from, to })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fadmin%2Fjourneys')
    } else if (!authLoading && profile?.role && profile.role !== 'admin') {
      router.replace((profile.role === 'conductor' || profile.role === 'gate' || profile.role === 'staff' || profile.staff_type) ? '/dashboard/staff' : '/dashboard/passenger')
    }
  }, [authLoading, profile?.role, profile?.staff_type, router, user])

  const loadSchedules = useCallback(async (showLoading = false) => {
    if (!appliedDates.from || !appliedDates.to) return
    if (showLoading) setLoading(true)
    setError('')

    if (!user || profile?.role !== 'admin') {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: scheduleRows, error: scheduleError } = await supabase.from('schedules')
      .select('id, status, departure_time, arrival_time, trains(name, train_number), routes(name)')
      .gte('departure_time', jakartaDateStart(appliedDates.from))
      .lt('departure_time', jakartaDateStart(addDateDays(appliedDates.to, 1)))
      .order('departure_time')
      .limit(1000)

    if (scheduleError) {
      setError(`Jadwal perjalanan tidak dapat dimuat: ${scheduleError.message}`)
      setLoading(false)
      return
    }

    const scheduleIds = (scheduleRows || []).map(schedule => schedule.id)
    const chunks = splitIntoChunks(scheduleIds)
    const [assignmentResults, updateResults] = await Promise.all([
      Promise.all(chunks.map(ids => supabase.from('staff_assignments')
        .select('schedule_id')
        .in('schedule_id', ids))),
      Promise.all(chunks.map(ids => supabase.from('journey_updates')
        .select('schedule_id, status, note, created_at')
        .in('schedule_id', ids)
        .order('created_at', { ascending: false })
        .limit(500))),
    ])

    const assignmentFailure = assignmentResults.find(result => result.error)
    const updateFailure = updateResults.find(result => result.error)
    const counts = {}
    for (const result of assignmentResults) {
      for (const assignment of result.data || []) {
        counts[assignment.schedule_id] = (counts[assignment.schedule_id] || 0) + 1
      }
    }
    const latestUpdates = {}
    for (const result of updateResults) {
      for (const update of result.data || []) {
        if (!latestUpdates[update.schedule_id]
          || new Date(update.created_at) > new Date(latestUpdates[update.schedule_id].created_at)) {
          latestUpdates[update.schedule_id] = update
        }
      }
    }

    setSchedules((scheduleRows || []).map(schedule => ({
      ...schedule,
      latestUpdate: latestUpdates[schedule.id] || null,
    })))
    setAssignmentCounts(counts)
    const dataErrors = [
      assignmentFailure && `Informasi penugasan tidak dapat dimuat: ${assignmentFailure.error.message}`,
      updateFailure && `Catatan status tidak dapat dimuat: ${updateFailure.error.message}`,
    ].filter(Boolean)
    setError(dataErrors.join(' '))
    setLoading(false)
  }, [appliedDates, user, profile?.role])

  useEffect(() => {
    const timer = window.setTimeout(() => loadSchedules(true), 0)
    return () => window.clearTimeout(timer)
  }, [loadSchedules])

  useEffect(() => {
    if (profile?.role !== 'admin' || !appliedDates.from) return
    const timer = window.setInterval(() => loadSchedules(false), 30000)
    return () => window.clearInterval(timer)
  }, [appliedDates.from, loadSchedules, profile?.role])

  function applyDateFilter(event) {
    event.preventDefault()
    if (!scheduleDateFrom || !scheduleDateTo) {
      toast.error('Pilih tanggal awal dan akhir terlebih dahulu.')
      return
    }
    if (scheduleDateTo < scheduleDateFrom) {
      toast.error('Tanggal akhir tidak boleh sebelum tanggal awal.')
      return
    }
    setLoading(true)
    setAppliedDates({ from: scheduleDateFrom, to: scheduleDateTo })
  }

  function showNextSevenDays() {
    const from = jakartaDateInputValue()
    const to = addDateDays(from, 6)
    setScheduleDateFrom(from)
    setScheduleDateTo(to)
    setLoading(true)
    setAppliedDates({ from, to })
  }

  async function updateJourneyStatus(schedule, status) {
    if (updatingSchedule || status === schedule.status) return
    setUpdatingSchedule(schedule.id)
    const supabase = createClient()
    const { error: updateError } = await supabase.rpc('update_assigned_journey_status', {
      p_schedule_id: schedule.id,
      p_status: status,
      p_note: null,
    })
    setUpdatingSchedule('')
    if (updateError) {
      toast.error(`Status perjalanan gagal diperbarui: ${updateError.message}`)
      return
    }
    const updatedAt = new Date().toISOString()
    setSchedules(current => current.map(item => item.id === schedule.id ? {
      ...item,
      status,
      latestUpdate: { status, note: null, created_at: updatedAt },
    } : item))
    toast.success('Status perjalanan berhasil diperbarui.')
  }

  const filteredSchedules = useMemo(() => {
    const search = scheduleSearch.trim().toLocaleLowerCase('id-ID')
    return schedules.filter(schedule => {
      const matchesSearch = !search || [
        schedule.trains?.name,
        schedule.trains?.train_number,
        schedule.routes?.name,
      ].some(value => value?.toLocaleLowerCase('id-ID').includes(search))
      return matchesSearch && (scheduleStatusFilter === 'all' || schedule.status === scheduleStatusFilter)
    })
  }, [scheduleSearch, scheduleStatusFilter, schedules])

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">

          <div style={{ marginBottom: '1.25rem' }}>
            <a href="/dashboard/admin" className="rh-btn rh-btn-ghost rh-btn-sm"><ArrowLeft size={15} />Kembali ke ringkasan admin</a>
          </div>
          <section className="rh-card">
            <div className="rh-card-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span className="rh-badge rh-badge-primary">Operasional</span>
                <h1 className="rh-h2" style={{ marginTop: '0.6rem' }}><CalendarDays size={23} style={{ verticalAlign: 'middle', marginRight: 8 }} />Perjalanan mendatang</h1>
                <p style={{ color: 'var(--rh-text-2)', marginTop: '0.35rem' }}>Cari jadwal, pantau petugas, dan perbarui status perjalanan dari halaman ini.</p>
              </div>
              <button type="button" className="rh-btn rh-btn-ghost" onClick={() => loadSchedules(true)} disabled={loading}>
                <RefreshCw size={16} /> Muat ulang
              </button>
            </div>

            <div className="rh-card-body">
              <form onSubmit={applyDateFilter} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.75rem', padding: '1rem', marginBottom: '1rem', background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 'var(--radius-md)' }}>
                <label className="rh-input-group" style={{ flex: '1 1 180px' }}>
                  <span className="rh-label-text">Tanggal mulai</span>
                  <input className="rh-input" type="date" value={scheduleDateFrom} onChange={event => setScheduleDateFrom(event.target.value)} required />
                </label>
                <label className="rh-input-group" style={{ flex: '1 1 180px' }}>
                  <span className="rh-label-text">Tanggal akhir</span>
                  <input className="rh-input" type="date" min={scheduleDateFrom} value={scheduleDateTo} onChange={event => setScheduleDateTo(event.target.value)} required />
                </label>
                <button className="rh-btn rh-btn-primary" type="submit" disabled={loading}>
                  {loading && <RefreshCw size={15} className="rh-spin" />}Terapkan tanggal
                </button>
                <button className="rh-btn rh-btn-ghost" type="button" onClick={showNextSevenDays} disabled={loading}>7 hari ke depan</button>
              </form>

              <p aria-live="polite" style={{ color: 'var(--rh-text-2)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                Rentang: {appliedDates.from && formatDate(`${appliedDates.from}T12:00:00`)} – {appliedDates.to && formatDate(`${appliedDates.to}T12:00:00`)} · {schedules.length} jadwal
              </p>
              {error && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)', marginBottom: '1rem' }}><AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />{error}</div>}
              {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem', marginBottom: '1rem' }}>Memuat jadwal perjalanan…</div>}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <label className="rh-input-group" style={{ flex: '1 1 250px' }}>
                  <span className="rh-label-text">Cari kereta atau rute</span>
                  <span style={{ position: 'relative', display: 'block' }}>
                    <Search size={16} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'var(--rh-text-3)' }} />
                    <input className="rh-input" style={{ paddingLeft: 36 }} value={scheduleSearch} onChange={event => setScheduleSearch(event.target.value)} placeholder="Nama kereta, nomor, atau rute" />
                  </span>
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 220px' }}>
                  <span className="rh-label-text">Status perjalanan</span>
                  <select className="rh-input" value={scheduleStatusFilter} onChange={event => setScheduleStatusFilter(event.target.value)}>
                    <option value="all">Semua status</option>
                    {JOURNEY_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>

              {filteredSchedules.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--rh-text-2)' }}>
                  <Train size={26} style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>{schedules.length ? 'Tidak ada perjalanan yang cocok dengan filter.' : 'Belum ada perjalanan pada rentang tanggal ini.'}</p>
                </div>
              ) : filteredSchedules.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', textAlign: 'left' }}>
                    <caption style={{ textAlign: 'left', padding: '0 0 0.65rem', color: 'var(--rh-text-2)', fontSize: '0.85rem' }}>Jadwal perjalanan pada rentang terpilih</caption>
                    <thead>
                      <tr style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {['Kereta dan rute', 'Keberangkatan', 'Status', 'Petugas', 'Ubah status'].map(label => <th key={label} scope="col" style={{ padding: '0.75rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>{label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map(schedule => (
                        <tr key={schedule.id}>
                          <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                            <strong style={{ display: 'block' }}>{schedule.trains?.name || 'Kereta'} · {schedule.trains?.train_number || '-'}</strong>
                            <small style={{ color: 'var(--rh-text-2)' }}>{schedule.routes?.name || 'Rute tidak tersedia'}</small>
                          </td>
                          <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)', whiteSpace: 'nowrap' }}>
                            <strong style={{ display: 'block' }}>{formatDate(schedule.departure_time)}</strong>
                            <small style={{ color: 'var(--rh-text-2)' }}>{formatTime(schedule.departure_time)} WIB</small>
                          </td>
                          <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                            <StatusBadge status={schedule.status} />
                            {schedule.latestUpdate?.note && <small style={{ display: 'block', maxWidth: 220, marginTop: '0.3rem', color: 'var(--rh-text-2)' }}>{schedule.latestUpdate.note}</small>}
                          </td>
                          <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                            {assignmentCounts[schedule.id]
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--rh-success)' }}><CheckCircle2 size={15} />{assignmentCounts[schedule.id]} petugas</span>
                              : <span style={{ color: 'var(--rh-warning)', fontWeight: 600 }}>Belum ditugaskan</span>}
                          </td>
                          <td style={{ padding: '0.85rem 0.6rem', borderBottom: '1px solid var(--rh-border)' }}>
                            <select
                              className="rh-input"
                              aria-label={`Ubah status ${schedule.trains?.name || 'perjalanan'}`}
                              value={schedule.status}
                              disabled={updatingSchedule === schedule.id}
                              onChange={event => updateJourneyStatus(schedule, event.target.value)}
                              style={{ minWidth: 145, padding: '0.5rem' }}
                            >
                              <option value={schedule.status}>{getJourneyStatusLabel(schedule.status)} (saat ini)</option>
                              {getNextJourneyStatuses(schedule.status).map(value => <option key={value} value={value}>{getJourneyStatusLabel(value)}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
