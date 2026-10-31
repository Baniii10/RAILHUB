'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ClipboardList, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatIDR } from '@/lib/utils/formatters'

const REPORT_CATEGORIES = [
  ['assistance', 'Permintaan bantuan'],
  ['lost_found', 'Barang hilang/temuan'],
  ['complaint', 'Keluhan perjalanan'],
  ['other', 'Lainnya'],
]

export default function PassengerServices({ userId }) {
  const [bookings, setBookings] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [reports, setReports] = useState([])
  const [bookingId, setBookingId] = useState('')
  const [passengerId, setPassengerId] = useState('')
  const [quantities, setQuantities] = useState({})
  const [category, setCategory] = useState('assistance')
  const [reportTitle, setReportTitle] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittingFood, setSubmittingFood] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadServices() {
      const [bookingResult, productResult, reportResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, booking_code, status, schedule_id, booking_seats(passenger_id, seat_id, passengers(id, full_name), seats(seat_number))')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .order('created_at', { ascending: false }),
        supabase
          .from('food_products')
          .select('id, name, description, price, food_categories(name)')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('passenger_reports')
          .select('id, category, title, status, response_note, created_at, bookings(booking_code)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (!active) return
      const failure = bookingResult.error || productResult.error || reportResult.error
      if (failure) {
        setError(`Layanan perjalanan tidak dapat dimuat: ${failure.message}`)
        setLoading(false)
        return
      }

      const paidBookings = bookingResult.data || []
      setBookings(paidBookings)
      setProducts(productResult.data || [])
      setReports(reportResult.data || [])
      setBookingId(current => current || paidBookings[0]?.id || '')
      setPassengerId(current => current || paidBookings[0]?.booking_seats?.[0]?.passenger_id || '')

      if (paidBookings.length > 0) {
        const { data: orderRows, error: orderError } = await supabase
          .from('food_orders')
          .select('id, order_code, booking_id, status, total_amount, created_at, food_order_items(quantity, unit_price, food_products(name))')
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
  }, [userId])

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

  async function submitFoodOrder(event) {
    event.preventDefault()
    if (!selectedBooking || !selectedPassengerSeat || selectedItems.length === 0 || submittingFood) {
      toast.error('Pilih perjalanan, penumpang, dan minimal satu menu.')
      return
    }

    setSubmittingFood(true)
    const supabase = createClient()
    const { error: orderError } = await supabase.rpc('create_passenger_food_order', {
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

    toast.success('Pesanan dikirim ke petugas perjalanan.')
    setQuantities({})
    setNote('')
    const { data, error: reloadError } = await createClient()
      .from('food_orders')
      .select('id, order_code, booking_id, status, total_amount, created_at, food_order_items(quantity, unit_price, food_products(name))')
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
      <h2 className="rh-h3">Layanan perjalanan</h2>
      {error && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)' }}>{error}</div>}
      {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem' }}>Memuat menu dan laporan...</div>}

      <article className="rh-card">
        <div className="rh-card-header">
          <h3 className="rh-h4"><Utensils size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Pesan makanan di kereta</h3>
          <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Pesanan terhubung ke kursi dan diterima petugas perjalanan.</p>
        </div>
        <div className="rh-card-body">
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--rh-text-2)' }}>Layanan makanan tersedia untuk booking yang sudah dibayar.</p>
          ) : (
            <form onSubmit={submitFoodOrder} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
                <label className="rh-input-group">
                  <span className="rh-label-text">Perjalanan</span>
                  <select className="rh-input" value={bookingId} onChange={event => {
                    const selected = bookings.find(booking => booking.id === event.target.value)
                    setBookingId(event.target.value)
                    setPassengerId(selected?.booking_seats?.[0]?.passenger_id || '')
                  }}>
                    {bookings.map(booking => <option key={booking.id} value={booking.id}>{booking.booking_code}</option>)}
                  </select>
                </label>
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
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {products.map(product => (
                  <label key={product.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', borderBottom: '1px solid var(--rh-border)', padding: '0.65rem 0' }}>
                    <span style={{ flex: 1 }}>
                      <strong>{product.name}</strong>
                      <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>{product.food_categories?.name} · {product.description}</small>
                    </span>
                    <strong>{formatIDR(product.price)}</strong>
                    <input
                      aria-label={`Jumlah ${product.name}`}
                      type="number"
                      min="0"
                      max="10"
                      value={quantities[product.id] || 0}
                      onChange={event => setQuantities(current => ({
                        ...current,
                        [product.id]: Math.max(0, Math.min(10, Number(event.target.value) || 0)),
                      }))}
                      className="rh-input"
                      style={{ width: 82 }}
                    />
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <strong>Total simulasi: {formatIDR(total)}</strong>
                <button className="rh-btn rh-btn-primary" type="submit" disabled={submittingFood || products.length === 0}>
                  {submittingFood ? 'Mengirim...' : 'Kirim pesanan'}
                </button>
              </div>
            </form>
          )}
        </div>
        {orders.length > 0 && (
          <div className="rh-card-footer">
            <strong>Pesanan terakhir</strong>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <span>{order.order_code} · {order.food_order_items?.map(item => `${item.food_products?.name} ×${item.quantity}`).join(', ')}</span>
                  <strong>{order.status} · {formatIDR(order.total_amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      <article className="rh-card">
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
                {submittingReport ? 'Mengirim...' : 'Kirim laporan'}
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
                  <span><strong>{report.status}</strong>{report.response_note ? ` · ${report.response_note}` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  )
}
