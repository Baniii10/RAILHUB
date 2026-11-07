'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CreditCard, Smartphone, Banknote } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import TrainWifiHub from '@/components/journey/TrainWifiHub'
import OnboardCulinaryShowcase from '@/components/food/OnboardCulinaryShowcase'

const REPORT_CATEGORIES = [
  ['assistance', 'Permintaan bantuan'],
  ['lost_found', 'Barang hilang/temuan'],
  ['complaint', 'Keluhan perjalanan'],
  ['other', 'Lainnya'],
]
const FOOD_PAYMENT_METHODS = [
  { value: 'qris', label: 'QRIS', description: 'Metode simulasi demo', icon: CreditCard },
  { value: 'e_wallet', label: 'E-wallet', description: 'Metode simulasi demo', icon: Smartphone },
  { value: 'bank_transfer', label: 'Transfer bank', description: 'Metode simulasi demo', icon: Banknote },
]
const ORDER_STATUS_LABELS = {
  pending: 'Menunggu konfirmasi petugas',
  confirmed: 'Pesanan dikonfirmasi',
  preparing: 'Pesanan sedang disiapkan',
  on_the_way: 'Pesanan dalam pengantaran',
  completed: 'Pesanan selesai',
  cancelled: 'Pesanan dibatalkan',
}
const REPORT_STATUS_LABELS = {
  pending: 'Menunggu petugas',
  in_progress: 'Sedang ditangani',
  resolved: 'Selesai',
  rejected: 'Tidak dapat ditindaklanjuti',
}

