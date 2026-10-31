import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import BookingPayment from '@/components/booking/BookingPayment'

async function PaymentPageContent({ params }) {
  const { bookingId } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)) {
    notFound()
  }

  return <BookingPayment bookingId={bookingId} />
}

export default function PaymentPage({ params }) {
  return (
    <Suspense fallback={<main className="rh-container" style={{ padding: '4rem 1.5rem' }}>Memuat pembayaran...</main>}>
      <PaymentPageContent params={params} />
    </Suspense>
  )
}
