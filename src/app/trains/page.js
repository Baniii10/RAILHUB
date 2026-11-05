import { Suspense } from 'react'
import TrainSearchResults from '@/components/booking/TrainSearchResults'
import TrainsPageChrome from '@/components/booking/TrainsPageChrome'

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
  const returnDate = (firstValue(params?.returnDate) || '').trim()
  const passengerValue = Number(firstValue(params?.pax) || firstValue(params?.passengers) || 1)

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(`${date}T00:00:00Z`))
    && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date

  const validReturnDate = /^\d{4}-\d{2}-\d{2}$/.test(returnDate)
    && !Number.isNaN(Date.parse(`${returnDate}T00:00:00Z`))
    && new Date(`${returnDate}T00:00:00Z`).toISOString().slice(0, 10) === returnDate

  const validSearch = /^[A-Za-z0-9_-]{1,10}$/.test(origin)
    && /^[A-Za-z0-9_-]{1,10}$/.test(destination)
    && origin !== destination
    && validDate
    && Number.isInteger(passengerValue)
    && passengerValue >= 1
    && passengerValue <= 6

  return (
    <TrainsPageChrome empty={!validSearch}>
      {validSearch && (
        <TrainSearchResults
          origin={origin}
          destination={destination}
          date={date}
          returnDate={validReturnDate ? returnDate : null}
          passengers={passengerValue}
        />
      )}
    </TrainsPageChrome>
  )
}

export default function TrainsPage({ searchParams }) {
  return (
    <Suspense fallback={
      <main className="rh-container" style={{ minHeight: '100vh', padding: '4rem 1.5rem' }}>
        <div className="rh-card" style={{ padding: '2rem', color: 'var(--rh-text-2)' }}>
          Memuat pencarian kereta…
        </div>
      </main>
    }>
      <TrainsPageContent searchParams={searchParams} />
    </Suspense>
  )
}
