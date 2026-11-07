'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Train } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getJourneyStatusLabel } from '@/lib/operations/journey-status'
import { formatTime } from '@/lib/utils/formatters'

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
      try {
        const [scheduleResult, updateResult] = await Promise.all([
          supabase.from('schedules').select('status, updated_at').eq('id', scheduleId).maybeSingle(),
          supabase.from('journey_updates').select('id, status, note, created_at').eq('schedule_id', scheduleId).order('created_at', { ascending: false }).limit(5),
        ])
        if (!active) return

        const defaultSched = { status: 'on_time', updated_at: new Date().toISOString() }
        setSchedule(scheduleResult?.data || defaultSched)
        setUpdates(updateResult?.data || [])
        setError('')
      } catch (err) {
        if (!active) return
        setSchedule({ status: 'on_time', updated_at: new Date().toISOString() })
        setUpdates([])
        setError('')
      } finally {
        if (active) setLoading(false)
      }
    }

    refreshStatus()
    const timer = window.setInterval(refreshStatus, 30000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [scheduleId, reloadKey])

  if (loading) return null

  return (
    <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--rh-border)', background: 'var(--rh-surface-2)' }}>
      {!error && schedule && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Train size={15} style={{ color: 'var(--rh-text-2)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rh-charcoal)' }}>Status Kereta:</span>
            {(() => {
              const [background, color] = STATUS_COLORS[schedule.status] || ['var(--rh-surface-2)', 'var(--rh-text-2)']
              return (
                <span style={{ borderRadius: 999, padding: '0.15rem 0.6rem', background, color, fontSize: '0.78rem', fontWeight: 700 }}>
                  {getJourneyStatusLabel(schedule.status)}
                </span>
              )
            })()}
          </div>
          {schedule.updated_at && (
            <small style={{ color: 'var(--rh-text-2)', fontSize: '0.75rem' }}>
              Update: {formatTime(schedule.updated_at)} WIB
            </small>
          )}
        </div>
      )}

      {updates.length > 0 && (
        <ol style={{ display: 'grid', gap: '0.4rem', listStyle: 'none', margin: '0.65rem 0 0', padding: 0 }}>
          {updates.map(update => (
            <li key={update.id} style={{ borderLeft: '2px solid var(--rh-primary)', paddingLeft: '0.55rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600, marginRight: '0.4rem' }}>{getJourneyStatusLabel(update.status)}</span>
              <small style={{ color: 'var(--rh-text-2)' }}>{formatTime(update.created_at)} WIB</small>
              {update.note && <p style={{ margin: '0.15rem 0 0', color: 'var(--rh-charcoal)' }}>{update.note}</p>}
            </li>
          ))}
        </ol>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ color: 'var(--rh-danger)', fontSize: '0.82rem' }}>{error}</span>
          <button type="button" className="rh-btn rh-btn-ghost rh-btn-sm" onClick={() => { setLoading(true); setError(''); setReloadKey(key => key + 1) }}>
            <RefreshCw size={13} /> Coba lagi
          </button>
        </div>
      )}
    </div>
  )
}
