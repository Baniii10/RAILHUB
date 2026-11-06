'use client'

import { useState } from 'react'
import { Utensils, Plus, Minus, ShoppingBag, Check, Flame, Sparkles, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatIDR } from '@/lib/utils/formatters'

export const CULINARY_ITEMS = [
  {
    id: 'culinary-nasgor',
    name: 'Nasi Goreng Parahyangan Legend',
    category: 'Makanan',
    categoryLabel: 'Makanan Berat',
    price: 35000,
    rating: '4.9 (1.8rb+ ulasan)',
    badge: 'Ikonik Kereta Api',
    badgeColor: '#b45309',
    prepTime: '10-15 Menit',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    description: 'Nasi goreng harum khas resto kereta legendaris, disajikan dengan telur ceplok setengah matang, ayam suwir gurih, dan kerupuk udang renyah.',
  },
  {
    id: 'culinary-sei-sapi',
    name: 'Nasi Sei Sapi Sambal Matah',
    category: 'Makanan',
    categoryLabel: 'Makanan Berat',
    price: 45000,
    rating: '4.9 (950+ ulasan)',
    badge: 'Chef Recommendation',
    badgeColor: '#dc2626',
    prepTime: '12 Menit',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    description: 'Irisan daging sapi asap beraroma kayu kosambi empuk juicy, dipadu sambal matah Bali segar pedas gurih dan kuah kaldu hangat.',
  },
  {
    id: 'culinary-cuanki',
    name: 'Cuanki Kuah Hangat Kereta',
    category: 'Makanan',
    categoryLabel: 'Makanan Berat',
    price: 25000,
    rating: '4.8 (2.4rb+ ulasan)',
    badge: 'Favorit Saat Malam',
    badgeColor: '#0284c7',
    prepTime: '5 Menit',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    description: 'Semangkuk cuanki khas Bandung berisi bakso halus, tahu bakso kenyal, dan siomay kering dengan kuah kaldu sapi bening beraroma daun seledri.',
  },
  {
    id: 'culinary-rawon',
    name: 'Rawon Daging Surabaya Gubeng',
    category: 'Makanan',
    categoryLabel: 'Makanan Berat',
    price: 42000,
    rating: '4.8 (820+ ulasan)',
    badge: 'Khas Jawa Timur',
    badgeColor: '#1e3a8a',
    prepTime: '10 Menit',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    description: 'Kuah hitam kluwek khas Jawa Timur yang gurih meresap dengan potongan daging sapi empuk, tauge pendek segar, telur asin, dan sambal.',
  },
  {
    id: 'culinary-kopi',
    name: 'Es Kopi Susu Gula Aren RailHub',
    category: 'Minuman',
    categoryLabel: 'Minuman Segar',
    price: 18000,
    rating: '4.9 (3.1rb+ ulasan)',
    badge: 'Barista Onboard',
    badgeColor: '#78350f',
    prepTime: '3 Menit',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    description: 'Double espresso blend Arabika & Robusta nusantara dengan susu segar creamy dan sirup gula aren organik asli.',
  },
  {
    id: 'culinary-roti',
    name: 'Roti Bakar Cokelat Keju Loko',
    category: 'Camilan',
    categoryLabel: 'Camilan Hangat',
    price: 20000,
    rating: '4.7 (1.2rb+ ulasan)',
    badge: 'Camilan Teman Jalan',
    badgeColor: '#059669',
    prepTime: '8 Menit',
    image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
    description: 'Roti tawar tebal panggang renyah di luar lembut di dalam, bertabur lelehan meses cokelat belgia dan parutan keju cheddar melimpah.',
  },
]