export default function PassengerServices({ userId, bookingId: initialBookingId, showReports = true }) {
  const [bookings, setBookings] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [reports, setReports] = useState([])
  const [bookingId, setBookingId] = useState('')
  const [passengerId, setPassengerId] = useState('')
  const [quantities, setQuantities] = useState({})
  const [foodMenuOpen, setFoodMenuOpen] = useState(false)
  const [foodCheckoutStep, setFoodCheckoutStep] = useState('menu')
  const [foodPaymentMethod, setFoodPaymentMethod] = useState('qris')
  const [category, setCategory] = useState('assistance')
  const [reportTitle, setReportTitle] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusError, setStatusError] = useState('')
  const [submittingFood, setSubmittingFood] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadServices() {
      if (!userId) {
        setLoading(false)
        return
      }

      let bookingQuery = supabase
        .from('bookings')
        .select('id, booking_code, status, schedule_id, booking_seats(passenger_id, seat_id, passengers(id, full_name), seats(seat_number))')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })

      if (initialBookingId && typeof initialBookingId === 'string' && initialBookingId !== 'undefined' && initialBookingId.trim() !== '') {
        bookingQuery = bookingQuery.eq('id', initialBookingId)
      }

      let reportQuery = supabase
        .from('passenger_reports')
        .select('id, category, title, status, response_note, created_at, bookings(booking_code)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (initialBookingId && typeof initialBookingId === 'string' && initialBookingId !== 'undefined' && initialBookingId.trim() !== '') {
        reportQuery = reportQuery.eq('booking_id', initialBookingId)
      }

      const [bookingResult, productResult, reportResult] = await Promise.all([
        bookingQuery,
        supabase
          .from('food_products')
          .select('id, name, description, price, food_categories(name)')
          .eq('is_active', true)
          .order('name'),
        reportQuery,
      ])

      if (!active) return
      const failure = bookingResult.error || productResult.error || reportResult.error
      if (failure) {
        setError(`Menu tiket tidak dapat dimuat: ${failure.message}`)
        setLoading(false)
        return
      }

      const paidBookings = bookingResult.data || []
      setBookings(paidBookings)
      setProducts(productResult.data || [])
      setReports(reportResult.data || [])
      setBookingId(initialBookingId || paidBookings[0]?.id || '')
      setPassengerId(paidBookings[0]?.booking_seats?.[0]?.passenger_id || '')
      setOrders([])

      if (paidBookings.length > 0) {
        const { data: orderRows, error: orderError } = await supabase
          .from('food_orders')
          .select('id, order_code, booking_id, status, payment_method, total_amount, created_at, food_order_items(quantity, unit_price, food_products(name))')
          .in('booking_id', paidBookings.map(booking => booking.id))
          .order('created_at', { ascending: false })
          .limit(20)
        if (!active) return
        if (orderError) setError(`Status pesanan tidak dapat dimuat: ${orderError.message}`)
        else setOrders(orderRows || [])
      }
      setLoading(false)
    }

    loadServices()
    return () => { active = false }
  }, [userId, initialBookingId])

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function refreshPassengerUpdates() {
      if (!initialBookingId) return
      const [orderResult, reportResult] = await Promise.all([
        supabase
          .from('food_orders')
          .select('id, order_code, booking_id, status, payment_method, total_amount, created_at, food_order_items(quantity, unit_price, food_products(name))')
          .eq('booking_id', initialBookingId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('passenger_reports')
          .select('id, category, title, status, response_note, created_at, bookings(booking_code)')
          .eq('user_id', userId)
          .eq('booking_id', initialBookingId)
          .order('created_at', { ascending: false })
          .limit(20),
      ])
      if (!active) return
      if (orderResult.error || reportResult.error) {
        setStatusError(`Status layanan gagal diperbarui: ${orderResult.error?.message || reportResult.error?.message}`)
        return
      }
      setOrders(orderResult.data || [])
      setReports(reportResult.data || [])
      setStatusError('')
    }

    const timer = window.setInterval(refreshPassengerUpdates, 20000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [initialBookingId, userId])

  const selectedBooking = bookings.find(booking => booking.id === bookingId) || bookings[0]
  const selectedPassengerSeat = selectedBooking?.booking_seats?.find(
    item => item.passenger_id === passengerId
  ) || selectedBooking?.booking_seats?.[0]

  const handleUpdateQuantity = (id, delta) => {
    setQuantities(current => {
      const currentQty = current[id] || 0
      const next = Math.max(0, Math.min(10, currentQty + delta))
      if (next === 0) {
        const copy = { ...current }
        delete copy[id]
        return copy
      }
      return { ...current, [id]: next }
    })
  }

  const selectedItems = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => {
      const matchedDb = products.find(p => p.id === productId)
      const validId = matchedDb ? matchedDb.id : (products[0]?.id || productId)
      return { product_id: validId, quantity }
    })

  const total = selectedItems.reduce((sum, item) => {
    const product = products.find(candidate => candidate.id === item.product_id)
    return sum + Number(product?.price || 0) * item.quantity
  }, 0)

  async function submitFoodOrder() {
    if (!selectedBooking || !selectedPassengerSeat || selectedItems.length === 0 || submittingFood) {
      toast.error('Pilih tiket perjalanan, nomor kursi, dan minimal satu hidangan.')
      return
    }
    setSubmittingFood(true)
    const { error: orderError } = await createClient().rpc('create_passenger_food_order', {
      p_booking_id: bookingId || selectedBooking.id,
      p_passenger_id: passengerId || selectedPassengerSeat.passenger_id,
      p_seat_id: selectedPassengerSeat.seat_id,
      p_items: selectedItems,
      p_note: note,
    })
    setSubmittingFood(false)
    if (orderError) {
      toast.error(`Pesanan makanan gagal dibuat: ${orderError.message}`)
      return
    }

    const selectedMethod = FOOD_PAYMENT_METHODS.find(method => method.value === foodPaymentMethod)
    toast.success(`Pembayaran simulasi ${selectedMethod?.label || 'QRIS'} berhasil. Pesanan dikirim ke pramugari!`)
    setQuantities({})
    setNote('')
    setFoodCheckoutStep('menu')
    const { data, error: reloadError } = await createClient()
      .from('food_orders')
      .select('id, order_code, booking_id, status, payment_method, total_amount, created_at, food_order_items(quantity, unit_price, food_products(name))')
      .eq('booking_id', bookingId || selectedBooking.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (reloadError) toast.error(`Pesanan dibuat, tetapi statusnya gagal dimuat: ${reloadError.message}`)
    else setOrders(data || [])
  }

  async function submitReport(event) {
    event.preventDefault()
    if (submittingReport) return
    setSubmittingReport(true)
    const supabase = createClient()
    const { data: reportId, error: reportError } = await supabase.rpc('create_passenger_report', {
      p_category: category,
      p_title: reportTitle,
      p_description: reportDescription,
      p_booking_id: bookingId || null,
    })
    setSubmittingReport(false)
    if (reportError) {
      toast.error(`Laporan gagal dikirim: ${reportError.message}`)
      return
    }
    toast.success('Laporan berhasil dikirim ke petugas.')
    setReportTitle('')
    setReportDescription('')
    const { data, error: reloadError } = await createClient()
      .from('passenger_reports')
      .select('id, category, title, status, response_note, created_at, bookings(booking_code)')
      .eq('id', reportId)
      .single()
    if (reloadError) toast.error(`Laporan terkirim, tetapi statusnya gagal dimuat: ${reloadError.message}`)
    else if (data) setReports(current => [data, ...current])
  }

  return (
    <section id="journey-services" style={{ display: 'grid', gap: '1.25rem', marginTop: '1.5rem', scrollMarginTop: 96 }}>
      {/* ── ULTRA-MINIMAL WI-FI BAR ── */}
      <TrainWifiHub trainName="KA Argo Bromo Anggrek" />

      {error && <div role="alert" className="rh-card" style={{ padding: '0.75rem', color: 'var(--rh-danger)' }}>{error}</div>}
      {statusError && <div role="alert" className="rh-card" style={{ padding: '0.75rem', color: 'var(--rh-danger)' }}>{statusError}</div>}
      {loading && <div aria-live="polite" className="rh-card" style={{ padding: '0.75rem' }}>Memuat menu perjalanan…</div>}

      {/* ── 2-COLUMN MINIMALIST GRAB-STYLE FOOD ORDERING ── */}
      <OnboardCulinaryShowcase
        dbProducts={products}
        quantities={quantities}
        onUpdateQuantity={handleUpdateQuantity}
        bookings={bookings}
        bookingId={bookingId}
        setBookingId={setBookingId}
        passengerId={passengerId}
        setPassengerId={setPassengerId}
        note={note}
        setNote={setNote}
        foodPaymentMethod={foodPaymentMethod}
        setFoodPaymentMethod={setFoodPaymentMethod}
        onSubmitOrder={submitFoodOrder}
        submittingFood={submittingFood}
        orders={orders}
        orderStatusLabels={ORDER_STATUS_LABELS}
      />

      {showReports && <article className="rh-card">
        <div className="rh-card-header">
          <h3 className="rh-h4"><AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Bantuan dan laporan perjalanan</h3>
          <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Kirim permintaan bantuan, barang hilang, atau keluhan untuk ditindaklanjuti petugas.</p>
        </div>
        <div className="rh-card-body">
          <form onSubmit={submitReport} style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
              <label className="rh-input-group">
                <span className="rh-label-text">Kategori laporan</span>
                <select className="rh-input" value={category} onChange={event => setCategory(event.target.value)}>
                  {REPORT_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {bookings.length > 0 && (
                <label className="rh-input-group">
                  <span className="rh-label-text">Perjalanan terkait (opsional)</span>
                  <select className="rh-input" value={bookingId} onChange={event => setBookingId(event.target.value)}>
                    <option value="">Tanpa perjalanan terkait</option>
                    {bookings.map(booking => <option key={booking.id} value={booking.id}>{booking.booking_code}</option>)}
                  </select>
                </label>
              )}
            </div>
            <label className="rh-input-group">
              <span className="rh-label-text">Judul</span>
              <input className="rh-input" minLength={3} maxLength={120} required value={reportTitle} onChange={event => setReportTitle(event.target.value)} />
            </label>
            <label className="rh-input-group">
              <span className="rh-label-text">Deskripsi</span>
              <textarea className="rh-input" minLength={5} maxLength={2000} rows={4} required value={reportDescription} onChange={event => setReportDescription(event.target.value)} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <button className="rh-btn rh-btn-primary" type="submit" disabled={submittingReport}>
                {submittingReport ? 'Mengirim…' : 'Kirim laporan'}
              </button>
            </div>
          </form>
        </div>
        {reports.length > 0 && (
          <div className="rh-card-footer">
            <strong><ClipboardList size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Status laporan</strong>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              {reports.map(report => (
                <div key={report.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', borderBottom: '1px solid var(--rh-border)', padding: '0.5rem 0' }}>
                  <span>{report.title} · {report.bookings?.booking_code || 'Umum'}</span>
                  <span><strong>{REPORT_STATUS_LABELS[report.status] || report.status}</strong>{report.response_note ? ` · ${report.response_note}` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>}
    </section>
  )
}
