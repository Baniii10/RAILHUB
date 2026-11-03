'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock3, RefreshCw, Train } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getJourneyStatusLabel } from '@/lib/operations/journey-status'
import { formatDate, formatTime } from '@/lib/utils/formatters'

const STATUS_COLORS = {
  scheduled: ['var(--rh-info-light)', 'var(--rh-info)'],
  boarding: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  departed: ['var(--rh-primary-light)', 'var(--rh-primary)'],
  arrived: ['var(--rh-success-light)', 'var(--rh-success)'],
  delayed: ['var(--rh-warning-light)', 'var(--rh-warning)'],
  cancelled: ['var(--rh-danger-light)', 'var(--rh-danger)'],
}

export default function JourneyStatusTimeline({ scheduleId }) {
  const [schedule, setSchedule] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function refreshStatus() {
      const [scheduleResult, updateResult] = await Promise.all([
        supabase.from('schedules').select('status, updated_at').eq('id', scheduleId).single(),
        supabase.from('journey_updates').select('id, status, note, created_at').eq('schedule_id', scheduleId).order('created_at', { ascending: false }).limit(5),
      ])
      if (!active) return
      if (scheduleResult.error || updateResult.error) {
        setError(`Status perjalanan tidak dapat dimuat: ${scheduleResult.error?.message || updateResult.error?.message}`)
        setLoading(false)
        return
      }
      setSchedule(scheduleResult.data)
      setUpdates(updateResult.data || [])
      setError('')
      setLoading(false)
    }

    refreshStatus()
    const timer = window.setInterval(refreshStatus, 30000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [scheduleId, reloadKey])

  if (loading) {
    return <div aria-live="polite" className="rh-card" style={{ padding: '1rem', marginBottom: '1rem' }}>Memuat status perjalanan...</div>
  }

  return (
    <section aria-labelledby="journey-status-title" className="rh-card" style={{ marginBottom: '1rem' }}>
      <div className="rh-card-header">
        <h2 id="journey-status-title" className="rh-h4"><Train size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Status perjalanan</h2>
        <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Pembaruan staff dan admin diperiksa otomatis setiap 30 detik.</p>
      </div>
      <div className="rh-card-body">
        {error && <div role="alert" style={{ display: 'flex', alignItems: 'start', gap: 8, color: 'var(--rh-danger)' }}><AlertCircle size={17} />{error}</div>}
        {!error && schedule && (
          <div aria-live="polite" aria-atomic="true">
            {(() => {
              const [background, color] = STATUS_COLORS[schedule.status] || ['var(--rh-surface-2)', 'var(--rh-text-2)']
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
                  <strong>Status saat ini:</strong>
                  <span style={{ borderRadius: 999, padding: '0.25rem 0.7rem', background, color, fontSize: '0.82rem', fontWeight: 700 }}>
                    {getJourneyStatusLabel(schedule.status)}
                  </span>
                  {schedule.updated_at && <small style={{ color: 'var(--rh-text-2)' }}>Diperbarui {formatDate(schedule.updated_at)} · {formatTime(schedule.updated_at)}</small>}
                </div>
              )
            })()}
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>Riwayat informasi perjalanan</h3>
            {updates.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--rh-text-2)' }}>Belum ada catatan operasional tambahan.</p>
            ) : (
              <ol style={{ display: 'grid', gap: '0.65rem', listStyle: 'none', margin: 0, padding: 0 }}>
                {updates.map(update => (
                  <li key={update.id} style={{ borderLeft: '2px solid var(--rh-border)', paddingLeft: '0.8rem' }}>
                    <strong style={{ display: 'block' }}>{getJourneyStatusLabel(update.status)}</strong>
                    <small style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--rh-text-2)' }}>
                      <Clock3 size={12} />{formatDate(update.created_at)} · {formatTime(update.created_at)}
                    </small>
                    {update.note && <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{update.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
        {error && (
          <button type="button" className="rh-btn rh-btn-ghost rh-btn-sm" onClick={() => { setLoading(true); setError(''); setReloadKey(key => key + 1) }}>
            <RefreshCw size={14} /> Coba lagi
          </button>
        )}
      </div>
    </section>
  )
}
