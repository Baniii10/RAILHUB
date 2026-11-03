import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SearchWidget from '@/components/booking/SearchWidget'
import TrainSearchResults from '@/components/booking/TrainSearchResults'

export const metadata = {
  title: 'Jadwal & Tiket Kereta Api | RailHub',
  description: 'Pencarian jadwal dan pemesanan tiket kereta api resmi.',
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

async function TrainsPageContent({ searchParams }) {
  const params = await searchParams
  const origin = (firstValue(params?.from) || firstValue(params?.origin) || '').trim().toUpperCase()
  const destination = (firstValue(params?.to) || firstValue(params?.destination) || '').trim().toUpperCase()
  const date = (firstValue(params?.date) || '').trim()
  const passengerValue = Number(firstValue(params?.pax) || firstValue(params?.passengers) || 1)

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
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <Link href="/" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ marginBottom: '1.25rem' }}>
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
            <section className="rh-card" style={{ maxWidth: 640, margin: '1.5rem auto', textAlign: 'center' }}>
              <div className="rh-card-body" style={{ padding: '2.5rem 1.75rem' }}>
                <Search size={32} style={{ color: 'var(--rh-primary)', margin: '0 auto 1rem' }} />
                <h1 className="rh-h3" style={{ margin: '0 0 0.5rem' }}>Pencarian Tiket Kereta Api</h1>
                <p style={{ color: 'var(--rh-text-2)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                  Silakan pilih stasiun asal, stasiun tujuan, dan tanggal keberangkatan yang diinginkan.
                </p>
                <div style={{ textAlign: 'left' }}>
                  <SearchWidget />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
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
