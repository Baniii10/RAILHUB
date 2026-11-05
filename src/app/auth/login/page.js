'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'
import MobileTrainIllustration from '@/components/auth/MobileTrainIllustration'
import { getDashboardForProfile, getOperationalRole, isSafeNextPath, normalizeProfile } from '@/lib/auth/roles'

function GoogleIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  )
}

const DEMO_ACCOUNTS = [
  {
    role: 'passenger',
    title: 'Penumpang',
    badge: 'Pemesanan & E-Tiket',
    email: 'penumpang.demo@railhub.id',
    password: 'DemoPassenger2026!',
    icon: '👤',
    category: 'user',
  },
  {
    role: 'admin',
    title: 'Administrator',
    badge: 'Master Jadwal & Rekap',
    email: 'admin.operasional@railhub.id',
    password: 'DemoAdmin2026!',
    icon: '🛡️',
    category: 'admin',
  },
  {
    role: 'conductor',
    title: 'Petugas KA Argo Bromo',
    badge: 'KA 1 (GMR - SBI)',
    trainName: 'Argo Bromo Anggrek',
    email: 'petugas.argobromo@railhub.id',
    password: 'DemoStaff2026!',
    icon: '🚆',
    category: 'staff',
  },
  {
    role: 'conductor',
    title: 'Petugas KA Taksaka',
    badge: 'KA 68 (GMR - YK)',
    trainName: 'Taksaka',
    email: 'petugas.taksaka@railhub.id',
    password: 'DemoStaff2026!',
    icon: '🚆',
    category: 'staff',
  },
  {
    role: 'conductor',
    title: 'Petugas KA Argo Parahyangan',
    badge: 'KA 34 (GMR - BD)',
    trainName: 'Argo Parahyangan',
    email: 'petugas.parahyangan@railhub.id',
    password: 'DemoStaff2026!',
    icon: '🚆',
    category: 'staff',
  },
  {
    role: 'conductor',
    title: 'Petugas KA Argo Wilis',
    badge: 'KA 6 (BD - SGU)',
    trainName: 'Argo Wilis',
    email: 'petugas.argowilis@railhub.id',
    password: 'DemoStaff2026!',
    icon: '🚆',
    category: 'staff',
  },
  {
    role: 'conductor',
    title: 'Petugas KA Turangga',
    badge: 'KA 66 (BD - SGU)',
    trainName: 'Turangga',
    email: 'petugas.turangga@railhub.id',
    password: 'DemoStaff2026!',
    icon: '🚆',
    category: 'staff',
  },
]

