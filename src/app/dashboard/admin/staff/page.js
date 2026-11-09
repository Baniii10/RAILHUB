'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminStaffRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/admin?tab=staff')
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--rh-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>Mengalihkan ke Manajemen Petugas &amp; Akun Cepat...</p>
    </div>
  )
}
