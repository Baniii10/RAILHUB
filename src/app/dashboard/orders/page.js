'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Utensils } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import StaffServiceDesk from '@/components/services/StaffServiceDesk'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function FoodOrdersPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [previewMode, setPreviewMode] = useState(false)
  const [scheduleIds, setScheduleIds] = useState(null)
  const [error, setError] = useState('')
  const isAdmin = profile?.role === 'admin' || previewMode

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get('preview') === '1'
    if (preview) {
      const timer = window.setTimeout(() => setPreviewMode(true), 0)
      return () => window.clearTimeout(timer)
    }
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Forders')
    } else if (profile?.role && profile.role !== 'admin' && profile.role !== 'conductor') {
      router.replace('/dashboard/passenger')
    }
  }, [authLoading, profile?.role, router, user])

  useEffect(() => {
    if (previewMode || profile?.role === 'admin') return
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
        setError(`Perjalanan tugas untuk pesanan tidak dapat dimuat: ${assignmentError.message}`)
        setScheduleIds([])
        return
      }
      setScheduleIds((data || []).map(assignment => assignment.schedule_id))
    }
    loadAssignedSchedules()
    return () => {
      active = false
    }
  }, [previewMode, profile?.role, user])

  const dashboardHref = profile?.role === 'conductor' ? '/dashboard/staff' : '/dashboard/admin'

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          {previewMode && (
            <div role="status" className="rh-card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', borderColor: 'var(--rh-primary)', color: 'var(--rh-text-2)' }}>
              <strong>Mode preview</strong> — data contoh saja. Perubahan dan tindakan admin dinonaktifkan.
            </div>
          )}
          <div style={{ marginBottom: '1.25rem' }}>
            <a href={dashboardHref} className="rh-btn rh-btn-ghost rh-btn-sm"><ArrowLeft size={15} />Kembali ke dashboard</a>
          </div>
          <section className="rh-card">
            <div className="rh-card-header">
              <span className="rh-badge rh-badge-primary">Layanan penumpang</span>
              <h1 className="rh-h2" style={{ marginTop: '0.6rem' }}><Utensils size={23} style={{ verticalAlign: 'middle', marginRight: 8 }} />Pesanan makanan</h1>
              <p style={{ color: 'var(--rh-text-2)', marginTop: '0.35rem' }}>
                {isAdmin ? 'Tinjau dan kelola pesanan makanan penumpang.' : 'Pesanan hanya ditampilkan untuk perjalanan yang ditugaskan kepada Anda.'}
              </p>
            </div>
            <div className="rh-card-body">
              {error && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)', marginBottom: '1rem' }}>{error}</div>}
              {scheduleIds === null && !isAdmin
                ? <div aria-live="polite" className="rh-card" style={{ padding: '1rem' }}>Memuat perjalanan tugas...</div>
                : scheduleIds?.length === 0 && !isAdmin
                  ? <div className="rh-card" style={{ padding: '1rem', color: 'var(--rh-text-2)' }}>Belum ada perjalanan yang ditugaskan, jadi pesanan makanan belum tersedia.</div>
                  : <StaffServiceDesk scheduleIds={scheduleIds || []} isAdmin={isAdmin} showReports={false} />}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
