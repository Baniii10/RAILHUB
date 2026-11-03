'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Train, Menu, X, Globe, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const publicNavLinks = (t) => [
  { href: '/',         label: t.nav.home },
  { href: '/trains',   label: t.nav.book },
  { href: '/about',    label: t.nav.about },
  { href: '/faq',      label: t.nav.faq },
  { href: '/contact',  label: t.nav.contact },
]

export default function Navbar() {
  const { t, lang, toggleLang } = useLang()
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()
  const dashboardRole = profile?.role
    || (pathname.startsWith('/dashboard/admin') ? 'admin' : pathname.startsWith('/dashboard/staff') ? 'conductor' : null)
  const roleLabels = { admin: 'Admin', conductor: 'Petugas', passenger: 'Penumpang' }
  const roleLabel = roleLabels[dashboardRole] || 'Pengguna'
  const profileName = profile?.full_name?.trim()
  const accountName = profileName && profileName.toLowerCase() !== 'penumpang'
    ? profileName.split(' ')[0]
    : roleLabel

  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Berhasil keluar!')
      router.push('/')
    } catch (error) {
      toast.error(`Tidak dapat keluar: ${error.message}`)
    }
  }

  function getDashboardHref() {
    if (dashboardRole === 'admin') return '/dashboard/admin'
    if (dashboardRole === 'conductor') return '/dashboard/staff'
    return '/dashboard/passenger'
  }

  const dashboardNavLinks = dashboardRole === 'admin'
    ? [
      { href: '/dashboard/admin', label: 'Ringkasan' },
      { href: '/dashboard/admin/journeys', label: 'Perjalanan mendatang' },
      { href: '/dashboard/admin/staff', label: 'Pengelolaan petugas' },
      { href: '/dashboard/orders', label: 'Pesanan makanan' },
      { href: '/dashboard/reports', label: 'Laporan' },
    ]
    : dashboardRole === 'conductor'
      ? [
          { href: '/dashboard/staff#staff-journeys', label: 'Perjalanan tugas' },
          { href: '/dashboard/staff#ticket-validation', label: 'Validasi tiket' },
          { href: '/dashboard/orders', label: 'Pesanan makanan' },
          { href: '/dashboard/reports', label: 'Laporan' },
        ]
      : null
  const isStaffArea = Boolean(dashboardNavLinks)
  const navLinks = isStaffArea ? (dashboardNavLinks || []) : publicNavLinks(t)
  const homeHref = isStaffArea ? getDashboardHref() : '/'

  return (
    <>
      <header className={`rh-navbar ${scrolled ? 'rh-navbar-scrolled' : ''}`}>
        <div className="rh-container">
          <div className="rh-navbar-inner">
            {/* Logo */}
            <Link href={homeHref} className="rh-logo" style={{ gap: '0.625rem' }}>
              <div className="rh-logo-mark">
                <Train size={18} strokeWidth={2.5} />
              </div>
              <span>RAILHUB</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="rh-hide-mobile" style={{ flex: 1, marginLeft: '1rem' }}>
              <ul className="rh-nav-links">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => { setMobileOpen(false); setUserMenuOpen(false) }}
                      className={`rh-nav-link ${pathname === link.href ? 'rh-nav-link-active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="rh-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Lang Toggle */}
              <button
                onClick={toggleLang}
                className="rh-btn rh-btn-ghost rh-btn-sm"
                style={{ padding: '0.375rem 0.625rem', gap: '0.375rem' }}
                aria-label="Toggle language"
              >
                <Globe size={14} />
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  {lang === 'id' ? 'EN' : 'ID'}
                </span>
              </button>

              {user ? (
                /* User Menu */
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="rh-btn rh-btn-ghost rh-btn-sm"
                    style={{ gap: '0.5rem' }}
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
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
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
            className="animate-slide-right"
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: 280, background: 'var(--rh-white)',
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <Link href={homeHref} className="rh-logo" style={{ marginBottom: '1.5rem' }}>
              <div className="rh-logo-mark"><Train size={16} strokeWidth={2.5} /></div>
              <span>RAILHUB</span>
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
    </>
  )
}
