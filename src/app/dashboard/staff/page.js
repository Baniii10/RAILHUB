'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CheckCircle2, Clock3, RefreshCw, TicketCheck, Train } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'
import StaffServiceDesk from '@/components/services/StaffServiceDesk'

const JOURNEY_STATUSES = [
  ['scheduled', 'Terjadwal'],
  ['boarding', 'Boarding'],
  ['departed', 'Berangkat'],
  ['arrived', 'Tiba'],
  ['delayed', 'Tertunda'],
  ['cancelled', 'Dibatalkan'],
]

export default function StaffDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const [updating, setUpdating] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fstaff')
    } else if (profile?.role && profile.role !== 'conductor' && profile.role !== 'admin') {
      router.replace(profile.role === 'passenger' ? '/dashboard/passenger' : '/')
    }
  }, [authLoading, user, profile, router])

  useEffect(() => {
    if (!user || (profile?.role !== 'conductor' && profile?.role !== 'admin')) return
    let active = true
    const supabase = createClient()

    async function loadJourneys() {
      setLoading(true)
      setError('')
      const { data: assignments, error: assignmentError } = await supabase
        .from('staff_assignments')
        .select('id, schedule_id, schedules(id, status, departure_time, arrival_time, trains(name, train_number), routes(name))')
        .eq('staff_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return
      if (assignmentError) {
        setError(`Perjalanan tugas tidak dapat dimuat: ${assignmentError.message}`)
        setLoading(false)
        return
      }

      const scheduleIds = (assignments || []).map(assignment => assignment.schedule_id)
      if (scheduleIds.length === 0) {
        setJourneys([])
        setLoading(false)
        return
      }

      const [ticketResult, updateResult] = await Promise.all([
        supabase.from('tickets').select('schedule_id, is_validated').in('schedule_id', scheduleIds),
        supabase.from('journey_updates').select('schedule_id, status, note, created_at').in('schedule_id', scheduleIds).order('created_at', { ascending: false }),
      ])

      if (!active) return
      if (ticketResult.error || updateResult.error) {
        setError(`Ringkasan perjalanan tidak dapat dimuat: ${ticketResult.error?.message || updateResult.error?.message}`)
        setLoading(false)
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
    }

    loadJourneys()
    return () => { active = false }
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
    } else {
      toast.error(data.message)
    }
  }

  async function updateJourney(scheduleId, status) {
    setUpdating(scheduleId)
    const supabase = createClient()
    const { error: updateError } = await supabase.rpc('update_assigned_journey_status', {
      p_schedule_id: scheduleId,
      p_status: status,
      p_note: null,
    })
    setUpdating('')
    if (updateError) {
      toast.error(`Status perjalanan gagal diperbarui: ${updateError.message}`)
      return
    }
    toast.success('Status perjalanan berhasil diperbarui.')
    setJourneys(current => current.map(journey => journey.schedule_id === scheduleId
      ? { ...journey, schedules: { ...journey.schedules, status } }
      : journey))
  }

  const ticketTotal = journeys.reduce((total, journey) => total + journey.tickets.length, 0)
  const validatedTotal = journeys.reduce((total, journey) => total + journey.tickets.filter(ticket => ticket.is_validated).length, 0)
  const scheduleIds = useMemo(() => journeys.map(journey => journey.schedule_id), [journeys])

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2.5rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <span className="rh-badge rh-badge-primary">Area operasional</span>
          <h1 className="rh-h2" style={{ marginTop: '0.5rem' }}>Dashboard petugas</h1>
          <p style={{ color: 'var(--rh-text-2)', margin: '0.25rem 0 1.5rem' }}>
            Hanya perjalanan yang ditugaskan kepada akun Anda yang ditampilkan.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Perjalanan tugas', value: journeys.length, icon: Train },
              { label: 'Total tiket', value: ticketTotal, icon: TicketCheck },
              { label: 'Tervalidasi', value: validatedTotal, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <article key={label} className="rh-card">
                <div className="rh-card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="rh-logo-mark"><Icon size={18} /></div>
                  <div><small style={{ color: 'var(--rh-text-2)' }}>{label}</small><strong style={{ display: 'block', fontSize: '1.4rem' }}>{value}</strong></div>
                </div>
              </article>
            ))}
          </div>

          <section id="ticket-validation" className="rh-card" style={{ marginBottom: '1.5rem', scrollMarginTop: 96 }}>
            <div className="rh-card-header">
              <h2 className="rh-h4">Validasi tiket</h2>
              <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>
                Masukkan nomor tiket. QR digital pada tahap ini dapat divalidasi dengan input manual.
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
            <h2 className="rh-h3" style={{ marginBottom: '0.75rem' }}>Perjalanan yang ditugaskan</h2>
            {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)' }}>{error}</div>}
            {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>Memuat daftar penugasan...</div>}
            {!loading && !error && journeys.length === 0 && (
              <div className="rh-card" style={{ padding: '1.5rem', color: 'var(--rh-text-2)' }}>
                Belum ada jadwal yang ditugaskan. Hubungi administrator untuk penugasan.
              </div>
            )}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {journeys.map(journey => {
                const schedule = journey.schedules
                const currentStatus = journey.latestUpdate?.status || schedule?.status || 'scheduled'
                return (
                  <article key={journey.id} className="rh-card">
                    <div className="rh-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block' }}>{schedule?.trains?.name || 'Kereta'} · {schedule?.trains?.train_number || ''}</strong>
                        <span style={{ color: 'var(--rh-text-2)' }}>{schedule?.routes?.name || 'Rute perjalanan'}</span>
                        {schedule?.departure_time && <small style={{ display: 'block', color: 'var(--rh-text-3)', marginTop: '0.35rem' }}>
                          <CalendarDays size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{formatDate(schedule.departure_time)} · {formatTime(schedule.departure_time)}
                        </small>}
                        <small style={{ display: 'block', marginTop: '0.35rem' }}>
                          <TicketCheck size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {journey.tickets.filter(ticket => ticket.is_validated).length}/{journey.tickets.length} tiket tervalidasi
                        </small>
                      </div>
                      <label className="rh-input-group" style={{ minWidth: 190 }}>
                        <span className="rh-label-text">Status perjalanan</span>
                        <select
                          className="rh-input"
                          value={currentStatus}
                          disabled={updating === journey.schedule_id}
                          onChange={event => updateJourney(journey.schedule_id, event.target.value)}
                        >
                          {JOURNEY_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        {updating === journey.schedule_id && <small><Clock3 size={12} /> Menyimpan...</small>}
                      </label>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
          {scheduleIds.length > 0 && <StaffServiceDesk scheduleIds={scheduleIds} />}
        </div>
      </main>
    </>
  )
}
