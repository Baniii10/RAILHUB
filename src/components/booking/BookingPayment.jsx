'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { ArrowLeft, Banknote, CalendarDays, CheckCircle2, Clock3, CreditCard, LoaderCircle, MapPin, RefreshCw, Smartphone, Ticket, Train } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'
import PassengerServices from '@/components/services/PassengerServices'
import JourneyStatusTimeline from '@/components/services/JourneyStatusTimeline'

const TICKET_PAYMENT_METHODS = [
  { value: 'qr_payment', label: 'QRIS', description: 'Metode pembayaran simulasi', icon: CreditCard },
  { value: 'e_wallet', label: 'E-wallet', description: 'Metode pembayaran simulasi', icon: Smartphone },
  { value: 'bank_transfer', label: 'Transfer bank', description: 'Metode pembayaran simulasi', icon: Banknote },
]

function localDateValue(value) {
  const date = new Date(value)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export default function BookingPayment({ bookingId }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [tickets, setTickets] = useState([])
  const [qrCodes, setQrCodes] = useState({})
  const [journey, setJourney] = useState(null)
  const [now, setNow] = useState(0)
  const [boardingPassOpen, setBoardingPassOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [currentFareTotal, setCurrentFareTotal] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [scheduleOptions, setScheduleOptions] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [rescheduleJourney, setRescheduleJourney] = useState(null)
  const [rescheduleSeats, setRescheduleSeats] = useState({})
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qr_payment')
  const paymentExpiresAt = booking?.expires_at ? Date.parse(booking.expires_at) : NaN
  const bookingExpired = now > 0 && Number.isFinite(paymentExpiresAt) && paymentExpiresAt <= now

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
        .select('id, booking_code, schedule_id, total_amount, status, expires_at, schedules(departure_time, arrival_time, route_id, routes(name), trains(name, train_number))')
        .eq('id', bookingId)
        .single()

      if (bookingError) {
        try {
          const simStore = JSON.parse(localStorage.getItem('railhub_simulated_bookings') || '{}')
          const sim = simStore[bookingId]
          if (sim) {
            setBooking({ ...sim, is_simulated: true })
            setPayment(sim.payment)
            setSelectedPaymentMethod(sim.payment?.method || 'qr_payment')
            setTickets(sim.tickets || [])
            setRescheduleDate(sim.schedules?.departure_time ? localDateValue(sim.schedules.departure_time) : '')
            setJourney({ schedule: sim.schedules })
            return
          }
        } catch (e) {
          console.warn('Sim load error', e)
        }
        if (active) setError(`Booking tidak ditemukan atau tidak dapat diakses: ${bookingError.message}`)
        return
      }

      const [paymentResult, ticketResult] = await Promise.all([
        supabase.from('payments')
          .select('id, status, method, confirmed_at, gateway_order_id, gateway_transaction_status, payment_url')
          .eq('booking_id', bookingId)
          .maybeSingle(),
        supabase.from('tickets').select('ticket_number, passenger_id, seat_id, passengers(full_name), seats(seat_number, carriages(carriage_class))').eq('booking_id', bookingId),
      ])

      if (!active) return
      if (paymentResult.error || ticketResult.error) {
        setError(`Detail pembayaran atau tiket tidak dapat dimuat: ${paymentResult.error?.message || ticketResult.error?.message}`)
        return
      }

      setBooking(bookingData)
      setPayment(paymentResult.data)
      setSelectedPaymentMethod(paymentResult.data?.method || 'qr_payment')
      setTickets([...(ticketResult.data || [])].sort((a, b) => (
        a.passenger_id < b.passenger_id ? -1 : a.passenger_id > b.passenger_id ? 1 : 0
      )))
      setRescheduleDate(bookingData.schedules?.departure_time ? localDateValue(bookingData.schedules.departure_time) : '')

      const { data: journeyData, error: journeyError } = await supabase.rpc('get_schedule_booking_data', {
        p_schedule_id: bookingData.schedule_id,
      })
      if (!active) return
      if (journeyError) {
        setError(`Rincian stasiun perjalanan gagal dimuat: ${journeyError.message}`)
      } else {
        setJourney(journeyData)
      }
    }

    loadBooking()
    return () => { active = false }
  }, [user, bookingId])

  useEffect(() => {
    if (!user || booking?.status !== 'pending' || !payment?.gateway_order_id) return
    let active = true
    const supabase = createClient()

    async function refreshPayment() {
      const [bookingResult, paymentResult, ticketResult] = await Promise.all([
        supabase.from('bookings')
          .select('id, booking_code, schedule_id, total_amount, status, expires_at, schedules(departure_time, arrival_time, route_id, routes(name), trains(name, train_number))')
          .eq('id', bookingId)
          .single(),
        supabase.from('payments')
          .select('id, status, method, confirmed_at, gateway_order_id, gateway_transaction_status, payment_url')
          .eq('booking_id', bookingId)
          .maybeSingle(),
        supabase.from('tickets')
          .select('ticket_number, passenger_id, seat_id, passengers(full_name), seats(seat_number, carriages(carriage_class))')
          .eq('booking_id', bookingId),
      ])
      if (!active) return
      const refreshError = bookingResult.error || paymentResult.error || ticketResult.error
      if (refreshError) {
        setError(`Status pembayaran gagal diperbarui: ${refreshError.message}`)
        return
      }
      setBooking(bookingResult.data)
      setPayment(paymentResult.data)
      setTickets([...(ticketResult.data || [])].sort((a, b) => (
        a.passenger_id < b.passenger_id ? -1 : a.passenger_id > b.passenger_id ? 1 : 0
      )))
    }

    const timer = window.setInterval(refreshPayment, 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [user, bookingId, booking?.status, payment?.gateway_order_id])

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0)
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function createTicketCodes() {
      if (tickets.length === 0) return
      const entries = await Promise.all(tickets.map(async ticket => [
        ticket.ticket_number,
        await QRCode.toDataURL(ticket.ticket_number, { width: 360, margin: 1 }),
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
    if (booking.status !== 'pending' || payment.status !== 'pending') {
      toast.error('Booking ini tidak lagi menunggu pembayaran.')
      return
    }
    if (!Number.isFinite(paymentExpiresAt) || paymentExpiresAt <= Date.now()) {
      setNow(Date.now())
      toast.error('Waktu pembayaran telah habis. Silakan buat booking baru.')
      return
    }

    setProcessing(true)

    if (booking.is_simulated) {
      const updatedBooking = { ...booking, status: 'paid' }
      const updatedPayment = { ...payment, status: 'paid', confirmed_at: new Date().toISOString() }
      try {
        const simStore = JSON.parse(localStorage.getItem('railhub_simulated_bookings') || '{}')
        simStore[booking.id] = { ...simStore[booking.id], status: 'paid', payment: updatedPayment }
        localStorage.setItem('railhub_simulated_bookings', JSON.stringify(simStore))
      } catch (e) {
        console.warn('Sim update error', e)
      }
      setBooking(updatedBooking)
      setPayment(updatedPayment)
      setProcessing(false)
      toast.success('Pembayaran simulasi berhasil. Tiket digital telah diterbitkan.')
      return
    }

    const supabase = createClient()
    const { error: methodError } = await supabase.rpc('select_booking_payment_method', {
      p_booking_id: booking.id,
      p_payment_method: selectedPaymentMethod,
    })
    if (methodError) {
      setProcessing(false)
      if (methodError.message.includes('Only your active pending bookings can select a payment method')) {
        setNow(Date.now())
        toast.error('Waktu pembayaran telah habis atau booking tidak lagi aktif. Silakan buat booking baru.')
      } else {
        toast.error(`Metode pembayaran gagal dipilih: ${methodError.message}`)
      }
      return
    }

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
    router.push('/dashboard/passenger#my-bookings')
  }

  async function cancelBooking() {
    if (!booking || processing) return
    if (!window.confirm('Batalkan booking ini? Kursi yang ditahan akan dilepas.')) return
    setProcessing(true)

    if (booking.is_simulated) {
      try {
        const simStore = JSON.parse(localStorage.getItem('railhub_simulated_bookings') || '{}')
        delete simStore[booking.id]
        localStorage.setItem('railhub_simulated_bookings', JSON.stringify(simStore))
      } catch (e) {
        console.warn('Sim delete error', e)
      }
      setProcessing(false)
      toast.success('Booking dibatalkan dan kursi dilepas.')
      router.push('/dashboard/passenger')
      return
    }

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

  const departureTime = new Date(booking?.schedules?.departure_time || 0).getTime()
  const canManagePaidTicket = booking?.status === 'paid' && departureTime > now + 24 * 60 * 60 * 1000
  const canOpenBoardingPass = booking?.status === 'paid'
    && now >= departureTime - 2 * 60 * 60 * 1000
    && now < departureTime
  const availableRescheduleSeats = (rescheduleJourney?.seats || []).filter(seat => (
    seat.carriage_class === tickets[0]?.seats?.carriages?.carriage_class && seat.is_available
  ))
  const selectedSchedule = scheduleOptions.find(option => option.schedule_id === selectedScheduleId)
  const rescheduleFareDifference = Math.max(
    (Number(selectedSchedule?.price || 0) * tickets.length)
      - Number(currentFareTotal ?? booking?.total_amount ?? 0),
    0
  )
  const rescheduleFee = Math.round(rescheduleFareDifference * 0.2 * 100) / 100

  async function searchRescheduleSchedules() {
    if (!journey?.schedule?.origin_code || !journey?.schedule?.destination_code || !rescheduleDate) {
      toast.error('Rincian rute dan tanggal reschedule belum lengkap.')
      return
    }

    setRescheduleLoading(true)
    setScheduleOptions([])
    setSelectedScheduleId('')
    setRescheduleJourney(null)
    setRescheduleSeats({})
    const { data, error: searchError } = await createClient().rpc('search_train_schedules', {
      p_origin_code: journey.schedule.origin_code,
      p_destination_code: journey.schedule.destination_code,
      p_departure_date: rescheduleDate,
      p_passengers: tickets.length,
    })
    setRescheduleLoading(false)

    if (searchError) {
      toast.error(`Jadwal pengganti gagal dicari: ${searchError.message}`)
      return
    }

    const options = (data || []).filter(option => (
      option.schedule_id !== booking.schedule_id
      && option.carriage_class === tickets[0]?.seats?.carriages?.carriage_class
      && new Date(option.departure_time).getTime() > Date.now() + 24 * 60 * 60 * 1000
    ))
    setScheduleOptions(options)
    if (options.length === 0) toast('Tidak ada jadwal sekelas yang tersedia pada tanggal tersebut.')
  }

  async function toggleReschedule() {
    if (rescheduleOpen) {
      setRescheduleOpen(false)
      return
    }

    const { data, error: fareError } = await createClient()
      .from('bookings')
      .select('ticket_fare_amount')
      .eq('id', booking.id)
      .single()
    if (fareError) {
      toast.error(`Data tarif tiket gagal dimuat: ${fareError.message}`)
      return
    }

    setCurrentFareTotal(Number(data.ticket_fare_amount) || Number(booking.total_amount))
    setRescheduleOpen(true)
  }

  async function chooseRescheduleSchedule(scheduleId) {
    setSelectedScheduleId(scheduleId)
    setRescheduleJourney(null)
    setRescheduleSeats({})
    if (!scheduleId) return

    setRescheduleLoading(true)
    const { data, error: scheduleError } = await createClient().rpc('get_schedule_booking_data', {
      p_schedule_id: scheduleId,
    })
    setRescheduleLoading(false)
    if (scheduleError) {
      toast.error(`Kursi jadwal pengganti gagal dimuat: ${scheduleError.message}`)
      return
    }
    setRescheduleJourney(data)
  }

  async function submitReschedule() {
    const selectedSeatIds = tickets.map(ticket => rescheduleSeats[ticket.passenger_id])
    if (!booking || !selectedScheduleId || selectedSeatIds.some(seatId => !seatId)
      || new Set(selectedSeatIds).size !== tickets.length || processing) {
      toast.error('Pilih satu kursi berbeda untuk setiap penumpang.')
      return
    }

    const additionalAmount = rescheduleFareDifference + rescheduleFee
    if (!window.confirm(
      `Biaya reschedule simulasi: ${formatIDR(rescheduleFee)}. `
      + `Tambahan tarif: ${formatIDR(rescheduleFareDifference)}. `
      + `Total tambahan yang dicatat: ${formatIDR(additionalAmount)}. Tidak ada pembayaran uang sungguhan. Lanjutkan?`
    )) return

    setProcessing(true)
    const { data, error: rescheduleError } = await createClient().rpc('reschedule_own_paid_booking', {
      p_booking_id: booking.id,
      p_schedule_id: selectedScheduleId,
      p_seat_ids: selectedSeatIds,
    })
    setProcessing(false)
    if (rescheduleError) {
      toast.error(`Reschedule gagal: ${rescheduleError.message}`)
      return
    }

    toast.success(`Tiket berhasil di-reschedule. Biaya tambahan simulasi: ${formatIDR(data?.additional_amount || 0)}.`)
    router.push('/dashboard/passenger#my-bookings')
  }

  async function cancelPaidBooking() {
    if (!booking || processing) return
    const fee = Math.round(Number(booking.total_amount) * 0.2 * 100) / 100
    const refund = Number(booking.total_amount) - fee
    if (!window.confirm(
      `Batalkan tiket ini? Biaya pembatalan 20% sebesar ${formatIDR(fee)}. `
      + `Pengembalian simulasi: ${formatIDR(refund)}. Tidak ada uang sungguhan yang diproses.`
    )) return

    setProcessing(true)
    const { data, error: cancelError } = await createClient().rpc('cancel_own_paid_booking', {
      p_booking_id: booking.id,
    })
    setProcessing(false)
    if (cancelError) {
      toast.error(`Pembatalan gagal: ${cancelError.message}`)
      return
    }
    toast.success(`Tiket dibatalkan. Pengembalian simulasi: ${formatIDR(data?.refund_amount || 0)}.`)
    router.push('/dashboard/passenger#my-bookings')
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2.5rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container" style={{ maxWidth: 860 }}>
          <Link href="/dashboard/passenger" className="rh-btn rh-btn-ghost rh-btn-sm" style={{ marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Dashboard penumpang
          </Link>
          <h1 className="rh-h2" style={{ marginBottom: '1.25rem' }}>
            {booking?.status === 'paid' ? 'Detail tiket' : 'Pembayaran dan tiket'}
          </h1>

          {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)' }}>{error}</div>}
          {!booking && !error && <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>Memuat booking…</div>}

          {booking && (
            <>
              <section className="rh-card" style={{ marginBottom: '1rem' }}>
                <div className="rh-card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <span style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>Kode booking</span>
                    <strong className="rh-mono" style={{ display: 'block', fontSize: '1.15rem' }}>{booking.booking_code}</strong>
                  </div>
                  <div style={{ minWidth: 0, textAlign: 'right' }}>
                    <span style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>Total pembayaran</span>
                    <strong style={{ display: 'block', color: 'var(--rh-primary)', fontSize: '1.25rem' }}>{formatIDR(booking.total_amount)}</strong>
                  </div>
                </div>
              </section>

              {booking.status === 'pending' && payment?.status === 'pending' && !bookingExpired && (
                <section className="rh-card" style={{ marginBottom: '1rem' }}>
                  <div className="rh-card-body">
                    <h2 className="rh-h4">Pilih metode pembayaran</h2>
                    <p style={{ color: 'var(--rh-text-2)', margin: '0.5rem 0 1rem' }}>
                      Pilih metode pembayaran untuk simulasi demo. Tidak ada pembayaran atau transfer uang sungguhan.
                    </p>
                    <p style={{ color: 'var(--rh-warning)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <Clock3 size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                      Batas pembayaran: {new Date(booking.expires_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                    </p>
                    <div className="passenger-food-payment-methods" role="radiogroup" aria-label="Metode pembayaran tiket">
                      {TICKET_PAYMENT_METHODS.map(({ value, label, description, icon: Icon }) => (
                        <button
                          key={value}
                          className={`passenger-food-payment-method ${selectedPaymentMethod === value ? 'is-selected' : ''}`}
                          type="button"
                          role="radio"
                          aria-checked={selectedPaymentMethod === value}
                          onClick={() => setSelectedPaymentMethod(value)}
                          disabled={processing}
                        >
                          <span className="passenger-food-item-icon"><Icon size={19} /></span>
                          <span><strong>{label}</strong><small>{description}</small></span>
                          <span className="passenger-food-payment-radio" />
                        </button>
                      ))}
                    </div>
                    <div className="passenger-food-payment-summary">
                      <span>Total tiket</span>
                      <strong>{formatIDR(booking.total_amount)}</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <button className="rh-btn rh-btn-primary" type="button" onClick={confirmPayment} disabled={processing}>
                        {processing && <LoaderCircle size={16} className="rh-spin" />}
                        {processing ? 'Memproses simulasi…' : `Bayar ${formatIDR(booking.total_amount)}`}
                      </button>
                      <button className="rh-btn rh-btn-ghost" type="button" onClick={cancelBooking} disabled={processing}>
                        Batalkan booking
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {booking.status === 'pending' && bookingExpired && (
                <section className="rh-card" role="status" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                  <h2 className="rh-h4">Waktu pembayaran telah habis</h2>
                  <p style={{ color: 'var(--rh-text-2)', margin: '.5rem 0 1rem' }}>
                    Booking ini tidak dapat dibayar lagi. Silakan pilih jadwal dan kursi untuk membuat booking baru.
                  </p>
                  <Link href="/trains" className="rh-btn rh-btn-primary">Cari jadwal baru</Link>
                </section>
              )}

              {booking.status === 'paid' && (
                <>
                  <section className="rh-card" style={{ marginBottom: '1rem' }}>
                    <div className="rh-card-body">
                      <h2 className="rh-h4" style={{ color: 'var(--rh-success)' }}>
                        <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Pembayaran dikonfirmasi
                      </h2>
                      <p style={{ color: 'var(--rh-text-2)', marginTop: '0.4rem' }}>Pembayaran simulasi berhasil dan tiket telah diterbitkan.</p>
                      {booking.schedules?.departure_time && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: 'var(--rh-text-2)', marginTop: '.75rem' }}>
                          <CalendarDays size={16} />
                          {formatDate(booking.schedules.departure_time)} · {formatTime(booking.schedules.departure_time)}
                        </p>
                      )}
                      {(() => {
                        const origin = journey?.schedule?.origin_name || journey?.schedule?.origin_code || booking.schedules?.routes?.name?.split('—')?.[0]?.trim() || ''
                        const dest = journey?.schedule?.destination_name || journey?.schedule?.destination_code || booking.schedules?.routes?.name?.split('—')?.[1]?.trim() || ''
                        const routeStr = origin && dest ? `${origin} → ${dest}` : (booking.schedules?.routes?.name || 'Rute Perjalanan')
                        const trainName = journey?.schedule?.train_name || booking.schedules?.trains?.name || ''
                        const trainNum = journey?.schedule?.train_number || booking.schedules?.trains?.train_number || ''
                        const trainStr = [trainName, trainNum ? `(${trainNum})` : ''].filter(Boolean).join(' ')

                        return (
                          <p style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--rh-charcoal)', fontWeight: 600, marginTop: '.4rem' }}>
                            <MapPin size={16} style={{ color: 'var(--rh-primary)', flexShrink: 0 }} />
                            <span>{routeStr}</span>
                            {trainStr && <span style={{ color: 'var(--rh-text-2)', fontWeight: 500 }}>· {trainStr}</span>}
                          </p>
                        )
                      })()}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.65rem', marginTop: '1rem' }}>
                        <button
                          className="rh-btn rh-btn-primary"
                          type="button"
                          onClick={() => setBoardingPassOpen(open => !open)}
                          disabled={!canOpenBoardingPass}
                          aria-expanded={boardingPassOpen}
                        >
                          <Ticket size={16} />
                          {boardingPassOpen ? 'Tutup e-boarding pass' : 'Lihat e-boarding pass'}
                        </button>
                        <button
                          className="rh-btn rh-btn-ghost"
                          type="button"
                          onClick={toggleReschedule}
                          disabled={!canManagePaidTicket}
                          aria-expanded={rescheduleOpen}
                        >
                          <RefreshCw size={16} /> Reschedule
                        </button>
                        <button
                          className="rh-btn rh-btn-ghost"
                          type="button"
                          onClick={cancelPaidBooking}
                          disabled={!canManagePaidTicket || processing}
                        >
                          Batalkan tiket
                        </button>
                      </div>
                      {!canOpenBoardingPass && departureTime > now && (
                        <p style={{ color: 'var(--rh-text-2)', fontSize: '.875rem', marginTop: '.65rem' }}>
                          E-boarding pass dapat dibuka mulai 2 jam sebelum keberangkatan.
                        </p>
                      )}
                      {departureTime <= now && (
                        <p style={{ color: 'var(--rh-text-2)', fontSize: '.875rem', marginTop: '.65rem' }}>
                          Keberangkatan telah dimulai; e-boarding pass tidak lagi tersedia.
                        </p>
                      )}
                      {!canManagePaidTicket && departureTime > 0 && (
                        <p style={{ color: 'var(--rh-text-2)', fontSize: '.875rem', marginTop: '.45rem' }}>
                          Reschedule dan pembatalan tersedia sampai 24 jam sebelum keberangkatan.
                        </p>
                      )}
                    </div>
                  </section>
                  <JourneyStatusTimeline scheduleId={booking.schedule_id} />

                  {rescheduleOpen && canManagePaidTicket && (
                    <section className="rh-card" style={{ marginBottom: '1rem' }}>
                      <div className="rh-card-header">
                        <h2 className="rh-h4">Reschedule perjalanan</h2>
                        <p style={{ color: 'var(--rh-text-2)', marginTop: '.35rem' }}>
                          Pilih jadwal pada rute dan kelas yang sama. Biaya reschedule 20% dikenakan pada selisih tarif positif dibanding tarif tiket saat ini.
                        </p>
                      </div>
                      <div className="rh-card-body" style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'end' }}>
                          <label className="rh-input-group" style={{ flex: '1 1 190px' }}>
                            <span className="rh-label-text">Tanggal keberangkatan baru</span>
                            <input
                              className="rh-input"
                              type="date"
                              min={localDateValue(new Date())}
                              value={rescheduleDate}
                              onChange={event => {
                                setRescheduleDate(event.target.value)
                                setScheduleOptions([])
                                setSelectedScheduleId('')
                                setRescheduleJourney(null)
                              }}
                            />
                          </label>
                          <button
                            className="rh-btn rh-btn-primary"
                            type="button"
                            onClick={searchRescheduleSchedules}
                            disabled={rescheduleLoading || !rescheduleDate}
                          >
                            {rescheduleLoading ? <LoaderCircle size={16} className="rh-spin" /> : <CalendarDays size={16} />}
                            Cari jadwal
                          </button>
                        </div>

                        {scheduleOptions.length > 0 && (
                          <label className="rh-input-group">
                            <span className="rh-label-text">Jadwal pengganti</span>
                            <select
                              className="rh-input"
                              value={selectedScheduleId}
                              onChange={event => chooseRescheduleSchedule(event.target.value)}
                            >
                              <option value="">Pilih jadwal</option>
                              {scheduleOptions.map(option => (
                                <option key={option.schedule_id} value={option.schedule_id}>
                                  {formatTime(option.departure_time)} · {option.train_name} · {formatIDR(option.price)}/penumpang · {option.available_seats} kursi
                                </option>
                              ))}
                            </select>
                          </label>
                        )}

                        {selectedScheduleId && rescheduleJourney && (
                          <>
                            <div className="rh-card" style={{ padding: '1rem', background: 'var(--rh-surface)' }}>
                              <strong><Train size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />Pilih kursi baru</strong>
                              <div style={{ display: 'grid', gap: '.75rem', marginTop: '.8rem' }}>
                                {tickets.map((ticket, index) => (
                                  <label key={ticket.passenger_id} className="rh-input-group">
                                    <span className="rh-label-text">{ticket.passengers?.full_name || `Penumpang ${index + 1}`}</span>
                                    <select
                                      className="rh-input"
                                      value={rescheduleSeats[ticket.passenger_id] || ''}
                                      onChange={event => setRescheduleSeats(current => ({
                                        ...current,
                                        [ticket.passenger_id]: event.target.value,
                                      }))}
                                    >
                                      <option value="">Pilih kursi</option>
                                      {availableRescheduleSeats.map(seat => (
                                        <option
                                          key={seat.id}
                                          value={seat.id}
                                          disabled={Object.entries(rescheduleSeats).some(([passengerId, seatId]) => (
                                            passengerId !== ticket.passenger_id && seatId === seat.id
                                          ))}
                                        >
                                          Gerbong {seat.carriage_number} · {seat.seat_number}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ))}
                                {availableRescheduleSeats.length === 0 && (
                                  <p role="alert" style={{ color: 'var(--rh-danger)' }}>Tidak ada kursi tersedia pada kelas tiket ini.</p>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'grid', gap: '.25rem', color: 'var(--rh-text-2)', fontSize: '.9rem' }}>
                              <span>Selisih tarif yang ditambahkan: <strong>{formatIDR(rescheduleFareDifference)}</strong></span>
                              <span>Biaya reschedule 20%: <strong>{formatIDR(rescheduleFee)}</strong></span>
                              <span>Total tambahan simulasi: <strong>{formatIDR(rescheduleFareDifference + rescheduleFee)}</strong></span>
                              <small>Jadwal yang lebih murah tidak mendapat pengembalian selisih. Tidak ada uang sungguhan yang diproses.</small>
                            </div>
                            <button
                              className="rh-btn rh-btn-primary"
                              type="button"
                              onClick={submitReschedule}
                              disabled={processing || tickets.length === 0 || availableRescheduleSeats.length < tickets.length}
                            >
                              {processing && <LoaderCircle size={16} className="rh-spin" />}
                              Konfirmasi reschedule
                            </button>
                          </>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}

              {booking.status !== 'pending' && booking.status !== 'paid' && (
                <section className="rh-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                  Status booking: <strong>{booking.status}</strong>. Silakan buat booking baru bila masih ingin melakukan perjalanan.
                </section>
              )}

              {tickets.length > 0 && (
                <section>
                  <h2 className="rh-h3" style={{ marginBottom: '1rem' }}>Tiket penumpang</h2>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {tickets.map(ticket => (
                      <article key={ticket.ticket_number} className="rh-card">
                        <div className="rh-card-body" style={{ display: 'grid', gap: '.85rem' }}>
                          <div>
                            <span style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>Nomor tiket</span>
                            <strong className="rh-mono" style={{ display: 'block' }}>{ticket.ticket_number}</strong>
                            <span style={{ display: 'block', marginTop: '0.5rem' }}>{ticket.passengers?.full_name || 'Penumpang simulasi'}</span>
                            <span style={{ color: 'var(--rh-text-2)' }}>Kursi {ticket.seats?.seat_number || '—'}</span>
                          </div>
                          {boardingPassOpen && canOpenBoardingPass && (
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '.85rem', borderTop: '1px dashed var(--rh-border)' }}>
                              {qrCodes[ticket.ticket_number]
                                ? <Image src={qrCodes[ticket.ticket_number]} alt={`QR e-boarding pass ${ticket.ticket_number}`} width={168} height={168} unoptimized />
                                : <div aria-label="Membuat QR e-boarding pass" style={{ width: 168, height: 168, display: 'grid', placeItems: 'center' }}><Ticket size={24} /></div>}
                              <div style={{ minWidth: 0, flex: '1 1 180px' }}>
                                <strong>E-boarding pass</strong>
                                <span style={{ display: 'block', color: 'var(--rh-text-2)', marginTop: '.25rem', overflowWrap: 'anywhere' }}>
                                  {journey?.schedule?.train_name || booking.schedules?.trains?.name || 'KA'} · {(journey?.schedule?.origin_code && journey?.schedule?.destination_code) ? `${journey.schedule.origin_code} → ${journey.schedule.destination_code}` : (booking.schedules?.routes?.name || '')}
                                </span>
                                <span style={{ display: 'block', color: 'var(--rh-text-2)', overflowWrap: 'anywhere' }}>
                                  {booking.schedules?.departure_time && formatDate(booking.schedules.departure_time)} · {booking.schedules?.departure_time && formatTime(booking.schedules.departure_time)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {booking.status === 'paid' && user && (
                <PassengerServices userId={user.id} bookingId={booking.id} />
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
