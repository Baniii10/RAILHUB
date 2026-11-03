import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import BookingFlow from '@/components/booking/BookingFlow'

async function BookingPageContent({ params, searchParams }) {
  const { scheduleId } = await params
  const query = await searchParams

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scheduleId)) {
    notFound()
  }

  const requestedClass = Array.isArray(query.class) ? query.class[0] : query.class
  const passengerValue = Number(Array.isArray(query.pax) ? query.pax[0] : query.pax || 1)
  const passengerCount = Number.isInteger(passengerValue) && passengerValue >= 1 && passengerValue <= 6
    ? passengerValue
    : 1
  const origin = Array.isArray(query.from) ? query.from[0] : query.from
  const destination = Array.isArray(query.to) ? query.to[0] : query.to
  const departureDate = Array.isArray(query.date) ? query.date[0] : query.date
  const validSearchContext = /^[A-Za-z0-9_-]{1,10}$/.test(origin || '')
    && /^[A-Za-z0-9_-]{1,10}$/.test(destination || '')
    && origin !== destination
    && /^\d{4}-\d{2}-\d{2}$/.test(departureDate || '')
    && !Number.isNaN(Date.parse(`${departureDate}T00:00:00Z`))
    && new Date(`${departureDate}T00:00:00Z`).toISOString().slice(0, 10) === departureDate
  const returnTo = validSearchContext
    ? `/trains?${new URLSearchParams({
      from: origin,
      to: destination,
      date: departureDate,
      pax: String(passengerCount),
    }).toString()}`
    : '/trains'

  return <BookingFlow
    scheduleId={scheduleId}
    requestedClass={requestedClass || ''}
    passengerCount={passengerCount}
    returnTo={returnTo}
  />
}

export default function BookingPage({ params, searchParams }) {
  return (
    <Suspense fallback={<main className="rh-container" style={{ padding: '4rem 1.5rem' }}>Memuat pemesanan...</main>}>
      <BookingPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
