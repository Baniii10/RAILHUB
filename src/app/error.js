'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({ reset }) {
  return <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: 'var(--rh-surface)' }}>
    <section className="rh-card" style={{ maxWidth: 480, padding: '2rem', textAlign: 'center' }}>
      <AlertTriangle size={38} color="var(--rh-danger)" />
      <h1 className="rh-h3" style={{ marginTop: '1rem' }}>Halaman gagal dimuat</h1>
      <p style={{ color: 'var(--rh-text-2)' }}>Data Anda tetap aman. Muat ulang bagian ini untuk melanjutkan.</p>
      <button type="button" className="rh-btn rh-btn-primary" onClick={reset}>
        <RefreshCw size={16} /> Coba lagi
      </button>
    </section>
  </main>
}
