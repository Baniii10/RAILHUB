'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Banknote, ClipboardList, CreditCard, Minus, Plus, Smartphone, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
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
import { formatIDR } from '@/lib/utils/formatters'

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

  const selectedBooking = bookings.find(booking => booking.id === bookingId)
  const selectedPassengerSeat = selectedBooking?.booking_seats?.find(
    item => item.passenger_id === passengerId
  )
  const selectedItems = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => ({ product_id: productId, quantity }))
  const total = selectedItems.reduce((sum, item) => {
    const product = products.find(candidate => candidate.id === item.product_id)
    return sum + Number(product?.price || 0) * item.quantity
  }, 0)

  function continueToFoodPayment(event) {
    event.preventDefault()
    if (!selectedBooking || !selectedPassengerSeat || selectedItems.length === 0 || submittingFood) {
      toast.error('Pilih perjalanan, penumpang, dan minimal satu menu.')
      return
    }
    setFoodCheckoutStep('payment')
  }

  async function submitFoodOrder() {
    if (!selectedBooking || !selectedPassengerSeat || selectedItems.length === 0 || submittingFood) {
      toast.error('Periksa kembali penumpang dan menu yang dipilih.')
      return
    }
    setSubmittingFood(true)
    const { error: orderError } = await createClient().rpc('create_passenger_food_order', {
      p_booking_id: bookingId,
      p_passenger_id: passengerId,
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
    toast.success(`Pembayaran simulasi ${selectedMethod?.label || ''} berhasil. Pesanan dikirim ke petugas.`)
    setQuantities({})
    setNote('')
    setFoodMenuOpen(false)
    setFoodCheckoutStep('menu')
    setFoodPaymentMethod('qris')
    const { data, error: reloadError } = await createClient()
      .from('food_orders')
      .select('id, order_code, booking_id, status, payment_method, total_amount, created_at, food_order_items(quantity, unit_price, food_products(name))')
      .eq('booking_id', bookingId)
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
    <section id="journey-services" style={{ display: 'grid', gap: '1.25rem', marginTop: '2rem', scrollMarginTop: 96 }}>
      <h2 className="rh-h3">Layanan tiket</h2>
      {error && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)' }}>{error}</div>}
      {statusError && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)' }}>{statusError}</div>}
      {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem' }}>Memuat menu dan laporan…</div>}

      <article className="rh-card passenger-food-card">
        <div className="rh-card-header passenger-food-header">
          <div>
            <h3 className="rh-h4"><Utensils size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Pesan makanan dan minuman</h3>
            <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Pilih menu, atur jumlah, lalu pesan untuk perjalanan ini.</p>
          </div>
          {bookings.length > 0 && (
            <button
              className="rh-btn rh-btn-primary"
              type="button"
              onClick={() => setFoodMenuOpen(open => !open)}
              aria-expanded={foodMenuOpen}
            >
              <Utensils size={16} />
              {foodMenuOpen ? 'Tutup menu' : 'Pesan makanan'}
            </button>
          )}
        </div>
        {foodMenuOpen && <div className="rh-card-body">
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--rh-text-2)' }}>Pemesanan menu tersedia untuk tiket yang sudah dibayar dan perjalanan yang masih aktif.</p>
          ) : foodCheckoutStep === 'payment' ? (
            <section aria-labelledby="food-payment-title" className="passenger-food-checkout">
              <button
                type="button"
                className="rh-btn rh-btn-ghost rh-btn-sm"
                onClick={() => setFoodCheckoutStep('menu')}
                style={{ justifySelf: 'start' }}
              >
                <ArrowLeft size={15} /> Kembali ke menu
              </button>
              <div>
                <span className="passenger-section-kicker">LANGKAH 2 · PEMBAYARAN</span>
                <h4 id="food-payment-title" className="rh-h4" style={{ marginTop: '.25rem' }}>Pilih metode pembayaran</h4>
                <p style={{ color: 'var(--rh-text-2)', marginTop: '.25rem' }}>
                  Pembayaran ini simulasi untuk pemesanan menu; tidak ada uang sungguhan yang diproses.
                </p>
              </div>
              <div className="passenger-food-payment-methods" role="radiogroup" aria-label="Metode pembayaran">
                {/* QRIS */}
                <button
                  type="button"
                  className={`passenger-food-payment-method ${foodPaymentMethod === 'qris' ? 'is-selected' : ''}`}
                  role="radio"
                  aria-checked={foodPaymentMethod === 'qris'}
                  onClick={() => setFoodPaymentMethod('qris')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
                >
                  <div style={{ padding: '4px 6px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <QrisLogo height={24} />
                  </div>
                  <span style={{ flex: 1, display: 'grid', gap: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>QRIS (Standar Pembayaran Nasional)</strong>
                    <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem' }}>Scan instan via m-Banking & E-Wallet</small>
                  </span>
                  <span className="passenger-food-payment-radio" />
                </button>

                {/* E-Wallet */}
                <button
                  type="button"
                  className={`passenger-food-payment-method ${foodPaymentMethod === 'e_wallet' ? 'is-selected' : ''}`}
                  role="radio"
                  aria-checked={foodPaymentMethod === 'e_wallet'}
                  onClick={() => setFoodPaymentMethod('e_wallet')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
                >
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                    <GopayLogo height={16} />
                    <OvoLogo height={16} />
                    <DanaLogo height={16} />
                  </div>
                  <span style={{ flex: 1, display: 'grid', gap: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>E-Wallet</strong>
                    <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem' }}>GoPay, OVO, DANA, ShopeePay</small>
                  </span>
                  <span className="passenger-food-payment-radio" />
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  className={`passenger-food-payment-method ${foodPaymentMethod === 'bank_transfer' ? 'is-selected' : ''}`}
                  role="radio"
                  aria-checked={foodPaymentMethod === 'bank_transfer'}
                  onClick={() => setFoodPaymentMethod('bank_transfer')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
                >
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                    <BcaLogo height={16} />
                    <MandiriLogo height={16} />
                    <BniLogo height={16} />
                  </div>
                  <span style={{ flex: 1, display: 'grid', gap: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Virtual Account Bank</strong>
                    <small style={{ color: 'var(--rh-text-2)', fontSize: '0.78rem' }}>BCA, Mandiri, BNI, BRI</small>
                  </span>
                  <span className="passenger-food-payment-radio" />
                </button>
              </div>
              <div className="passenger-food-payment-summary">
                <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)} item menu</span>
                <strong>Total {formatIDR(total)}</strong>
              </div>
              <button
                className="rh-btn rh-btn-primary"
                type="button"
                onClick={submitFoodOrder}
                disabled={submittingFood}
              >
                {submittingFood ? 'Memproses simulasi…' : `Bayar ${formatIDR(total)}`}
              </button>
              <small style={{ color: 'var(--rh-text-2)' }}>
                Ini pembayaran simulasi untuk demo. Tidak ada uang sungguhan yang diproses.
              </small>
            </section>
          ) : (
            <form onSubmit={continueToFoodPayment} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
                {!initialBookingId && <label className="rh-input-group">
                  <span className="rh-label-text">Perjalanan</span>
                  <select className="rh-input" value={bookingId} onChange={event => {
                    const selected = bookings.find(booking => booking.id === event.target.value)
                    setBookingId(event.target.value)
                    setPassengerId(selected?.booking_seats?.[0]?.passenger_id || '')
                  }}>
                    {bookings.map(booking => <option key={booking.id} value={booking.id}>{booking.booking_code}</option>)}
                  </select>
                </label>}
                <label className="rh-input-group">
                  <span className="rh-label-text">Penumpang dan kursi</span>
                  <select className="rh-input" value={passengerId} onChange={event => setPassengerId(event.target.value)} required>
                    {(selectedBooking?.booking_seats || []).map(item => (
                      <option key={item.passenger_id} value={item.passenger_id}>
                        {item.passengers?.full_name} · Kursi {item.seats?.seat_number}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="rh-input-group">
                  <span className="rh-label-text">Catatan pengantaran</span>
                  <input className="rh-input" maxLength={300} placeholder="Contoh: tanpa sedotan" value={note} onChange={event => setNote(event.target.value)} />
                </label>
              </div>
              {products.length === 0 && <p style={{ color: 'var(--rh-text-2)' }}>Belum ada menu makanan yang aktif.</p>}
              <div className="passenger-food-menu">
                {products.map(product => (
                  <article key={product.id} className="passenger-food-item">
                    <span className="passenger-food-item-icon"><Utensils size={18} /></span>
                    <span className="passenger-food-item-details">
                      <small>{product.food_categories?.name}</small>
                      <strong>{product.name}</strong>
                      <span>{product.description}</span>
                    </span>
                    <strong className="passenger-food-price">{formatIDR(product.price)}</strong>
                    <div className="passenger-food-quantity" aria-label={`Jumlah ${product.name}`}>
                      {(quantities[product.id] || 0) > 0 && (
                        <button
                          className="passenger-food-quantity-button"
                          type="button"
                          aria-label={`Kurangi ${product.name}`}
                          onClick={() => setQuantities(current => ({
                            ...current,
                            [product.id]: Math.max(0, (current[product.id] || 0) - 1),
                          }))}
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      {(quantities[product.id] || 0) > 0 && (
                        <span className="passenger-food-quantity-count" aria-live="polite">
                          {quantities[product.id]}
                        </span>
                      )}
                      <button
                        className="passenger-food-quantity-button passenger-food-quantity-add"
                        type="button"
                        aria-label={(quantities[product.id] || 0) > 0 ? `Tambah ${product.name}` : `Pilih ${product.name}`}
                        disabled={(quantities[product.id] || 0) >= 10}
                        onClick={() => setQuantities(current => ({
                          ...current,
                          [product.id]: Math.min(10, (current[product.id] || 0) + 1),
                        }))}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <strong>Total: {formatIDR(total)}</strong>
                <button className="rh-btn rh-btn-primary" type="submit" disabled={submittingFood || products.length === 0}>
                  Lanjut ke pembayaran
                </button>
              </div>
            </form>
          )}
        </div>}
        {orders.length > 0 && (
          <div className="rh-card-footer">
            <strong>Pesanan terakhir</strong>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <span>{order.order_code} · {order.food_order_items?.map(item => `${item.food_products?.name} ×${item.quantity}`).join(', ')}</span>
                  <strong>{ORDER_STATUS_LABELS[order.status] || order.status} · {order.payment_method?.replace('_', ' ') || 'simulasi'} · {formatIDR(order.total_amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

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
