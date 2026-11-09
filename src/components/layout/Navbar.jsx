'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Train,
  Menu,
  X,
  Globe,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Bell,
  Home,
  Ticket,
  Compass,
  Utensils,
  TicketCheck,
  ClipboardList,
  Clock3,
  MapPin,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const publicNavLinks = (t) => [
  { href: '/', label: t.nav.home },
  { href: '/trains', label: t.nav.book },
  { href: '/about', label: t.nav.about },
  { href: '/faq', label: t.nav.faq },
  { href: '/contact', label: t.nav.contact },
]

export default function Navbar() {
  const { t, lang, toggleLang } = useLang()
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const dashboardRole = profile?.staff_type === 'gate' ? 'gate' : profile?.role
    || (pathname.startsWith('/dashboard/admin') ? 'admin' : pathname.startsWith('/dashboard/staff') ? 'conductor' : null)
  const roleLabels = lang === 'en'
    ? { admin: 'Admin', conductor: 'Staff', gate: 'Gate Staff', passenger: 'Passenger' }
    : { admin: 'Admin', conductor: 'Petugas', gate: 'Petugas Gerbang', passenger: 'Penumpang' }
  const roleLabel = roleLabels[dashboardRole] || (lang === 'en' ? 'User' : 'Pengguna')
  const profileName = profile?.full_name?.trim()
  const accountName = profileName && profileName.toLowerCase() !== 'penumpang'
    ? profileName.split(' ')[0]
    : roleLabel

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeJourney, setActiveJourney] = useState(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    let active = true
    async function loadNotifications() {
      const items = []
      if (!user) {
        setActiveJourney(null)
        if (active) {
          setNotifications([])
          setUnreadCount(0)
        }
        return
      }

      const supabase = createClient()
      if (['conductor', 'gate'].includes(dashboardRole)) {
        setActiveJourney(null)
        const { data: assigns } = await supabase
          .from('staff_assignments')
          .select('id, schedule_id, schedules(status, departure_time, trains(name, train_number), routes(name))')
          .eq('staff_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        for (const a of assigns || []) {
          items.push({
            id: `assign-${a.id}`,
            title: `Tugas: ${a.schedules?.trains?.name || 'Kereta'} (${a.schedules?.trains?.train_number || ''})`,
            desc: `${a.schedules?.routes?.name || 'Rute'} · Status: ${a.schedules?.status || 'scheduled'}`,
            href: '/dashboard/staff',
            time: 'Penugasan Aktif',
          })
        }
      } else if (dashboardRole === 'admin') {
        setActiveJourney(null)
        items.push(
          {
            id: 'admin-ops',
            title: 'Pantau Jadwal & Penugasan Petugas',
            desc: 'Periksa perjalanan 7 hari ke depan dan tugaskan kondektur.',
            href: '/dashboard/admin/staff',
            time: 'Operasional',
          },
          {
            id: 'admin-orders',
            title: 'Layanan Makanan & Laporan Penumpang',
            desc: 'Tinjau pesanan restorasi dan laporan bantuan aktif.',
            href: '/dashboard/orders',
            time: 'Layanan',
          }
        )
      } else {
        const { data: bks } = await supabase
          .from('bookings')
          .select('id, booking_code, status, schedules(departure_time, arrival_time, trains(name, train_number), routes(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4)
        if (active) setActiveJourney((bks || []).find(booking => booking.status === 'paid' && booking.schedules) || null)
        for (const b of bks || []) {
          items.push({
            id: `bk-${b.id}`,
            title: `Booking ${b.booking_code} (${b.status === 'paid' ? 'Terbayar' : b.status === 'pending' ? 'Menunggu Pembayaran' : b.status})`,
            desc: `${b.schedules?.trains?.name || 'Kereta'} · ${b.schedules?.routes?.name || ''}`,
            href: `/booking/payment/${b.id}`,
            time: b.status === 'paid' ? 'Tiket Aktif' : 'Perlu Tindakan',
          })
        }
      }

      if (items.length === 0) {
        items.push({
          id: 'welcome-notif',
          title: 'Selamat datang di RAILHUB',
          desc: 'Cari jadwal kereta dan pilih kursi perjalanan Anda.',
          href: '/trains',
          time: 'Aktif',
        })
      }

      let dismissed = []
      if (typeof window !== 'undefined') {
        try {
          dismissed = JSON.parse(localStorage.getItem('rh_dismissed_notifs') || '[]')
        } catch {}
      }
      const filteredItems = items.filter(it => !dismissed.includes(it.id))

      if (active) {
        setNotifications(filteredItems)
        setUnreadCount(filteredItems.length)
      }
    }
    loadNotifications()
    return () => { active = false }
  }, [user, dashboardRole])

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Berhasil keluar!')
      setMobileOpen(false)
      window.location.replace('/auth/login')
    } catch (error) {
      toast.error(`Tidak dapat keluar: ${error.message}`)
    }
  }

  function getDashboardHref() {
    if (dashboardRole === 'admin') return '/dashboard/admin'
    if (dashboardRole === 'conductor' || dashboardRole === 'gate') return '/dashboard/staff'
    return '/dashboard/passenger'
  }

  const dashboardNavLinks = dashboardRole === 'admin'
    ? [
      { href: '/dashboard/admin', label: 'Ringkasan' },
      { href: '/dashboard/admin?tab=journeys', label: 'Perjalanan mendatang' },
      { href: '/dashboard/admin?tab=staff', label: 'Pengelolaan petugas' },
    ]
    : dashboardRole === 'gate'
      ? [
        { href: '/dashboard/staff?tab=overview', label: 'Ringkasan gate' },
        { href: '/dashboard/staff?tab=validation', label: 'Validasi tiket' },
      ]
      : dashboardRole === 'conductor'
        ? [
          { href: '/dashboard/staff?tab=overview', label: 'Perjalanan tugas' },
          { href: '/dashboard/staff?tab=validation', label: 'Validasi tiket' },
          { href: '/dashboard/staff?tab=services', label: 'Layanan penumpang' },
        ]
        : null
  const isStaffArea = Boolean(dashboardNavLinks)
  const navLinks = isStaffArea ? (dashboardNavLinks || []) : publicNavLinks(t)
  const homeHref = isStaffArea ? getDashboardHref() : '/'

  const mobileBottomItems = dashboardRole === 'admin'
    ? [
      { href: '/dashboard/admin', label: lang === 'en' ? 'Summary' : 'Ringkasan', icon: LayoutDashboard },
      { href: '/dashboard/admin?tab=journeys', label: lang === 'en' ? 'Schedule' : 'Jadwal', icon: Train },
      { href: '/dashboard/admin?tab=staff', label: lang === 'en' ? 'Staff' : 'Petugas', icon: User },
      { href: '/dashboard/orders', label: lang === 'en' ? 'Services' : 'Layanan', icon: Utensils },
    ]
    : dashboardRole === 'gate'
      ? [
        { href: '/dashboard/staff?tab=overview', label: lang === 'en' ? 'Summary' : 'Ringkasan', icon: LayoutDashboard },
        { href: '/dashboard/staff?tab=validation', label: lang === 'en' ? 'Validate' : 'Validasi', icon: TicketCheck },
      ]
      : dashboardRole === 'conductor'
        ? [
          { href: '/dashboard/staff?tab=overview', label: lang === 'en' ? 'Duties' : 'Tugas', icon: Train },
          { href: '/dashboard/staff?tab=validation', label: lang === 'en' ? 'Validate' : 'Validasi', icon: TicketCheck },
          { href: '/dashboard/staff?tab=passengers', label: lang === 'en' ? 'Passengers' : 'Penumpang', icon: User },
          { href: '/dashboard/staff?tab=services', label: lang === 'en' ? 'Services' : 'Layanan', icon: Utensils },
        ]
        : user
          ? [
            { href: '/', label: t.nav.home, icon: Home },
            { href: '/trains', label: lang === 'en' ? 'Schedule' : 'Jadwal', icon: Train },
            { href: '/dashboard/passenger?tab=overview', label: lang === 'en' ? 'Tickets' : 'Tiket', icon: Ticket },
            { href: '/dashboard/passenger?tab=account', label: lang === 'en' ? 'Account' : 'Akun', icon: User },
          ]
          : [
            { href: '/', label: t.nav.home, icon: Home },
            { href: '/trains', label: lang === 'en' ? 'Schedule' : 'Jadwal', icon: Train },
            { href: '/auth/login', label: lang === 'en' ? 'Account' : 'Akun', icon: User },
          ]

  const currentTab = searchParams.get('tab')
  const activeStates = mobileBottomItems.map(({ href }) => {
    const [baseHref, query = ''] = href.split('?')
    const expectedTab = new URLSearchParams(query).get('tab')
    const isPassengerJourney = expectedTab === 'overview'
      && (!currentTab || ['overview', 'tickets', 'services'].includes(currentTab))
    return pathname === baseHref
      && (expectedTab ? currentTab === expectedTab || isPassengerJourney : !currentTab || !baseHref.startsWith('/dashboard/'))
  })
  const activeIndex = activeStates.findIndex(Boolean)

  const isBookingFlow = pathname.startsWith('/booking/')
  const journeyRoute = activeJourney?.schedules?.routes?.name || 'Perjalanan aktif'
  const journeyTime = activeJourney?.schedules?.departure_time
    ? new Intl.DateTimeFormat(lang === 'en' ? 'en-ID' : 'id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(activeJourney.schedules.departure_time))
    : null

  return (
    <>
      <header className={`rh-navbar ${scrolled ? 'rh-navbar-scrolled' : ''}`}>
        <div className="rh-container">
          <div className="rh-navbar-inner">
            {/* Logo */}
            <Link href={homeHref} className="rh-logo" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              <Image
                src="/images/Fix logo railhub.png"
                alt="RAILHUB"
                width={950}
                height={275}
                unoptimized
                priority
                style={{
                  height: 'clamp(24px, 2.5vw, 29px)',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="rh-hide-mobile" style={{ flex: 1, marginLeft: '1rem' }}>
              <ul className="rh-nav-links">
                {navLinks.map(link => {
                  const [linkPath, linkQuery = ''] = link.href.split('?')
                  const linkTab = new URLSearchParams(linkQuery).get('tab')
                  const linkActive = pathname === linkPath && (!linkTab || searchParams.get('tab') === linkTab)
                  return <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => { setMobileOpen(false); setUserMenuOpen(false); setNotifOpen(false) }}
                      className={`rh-nav-link ${linkActive ? 'rh-nav-link-active' : ''}`}
                      aria-current={linkActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                })}
              </ul>
            </nav>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Lang Toggle */}
              <button
                onClick={toggleLang}
                className="rh-btn rh-btn-ghost rh-btn-sm"
                style={{ padding: '0.375rem 0.625rem', gap: '0.35rem' }}
                aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              >
                <Globe size={14} />
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  {lang === 'id' ? 'EN' : 'ID'}
                </span>
              </button>

              {/* Notification Bell */}
              {user && <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(v => !v)
                    setUserMenuOpen(false)
                    setUnreadCount(0)
                  }}
                  className="rh-btn rh-btn-ghost rh-btn-sm"
                  style={{ position: 'relative', padding: '0.4rem 0.55rem' }}
                  aria-label={t.dashboard.notifications}
                  aria-expanded={notifOpen}
                  aria-controls="railhub-notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--rh-accent)',
                    }} />
                  )}
                </button>

                {notifOpen && (
                  <div
                    id="railhub-notifications"
                    className="rh-card animate-scale-in"
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      width: 'min(330px, calc(100vw - 1.5rem))', zIndex: 'var(--z-dropdown)', padding: '0.75rem',
                      boxShadow: '0 8px 30px rgba(15, 23, 42, 0.16)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--rh-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong style={{ fontSize: '0.875rem' }}>{t.dashboard.notifications}</strong>
                        {notifications.length > 0 && (
                          <span className="rh-badge rh-badge-primary" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{notifications.length}</span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const allIds = notifications.map(n => n.id)
                            setNotifications([])
                            setUnreadCount(0)
                            try {
                              const saved = JSON.parse(localStorage.getItem('rh_dismissed_notifs') || '[]')
                              localStorage.setItem('rh_dismissed_notifs', JSON.stringify([...new Set([...saved, ...allIds])]))
                            } catch {}
                            toast.success('Semua notifikasi dibersihkan.')
                          }}
                          style={{
                            background: 'none', border: 'none', color: 'var(--rh-danger)',
                            fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: '2px 4px',
                          }}
                        >
                          Hapus Semua
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gap: '0.45rem', maxHeight: 290, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--rh-text-2)', fontSize: '0.8rem' }}>
                          <Bell size={22} style={{ opacity: 0.35, marginBottom: '0.35rem', display: 'block', margin: '0 auto 0.35rem' }} />
                          Tidak ada notifikasi
                        </div>
                      ) : (
                        notifications.map(item => (
                          <div
                            key={item.id}
                            style={{
                              position: 'relative',
                              padding: '0.6rem 0.75rem',
                              borderRadius: 10,
                              background: 'var(--rh-surface)',
                              border: '1px solid var(--rh-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                            }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setNotifOpen(false)}
                              style={{
                                flex: 1, minWidth: 0, textDecoration: 'none', color: 'var(--rh-text)',
                              }}
                            >
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rh-charcoal)', lineHeight: 1.3 }}>
                                {item.title}
                              </div>
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--rh-text-2)', lineHeight: 1.3 }}>{item.desc}</p>
                              <small style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--rh-primary)', marginTop: 4 }}>
                                <Clock3 size={11} /> {item.time}
                              </small>
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setNotifications(prev => prev.filter(n => n.id !== item.id))
                                setUnreadCount(prev => Math.max(0, prev - 1))
                                try {
                                  const saved = JSON.parse(localStorage.getItem('rh_dismissed_notifs') || '[]')
                                  localStorage.setItem('rh_dismissed_notifs', JSON.stringify([...new Set([...saved, item.id])]))
                                } catch {}
                                toast.success('Notifikasi dihapus.')
                              }}
                              title="Hapus notifikasi"
                              aria-label="Hapus notifikasi"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--rh-text-3)',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: -2,
                                transition: 'color 0.15s ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--rh-danger)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--rh-text-3)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>}

              <div className="rh-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user ? (
                  /* User Menu */
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false) }}
                      className="rh-btn rh-btn-ghost rh-btn-sm"
                      style={{ gap: '0.5rem' }}
                      aria-expanded={userMenuOpen}
                      aria-controls="railhub-user-menu"
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--rh-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {accountName[0]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {accountName}
                      </span>
                      <ChevronDown size={14} />
                    </button>

                    {userMenuOpen && (
                      <div
                        id="railhub-user-menu"
                        className="rh-card animate-scale-in"
                        style={{
                          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                          minWidth: 200, zIndex: 'var(--z-dropdown)', padding: '0.5rem'
                        }}
                      >
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--rh-border)', marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rh-text)' }}>
                            {profileName && profileName.toLowerCase() !== 'penumpang' ? profileName : roleLabel}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)' }}>
                            {profile?.email}
                          </div>
                          <span className={`rh-badge rh-badge-primary`} style={{ marginTop: '0.25rem', fontSize: '0.6875rem' }}>
                            {roleLabel}
                          </span>
                        </div>
                        <Link
                          href={getDashboardHref()}
                          onClick={() => setUserMenuOpen(false)}
                          className="rh-sidebar-item"
                          style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem', borderRadius: 8 }}
                        >
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="rh-sidebar-item"
                          style={{ color: 'var(--rh-danger)', fontSize: '0.875rem', borderRadius: 8, width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <LogOut size={15} /> {t.nav.logout}
                        </button>
                      </div>
                    )}
                  </div>
                ) : isStaffArea ? (
                  <span className="rh-badge rh-badge-primary">{roleLabel}</span>
                ) : (
                  <>
                    <Link href="/auth/login" className="rh-btn rh-btn-ghost rh-btn-sm">
                      {t.nav.login}
                    </Link>
                    <Link href="/auth/register" className="rh-btn rh-btn-primary rh-btn-sm">
                      {t.nav.register}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="rh-show-mobile-only rh-btn rh-btn-ghost rh-btn-icon"
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={mobileOpen}
                aria-controls="railhub-mobile-menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="rh-show-mobile-only"
          style={{
            position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            id="railhub-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu utama"
            className="animate-slide-right"
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: 'min(300px, 85vw)', background: 'var(--rh-white)',
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <Link href={homeHref} className="rh-logo" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
              <Image
                src="/images/Fix logo railhub.png"
                alt="RAILHUB"
                width={950}
                height={275}
                unoptimized
                style={{
                  height: '28px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Link>

            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rh-nav-link ${pathname === link.href ? 'rh-nav-link-active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--rh-border)', marginTop: '0.5rem', paddingTop: '1rem' }}>
              <button
                onClick={toggleLang}
                className="rh-btn rh-btn-ghost rh-btn-sm"
                style={{ marginBottom: '0.5rem' }}
              >
                <Globe size={14} />
                {lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              </button>

              {user ? (
                <>
                  <Link href={getDashboardHref()} onClick={() => setMobileOpen(false)} className="rh-btn rh-btn-primary rh-btn-full" style={{ marginBottom: '0.5rem' }}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="rh-btn rh-btn-ghost rh-btn-full" style={{ color: 'var(--rh-danger)' }}>
                    <LogOut size={14} /> {t.nav.logout}
                  </button>
                </>
              ) : isStaffArea ? (
                <span className="rh-badge rh-badge-primary">{roleLabel}</span>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="rh-btn rh-btn-ghost rh-btn-full" style={{ marginBottom: '0.5rem' }}>
                    {t.nav.login}
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="rh-btn rh-btn-primary rh-btn-full">
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeJourney && dashboardRole === 'passenger' && !isBookingFlow && !pathname.startsWith('/dashboard/passenger') && (
        <Link
          href="/dashboard/passenger?tab=overview#trip-status"
          className="rh-journey-dock rh-show-mobile-only"
          aria-label={`Buka perjalanan ${journeyRoute}`}
        >
          <span className="rh-journey-dock-icon"><Train size={19} aria-hidden="true" /></span>
          <span className="rh-journey-dock-copy">
            <small>Perjalanan Kita{journeyTime ? ` · ${journeyTime}` : ''}</small>
            <strong>{activeJourney.schedules?.trains?.name || 'Kereta Anda'}</strong>
            <span><MapPin size={11} aria-hidden="true" /> {journeyRoute}</span>
          </span>
          <span className="rh-journey-mini-map" aria-hidden="true">
            <i /><i className="is-train"><Train size={12} /></i><i />
          </span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      )}

      {/* Mobile Bottom App Navigation Bar (Ultra-Symmetrical Animated Sliding Pill) */}
      {!isBookingFlow && (
        <nav
          aria-label="Navigasi bawah mobile"
          className="rh-show-mobile-only rh-mobile-bottom-nav"
        >
          <div
            className="rh-mobile-bottom-nav-inner"
            style={{
              '--nav-item-count': mobileBottomItems.length,
              '--active-index': activeIndex >= 0 ? activeIndex : 0,
            }}
          >
            {/* Symmetrical Sliding Capsule Background */}
            <div
              className="rh-mobile-bottom-nav-slider"
              style={{ opacity: activeIndex >= 0 ? 1 : 0 }}
              aria-hidden="true"
            >
              <div className="rh-mobile-bottom-nav-pill" />
            </div>

            {/* Nav Items (Symmetric Grid Columns) */}
            {mobileBottomItems.map(({ href, label, icon: Icon }, idx) => {
              const active = activeStates[idx]
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`rh-mobile-bottom-nav-item ${active ? 'is-active' : ''}`}
                  title={label}
                >
                  <Icon size={19} className="rh-nav-icon" aria-hidden="true" />
                  <span className="rh-nav-label">
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}