export default function LoginPage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPw,        setShowPw]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,         setError]         = useState(() => '')

  const { user: currentUser, profile: currentProfile, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !currentUser) return
    const requestedNext = new URLSearchParams(window.location.search).get('next')
    const role = getOperationalRole(currentProfile, currentUser.email)
    const destination = isSafeNextPath(requestedNext, role) ? requestedNext : getDashboardForProfile(currentProfile, currentUser.email)
    router.replace(destination)
  }, [authLoading, currentUser, currentProfile, router])

  async function handleGoogleAuth() {
    setError('')
    setGoogleLoading(true)
    try {
      const requestedNext = new URLSearchParams(window.location.search).get('next')
      const safeNext = isSafeNextPath(requestedNext) ? requestedNext : '/dashboard/passenger'

      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        setGoogleLoading(false)
      }
    } catch (err) {
      setError(err?.message || 'Gagal memulai autentikasi Google.')
      setGoogleLoading(false)
    }
  }

  async function signInWithCredentials(loginEmail, loginPassword, successMessage) {
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (authError) {
      const msg = authError.message?.toLowerCase() || ''
      const code = authError.code || ''

      if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        setError('Email belum aktif. Di dashboard Supabase (Authentication > Providers > Email), matikan opsi "Confirm email" agar login langsung aktif.')
      } else if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
        setError('Email atau kata sandi salah. Silakan periksa kembali huruf besar/kecil kata sandi Anda.')
      } else {
        setError(authError.message || t.auth.loginError)
      }
      setLoading(false)
      return
    }

    let profileResult = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', data.user.id)
      .maybeSingle()

    const rawProfile = profileResult?.data || { id: data.user.id, email: data.user.email }
    const role = getOperationalRole(rawProfile, data.user.email)
    const profile = normalizeProfile(rawProfile, data.user.email)

    toast.success(successMessage)
    setLoading(false)

    const requestedNext = new URLSearchParams(window.location.search).get('next')
    const destination = isSafeNextPath(requestedNext, role) ? requestedNext : getDashboardForProfile(profile, data.user.email)
    router.replace(destination)
    router.refresh()
  }

  async function handleQuickLogin(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    })

    if (authError) {
      const msg = authError.message?.toLowerCase() || ''
      const isNotFound = authError.code === 'invalid_credentials' || msg.includes('invalid') || msg.includes('not found')

      if (isNotFound) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              full_name: account.title,
              role: account.role,
            },
          },
        })

        if (!signUpError && (signUpData?.session || signUpData?.user)) {
          toast.success(`Login berhasil sebagai ${account.title}!`)
          setLoading(false)
          const destination = account.role === 'admin' ? '/dashboard/admin' : account.role === 'passenger' ? '/dashboard/passenger' : '/dashboard/staff'
          router.replace(destination)
          router.refresh()
          return
        }
      }

      setError(authError.message || t.auth.loginError)
      setLoading(false)
      return
    }

    let profileResult = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', data.user.id)
      .maybeSingle()

    const rawProfile = profileResult?.data || { id: data.user.id, email: data.user.email }
    const role = getOperationalRole(rawProfile, data.user.email)
    const profile = normalizeProfile(rawProfile, data.user.email)

    toast.success(`Login berhasil sebagai ${account.title}!`)
    setLoading(false)

    const requestedNext = new URLSearchParams(window.location.search).get('next')
    const destination = isSafeNextPath(requestedNext, role) ? requestedNext : getDashboardForProfile(profile, data.user.email)
    router.replace(destination)
    router.refresh()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await signInWithCredentials(email.trim().toLowerCase(), password, t.auth.loginSuccess)
  }

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Standard RAILHUB Navbar with Brand & Language Toggle */}
      <Navbar />

      <div className="rh-login-viewport" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="rh-login-container">
          {/* Top Header Vector Illustration */}
          <MobileTrainIllustration />

          {/* Bottom Form Sheet */}
          <div className="rh-login-sheet">
            <div style={{ marginBottom: '1.25rem' }}>
              <h1
                style={{
                  fontSize: '1.4375rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.25,
                  margin: '0 0 6px',
                }}
              >
                Welcome to Access!
              </h1>
              <p
                style={{
                  fontSize: '0.84375rem',
                  color: '#64748b',
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                Login or Register now! to enjoy all the features available on Access by RAILHUB.
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: 12,
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  marginBottom: '1rem',
                  color: '#b91c1c',
                  fontSize: '0.84375rem',
                  lineHeight: 1.4,
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
                <div>{error}</div>
              </div>
            )}



            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: 5,
                  }}
                >
                  Email Address / Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    spellCheck={false}
                    placeholder="Enter your Email Address / Phone Number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      height: 48,
                      paddingLeft: 42,
                      paddingRight: 14,
                      borderRadius: 12,
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label
                    htmlFor="password"
                    style={{
                      fontSize: '0.78125rem',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/register"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      textDecoration: 'none',
                    }}
                  >
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      height: 48,
                      paddingLeft: 42,
                      paddingRight: 44,
                      borderRadius: 12,
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  marginTop: 6,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      border: '2.5px solid rgba(255, 255, 255, 0.35)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.75s linear infinite',
                    }}
                  />
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </form>

            <p
              style={{
                textAlign: 'center',
                fontSize: '0.84375rem',
                color: '#64748b',
                margin: '16px 0 14px',
              }}
            >
              Don&apos;t have an Access account yet?{' '}
              <Link
                href="/auth/register"
                style={{
                  color: '#2563eb',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Register Now
              </Link>
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '10px 0 14px',
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.78125rem', color: '#94a3b8', fontWeight: 500 }}>
                Or use account
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading || googleLoading}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              {googleLoading ? (
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(37, 99, 235, 0.2)',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite',
                  }}
                />
              ) : (
                <GoogleIcon size={19} />
              )}
              <span>Sign in with Google</span>
            </button>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
                  Akses Cepat Pengujian UAS
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 999 }}>
                  1-Click Login
                </span>
              </div>

              {/* Akun Pengguna Utama: Penumpang & Admin */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {DEMO_ACCOUNTS.filter(a => a.category !== 'staff').map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={loading || googleLoading}
                    onClick={() => handleQuickLogin(account)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 12,
                      border: '1.5px solid #e2e8f0',
                      background: account.role === 'admin' ? '#faf5ff' : '#f0fdf4',
                      color: '#0f172a',
                      textAlign: 'left',
                      cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                      <span style={{ fontSize: '1.1rem' }}>{account.icon}</span>
                      <strong style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{account.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>{account.badge}</span>
                  </button>
                ))}
              </div>

              {/* 5 Akun Petugas Kereta (1 Petugas per 1 Kereta) */}
              <div style={{ marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Petugas Kereta (1 Akun per Kereta)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '0.4rem', maxHeight: 220, overflowY: 'auto', paddingRight: 2 }}>
                {DEMO_ACCOUNTS.filter(a => a.category === 'staff').map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={loading || googleLoading}
                    onClick={() => handleQuickLogin(account)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 10,
                      border: '1px solid #fed7aa',
                      background: '#fff7ed',
                      color: '#0f172a',
                      textAlign: 'left',
                      cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem' }}>{account.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412' }}>{account.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#7c2d12' }}>{account.badge}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: 6 }}>
                      Masuk →
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .rh-login-viewport {
          width: 100%;
          background: #ffffff;
          display: flex;
          justify-content: center;
          margin: 0;
          padding: 0;
        }
        .rh-login-container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          position: relative;
        }
        .rh-login-sheet {
          background-color: #ffffff;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          margin-top: -24px;
          position: relative;
          z-index: 10;
          padding: 24px 22px calc(24px + env(safe-area-inset-bottom, 20px));
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 641px) {
          .rh-login-viewport {
            background: linear-gradient(135deg, #0b1120 0%, #171738 50%, #231244 100%);
            padding: 2rem 1rem;
            align-items: center;
          }
          .rh-login-container {
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </div>
  )
}
