'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import StaffServiceDesk from '@/components/services/StaffServiceDesk'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function PassengerReportsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [scheduleIds, setScheduleIds] = useState(null)
  const [error, setError] = useState('')
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Freports')
    } else if (profile?.staff_type === 'gate') {
      router.replace('/dashboard/staff')
    } else if (profile?.role && profile.role !== 'admin' && profile.role !== 'conductor') {
      router.replace(profile.role === 'passenger' ? '/dashboard/passenger' : '/auth/login')
    }
  }, [authLoading, profile?.role, profile?.staff_type, router, user])

  useEffect(() => {
    if (profile?.role === 'admin') return
    if (!user || profile?.role !== 'conductor') return

    let active = true
    async function loadAssignedSchedules() {
      const supabase = createClient()
      const { data, error: assignmentError } = await supabase
        .from('staff_assignments')
        .select('schedule_id')
        .eq('staff_id', user.id)
      if (!active) return
      if (assignmentError) {
        setError(`Perjalanan tugas untuk laporan tidak dapat dimuat: ${assignmentError.message}`)
        setScheduleIds([])
        return
      }
      setScheduleIds((data || []).map(assignment => assignment.schedule_id))
    }
    loadAssignedSchedules()
    return () => {
      active = false
    }
  }, [profile?.role, user])

  const dashboardHref = profile?.role === 'conductor' ? '/dashboard/staff' : '/dashboard/admin'

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <section className="rh-card">
            <div className="rh-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <a href={dashboardHref} className="rh-back-btn" aria-label="Kembali ke dashboard" title="Kembali ke dashboard">
                  <ArrowLeft size={18} />
                </a>
                <div>
                  <span className="rh-badge rh-badge-primary">Layanan penumpang</span>
                  <h1 className="rh-h2" style={{ margin: '0.2rem 0 0' }}><ClipboardList size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Laporan bantuan dan barang hilang</h1>
                </div>
              </div>
            </div>
            <div className="rh-card-body">
              {error && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)', marginBottom: '1rem' }}>{error}</div>}
              {scheduleIds === null && !isAdmin
                ? <div aria-live="polite" className="rh-card" style={{ padding: '1rem' }}>Memuat perjalanan tugas…</div>
                : scheduleIds?.length === 0 && !isAdmin
                  ? <div className="rh-card" style={{ padding: '1rem', color: 'var(--rh-text-2)' }}>Belum ada perjalanan yang ditugaskan, jadi laporan terkait belum tersedia.</div>
                  : <StaffServiceDesk scheduleIds={scheduleIds || []} isAdmin={isAdmin} showOrders={false} />}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
