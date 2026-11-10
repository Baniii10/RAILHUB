'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { ArrowLeft, Banknote, CalendarDays, CheckCircle2, Clock3, CreditCard, LoaderCircle, MapPin, RefreshCw, Smartphone, Ticket, Train } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import EBoardingPass from '@/components/booking/EBoardingPass'
import { useAuth } from '@/contexts/AuthContext'
import { useConfirm } from '@/contexts/ConfirmDialogContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatIDR, formatTime } from '@/lib/utils/formatters'
import PassengerServices from '@/components/services/PassengerServices'
import JourneyStatusTimeline from '@/components/services/JourneyStatusTimeline'
import {
  QrisLogo,
  GopayLogo,
  OvoLogo,
  DanaLogo,
  ShopeepayLogo,
  BcaLogo,
  MandiriLogo,
  BniLogo,
  BriLogo,
} from '@/components/payment/PaymentLogos'

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
  const { confirm } = useConfirm()
  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [tickets, setTickets] = useState([])
  const [qrCodes, setQrCodes] = useState({})
  const [journey, setJourney] = useState(null)
  const [now, setNow] = useState(0)
  const [selectedTicketNumber, setSelectedTicketNumber] = useState(null)
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
  const [selectedWallet, setSelectedWallet] = useState('gopay')
  const [selectedBank, setSelectedBank] = useState('bca')
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
        if (active) setError(`Booking tidak ditemukan atau tidak dapat diakses: ${bookingError.message}`)
        return
      }

      const [paymentResult, ticketResult] = await Promise.all([
        supabase.from('payments')
          .select('id, status, method, confirmed_at')
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
    setBooking(prev => prev ? ({ ...prev, status: 'paid' }) : null)
    setPayment(prev => prev ? ({ ...prev, status: 'confirmed', confirmed_at: new Date().toISOString() }) : null)
    setProcessing(false)
    router.push('/dashboard/passenger?tab=tickets')
  }

  async function cancelBooking() {
    if (!booking || processing) return
    const ok = await confirm({
      title: 'Batalkan Pemesanan',
      message: 'Batalkan booking ini? Kursi yang ditahan akan dilepas kembali untuk penumpang lain.',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Pertahankan Booking',
      variant: 'danger',
    })
    if (!ok) return
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

  const departureTime = new Date(booking?.schedules?.departure_time || 0).getTime()
  const canManagePaidTicket = booking?.status === 'paid' && departureTime > now + 2 * 60 * 60 * 1000
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
      && new Date(option.departure_time).getTime() > Date.now() + 2 * 60 * 60 * 1000
    ))
    setScheduleOptions(options)
    if (options.length === 0) toast('Tidak ada jadwal sekelas yang tersedia pada tanggal tersebut.')
  }

  async function toggleReschedule() {
    if (rescheduleOpen) {
      setRescheduleOpen(false)
      return
    }

    const fare = Number(booking?.ticket_fare_amount != null ? booking.ticket_fare_amount : booking?.total_amount) || 0
    setCurrentFareTotal(fare)
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
    const ok = await confirm({
      title: 'Konfirmasi Reschedule Tiket',
      message: `Biaya reschedule: ${formatIDR(rescheduleFee)}.\nTambahan tarif: ${formatIDR(rescheduleFareDifference)}.\nTotal biaya perubahan: ${formatIDR(additionalAmount)}.\n\nPerubahan jadwal akan langsung diterapkan ke tiket Anda. Lanjutkan?`,
      confirmText: 'Lanjutkan Reschedule',
      cancelText: 'Batal',
      variant: 'primary',
    })
    if (!ok) return

    setProcessing(true)
    const { data, error: rescheduleError } = await createClient().rpc('reschedule_own_paid_booking', {
      p_booking_id: booking.id,
      p_schedule_id: selectedScheduleId,
      p_seat_ids: selectedSeatIds,
    })
    setProcessing(false)
    if (rescheduleError) {
      if (rescheduleError.message?.includes('schema cache') || rescheduleError.code === 'PGRST202') {
        toast.error('Fitur reschedule memerlukan pembaruan fungsi database Supabase. Silakan jalankan migrasi SQL di panduan deployment.')
      } else {
        toast.error(`Reschedule gagal: ${rescheduleError.message}`)
      }
      return
    }

    toast.success(`Tiket berhasil di-reschedule. Biaya tambahan simulasi: ${formatIDR(data?.additional_amount || 0)}.`)
    router.push('/dashboard/passenger?tab=tickets')
  }

  async function cancelPaidBooking() {
    if (!booking || processing) return
    const fee = Math.round(Number(booking.total_amount) * 0.2 * 100) / 100
    const refund = Number(booking.total_amount) - fee
    const ok = await confirm({
      title: 'Batalkan Tiket Kereta',
      message: `Apakah Anda yakin ingin membatalkan tiket ini?\n\n• Biaya pembatalan (20%): ${formatIDR(fee)}\n• Estimasi pengembalian dana: ${formatIDR(refund)}\n\nTiket yang dibatalkan tidak dapat dikembalikan.`,
      confirmText: 'Ya, Batalkan Tiket',
      cancelText: 'Pertahankan Tiket',
      variant: 'danger',
    })
    if (!ok) return

    setProcessing(true)
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal membatalkan tiket')
      }

      setProcessing(false)
      toast.success(`Tiket dibatalkan. Pengembalian dana: ${formatIDR(result.refund_amount || refund)}.`)
      router.push('/dashboard/passenger?tab=tickets')
    } catch (err) {
      setProcessing(false)
      toast.error(`Pembatalan gagal: ${err.message}`)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2.5rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container" style={{ maxWidth: 860 }}>
          <div className="rh-page-header-back">
            <Link href="/dashboard/passenger" className="rh-back-btn" aria-label="Kembali ke dashboard" title="Kembali ke dashboard">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="rh-h2">
              {booking?.status === 'paid' ? 'Detail tiket' : 'Pembayaran dan tiket'}
            </h1>
          </div>

          {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)' }}>{error}</div>}
          {!booking && !error && <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>Memuat booking…</div>}

          {booking && (
            <>
              <section className="rh-card rh-ticket-detail-shell">
                <section className="rh-ticket-detail-section">
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
                <section className="rh-ticket-detail-section">
                  <div className="rh-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <h2 className="rh-h4" style={{ margin: 0 }}>Metode Pembayaran</h2>
                      <span style={{ color: 'var(--rh-warning)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock3 size={14} /> Batas: {new Date(booking.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                    <div className="passenger-food-payment-methods" role="radiogroup" aria-label="Metode pembayaran tiket">
                      {/* 1. QRIS (Authentic Logo) */}
                      <button
                        type="button"
                        className={`passenger-food-payment-method ${selectedPaymentMethod === 'qr_payment' ? 'is-selected' : ''}`}
                        role="radio"
                        aria-checked={selectedPaymentMethod === 'qr_payment'}
                        onClick={() => setSelectedPaymentMethod('qr_payment')}
                        disabled={processing}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <div style={{ padding: '4px 6px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', flexShrink: 0, height: 'fit-content' }}>
                              <QrisLogo height={24} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.92rem' }}>QRIS</strong>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: '#b91c1c' }}>Semua Bank & E-Wallet</span>
                              </div>
                              <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>
                                BCA Mobile, Livin&apos; Mandiri, BRImo, BNI, GoPay, OVO, DANA, ShopeePay
                              </small>
                            </div>
                          </div>
                          <span className="passenger-food-payment-radio" style={{ flexShrink: 0, marginTop: 4 }} />
                        </div>
                      </button>

                      {/* 2. E-WALLET (Authentic Logos: GoPay, OVO, DANA, ShopeePay) */}
                      <div
                        className={`passenger-food-payment-method ${selectedPaymentMethod === 'e_wallet' ? 'is-selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('e_wallet')}
                        role="radio"
                        aria-checked={selectedPaymentMethod === 'e_wallet'}
                        tabIndex={0}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '0.92rem', display: 'block' }}>Dompet Digital (E-Wallet)</strong>
                            <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem', display: 'block', marginTop: 2 }}>Pilih GoPay, OVO, DANA, atau ShopeePay</small>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                              <GopayLogo height={16} />
                              <OvoLogo height={16} />
                              <DanaLogo height={16} />
                              <ShopeepayLogo height={16} />
                            </div>
                          </div>
                          <span className="passenger-food-payment-radio" style={{ flexShrink: 0, marginTop: 4 }} />
                        </div>

                        {selectedPaymentMethod === 'e_wallet' && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
                              gap: '0.5rem',
                              marginTop: '0.75rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid rgba(26,66,138,0.1)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              { id: 'gopay', label: 'GoPay', Logo: GopayLogo },
                              { id: 'ovo', label: 'OVO', Logo: OvoLogo },
                              { id: 'dana', label: 'DANA', Logo: DanaLogo },
                              { id: 'shopeepay', label: 'ShopeePay', Logo: ShopeepayLogo },
                            ].map(({ id, label, Logo }) => (
                              <button
                                key={id}
                                type="button"
                                className={`rh-payment-provider-btn ${selectedWallet === id ? 'is-active' : ''}`}
                                onClick={() => setSelectedWallet(id)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '0.5rem 0.25rem',
                                  minWidth: 0,
                                }}
                              >
                                <Logo height={18} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: selectedWallet === id ? 'var(--rh-primary)' : 'var(--rh-text-2)', whiteSpace: 'nowrap' }}>{label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. VIRTUAL ACCOUNT BANK (Authentic Logos: BCA, Mandiri, BNI, BRI) */}
                      <div
                        className={`passenger-food-payment-method ${selectedPaymentMethod === 'bank_transfer' ? 'is-selected' : ''}`}
                        onClick={() => setSelectedPaymentMethod('bank_transfer')}
                        role="radio"
                        aria-checked={selectedPaymentMethod === 'bank_transfer'}
                        tabIndex={0}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '0.92rem', display: 'block' }}>Virtual Account Bank</strong>
                            <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem', display: 'block', marginTop: 2 }}>Konfirmasi otomatis 24 jam</small>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                              <BcaLogo height={16} />
                              <MandiriLogo height={16} />
                              <BniLogo height={16} />
                              <BriLogo height={16} />
                            </div>
                          </div>
                          <span className="passenger-food-payment-radio" style={{ flexShrink: 0, marginTop: 4 }} />
                        </div>

                        {selectedPaymentMethod === 'bank_transfer' && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
                              gap: '0.5rem',
                              marginTop: '0.75rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid rgba(26,66,138,0.1)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              { id: 'bca', label: 'BCA VA', Logo: BcaLogo },
                              { id: 'mandiri', label: 'Mandiri VA', Logo: MandiriLogo },
                              { id: 'bni', label: 'BNI VA', Logo: BniLogo },
                              { id: 'bri', label: 'BRI VA', Logo: BriLogo },
                            ].map(({ id, label, Logo }) => (
                              <button
                                key={id}
                                type="button"
                                className={`rh-payment-provider-btn ${selectedBank === id ? 'is-active' : ''}`}
                                onClick={() => setSelectedBank(id)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '0.5rem 0.25rem',
                                  minWidth: 0,
                                }}
                              >
                                <Logo height={18} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: selectedBank === id ? 'var(--rh-primary)' : 'var(--rh-text-2)', whiteSpace: 'nowrap' }}>{label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                <section className="rh-ticket-detail-section" role="status" style={{ padding: '1.5rem' }}>
                  <h2 className="rh-h4">Waktu pembayaran telah habis</h2>
                  <p style={{ color: 'var(--rh-text-2)', margin: '.5rem 0 1rem' }}>
                    Booking ini tidak dapat dibayar lagi. Silakan pilih jadwal dan kursi untuk membuat booking baru.
                  </p>
                  <Link href="/trains" className="rh-btn rh-btn-primary">Cari jadwal baru</Link>
                </section>
              )}

              {booking.status === 'paid' && (
                <>
                  <section className="rh-ticket-detail-section">
                    <div className="rh-card-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <h2 className="rh-h4" style={{ color: 'var(--rh-success)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={18} />
                          Pembayaran Berhasil
                        </h2>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', borderRadius: 6, background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                          <small style={{ color: 'var(--rh-success)', fontWeight: 700, fontSize: '0.72rem' }}>
                            {payment?.method === 'qr_payment' ? 'QRIS' : payment?.method === 'e_wallet' ? 'E-Wallet' : 'Virtual Account'}
                          </small>
                        </span>
                      </div>
                      {booking.schedules?.departure_time && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: 'var(--rh-text-2)', margin: '0.35rem 0', fontSize: '0.88rem' }}>
                          <CalendarDays size={15} />
                          {formatDate(booking.schedules.departure_time)} · {formatTime(booking.schedules.departure_time)} WIB
                        </p>
                      )}
                      {(() => {
                        const origin = journey?.schedule?.origin_name || journey?.schedule?.origin_code || booking.schedules?.routes?.name?.split(/\s*(?:—|–|-)\s*/)?.[0]?.trim() || ''
                        const dest = journey?.schedule?.destination_name || journey?.schedule?.destination_code || booking.schedules?.routes?.name?.split(/\s*(?:—|–|-)\s*/)?.[1]?.trim() || ''
                        const routeStr = origin && dest ? `${origin} → ${dest}` : (booking.schedules?.routes?.name || 'Rute Perjalanan')
                        const trainName = journey?.schedule?.train_name || booking.schedules?.trains?.name || ''
                        const trainNum = journey?.schedule?.train_number || booking.schedules?.trains?.train_number || ''
                        const trainStr = [trainName, trainNum ? `(${trainNum})` : ''].filter(Boolean).join(' ')

                        return (
                          <p style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: 'var(--rh-charcoal)', fontWeight: 600, margin: '0.35rem 0 0.85rem', fontSize: '0.9rem' }}>
                            <MapPin size={15} style={{ color: 'var(--rh-primary)', flexShrink: 0 }} />
                            <span>{routeStr}</span>
                            {trainStr && <span style={{ color: 'var(--rh-text-2)', fontWeight: 500 }}>· {trainStr}</span>}
                          </p>
                        )
                      })()}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '0.5rem' }}>
                        <button
                          className="rh-btn rh-btn-ghost rh-btn-sm"
                          type="button"
                          onClick={toggleReschedule}
                          disabled={!canManagePaidTicket}
                          aria-expanded={rescheduleOpen}
                        >
                          Reschedule
                        </button>
                        <button
                          className="rh-btn rh-btn-ghost rh-btn-sm"
                          type="button"
                          onClick={cancelPaidBooking}
                          disabled={!canManagePaidTicket || processing}
                        >
                          Batalkan tiket
                        </button>
                      </div>
                    </div>
                  </section>
                  <JourneyStatusTimeline scheduleId={booking.schedule_id} />

                  {rescheduleOpen && canManagePaidTicket && (
                    <section className="rh-ticket-detail-section">
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
                            <div style={{ display: 'grid', gap: '.25rem', color: 'var(--rh-text-2)', fontSize: '.88rem' }}>
                              <span>Selisih: <strong>{formatIDR(rescheduleFareDifference)}</strong></span>
                              <span>Biaya admin: <strong>{formatIDR(rescheduleFee)}</strong></span>
                              <span>Total: <strong>{formatIDR(rescheduleFareDifference + rescheduleFee)}</strong></span>
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
                <section className="rh-ticket-detail-section" style={{ padding: '1.5rem' }}>
                  Status booking: <strong>{booking.status}</strong>. Silakan buat booking baru bila masih ingin melakukan perjalanan.
                </section>
              )}

              {tickets.length > 0 && (
                <section className="rh-ticket-detail-section rh-ticket-list-section">
                  <h2 className="rh-h4" style={{ marginBottom: '1rem' }}>Tiket penumpang</h2>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {tickets.map(ticket => (
                      selectedTicketNumber === ticket.ticket_number && canOpenBoardingPass ? (
                        <div key={ticket.ticket_number} className="rh-selected-ticket">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <button
                              className="rh-back-btn"
                              type="button"
                              onClick={() => setSelectedTicketNumber(null)}
                              aria-label="Tutup e-ticket"
                              title="Tutup e-ticket"
                            >
                              <ArrowLeft size={16} />
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rh-charcoal)' }}>Tutup E-Ticket</span>
                          </div>
                          <EBoardingPass
                            booking={booking}
                            ticket={ticket}
                            qrImage={qrCodes[ticket.ticket_number]}
                            journey={journey}
                          />
                        </div>
                      ) : (
                        <article key={ticket.ticket_number} className="rh-ticket-row">
                          <div><small>Nomor tiket</small><strong className="rh-mono">{ticket.ticket_number}</strong></div>
                          <div><small>Penumpang</small><strong>{ticket.passengers?.full_name || 'Penumpang'}</strong></div>
                          <div><small>Kursi</small><strong>{ticket.seats?.seat_number || '-'}</strong></div>
                          <button
                            className="rh-btn rh-btn-primary rh-btn-sm"
                            type="button"
                            onClick={() => setSelectedTicketNumber(ticket.ticket_number)}
                            disabled={!canOpenBoardingPass}
                            aria-expanded={selectedTicketNumber === ticket.ticket_number}
                          >
                            Buka E-Ticket
                          </button>
                        </article>
                      )
                    ))}
                  </div>
                </section>
              )}
              </section>
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
