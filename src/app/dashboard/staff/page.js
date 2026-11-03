'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CalendarDays, CheckCircle2, RefreshCw, Search, TicketCheck, Train, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getJourneyStatusLabel, getNextJourneyStatuses, JOURNEY_STATUSES } from '@/lib/operations/journey-status'
import { formatDate, formatTime } from '@/lib/utils/formatters'

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
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '0.25rem 0.65rem', background, color, fontSize: '0.78rem', fontWeight: 700 }}>
      {getJourneyStatusLabel(status)}
    </span>
  )
}

export default function StaffDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const [updating, setUpdating] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [journeySearch, setJourneySearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusDrafts, setStatusDrafts] = useState({})
  const [statusNotes, setStatusNotes] = useState({})

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fstaff')
    } else if (profile?.role && profile.role !== 'conductor' && profile.role !== 'admin') {
      router.replace(profile.role === 'passenger' ? '/dashboard/passenger' : '/')
    }
  }, [authLoading, user, profile, router])

  const loadJourneys = useCallback(async () => {
    if (!user || (profile?.role !== 'conductor' && profile?.role !== 'admin')) return
    if (!hasLoaded) setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: assignments, error: assignmentError } = await supabase
      .from('staff_assignments')
      .select('id, schedule_id, schedules(id, status, departure_time, arrival_time, trains(name, train_number), routes(name))')
      .eq('staff_id', user.id)
      .order('created_at', { ascending: false })

    if (assignmentError) {
      setError(`Perjalanan tugas tidak dapat dimuat: ${assignmentError.message}`)
      setLoading(false)
      setHasLoaded(true)
      return
    }

    const scheduleIds = (assignments || []).map(assignment => assignment.schedule_id)
    if (scheduleIds.length === 0) {
      setJourneys([])
      setLoading(false)
      setHasLoaded(true)
      return
    }

    const [ticketResult, updateResult] = await Promise.all([
      supabase.from('tickets').select('schedule_id, is_validated').in('schedule_id', scheduleIds),
      supabase.from('journey_updates').select('schedule_id, status, note, created_at').in('schedule_id', scheduleIds).order('created_at', { ascending: false }),
    ])

    if (ticketResult.error || updateResult.error) {
      setError(`Ringkasan perjalanan tidak dapat dimuat: ${ticketResult.error?.message || updateResult.error?.message}`)
      setLoading(false)
      setHasLoaded(true)
      return
    }

    const tickets = ticketResult.data || []
    const latestUpdates = {}
    for (const update of updateResult.data || []) {
      if (!latestUpdates[update.schedule_id]) latestUpdates[update.schedule_id] = update
    }

    setJourneys((assignments || []).map(assignment => ({
      ...assignment,
      tickets: tickets.filter(ticket => ticket.schedule_id === assignment.schedule_id),
      latestUpdate: latestUpdates[assignment.schedule_id] || null,
    })))
    setLoading(false)
    setHasLoaded(true)
  }, [user, profile?.role, hasLoaded])

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!active) return
      await loadJourneys()
    }
    const timer = window.setTimeout(load, 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [loadJourneys, reloadKey])

  useEffect(() => {
    if (!user || (profile?.role !== 'conductor' && profile?.role !== 'admin')) return
    const timer = window.setInterval(() => setReloadKey(key => key + 1), 30000)
    return () => window.clearInterval(timer)
  }, [user, profile?.role])

  async function validateTicket(event) {
    event.preventDefault()
    if (!ticketNumber.trim() || validating) return
    setValidating(true)
    setValidation(null)
    const supabase = createClient()
    const { data, error: validationError } = await supabase.rpc('validate_assigned_ticket', {
      p_ticket_number: ticketNumber.trim(),
    })
    setValidating(false)
    if (validationError) {
      toast.error(`Validasi gagal: ${validationError.message}`)
      return
    }
    setValidation(data)
    if (data.success) {
      toast.success(data.message)
      setTicketNumber('')
      setReloadKey(key => key + 1)
    } else {
      toast.error(data.message)
    }
  }

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
    toast.success('Status perjalanan diperbarui dan dapat dilihat penumpang.')
  }

  const ticketTotal = journeys.reduce((total, journey) => total + journey.tickets.length, 0)
  const validatedTotal = journeys.reduce((total, journey) => total + journey.tickets.filter(ticket => ticket.is_validated).length, 0)
  const needsAttention = journeys.filter(journey => ['delayed', 'cancelled'].includes(journey.schedules?.status)).length
  const scheduleIds = useMemo(() => journeys.map(journey => journey.schedule_id), [journeys])
  const filteredJourneys = journeys.filter(journey => {
    const schedule = journey.schedules
    const search = journeySearch.trim().toLocaleLowerCase('id-ID')
    const matchesSearch = !search || [
      schedule?.trains?.name,
      schedule?.trains?.train_number,
      schedule?.routes?.name,
    ].some(value => value?.toLocaleLowerCase('id-ID').includes(search))
    return matchesSearch && (statusFilter === 'all' || schedule?.status === statusFilter)
  })

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span className="rh-badge rh-badge-primary">Area operasional</span>
              <h1 className="rh-h2" style={{ marginTop: '0.55rem' }}>Dashboard petugas</h1>
              <p style={{ color: 'var(--rh-text-2)', margin: '0.25rem 0 0' }}>
                Kelola hanya perjalanan yang ditugaskan kepada akun Anda. Pembaruan status akan terlihat oleh admin dan penumpang bertiket.
              </p>
            </div>
            <button type="button" className="rh-btn rh-btn-ghost" onClick={() => setReloadKey(key => key + 1)} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'rh-spin' : ''} /> Muat ulang
            </button>
          </div>

          <nav aria-label="Navigasi dashboard petugas" className="rh-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.5rem', marginBottom: '1rem' }}>
            {[
              ['#staff-journeys', 'Perjalanan tugas', Train],
              ['#ticket-validation', 'Validasi tiket', TicketCheck],
              ['/dashboard/orders', 'Pesanan makanan', Users],
            ].map(([href, label, Icon]) => (
              <a key={href} href={href} className="rh-btn rh-btn-ghost rh-btn-sm"><Icon size={15} />{label}</a>
            ))}
          </nav>

          {error && <div role="alert" className="rh-card" style={{ padding: '1rem 1.25rem', color: 'var(--rh-danger)', marginBottom: '1rem' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.9rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Perjalanan tugas', value: journeys.length, icon: Train },
              { label: 'Tiket penumpang', value: ticketTotal, icon: TicketCheck },
              { label: 'Tiket tervalidasi', value: `${validatedTotal}/${ticketTotal}`, icon: CheckCircle2 },
              { label: 'Perlu perhatian', value: needsAttention, icon: AlertCircle },
            ].map(({ label, value, icon: Icon }) => (
              <article key={label} className="rh-card">
                <div className="rh-card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.15rem' }}>
                  <div className="rh-logo-mark"><Icon size={18} /></div>
                  <div><small style={{ color: 'var(--rh-text-2)' }}>{label}</small><strong style={{ display: 'block', fontSize: '1.3rem' }}>{value}</strong></div>
                </div>
              </article>
            ))}
          </div>

          <section id="ticket-validation" className="rh-card" style={{ marginBottom: '1.5rem', scrollMarginTop: 96 }}>
            <div className="rh-card-header">
              <h2 className="rh-h4"><TicketCheck size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Validasi tiket</h2>
              <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>
                Tiket harus sudah dibayar dan berasal dari perjalanan tugas Anda. Validasi ini menggunakan nomor tiket secara manual.
              </p>
            </div>
            <div className="rh-card-body">
              <form onSubmit={validateTicket} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <label className="rh-input-group" style={{ flex: '1 1 270px' }}>
                  <span className="rh-label-text">Nomor tiket</span>
                  <input className="rh-input rh-mono" autoComplete="off" maxLength={50} placeholder="TKT-..." value={ticketNumber} onChange={event => setTicketNumber(event.target.value)} required />
                </label>
                <button className="rh-btn rh-btn-primary" type="submit" disabled={validating} style={{ alignSelf: 'end', minHeight: 46 }}>
                  {validating && <RefreshCw size={16} className="rh-spin" />}
                  {validating ? 'Memeriksa...' : 'Validasi tiket'}
                </button>
              </form>
              {validation && (
                <div role="status" style={{
                  marginTop: '1rem', padding: '1rem', borderRadius: 12,
                  background: validation.success ? 'var(--rh-success-light)' : 'var(--rh-danger-light)',
                  color: validation.success ? 'var(--rh-success)' : 'var(--rh-danger)',
                }}>
                  <strong>{validation.message}</strong>
                  {validation.ticket_number && <div style={{ marginTop: '0.5rem', color: 'var(--rh-text)' }}>
                    {validation.passenger_name} · Kursi {validation.seat_number} · {validation.ticket_number}
                  </div>}
                </div>
              )}
            </div>
          </section>

          <section id="staff-journeys" style={{ scrollMarginTop: 96 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <h2 className="rh-h3" style={{ margin: 0 }}>Perjalanan yang ditugaskan</h2>
                <p style={{ color: 'var(--rh-text-2)', margin: '0.25rem 0 0' }}>Status dan catatan operasional dibagikan dengan admin serta penumpang yang telah membayar.</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--rh-text-2)' }}>{filteredJourneys.length} perjalanan</span>
            </div>

            <div className="rh-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
              <label className="rh-input-group" style={{ flex: '1 1 250px' }}>
                <span className="rh-label-text">Cari kereta atau rute</span>
                <span style={{ position: 'relative', display: 'block' }}>
                  <Search size={16} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'var(--rh-text-3)' }} />
                  <input className="rh-input" style={{ paddingLeft: 36 }} value={journeySearch} onChange={event => setJourneySearch(event.target.value)} placeholder="Nama kereta, nomor, atau rute" />
                </span>
              </label>
              <label className="rh-input-group" style={{ flex: '0 1 220px' }}>
                <span className="rh-label-text">Status perjalanan</span>
                <select className="rh-input" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
                  <option value="all">Semua status</option>
                  {JOURNEY_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>Memuat daftar penugasan...</div>}
            {!loading && !error && journeys.length === 0 && (
              <div className="rh-card" style={{ padding: '1.5rem', color: 'var(--rh-text-2)' }}>
                Belum ada jadwal yang ditugaskan. Hubungi administrator untuk penugasan.
              </div>
            )}
            {!loading && !error && journeys.length > 0 && filteredJourneys.length === 0 && (
              <div className="rh-card" style={{ padding: '1.5rem', color: 'var(--rh-text-2)' }}>Tidak ada perjalanan yang cocok dengan pencarian atau filter.</div>
            )}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredJourneys.map(journey => {
                const schedule = journey.schedules
                const currentStatus = schedule?.status || 'scheduled'
                const nextStatuses = getNextJourneyStatuses(currentStatus)
                const draftStatus = statusDrafts[journey.schedule_id] || currentStatus
                const ticketsValidated = journey.tickets.filter(ticket => ticket.is_validated).length
                return (
                  <article key={journey.id} className="rh-card">
                    <div className="rh-card-body" style={{ display: 'grid', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ flex: '1 1 270px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
                            <strong style={{ fontSize: '1.05rem' }}>{schedule?.trains?.name || 'Kereta'} · {schedule?.trains?.train_number || ''}</strong>
                            <JourneyStatus status={currentStatus} />
                          </div>
                          <span style={{ display: 'block', color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>{schedule?.routes?.name || 'Rute perjalanan'}</span>
                          {schedule?.departure_time && <small style={{ display: 'block', color: 'var(--rh-text-3)', marginTop: '0.35rem' }}>
                            <CalendarDays size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{formatDate(schedule.departure_time)} · {formatTime(schedule.departure_time)}
                          </small>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--rh-text-2)' }}>
                          <TicketCheck size={16} />
                          <span><strong style={{ color: 'var(--rh-text)' }}>{ticketsValidated}/{journey.tickets.length}</strong> tiket tervalidasi</span>
                        </div>
                      </div>

                      {journey.latestUpdate && (
                        <div style={{ background: 'var(--rh-surface)', borderRadius: 10, padding: '0.75rem 0.9rem' }}>
                          <small style={{ color: 'var(--rh-text-2)' }}>
                            Pembaruan terakhir: {getJourneyStatusLabel(journey.latestUpdate.status)} · {formatDate(journey.latestUpdate.created_at)} {formatTime(journey.latestUpdate.created_at)}
                          </small>
                          {journey.latestUpdate.note && <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>{journey.latestUpdate.note}</p>}
                        </div>
                      )}

                      {nextStatuses.length > 0 && (
                        <form onSubmit={event => { event.preventDefault(); updateJourney(journey) }} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.75rem', borderTop: '1px solid var(--rh-border)', paddingTop: '1rem' }}>
                          <label className="rh-input-group" style={{ flex: '0 1 220px' }}>
                            <span className="rh-label-text">Perbarui status</span>
                            <select className="rh-input" value={draftStatus} onChange={event => setStatusDrafts(current => ({ ...current, [journey.schedule_id]: event.target.value }))}>
                              <option value={currentStatus}>{getJourneyStatusLabel(currentStatus)} (saat ini)</option>
                              {nextStatuses.map(status => <option key={status} value={status}>{getJourneyStatusLabel(status)}</option>)}
                            </select>
                          </label>
                          <label className="rh-input-group" style={{ flex: '1 1 300px' }}>
                            <span className="rh-label-text">Catatan untuk admin dan penumpang (opsional)</span>
                            <input
                              className="rh-input"
                              maxLength={500}
                              value={statusNotes[journey.schedule_id] || ''}
                              onChange={event => setStatusNotes(current => ({ ...current, [journey.schedule_id]: event.target.value }))}
                              placeholder={draftStatus === 'delayed' ? 'Contoh: menunggu pemeriksaan operasional' : 'Informasi singkat tentang perjalanan'}
                            />
                          </label>
                          <button className="rh-btn rh-btn-primary" type="submit" disabled={updating === journey.schedule_id || draftStatus === currentStatus}>
                            {updating === journey.schedule_id && <RefreshCw size={15} className="rh-spin" />}
                            Simpan pembaruan
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
