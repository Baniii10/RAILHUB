'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Smartphone, Monitor } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import toast from 'react-hot-toast'
import MobileTrainIllustration from '@/components/auth/MobileTrainIllustration'

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  )
}

export default function LoginPage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const supabase = createClient()

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPw,        setShowPw]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,         setError]         = useState('')
  const [frameMode,     setFrameMode]     = useState(true) // true = Phone Mockup Frame, false = expanded

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_callback_failed') {
      setError(
        lang === 'en'
          ? 'Google authentication failed. Please configure Google OAuth in your Supabase dashboard.'
          : 'Autentikasi Google gagal. Pastikan kredensial Google OAuth telah diaktifkan di dashboard Supabase.'
      )
    }
  }, [lang])

  async function handleGoogleAuth() {
    setError('')
    setGoogleLoading(true)
    try {
      const requestedNext = new URLSearchParams(window.location.search).get('next')
      const safeNext = requestedNext
        && !requestedNext.startsWith('//')
        && (requestedNext.startsWith('/booking/') || requestedNext.startsWith('/dashboard') || requestedNext.startsWith('/trains'))
        ? requestedNext
        : '/dashboard/passenger'

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

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
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

    // Fetch profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    toast.success(t.auth.loginSuccess)

    const requestedNext = new URLSearchParams(window.location.search).get('next')
    if (requestedNext
      && !requestedNext.startsWith('//')
      && (requestedNext.startsWith('/booking/') || requestedNext.startsWith('/dashboard'))) {
      router.push(requestedNext)
    } else if (profile?.role === 'admin')     router.push('/dashboard/admin')
    else if (profile?.role === 'conductor') router.push('/dashboard/staff')
    else router.push('/dashboard/passenger')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b1120 0%, #171738 45%, #231244 100%)',
        padding: '1.5rem 1rem',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient background glow elements */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />

      {/* View Mode Toggle Pill (Desktop Only) */}
      <div
        className="rh-desktop-toggle"
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 24,
          padding: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setFrameMode(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: frameMode ? '#2563eb' : 'transparent',
            color: frameMode ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          <Smartphone size={14} />
          <span>Mobile Device View</span>
        </button>

        <button
          type="button"
          onClick={() => setFrameMode(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: !frameMode ? '#2563eb' : 'transparent',
            color: !frameMode ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
          }}
        >
          <Monitor size={14} />
          <span>Expanded Card</span>
        </button>
      </div>

      {/* Main Container: Mobile Frame Mockup or Clean Responsive Card */}
      <div
        className={`rh-login-screen-wrapper ${frameMode ? 'is-phone-mockup' : 'is-expanded-card'}`}
        style={{
          width: '100%',
          maxWidth: frameMode ? 412 : 460,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Smartphone Outer Bezel (Active in phone mockup mode) */}
        <div
          style={{
            position: 'relative',
            backgroundColor: frameMode ? '#0a0d14' : 'transparent',
            borderRadius: frameMode ? 48 : 28,
            padding: frameMode ? '10px 10px 14px' : 0,
            boxShadow: frameMode
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 2.5px #2d3748, 0 0 0 4px #1a202c, 0 0 40px rgba(99, 102, 241, 0.2)'
              : '0 20px 50px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
          }}
        >
          {/* Smartphone Top Notch / Speaker Slit */}
          {frameMode && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 96,
                height: 18,
                backgroundColor: '#05070a',
                borderRadius: 14,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Speaker slit */}
              <div style={{ width: 42, height: 3.5, backgroundColor: '#1e293b', borderRadius: 2 }} />
              {/* Camera dot */}
              <div style={{ width: 6.5, height: 6.5, backgroundColor: '#0f172a', borderRadius: '50%', border: '1px solid #1e293b' }} />
            </div>
          )}

          {/* Smartphone Inner Screen Canvas */}
          <div
            style={{
              position: 'relative',
              borderRadius: frameMode ? 40 : 28,
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: frameMode ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
            }}
          >
            {/* 1. TOP HEADER: Animated Vector Train & Station Illustration with Language Selector */}
            <MobileTrainIllustration />

            {/* 2. BOTTOM CARD: Overlapping White Curved Sheet */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                marginTop: -26,
                position: 'relative',
                zIndex: 10,
                padding: '24px 22px 28px',
                boxShadow: '0 -10px 25px rgba(44, 12, 89, 0.12)',
              }}
            >
              {/* Title Header */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h1
                  style={{
                    fontSize: '1.4375rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.25,
                    marginBottom: 6,
                  }}
                >
                  {lang === 'en' ? 'Welcome to RAILHUB!' : 'Selamat Datang di RAILHUB!'}
                </h1>
                <p
                  style={{
                    fontSize: '0.84375rem',
                    color: '#64748b',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {lang === 'en'
                    ? 'Login or Register now! to enjoy all the features available on RAILHUB.'
                    : 'Masuk atau Daftar sekarang untuk menikmati seluruh kemudahan perjalanan di RAILHUB.'}
                </p>
              </div>

              {/* Error Alert Message */}
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
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
                    <div style={{ flex: 1 }}>{error}</div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Email Address / Phone Number Input */}
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
                    {lang === 'en' ? 'Email Address / Phone Number' : 'Alamat Email / Nomor HP'}
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
                      placeholder={lang === 'en' ? 'Enter your Email Address' : 'Masukkan Alamat Email Anda'}
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
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb'
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
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
                      {lang === 'en' ? 'Password' : 'Kata Sandi'}
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
                      {lang === 'en' ? 'Forgot?' : 'Lupa?'}
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
                      placeholder={lang === 'en' ? 'Enter your Password' : 'Masukkan Kata Sandi'}
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
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb'
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    <button
                      type="button"
                      aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
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
                        borderRadius: 8,
                      }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Primary Action Button (Matches KAI Access Royal Blue LOGIN Button) */}
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
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.45)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#2563eb'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)'
                    }
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
                    <span>{lang === 'en' ? 'LOGIN' : 'MASUK'}</span>
                  )}
                </button>
              </form>

              {/* Registration Link Callout */}
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '0.84375rem',
                  color: '#64748b',
                  margin: '16px 0 14px',
                }}
              >
                {lang === 'en' ? "Don't have an Access account yet? " : 'Belum punya akun RAILHUB? '}
                <Link
                  href="/auth/register"
                  style={{
                    color: '#2563eb',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {lang === 'en' ? 'Register Now' : 'Daftar Sekarang'}
                </Link>
              </p>

              {/* Divider: "Or use account" */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: '12px 0 14px',
                }}
              >
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '0.78125rem', color: '#94a3b8', fontWeight: 500 }}>
                  {lang === 'en' ? 'Or use account' : 'Atau gunakan akun'}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              </div>

              {/* Social Login Button: Sign in with Google */}
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
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  if (!loading && !googleLoading) {
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                    e.currentTarget.style.borderColor = '#94a3b8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && !googleLoading) {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }
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
                <span>{lang === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}</span>
              </button>

              {/* Bottom Subtle Passenger Hint */}
              <div
                style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  borderRadius: 10,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}
              >
                <Sparkles size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span>
                  {lang === 'en'
                    ? 'Passenger access is active automatically upon signing in.'
                    : 'Akses akun penumpang aktif otomatis setelah berhasil masuk.'}
                </span>
              </div>
            </div>

            {/* Smartphone Bottom Home Gesture Bar (in phone mockup mode) */}
            {frameMode && (
              <div
                style={{
                  width: '100%',
                  height: 22,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 110,
                    height: 4,
                    backgroundColor: '#cbd5e1',
                    borderRadius: 3,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Outer Back to Home link below frame */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', marginBottom: 0 }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              textDecoration: 'none',
              fontSize: '0.84375rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
          >
            ← {lang === 'en' ? 'Back to RailHub Home' : 'Kembali ke Beranda RailHub'}
          </Link>
        </p>
      </div>

      {/* Global CSS for Mobile Responsiveness & Animation */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .rh-desktop-toggle {
            display: none !important;
          }
          .rh-login-screen-wrapper.is-phone-mockup {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .rh-login-screen-wrapper.is-phone-mockup > div {
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background-color: transparent !important;
          }
          .rh-login-screen-wrapper.is-phone-mockup > div > div:last-child {
            border-radius: 0 !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
          }
        }
      `}</style>
    </div>
  )
}
