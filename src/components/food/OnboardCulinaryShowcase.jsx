'use client'

import { useState } from 'react'
import { Plus, Minus, X, ArrowRight } from 'lucide-react'
import {
  QrisLogo,
  GopayLogo,
  OvoLogo,
  DanaLogo,
} from '@/components/payment/PaymentLogos'

export const CULINARY_ITEMS = [
  {
    id: 'culinary-ayam-balap',
    sku: 'RH-MEAL-001',
    name: 'Nasi Ayam Balap Crispy',
    category: 'Makanan',
    price: 22000,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-indomie-geprek',
    sku: 'RH-MEAL-003',
    name: 'indomie ayam geprek',
    category: 'Makanan',
    price: 25000,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-ayam-bali',
    sku: 'RH-MEAL-001',
    name: 'Nasi Ayam Bali Crispy',
    category: 'Makanan',
    price: 22000,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-magelangan',
    sku: 'RH-MEAL-003',
    name: 'Magelangan/nasi ruwet',
    category: 'Makanan',
    price: 18550,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-nasgor-parahyangan',
    sku: 'RH-MEAL-003',
    name: 'Nasi Goreng Parahyangan',
    category: 'Makanan',
    price: 35000,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-rendang-padang',
    sku: 'RH-MEAL-002',
    name: 'Nasi Rendang Sapi Loko',
    category: 'Makanan',
    price: 42000,
    badge: 'Rekomendasi',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-kopi-aren',
    sku: 'RH-DRINK-002',
    name: 'Es Kopi Susu Gula Aren',
    category: 'Minuman',
    price: 18000,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-teh-hangat',
    sku: 'RH-DRINK-002',
    name: 'Teh Manis Hangat Melati',
    category: 'Minuman',
    price: 10000,
    badge: 'Favorit',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-air-mineral',
    sku: 'RH-DRINK-001',
    name: 'Air Mineral 600ml Dingin',
    category: 'Minuman',
    price: 8000,
    badge: null,
    image: 'https://images.unsplash.com/photo-1559839914-1b34645a3903?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'culinary-roti-bakar',
    sku: 'RH-SNACK-001',
    name: 'Roti Bakar Cokelat Keju',
    category: 'Camilan',
    price: 20000,
    badge: 'Camilan',
    image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=500&q=80',
  },
]

