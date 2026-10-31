'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatIDR } from '@/lib/utils/formatters'

export default function BookingPayment({ bookingId }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [tickets, setTickets] = useState([])
  const [qrCodes, setQrCodes] = useState({})
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (authLoading || user) return
    const next = `/booking/payment/${bookingId}`
    router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
  }, [authLoading, user, router, bookingId])

  useEffect(() => {
    if (!user) return
    let active = true
    const supabase = createClient()

    async function loadBooking() {
      setError('')
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('id, booking_code, schedule_id, total_amount, status, expires_at')
        .eq('id', bookingId)
        .single()

      if (bookingError) {
        if (active) setError(`Booking tidak ditemukan atau tidak dapat diakses: ${bookingError.message}`)
        return
      }

      const [paymentResult, ticketResult] = await Promise.all([
        supabase.from('payments').select('status, method, confirmed_at').eq('booking_id', bookingId).maybeSingle(),
        supabase.from('tickets').select('ticket_number, passenger_id, seat_id, passengers(full_name), seats(seat_number)').eq('booking_id', bookingId),
      ])

      if (!active) return
      if (paymentResult.error || ticketResult.error) {
        setError(`Detail pembayaran atau tiket tidak dapat dimuat: ${paymentResult.error?.message || ticketResult.error?.message}`)
        return
      }

      setBooking(bookingData)
      setPayment(paymentResult.data)
      setTickets(ticketResult.data || [])
    }

    loadBooking()
    return () => { active = false }
  }, [user, bookingId, reloadKey])

  useEffect(() => {
    let active = true

    async function createTicketCodes() {
      if (tickets.length === 0) return
      const entries = await Promise.all(tickets.map(async ticket => [
        ticket.ticket_number,
        await QRCode.toDataURL(ticket.ticket_number, { width: 180, margin: 1 }),
      ]))
      if (active) setQrCodes(Object.fromEntries(entries))
    }

    createTicketCodes().catch(error => {
      if (active) setError(`QR tiket gagal dibuat: ${error.message}`)
    })

    return () => { active = false }
  }, [tickets])

  async function confirmPayment() {
    if (!booking || !payment || processing) return
    setProcessing(true)
    const supabase = createClient()
    const { error: paymentError } = await supabase.rpc('simulate_booking_payment', {
      p_booking_id: booking.id,
    })

    if (paymentError) {
      setProcessing(false)
      toast.error(`Pembayaran simulasi gagal: ${paymentError.message}`)
      return
    }

    toast.success('Pembayaran simulasi berhasil. Tiket digital telah diterbitkan.')
    setProcessing(false)
    setReloadKey(key => key + 1)
  }

  async function cancelBooking() {
    if (!booking || processing) return
    if (!window.confirm('Batalkan booking ini? Kursi yang ditahan akan dilepas.')) return
    setProcessing(true)
    const supabase = createClient()
    const { error: cancelError } = await supabase.rpc('cancel_own_pending_booking', {
      p_booking_id: booking.id,
    })
    if (cancelError) {
      setProcessing(false)
      toast.error(`Booking tidak dapat dibatalkan: ${cancelError.message}`)
      return
    }
    toast.success('Booking dibatalkan dan kursi dilepas.')
    router.push('/dashboard/passenger')
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2.5rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container" style={{ maxWidth: 860 }}>
          <Link href="/dashboard/passenger" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Dashboard penumpang
          </Link>
          <h1 className="rh-h2" style={{ marginBottom: '1.25rem' }}>Pembayaran dan tiket</h1>

          {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)' }}>{error}</div>}
          {!booking && !error && <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>Memuat booking...</div>}

          {booking && (
            <>
              <section className="rh-card" style={{ marginBottom: '1rem' }}>
                <div className="rh-card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>Kode booking</span>
                    <strong className="rh-mono" style={{ display: 'block', fontSize: '1.15rem' }}>{booking.booking_code}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>Total simulasi</span>
                    <strong style={{ display: 'block', color: 'var(--rh-primary)', fontSize: '1.25rem' }}>{formatIDR(booking.total_amount)}</strong>
                  </div>
                </div>
              </section>

              {booking.status === 'pending' && payment?.status === 'pending' && (
                <section className="rh-card" style={{ marginBottom: '1rem' }}>
                  <div className="rh-card-body">
                    <h2 className="rh-h4">Konfirmasi pembayaran simulasi</h2>
                    <p style={{ color: 'var(--rh-text-2)', margin: '0.5rem 0 1rem' }}>
                      Tidak ada uang sungguhan yang diproses. Konfirmasi akan dicatat di database dan menerbitkan tiket.
                    </p>
                    <p style={{ color: 'var(--rh-warning)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <Clock3 size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                      Batas pembayaran: {new Date(booking.expires_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <button className="rh-btn rh-btn-primary" type="button" onClick={confirmPayment} disabled={processing}>
                        {processing && <LoaderCircle size={16} className="rh-spin" />}
                        {processing ? 'Memproses...' : 'Konfirmasi pembayaran simulasi'}
                      </button>
                      <button className="rh-btn rh-btn-ghost" type="button" onClick={cancelBooking} disabled={processing}>
                        Batalkan booking
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {booking.status === 'paid' && (
                <section className="rh-card" style={{ marginBottom: '1rem' }}>
                  <div className="rh-card-body">
                    <h2 className="rh-h4" style={{ color: 'var(--rh-success)' }}>
                      <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Pembayaran dikonfirmasi
                    </h2>
                    <p style={{ color: 'var(--rh-text-2)', marginTop: '0.4rem' }}>Pembayaran simulasi berhasil dan tiket telah diterbitkan.</p>
                  </div>
                </section>
              )}

              {booking.status !== 'pending' && booking.status !== 'paid' && (
                <section className="rh-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                  Status booking: <strong>{booking.status}</strong>. Silakan buat booking baru bila masih ingin melakukan perjalanan.
                </section>
              )}

              {tickets.length > 0 && (
                <section>
                  <h2 className="rh-h3" style={{ marginBottom: '1rem' }}>Tiket digital</h2>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {tickets.map(ticket => (
                      <article key={ticket.ticket_number} className="rh-card">
                        <div className="rh-card-body" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          {qrCodes[ticket.ticket_number]
                            ? <Image src={qrCodes[ticket.ticket_number]} alt={`QR tiket ${ticket.ticket_number}`} width={120} height={120} unoptimized />
                            : <div aria-label="Membuat QR tiket" style={{ width: 120, height: 120, display: 'grid', placeItems: 'center' }}><Ticket size={24} /></div>}
                          <div>
                            <span style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>Nomor tiket</span>
                            <strong className="rh-mono" style={{ display: 'block' }}>{ticket.ticket_number}</strong>
                            <span style={{ display: 'block', marginTop: '0.5rem' }}>{ticket.passengers?.full_name || 'Penumpang simulasi'}</span>
                            <span style={{ color: 'var(--rh-text-2)' }}>Kursi {ticket.seats?.seat_number || '—'}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