export default function OnboardCulinaryShowcase({ onOrderSelected, compact = false }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [cart, setCart] = useState({})
  const [imgErrors, setImgErrors] = useState({})

  const categories = ['Semua', 'Makanan', 'Minuman', 'Camilan']

  const filteredItems = selectedCategory === 'Semua'
    ? CULINARY_ITEMS
    : CULINARY_ITEMS.filter(item => item.category === selectedCategory)

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = CULINARY_ITEMS.find(i => i.id === id)
    return sum + (item ? item.price * qty : 0)
  }, 0)

  function updateQty(id, delta) {
    setCart(prev => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      if (next === 0) {
        const copy = { ...prev }
        delete copy[id]
        return copy
      }
      return { ...prev, [id]: next }
    })
  }

  function handleCheckout() {
    if (totalItems === 0) {
      toast.error('Pilih minimal 1 menu makanan terlebih dahulu.')
      return
    }
    toast.success(`Berhasil menambahkan ${totalItems} menu (${formatIDR(totalPrice)}) ke pesanan perjalanan!`, {
      duration: 3500,
    })
    if (onOrderSelected) {
      onOrderSelected(cart)
    }
  }

  return (
    <section className="rh-culinary-section" style={{ marginTop: compact ? '1rem' : '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: 'rgba(26, 66, 138, 0.08)', color: 'var(--rh-primary)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <Utensils size={13} />
            <span>Kuliner Onboard Khas Kereta Api</span>
          </div>
          <h2 className="rh-h3" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: 'clamp(1.2rem, 3vw, 1.55rem)' }}>
            Menu Pilihan & Makanan Hangat di Perjalanan
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
            Bisa dipesan online dan langsung diantar hangat ke nomor kursi Anda oleh pramugari kereta.
          </p>
        </div>

        {/* Floating Mini Cart Pill */}
        {totalItems > 0 && (
          <button
            type="button"
            onClick={handleCheckout}
            className="rh-btn rh-btn-primary animate-bounce-short"
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
            }}
          >
            <ShoppingBag size={16} />
            <span>{totalItems} Menu · {formatIDR(totalPrice)}</span>
            <span style={{ background: '#ffffff', color: '#1d4ed8', padding: '1px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800 }}>
              Pesan
            </span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rh-btn rh-btn-sm ${selectedCategory === cat ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
            style={{
              borderRadius: 999,
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 650,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '1.25rem',
      }}>
        {filteredItems.map(item => {
          const qty = cart[item.id] || 0
          const hasError = imgErrors[item.id]

          return (
            <article
              key={item.id}
              className="rh-card rh-culinary-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                borderRadius: 18,
                border: '1px solid var(--rh-border)',
                background: '#ffffff',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Photo Hero */}
              <div style={{ position: 'relative', width: '100%', height: 185, background: '#0f172a', overflow: 'hidden' }}>
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
                      transition: 'transform 0.4s ease',
                    }}
                    className="rh-food-img"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: '#ffffff',
                  }}>
                    <Utensils size={36} style={{ opacity: 0.5 }} />
                  </div>
                )}

                {/* Gradient Scrim */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, transparent 40%, rgba(15, 23, 42, 0.75) 100%)',
                  pointerEvents: 'none',
                }} />

                {/* Top Badge */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: item.badgeColor,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                }}>
                  {item.badge}
                </div>

                {/* Price Tag */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 6,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(6px)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  {formatIDR(item.price)}
                </div>

                {/* Prep time */}
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
                }}>
                  <Clock size={12} />
                  <span>Siap dalam {item.prepTime}</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <small style={{ color: 'var(--rh-primary)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    {item.categoryLabel}
                  </small>
                  <h3 style={{ margin: '0.15rem 0 0.35rem', fontSize: '1rem', fontWeight: 800, color: 'var(--rh-navy)', lineHeight: 1.3 }}>
                    {item.name}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--rh-text-2)', fontSize: '0.8rem', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                </div>

                {/* Card Action Row */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <small style={{ color: 'var(--rh-text-3)', fontSize: '0.72rem' }}>Harga Porsi</small>
                    <strong style={{ color: 'var(--rh-navy)', fontSize: '0.95rem' }}>{formatIDR(item.price)}</strong>
                  </div>

                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="rh-btn rh-btn-sm"
                      style={{
                        background: '#eff6ff',
                        color: 'var(--rh-primary)',
                        border: '1px solid #bfdbfe',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Plus size={14} />
                      <span>Tambah</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '2px 4px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: 'var(--rh-navy)' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: 'var(--rh-primary)',
                          border: 'none',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

