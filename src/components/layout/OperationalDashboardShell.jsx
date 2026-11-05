'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Train,
  TicketCheck,
  AlertCircle,
} from 'lucide-react'
import LiveRoleClock from '@/components/ui/LiveRoleClock'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'

export default function OperationalDashboardShell({
  role = 'admin', // 'admin' | 'staff' | 'conductor' | 'gate'
  roleBadge = 'Administrator Sistem',
  subtitle = 'Pusat Kendali & Operasional Jaringan Kereta Api',
  menuGroups = [],
  activeTab = 'overview',
  onSelectTab = () => {},
  loading = false,
  error = '',
  onRefresh = () => {},
  children,
}) {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { lang } = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Berhasil keluar dari akun!')
      router.replace('/auth/login')
    } catch (err) {
      toast.error(`Gagal keluar: ${err.message}`)
    }
  }

  const isStaff = role === 'staff' || role === 'conductor' || role === 'gate'
  const roleColor = isStaff ? '#059669' : '#1a428a'
  const roleBg = isStaff ? 'rgba(5, 150, 105, 0.08)' : 'rgba(26, 66, 138, 0.08)'

  // Find active item label for top bar breadcrumb
  let activeLabel = 'Dashboard'
  for (const group of menuGroups) {
    const found = group.items?.find((i) => i.id === activeTab)
    if (found) {
      activeLabel = found.label
      break
    }
  }

  // User initials
  const userName = profile?.full_name || (role === 'admin' ? 'Admin Operasional' : 'Petugas Staf')
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'RH'

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'var(--font-montserrat), sans-serif',
      }}
    >
      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup Menu"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(7, 22, 44, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* ── SIDEBAR (Desktop Fixed Sticky & Mobile Drawer) ── */}
      <aside
        style={{
          width: 270,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 50,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          // Mobile vs Desktop positioning
          position: sidebarOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
        className={sidebarOpen ? 'rh-sidebar-drawer-open' : 'rh-sidebar-responsive'}
      >
        {/* Top Sidebar Header (Logo + Role) */}
        <div>
          <div
            style={{
              padding: '1.25rem 1.25rem 1rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <Image
                src="/images/Fix logo railhub.png"
                alt="RAILHUB"
                width={950}
                height={275}
                unoptimized
                priority
                style={{
                  height: '27px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rh-sidebar-mobile-only"
              style={{
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                width: 32,
                height: 32,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Tutup sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role Status Banner in Sidebar */}
          <div style={{ padding: '0.85rem 1.25rem 0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.65rem',
                borderRadius: '8px',
                background: roleBg,
                color: roleColor,
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              {isStaff ? <Train size={14} /> : <ShieldCheck size={14} />}
              <span>{roleBadge}</span>
            </div>
          </div>

          {/* Scrollable Navigation Menu */}
          <nav
            style={{
              padding: '0.5rem 0.85rem',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 210px)',
            }}
          >
            {menuGroups.map((group, gIdx) => (
              <div key={group.groupLabel || gIdx} style={{ marginBottom: '1.15rem' }}>
                {group.groupLabel && (
                  <div
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {group.groupLabel}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '0.2rem' }}>
                  {group.items?.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id)
                          setSidebarOpen(false)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '0.65rem 0.8rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                          color: isActive ? '#1a428a' : '#475569',
                          fontWeight: isActive ? 700 : 550,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#f8fafc'
                            e.currentTarget.style.color = '#0f172a'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = '#475569'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                          <Icon
                            size={17}
                            style={{
                              color: isActive ? '#2563eb' : '#64748b',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        </div>

                        {/* Badge / Count */}
                        {item.badge != null && item.badge > 0 && (
                          <span
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '999px',
                              background: item.badgeColor || '#ea580c',
                              color: '#ffffff',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              lineHeight: 1,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar User Profile & Actions */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
          }}
        >
          {/* Quick link to Passenger Portal */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '0.65rem',
              background: '#f8fafc',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#0f172a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ExternalLink size={13} />
              Portal Penumpang
            </span>
            <ChevronRight size={13} />
          </Link>

          {/* User info card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1a428a 0%, #2563eb 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(26, 66, 138, 0.25)',
                }}
              >
                {userInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userName}
                </strong>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email || 'Akun Aktif'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleSignOut}
              title="Keluar"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#dc2626',
                width: 32,
                height: 32,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              aria-label="Keluar dari akun"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Operational Navigation Bar */}
        <header
          style={{
            minHeight: 58,
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem clamp(0.75rem, 2vw, 1.5rem)',
            gap: '0.65rem',
          }}
        >
          {/* Left: Mobile Hamburger & Active Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rh-sidebar-mobile-only"
              style={{
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                width: 38,
                height: 38,
                borderRadius: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Buka menu navigasi"
            >
              <Menu size={20} />
            </button>

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontWeight: 600 }}>{roleBadge}</span>
                <span>/</span>
                <span style={{ fontWeight: 700, color: '#1a428a' }}>{activeLabel}</span>
              </div>
              <h1
                style={{
                  fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeLabel}
              </h1>
            </div>
          </div>

          {/* Right: Live Clock & Quick Reload Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div className="rh-hide-mobile">
              <LiveRoleClock />
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rh-btn rh-btn-sm"
              style={{
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                color: '#1a428a',
                borderRadius: '10px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'rh-spin' : ''} />
              <span className="rh-hide-mobile">{lang === 'en' ? 'Reload' : 'Muat Ulang'}</span>
            </button>
          </div>
        </header>

        {/* ── MOBILE HORIZONTAL PILL SUB-BAR (SWIPEABLE TABS) ── */}
        <div className="rh-sidebar-mobile-tabs" aria-label="Menu Tab Navigasi">
          {menuGroups.flatMap(g => g.items || []).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`rh-mobile-tab-pill ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="rh-pill-badge">{item.badge}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              margin: '1rem clamp(0.75rem, 2vw, 1.5rem) 0',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.86rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Work Area Container */}
        <main
          style={{
            flex: 1,
            padding: 'clamp(0.85rem, 2vw, 1.5rem)',
            maxWidth: 1600,
            width: '100%',
            minWidth: 0,
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

