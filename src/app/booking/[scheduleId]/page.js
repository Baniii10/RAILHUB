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

  return <BookingFlow scheduleId={scheduleId} requestedClass={requestedClass || ''} passengerCount={passengerCount} />
}

export default function BookingPage({ params, searchParams }) {
  return (
    <Suspense fallback={<main className="rh-container" style={{ padding: '4rem 1.5rem' }}>Memuat pemesanan...</main>}>
      <BookingPageContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}
