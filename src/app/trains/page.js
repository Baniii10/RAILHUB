import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import TrainSearchResults from '@/components/booking/TrainSearchResults'

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

async function TrainsPageContent({ searchParams }) {
  const params = await searchParams
  const origin = firstValue(params.from) || ''
  const destination = firstValue(params.to) || ''
  const date = firstValue(params.date) || ''
  const passengerValue = Number(firstValue(params.pax) || 1)
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(`${date}T00:00:00Z`))
    && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date
  const validSearch = /^[A-Za-z0-9_-]{1,10}$/.test(origin)
    && /^[A-Za-z0-9_-]{1,10}$/.test(destination)
    && origin !== destination
    && validDate
    && Number.isInteger(passengerValue)
    && passengerValue >= 1
    && passengerValue <= 6

  return (
    <main style={{ minHeight: '100vh', padding: '3rem 0 5rem', background: 'var(--rh-surface)' }}>
      <div className="rh-container">
        <Link href="/" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Kembali ke beranda
        </Link>
        {validSearch ? (
          <TrainSearchResults
            origin={origin}
            destination={destination}
            date={date}
            passengers={passengerValue}
          />
        ) : (
          <section className="rh-card" style={{ maxWidth: 620, margin: '2rem auto', textAlign: 'center' }}>
            <div className="rh-card-body" style={{ padding: '3rem 2rem' }}>
              <Search size={30} style={{ color: 'var(--rh-primary)', marginBottom: '1rem' }} />
              <h1 className="rh-h3">Lengkapi pencarian perjalanan</h1>
              <p style={{ color: 'var(--rh-text-2)', margin: '0.75rem 0 1.5rem' }}>
                Pilih stasiun asal dan tujuan yang berbeda, tanggal keberangkatan, serta 1–6 penumpang.
              </p>
              <Link href="/" className="rh-btn rh-btn-primary">Cari jadwal kereta</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default function TrainsPage({ searchParams }) {
  return (
    <Suspense fallback={
      <main className="rh-container" style={{ minHeight: '100vh', padding: '4rem 1.5rem' }}>
        <div className="rh-card" style={{ padding: '2rem', color: 'var(--rh-text-2)' }}>
          Memuat pencarian kereta...
        </div>
      </main>
    }>
      <TrainsPageContent searchParams={searchParams} />
    </Suspense>
  )
}