export default function OnboardCulinaryShowcase({
  dbProducts = [],
  quantities = {},
  onUpdateQuantity,
  bookings = [],
  bookingId,
  setBookingId,
  passengerId,
  setPassengerId,
  note = '',
  setNote,
  foodPaymentMethod = 'qris',
  setFoodPaymentMethod,
  onSubmitOrder,
  submittingFood = false,
  orders = [],
  orderStatusLabels = {},
}) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [imgErrors, setImgErrors] = useState({})

  const categories = ['Semua', 'Makanan', 'Minuman', 'Camilan']

  // Map database products to rich display items or use CULINARY_ITEMS
  const displayItems = CULINARY_ITEMS.map(item => {
    // If DB product has matching SKU or matching name substring, bind its DB UUID
    const matchedDb = dbProducts.find(
      db => db.sku === item.sku || db.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
    ) || dbProducts[0]

    return {
      ...item,
      dbId: matchedDb?.id || item.id,
    }
  })

  const filteredItems = selectedCategory === 'Semua'
    ? displayItems
    : displayItems.filter(item => item.category === selectedCategory)

  // Calculate cart total
  const totalItems = Object.values(quantities).reduce((sum, q) => sum + (q || 0), 0)
  const totalPrice = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = displayItems.find(i => i.id === id || i.dbId === id)
    return sum + (item ? item.price * qty : 0)
  }, 0)

  const selectedBooking = bookings.find(b => b.id === bookingId) || bookings[0]

  function formatSimpleNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* ── CATEGORY PILLS (MINIMALIST) ── */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        overflowX: 'auto',
        padding: '0.25rem 0 0.85rem',
        scrollbarWidth: 'none',
      }}>
        {categories.map(cat => {
          const active = selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                borderRadius: 999,
                padding: '0.35rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: active ? 700 : 500,
                border: active ? '1px solid #00a862' : '1px solid var(--rh-border)',
                background: active ? '#00a862' : 'var(--rh-surface, #ffffff)',
                color: active ? '#ffffff' : 'var(--rh-text-2, #64748b)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* ── 2-COLUMN GRAB-STYLE FOOD GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '1rem 0.85rem',
        paddingBottom: totalItems > 0 ? '5.5rem' : '1.5rem',
      }}>
        {filteredItems.map(item => {
          const itemKey = item.dbId || item.id
          const qty = quantities[itemKey] || 0
          const hasError = imgErrors[item.id]

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              {/* Food Image with Grab-style Action Button & Pill */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#0f172a',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}>
                {!hasError ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#1e293b',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                  }}>
                    {item.name}
                  </div>
                )}

                {/* Top-Right Add Button (+) or Quantity Badge (1) */}
                <button
                  type="button"
                  onClick={() => onUpdateQuantity && onUpdateQuantity(itemKey, 1)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: qty > 0 ? '#ffffff' : '#00a862',
                    color: qty > 0 ? '#111827' : '#ffffff',
                    border: qty > 0 ? '1.5px solid #e2e8f0' : 'none',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                    zIndex: 2,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    transition: 'transform 0.12s ease',
                  }}
                  title={qty > 0 ? `Sudah dipilih ${qty}` : `Tambah ${item.name}`}
                >
                  {qty > 0 ? qty : <Plus size={16} strokeWidth={2.5} />}
                </button>

                {/* Bottom Center "Terlaris" Badge */}
                {item.badge && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '3px 0',
                    background: '#e8f8f0',
                    color: '#00875a',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                  }}>
                    {item.badge}
                  </div>
                )}
              </div>

              {/* Title & Price (Minimal, Zero Fluff) */}
              <div>
                <h4 style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--rh-text-1, #1e293b)',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.3em',
                }}>
                  {item.name}
                </h4>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.15rem',
                }}>
                  <strong style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: 'var(--rh-text-1, #0f172a)',
                    letterSpacing: '-0.01em',
                  }}>
                    {formatSimpleNumber(item.price)}
                  </strong>

                  {/* If item in cart, provide quick minus button */}
                  {qty > 0 && (
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity && onUpdateQuantity(itemKey, -1)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: '#ef4444',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                      }}
                      title="Kurangi"
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── STICKY BOTTOM FLOATING BAR (GRAB STYLE) ── */}
      {totalItems > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          padding: '0 16px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <button
            type="button"
            onClick={() => setCheckoutModalOpen(true)}
            style={{
              pointerEvents: 'auto',
              width: '100%',
              maxWidth: 440,
              background: '#00a862',
              color: '#ffffff',
              borderRadius: 999,
              padding: '13px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 168, 98, 0.45)',
              fontSize: '0.92rem',
              fontWeight: 700,
              transition: 'transform 0.15s ease',
            }}
          >
            <span>Keranjang • {totalItems} Hidangan</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Rp{formatSimpleNumber(totalPrice)}</span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* ── CHECKOUT MODAL DRAWER (MINIMALIST & FAST) ── */}
      {checkoutModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '100%',
            maxWidth: 500,
            background: 'var(--rh-surface, #ffffff)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: '1.25rem 1.25rem 2rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.2s ease-out',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Pemesanan ke Kursi</h3>
                <small style={{ color: 'var(--rh-text-2, #64748b)' }}>Pramugari antar langsung ke nomor kursi</small>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Items List */}
            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--rh-border)', paddingBottom: '1rem' }}>
              {Object.entries(quantities).filter(([, q]) => q > 0).map(([id, qty]) => {
                const item = displayItems.find(i => i.id === id || i.dbId === id)
                if (!item) return null
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '0.88rem', display: 'block' }}>{item.name}</strong>
                      <small style={{ color: 'var(--rh-text-2)' }}>Rp{formatSimpleNumber(item.price)} × {qty}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(id, -1)}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(id, 1)}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Passenger & Seat Selector */}
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {bookings.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--rh-text-2)', marginBottom: 4 }}>
                    Pilih Penumpang & Kursi
                  </label>
                  <select
                    className="rh-input"
                    value={passengerId}
                    onChange={e => setPassengerId(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, padding: '0.6rem 0.75rem', fontSize: '0.88rem' }}
                  >
                    {(selectedBooking?.booking_seats || []).map(seatItem => (
                      <option key={seatItem.passenger_id} value={seatItem.passenger_id}>
                        {seatItem.passengers?.full_name} · Kursi {seatItem.seats?.seat_number}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Note */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--rh-text-2)', marginBottom: 4 }}>
                  Catatan Pengantaran (Opsional)
                </label>
                <input
                  type="text"
                  className="rh-input"
                  placeholder="Contoh: jangan terlalu pedas, tanpa sedotan"
                  value={note}
                  onChange={e => setNote && setNote(e.target.value)}
                  maxLength={150}
                  style={{ width: '100%', borderRadius: 10, padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--rh-text-2)', marginBottom: 6 }}>
                  Metode Pembayaran
                </label>
                <div style={{ display: 'grid', gap: '0.45rem' }}>
                  {/* QRIS */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    border: foodPaymentMethod === 'qris' ? '1.5px solid #00a862' : '1px solid var(--rh-border)',
                    background: foodPaymentMethod === 'qris' ? 'rgba(0, 168, 98, 0.05)' : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="foodPay"
                        value="qris"
                        checked={foodPaymentMethod === 'qris'}
                        onChange={() => setFoodPaymentMethod && setFoodPaymentMethod('qris')}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <QrisLogo height={20} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>QRIS (Scan Instan)</span>
                      </div>
                    </div>
                  </label>

                  {/* E-Wallet */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    border: foodPaymentMethod === 'e_wallet' ? '1.5px solid #00a862' : '1px solid var(--rh-border)',
                    background: foodPaymentMethod === 'e_wallet' ? 'rgba(0, 168, 98, 0.05)' : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="foodPay"
                        value="e_wallet"
                        checked={foodPaymentMethod === 'e_wallet'}
                        onChange={() => setFoodPaymentMethod && setFoodPaymentMethod('e_wallet')}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>E-Wallet:</span>
                        <GopayLogo height={14} />
                        <OvoLogo height={14} />
                        <DanaLogo height={14} />
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    border: foodPaymentMethod === 'bank_transfer' ? '1.5px solid #00a862' : '1px solid var(--rh-border)',
                    background: foodPaymentMethod === 'bank_transfer' ? 'rgba(0, 168, 98, 0.05)' : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="foodPay"
                        value="bank_transfer"
                        checked={foodPaymentMethod === 'bank_transfer'}
                        onChange={() => setFoodPaymentMethod && setFoodPaymentMethod('bank_transfer')}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Virtual Account (BCA, Mandiri, BNI)</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Total & Submit Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--rh-text-2)' }}>Total Pembayaran:</span>
              <strong style={{ fontSize: '1.15rem', color: '#00a862', fontWeight: 800 }}>
                Rp{formatSimpleNumber(totalPrice)}
              </strong>
            </div>

            <button
              type="button"
              disabled={submittingFood}
              onClick={async () => {
                if (onSubmitOrder) {
                  await onSubmitOrder()
                  setCheckoutModalOpen(false)
                }
              }}
              style={{
                width: '100%',
                background: '#00a862',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 168, 98, 0.35)',
              }}
            >
              {submittingFood ? 'Memproses Pesanan…' : `Konfirmasi & Bayar Rp${formatSimpleNumber(totalPrice)}`}
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT ORDERS ACCORDION (COMPACT) ── */}
      {orders.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '0.85rem 1rem',
          borderRadius: 14,
          background: 'var(--rh-surface, #ffffff)',
          border: '1px solid var(--rh-border)',
        }}>
          <strong style={{ fontSize: '0.82rem', color: 'var(--rh-text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pesanan Terakhir Anda
          </strong>
          <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.5rem' }}>
            {orders.slice(0, 3).map(order => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--rh-text-1)' }}>
                  {order.food_order_items?.map(it => `${it.food_products?.name || 'Menu'} ×${it.quantity}`).join(', ')}
                </span>
                <span style={{ fontWeight: 700, color: '#00a862' }}>
                  {orderStatusLabels[order.status] || order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
