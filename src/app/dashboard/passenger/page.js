'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CalendarDays, Clock3, Compass, Ticket, Train, Utensils, Wallet } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'
import PassengerServices from '@/components/services/PassengerServices'
import SearchWidget from '@/components/booking/SearchWidget'

export default function PassengerDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState({})
  const [ticketCounts, setTicketCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fpassenger')
      return
    }
    if (profile?.role && profile.role !== 'passenger') {
      const target = profile.role === 'admin'
        ? '/dashboard/admin'
        : profile.role === 'conductor' ? '/dashboard/staff' : '/'
      router.replace(target)
    }
  }, [authLoading, user, profile, router])

  useEffect(() => {
    if (!user) return
    let active = true
    const supabase = createClient()

    async function loadDashboard() {
      const { data: bookingRows, error: bookingError } = await supabase
        .from('bookings')
        .select('id, booking_code, schedule_id, total_amount, status, expires_at, created_at, schedules(departure_time, arrival_time, trains(name, train_number), routes(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return
      if (bookingError) {
        setError(`Riwayat booking tidak dapat dimuat: ${bookingError.message}`)
        setLoading(false)
        return
      }

      const ids = (bookingRows || []).map(booking => booking.id)
      if (ids.length === 0) {
        setBookings([])
        setPayments({})
        setTicketCounts({})
        setLoading(false)
        return
      }

      const [paymentResult, ticketResult] = await Promise.all([
        supabase.from('payments').select('booking_id, status, method').in('booking_id', ids),
        supabase.from('tickets').select('booking_id, ticket_number').in('booking_id', ids),
      ])

      if (!active) return
      if (paymentResult.error || ticketResult.error) {
        setError(`Ringkasan tiket tidak dapat dimuat: ${paymentResult.error?.message || ticketResult.error?.message}`)
        setLoading(false)
        return
      }

      setBookings(bookingRows || [])
      setPayments(Object.fromEntries((paymentResult.data || []).map(payment => [payment.booking_id, payment])))
      setTicketCounts((ticketResult.data || []).reduce((counts, ticket) => {
        counts[ticket.booking_id] = (counts[ticket.booking_id] || 0) + 1
        return counts
      }, {}))
      setLoading(false)
    }

    loadDashboard()
    return () => { active = false }
  }, [user])

  const paidBookings = bookings.filter(booking => booking.status === 'paid').length

  return (
    <>
      <Navbar />
      <main className="passenger-dashboard">
        <section className="passenger-welcome">
          <div className="rh-container passenger-welcome-inner">
            <div className="passenger-welcome-copy">
              <span className="passenger-eyebrow"><Train size={15} /> RUANG PERJALANAN RAILHUB</span>
              <h1>Halo, {profile?.full_name?.trim().toLowerCase() === 'penumpang' ? 'Penumpang' : profile?.full_name?.split(' ')[0] || 'Penumpang'}</h1>
              <p>Rencanakan perjalanan, kelola tiket, dan nikmati perjalanan Anda dari satu tempat.</p>
              <a className="passenger-welcome-link" href="#my-bookings">Lihat perjalanan saya <ArrowRight size={16} /></a>
            </div>
            <div className="passenger-welcome-mark" aria-hidden="true">
              <div className="passenger-orbit passenger-orbit-one" />
              <div className="passenger-orbit passenger-orbit-two" />
              <div className="passenger-train-icon"><Train size={46} strokeWidth={1.5} /></div>
              <span className="passenger-route-dot passenger-route-dot-start" />
              <span className="passenger-route-dot passenger-route-dot-end" />
            </div>
          </div>
        </section>

        <div className="rh-container passenger-dashboard-content">
          <section className="passenger-search-panel" aria-labelledby="passenger-search-title">
            <div className="passenger-section-heading">
              <div>
                <span className="passenger-section-kicker">MULAI PETUALANGAN</span>
                <h2 id="passenger-search-title">Mau pergi ke mana?</h2>
              </div>
              <span className="passenger-search-decoration"><Compass size={23} /></span>
            </div>
            <SearchWidget />
          </section>

          <nav className="passenger-shortcuts" aria-label="Akses cepat">
            <a href="#my-bookings" className="passenger-shortcut">
              <span className="passenger-shortcut-icon passenger-shortcut-blue"><Ticket size={20} /></span>
              <span><strong>Tiket saya</strong><small>Lihat booking</small></span>
              <ArrowRight size={16} />
            </a>
            <a href="#journey-services" className="passenger-shortcut">
              <span className="passenger-shortcut-icon passenger-shortcut-gold"><Utensils size={20} /></span>
              <span><strong>Layanan kereta</strong><small>Makanan & bantuan</small></span>
              <ArrowRight size={16} />
            </a>
          </nav>

          <section className="passenger-bookings-section" id="my-bookings">
            <div className="passenger-bookings-heading">
              <div>
                <span className="passenger-section-kicker">PERJALANAN ANDA</span>
                <h2>Booking saya</h2>
              </div>
              <div className="passenger-booking-count">
                <span>{bookings.length}</span> booking
              </div>
            </div>
            <div className="passenger-summary-row">
              <div className="passenger-summary-card">
                <span className="passenger-summary-icon"><CalendarDays size={18} /></span>
                <span><small>Booking terbayar</small><strong>{paidBookings}</strong></span>
              </div>
              <div className="passenger-summary-card">
                <span className="passenger-summary-icon passenger-summary-icon-soft"><Ticket size={18} /></span>
                <span><small>Total booking</small><strong>{bookings.length}</strong></span>
              </div>
            </div>
            {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)' }}>{error}</div>}
            {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>Memuat data booking...</div>}
            {!loading && !error && bookings.length === 0 && (
              <div className="passenger-empty-state">
                <div className="passenger-empty-icon"><Train size={28} /></div>
                <h3>Belum ada perjalanan</h3>
                <p>Temukan jadwal yang cocok dan pesan tiket pertama Anda.</p>
                <a href="#passenger-search-title" className="rh-btn rh-btn-primary">Cari perjalanan <ArrowRight size={16} /></a>
              </div>
            )}
            <div className="passenger-booking-list">
              {bookings.map(booking => {
                const schedule = booking.schedules
                const payment = payments[booking.id]
                const isPayable = booking.status === 'pending' && payment?.status === 'pending'
                return (
                  <article key={booking.id} className="passenger-booking-card">
                    <div className="passenger-booking-topline">
                      <span className="passenger-booking-code">{booking.booking_code}</span>
                      <span className={`passenger-status passenger-status-${booking.status}`}>
                        {booking.status === 'paid' ? 'Terbayar' : booking.status === 'pending' ? 'Menunggu pembayaran' : booking.status}
                      </span>
                    </div>
                    <div className="passenger-booking-route">
                      <div className="passenger-booking-train">
                        <span className="passenger-shortcut-icon passenger-shortcut-blue"><Train size={19} /></span>
                        <div>
                          <h3>{schedule?.trains?.name || 'Perjalanan kereta'}</h3>
                          <p>{schedule?.trains?.train_number || 'Tiket perjalanan'}</p>
                        </div>
                      </div>
                      <div className="passenger-route-line" aria-hidden="true"><span /><i /><span /></div>
                      <p className="passenger-route-name">{schedule?.routes?.name || 'Rute perjalanan'}</p>
                    </div>
                    <div className="passenger-booking-details">
                      {schedule?.departure_time && <span><CalendarDays size={15} />{formatDate(schedule.departure_time)} · {formatTime(schedule.departure_time)}</span>}
                      {booking.status === 'pending' && <span><Clock3 size={15} />Batas 15 menit dari booking</span>}
                      {ticketCounts[booking.id] > 0 && <span><Ticket size={15} />{ticketCounts[booking.id]} tiket digital</span>}
                    </div>
                    <div className="passenger-booking-footer">
                      <div><small>Total perjalanan</small><strong>{formatIDR(booking.total_amount)}</strong></div>
                      {isPayable ? (
                        <Link className="rh-btn rh-btn-primary" href={`/booking/payment/${booking.id}`}><Wallet size={16} /> Bayar</Link>
                      ) : booking.status === 'paid' ? (
                        <Link className="rh-btn rh-btn-primary" href={`/booking/payment/${booking.id}`}>Lihat tiket <ArrowRight size={16} /></Link>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
          {user && profile?.role === 'passenger' && <PassengerServices userId={user.id} />}
        </div>
      </main>
    </>
  )
}
