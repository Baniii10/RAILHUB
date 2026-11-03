'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['on_the_way', 'cancelled'],
  on_the_way: ['completed'],
}

const REPORT_TRANSITIONS = {
  pending: ['in_progress', 'resolved', 'rejected'],
  in_progress: ['resolved', 'rejected'],
}

const ORDER_STATUS_LABELS = {
  pending: 'Menunggu konfirmasi',
  confirmed: 'Dikonfirmasi',
  preparing: 'Sedang disiapkan',
  on_the_way: 'Dalam pengantaran',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const REPORT_STATUS_LABELS = {
  pending: 'Menunggu',
  in_progress: 'Sedang ditangani',
  resolved: 'Selesai',
  rejected: 'Ditolak',
}

export default function StaffServiceDesk({ scheduleIds, isAdmin = false, showOrders = true, showReports = true }) {
  const [orders, setOrders] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState('')
  const [reportNotes, setReportNotes] = useState({})

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadOperations() {
      if (isAdmin && new URLSearchParams(window.location.search).get('preview') === '1') {
        setOrders([])
        setReports([])
        setLoading(false)
        return
      }

      if (!isAdmin && scheduleIds.length === 0) {
        setOrders([])
        setReports([])
        setLoading(false)
        return
      }

      let orderQuery = showOrders
        ? supabase
          .from('food_orders')
          .select('id, order_code, schedule_id, status, total_amount, note, created_at, passengers(full_name), seats(seat_number), food_order_items(quantity, unit_price, food_products(name))')
          .order('created_at', { ascending: false })
          .limit(100)
        : Promise.resolve({ data: [], error: null })
      let reportQuery = showReports
        ? supabase
          .from('passenger_reports')
          .select('id, schedule_id, category, title, description, status, response_note, passenger_name, created_at, bookings(booking_code)')
          .order('created_at', { ascending: false })
          .limit(100)
        : Promise.resolve({ data: [], error: null })

      if (!isAdmin) {
        if (showOrders) orderQuery = orderQuery.in('schedule_id', scheduleIds)
        if (showReports) reportQuery = reportQuery.in('schedule_id', scheduleIds)
      }

      const [orderResult, reportResult] = await Promise.all([orderQuery, reportQuery])

      if (!active) return
      if ((showOrders && orderResult.error) || (showReports && reportResult.error)) {
        setError(`${showOrders ? (showReports ? 'Daftar layanan' : 'Daftar pesanan') : 'Daftar laporan'} tidak dapat dimuat: ${orderResult.error?.message || reportResult.error?.message}`)
      } else {
        setOrders(orderResult.data || [])
        setReports(reportResult.data || [])
        setError('')
      }
      setLoading(false)
    }

    loadOperations()
    const timer = window.setInterval(loadOperations, 20000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [scheduleIds, isAdmin, showOrders, showReports])

  async function updateOrder(order, status) {
    setProcessingId(order.id)
    const supabase = createClient()
    const { error: updateError } = await supabase.rpc('staff_update_food_order', {
      p_order_id: order.id,
      p_status: status,
    })
    setProcessingId('')
    if (updateError) {
      toast.error(`Status pesanan gagal diperbarui: ${updateError.message}`)
      return
    }
    toast.success('Status pesanan diperbarui.')
    setOrders(current => current.map(item => item.id === order.id ? { ...item, status } : item))
  }

  async function updateReport(report, status) {
    setProcessingId(report.id)
    const supabase = createClient()
    const { error: updateError } = await supabase.rpc('staff_update_passenger_report', {
      p_report_id: report.id,
      p_status: status,
      p_response_note: reportNotes[report.id] || '',
    })
    setProcessingId('')
    if (updateError) {
      toast.error(`Laporan gagal diperbarui: ${updateError.message}`)
      return
    }
    toast.success('Status laporan diperbarui.')
    setReports(current => current.map(item => item.id === report.id
      ? { ...item, status, response_note: reportNotes[report.id] || null }
      : item))
  }

  return (
    <section id="passenger-services" style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', scrollMarginTop: 96 }}>
      <h2 className="rh-h3">{showReports
        ? (showOrders ? (isAdmin ? 'Layanan penumpang' : 'Layanan penumpang pada perjalanan tugas') : 'Laporan bantuan dan barang hilang')
        : 'Pesanan makanan'}</h2>
      {error && <div role="alert" className="rh-card" style={{ padding: '1rem', color: 'var(--rh-danger)' }}>{error}</div>}
      {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem' }}>{showOrders && showReports ? 'Memuat pesanan dan laporan…' : showOrders ? 'Memuat pesanan…' : 'Memuat laporan…'}</div>}

      {showOrders && <article className="rh-card">
        <div className="rh-card-header">
          <h3 className="rh-h4"><Utensils size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Pesanan makanan</h3>
        </div>
        <div className="rh-card-body">
          {!loading && orders.length === 0 && <p style={{ color: 'var(--rh-text-2)' }}>{isAdmin ? 'Belum ada pesanan makanan.' : 'Belum ada pesanan untuk perjalanan yang ditugaskan.'}</p>}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {orders.map(order => {
              const nextStatuses = ORDER_TRANSITIONS[order.status] || []
              return (
                <article key={order.id} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <strong>{order.order_code} · {order.passengers?.full_name || 'Penumpang'}</strong>
                      <span style={{ display: 'block', color: 'var(--rh-text-2)' }}>
                        Kursi {order.seats?.seat_number} · {order.food_order_items?.map(item => `${item.food_products?.name} ×${item.quantity}`).join(', ')}
                      </span>
                      {order.note && <small>Catatan: {order.note}</small>}
                      <strong style={{ display: 'block', marginTop: '0.35rem' }}>{ORDER_STATUS_LABELS[order.status] || order.status} · Rp {Number(order.total_amount).toLocaleString('id-ID')}</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'start' }}>
                      {nextStatuses.map(status => (
                        <button key={status} className={`rh-btn ${status === 'cancelled' ? 'rh-btn-ghost' : 'rh-btn-primary'} rh-btn-sm`} type="button" disabled={processingId === order.id} onClick={() => updateOrder(order, status)}>
                          {processingId === order.id && <RefreshCw size={13} className="rh-spin" />}
                          {status === 'on_the_way' ? 'Dalam pengantaran' : status === 'confirmed' ? 'Konfirmasi' : status === 'preparing' ? 'Mulai siapkan' : status === 'completed' ? 'Selesai' : 'Batalkan'}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </article>}

      {showReports && <article className="rh-card">
        <div className="rh-card-header">
          <h3 className="rh-h4"><AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Laporan bantuan dan barang hilang</h3>
        </div>
        <div className="rh-card-body">
          {!loading && reports.length === 0 && <p style={{ color: 'var(--rh-text-2)' }}>{isAdmin ? 'Belum ada laporan penumpang.' : 'Belum ada laporan untuk perjalanan yang ditugaskan.'}</p>}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {reports.map(report => {
              const nextStatuses = REPORT_TRANSITIONS[report.status] || []
              return (
                <article key={report.id} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ flex: '1 1 270px' }}>
                      <strong>{report.title}</strong>
                      <small style={{ display: 'block', color: 'var(--rh-text-2)' }}>
                        {report.category.replace('_', ' ')} · {report.passenger_name || 'Penumpang'} · {report.bookings?.booking_code || 'tanpa booking'}
                      </small>
                      <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{report.description}</p>
                      <small>Status: {REPORT_STATUS_LABELS[report.status] || report.status}{report.response_note ? ` · Respons: ${report.response_note}` : ''}</small>
                    </div>
                    {nextStatuses.length > 0 && (
                      <div style={{ display: 'grid', gap: '0.5rem', minWidth: 220 }}>
                        <input className="rh-input" maxLength={1000} placeholder="Catatan respons (opsional)" value={reportNotes[report.id] ?? report.response_note ?? ''} onChange={event => setReportNotes(current => ({ ...current, [report.id]: event.target.value }))} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {nextStatuses.map(status => (
                            <button key={status} className="rh-btn rh-btn-primary rh-btn-sm" type="button" disabled={processingId === report.id} onClick={() => updateReport(report, status)}>
                              {processingId === report.id && <RefreshCw size={13} className="rh-spin" />}
                              {status === 'in_progress' ? 'Tindak lanjuti' : status === 'resolved' ? 'Selesaikan' : 'Tolak'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </article>}
    </section>
  )
}
